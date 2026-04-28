const express = require("express");
const db = require("./db.cjs");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

/* ------------------ AUTH ------------------ */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* ------------------ MULTER ------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});

const upload = multer({ storage });

/* ------------------ GET PROFILE (SAFE) ------------------ */
router.get("/", auth, (req, res) => {
  const user = db
    .prepare(
      "SELECT id, email, first_name, last_name, avatar FROM users WHERE email = ?",
    )
    .get(req.user.email);

  res.json(user);
});

/* ------------------ UPDATE PROFILE (SAFE) ------------------ */
router.put("/", auth, upload.single("avatar"), (req, res) => {
  const { firstName, lastName, email } = req.body;

  let avatarPath = null;

  if (req.file) {
    avatarPath = req.file.filename;
  }

  db.prepare(
    `
    UPDATE users
    SET first_name = ?, 
        last_name = ?, 
        email = ?, 
        avatar = COALESCE(?, avatar)
    WHERE email = ?
  `,
  ).run(firstName, lastName, email, avatarPath, req.user.email);

  const updatedUser = db
    .prepare(
      "SELECT id, email, first_name, last_name, avatar FROM users WHERE email = ?",
    )
    .get(email);

  res.json(updatedUser);
});

module.exports = router;
