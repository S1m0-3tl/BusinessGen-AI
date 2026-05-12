import React, { useState } from 'react';
import api from './api';
import { Loader2, LogIn, Sparkles, UserPlus } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/auth/login/', {
          username: formData.username,
          password: formData.password,
        });
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        onLoginSuccess();
      } else {
        await api.post('/auth/register/', formData);
        setIsLogin(true);
        alert('Registration successful. Please login.');
      }
    } catch {
      alert('Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_34rem)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl shadow-slate-950">
        <div className="mx-auto h-12 w-12 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-300">
          <Sparkles size={24} />
        </div>
        <h2 className="mt-6 text-3xl font-black text-center tracking-tight">
          {isLogin ? 'Welcome back' : 'Join BusinessGen AI'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">Access your founder intelligence workspace.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
            placeholder="Username"
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          {!isLogin && (
            <input
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
              placeholder="Email"
              type="email"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          )}
          <input
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
            placeholder="Password"
            type="password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <button disabled={loading} className="w-full rounded-lg bg-blue-500 py-3 font-black text-white flex justify-center items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-sm text-blue-300 font-bold">
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}
