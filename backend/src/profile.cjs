const express = require("express");
const db = require("./db.cjs");
const multer = require("multer");
const path = require("path");

const router = express.Router();

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

/* ------------------ GET PROFILE ------------------ */
router.get("/", (req, res) => {
  const userId = req.query.id;

  if (!userId) {
    return res.status(400).json({ error: "ID не передано" });
  }

  const user = db
    .prepare(
      "SELECT id, email, first_name, last_name, avatar FROM users WHERE id = ?",
    )
    .get(userId);

  res.json(user);
});

/* ------------------ UPDATE PROFILE ------------------ */
router.post("/", upload.single("avatar"), (req, res) => {
  const { firstName, lastName, email, id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID не передано" });
  }

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
    WHERE id = ?
  `,
  ).run(firstName, lastName, email, avatarPath, id);

  const updatedUser = db
    .prepare(
      "SELECT id, email, first_name, last_name, avatar FROM users WHERE id = ?",
    )
    .get(id);

  res.json(updatedUser);
});

module.exports = router;
