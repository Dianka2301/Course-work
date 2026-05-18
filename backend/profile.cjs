const express = require("express");
const db = require("./db.cjs");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

const BASE_URL = "http://localhost:4000";

/* ------------------ AUTH ------------------ */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });

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
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, unique);
  },
});

const upload = multer({ storage });

/* ------------------ GET PROFILE ------------------ */
router.get("/", auth, (req, res) => {
  const user = db
    .prepare(
      "SELECT id, email, first_name, last_name, bio, avatar, role, created_at FROM users WHERE email = ?",
    )
    .get(req.user.email);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user?.avatar) {
    user.avatar = `${BASE_URL}/uploads/${user.avatar}`;
  }

  res.json({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    bio: user.bio,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.created_at,
  });
});

/* ------------------ UPDATE PROFILE ------------------ */
router.put("/", auth, upload.single("avatar"), (req, res) => {
  const { firstName, lastName, email, bio } = req.body;

  const currentUser = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(req.user.email);

  if (!currentUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const avatarFile = req.file;

  const newAvatar = avatarFile ? avatarFile.filename : currentUser.avatar;

  db.prepare(
    `
    UPDATE users
    SET first_name = ?,
        last_name = ?,
        email = ?,
        bio = ?,
        avatar = ?
    WHERE id = ?
  `,
  ).run(firstName, lastName, email, bio ?? currentUser.bio, newAvatar, currentUser.id);

  const updatedUser = {
    id: currentUser.id,
    email,
    firstName,
    lastName,
    bio: bio ?? currentUser.bio,
    role: currentUser.role,
    avatar: newAvatar ? `${BASE_URL}/uploads/${newAvatar}` : null,
  };

  const token = jwt.sign(updatedUser, JWT_SECRET, { expiresIn: "1h" });

  res.json({ user: updatedUser, token });
});

module.exports = router;
