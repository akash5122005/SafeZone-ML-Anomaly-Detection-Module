const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const auth = require("../middleware/authMiddleware");

router.get("/", auth(["authority", "admin"]), async (req, res) => {
  try {
    const snapshot = await db.collection("alerts").orderBy("triggered_at", "desc").limit(100).get();
    const alerts = [];
    snapshot.forEach(doc => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

module.exports = router;
