import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../services/firebase";
import HeatMap from "../components/HeatMap";
import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import api from "../services/api"; // For initial load if needed

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user || user.role === 'citizen') return;

    // Real-time listener for incidents
    const qIncidents = query(collection(db, "incidents"), orderBy("reported_at", "desc"), limit(100));
    const unsubscribeIncidents = onSnapshot(qIncidents, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncidents(data);
    });

    // Real-time listener for alerts
    const qAlerts = query(collection(db, "alerts"), orderBy("triggered_at", "desc"), limit(50));
    const unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlerts(data);
    });

    return () => {
      unsubscribeIncidents();
      unsubscribeAlerts();
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
                <div key={inc.id} className="p-4 rounded-xl border bg-slate-900 border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-white">{inc.crime_type}</span>
                  </div>
                  {inc.photo_url && (
                    <img src={inc.photo_url} alt="incident" className="w-full h-32 object-cover rounded-lg mb-2 border border-slate-700" />
                  )}
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
