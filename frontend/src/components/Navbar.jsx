import React from 'react';
import { Link } from 'react-router-dom';
import { Target, LogOut } from 'lucide-react';

const Navbar = ({ isAuthenticated, onLogout }) => {
  return (
    <header className="bg-white border-b p-6 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><Target size={24} /></div>
          <h1 className="text-2xl font-bold tracking-tight">BusinessGen <span className="text-blue-600">AI</span></h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/generate" className="text-sm font-bold text-blue-600 px-4">Dashboard</Link>
              <button type="button" onClick={onLogout} className="flex items-center gap-2 text-red-500 font-bold text-sm">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-slate-600">Login</Link>
              <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Join Free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
