import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-cyan-400 tracking-tighter">
        SafeZone
      </Link>
      <div className="flex gap-4 items-center">
        <Link to="/report" className="text-slate-300 hover:text-white font-medium transition">Report Incident</Link>
        {user?.role === 'authority' || user?.role === 'admin' ? (
          <>
            <Link to="/dashboard" className="text-slate-300 hover:text-white font-medium transition">Dashboard</Link>
            <Link to="/analytics" className="text-slate-300 hover:text-white font-medium transition">Analytics</Link>
          </>
        ) : null}
        
        {token ? (
          <div className="flex items-center gap-4 ml-4 border-l border-slate-700 pl-4">
            <span className="text-slate-400 text-sm">Hi, {user?.name}</span>
            <button onClick={handleLogout} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg font-medium hover:bg-red-500/20 transition">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="bg-cyan-500 text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-cyan-400 transition ml-4">Login</Link>
        )}
      </div>
    </nav>
  );
}
