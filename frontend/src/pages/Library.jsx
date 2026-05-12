import React, { useEffect, useState } from 'react';
import { Library as LibraryIcon } from 'lucide-react';
import api from '../api';
import IdeaCard from '../components/IdeaCard';

const Library = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ideas/history/')
      .then((response) => setIdeas(response.data))
      .catch((error) => console.error('Library fetch error', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-blue-300">Library</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Your saved blueprints.</h1>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
        <h2 className="flex items-center gap-2 font-black text-white">
          <LibraryIcon size={18} className="text-blue-300" /> Private Archive
        </h2>
        <div className="mt-5 columns-1 md:columns-2 xl:columns-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="break-inside-avoid mb-5 h-48 rounded-xl border border-slate-800 bg-slate-950/60 animate-pulse" />
            ))
            : ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
        </div>
      </section>
    </div>
  );
};

export default Library;
