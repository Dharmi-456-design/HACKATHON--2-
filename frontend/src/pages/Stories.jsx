import { useCallback, useEffect, useState } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Card, Empty, ErrorBanner, PrimaryButton, Skeleton } from '../components/ui';

export default function Stories() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [stories, setStories] = useState([]);
  const [discoveries, setDiscoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [s, d] = await Promise.all([
        apiFetch('/api/stories', {}, token),
        apiFetch('/api/discoveries', {}, token),
      ]);
      setStories(Array.isArray(s) ? s : []);
      setDiscoveries(Array.isArray(d) ? d : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load stories');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const weave = async () => {
    setBusy(true);
    setError('');
    try {
      const story = await apiFetch('/api/stories', { method: 'POST', body: JSON.stringify({}) }, token);
      setStories((prev) => [story, ...prev]);
      setOpen(story);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Need more observations');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch('/api/stories', { method: 'DELETE', body: JSON.stringify({ id }) }, token);
      setStories((prev) => prev.filter((s) => s.id !== id));
      if (open?.id === id) setOpen(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Ecological story</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-1">Many observations, one living thread.</h1>
      <p className="mt-2 text-sm text-forest/65 max-w-2xl">
        Pulse weaves your recent field notes into a single narrative — only connecting what is plausible, and saying so when a link is uncertain.
      </p>

      <div className="mt-6 flex items-center gap-4">
        <PrimaryButton onClick={weave} disabled={busy || discoveries.length < 2}>
          <Sparkles size={14} /> {busy ? 'Listening across your notes…' : 'Weave a story'}
        </PrimaryButton>
        <p className="text-xs text-forest/50">{discoveries.length} observation{discoveries.length === 1 ? '' : 's'} in the thread</p>
      </div>
      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}

      {loading ? (
        <Skeleton className="h-64 mt-8" />
      ) : open ? (
        <Card className="mt-8 p-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-forest/40">{formatWhen(open.created_at)}</p>
          <h2 className="font-display text-3xl mt-1">{open.title}</h2>
          <div className="mt-6 space-y-4 text-[15px] leading-[1.75] text-ink/85 whitespace-pre-wrap">{open.narrative}</div>
          <button onClick={() => remove(open.id)} className="mt-6 text-xs text-forest/40 inline-flex items-center gap-1 hover:text-red-700 dark:hover:text-red-400 transition-colors">
            <Trash2 size={12} /> Release this story
          </button>
        </Card>
      ) : null}

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {!loading && !stories.length && (
          <Card className="sm:col-span-2">
            <Empty title="No stories yet" body="Save at least two observations in Nature Lens, then ask Pulse to find the thread between them." />
          </Card>
        )}
        {stories.map((s) => (
          <button key={s.id} onClick={() => setOpen(s)} className="text-left">
            <Card className={`p-5 transition-shadow ${open?.id === s.id ? 'ring-2 ring-gold/50' : ''}`}>
              <p className="text-[11px] uppercase tracking-[0.14em] text-forest/40">{formatWhen(s.created_at)}</p>
              <h3 className="font-display text-xl mt-1">{s.title}</h3>
              <p className="mt-2 text-sm text-forest/60 line-clamp-3">{s.narrative}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
