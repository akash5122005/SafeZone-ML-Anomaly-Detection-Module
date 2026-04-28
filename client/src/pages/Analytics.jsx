import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from "../services/api";

export default function Analytics() {
  const [incidents, setIncidents] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user || user.role === 'citizen') return;
    api.get("/incidents").then(({ data }) => setIncidents(data)).catch(console.error);
  }, [user]);

  if (!user || user.role === 'citizen') {
    return <Navigate to="/login" />;
  }

  // Aggregate by crime type
  const typeCounts = incidents.reduce((acc, curr) => {
    acc[curr.crime_type] = (acc[curr.crime_type] || 0) + 1;
    return acc;
  }, {});
  const typeData = Object.keys(typeCounts).map(key => ({ name: key, count: typeCounts[key] }));

  // Aggregate by hour of day
  const hourCounts = incidents.reduce((acc, curr) => {
    acc[curr.hour_of_day] = (acc[curr.hour_of_day] || 0) + 1;
    return acc;
  }, {});
  const hourData = Array.from({ length: 24 }).map((_, i) => ({ hour: `${i}:00`, count: hourCounts[i] || 0 }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Crime Analytics</h2>
        <p className="text-slate-400">Statistical breakdown and trends of reported incidents.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg h-96">
          <h3 className="text-xl font-bold mb-4 text-cyan-400">Incidents by Type</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg h-96">
          <h3 className="text-xl font-bold mb-4 text-cyan-400">Incidents by Hour</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
