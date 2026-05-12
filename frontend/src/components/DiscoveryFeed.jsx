import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Flame, Layers } from 'lucide-react';
import api from '../api';
import IdeaCard from './IdeaCard';

const FeedSkeleton = () => (
  <div className="break-inside-avoid mb-5 rounded-xl border border-slate-800 bg-slate-900/50 p-5 animate-pulse">
    <div className="h-6 w-28 rounded-full bg-slate-800" />
    <div className="mt-5 h-6 w-3/4 rounded bg-slate-800" />
    <div className="mt-4 space-y-2">
      <div className="h-3 rounded bg-slate-800" />
      <div className="h-3 w-5/6 rounded bg-slate-800" />
      <div className="h-3 w-2/3 rounded bg-slate-800" />
    </div>
  </div>
);

const DiscoveryFeed = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ideas/public/')
      .then((res) => setIdeas(res.data))
      .catch((err) => console.error('Public feed error', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 backdrop-blur-xl p-6 lg:p-8 overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1 text-xs font-bold text-blue-200">
              <Flame size={14} /> Community Feed
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl lg:text-6xl font-black tracking-tight text-white">
              Discover startup blueprints from the BusinessGen community.
            </h1>
            <p className="mt-4 max-w-2xl text-slate-400 leading-7">
              Browse public concepts, market-backed ideas, and AI-generated business models from other founders.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-72">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-3xl font-black text-white">{ideas.length || '--'}</p>
              <p className="text-sm text-slate-500">public ideas</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-3xl font-black text-white">2026</p>
              <p className="text-sm text-slate-500">market lens</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-black text-white">
          <Layers size={18} className="text-blue-300" /> Trending Ideas
        </h2>
        <button
          type="button"
          onClick={() => document.getElementById('trending-ideas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"
        >
          Explore all <ArrowUpRight size={16} />
        </button>
      </div>

      <section id="trending-ideas" className="columns-1 md:columns-2 xl:columns-3 gap-5 scroll-mt-24">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <FeedSkeleton key={index} />)
          : ideas.map((idea, index) => <IdeaCard key={idea.id} idea={idea} tall={index % 3 === 1} />)}
      </section>
    </div>
  );
};

export default DiscoveryFeed;
