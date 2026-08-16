import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, INTERESTS } from '../lib/api';
import { PulseOrb, Field, inputCls, PrimaryButton, ErrorBanner } from '../components/ui';
import ThemeToggle from '../components/ThemeToggle';

export default function Onboarding() {
  const { token, user } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState('Portland');
  const [region, setRegion] = useState('Oregon');
  const [minutes, setMinutes] = useState(20);
  const [interests, setInterests] = useState(['urban wild', 'trees & bark']);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/profile', {}, token)
      .then((p) => {
        if (p.onboarding_complete) nav('/app', { replace: true });
        if (p.display_name) setName(p.display_name);
        if (p.city) setCity(p.city);
        if (p.region) setRegion(p.region);
      })
      .catch(() => setError('Could not load your profile. You can still set it up here.'));
  }, [token, nav]);

  const handleSkip = async () => {
    try {
      await apiFetch(
        '/api/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            display_name: name.trim() || 'Explorer',
            city: city.trim() || 'Portland',
            region: region.trim() || 'Oregon',
            available_minutes: minutes,
            interests,
            onboarding_complete: true,
          }),
        },
        token
      );
    } catch {}
    nav('/app', { replace: true });
  };

  const toggle = (i) => {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !city.trim()) {
      setError('A name and a city are enough to begin. We never store a street address.');
      return;
    }
    setBusy(true);
    try {
      await apiFetch(
        '/api/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            display_name: name.trim(),
            city: city.trim(),
            region: region.trim(),
            available_minutes: minutes,
            interests,
            onboarding_complete: true,
          }),
        },
        token
      );
      try {
        await apiFetch('/api/missions', { method: 'POST', body: JSON.stringify({ generate: true, minutes }) }, token);
      } catch {
        setError('Your profile was saved, but we could not generate starter missions right now. You can create missions anytime from the Missions page.');
        await new Promise((r) => setTimeout(r, 1200));
      }
      nav('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ink flex items-center justify-center px-5 py-16 relative">
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>
      <form onSubmit={submit} className="w-full max-w-lg bg-paper rounded-[28px] shadow-lift border border-ink/5 p-8 transition-colors">
        <PulseOrb size={52} />
        <h1 className="font-display text-4xl mt-4">Where should Pulse meet you?</h1>
        <p className="mt-2 text-sm text-forest/65 leading-relaxed">
          City and region only. Never a pin, never a street. This is enough to suggest nearby habitats and honest missions.
        </p>
        {error && <div className="mt-4"><ErrorBanner message={error} /></div>}
        <div className="mt-6 space-y-4">
          <Field label="What should we call you">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="First name or a field name" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label="Region">
              <input className={inputCls} value={region} onChange={(e) => setRegion(e.target.value)} />
            </Field>
          </div>
          <Field label={`Time you often have — ${minutes} minutes`}>
            <input type="range" min={8} max={90} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="w-full accent-forest cursor-pointer" />
          </Field>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-forest/55 mb-2">What pulls your attention</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                    interests.includes(i) ? 'bg-forest text-cream border-forest font-medium' : 'border-ink/10 text-forest hover:bg-mist/40'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-3">
          <PrimaryButton type="submit" disabled={busy} className="w-full">
            {busy ? 'Preparing your first missions…' : 'Enter the field →'}
          </PrimaryButton>
          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-xs text-forest/50 hover:text-forest transition-colors py-2 cursor-pointer"
          >
            Skip for now &amp; go directly to Dashboard →
          </button>
        </div>
      </form>
    </div>
  );
}
