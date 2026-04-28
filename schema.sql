-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (3 roles: citizen, authority, admin)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'citizen' CHECK (role IN ('citizen', 'authority', 'admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Incidents table
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crime_type VARCHAR(50) NOT NULL,
  description TEXT,
  severity INT CHECK (severity BETWEEN 1 AND 5),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  reported_at TIMESTAMP DEFAULT NOW(),
  hour_of_day INT GENERATED ALWAYS AS (EXTRACT(HOUR FROM reported_at)::INT) STORED,
  day_of_week INT GENERATED ALWAYS AS (EXTRACT(DOW FROM reported_at)::INT) STORED,
  is_anonymous BOOLEAN DEFAULT TRUE,
  reported_by UUID REFERENCES users(id),
  photo_url TEXT
);

-- Anomaly scores table (written by ML service)
CREATE TABLE anomaly_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id),
  anomaly_score DOUBLE PRECISION,
  is_anomaly BOOLEAN,
  severity_label VARCHAR(10),
  cluster_id INT,
  is_hotspot BOOLEAN,
  scored_at TIMESTAMP DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id),
  alert_type VARCHAR(30),
  message TEXT,
  triggered_at TIMESTAMP DEFAULT NOW(),
  seen BOOLEAN DEFAULT FALSE
);
