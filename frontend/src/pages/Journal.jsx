import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, BookOpen, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Field, PrimaryButton, Skeleton, inputCls } from '../components/ui';

const MOODS = ['quiet', 'curious', 'weathered', 'tender', 'alert'];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function TimelineEntry({ entry, index, type }) {
  return (
    <motion.div
      className="relative pl-10"
      initial={prefersReducedMotion() ? {} : { opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: 0 }}
      viewport={{ once: true, margin: '-50px' }}
    >
      {/* Dot on line */}
      <div className="absolute left-0 top-3 w-3 h-3 rounded-full bg-forest/25 border-2 border-paper ring-2 ring-forest/10" />
      {/* Icon badge */}
      <div className="absolute left-[-3px] top-[7px] w-3.5 h-3.5 rounded-full bg-paper flex items-center justify-center">
        {type === 'discovery' ? <Camera size={7} className="text-forest" /> : <Check size={7} className="text-forest" />}
      </div>
      {entry}
    </motion.div>
  );
}

export default function Journal() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [entries, setEntries] = useState([]);
  const [discoveries, setDiscoveries] = useState([]);
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
      const [j, d] = await Promise.all([
        apiFetch('/api/journal', {}, token),
        apiFetch('/api/discoveries', {}, token),
      ]);
      setEntries(j);
      setDiscoveries(d.slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load journal');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) { setError('Write a few sentences about what you noticed.'); return; }
    setBusy(true);
    setError('');
    try {
      await apiFetch('/api/journal', { method: 'POST', body: JSON.stringify({ title: title || 'Field note', body, mood, weather }) }, token);
      setTitle(''); setBody(''); setWeather('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally { setBusy(false); }
  };

  const remove = async (id) => {
    try {
      await apiFetch('/api/journal', { method: 'DELETE', body: JSON.stringify({ id }) }, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
    }
  };

  // Merge journal entries + discoveries into a timeline
  const timeline = [
    ...entries.map((e) => ({ ...e, _type: 'journal', _date: e.created_at })),
    ...discoveries.map((d) => ({ ...d, _type: 'discovery', _date: d.created_at })),
  ].sort((a, b) => new Date(b._date) - new Date(a._date));

  return (
    <motion.div
      className="max-w-3xl mx-auto px-5 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion() ? 0 : 0.3 }}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Nature Journal</p>
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
                  <button key={m} type="button" onClick={() => setMood(m)}
                    className={`rounded-full px-3 py-1 text-xs border transition-colors ${mood === m ? 'bg-forest text-cream border-forest font-medium' : 'border-ink/10 text-forest hover:bg-mist/40'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <PrimaryButton type="submit" disabled={busy}>{busy ? 'Saving…' : 'Keep this note'}</PrimaryButton>
        </form>
      </Card>

      {/* Timeline */}
      <h2 className="font-display text-2xl mt-10 mb-6">Your nature timeline</h2>
      {loading ? (
        <div className="space-y-4"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      ) : timeline.length === 0 ? (
        <Card>
          <Empty
            title="The timeline is empty"
            body="Write after a walk, or make your first discovery with Nature Lens."
            action={<Link to="/app/lens" className="inline-flex items-center gap-2 rounded-full bg-forest text-cream px-5 py-2.5 text-sm font-medium hover:bg-ink transition-colors"><Camera size={14} /> Open Nature Lens</Link>}
          />
        </Card>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[5px] top-0 bottom-0 w-0.5 bg-mist" />
          <div className="space-y-5">
            {timeline.map((item, i) => (
              <TimelineEntry
                key={`${item._type}-${item.id}`}
                index={i}
                type={item._type}
                entry={
                  item._type === 'journal' ? (
                    <Card className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.14em] text-forest/40">
                            <BookOpen size={9} className="inline mr-1" />
                            {formatWhen(item.created_at)} · {item.mood} {item.weather && `· ${item.weather}`}
                          </p>
                          <h3 className="font-display text-xl mt-1">{item.title}</h3>
                        </div>
                        <button onClick={() => remove(item.id)} className="text-forest/40 hover:text-red-700 transition-colors shrink-0">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-forest/75 leading-relaxed whitespace-pre-wrap line-clamp-4">{item.body}</p>
                    </Card>
                  ) : (
                    <Card className="p-4 flex gap-3">
                      {item.image_url && <img src={item.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-forest/40">
                          <Camera size={9} className="inline mr-1" />
                          Discovery · {formatWhen(item.created_at)}
                        </p>
                        <p className="font-display text-lg mt-0.5 truncate">{item.common_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge tone={item.confidence === 'high' ? 'sage' : 'warn'}>{item.confidence}</Badge>
                          <span className="text-xs text-forest/45">{item.category}</span>
                        </div>
                      </div>
                    </Card>
                  )
                }
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
