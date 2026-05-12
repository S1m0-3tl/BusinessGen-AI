import React, { useMemo, useState } from 'react';
import { Bell, ChevronDown, Coins, LogOut, Menu, Search } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import navItems from './navigation';

const Layout = ({ children, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return navItems.filter(({ label }) => label.toLowerCase().includes(normalizedQuery));
  }, [query]);

  const runSearch = (event) => {
    event.preventDefault();
    const match = searchMatches[0];
    if (match) {
      navigate(match.to);
      setQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_32rem),radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_28rem)]" />
      <Sidebar />
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col border-r border-slate-800 bg-slate-950 p-4">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-black text-white">BusinessGen AI</p>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg border border-slate-800 px-3 py-2 text-sm font-bold text-slate-300"
              >
                Close
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                        isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <div className="relative lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
          <div className="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden h-10 w-10 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
              <form onSubmit={runSearch} className="relative hidden md:flex h-10 w-80 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 text-slate-500">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search pages..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
                {query && (
                  <div className="absolute left-0 right-0 top-12 rounded-lg border border-slate-800 bg-slate-950 p-2 shadow-xl">
                    {searchMatches.length ? searchMatches.map(({ label, to }) => (
                      <button
                        key={to}
                        type="button"
                        onClick={() => {
                          navigate(to);
                          setQuery('');
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
                      >
                        {label}
                      </button>
                    )) : (
                      <p className="px-3 py-2 text-sm text-slate-500">No matching pages</p>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                <Coins size={16} className="text-amber-300" />
                <span className="text-sm font-bold text-white">620</span>
                <span className="text-xs text-slate-500">credits</span>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="h-10 w-10 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400"
                  aria-label="Notifications"
                >
                <Bell size={17} />
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-800 bg-slate-950 p-4 shadow-xl">
                    <p className="text-sm font-black text-white">Notifications</p>
                    <p className="mt-2 text-sm text-slate-500">No new alerts. Your workspace is up to date.</p>
                  </div>
                )}
              </div>
              {isAuthenticated ? (
                <div className="relative flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-300" />
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-white">Founder</p>
                    <p className="text-xs text-slate-500">Workspace</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((open) => !open)}
                    className="rounded-md p-1 text-slate-500 hover:text-white"
                    aria-label="Open profile menu"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button type="button" onClick={onLogout} className="ml-1 text-slate-500 hover:text-red-300" aria-label="Logout">
                    <LogOut size={16} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-48 rounded-lg border border-slate-800 bg-slate-950 p-2 shadow-xl">
                      <Link
                        to="/library"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
                      >
                        Open library
                      </Link>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm font-bold text-red-300 hover:bg-slate-900"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white">
                  Login
                </Link>
              )}
            </div>
          </div>
          <nav className="lg:hidden px-4 pb-4 flex gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `shrink-0 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${
                      isActive
                        ? 'border-blue-400/40 bg-blue-500/15 text-blue-100'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`
                  }
                >
                  <Icon size={14} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
