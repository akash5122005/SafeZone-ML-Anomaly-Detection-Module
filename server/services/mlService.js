const axios = require("axios");
const { db } = require("../firebase");
const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";

async function scoreIncident(incident) {
  try {
    const { data } = await axios.post(`${ML_URL}/score`, {
      latitude: incident.latitude,
      longitude: incident.longitude,
      hour_of_day: new Date(incident.reported_at).getHours(),
      day_of_week: new Date(incident.reported_at).getDay(),
      crime_type: incident.crime_type,
    });
    return data;
  } catch (err) {
    console.error("Error calling ML service", err.message);
    return null;
  }
}

async function checkAndAlert(incident) {
  const result = await scoreIncident(incident);
  if (result && result.is_anomaly) {
    // Write directly to alerts collection, client will pick it up via onSnapshot
    await db.collection("alerts").add({
      incident_id: incident.id,
      incident: incident,
      score: result.anomaly_score,
      severity: result.severity,
      triggered_at: new Date().toISOString(),
      seen: false
    });
  }
  return result;
}

module.exports = { scoreIncident, checkAndAlert };
