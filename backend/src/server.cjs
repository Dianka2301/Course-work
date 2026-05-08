const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");
const OpenAI = require("openai");
const multer = require("multer");

const authRoutes = require("./auth.cjs");
const favoritesRoutes = require("./favorites.cjs");
const profileRoutes = require("./profile.cjs"); // 🔥 FIX: ДОДАНО

const db = require("./db.cjs");

//dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

//console.log("API KEY LOADED:", !!process.env.OPENAI_API_KEY);

const app = express();

/* ------------------ UPLOAD FOLDER ------------------ */
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* ------------------ CORS ------------------ */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

/* ------------------ BODY ------------------ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: "No token" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* ------------------ STATIC ------------------ */
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ------------------ OPENAI ------------------ */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ------------------ ROUTES ------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);

/* 🔥 PROFILE ROUTE FIX */
app.use("/api/profile", profileRoutes);

/* ------------------ HEALTH ------------------ */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ------------------ RECIPES ------------------ */
app.get("/api/recipes", (req, res) => {
  try {
    const recipes = db
      .prepare(
        `
        SELECT 
          r.*,
          ROUND(AVG(c.rating), 1) as rating,
          COUNT(c.rating) as rating_count
        FROM recipes r
        LEFT JOIN comments c ON r.id = c.recipe_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `,
      )
      .all();

    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка при отриманні рецептів" });
  }
});



/* ------------------ AI ------------------ */
app.post("/api/ai-recipe", async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients) {
      return res.status(400).json({ error: "Інгредієнти не вказані" });
    }

    const prompt = `
Створи рецепт використовуючи ці інгредієнти: ${ingredients}

Формат:
Назва:
...

Інгредієнти:
...

Приготування:
...
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const recipe = completion?.choices?.[0]?.message?.content;

    if (!recipe) throw new Error("AI не повернув рецепт");

    res.json({ recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/recipes/:id/comments", (req, res) => {
  try {
    const { id } = req.params;

    const comments = db
      .prepare(
        `
        SELECT 
          c.*,
          u.first_name,
          u.last_name
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.recipe_id = ?
        ORDER BY c.created_at DESC
      `,
      )
      .all(id);

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка отримання коментарів" });
  }
});

app.post("/api/recipes/:id/comments", (req, res) => {
  try {
    const { text, rating, userId } = req.body;
    const { id } = req.params;

    //const userId = req.session?.userId; // 🔥 ось тут

    if (!userId) {
      return res.status(401).json({ error: "Не авторизований" });
    }

    db.prepare(
      `INSERT INTO comments (user_id, recipe_id, text, rating)
       VALUES (?, ?, ?, ?)`,
    ).run(userId, id, text, rating);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Comment error" });
  }
});

/* ------------------ MY RECIPES ------------------ */
app.get("/api/my-recipes", authMiddleware, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const recipes = db
      .prepare(
        `
        SELECT *
        FROM recipes
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
      )
      .all(userId, limit, offset);

    const total = db
      .prepare(
        `
        SELECT COUNT(*) as count
        FROM recipes
        WHERE user_id = ?
      `,
      )
      .get(userId);

    res.json({
      data: recipes,
      total: total.count,
      page,
      limit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка при отриманні моїх рецептів" });
  }
});

/* ------------------ CREATE MY RECIPE ------------------ */
app.post("/api/my-recipes", authMiddleware, (req, res) => {
  try {
    const { title, ingredients, steps, is_private, image } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Не авторизований" });
    }

    if (!title) {
      return res.status(400).json({ error: "Назва обовʼязкова" });
    }

    const result = db
      .prepare(
        `
        INSERT INTO recipes (title, ingredients, steps, is_private, image, user_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `,
      )
      .run(title, ingredients, steps, is_private, image, userId);

    res.json({
      id: result.lastInsertRowid,
      title,
      ingredients,
      steps,
      is_private,
      image,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка створення рецепта" });
  }
});

app.put("/api/my-recipes/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { title, ingredients, steps, is_private, image } = req.body;

    db.prepare(
      `
      UPDATE recipes
      SET title = ?, ingredients = ?, steps = ?, is_private = ?, image = ?
      WHERE id = ?
    `,
    ).run(title, ingredients, steps, is_private, image, id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Помилка оновлення" });
  }
});

app.delete("/api/my-recipes/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;

    db.prepare("DELETE FROM recipes WHERE id = ?").run(id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Помилка видалення" });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file" });
  }

  res.json({
    url: `http://localhost:4000/uploads/${req.file.filename}`,
  });
});

/* ------------------ START ------------------ */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
