const express = require("express");
const router = express.Router();
const db = require("./db.cjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// Сувора та безпечна перевірка авторизації (як у вашому profile.cjs) [4]
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.warn("Попередження: Токен не знайдено у запиті до Обраного!");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    console.error("Помилка верифікації токена в favorites.cjs:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.get("/", auth, (req, res) => {
  const userId = req.user.id; 

  try {
    const rows = db
      .prepare(
        `
      SELECT 
      r.*,
      u.first_name,
      u.last_name,
      u.avatar,
      ROUND(AVG(rt.rating), 1) as rating,
      COUNT(rt.rating) as rating_count
      FROM favorites f
      JOIN recipes r ON r.id = f.recipe_id
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN ratings rt ON r.id = rt.recipe_id
      WHERE f.user_id = ?
      GROUP BY r.id
      ORDER BY r.created_at DESC
      `,
      )
      .all(userId);

    res.json(
      Array.isArray(rows)
        ? rows.map((row) => ({
            ...row,
            authorName:
              [row.first_name, row.last_name].filter(Boolean).join(" ") ||
              "Автор рецепта",
          }))
        : [],
    );
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

router.post("/", auth, (req, res) => {
  const userId = req.user.id; 
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
      db.prepare("DELETE FROM favorites WHERE id = ?").run(exists.id);
      liked = false;
    } else {
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
