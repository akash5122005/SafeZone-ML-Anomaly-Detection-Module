import { Link } from 'react-router-dom';
import { ShieldAlert, Map, Bell } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center mt-12">
      <div className="bg-cyan-500/10 p-6 rounded-full mb-6">
        <ShieldAlert className="w-16 h-16 text-cyan-400" />
      </div>
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">
        SafeZone
      </h1>
      <p className="text-xl text-slate-400 max-w-2xl mb-12">
        An AI-powered crime & anomaly detection system. Report incidents anonymously, get real-time alerts, and view live heatmaps to stay safe.
      </p>
      
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <Map className="w-10 h-10 text-blue-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Live Heatmaps</h3>
          <p className="text-slate-400">View real-time clustering of incidents to identify hotspots in your area.</p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <ShieldAlert className="w-10 h-10 text-red-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Anonymous Reporting</h3>
          <p className="text-slate-400">Submit crime reports anonymously with our easy-to-use secure forms.</p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <Bell className="w-10 h-10 text-yellow-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Real-time Alerts</h3>
          <p className="text-slate-400">Powered by Machine Learning, get instant notifications on detected anomalies.</p>
        </div>
      </div>
      
      <div className="mt-16 flex gap-6">
        <Link to="/report" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-4 px-8 rounded-full text-lg shadow-lg shadow-cyan-500/20 transition">
          Report an Incident
        </Link>
        <Link to="/dashboard" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 px-8 rounded-full text-lg transition">
          View Dashboard
        </Link>
      </div>
    </div>
  );
}
