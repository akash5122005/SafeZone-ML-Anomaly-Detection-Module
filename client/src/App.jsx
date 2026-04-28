import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportIncident from './pages/ReportIncident';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/report" element={<ReportIncident />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
