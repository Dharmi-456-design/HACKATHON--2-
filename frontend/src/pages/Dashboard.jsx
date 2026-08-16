import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, RefreshCw, MapPin, Clock, Leaf, Sun, Compass, Sparkles, Trophy, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, ConnectionRing, DimBars, GhostButton, PrimaryButton, Skeleton, TYPE_LABEL } from '../components/ui';
import BestTimeToExplore from '../components/BestTimeToExplore';

const SUNLIT_FOREST_IMG = 'https://plus.unsplash.com/premium_photo-1667076649924-d784d205cbba?auto=format&fit=crop&w=1600&q=80';

export default function Dashboard() {
  const { session, user } = useAuth();
  const token = session?.access_token;
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState({ observe: 78, explore: 65, learn: 82, act: 54, return_dim: 70, overall: 74 });
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
      setProfile(p && typeof p === 'object' ? p : null);
      setScore(s && typeof s === 'object' && s.overall !== undefined ? s : { observe: 78, explore: 65, learn: 82, act: 54, return_dim: 70, overall: 74 });
      setMissions(Array.isArray(m) ? m : []);
      setPlaces(Array.isArray(pl) ? pl : []);
      setDiscoveries(Array.isArray(d) ? d : []);
      setActions(Array.isArray(a) ? a : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your field');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const safeMissions = Array.isArray(missions) ? missions : [];
  const today = new Date().toISOString().slice(0, 10);
  const todayMissions = safeMissions.filter((m) => m && (m.scheduled_date === today || m.status !== 'completed')).slice(0, 4);
  const featured = todayMissions[0] || safeMissions[0];

  const generate = async () => {
    setBusy(true);
    try {
      const data = await apiFetch('/api/missions', { method: 'POST', body: JSON.stringify({ generate: true, force: true }) }, token);
      setMissions(Array.isArray(data) ? data : []);
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
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── SUNLIT FOREST LANDSCAPE HERO HEADER BANNER ──────────────── */}
        <div className="relative border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[280px] flex flex-col justify-between group">
          
          {/* HD Sunlit Emerald Forest Background Image (EXACT USER REQUEST URL) */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${SUNLIT_FOREST_IMG}')` }}
          />

          {/* Dark Atmospheric Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040C07] via-[#040C07]/85 to-[#040C07]/35" />

          {/* Left Text Content */}
          <div className="space-y-3 max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0E2015]/90 text-[#4ADE80] border border-[#4ADE80]/40 text-xs font-semibold backdrop-blur-md">
              <Leaf className="w-3.5 h-3.5" />
              NATURE RELATIONSHIP DASHBOARD
            </span>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              {greet}, <span className="text-[#4ADE80]">{profile?.display_name || user?.email?.split('@')[0] || 'Explorer'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed drop-shadow">
              {profile?.city ? `${profile.city}${profile.region ? ', ' + profile.region : ''} · ` : ''}
              Discover what is around you, why it matters, and your ecological impact before sunset.
            </p>
          </div>

          {/* Right Top Generate Missions Button */}
          <div className="relative z-10 pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#20422E]/80">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Flame className="w-4 h-4" /> 7 Day Streak
              </span>
              <span className="flex items-center gap-1.5 text-[#4ADE80]">
                <Trophy className="w-4 h-4" /> Level 4 Eco Explorer
              </span>
            </div>

            <button
              onClick={generate}
              disabled={busy}
              className="px-5 py-2.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
              <span>{busy ? 'Listening…' : 'New Missions'}</span>
            </button>
          </div>

        </div>

        {error && <p className="text-sm text-red-400 bg-red-950/50 border border-red-500/30 p-3 rounded-2xl">{error}</p>}

        {/* Best time to explore widget */}
        <div className="relative z-10">
          <BestTimeToExplore />
        </div>

        {/* ──────────────── MAIN DASHBOARD GRID ──────────────── */}
        <div className="grid lg:grid-cols-3 gap-6 relative z-10">
          
          {/* FEATURED TODAY'S MISSION CARD WITH SUNLIT FOREST IMAGE */}
          <div className="lg:col-span-2 bg-[#0E2015] border border-[#20452F] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="relative h-56 sm:h-64 overflow-hidden group">
              <img
                src={SUNLIT_FOREST_IMG}
                alt="Sunlit Forest"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E2015] via-[#0E2015]/40 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#4ADE80] bg-[#07130B]/80 px-3 py-1 rounded-full border border-[#4ADE80]/30 backdrop-blur-md">
                  Today's Featured Mission
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">
                  {featured?.title || 'Listen to Tree Canopy at Dawn'}
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {featured ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{TYPE_LABEL[featured.mission_type] || featured.mission_type || 'Exploration'}</Badge>
                    <Badge tone="ink">
                      <Clock size={10} className="mr-1 inline" /> {featured.duration_minutes || 15} min
                    </Badge>
                    <Badge tone="gold">{featured.status || 'in_progress'}</Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {featured.description || 'Find a shaded Peepal or Banyan canopy and observe dawn birdsong frequency.'}
                  </p>

                  {featured.why_it_matters && (
                    <p className="text-xs text-[#4ADE80] italic leading-relaxed bg-[#07150C] p-3 rounded-2xl border border-[#20422E]">
                      “{featured.why_it_matters}”
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={12} className="text-[#4ADE80]" />
                    <span>{featured.location_hint || 'Sabarmati Riverfront Park Sector B'}</span>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    {featured.status !== 'completed' && (
                      <PrimaryButton onClick={() => complete(featured.id)}>
                        <Check size={14} /> Mark Mission Completed
                      </PrimaryButton>
                    )}
                    <Link to="/app/lens" className="inline-flex items-center gap-2 rounded-full border border-[#20422E] bg-[#13271C] text-xs font-bold text-white px-5 py-2.5 hover:bg-[#1A3827] transition-all">
                      Open Nature Lens
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400">No active missions right now. Click "New Missions" to generate.</p>
              )}
            </div>
          </div>

          {/* NATURE CONNECTION RING CARD */}
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-between text-center space-y-4">
            <div className="w-full text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nature Connection</span>
              <h3 className="font-display text-xl font-bold text-white mt-0.5">Ecological Score</h3>
            </div>

            <ConnectionRing score={score} />

            <div>
              <p className="font-display text-4xl font-extrabold text-white">
                {score.overall}<span className="text-slate-400 text-lg font-normal">/100</span>
              </p>
              <p className="text-xs text-[#4ADE80] font-semibold mt-1">Commander Level 4</p>
            </div>

            <DimBars score={score} />
          </div>

          {/* MORE MISSIONS TODAY */}
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20452F] pb-3">
              <h3 className="font-display text-lg font-bold text-white">More For Today</h3>
              <Link to="/app/missions" className="text-xs text-[#4ADE80] hover:underline flex items-center gap-1 font-semibold">
                All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-3">
              {todayMissions.slice(1, 4).map((m) => (
                <div key={m.id} className="rounded-2xl bg-[#07150C] border border-[#20422E] p-3.5 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{m.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {TYPE_LABEL[m.mission_type] || m.mission_type} · {m.duration_minutes}m
                      </p>
                    </div>
                    {m.status !== 'completed' && (
                      <button onClick={() => complete(m.id)} className="text-[10px] font-bold text-[#4ADE80] hover:underline shrink-0">
                        Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!todayMissions.slice(1).length && (
                <p className="text-xs text-slate-400">Complete the featured mission to unlock more.</p>
              )}
            </div>
          </div>

          {/* NEARBY NATURE PLACES */}
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20452F] pb-3">
              <h3 className="font-display text-lg font-bold text-white">Nearby Nature</h3>
              <Link to="/app/places" className="text-xs text-[#4ADE80] hover:underline flex items-center gap-1 font-semibold">
                Map <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-3">
              {places.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-[#07150C] border border-[#20422E] p-2.5 rounded-2xl">
                  <img src={p.image_url || SUNLIT_FOREST_IMG} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-[#4ADE80] font-semibold">{p.type} · {p.walk_minutes || 10} min walk</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT DISCOVERIES */}
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20452F] pb-3">
              <h3 className="font-display text-lg font-bold text-white">Recent Discoveries</h3>
              <Link to="/app/lens" className="text-xs text-[#4ADE80] hover:underline flex items-center gap-1 font-semibold">
                Lens <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-3">
              {discoveries.slice(0, 3).map((d) => (
                <div key={d.id} className="bg-[#07150C] border border-[#20422E] p-3 rounded-2xl space-y-0.5">
                  <p className="text-xs font-bold text-white">{d.common_name}</p>
                  <p className="text-[10px] text-slate-400">{d.category} · {formatWhen(d.created_at)}</p>
                </div>
              ))}
              {!discoveries.length && (
                <p className="text-xs text-slate-400">Photograph species nearby using Nature Lens.</p>
              )}
            </div>
          </div>

          {/* ENVIRONMENTAL ACTIONS WIDGET */}
          <div className="lg:col-span-3 bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#20452F] pb-3">
              <h3 className="font-display text-lg font-bold text-white">Environmental Action Engine</h3>
              <Link to="/app/act" className="text-xs text-[#4ADE80] hover:underline flex items-center gap-1 font-semibold">
                Engine <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {actions.slice(0, 4).map((a) => (
                <div key={a.id} className="rounded-2xl bg-[#07150C] border border-[#20422E] p-4 space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1A3827] text-[10px] font-bold text-[#4ADE80]">
                    {a.category}
                  </span>
                  <p className="text-xs font-bold text-white">{a.title}</p>
                  <p className="text-[10px] text-slate-400">{a.minutes} min · {a.status}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
