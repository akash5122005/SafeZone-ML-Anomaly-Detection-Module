import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import socket from "../services/socket";
import api from "../services/api";
import HeatMap from "../components/HeatMap";
import { AlertTriangle, MapPin, Clock } from 'lucide-react';

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user || user.role === 'citizen') return;

    // Fetch initial data
    api.get("/incidents").then(({ data }) => setIncidents(data)).catch(console.error);

    // Socket listeners for real-time alerts
    socket.on("anomaly_alert", (data) => {
      setAlerts(prev => [data, ...prev]);
      setIncidents(prev => [data.incident, ...prev]);
    });

    return () => {
      socket.off("anomaly_alert");
    };
  }, [user]);

  if (!user || user.role === 'citizen') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Authority Dashboard</h2>
          <p className="text-slate-400">Live monitoring of incidents and AI-detected anomalies.</p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-pulse">
          <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2"><AlertTriangle size={18} /> Recent Anomalies</h3>
          <div className="flex flex-col gap-2">
            {alerts.slice(0, 3).map((a, i) => (
              <div key={i} className="bg-red-500/5 p-3 rounded text-sm text-red-200 flex justify-between items-center">
                <span>{a.incident.crime_type} reported with high anomaly score ({a.score}). Check location.</span>
                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Severity: {a.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden p-1 shadow-lg">
          <HeatMap incidents={incidents} />
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg flex flex-col max-h-[500px]">
          <h3 className="text-xl font-bold mb-4 text-cyan-400 border-b border-slate-700 pb-4">Recent Incidents</h3>
          <div className="overflow-y-auto flex-1 flex flex-col gap-4 pr-2">
            {incidents.length === 0 ? (
              <p className="text-slate-500 text-center mt-10">No incidents to display.</p>
            ) : (
              incidents.slice(0, 10).map((inc) => (
                <div key={inc.id} className={`p-4 rounded-xl border ${inc.is_anomaly ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900 border-slate-700'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-white">{inc.crime_type}</span>
                    {inc.is_anomaly && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">ANOMALY</span>}
                  </div>
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{inc.description}</p>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={12}/> {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {new Date(inc.reported_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
