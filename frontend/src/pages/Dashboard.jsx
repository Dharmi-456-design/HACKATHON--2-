import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, RefreshCw, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, ConnectionRing, DimBars, GhostButton, PrimaryButton, Skeleton, TYPE_LABEL } from '../components/ui';
import BestTimeToExplore from '../components/BestTimeToExplore';

export default function Dashboard() {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState({ observe: 0, explore: 0, learn: 0, act: 0, return_dim: 0, overall: 0 });
  const [missions, setMissions] = useState([]);
  const [places, setPlaces] = useState([]);
  const [discoveries, setDiscoveries] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const [p, s, m, pl, d, a] = await Promise.all([
        apiFetch('/api/profile', {}, token),
        apiFetch('/api/connection', {}, token),
        apiFetch('/api/missions', {}, token),
        apiFetch('/api/places'),
        apiFetch('/api/discoveries', {}, token),
        apiFetch('/api/actions', {}, token),
      ]);
      setProfile(p);
      setScore(s);
      setMissions(m);
      setPlaces(pl);
      setDiscoveries(d);
      setActions(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your field');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date().toISOString().slice(0, 10);
  const todayMissions = missions.filter((m) => m.scheduled_date === today || m.status !== 'completed').slice(0, 4);
  const featured = todayMissions[0] || missions[0];

  const generate = async () => {
    setBusy(true);
    try {
      const data = await apiFetch('/api/missions', { method: 'POST', body: JSON.stringify({ generate: true, force: true }) }, token);
      setMissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pulse could not write missions');
    } finally {
      setBusy(false);
    }
  };

  const complete = async (id) => {
    try {
      await apiFetch('/api/missions', { method: 'PUT', body: JSON.stringify({ id, status: 'completed' }) }, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-8 grid lg:grid-cols-3 gap-5">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Nature relationship</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-1">
            {greet}, {profile?.display_name || user?.email?.split('@')[0] || 'friend'}.
          </h1>
          <p className="mt-2 text-sm text-forest/65 max-w-xl">
            {profile?.city ? `${profile.city}${profile.region ? ', ' + profile.region : ''} · ` : ''}
            What is around you, why it matters, and one thing you can do before the light changes.
          </p>
        </div>
        <GhostButton onClick={generate} disabled={busy}>
          <RefreshCw size={14} className={busy ? 'animate-spin' : ''} /> {busy ? 'Listening…' : 'New missions'}
        </GhostButton>
      </div>

      {error && <p className="mb-4 text-sm text-red-700 dark:text-red-400">{error}</p>}

      {/* Best time to explore widget */}
      <div className="mb-5">
        <BestTimeToExplore />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="relative h-52 sm:h-64">
            <img
              src="https://dvxrhkgloakisnvqoxgl.supabase.co/storage/v1/object/sign/images/inputs/1786808413899_1pcncccji.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80NWE1YWU1ZS0xNzg4LTRiMWYtYWM5OC1hMjgwNmQ2OTM4ZWMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvaW5wdXRzLzE3ODY4MDg0MTM4OTlfMXBjbmNjY2ppLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODY4MDg5ODIsImV4cCI6MTgxODM0NDk4Mn0.0Ig-JmpQrf_s8c2c2O9hCM-51kgfuWgJs59jHHUPc2E"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-cream">
              <p className="text-[11px] uppercase tracking-[0.2em] text-cream/70">Today’s mission</p>
              <h2 className="font-display text-3xl mt-1">{featured?.title || 'Ask Pulse for a first step'}</h2>
            </div>
          </div>
          <div className="p-6">
            {featured ? (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge>{TYPE_LABEL[featured.mission_type] || featured.mission_type}</Badge>
                  <Badge tone="ink">
                    <Clock size={10} className="mr-1" /> {featured.duration_minutes} min
                  </Badge>
                  <Badge tone="gold">{featured.status}</Badge>
                </div>
                <p className="text-sm text-forest/75 leading-relaxed">{featured.description}</p>
                {featured.why_it_matters && (
                  <p className="mt-3 text-sm text-ink/80 italic leading-relaxed">“{featured.why_it_matters}”</p>
                )}
                <p className="mt-3 text-xs text-forest/50 flex items-center gap-1">
                  <MapPin size={12} /> {featured.location_hint}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {featured.status !== 'completed' && (
                    <PrimaryButton onClick={() => complete(featured.id)}>
                      <Check size={14} /> I did this
                    </PrimaryButton>
                  )}
                  <Link to="/app/lens" className="inline-flex items-center gap-2 rounded-full border border-forest/20 text-forest px-5 py-2.5 text-sm hover:bg-mist/40 transition-colors">
                    Open Nature Lens
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-forest/65">No missions yet. Ask Pulse to write a few from your city and time.</p>
            )}
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-forest/45 self-start">Nature Connection</p>
          <ConnectionRing score={score} />
          <p className="font-display text-xl -mt-1 mb-4">
            {score.overall}<span className="text-forest/40 text-base">/100</span>
          </p>
          <DimBars score={score} />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl">More for today</h3>
          </div>
          <div className="space-y-3">
            {todayMissions.slice(1, 4).map((m) => (
              <div key={m.id} className="rounded-2xl bg-cream px-4 py-3 border border-ink/5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-forest/45 mt-1">
                      {TYPE_LABEL[m.mission_type] || m.mission_type} · {m.duration_minutes}m
                    </p>
                  </div>
                  {m.status !== 'completed' && (
                    <button onClick={() => complete(m.id)} className="text-xs text-forest underline shrink-0 hover:opacity-80">Done</button>
                  )}
                </div>
              </div>
            ))}
            {!todayMissions.slice(1).length && <p className="text-sm text-forest/50">Complete the featured mission, then generate more.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl">Nearby nature</h3>
            <Link to="/app/places" className="text-xs text-forest flex items-center gap-1 hover:underline">Map <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-3">
            {places.slice(0, 3).map((p) => (
              <div key={p.id} className="flex gap-3">
                <img src={p.image_url} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-forest/55">{p.type} · {p.walk_minutes} min walk</p>
                  <p className="text-xs text-forest/45 truncate">{p.habitat}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl">Recent discoveries</h3>
            <Link to="/app/lens" className="text-xs text-forest flex items-center gap-1 hover:underline">Lens <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-3">
            {discoveries.slice(0, 3).map((d) => (
              <div key={d.id}>
                <p className="text-sm font-medium">{d.common_name}</p>
                <p className="text-xs text-forest/50">{d.category} · {formatWhen(d.created_at)} · {d.confidence}</p>
              </div>
            ))}
            {!discoveries.length && <p className="text-sm text-forest/50">Nothing saved yet. Photograph something ordinary.</p>}
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl">Environmental actions</h3>
            <Link to="/app/act" className="text-xs text-forest flex items-center gap-1 hover:underline">Engine <ArrowRight size={12} /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.slice(0, 4).map((a) => (
              <div key={a.id} className="rounded-2xl bg-cream p-4 border border-ink/5">
                <Badge>{a.category}</Badge>
                <p className="mt-2 text-sm font-medium">{a.title}</p>
                <p className="mt-1 text-xs text-forest/50">{a.minutes} min · {a.status}</p>
              </div>
            ))}
            {!actions.length && (
              <p className="text-sm text-forest/50 col-span-full">Generate actions that fit the time you actually have.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
