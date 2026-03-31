import React, { useState, useEffect } from 'react';
import { Send, Loader2, Target, BarChart3, Layout, TrendingUp, LogOut, Clock } from 'lucide-react';
import api from './api';
import Auth from './Auth';

function App() {
  // --- 1. ALL HOOKS MUST BE AT THE VERY TOP ---
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access'));
  const [formData, setFormData] = useState({ sector: '', budget: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // This effect runs whenever the authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  // --- 2. LOGIC FUNCTIONS ---
  const fetchHistory = async () => {
    try {
      const response = await api.get('/ideas/history/');
      setHistory(response.data);
    } catch (err) {
      console.error("Could not fetch history. Ensure the Django endpoint exists.");
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setResult(null);
    setHistory([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/ideas/generate/', formData);
      setResult(response.data);
      // Refresh the sidebar history so the new idea appears immediately
      fetchHistory(); 
    } catch (error) {
      console.error(error);
      alert("Error: Check your console. Ensure Django is running and Gemini API key is valid.");
    }
    setLoading(false);
  };

  // --- 3. CONDITIONAL RENDERING ---
  // We only check this AFTER all hooks have been declared above
  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // --- 4. MAIN DASHBOARD UI ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b p-6 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white"><Target size={24} /></div>
            <h1 className="text-2xl font-bold tracking-tight">BusinessGen <span className="text-blue-600">AI</span></h1>
          </div>
          
          <div className="flex items-center gap-6">
            <p className="hidden md:block text-sm text-slate-500 font-medium italic">Expert Consultant Mode</p>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 font-bold text-sm transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar: History List */}
        <aside className="lg:col-span-1 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-slate-700 mb-4">
                <Clock size={18} /> Recent Blueprints
            </h3>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-white p-4 rounded-xl border border-dashed">No saved ideas yet. Generate your first one!</p>
                ) : (
                    history.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setResult(item.analysis)}
                            className="w-full text-left p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
                        >
                            <p className="font-bold text-sm truncate group-hover:text-blue-600 mb-1">{item.name}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-mono uppercase">{item.date}</span>
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">View</span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </aside>

        {/* Main Content: Generator & Results */}
        <div className="lg:col-span-3">
            {/* Input Form */}
            <section className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-slate-100">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-500" /> Start a New Concept
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Sector</label>
                  <input 
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl p-3 transition-all"
                    placeholder="e.g. Sustainable Fashion"
                    onChange={(e) => setFormData({...formData, sector: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Available Budget</label>
                  <input 
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 rounded-xl p-3 transition-all"
                    placeholder="e.g. 5,000 DH"
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  />
                </div>
                <button 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  Generate Blueprint
                </button>
              </form>
            </section>

            {/* AI Results Display */}
            {result && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center max-w-3xl mx-auto">
                  <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">{result.slogan}</span>
                  <h2 className="text-5xl font-black mt-4 mb-6">{result.name}</h2>
                  <p className="text-xl text-slate-600 leading-relaxed">{result.description}</p>
                </div>

                {/* SWOT Analysis */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="text-blue-500" /> SWOT Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(result.swot || {}).map(([key, list]) => (
                      <div key={key} className={`p-6 rounded-2xl border-b-4 ${key === 'strengths' ? 'bg-green-50 border-green-500' : key === 'weaknesses' ? 'bg-red-50 border-red-500' : key === 'opportunities' ? 'bg-blue-50 border-blue-500' : 'bg-orange-50 border-orange-500'}`}>
                        <h4 className="font-bold uppercase text-xs mb-4 tracking-tighter">{key}</h4>
                        <ul className="text-sm space-y-2 font-medium opacity-80">
                          {Array.isArray(list) ? list.map((item, i) => <li key={i}>• {item}</li>) : <li>{list}</li>}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BMC Visualization */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Layout className="text-blue-500" /> Business Model Canvas</h3>
                  <div className="grid grid-cols-5 grid-rows-2 gap-2 min-h-[500px] text-[10px]">
                    <div className="col-span-1 row-span-2 border-2 rounded-lg p-4 bg-white shadow-sm hover:border-blue-300 transition-colors"><strong>Key Partners</strong><p className="mt-2 text-slate-500 leading-tight">{result.bmc?.key_partners}</p></div>
                    <div className="col-span-1 row-span-1 border-2 rounded-lg p-4 bg-white shadow-sm hover:border-blue-300 transition-colors"><strong>Key Activities</strong><p className="mt-2 text-slate-500 leading-tight">{result.bmc?.key_activities}</p></div>
                    <div className="col-span-1 row-span-2 border-2 rounded-lg p-4 bg-blue-50 border-blue-200 shadow-sm"><strong>Value Prop</strong><p className="mt-2 text-blue-700 font-medium leading-tight">{result.bmc?.value_propositions}</p></div>
                    <div className="col-span-1 row-span-1 border-2 rounded-lg p-4 bg-white shadow-sm hover:border-blue-300 transition-colors"><strong>Relationships</strong><p className="mt-2 text-slate-500 leading-tight">{result.bmc?.customer_relationships}</p></div>
                    <div className="col-span-1 row-span-2 border-2 rounded-lg p-4 bg-white shadow-sm hover:border-blue-300 transition-colors"><strong>Segments</strong><p className="mt-2 text-slate-500 leading-tight">{result.bmc?.customer_segments}</p></div>
                    <div className="col-span-1 row-span-1 border-2 rounded-lg p-4 bg-white shadow-sm hover:border-blue-300 transition-colors"><strong>Key Resources</strong><p className="mt-2 text-slate-500 leading-tight">{result.bmc?.key_resources}</p></div>
                    <div className="col-span-1 row-span-1 border-2 rounded-lg p-4 bg-white shadow-sm hover:border-blue-300 transition-colors"><strong>Channels</strong><p className="mt-2 text-slate-500 leading-tight">{result.bmc?.channels}</p></div>
                    <div className="col-span-2 row-span-1 border-2 rounded-lg p-4 bg-slate-100 shadow-sm"><strong>Cost Structure</strong><p className="mt-2 text-slate-500 leading-tight">{result.bmc?.cost_structure}</p></div>
                    <div className="col-span-3 row-span-1 border-2 rounded-lg p-4 bg-slate-100 shadow-sm"><strong>Revenue Streams</strong><p className="mt-2 text-slate-500 leading-tight">{result.bmc?.revenue_streams}</p></div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default App;