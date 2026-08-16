import { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, GhostButton, PrimaryButton, Skeleton } from '../components/ui';

export default function Act() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [actions, setActions] = useState([]);
  const [minutes, setMinutes] = useState(15);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/api/actions', {}, token);
      setActions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load actions');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const generate = async () => {
    setBusy(true);
    setError('');
    try {
      const data = await apiFetch('/api/actions', { method: 'POST', body: JSON.stringify({ generate: true, minutes }) }, token);
      setActions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate');
    } finally {
      setBusy(false);
    }
  };

  const complete = async (id) => {
    try {
      await apiFetch('/api/actions', { method: 'PUT', body: JSON.stringify({ id, status: 'completed' }) }, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update');
    }
  };

  const safeActions = Array.isArray(actions) ? actions : [];
  const suggested = safeActions.filter((a) => a && a.status !== 'completed');
  const done = safeActions.filter((a) => a && a.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Environmental action engine</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-1">Do what fits the time you actually have.</h1>
      <p className="mt-2 text-sm text-forest/65 max-w-2xl">
        Modest, legal, local. No petitions, no distant offsets. Pulse scales suggestions to your window — two minutes or forty.
      </p>

      <Card className="mt-8 p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-forest/45">Available minutes</p>
          <p className="font-display text-4xl mt-1">{minutes}</p>
          <input type="range" min={2} max={60} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-full accent-forest mt-2 cursor-pointer" />
        </div>
        <PrimaryButton onClick={generate} disabled={busy}>
          <RefreshCw size={14} className={busy ? 'animate-spin' : ''} /> {busy ? 'Composing…' : 'Generate actions'}
        </PrimaryButton>
      </Card>

      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}

      {loading ? (
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-40" /><Skeleton className="h-40" />
        </div>
      ) : !actions.length ? (
        <Card className="mt-6"><Empty title="No actions yet" body="Tell Pulse how many minutes you have. It will answer with things you can finish today." /></Card>
      ) : (
        <>
          <h2 className="font-display text-2xl mt-10 mb-4">Suggested</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {suggested.map((a) => (
              <Card key={a.id} className="p-5">
                <div className="flex items-center justify-between">
                  <Badge>{a.category}</Badge>
                  <span className="text-xs text-forest/45">{a.minutes} min</span>
                </div>
                <h3 className="font-display text-2xl mt-3">{a.title}</h3>
                <p className="mt-2 text-sm text-forest/70 leading-relaxed">{a.description}</p>
                {a.impact_note && <p className="mt-3 text-xs text-ink/70 italic">{a.impact_note}</p>}
                <GhostButton className="mt-4" onClick={() => complete(a.id)}>
                  <Check size={14} /> I did this
                </GhostButton>
              </Card>
            ))}
          </div>
          {!!done.length && (
            <>
              <h2 className="font-display text-2xl mt-10 mb-4">Returned to the field</h2>
              <div className="space-y-2">
                {done.map((a) => (
                  <div key={a.id} className="rounded-2xl bg-paper border border-ink/5 px-4 py-3 text-sm flex justify-between items-center">
                    <span>{a.title}</span>
                    <span className="text-forest/40 text-xs">done</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
