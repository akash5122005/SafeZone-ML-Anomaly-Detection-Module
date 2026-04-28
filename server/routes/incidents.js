const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const { checkAndAlert } = require("../services/mlService");
const auth = require("../middleware/authMiddleware");

// POST /api/incidents — submit a new incident
router.post("/", async (req, res) => {
  try {
    const { crime_type, description, severity, latitude, longitude, is_anonymous, photo_url } = req.body;

    let reported_by = null;
    if (!is_anonymous && req.headers.authorization) {
        // Optional logic to link to user id if needed
    }

    const now = new Date();
    const incidentData = {
      crime_type,
      description,
      severity: parseInt(severity),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      reported_at: now.toISOString(),
      hour_of_day: now.getHours(),
      day_of_week: now.getDay(),
      is_anonymous,
      photo_url: photo_url || null,
      reported_by
    };

    const docRef = await db.collection("incidents").add(incidentData);
    const incident = { id: docRef.id, ...incidentData };

    // Call ML service to score anomaly
    let mlResult;
    try {
        mlResult = await checkAndAlert(incident);
        
        // Save anomaly score to DB
        if (mlResult) {
          await db.collection("anomaly_scores").add({
            incident_id: incident.id,
            anomaly_score: mlResult.anomaly_score,
            is_anomaly: mlResult.is_anomaly,
            severity_label: mlResult.severity,
            scored_at: new Date().toISOString()
          });
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
    const snapshot = await db.collection("incidents").orderBy("reported_at", "desc").limit(500).get();
    const incidents = [];
    
    // In NoSQL, doing a join with anomaly_scores is manual. 
    // For performance, we can fetch incidents and their anomalies, but for simplicity we return incidents directly
    // and rely on the alerts collection or ML service output stored directly if needed.
    // Let's fetch anomalies for these incidents to match previous logic
    
    const anomalySnap = await db.collection("anomaly_scores").get();
    const anomaliesMap = {};
    anomalySnap.forEach(doc => {
      anomaliesMap[doc.data().incident_id] = doc.data();
    });

    snapshot.forEach(doc => {
      const data = doc.data();
      const anomalyData = anomaliesMap[doc.id] || {};
      incidents.push({
        id: doc.id,
        ...data,
        anomaly_score: anomalyData.anomaly_score,
        is_anomaly: anomalyData.is_anomaly,
        cluster_id: anomalyData.cluster_id,
        is_hotspot: anomalyData.is_hotspot
      });
    });

    res.json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

// GET /api/incidents/heatmap — lat/lng for Mapbox heatmap
router.get("/heatmap", async (req, res) => {
  try {
    // 30 days logic can be done with inequality filter, but let's just get all for now to be safe with indexes
    const snapshot = await db.collection("incidents").get();
    const heatData = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    snapshot.forEach(doc => {
      const data = doc.data();
      if (new Date(data.reported_at) > thirtyDaysAgo) {
        heatData.push({
          latitude: data.latitude,
          longitude: data.longitude,
          severity: data.severity
        });
      }
    });

    res.json(heatData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch heatmap data" });
  }
});

module.exports = router;
