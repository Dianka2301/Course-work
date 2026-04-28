const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db.cjs");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// 🔥 РЕЄСТРАЦІЯ
router.post("/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res
      .status(400)
      .json({ error: "Всі поля обов'язкові (ім’я, прізвище, email, пароль)" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.prepare(
      `
      INSERT INTO users (email, password, first_name, last_name)
      VALUES (?, ?, ?, ?)
    `,
    ).run(email, hashed, firstName, lastName);

    const user = { email, firstName, lastName };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1h" });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Користувач вже існує або помилка бази" });
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
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
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

/* ------------------ UPDATE PROFILE ------------------ */
router.put("/profile", auth, upload.single("avatar"), (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const avatarFile = req.file;

    const currentUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(req.user.email);

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const newAvatar = avatarFile ? avatarFile.filename : currentUser.avatar;

    db.prepare(
      `
      UPDATE users
      SET first_name = ?,
          last_name = ?,
          email = ?,
          avatar = ?
      WHERE id = ?
    `,
    ).run(firstName, lastName, email, newAvatar, currentUser.id);

    const updatedUser = {
      email,
      firstName,
      lastName,
      avatar: newAvatar,
    };

    const token = jwt.sign(updatedUser, JWT_SECRET, { expiresIn: "1h" });

    res.json({ user: updatedUser, token });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

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
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;