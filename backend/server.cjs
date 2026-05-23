const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");
/*const OpenAI = require("openai");*/
const multer = require("multer");

const authRoutes = require("./auth.cjs");
const favoritesRoutes = require("./favorites.cjs");
const profileRoutes = require("./profile.cjs"); // 🔥 FIX: ДОДАНО
const { generateRecipesFromAI, analyzeRecipeWithAI } = require("./gemini.cjs");
const db = require("./db.cjs");

//dotenv.config({ path: path.join(__dirname, "../.env") });
//dotenv.config();
dotenv.config({ path: path.resolve(__dirname, ".env") });

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
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

function getUserIdFromRequest(req) {
  const bodyUserId = req.body?.userId;
  if (bodyUserId) return bodyUserId;

  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  try {
    const token = authHeader.replace("Bearer ", "");
    return jwt.verify(token, JWT_SECRET).id;
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  });
}

function mapRecipe(row) {
  if (!row) return row;

  return {
    ...row,
    is_private: row.is_public === 1 ? 0 : 1,
    authorName:
      [row.first_name, row.last_name].filter(Boolean).join(" ") ||
      "Автор рецепта",
    authorAvatar: row.avatar
      ? `http://localhost:4000/uploads/${row.avatar}`
      : null,
    bio: row.bio || "",
  };
}

/* ------------------ STATIC ------------------ */
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ------------------ OPENAI ------------------ */
/*const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});*/

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
/*app.get("/api/recipes", (req, res) => {
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
});*/
app.get("/api/recipes", (req, res) => {
  try {
    const { category = "all", sort = "new" } = req.query;

    let query = `
      SELECT 
        r.*,
        u.first_name,
        u.last_name,
        u.avatar,
        u.bio,
        ROUND(AVG(c.rating), 1) as rating,
        COUNT(c.rating) as rating_count
      FROM recipes r
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN comments c ON r.id = c.recipe_id
    `;

    const params = [];
    const filters = ["r.is_public = 1", "r.status = 'approved'"];

    if (category && category !== "all") {
      filters.push("r.category = ?");
      params.push(category);
    }

    query += ` WHERE ${filters.join(" AND ")} `;
    query += ` GROUP BY r.id `;

    if (sort === "rating") {
      query += ` ORDER BY rating DESC NULLS LAST `;
    } else {
      query += ` ORDER BY r.created_at DESC `;
    }

    const recipes = db.prepare(query).all(...params).map(mapRecipe);

    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка при отриманні рецептів" });
  }
});

app.get("/api/recipes/:id", (req, res) => {
  try {
    const { id } = req.params;

    const recipe = db
      .prepare(
        `
        SELECT 
          r.*,
          u.first_name,
          u.last_name,
          u.avatar,
          u.bio,
          ROUND(AVG(rt.rating), 1) as rating,
          COUNT(rt.rating) as rating_count
        FROM recipes r
        LEFT JOIN users u ON u.id = r.user_id
        LEFT JOIN ratings rt ON rt.recipe_id = r.id
        WHERE r.id = ?
        GROUP BY r.id
      `,
      )
      .get(id);

    if (!recipe) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    res.json(mapRecipe(recipe));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка отримання рецепта" });
  }
});

app.get("/api/recipes/:id/similar", (req, res) => {
  try {
    const { id } = req.params;
    const recipe = db.prepare("SELECT * FROM recipes WHERE id = ?").get(id);

    if (!recipe) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    const normalizeIngredient = (item) =>
      item
        .toLowerCase()
        .replace(/[0-9]+([.,][0-9]+)?/g, "")
        .replace(/\b(г|гр|кг|мл|л|шт|ч\.?\s*л\.?|ст\.?\s*л\.?|склянка|склянки|за смаком)\b/g, "")
        .trim();

    const sourceIngredients = new Set(
      (recipe.ingredients || "")
        .split(/[\n,.;]+/)
        .map(normalizeIngredient)
        .filter((item) => item.length > 2),
    );

    const candidates = db
      .prepare(
        `
        SELECT r.*, u.first_name, u.last_name, u.avatar, u.bio
        FROM recipes r
        LEFT JOIN users u ON u.id = r.user_id
        WHERE r.id != ?
          AND r.is_public = 1
          AND r.status = 'approved'
      `,
      )
      .all(id);

    const similar = candidates
      .map((candidate) => {
        const ingredients = (candidate.ingredients || "")
          .split(/[\n,.;]+/)
          .map(normalizeIngredient)
          .filter((item) => item.length > 2);

        const shared = ingredients.filter((item) => sourceIngredients.has(item));

        return {
          ...mapRecipe(candidate),
          shared_count: shared.length,
        };
      })
      .filter((candidate) => candidate.shared_count >= 2)
      .sort((a, b) => b.shared_count - a.shared_count)
      .slice(0, 4);

    res.json(similar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка отримання схожих рецептів" });
  }
});

/* ------------------ AI GENERATION ------------------ */
app.post("/api/recipes/generate", authMiddleware, async (req, res) => {
  try {
    const { ingredients } = req.body;

    console.log("Генерую для:", ingredients);

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res.status(400).json({
        error: "Будь ласка, додайте інгредієнти",
      });
    }

    const aiRecipes = await generateRecipesFromAI(ingredients);

    const userId = req.user?.id;

    if (userId) {
      db.prepare(
        `
        INSERT INTO ai_history (user_id, ingredients, recipes_json)
        VALUES (?, ?, ?)
      `,
      ).run(userId, JSON.stringify(ingredients), JSON.stringify(aiRecipes));
    }

    res.json(aiRecipes);
  } catch (err) {
    console.error("FULL ERROR ON SERVER:", err);

    res.status(500).json({
      error: "Не вдалося згенерувати рецепти",
    });
  }
});

/* ------------------ AI HISTORY ------------------ */

app.get("/api/ai-history", authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
       const rows = db
         .prepare(
           `
      SELECT *
      FROM ai_history
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
         )
         .all(userId);

       const parsed = rows.map((r) => ({
         ...r,
         ingredients: JSON.parse(r.ingredients),
         recipes: JSON.parse(r.recipes_json),
       }));


    res.json(parsed);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Помилка отримання історії",
    });
  }
});

app.get("/api/recipes/:id/comments", (req, res) => {
  try {
    const { id } = req.params;

    const rows = db
      .prepare(
        `
        SELECT
          c.*,
          u.first_name,
          u.last_name,
          u.avatar
        FROM comments c
        LEFT JOIN users u ON u.id = c.user_id
        WHERE c.recipe_id = ?
        ORDER BY c.created_at DESC
      `,
      )
      .all(id);

    const comments = rows.map((comment) => ({
        ...comment,
        userName:
          [comment.first_name, comment.last_name].filter(Boolean).join(" ") ||
          "Користувач",
        avatar: comment.avatar
          ? `http://localhost:4000/uploads/${comment.avatar}`
          : null,
        replies: [],
      }));

    const byId = new Map(comments.map((comment) => [comment.id, comment]));
    const nested = [];

    comments.forEach((comment) => {
      if (comment.parent_id && byId.has(comment.parent_id)) {
        byId.get(comment.parent_id).replies.push(comment);
      } else {
        nested.push(comment);
      }
    });

    res.json(nested);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка отримання коментарів" });
  }
});

app.post("/api/recipes/:id/comments", (req, res) => {
  try {
    const { text, rating, parentId } = req.body;
    const userId = getUserIdFromRequest(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Не авторизований" });
    }

    if (!text?.trim()) {
      return res.status(400).json({ error: "Коментар не може бути порожнім" });
    }

    if (parentId) {
      const parent = db
        .prepare("SELECT id FROM comments WHERE id = ? AND recipe_id = ?")
        .get(parentId, id);

      if (!parent) {
        return res.status(404).json({ error: "Коментар не знайдено" });
      }
    }

    db.prepare(
      `INSERT INTO comments (user_id, recipe_id, parent_id, text, rating)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(userId, id, parentId || null, text, parentId ? null : rating || null);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Comment error" });
  }
});

app.post("/api/recipes/:id/rating", (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({ error: "Не авторизований" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Рейтинг має бути від 1 до 5" });
    }

    db.prepare(
      `
      INSERT INTO ratings (user_id, recipe_id, rating)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, recipe_id)
      DO UPDATE SET rating = excluded.rating, created_at = CURRENT_TIMESTAMP
    `,
    ).run(userId, id, rating);

    const summary = db
      .prepare(
        `
        SELECT ROUND(AVG(rating), 1) as rating, COUNT(rating) as rating_count
        FROM ratings
        WHERE recipe_id = ?
      `,
      )
      .get(id);

    res.json({ success: true, ...summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка оновлення рейтингу" });
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
        SELECT *,
          CASE WHEN is_public = 1 THEN 0 ELSE 1 END as is_private
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
    const {
      title,
      description,
      ingredients,
      steps,
      is_private,
      image,
      category,
      portions,
      prep_time,
      difficulty,
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Не авторизований" });
    }

    if (!title) {
      return res.status(400).json({ error: "Назва обовʼязкова" });
    }

    const isPublic = is_private ? 0 : 1;
    const status = isPublic ? "pending" : "private";

    const result = db
      .prepare(
        `
      INSERT INTO recipes (
        title, description, ingredients, steps, portions, prep_time, difficulty,
        image, category, is_public, user_id, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
      )
      .run(
        title,
        description || "",
        ingredients,
        steps,
        portions || null,
        prep_time || null,
        difficulty || "easy",
        image || null,
        category || "Сніданки",
        isPublic,
        userId,
        status,
      );

    res.json({
      id: result.lastInsertRowid,
      title,
      description: description || "",
      ingredients,
      steps,
      is_private: isPublic ? 0 : 1,
      is_public: isPublic,
      image,
      category: category || "Сніданки",
      portions: portions || null,
      prep_time: prep_time || null,
      difficulty: difficulty || "easy",
      status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка створення рецепта" });
  }
});

app.post("/api/my-recipes/:id/publish", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const recipe = db
      .prepare("SELECT id, status FROM recipes WHERE id = ? AND user_id = ?")
      .get(id, userId);

    if (!recipe) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    if (recipe.status === "approved") {
      return res.status(400).json({ error: "Рецепт уже опублікований" });
    }

    db.prepare(
      `
      UPDATE recipes
      SET status = 'pending',
          is_public = 0,
          updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `,
    ).run(id, userId);

    db.prepare(
      `
      INSERT INTO notifications (user_id, type, message, related_recipe_id)
      VALUES (?, ?, ?, ?)
    `,
    ).run(userId, "recipe_pending", "Ваш рецепт надіслано на перевірку адміну", id);

    res.json({ success: true, status: "pending" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка подання рецепта на публікацію" });
  }
});

app.put("/api/my-recipes/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      ingredients,
      steps,
      is_private,
      image,
      category,
      portions,
      prep_time,
      difficulty,
    } = req.body;

    const userId = req.user?.id;
    const recipe = db
      .prepare("SELECT id FROM recipes WHERE id = ? AND user_id = ?")
      .get(id, userId);

    if (!recipe) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    const currentRecipe = db
      .prepare("SELECT status, is_public FROM recipes WHERE id = ? AND user_id = ?")
      .get(id, userId);
    const isApproved = currentRecipe?.status === "approved";
    const isPublic = isApproved ? 1 : is_private ? 0 : 1;
    const status = isApproved ? "approved" : isPublic ? "pending" : "private";

    db.prepare(
      `
      UPDATE recipes
      SET title = ?,
          description = ?,
          ingredients = ?,
          steps = ?,
          portions = ?,
          prep_time = ?,
          difficulty = ?,
          image = ?,
          category = ?,
          is_public = ?,
          status = ?,
          updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `,
    ).run(
      title,
      description || "",
      ingredients,
      steps,
      portions || null,
      prep_time || null,
      difficulty || "easy",
      image || null,
      category || "Сніданки",
      isPublic,
      status,
      id,
      userId,
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Помилка оновлення" });
  }
});

app.delete("/api/my-recipes/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = db
      .prepare("DELETE FROM recipes WHERE id = ? AND user_id = ?")
      .run(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Помилка видалення" });
  }
});

/* ------------------ ADMIN MODERATION ------------------ */
app.get("/api/admin/recipe-requests", adminMiddleware, (req, res) => {
  try {
    const rows = db
      .prepare(
        `
        SELECT
          r.id,
          r.user_id,
          r.title,
          r.category,
          r.status,
          r.created_at,
          r.updated_at,
          r.ai_score,
          u.first_name,
          u.last_name
        FROM recipes r
        LEFT JOIN users u ON u.id = r.user_id
        WHERE r.status IN ('pending', 'rejected', 'approved')
        ORDER BY
          CASE r.status WHEN 'pending' THEN 0 WHEN 'rejected' THEN 1 ELSE 2 END,
          COALESCE(r.updated_at, r.created_at) DESC
      `,
      )
      .all()
      .map(mapRecipe);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка отримання заявок" });
  }
});

app.get("/api/admin/recipe-requests/:id", adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const recipe = db
      .prepare(
        `
        SELECT r.*, u.first_name, u.last_name, u.avatar
        FROM recipes r
        LEFT JOIN users u ON u.id = r.user_id
        WHERE r.id = ?
      `,
      )
      .get(id);

    if (!recipe) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    res.json(mapRecipe(recipe));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка отримання заявки" });
  }
});

app.post("/api/admin/recipe-requests/:id/analyze", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = db.prepare("SELECT * FROM recipes WHERE id = ?").get(id);

    if (!recipe) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    const analysis = await analyzeRecipeWithAI(recipe);
    const score = Number(analysis.score) || null;
    const confidence = Number(analysis.confidence) || null;
    const flags = Array.isArray(analysis.flags) ? analysis.flags : [];

    db.prepare(
      `
      UPDATE recipes
      SET ai_score = ?,
          ai_review = ?,
          ai_confidence = ?,
          ai_flags = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `,
    ).run(
      score,
      analysis.review || "",
      confidence,
      JSON.stringify(flags),
      id,
    );

    res.json({
      score,
      review: analysis.review || "",
      confidence,
      flags,
      recommendation: analysis.recommendation || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка AI-аналізу рецепта" });
  }
});

app.post("/api/admin/recipe-requests/:id/approve", adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const recipe = db.prepare("SELECT user_id, title FROM recipes WHERE id = ?").get(id);

    if (!recipe) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    const result = db
      .prepare(
        `
        UPDATE recipes
        SET status = 'approved',
            is_public = 1,
            updated_at = datetime('now')
        WHERE id = ?
      `,
      )
      .run(id);

    db.prepare(
      `
      INSERT INTO notifications (user_id, type, message, related_recipe_id)
      VALUES (?, ?, ?, ?)
    `,
    ).run(recipe.user_id, "recipe_approved", `Рецепт "${recipe.title}" схвалено та опубліковано`, id);

    res.json({ success: true, status: "approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка схвалення рецепта" });
  }
});

app.post("/api/admin/recipe-requests/:id/reject", adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const recipe = db.prepare("SELECT user_id, title FROM recipes WHERE id = ?").get(id);

    if (!recipe) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    const result = db
      .prepare(
        `
        UPDATE recipes
        SET status = 'rejected',
            is_public = 0,
            updated_at = datetime('now')
        WHERE id = ?
      `,
      )
      .run(id);

    db.prepare(
      `
      INSERT INTO notifications (user_id, type, message, related_recipe_id)
      VALUES (?, ?, ?, ?)
    `,
    ).run(recipe.user_id, "recipe_rejected", `Рецепт "${recipe.title}" відхилено адміністратором`, id);

    res.json({ success: true, status: "rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка відхилення рецепта" });
  }
});

app.put("/api/admin/recipes/:id", adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      ingredients,
      steps,
      category,
      portions,
      prep_time,
      difficulty,
      image,
    } = req.body;

    const result = db
      .prepare(
        `
        UPDATE recipes
        SET title = ?,
            description = ?,
            ingredients = ?,
            steps = ?,
            category = ?,
            portions = ?,
            prep_time = ?,
            difficulty = ?,
            image = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `,
      )
      .run(
        title,
        description || "",
        ingredients,
        steps,
        category || "Сніданки",
        portions || null,
        prep_time || null,
        difficulty || "easy",
        image || null,
        id,
      );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка оновлення рецепта" });
  }
});

/* ------------------ NOTIFICATIONS ------------------ */
app.get("/api/notifications", authMiddleware, (req, res) => {
  try {
    const rows = db
      .prepare(
        `
        SELECT *
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
      )
      .all(req.user.id);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка отримання сповіщень" });
  }
});

app.get("/api/notifications/unread-count", authMiddleware, (req, res) => {
  try {
    const row = db
      .prepare(
        `
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = ? AND is_read = 0
      `,
      )
      .get(req.user.id);

    res.json({ count: row.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка отримання кількості сповіщень" });
  }
});

app.patch("/api/notifications/:id/read", authMiddleware, (req, res) => {
  try {
    db.prepare(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    `,
    ).run(req.params.id, req.user.id);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка оновлення сповіщення" });
  }
});

app.patch("/api/notifications/read-all", authMiddleware, (req, res) => {
  try {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(
      req.user.id,
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка оновлення сповіщень" });
  }
});

app.delete("/api/notifications/:id", authMiddleware, (req, res) => {
  try {
    db.prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?").run(
      req.params.id,
      req.user.id,
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка видалення сповіщення" });
  }
});

app.delete("/api/notifications", authMiddleware, (req, res) => {
  try {
    db.prepare("DELETE FROM notifications WHERE user_id = ?").run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка видалення сповіщень" });
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
