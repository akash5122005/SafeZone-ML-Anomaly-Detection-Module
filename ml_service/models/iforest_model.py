import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def train_isolation_forest(incidents):
    le = LabelEncoder()
    crime_types = [i["crime_type"] for i in incidents]
    encoded = le.fit_transform(crime_types)
    joblib.dump(le, "label_encoder.pkl")

    X = np.array([
        [i["latitude"], i["longitude"], i["hour_of_day"], i["day_of_week"], encoded[idx]]
        for idx, i in enumerate(incidents)
    ])

    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    model.fit(X)
    joblib.dump(model, "iforest_model.pkl")
    return {"status": "trained", "samples": len(incidents)}

def score_incident(incident):
    if not os.path.exists("iforest_model.pkl") or not os.path.exists("label_encoder.pkl"):
        # Dummy response if model not trained
        return {
            **incident,
            "anomaly_score": 0.0,
            "is_anomaly": False,
            "severity": "normal"
        }
    model = joblib.load("iforest_model.pkl")
    le = joblib.load("label_encoder.pkl")
    
    # Handle unseen labels carefully
    try:
        crime_encoded = le.transform([incident["crime_type"]])[0]
    except ValueError:
        crime_encoded = 0 # Default fallback
        
    features = np.array([[
        incident["latitude"], incident["longitude"],
        incident["hour_of_day"], incident["day_of_week"], crime_encoded
    ]])
    score = model.decision_function(features)[0]
    prediction = model.predict(features)[0]
    return {
        **incident,
        "anomaly_score": round(float(score), 4),
        "is_anomaly": bool(prediction == -1),
        "severity": "high" if score < -0.2 else "medium" if score < 0 else "normal"
    }
