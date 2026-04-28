const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");

router.get("/", auth(["authority", "admin"]), async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM alerts ORDER BY triggered_at DESC LIMIT 100`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

module.exports = router;
