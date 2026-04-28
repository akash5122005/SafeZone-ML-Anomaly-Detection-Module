const express = require("express");
const router = express.Router();
const db = require("../db");
const { checkAndAlert } = require("../services/mlService");
const auth = require("../middleware/authMiddleware");

// POST /api/incidents — submit a new incident
router.post("/", async (req, res) => {
  try {
    const { crime_type, description, severity, latitude, longitude, is_anonymous } = req.body;
    const io = req.app.get("io");

    // Optional user mapping based on token if they are logged in but didn't choose anon
    let reported_by = null;
    if (!is_anonymous && req.headers.authorization) {
        // Just decode token here manually if needed, or pass auth middleware optionally
    }

    const result = await db.query(
      `INSERT INTO incidents (crime_type, description, severity, latitude, longitude, location, is_anonymous, reported_by)
       VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($5, $4), 4326), $6, $7)
       RETURNING *`,
      [crime_type, description, severity, latitude, longitude, is_anonymous, reported_by]
    );

    const incident = result.rows[0];

    // Call ML service to score anomaly
    let mlResult;
    try {
        mlResult = await checkAndAlert(io, incident);
        
        // Save anomaly score to DB
        if (mlResult) {
          await db.query(
            `INSERT INTO anomaly_scores (incident_id, anomaly_score, is_anomaly, severity_label)
             VALUES ($1, $2, $3, $4)`,
            [incident.id, mlResult.anomaly_score, mlResult.is_anomaly, mlResult.severity]
          );
        }
    } catch (e) {
        console.error("ML service failed", e.message);
    }

    res.status(201).json({ incident, ml: mlResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit incident" });
  }
});

// GET /api/incidents — get all incidents (authority only)
router.get("/", auth(["authority", "admin"]), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, a.anomaly_score, a.is_anomaly, a.cluster_id, a.is_hotspot
       FROM incidents i
       LEFT JOIN anomaly_scores a ON i.id = a.incident_id
       ORDER BY i.reported_at DESC LIMIT 500`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

// GET /api/incidents/heatmap — lat/lng for Mapbox heatmap
router.get("/heatmap", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT latitude, longitude, severity FROM incidents
       WHERE reported_at > NOW() - INTERVAL '30 days'`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heatmap data" });
  }
});

module.exports = router;
