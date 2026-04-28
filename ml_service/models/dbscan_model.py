import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import joblib
import os

def train_dbscan(incidents):
    coords = np.array([[i["latitude"], i["longitude"]] for i in incidents])
    scaler = StandardScaler()
    coords_scaled = scaler.fit_transform(coords)
    db = DBSCAN(eps=0.3, min_samples=5, metric="euclidean")
    db.fit(coords_scaled)
    joblib.dump(db, "dbscan_model.pkl")
    joblib.dump(scaler, "dbscan_scaler.pkl")
    return {"status": "trained"}

def predict_hotspots(incidents):
    if not os.path.exists("dbscan_model.pkl") or not os.path.exists("dbscan_scaler.pkl"):
        # Dummy if not trained
        return [{**incident, "cluster_id": -1, "is_hotspot": False} for incident in incidents]
    db = joblib.load("dbscan_model.pkl")
    scaler = joblib.load("dbscan_scaler.pkl")
    coords = np.array([[i["latitude"], i["longitude"]] for i in incidents])
    coords_scaled = scaler.transform(coords)
    labels = db.fit_predict(coords_scaled)
    return [
        {**incident, "cluster_id": int(labels[i]), "is_hotspot": labels[i] != -1}
        for i, incident in enumerate(incidents)
    ]
