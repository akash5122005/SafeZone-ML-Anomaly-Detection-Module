const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if user exists
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUserRef = usersRef.doc();
    
    const user = {
      id: newUserRef.id,
      name,
      email,
      role: role || 'citizen',
      created_at: new Date().toISOString()
    };
    
    await newUserRef.set({ ...user, password_hash });
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();
    
    if (snapshot.empty) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userData = snapshot.docs[0].data();
    const isValid = await bcrypt.compare(password, userData.password_hash);
    
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    };

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;
