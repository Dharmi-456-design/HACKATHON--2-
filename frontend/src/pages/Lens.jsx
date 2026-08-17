import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { 
  Camera, Save, Share2, Trash2, RefreshCw, Leaf, Eye, Lightbulb, 
  Upload, Download, Video, VideoOff, SwitchCamera, X, Check, 
  Sparkles, Loader2, Image as ImageIcon, AlertCircle, ArrowLeft,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, uploadImage, fileToResizedBase64, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Field, FallbackImg, GhostButton, PrimaryButton, Skeleton, inputCls } from '../components/ui';
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

  const [selectedShareItem, setSelectedShareItem] = useState(null);

  // Camera Capture State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [isFlashing, setIsFlashing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startCamera = async (mode = facingMode) => {
    setCameraError('');
    setCameraLoading(true);
    setIsCameraOpen(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Live browser camera is not supported on this browser. Use the native capture button.');
      setCameraLoading(false);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setFacingMode(mode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {}
      }
    } catch (err) {
      console.warn('Camera stream access notice:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser or choose a photo from your gallery.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device found on this system.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is currently in use by another app. Please close other camera tabs and retry.');
      } else {
        setCameraError('Could not start live camera. You can use the Native Camera button below or upload a photo.');
      }
    } finally {
      setCameraLoading(false);
    }
  };

  const switchCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCameraLoading(false);
    setCameraError('');
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const base64Data = dataUrl.split(',')[1];
    const fileName = `nature_capture_${Date.now()}.jpg`;

    const payload = {
      base64: base64Data,
      mime: 'image/jpeg',
      name: fileName,
    };

    setFilePayload(payload);
    setPreview(dataUrl);
    setAnalysis(null);
    setLookStep(0);
    setError('');

    // Save capture to local storage history on device
    try {
      const existing = JSON.parse(localStorage.getItem('pulse_lens_recent_captures') || '[]');
      const newRec = { id: `cap-${Date.now()}`, dataUrl, timestamp: new Date().toISOString() };
      const updated = [newRec, ...existing.slice(0, 9)];
      localStorage.setItem('pulse_lens_recent_captures', JSON.stringify(updated));
    } catch {}

    stopCamera();
  };

  const downloadCapturedPhoto = () => {
    if (!preview) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = filePayload?.name || 'NaturePulse_Observation.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const retakePhoto = () => {
    setPreview('');
    setFilePayload(null);
    setAnalysis(null);
    setError('');
    startCamera('environment');
  };

  const load = useCallback(async () => {
    try {
      const savedLocal = localStorage.getItem('pulse_user_lens_discoveries');
      let localList = [];
      if (savedLocal) {
        try { localList = JSON.parse(savedLocal); } catch {}
      }

      if (token) {
        const [d, p] = await Promise.all([
          apiFetch('/api/discoveries', {}, token).catch(() => []),
          apiFetch('/api/profile', {}, token).catch(() => null),
        ]);
        setProfile(p);
        if (Array.isArray(d)) {
          // Keep items created by user or tagged as user uploads
          const myUploads = d
            .filter((x) => x.is_my_upload || x.user_id || localList.some((l) => l.id === (x.id || x._id)))
            .map((x) => ({ ...x, id: x.id || x._id }));
          
          const combined = [...localList, ...myUploads.filter((m) => !localList.some((l) => l.id === m.id))];
          setDiscoveries(combined);
          localStorage.setItem('pulse_user_lens_discoveries', JSON.stringify(combined));
        } else {
          setDiscoveries(localList);
        }
      } else {
        setDiscoveries(localList);
      }
    } catch {
      setError('');
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

  const [saveSuccess, setSaveSuccess] = useState('');

  const save = async () => {
    if ((!filePayload && !preview) || !analysis) return;
    setSaving(true);
    setError('');
    setSaveSuccess('');
    try {
      let imageUrl = preview;
      if (filePayload) {
        const up = await uploadImage({ base64: filePayload.base64, mime: filePayload.mime, fileName: filePayload.name, token }).catch(() => null);
        if (up?.url) imageUrl = up.url;
      }
      
      let created = null;
      if (token) {
        created = await apiFetch('/api/discoveries', {
          method: 'POST',
          body: JSON.stringify({
            image_url: imageUrl,
            common_name: analysis?.common_name || 'Outdoor Observation',
            scientific_name: analysis?.scientific_name || '',
            confidence: analysis?.confidence || 'high',
            confidence_pct: Number.isFinite(Number(analysis?.confidence_pct))
              ? Math.max(0, Math.min(100, Math.round(Number(analysis.confidence_pct))))
              : 90,
            category: analysis?.category || 'plant',
            description: analysis?.description || notes || 'Captured via Nature Lens camera scanner.',
            why_it_matters: analysis?.why_it_matters || 'Urban ecology sanctuary observation.',
            experience_suggestion: analysis?.experience_suggestion || '',
            notes, place_name: placeName || 'Sabarmati Nature Corridor', city: profile?.city || 'Ahmedabad',
            is_public: isPublic, raw_analysis: analysis,
          }),
        }, token).catch(() => null);
      }

      const newItem = {
        ...(created || {}),
        id: created?._id || created?.id || `disc-${Date.now()}`,
        image_url: imageUrl,
        common_name: analysis?.common_name || 'Outdoor Observation',
        scientific_name: analysis?.scientific_name || '',
        confidence: analysis?.confidence || 'high',
        place_name: placeName || 'Sabarmati Nature Corridor',
        city: profile?.city || 'Ahmedabad',
        created_at: new Date().toISOString(),
        is_my_upload: true,
      };

      setDiscoveries((prev) => {
        const updated = [newItem, ...prev.filter((x) => (x.id || x._id) !== newItem.id)];
        localStorage.setItem('pulse_user_lens_discoveries', JSON.stringify(updated));
        return updated;
      });

      // ──────────────── DIRECT JOURNAL SYNC ────────────────
      const speciesTitle = analysis?.common_name
        ? `Observed: ${analysis.common_name}`
        : 'Field Observation Note';

      let journalBody = '';
      if (analysis?.common_name) {
        journalBody += `Species: ${analysis.common_name}`;
        if (analysis.scientific_name) journalBody += ` (${analysis.scientific_name})`;
        journalBody += `\nConfidence: ${analysis.confidence_pct || 90}% (${analysis.confidence || 'High'})\n`;
      }
      if (placeName) {
        journalBody += `Location: ${placeName}\n`;
      }
      if (notes) {
        journalBody += `\nObserver Notes:\n${notes}\n`;
      }
      if (analysis?.description && analysis.description !== notes) {
        journalBody += `\nBotanical Analysis:\n${analysis.description}\n`;
      }
      if (analysis?.why_it_matters) {
        journalBody += `\nEcological Importance:\n${analysis.why_it_matters}\n`;
      }
      if (analysis?.experience_suggestion) {
        journalBody += `\nObservation Suggestion:\n${analysis.experience_suggestion}\n`;
      }
      if (!journalBody.trim()) {
        journalBody = 'Field specimen photograph captured and logged into personal nature journal.';
      }

      const journalPayload = {
        title: speciesTitle,
        body: journalBody,
        mood: analysis?.category === 'birds' ? 'Sunlit Meadow' : 'Quiet Canopy',
        weather: '26°C · Field Observation',
        place_name: placeName || profile?.city || 'Sabarmati Nature Corridor',
        image_url: imageUrl,
      };

      // 1. Post to backend /api/journal
      if (token) {
        await apiFetch('/api/journal', {
          method: 'POST',
          body: JSON.stringify(journalPayload),
        }, token).catch((err) => console.warn('Could not post to /api/journal:', err));
      }

      // 2. Save locally into np_journal_entries
      try {
        const localJournals = JSON.parse(localStorage.getItem('np_journal_entries') || '[]');
        const newJournalEntry = {
          id: `j-${Date.now()}`,
          title: journalPayload.title,
          body: journalPayload.body,
          mood: journalPayload.mood,
          weather: journalPayload.weather,
          place_name: journalPayload.place_name,
          image_url: imageUrl,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          createdAt: new Date().toISOString(),
          wordCount: journalPayload.body.split(/\s+/).length,
          aiReflection: `Key Theme: ${analysis?.common_name || 'Observation'}`,
        };
        const updatedJournals = [newJournalEntry, ...localJournals.filter((j) => j.id !== newJournalEntry.id)];
        localStorage.setItem('np_journal_entries', JSON.stringify(updatedJournals));
      } catch {}

      if (isPublic && token) {
        await apiFetch('/api/community', {
          method: 'POST',
          body: JSON.stringify({
            common_name: newItem.common_name, scientific_name: newItem.scientific_name,
            category: newItem.category || 'plant', note: notes || analysis?.description,
            image_url: imageUrl, confidence: newItem.confidence, city: profile?.city || 'Ahmedabad',
          }),
        }, token).catch(() => {});
      }

      setSaveSuccess('Saved successfully to your Journal and Field Record! 📖✨');
      setTimeout(() => setSaveSuccess(''), 4000);

      setPreview(''); setFilePayload(null); setAnalysis(null);
      setNotes(''); setPlaceName(''); setIsPublic(false); setLookStep(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save observation');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setDiscoveries((prev) => {
      const filtered = prev.filter((x) => x.id !== id && x._id !== id);
      localStorage.setItem('pulse_user_lens_discoveries', JSON.stringify(filtered));
      return filtered;
    });
    if (token) {
      apiFetch(`/api/discoveries/${id}`, { method: 'DELETE' }, token).catch(() => {});
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
            Pulse reads the photograph and returns structured notes with an honest confidence level.
          </p>
        </div>
      </div>

      {error && <div className="mt-5"><ErrorBanner message={error} /></div>}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2.5 text-sm font-semibold shadow-md"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{saveSuccess}</span>
        </motion.div>
      )}

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        {/* LEFT: Capture / Scanning / Result image area */}
        <div>
          <AnimatePresence mode="wait">

            {/* STATE A: Capture */}
            {state === 'capture' && (
              <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="p-6 space-y-4">
                  {/* Two Main Actions: Click Photo & Upload Photo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* BUTTON 1: Click Photo */}
                    <button
                      type="button"
                      onClick={() => startCamera('environment')}
                      className="py-6 px-5 rounded-2xl bg-forest hover:bg-forest-light text-cream font-bold text-base flex flex-col items-center justify-center gap-2 shadow-xl shadow-forest/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-forest/30 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-cream/15 group-hover:bg-cream/25 flex items-center justify-center text-gold transition-colors">
                        <Camera size={24} />
                      </div>
                      <div className="text-center">
                        <p className="font-extrabold text-sm sm:text-base">Click Photo</p>
                        <p className="text-[11px] font-normal text-cream/70">Open live rear camera</p>
                      </div>
                    </button>

                    {/* BUTTON 2: Upload Photo */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-6 px-5 rounded-2xl bg-cream/90 hover:bg-mist/60 text-forest font-bold text-base flex flex-col items-center justify-center gap-2 shadow-lg shadow-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-forest/20 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-forest/10 group-hover:bg-forest/15 flex items-center justify-center text-forest transition-colors">
                        <Upload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="font-extrabold text-sm sm:text-base text-forest">Upload Photo</p>
                        <p className="text-[11px] font-normal text-forest/70">Choose from device or gallery</p>
                      </div>
                    </button>

                    {/* Hidden file inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => onFile(e.target.files?.[0])}
                    />
                    <input
                      ref={nativeCameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => onFile(e.target.files?.[0])}
                    />
                  </div>

                  <div className="mt-4 space-y-3 pt-2 border-t border-ink/5">
                    <Field label="Place name — park, river, neighborhood">
                      <input className={inputCls} value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder="Sabarmati Riverfront, Parimal Garden, Peepal canopy" />
                    </Field>
                    <Field label="What you noticed in your own words">
                      <textarea className={inputCls + ' min-h-[70px]'} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="E.g., Smooth serrated leaves, reddish underside, nesting songbird nearby." />
                    </Field>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <label className="flex items-center gap-2 text-xs font-medium text-forest/70 cursor-pointer">
                        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-forest cursor-pointer" />
                        Share to community
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-forest/70 cursor-pointer">
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
                      <span>Analyzing Botanical Telemetry</span>
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
                    <img src={preview} alt={analysis.common_name} className="w-full h-56 object-cover" />
                    
                    {/* Top Action Overlay Bar */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        onClick={downloadCapturedPhoto}
                        title="Download / Save Photo to Device"
                        className="bg-ink/50 text-cream rounded-full p-2 hover:bg-ink/75 transition-colors cursor-pointer backdrop-blur-xs"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        onClick={retakePhoto}
                        title="Retake Photograph"
                        className="bg-ink/50 text-cream rounded-full p-2 hover:bg-ink/75 transition-colors cursor-pointer backdrop-blur-xs flex items-center gap-1 text-xs font-medium"
                      >
                        <RefreshCw size={15} />
                        <span className="hidden sm:inline text-[11px]">Retake</span>
                      </button>
                      <button
                        onClick={reset}
                        title="Close"
                        className="bg-ink/50 text-cream rounded-full p-2 hover:bg-ink/75 transition-colors cursor-pointer backdrop-blur-xs"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {isLowConfidence && (
                      <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 p-3.5">
                        <p className="text-sm text-amber-900 font-semibold flex items-center gap-1.5">
                          <AlertCircle size={15} className="text-amber-700" />
                          <span>Not sure — this is a best guess</span>
                        </p>
                        <p className="text-sm text-amber-900 mt-1">
                          {analysis.uncertainty_note || 'Confidence is too low for a reliable identification.'}
                        </p>
                        <button onClick={retakePhoto} className="mt-2 text-xs font-semibold text-amber-800 underline hover:opacity-70 cursor-pointer">
                          Retake with a clearer, closer photo →
                        </button>
                      </div>
                    )}
                    <motion.div variants={stagger.container} initial="initial" animate="animate">
                      <motion.div variants={stagger.item} className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge tone={analysis.confidence === 'high' ? 'sage' : 'warn'}>
                          {analysis.confidence === 'high' ? 'High Confidence' : analysis.confidence === 'medium' ? 'Medium Confidence' : 'Low Confidence'}
                        </Badge>
                        <Badge tone="ink">{analysis.category || 'botanical'}</Badge>
                      </motion.div>

                      {/* Accurate Common Name / Title */}
                      <motion.h2 variants={stagger.item} className="font-display text-3xl sm:text-4xl font-extrabold text-forest tracking-tight leading-tight">
                        {analysis.common_name || 'Field Observation Specimen'}
                      </motion.h2>

                      {/* Accurate Scientific Name */}
                      {analysis.scientific_name && (
                        <motion.p variants={stagger.item} className="italic text-base text-forest/65 mt-1 font-serif">
                          {analysis.scientific_name}
                        </motion.p>
                      )}

                      {isLowConfidence && (
                        <motion.p variants={stagger.item} className="text-[11px] uppercase tracking-[0.16em] text-amber-700 mt-2 font-semibold">
                          Best guess — unconfirmed candidate
                        </motion.p>
                      )}

                      {/* Confidence Meter */}
                      <motion.div variants={stagger.item} className="mt-4 flex justify-center">
                        <ConfidenceRing pct={analysis.confidence_pct || (analysis.confidence === 'high' ? 90 : analysis.confidence === 'medium' ? 65 : 35)} />
                      </motion.div>

                      {/* Botanical Description & Visible Features */}
                      {analysis.description && (
                        <motion.div variants={stagger.item} className="mt-4 rounded-2xl bg-cream p-4 sm:p-5 border border-ink/5 space-y-2">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-forest/50 font-bold">
                            Description & Visible Features
                          </p>
                          <p className="text-sm leading-relaxed text-forest/90">
                            {analysis.description}
                          </p>
                          {Array.isArray(analysis.visible_features) && analysis.visible_features.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {analysis.visible_features.map((feat, idx) => (
                                <span key={idx} className="px-2.5 py-1 rounded-full bg-forest/10 text-forest text-[11px] font-medium">
                                  🌿 {feat}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Why it Matters */}
                      {analysis.why_it_matters && (
                        <motion.div variants={stagger.item} className="mt-3 rounded-2xl bg-mist/30 p-4 sm:p-5 border border-ink/5">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-forest/50 font-bold">
                            Why this matters
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-forest/90">
                            {analysis.why_it_matters}
                          </p>
                        </motion.div>
                      )}

                      {/* User Field Notes */}
                      {notes && (
                        <motion.div variants={stagger.item} className="mt-3 rounded-2xl bg-cream/70 p-4 border border-ink/5">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-forest/50 font-bold">
                            Your Field Notes
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-forest/80 italic">
                            "{notes}"
                          </p>
                        </motion.div>
                      )}

                      {analysis.experience_suggestion && (
                        <motion.div variants={stagger.item} className="mt-3 rounded-2xl bg-mist/40 p-4 border border-ink/5">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-forest/50 font-bold">
                            Experience it
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-forest/90">
                            {analysis.experience_suggestion}
                          </p>
                        </motion.div>
                      )}

                      {analysis.photo_coach_tip && (isLowConfidence || coachMode) && (
                        <motion.div variants={stagger.item} className="mt-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-amber-700 mb-1 font-semibold">
                            <Lightbulb size={12} className="inline mr-1" />Photo Coach
                          </p>
                          <p className="text-sm text-amber-900">{analysis.photo_coach_tip}</p>
                        </motion.div>
                      )}

                      {/* ──────────────── ACTION BUTTONS (APPEARS AFTER ASK PULSE DONE) ──────────────── */}
                      <motion.div variants={stagger.item} className="mt-6 flex flex-wrap gap-2.5 pt-3 border-t border-ink/5">
                        <PrimaryButton onClick={save} disabled={!filePayload || saving} className="shadow-lg shadow-forest/20">
                          <Save size={15} /> {saving ? 'Saving…' : 'Save to Journal'}
                        </PrimaryButton>
                        <GhostButton onClick={downloadCapturedPhoto}>
                          <Download size={15} /> Save to Device
                        </GhostButton>
                        <GhostButton onClick={() => setShowShare(true)}>
                          <Share2 size={15} /> Share Card
                        </GhostButton>
                      </motion.div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Photo Loaded Preview & Actions (Shown when image loaded but not yet analyzing/result) */}
          {preview && !analyzing && !analysis && (
            <Card className="p-4 mt-3 space-y-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] max-h-64 bg-black flex items-center justify-center">
                <img src={preview} alt="Observation Preview" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={downloadCapturedPhoto}
                    title="Download Photo"
                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    title="Retake Photo"
                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <RefreshCw size={14} />
                    <span>Retake</span>
                  </button>
                </div>
              </div>

              {/* Only Ask Pulse to Identify & Retake appear here (Save to Journal appears after analysis) */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <PrimaryButton onClick={analyze} disabled={!filePayload || analyzing} className="flex-1 sm:flex-none justify-center">
                  <Sparkles size={15} /> {analyzing ? 'Pulse is analyzing…' : 'Ask Pulse to Identify'}
                </PrimaryButton>
                <GhostButton onClick={retakePhoto}>
                  <Camera size={15} /> Retake
                </GhostButton>
              </div>
            </Card>
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
                    {d.image_url && <FallbackImg src={d.image_url} alt="" className="h-24 w-24 object-cover shrink-0" />}
                    <div className="p-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge tone={d.confidence === 'high' ? 'sage' : 'warn'}>{d.confidence}</Badge>
                        {d.is_public && <Share2 size={11} className="text-forest/40" />}
                      </div>
                      <h3 className="font-display text-lg truncate">{d.common_name}</h3>
                      <p className="text-xs text-forest/50 mt-0.5">{d.place_name || d.city} · {formatWhen(d.created_at)}</p>
                      <div className="mt-2.5 flex items-center gap-3">
                        <button onClick={() => remove(d.id)} className="text-xs text-red-500/80 font-medium inline-flex items-center gap-1 hover:text-red-600 transition-colors cursor-pointer">
                          <Trash2 size={12} /> Remove
                        </button>
                        <button onClick={() => setSelectedShareItem(d)} className="text-xs text-[#4ADE80] font-medium inline-flex items-center gap-1 hover:underline transition-colors cursor-pointer">
                          <Share2 size={12} /> Share Card
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
          >
            {/* Top Control Bar */}
            <div className="w-full max-w-2xl flex items-center justify-between z-20 text-white pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold backdrop-blur-xs"
              >
                <X size={16} />
                <span>Close</span>
              </button>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs border border-white/15">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
                <span>{facingMode === 'environment' ? 'Rear Macro Lens' : 'Front Lens'}</span>
              </div>

              <button
                type="button"
                onClick={switchCameraFacing}
                className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors cursor-pointer"
                title="Switch Camera (Rear / Front)"
              >
                <SwitchCamera size={18} />
              </button>
            </div>

            {/* Camera Viewport Canvas */}
            <div className="relative w-full max-w-2xl aspect-[4/3] sm:aspect-[16/9] max-h-[65vh] rounded-3xl overflow-hidden bg-black flex items-center justify-center border-2 border-white/20 shadow-2xl my-auto">
              {cameraLoading && (
                <div className="flex flex-col items-center gap-3 text-white/90 z-20">
                  <Loader2 size={36} className="animate-spin text-[#4ADE80]" />
                  <p className="text-sm font-semibold">Starting Live Lens…</p>
                  <p className="text-xs text-white/60">Requesting rear camera access</p>
                </div>
              )}

              {cameraError && (
                <div className="p-6 text-center max-w-md space-y-4 text-white z-20">
                  <AlertCircle size={40} className="mx-auto text-amber-400" />
                  <p className="text-sm font-medium leading-relaxed">{cameraError}</p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        nativeCameraInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs cursor-pointer shadow-md"
                    >
                      Use Native Camera App
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-xs cursor-pointer"
                    >
                      Upload File
                    </button>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  cameraLoading || cameraError ? 'opacity-0' : 'opacity-100'
                } ${facingMode === 'user' ? '-scale-x-100' : ''}`}
              />

              {/* Viewfinder Grid & Focus Brackets */}
              {!cameraLoading && !cameraError && (
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-t-2 border-l-2 border-[#4ADE80] rounded-tl-lg" />
                    <div className="w-8 h-8 border-t-2 border-r-2 border-[#4ADE80] rounded-tr-lg" />
                  </div>
                  <div className="self-center flex flex-col items-center gap-1 opacity-80">
                    <div className="w-14 h-14 border border-white/60 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-white/90 font-semibold drop-shadow-md">
                      Center Specimen
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-b-2 border-l-2 border-[#4ADE80] rounded-bl-lg" />
                    <div className="w-8 h-8 border-b-2 border-r-2 border-[#4ADE80] rounded-br-lg" />
                  </div>
                </div>
              )}

              {/* White flash on capture */}
              {isFlashing && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 bg-white z-30"
                />
              )}
            </div>

            {/* Bottom Control Bar */}
            <div className="w-full max-w-2xl flex items-center justify-center gap-6 pb-4 z-20">
              {!cameraError && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  disabled={cameraLoading}
                  onClick={capturePhoto}
                  className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1.5 shadow-2xl transition-all cursor-pointer disabled:opacity-50 group"
                  title="Capture Photograph"
                >
                  <div className="w-full h-full rounded-full bg-white group-hover:bg-[#4ADE80] transition-colors shadow-inner flex items-center justify-center">
                    <Camera size={26} className="text-[#07130B]" />
                  </div>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Card Modal */}
      <AnimatePresence>
        {(showShare && analysis) && (
          <ShareCard
            discovery={{ ...analysis, image_url: preview }}
            onClose={() => setShowShare(false)}
          />
        )}
        {selectedShareItem && (
          <ShareCard
            discovery={selectedShareItem}
            onClose={() => setSelectedShareItem(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
