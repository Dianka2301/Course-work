const express = require("express");
const router = express.Router();
const db = require("./db.cjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

function getUserId(req) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return req.session?.userId || 1;
  }

  try {
    return jwt.verify(token, JWT_SECRET).id;
  } catch {
    return req.session?.userId || 1;
  }
}

// Отримати всі обрані рецепти користувача
router.get("/", (req, res) => {
  const userId = getUserId(req);

  try {
    const rows = db
      .prepare(
        `
      SELECT 
      r.*,
      ROUND(AVG(rt.rating), 1) as rating,
      COUNT(rt.rating) as rating_count
      FROM favorites f
      JOIN recipes r ON r.id = f.recipe_id
      LEFT JOIN ratings rt ON r.id = rt.recipe_id
      WHERE f.user_id = ?
      GROUP BY r.id
      ORDER BY r.created_at DESC
      `,
      )
      .all(userId);

    // Повертаємо масив (може бути пустий)
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error(err);
    // Повертаємо порожній масив замість помилки
    res.json([]);
  }
});

// Додати/видалити рецепт з обраного (toggle)
router.post("/", (req, res) => {
  const userId = getUserId(req);
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ error: "recipeId не вказано" });
  }

  try {
    const recipe = db
      .prepare("SELECT id FROM recipes WHERE id = ?")
      .get(recipeId);

    if (!recipe) {
      return res.status(404).json({ error: "Рецепт не знайдено" });
    }

    const exists = db
      .prepare("SELECT id FROM favorites WHERE user_id = ? AND recipe_id = ?")
      .get(userId, recipeId);

    let liked;
    if (exists) {
      // видалити
      db.prepare("DELETE FROM favorites WHERE id = ?").run(exists.id);
      liked = false;
    } else {
      // додати
      db.prepare(
        "INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)",
      ).run(userId, recipeId);
      liked = true;
    }

    res.json({ liked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Не вдалося оновити обране" });
  }
});

module.exports = router;
