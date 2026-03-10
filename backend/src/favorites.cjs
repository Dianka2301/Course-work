const express = require("express");
const router = express.Router();
const db = require("./db.cjs");

// Отримати всі обрані рецепти користувача
router.get("/", (req, res) => {
  const userId = req.session?.userId || 1; // тестово 1

  try {
    const rows = db
      .prepare(
        `
        SELECT r.*
        FROM favorites f
        JOIN recipes r ON r.id = f.recipe_id
        WHERE f.user_id = ?
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
  const userId = req.session?.userId || 1; // тестово
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ error: "recipeId не вказано" });
  }

  try {
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
