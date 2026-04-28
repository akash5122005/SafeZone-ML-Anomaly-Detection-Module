from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models.dbscan_model import predict_hotspots, train_dbscan
from models.iforest_model import score_incident, train_isolation_forest

app = FastAPI(title="SafeZone ML Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Incident(BaseModel):
    latitude: float
    longitude: float
    hour_of_day: int
    day_of_week: int
    crime_type: str

class IncidentBatch(BaseModel):
    incidents: list[Incident]

@app.post("/hotspots")
def get_hotspots(batch: IncidentBatch):
    return predict_hotspots([i.dict() for i in batch.incidents])

@app.post("/score")
def score_single(incident: Incident):
    return score_incident(incident.dict())

@app.post("/score/batch")
def score_batch(batch: IncidentBatch):
    return [score_incident(i.dict()) for i in batch.incidents]

@app.post("/train")
def retrain(batch: IncidentBatch):
    data = [i.dict() for i in batch.incidents]
    if not data:
        return {"error": "No data provided"}
    train_dbscan(data)
    result = train_isolation_forest(data)
    return {"dbscan": "ok", "isolation_forest": result}

@app.get("/health")
def health():
    return {"status": "ok"}
