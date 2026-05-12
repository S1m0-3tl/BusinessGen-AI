import React, { useState } from 'react';
import { Loader2, Search, Upload } from 'lucide-react';
import api from '../api';

const MarketInsights = () => {
  const [file, setFile] = useState(null);
  const [sourceName, setSourceName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [statusText, setStatusText] = useState('');
  const [busy, setBusy] = useState(false);

  const uploadReport = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setStatusText('');
    try {
      const body = new FormData();
      body.append('file', file);
      if (sourceName) body.append('source_name', sourceName);
      const response = await api.post('/market-reports/ingest/', body);
      setStatusText(`Indexed ${response.data.chunks_indexed} chunks from ${response.data.source}`);
    } catch (error) {
      setStatusText(error.response?.data?.error || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const searchReports = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    try {
      const response = await api.post('/market-reports/search/', { query });
      setResults(response.data.results || []);
    } catch (error) {
      setStatusText(error.response?.data?.error || 'Search failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-blue-300">Market Insights</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Ground ideas in your reports.</h1>
        <p className="mt-3 text-slate-400">Upload PDF, TXT, MD, or CSV market reports and search the indexed knowledge base.</p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={uploadReport} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="flex items-center gap-2 font-black text-white"><Upload size={18} className="text-blue-300" /> Upload Report</h2>
          <input type="file" accept=".pdf,.txt,.md,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300" />
          <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Source name" className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-white" />
          <button disabled={busy || !file} className="w-full rounded-lg bg-blue-500 px-4 py-3 font-black text-white flex items-center justify-center gap-2 disabled:opacity-60">
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} Index Report
          </button>
          {statusText && <p className="text-sm text-slate-400">{statusText}</p>}
        </form>

        <form onSubmit={searchReports} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="flex items-center gap-2 font-black text-white"><Search size={18} className="text-blue-300" /> Search Reports</h2>
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="student fitness pricing Morocco 2026" className="min-h-32 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-white" />
          <button disabled={busy || !query.trim()} className="w-full rounded-lg border border-slate-700 px-4 py-3 font-black text-white flex items-center justify-center gap-2 disabled:opacity-60">
            <Search size={18} /> Search Knowledge Base
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {results.map((item, index) => (
          <article key={`${item.source}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-xs font-bold uppercase text-blue-300">{item.source}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default MarketInsights;
