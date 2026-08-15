import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Card, Empty, ErrorBanner, Field, PrimaryButton, Skeleton, inputCls } from '../components/ui';

const MOODS = ['quiet', 'curious', 'weathered', 'tender', 'alert'];

export default function Journal() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('quiet');
  const [weather, setWeather] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setEntries(await apiFetch('/api/journal', {}, token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load journal');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) {
      setError('Write a few sentences about what you noticed.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiFetch('/api/journal', { method: 'POST', body: JSON.stringify({ title: title || 'Field note', body, mood, weather }) }, token);
      setTitle('');
      setBody('');
      setWeather('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch('/api/journal', { method: 'DELETE', body: JSON.stringify({ id }) }, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Private journal</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-1">A place to return in words.</h1>
      <p className="mt-2 text-sm text-forest/65">Only you can read these notes. They feed Learn and Return in your Nature Connection.</p>

      <Card className="mt-8 p-6">
        <form onSubmit={submit} className="space-y-4">
          {error && <ErrorBanner message={error} />}
          <Field label="Title">
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The maple after rain" />
          </Field>
          <Field label="Field note">
            <textarea className={inputCls + ' min-h-[140px]'} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What changed. What stayed. What you almost missed." />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Weather">
              <input className={inputCls} value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="Low cloud, wet bark" />
            </Field>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-forest/55 mb-1.5">Mood</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button key={m} type="button" onClick={() => setMood(m)} className={`rounded-full px-3 py-1 text-xs border transition-colors ${mood === m ? 'bg-forest text-cream border-forest font-medium' : 'border-ink/10 text-forest hover:bg-mist/40'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <PrimaryButton type="submit" disabled={busy}>{busy ? 'Saving…' : 'Keep this note'}</PrimaryButton>
        </form>
      </Card>

      <div className="mt-8 space-y-4">
        {loading && <Skeleton className="h-32" />}
        {!loading && !entries.length && <Card><Empty title="The notebook is empty" body="Write after a walk, even a short one. Returning in language is part of returning in place." /></Card>}
        {entries.map((e) => (
          <Card key={e.id} className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-forest/40">{formatWhen(e.created_at)} · {e.mood} {e.weather && `· ${e.weather}`}</p>
                <h3 className="font-display text-2xl mt-1">{e.title}</h3>
              </div>
              <button onClick={() => remove(e.id)} className="text-forest/40 hover:text-red-700 dark:hover:text-red-400 transition-colors" aria-label="Delete entry"><Trash2 size={16} /></button>
            </div>
            <p className="mt-3 text-sm text-forest/75 leading-relaxed whitespace-pre-wrap">{e.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
