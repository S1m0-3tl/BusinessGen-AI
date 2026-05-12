import React from 'react';
import { Compass } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import navItems from './navigation';

const Sidebar = () => {
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-72 flex-col border-r border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
        <div className="h-10 w-10 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-300">
          <Compass size={22} />
        </div>
        <div className="ml-3">
          <p className="font-black text-white tracking-tight">BusinessGen AI</p>
          <p className="text-xs text-slate-500">Venture intelligence</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/10 shadow-lg shadow-blue-950/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="m-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-xs font-bold uppercase text-slate-500">Plan</p>
        <p className="mt-1 text-sm font-semibold text-white">Founder Studio</p>
        <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full w-3/5 bg-blue-500" />
        </div>
        <p className="mt-2 text-xs text-slate-500">620 credits remaining</p>
      </div>
    </aside>
  );
};

export default Sidebar;
