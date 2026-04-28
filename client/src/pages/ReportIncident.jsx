import { useState } from "react";
import api from "../services/api";

const CRIME_TYPES = ["Theft", "Assault", "Vandalism", "Robbery", "Suspicious Activity", "Other"];

export default function ReportIncident() {
  const [form, setForm] = useState({
    crime_type: "", description: "", severity: 3,
    latitude: "13.0827", longitude: "80.2707", is_anonymous: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/incidents", {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude)
      });
      setSubmitted(true);
    } catch (err) {
      alert("Error reporting incident.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-slate-800 p-10 rounded-3xl border border-slate-700 text-center">
        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
        <h2 className="text-2xl font-bold mb-4">Report Submitted</h2>
        <p className="text-slate-400 mb-8">Thank you for keeping the community safe. Authorities have been notified.</p>
        <button onClick={() => setSubmitted(false)} className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-medium transition">
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl mt-8">
      <h2 className="text-3xl font-bold mb-8 text-cyan-400">Report an Incident</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Crime Type</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 transition text-slate-100"
            value={form.crime_type} onChange={e => setForm({...form, crime_type: e.target.value})} required>
            <option value="">Select an incident type</option>
            {CRIME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
          <textarea 
            className="w-full bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 transition min-h-[120px]"
            placeholder="Please provide details about what happened..." 
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Severity Level: <span className="text-white font-bold">{form.severity}</span></label>
          <input 
            type="range" min="1" max="5" 
            className="w-full accent-cyan-500"
            value={form.severity} onChange={e => setForm({...form, severity: +e.target.value})} />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Low</span>
            <span>Critical</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Latitude</label>
            <input 
              className="w-full bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 transition"
              type="number" step="any" placeholder="Latitude" 
              value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Longitude</label>
            <input 
              className="w-full bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 transition"
              type="number" step="any" placeholder="Longitude" 
              value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} required />
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg flex items-center gap-3 border border-slate-700/50 mt-2">
          <input 
            type="checkbox" id="anon"
            className="w-5 h-5 accent-cyan-500 rounded bg-slate-800"
            checked={form.is_anonymous} onChange={e => setForm({...form, is_anonymous: e.target.checked})} />
          <label htmlFor="anon" className="text-sm font-medium">
            Submit anonymously <span className="text-slate-400 block text-xs font-normal">Your identity will not be linked to this report.</span>
          </label>
        </div>

        <button type="submit" disabled={loading} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 rounded-xl mt-4 text-lg transition disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
