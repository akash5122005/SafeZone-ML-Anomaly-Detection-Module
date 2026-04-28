const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, password_hash, role || 'citizen']
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: "Registration failed or email already in use." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    delete user.password_hash;
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;
