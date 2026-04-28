import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? "Login to SafeZone" : "Create an Account"}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <input className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 transition"
            placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        )}
        <input className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 transition"
          type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <input className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-500 transition"
          type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
        <button type="submit" className="bg-cyan-500 text-slate-900 font-bold py-3 rounded-lg mt-2 hover:bg-cyan-400 transition">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p className="text-center mt-6 text-slate-400">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-cyan-400 hover:text-cyan-300 font-medium">
          {isLogin ? "Register here" : "Login here"}
        </button>
      </p>
    </div>
  );
}
