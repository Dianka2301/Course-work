// backend/src/auth.cjs
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db.cjs"); // твоє db.cjs для SQLite

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// Реєстрація
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email і пароль обов'язкові" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const stmt = db.prepare(
      "INSERT INTO users (email, password) VALUES (?, ?)",
    );
    stmt.run(email, hashed);
    const user = { email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Користувач вже існує або помилка бази" });
  }
});

// Логін
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email і пароль обов'язкові" });

  try {
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!row)
      return res.status(400).json({ error: "Невірний email або пароль" });

    const match = await bcrypt.compare(password, row.password);
    if (!match)
      return res.status(400).json({ error: "Невірний email або пароль" });

    const user = { email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});

module.exports = router;
