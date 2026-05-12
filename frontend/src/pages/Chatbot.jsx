import React, { useEffect, useState } from 'react';
import { Bot, Loader2, Send } from 'lucide-react';
import api from '../api';

const Chatbot = () => {
  const [ideas, setIdeas] = useState([]);
  const [ideaId, setIdeaId] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/ideas/history/')
      .then((response) => {
        setIdeas(response.data);
        if (response.data[0]) setIdeaId(String(response.data[0].id));
      })
      .catch((error) => console.error('Chatbot idea fetch error', error));
  }, []);

  useEffect(() => {
    if (!ideaId) return;
    api.get(`/ideas/${ideaId}/chat/`)
      .then((response) => setMessages(response.data))
      .catch(() => setMessages([]));
  }, [ideaId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !ideaId) return;
    const text = message;
    setMessage('');
    setBusy(true);
    try {
      const response = await api.post(`/ideas/${ideaId}/chat/`, { message: text });
      setMessages((current) => [...current, response.data.user, response.data.assistant]);
    } catch (error) {
      alert(error.response?.data?.error || 'Chat failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-blue-300">Contextual Chatbot</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Refine a saved concept.</h1>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between mb-5">
          <h2 className="flex items-center gap-2 font-black text-white"><Bot size={18} className="text-blue-300" /> Idea Chat</h2>
          <select value={ideaId} onChange={(e) => setIdeaId(e.target.value)} className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white">
            {ideas.map((idea) => <option key={idea.id} value={idea.id}>{idea.name}</option>)}
          </select>
        </div>

        <div className="min-h-96 max-h-[34rem] overflow-y-auto space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          {!messages.length && <p className="text-sm text-slate-500">Select an idea and ask how to improve pricing, marketing, costs, or positioning.</p>}
          {messages.map((item) => (
            <div key={item.id} className={`max-w-3xl rounded-xl p-4 ${item.role === 'user' ? 'ml-auto bg-blue-500/15 text-blue-100 border border-blue-400/20' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>
              <p className="text-xs font-bold uppercase text-slate-500 mb-1">{item.role}</p>
              <p className="whitespace-pre-wrap text-sm leading-6">{item.content}</p>
            </div>
          ))}
          {busy && <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">Thinking...</div>}
        </div>

        <form onSubmit={sendMessage} className="mt-4 flex gap-3">
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about this idea..." className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-white" />
          <button disabled={busy || !message.trim()} className="rounded-lg bg-blue-500 px-5 text-white disabled:opacity-60">
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Chatbot;
