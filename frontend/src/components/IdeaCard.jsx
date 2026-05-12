import React from 'react';
import { Eye, Heart, Sparkles } from 'lucide-react';

const getSector = (idea) => {
  const analysis = idea.analysis || {};
  return analysis.sector || analysis.target_market || idea.slogan || 'Startup';
};

const countFromId = (id, seed) => ((Number(id) || 7) * seed) % 900 + 30;

const IdeaCard = ({ idea, tall = false }) => {
  return (
    <article className={`break-inside-avoid mb-5 rounded-xl border border-slate-800 bg-slate-900/65 backdrop-blur-xl p-5 shadow-2xl shadow-slate-950/30 hover:border-slate-700 transition-all ${tall ? 'min-h-72' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-200">
          <Sparkles size={12} />
          <span className="truncate">{getSector(idea)}</span>
        </span>
      </div>
      <h3 className="mt-4 text-xl font-black tracking-tight text-white">{idea.name}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{idea.description}</p>
      <div className="mt-5 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><Heart size={14} /> {countFromId(idea.id, 17)}</span>
        <span className="flex items-center gap-1.5"><Eye size={14} /> {countFromId(idea.id, 41)}</span>
      </div>
    </article>
  );
};

export default IdeaCard;
