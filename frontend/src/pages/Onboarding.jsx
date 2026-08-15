import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, INTERESTS } from '../lib/api';
import { PulseOrb, Field, inputCls, PrimaryButton, ErrorBanner } from '../components/ui';
import ThemeToggle from '../components/ThemeToggle';

export default function Onboarding() {
  const { session } = useAuth();
  const nav = useNavigate();
  const token = session?.access_token;
  const [name, setName] = useState('');
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
      .catch(() => {});
  }, [token, nav]);

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
      await apiFetch('/api/missions', { method: 'POST', body: JSON.stringify({ generate: true, minutes }) }, token).catch(() => {});
      nav('/app');
    } catch (err) {
      nav('/app');
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
        <PrimaryButton type="submit" disabled={busy} className="w-full mt-8">
          {busy ? 'Preparing your first missions…' : 'Enter the field'}
        </PrimaryButton>
      </form>
    </div>
  );
}
