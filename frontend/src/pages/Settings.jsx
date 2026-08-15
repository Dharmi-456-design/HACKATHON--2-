import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, INTERESTS } from '../lib/api';
import { Card, ErrorBanner, Field, PrimaryButton, inputCls } from '../components/ui';

export default function Settings() {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/profile', {}, token).then(setProfile).catch((e) => setError(e.message));
  }, [token]);

  const toggle = (i) => {
    if (!profile) return;
    const interests = profile.interests?.includes(i)
      ? profile.interests.filter((x) => x !== i)
      : [...(profile.interests || []), i];
    setProfile({ ...profile, interests });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    if (!profile.display_name?.trim() || !profile.city?.trim()) {
      setError('Name and city are required. We still will not store a street.');
      return;
    }
    setBusy(true);
    setError('');
    setSaved('');
    try {
      const next = await apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(profile) }, token);
      setProfile(next);
      setSaved('Saved. Pulse will use this the next time it writes a mission.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  if (!profile) return <div className="p-10 text-sm text-forest/50">Loading your profile…</div>;

  return (
    <div className="max-w-xl mx-auto px-5 py-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Settings</p>
      <h1 className="font-display text-4xl mt-1">How Pulse knows you</h1>
      <p className="mt-2 text-sm text-forest/60">City and region only. {user?.email}</p>
      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="space-y-4">
          {error && <ErrorBanner message={error} />}
          {saved && <div className="rounded-2xl bg-mist/60 text-forest text-sm px-4 py-3 border border-ink/5">{saved}</div>}
          <Field label="Display name">
            <input className={inputCls} value={profile.display_name || ''} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input className={inputCls} value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            </Field>
            <Field label="Region">
              <input className={inputCls} value={profile.region || ''} onChange={(e) => setProfile({ ...profile, region: e.target.value })} />
            </Field>
          </div>
          <Field label={`Usual time — ${profile.available_minutes || 20} min`}>
            <input type="range" min={8} max={90} value={profile.available_minutes || 20} onChange={(e) => setProfile({ ...profile, available_minutes: Number(e.target.value) })} className="w-full accent-forest cursor-pointer" />
          </Field>
          <Field label="A sentence about your relationship with place">
            <textarea className={inputCls + ' min-h-[80px]'} value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </Field>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button key={i} type="button" onClick={() => toggle(i)} className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${(profile.interests || []).includes(i) ? 'bg-forest text-cream border-forest font-medium' : 'border-ink/10 text-forest hover:bg-mist/40'}`}>
                {i}
              </button>
            ))}
          </div>
          <PrimaryButton type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</PrimaryButton>
        </form>
      </Card>
    </div>
  );
}
