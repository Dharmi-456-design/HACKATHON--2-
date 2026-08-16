import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { Camera, Save, Share2, Trash2, RefreshCw, Leaf, Eye, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, uploadImage, fileToResizedBase64, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Field, GhostButton, PrimaryButton, Skeleton, inputCls } from '../components/ui';
import ShareCard from '../components/ShareCard';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Animated count-up number
function CountUp({ target, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) { setDisplay(target); return; }
    let start = null;
    const from = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(Math.round(from + (target - from) * progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <span>{display}</span>;
}

// Scanning overlay line
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-0.5 bg-forest/70 shadow-[0_0_8px_2px_rgba(27,58,44,0.4)]"
      initial={{ top: '0%' }}
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// Confidence ring using SVG
function ConfidenceRing({ pct }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const color = pct >= 80 ? '#1B3A2C' : pct >= 50 ? '#C4A35A' : '#991B1B';
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" className="text-cream-deep" strokeWidth="8" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: prefersReducedMotion() ? 0 : 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-xl leading-none"><CountUp target={pct} /></p>
        <p className="text-[9px] uppercase tracking-[0.16em] text-forest/50">%</p>
      </div>
    </div>
  );
}

// Look Closer step card
function LookCloserStep({ step, onNext, isLast }) {
  const [elapsed, setElapsed] = useState(0);
  const dur = step.duration_seconds;
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => setElapsed((p) => Math.min(p + 1, dur)), 1000);
    return () => clearInterval(t);
  }, [dur]);
  const pct = (elapsed / dur) * 100;
  return (
    <div className="rounded-2xl bg-mist/30 border border-ink/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Eye size={14} className="text-forest/60" />
        <p className="text-[11px] uppercase tracking-[0.16em] text-forest/55">Step {step.step} · {step.title}</p>
      </div>
      <p className="text-sm text-forest/80 leading-relaxed">{step.instruction}</p>
      <div className="mt-3 h-1 bg-cream-deep rounded-full overflow-hidden">
        <motion.div className="h-full bg-forest/50 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-forest/40">{Math.max(0, dur - elapsed)}s remaining</p>
        <button onClick={onNext} className="text-xs text-forest underline hover:opacity-70">
          {isLast ? 'Done ✓' : 'Next step →'}
        </button>
      </div>
    </div>
  );
}

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  },
};

export default function Lens() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [discoveries, setDiscoveries] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [filePayload, setFilePayload] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [notes, setNotes] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [coachMode, setCoachMode] = useState(false);
  const [lookStep, setLookStep] = useState(0);
  const [showShare, setShowShare] = useState(false);

  // STATE: 'capture' | 'scanning' | 'result'
  const state = !preview ? 'capture' : analyzing ? 'scanning' : analysis ? 'result' : 'capture';

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [d, p] = await Promise.all([
        apiFetch('/api/discoveries', {}, token),
        apiFetch('/api/profile', {}, token),
      ]);
      setDiscoveries(d);
      setProfile(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load discoveries');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const onFile = async (file) => {
    if (!file) return;
    setError('');
    setAnalysis(null);
    setLookStep(0);
    try {
      const payload = await fileToResizedBase64(file);
      setFilePayload(payload);
      setPreview(`data:${payload.mime};base64,${payload.base64}`);
    } catch {
      setError('That file could not be read as an image.');
    }
  };

  const analyze = async () => {
    if (!filePayload) return;
    setAnalyzing(true);
    setError('');
    try {
      const data = await apiFetch('/api/analyze', {
          method: 'POST',
          body: JSON.stringify({ imageBase64: filePayload.base64, contentType: filePayload.mime, city: profile?.city, note: notes }),
        }, token);
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pulse could not read this image');
    } finally {
      setAnalyzing(false);
    }
  };

  const save = async () => {
    if (!filePayload) return;
    setSaving(true);
    setError('');
    try {
      const up = await uploadImage({ base64: filePayload.base64, mime: filePayload.mime, fileName: filePayload.name, token });
      const created = await apiFetch('/api/discoveries', {
        method: 'POST',
        body: JSON.stringify({
          image_url: up.url,
          common_name: analysis?.common_name || 'Unnamed observation',
          scientific_name: analysis?.scientific_name || '',
          confidence: analysis?.confidence || 'uncertain',
          category: analysis?.category || 'other',
          description: analysis?.description || notes,
          why_it_matters: analysis?.why_it_matters || '',
          experience_suggestion: analysis?.experience_suggestion || '',
          notes, place_name: placeName, city: profile?.city || '',
          is_public: isPublic, raw_analysis: analysis,
        }),
      }, token);
      if (isPublic) {
        await apiFetch('/api/community', {
          method: 'POST',
          body: JSON.stringify({
            common_name: created.common_name, scientific_name: created.scientific_name,
            category: created.category, note: notes || analysis?.description,
            image_url: up.url, confidence: created.confidence, city: profile?.city,
          }),
        }, token).catch(() => {});
      }
      setPreview(''); setFilePayload(null); setAnalysis(null);
      setNotes(''); setPlaceName(''); setIsPublic(false); setLookStep(0);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/api/discoveries/${id}`, { method: 'DELETE' }, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
    }
  };

  const reset = () => {
    setPreview(''); setFilePayload(null); setAnalysis(null);
    setError(''); setLookStep(0);
  };

  const isLowConfidence = analysis && (analysis.confidence === 'low' || !analysis.identified);

  return (
    <motion.div
      className="max-w-6xl mx-auto px-5 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion() ? 0 : 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Nature Lens</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-1">Look carefully. Name only what you know.</h1>
          <p className="mt-2 text-sm text-forest/65 max-w-2xl">
            Pulse reads the photograph and returns structured notes. Low confidence stays unnamed.
          </p>
        </div>
      </div>

      {error && <div className="mt-5"><ErrorBanner message={error} /></div>}

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        {/* LEFT: Capture / Scanning / Result image area */}
        <div>
          <AnimatePresence mode="wait">

            {/* STATE A: Capture */}
            {state === 'capture' && (
              <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="p-6">
                  <label className="block border-2 border-dashed border-forest/20 rounded-3xl bg-cream/60 hover:bg-mist/30 cursor-pointer overflow-hidden transition-colors">
                    <div className="h-72 flex flex-col items-center justify-center text-forest/55 gap-3">
                      {/* Pulsing glow ring button */}
                      <div className="relative flex items-center justify-center">
                        <span className="absolute inset-0 rounded-full bg-forest/10 animate-pulse-ring" style={{ width: 80, height: 80 }} />
                        <span className="absolute inset-0 rounded-full bg-forest/8 animate-pulse-ring" style={{ width: 80, height: 80, animationDelay: '0.9s' }} />
                        <div className="relative w-20 h-20 rounded-full bg-forest flex items-center justify-center shadow-lg">
                          <Camera size={28} className="text-cream" />
                        </div>
                      </div>
                      <p className="text-sm">Drop a field photograph or tap to choose</p>
                      <p className="text-xs">JPG or PNG · resized on your device</p>
                    </div>
                    <input type="file" accept="image/*" capture="environment" className="sr-only"
                      onChange={(e) => onFile(e.target.files?.[0])} />
                  </label>
                  <div className="mt-4 space-y-3">
                    <Field label="Place name — park, river, neighborhood">
                      <input className={inputCls} value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder="Forest Park, backyard maple, temple garden" />
                    </Field>
                    <Field label="What you noticed in your own words">
                      <textarea className={inputCls + ' min-h-[80px]'} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Three true details are better than a guess." />
                    </Field>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-2 text-sm text-forest/70 cursor-pointer">
                        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-forest cursor-pointer" />
                        Share to community
                      </label>
                      <label className="flex items-center gap-2 text-sm text-forest/70 cursor-pointer">
                        <input type="checkbox" checked={coachMode} onChange={(e) => setCoachMode(e.target.checked)} className="accent-forest cursor-pointer" />
                        <Lightbulb size={13} /> Photo tips
                      </label>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STATE B: Scanning */}
            {state === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="overflow-hidden">
                  <div className="relative">
                    <img src={preview} alt="Scanning" className="w-full h-72 object-cover" />
                    <div className="absolute inset-0 bg-ink/10" />
                    <ScanLine />
                  </div>
                  <div className="p-6 flex flex-col items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                      <Leaf size={22} className="text-forest" />
                    </motion.div>
                    <div className="flex items-center gap-1.5 text-sm text-forest/70">
                      <span>Identifying</span>
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i} animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.33 }}
                          className="w-1 h-1 rounded-full bg-forest inline-block"
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STATE C: Result */}
            {state === 'result' && analysis && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="overflow-hidden">
                  <div className="relative">
                    <img src={preview} alt={analysis.common_name} className="w-full h-48 object-cover" />
                    <button onClick={reset} className="absolute top-3 right-3 bg-ink/40 text-cream rounded-full p-1.5 hover:bg-ink/60 transition-colors">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <div className="p-6">
                    {isLowConfidence ? (
                      <div className="text-center py-6">
                        <p className="font-display text-2xl">Not sure — try a clearer photo</p>
                        <p className="text-sm text-forest/65 mt-2 max-w-xs mx-auto">
                          {analysis.uncertainty_note || 'Confidence is too low for a reliable identification.'}
                        </p>
                        {analysis.photo_coach_tip && (
                          <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-left">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-amber-700 mb-1"><Lightbulb size={11} className="inline mr-1" />Photo tip</p>
                            <p className="text-sm text-amber-900">{analysis.photo_coach_tip}</p>
                          </div>
                        )}
                        <button onClick={reset} className="mt-4 text-sm text-forest underline hover:opacity-70">Try again</button>
                      </div>
                    ) : (
                      <motion.div variants={stagger.container} initial="initial" animate="animate">
                        <motion.div variants={stagger.item} className="flex flex-wrap gap-2 mb-3">
                          <Badge tone={analysis.confidence === 'high' ? 'sage' : 'warn'}>{analysis.confidence}</Badge>
                          <Badge tone="ink">{analysis.category}</Badge>
                        </motion.div>
                        <motion.h2 variants={stagger.item} className="font-display text-3xl">{analysis.common_name}</motion.h2>
                        {analysis.scientific_name && (
                          <motion.p variants={stagger.item} className="italic text-sm text-forest/55 mt-1">{analysis.scientific_name}</motion.p>
                        )}
                        <motion.div variants={stagger.item} className="mt-4 flex justify-center">
                          <ConfidenceRing pct={analysis.confidence_pct || (analysis.confidence === 'high' ? 90 : analysis.confidence === 'medium' ? 65 : 35)} />
                        </motion.div>
                        <motion.div variants={stagger.item} className="mt-4 rounded-2xl bg-cream p-4 border border-ink/5">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-forest/45">Why this matters</p>
                          <p className="mt-1 text-sm leading-relaxed">{analysis.why_it_matters}</p>
                        </motion.div>
                        {analysis.experience_suggestion && (
                          <motion.div variants={stagger.item} className="mt-3 rounded-2xl bg-mist/40 p-4 border border-ink/5">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-forest/45">Experience it</p>
                            <p className="mt-1 text-sm leading-relaxed">{analysis.experience_suggestion}</p>
                          </motion.div>
                        )}
                        {analysis.photo_coach_tip && coachMode && (
                          <motion.div variants={stagger.item} className="mt-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-amber-700 mb-1"><Lightbulb size={11} className="inline mr-1" />Photo Coach</p>
                            <p className="text-sm text-amber-900">{analysis.photo_coach_tip}</p>
                          </motion.div>
                        )}
                        <motion.div variants={stagger.item} className="mt-5 flex flex-wrap gap-2">
                          <PrimaryButton onClick={save} disabled={!filePayload || saving}>
                            <Save size={14} /> {saving ? 'Saving…' : 'Save to Journal'}
                          </PrimaryButton>
                          <GhostButton onClick={() => setShowShare(true)}>
                            <Share2 size={14} /> Share Card
                          </GhostButton>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyze button (shown when image loaded but not yet analyzing/result) */}
          {preview && !analyzing && !analysis && (
            <div className="mt-3 flex flex-wrap gap-2">
              <PrimaryButton onClick={analyze} disabled={!filePayload || analyzing}>
                {analyzing ? 'Pulse is looking…' : 'Ask Pulse to read this'}
              </PrimaryButton>
              <GhostButton onClick={save} disabled={!filePayload || saving}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save observation'}
              </GhostButton>
            </div>
          )}

          {/* Look Closer steps */}
          {state === 'result' && analysis?.look_closer_steps?.length > 0 && !isLowConfidence && lookStep < analysis.look_closer_steps.length && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-forest/45 mb-2"><Eye size={11} className="inline mr-1" />Look Closer Experience</p>
              <LookCloserStep
                step={analysis.look_closer_steps[lookStep]}
                onNext={() => setLookStep((p) => Math.min(p + 1, analysis.look_closer_steps.length))}
                isLast={lookStep === analysis.look_closer_steps.length - 1}
              />
            </div>
          )}
        </div>

        {/* RIGHT: Your field record */}
        <div>
          <h2 className="font-display text-2xl mb-4">Your field record</h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-48" /><Skeleton className="h-48" />
            </div>
          ) : discoveries.length === 0 ? (
            <Card><Empty title="No discoveries yet" body="The first useful observation is often a weed, a crow, or a puddle." /></Card>
          ) : (
            <motion.div
              className="space-y-3 max-h-[600px] overflow-y-auto pr-1"
              variants={stagger.container} initial="initial" animate="animate"
            >
              {discoveries.map((d) => (
                <motion.div key={d.id} variants={stagger.item}>
                  <Card className="overflow-hidden flex gap-0">
                    {d.image_url && <img src={d.image_url} alt="" className="h-24 w-24 object-cover shrink-0" />}
                    <div className="p-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge tone={d.confidence === 'high' ? 'sage' : 'warn'}>{d.confidence}</Badge>
                        {d.is_public && <Share2 size={11} className="text-forest/40" />}
                      </div>
                      <h3 className="font-display text-lg truncate">{d.common_name}</h3>
                      <p className="text-xs text-forest/50 mt-0.5">{d.place_name || d.city} · {formatWhen(d.created_at)}</p>
                      <button onClick={() => remove(d.id)} className="mt-2 text-xs text-forest/50 inline-flex items-center gap-1 hover:text-red-700 transition-colors">
                        <Trash2 size={11} /> Remove
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Share Card Modal */}
      <AnimatePresence>
        {showShare && analysis && (
          <ShareCard
            discovery={{ ...analysis, image_url: preview }}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
