import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { ErrorBanner, PulseOrb } from '../components/ui';

export default function PulseChat() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setMessages(await apiFetch('/api/pulse', {}, token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach Pulse');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setText('');
    setBusy(true);
    setError('');
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), user_id: '', role: 'user', content, created_at: new Date().toISOString() },
    ]);
    try {
      const reply = await apiFetch('/api/pulse', { method: 'POST', body: JSON.stringify({ content }) }, token);
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pulse is quiet right now');
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    await apiFetch('/api/pulse', { method: 'DELETE' }, token);
    setMessages([]);
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 flex flex-col min-h-[calc(100vh-2rem)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Your guide</p>
          <h1 className="font-display text-4xl mt-1">Pulse</h1>
          <p className="mt-1 text-sm text-forest/65">Calm, encouraging, intelligent, practical. Never a know-it-all.</p>
        </div>
        <button onClick={clear} className="text-xs text-forest/40 hover:text-forest transition-colors">Clear thread</button>
      </div>

      <div className="flex-1 mt-6 space-y-4">
        {loading && <p className="text-sm text-forest/50">Opening the field notebook…</p>}
        {!loading && !messages.length && (
          <div className="rounded-3xl bg-paper border border-ink/5 p-6 flex gap-4">
            <PulseOrb size={48} />
            <div>
              <p className="font-display text-xl">I am here when you are.</p>
              <p className="mt-2 text-sm text-forest/70 leading-relaxed">
                Tell me how much time you have, what you just saw, or that you feel nothing at all. We can start from any of those.
              </p>
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role !== 'user' && <div className="mr-2 mt-1"><PulseOrb size={32} /></div>}
            <div
              className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user' ? 'bg-forest text-cream rounded-br-md font-medium' : 'bg-paper border border-ink/5 text-ink rounded-bl-md'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-forest/50">
            <PulseOrb size={28} /> Pulse is considering…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}

      <form onSubmit={send} className="mt-4 sticky bottom-20 md:bottom-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask Pulse about what is around you…"
          className="flex-1 rounded-full bg-paper border border-ink/10 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-moss/20 text-ink placeholder:text-ink/35 transition-colors"
        />
        <button type="submit" disabled={busy || !text.trim()} className="rounded-full bg-forest text-cream w-12 h-12 flex items-center justify-center disabled:opacity-40 hover:bg-ink transition-colors cursor-pointer" aria-label="Send">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
