import React, { useState } from 'react';
import api from './api';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

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
          password: formData.password
        });
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        onLoginSuccess();
      } else {
        await api.post('/auth/register/', formData);
        setIsLogin(true); // Switch to login after successful register
        alert("Registration successful! Please login.");
      }
    } catch (err) {
      alert("Authentication failed. Check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8">
            {isLogin ? 'Welcome Back' : 'Join BusinessGen AI'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full p-3 border rounded-xl"
            placeholder="Username"
            onChange={e => setFormData({...formData, username: e.target.value})}
            required
          />
          {!isLogin && (
            <input 
              className="w-full p-3 border rounded-xl"
              placeholder="Email"
              type="email"
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          )}
          <input 
            className="w-full p-3 border rounded-xl"
            placeholder="Password"
            type="password"
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
          />
          
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn size={20}/> : <UserPlus size={20}/>)}
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-sm text-blue-600 font-medium"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}