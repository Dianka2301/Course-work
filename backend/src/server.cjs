const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");
const OpenAI = require("openai");

const authRoutes = require("./auth.cjs");
const favoritesRoutes = require("./favorites.cjs");
const profileRoutes = require("./profile.cjs"); // 🔥 FIX: ДОДАНО

const db = require("./db.cjs");

dotenv.config({ path: path.join(__dirname, "../.env") });

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

/* ------------------ STATIC ------------------ */
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(uploadDir));

/* ------------------ OPENAI ------------------ */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ------------------ ROUTES ------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);

/* 🔥 PROFILE ROUTE FIX */
app.use("/api/auth/profile", profileRoutes);

/* ------------------ HEALTH ------------------ */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ------------------ RECIPES ------------------ */
app.get("/api/recipes", (req, res) => {
  try {
    const recipes = db
      .prepare("SELECT * FROM recipes ORDER BY created_at DESC")
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

/* ------------------ START ------------------ */
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
