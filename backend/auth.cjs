const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db.cjs");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

const BASE_URL = "http://localhost:4000";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔥 РЕЄСТРАЦІЯ
router.post("/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = db
      .prepare(
        `
      INSERT INTO users (email, password, first_name, last_name)
      VALUES (?, ?, ?, ?)
    `,
      )
      .run(email, hashed, firstName, lastName);

    const user = {
      id: result.lastInsertRowid, // ✅ ТЕПЕР ПРАВИЛЬНО
      email,
      firstName,
      lastName,
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "User already exists or DB error" });
  }
});

// 🔥 ЛОГІН
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email і пароль обов'язкові" });
  }

  try {
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!row) {
      return res.status(400).json({ error: "Невірний email або пароль" });
    }

    const match = await bcrypt.compare(password, row.password);

    if (!match) {
      return res.status(400).json({ error: "Невірний email або пароль" });
    }

    const user = {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      avatar: row.avatar ? `${BASE_URL}/uploads/${row.avatar}` : null,
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});

/* ------------------ UPLOAD CONFIG ------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Тільки JPG, PNG, WEBP"));
    }

    cb(null, true);
  },
});

/* ------------------ AUTH MIDDLEWARE ------------------ */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = db
      .prepare(
        "SELECT id, email, first_name, last_name, avatar FROM users WHERE email = ?",
      )
      .get(decoded.email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar ? `${BASE_URL}/uploads/${user.avatar}` : null,
      },
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// 🔥 FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  // ❗ не палимо чи існує користувач
  if (!user) {
    return res.json({ message: "If email exists, reset link sent" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 1000 * 60 * 15; // 15 хв

  db.prepare(
    `
    INSERT INTO password_resets (email, token, expires_at)
    VALUES (?, ?, ?)
  `,
  ).run(email, token, expires);

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset password",
      html: `<p>Click to reset password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "If email exists, reset link sent" });
  } catch (err) {
    console.error(err);
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔥 RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and password required" });
  }

  const record = db
    .prepare(
      `
    SELECT * FROM password_resets WHERE token = ?
  `,
    )
    .get(token);

  if (!record || record.expires_at < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const hashed = await bcrypt.hash(password, 10);

  db.prepare(
    `
    UPDATE users SET password = ? WHERE email = ?
  `,
  ).run(hashed, record.email);

  // ❗ видаляємо токен
  db.prepare(
    `
    DELETE FROM password_resets WHERE token = ?
  `,
  ).run(token);

  res.json({ message: "Password updated" });
});

module.exports = router;
