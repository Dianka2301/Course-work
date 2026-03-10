// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const OpenAI = require("openai");

const authRoutes = require("./auth.cjs");
const db = require("./db.cjs");
const favoritesRoutes = require("./favorites.cjs");

// Завантажуємо .env
dotenv.config({ path: path.join(__dirname, "../.env") });
console.log("API KEY:", process.env.OPENAI_API_KEY);

const app = express();

// ---------------- CORS ----------------
app.use(
  cors({
    origin: "http://localhost:5173", // твій фронтенд
    credentials: true,
  }),
);

app.use(express.json());

// ---------------- OPENAI ----------------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------------- AUTH ----------------
app.use("/api/auth", authRoutes);

// ---------------- IMAGES ----------------
app.use("/images", express.static(path.join(__dirname, "images")));

// ---------------- HEALTH ----------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", user: null });
});

// ---------------- RECIPES ----------------
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

// ---------------- AI GENERATOR ----------------
app.post("/api/ai-recipe", async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients)
      return res.status(400).json({ error: "Інгредієнти не вказані" });

    const prompt = `
Створи рецепт використовуючи ці інгредієнти: ${ingredients}

Формат відповіді:

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
    console.error("AI GENERATOR ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------- FAVORITES ----------------
// Для тестів без авторизації поки що беремо user_id = 1
app.use("/api/favorites", favoritesRoutes);

// ---------------- SERVER START ----------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
