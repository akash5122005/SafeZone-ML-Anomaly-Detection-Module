const admin = require("firebase-admin");

// Initialize Firebase Admin
// You need to set GOOGLE_APPLICATION_CREDENTIALS environment variable or pass service account directly
// For production (Railway), setting the raw JSON inside an env variable is common
try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Local dev fallback, assume file exists
    serviceAccount = require("./serviceAccountKey.json");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin Initialized Successfully");
} catch (error) {
  console.error("Firebase Admin Initialization Error: ", error);
}

const db = admin.firestore();
module.exports = { admin, db };
