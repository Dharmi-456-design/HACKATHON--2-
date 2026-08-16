import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ArrowLeft, Check, ImagePlus, Leaf,
  LogOut, MapPin, MapPinned, Send, ShieldAlert, ThumbsUp, X,
} from 'lucide-react';
import { Badge, Card, Empty, ErrorBanner, Field, GhostButton, PrimaryButton, Skeleton, inputCls } from '../components/ui';

const API_BASE = (import.meta.env.VITE_GREENWATCH_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const TOKEN_KEY = 'greenwatch_token';
const USER_KEY = 'greenwatch_user';

const CATEGORIES = [
  { value: 'litter', label: 'Litter' },
  { value: 'pollution', label: 'Pollution' },
  { value: 'illegal_dumping', label: 'Illegal dumping' },
  { value: 'deforestation', label: 'Deforestation' },
  { value: 'water_contamination', label: 'Water contamination' },
  { value: 'other', label: 'Other' },
];

const STATUSES = [
  { value: 'reported', label: 'Reported' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
];

const catLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label || v || 'Other';
const statusLabel = (v) => STATUSES.find((s) => s.value === v)?.label || v || 'Reported';

const statusTone = (v) => (v === 'resolved' ? 'sage' : v === 'in_progress' ? 'gold' : 'warn');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function readAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export default function GreenWatch() {
  const [{ token, user }, setAuth] = useState(readAuth);
  const [view, setView] = useState('feed');
  const [selectedId, setSelectedId] = useState(null);
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadFeed = useCallback(async (status = '') => {
    setLoading(true);
    setError('');
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      const data = await gwFetch(`/api/issues${query}`, {}, token);
      setIssues(data?.issues || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const openIssue = async (id) => {
    setSelectedId(id);
    setSelected(null);
    setError('');
    setLoading(true);
    try {
      const data = await gwFetch(`/api/issues/${id}`, {}, token);
      setSelected(data.issue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuth({ token: null, user: null });
    setView('feed');
    setNotice('Signed out. You can still browse the public feed.');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <motion.div
      className="max-w-6xl mx-auto px-5 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold flex items-center gap-1.5">
            <ShieldAlert size={12} /> Green Watch
          </p>
          <h1 className="font-display text-4xl sm:text-5xl mt-1">See a problem. Report it. Watch it heal.</h1>
          <p className="mt-2 text-sm text-forest/65 max-w-2xl">
            Neighbourhood environmental issues — litter, pollution, illegal dumping — logged with photos,
            tracked to resolution.
          </p>
        </div>
        {user && (
          <div className="shrink-0 text-right">
            <Badge tone="ink">{user.role === 'admin' ? 'Admin' : 'Reporter'}</Badge>
            <p className="text-xs text-forest/55 mt-1.5">{user.name} · {user.points ?? 0} pts</p>
          </div>
        )}
      </div>

      {error && <div className="mt-5"><ErrorBanner message={error} /></div>}
      {notice && (
        <div className="mt-5 rounded-2xl bg-mist/60 border border-ink/5 text-forest text-sm px-4 py-3">{notice}</div>
      )}

      {!token ? (
        <AuthCard
          onAuth={({ token: t, user: u }) => {
            localStorage.setItem(TOKEN_KEY, t);
            localStorage.setItem(USER_KEY, JSON.stringify(u));
            setAuth({ token: t, user: u });
            setError('');
            setNotice('');
            setView('report');
          }}
        />
      ) : (
        <div className="mt-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'report', label: 'Report an issue' },
              { key: 'feed', label: 'Community feed' },
              { key: 'mine', label: 'My reports' },
              { key: 'leaderboard', label: 'Leaderboard' },
              ...(isAdmin ? [{ key: 'admin', label: 'Admin Dashboard' }] : []),
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setView(tab.key);
                  setError('');
                  if (tab.key === 'feed') loadFeed();
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  view === tab.key
                    ? 'bg-forest text-cream shadow-sm'
                    : 'bg-cream border border-ink/10 text-forest/70 hover:bg-mist/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={signOut}
              className="ml-auto px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1.5 text-forest/55 hover:text-red-700 transition-colors cursor-pointer"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>

          <AnimatePresence mode="wait">
            {view === 'report' && (
              <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ReportForm token={token} onReported={(issue) => {
                  setNotice('Issue reported. It is now visible to your community.');
                  setView('feed');
                  loadFeed();
                }} />
              </motion.div>
            )}

            {view === 'feed' && (
              <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {loading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Skeleton className="h-64" /><Skeleton className="h-64" />
                  </div>
                ) : issues.length === 0 ? (
                  <Card>
                    <Empty
                      title="No issues reported yet"
                      body="Be the first — report a neighbourhood environmental issue so it can be tracked and resolved."
                    />
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {issues.map((issue) => (
                      <IssueCard key={issue._id} issue={issue} onOpen={() => openIssue(issue._id)} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {view === 'mine' && <MyIssues token={token} onOpen={(id) => openIssue(id)} key="mine" />}
            {view === 'leaderboard' && <LeaderboardView key="leaderboard" />}
            {view === 'admin' && <AdminStatsView token={token} key="admin" />}
          </AnimatePresence>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selectedId && (
          <IssueDetail
            id={selectedId}
            issue={selected}
            loading={loading}
            token={token}
            isAdmin={isAdmin}
            onClose={() => { setSelectedId(null); setSelected(null); }}
            onChanged={loadFeed}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── JSON helper for the Green Watch Express backend ───────────────────────────
async function gwFetch(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    const err = new Error('Could not reach the Green Watch server. Check your connection.');
    err.status = 0;
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      (data && typeof data.message === 'string' && data.message) ||
        (data && typeof data.error === 'string' && data.error) ||
        'Request failed. Please try again.'
    );
    err.status = res.status;
    throw err;
  }
  return data;
}

// Upload one image to the Express backend as multipart/form-data (field "image"),
// reporting progress via the callback. Cloudinary runs server-side only.
function uploadImageFile(file, token, onProgress) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('image', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === 'function') {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data && data.url) {
            resolve(data);
          } else {
            reject(new Error('Upload response did not include an image URL.'));
          }
        } catch {
          reject(new Error('Upload response could not be read.'));
        }
      } else {
        let message = 'Upload failed. Please try again.';
        try {
          const data = JSON.parse(xhr.responseText);
          if (data && typeof data.message === 'string') message = data.message;
        } catch {
          /* keep default */
        }
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload. Please check your connection.'));
    xhr.onabort = () => reject(new Error('Upload was cancelled.'));
    xhr.send(fd);
  });
}

// ─── Login / register ──────────────────────────────────────────────────────────
function AuthCard({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await gwFetch(
        mode === 'login' ? '/api/auth/login' : '/api/auth/register',
        { method: 'POST', body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password }) }
      );
      if (!data.token || !data.user) {
        throw new Error('Server did not return a session. Please try again.');
      }
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mt-8 max-w-md mx-auto p-6">
      <div className="text-center mb-5">
        <div className="w-14 h-14 rounded-full bg-forest flex items-center justify-center mx-auto mb-3">
          <Leaf size={24} className="text-cream" />
        </div>
        <h2 className="font-display text-2xl">{mode === 'login' ? 'Welcome back' : 'Join Green Watch'}</h2>
        <p className="text-sm text-forest/60 mt-1">
          {mode === 'login' ? 'Sign in to report and track issues.' : 'Create an account to report issues.'}
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'register' && (
          <Field label="Full name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Rita Sharma" required maxLength={100} />
          </Field>
        )}
        <Field label="Email">
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </Field>
        <Field label="Password">
          <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'register' ? '8+ chars, upper, lower, number, symbol' : '••••••••'} required minLength={mode === 'register' ? 8 : undefined} />
        </Field>
        {error && <ErrorBanner message={error} />}
        <PrimaryButton type="submit" disabled={busy} className="w-full">
          {busy ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : mode === 'login' ? 'Sign in' : 'Create account'}
        </PrimaryButton>
      </form>
      <p className="mt-4 text-center text-sm text-forest/60">
        {mode === 'login' ? 'No account yet? ' : 'Already have an account? '}
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-forest underline hover:opacity-70 cursor-pointer">
          {mode === 'login' ? 'Register' : 'Sign in'}
        </button>
      </p>
    </Card>
  );
}

// ─── Report form ───────────────────────────────────────────────────────────────
function ReportForm({ token, onReported }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [lng, setLng] = useState('');
  const [lat, setLat] = useState('');
  const [locating, setLocating] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const pickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    setError('');
    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not supported. Use JPG, PNG, WebP, or GIF.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" is larger than 5 MB.`);
        return;
      }
      if (uploads.length >= 4) {
        setError('An issue can have at most 4 images.');
        return;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setUploads((prev) => [...prev, { id, name: file.name, progress: 0, state: 'uploading', url: '', preview: URL.createObjectURL(file) }]);
      uploadImageFile(file, token, (p) => {
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: p } : u)));
      })
        .then((data) => {
          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: 100, state: 'done', url: data.url } : u)));
        })
        .catch((err) => {
          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, state: 'error', error: err.message } : u)));
        });
    });
  };

  const removeUpload = (id) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser. Enter coordinates manually.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLng(pos.coords.longitude.toFixed(6));
        setLat(pos.coords.latitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError('Location could not be read. Enter longitude and latitude manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const t = title.trim();
    const d = description.trim();
    const lngN = parseFloat(lng);
    const latN = parseFloat(lat);

    if (t.length < 5) return setError('Title must be at least 5 characters.');
    if (d.length < 10) return setError('Description must be at least 10 characters.');
    if (!category) return setError('Please choose a category.');
    if (uploads.some((u) => u.state === 'uploading')) return setError('Wait for the current upload to finish.');
    if (uploads.some((u) => u.state === 'error')) return setError('One or more photos failed to upload. Remove or retry them.');
    if (Number.isNaN(lngN) || Number.isNaN(latN) || lngN < -180 || lngN > 180 || latN < -90 || latN > 90) {
      return setError('Enter valid longitude (-180 to 180) and latitude (-90 to 90) coordinates.');
    }

    setSubmitting(true);
    try {
      const payload = {
        title: t,
        description: d,
        category,
        images: uploads.filter((u) => u.state === 'done' && u.url).map((u) => u.url),
        location: { type: 'Point', coordinates: [lngN, latN] },
        ...(address.trim() ? { address: address.trim() } : {}),
      };
      const data = await gwFetch('/api/issues', { method: 'POST', body: JSON.stringify(payload) }, token);
      setTitle(''); setDescription(''); setCategory(''); setAddress(''); setLng(''); setLat('');
      setUploads((prev) => { prev.forEach((u) => u.preview && URL.revokeObjectURL(u.preview)); return []; });
      if (data?.issue) onReported(data.issue);
      else onReported(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-2 gap-5">
      <Card className="p-6 space-y-4">
        <Field label="Title">
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Illegal dumping on the river path" maxLength={120} />
        </Field>
        <Field label="Describe what you saw">
          <textarea className={inputCls + ' min-h-[110px]'} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What, where, since when. Three true details help responders act faster." maxLength={2000} />
        </Field>
        <Field label="Category">
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Choose a category…</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Street / area address (optional)">
          <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Near the canal bridge, Sector 12" maxLength={300} />
        </Field>
        <Field label="Coordinates (longitude, latitude)">
          <div className="flex gap-2">
            <input className={inputCls} type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Lng, e.g. 72.8777" />
            <input className={inputCls} type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Lat, e.g. 19.0760" />
          </div>
          <div className="mt-2">
            <GhostButton type="button" onClick={useMyLocation} disabled={locating}>
              <MapPin size={14} /> {locating ? 'Locating…' : 'Use my location'}
            </GhostButton>
          </div>
        </Field>
      </Card>

      <div className="space-y-5">
        <Card className="p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-forest/55 mb-2">Photos (up to 4)</p>
          <label className="block border-2 border-dashed border-forest/20 rounded-2xl bg-cream/60 hover:bg-mist/30 cursor-pointer p-6 text-center transition-colors">
            <ImagePlus size={20} className="mx-auto text-forest/50 mb-1" />
            <p className="text-sm text-forest/65">Add photos of the problem</p>
            <p className="text-xs text-forest/40 mt-0.5">JPG, PNG, WebP, GIF · max 5 MB each · uploaded securely to Cloudinary</p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="sr-only" onChange={pickFiles} />
          </label>

          {uploads.length > 0 && (
            <div className="mt-4 space-y-2.5">
              {uploads.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-2xl bg-cream border border-ink/5 p-2.5">
                  <img src={u.preview} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-forest truncate">{u.name}</p>
                    {u.state === 'uploading' && (
                      <div className="mt-1 h-1.5 bg-cream-deep rounded-full overflow-hidden">
                        <div className="h-full bg-forest rounded-full transition-[width] duration-200" style={{ width: `${u.progress}%` }} />
                      </div>
                    )}
                    {u.state === 'done' && <p className="text-[11px] text-moss"><Check size={10} className="inline mr-0.5" />Uploaded</p>}
                    {u.state === 'error' && <p className="text-[11px] text-red-700 dark:text-red-400">{u.error}</p>}
                  </div>
                  <button type="button" onClick={() => removeUpload(u.id)} aria-label="Remove photo" className="p-1.5 text-forest/40 hover:text-red-700 transition-colors cursor-pointer">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex flex-wrap gap-3">
          <PrimaryButton type="submit" disabled={submitting}>
            <Send size={14} /> {submitting ? 'Reporting…' : 'Report issue'}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}

// ─── Feed card ─────────────────────────────────────────────────────────────────
function IssueCard({ issue, onOpen }) {
  const coords = issue.location?.coordinates || [];
  return (
    <button type="button" onClick={onOpen} className="text-left w-full cursor-pointer">
      <Card className="overflow-hidden transition-shadow hover:shadow-lift">
        {issue.images?.[0] ? (
          <img src={issue.images[0]} alt={issue.title} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-mist/40 flex items-center justify-center">
            <AlertTriangle size={22} className="text-forest/35" />
          </div>
        )}
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge tone="ink">{catLabel(issue.category)}</Badge>
            <Badge tone={statusTone(issue.status)}>{statusLabel(issue.status)}</Badge>
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-forest/50">
              <ThumbsUp size={11} /> {issue.upvoteCount ?? 0}
            </span>
          </div>
          <h3 className="font-display text-lg leading-snug">{issue.title}</h3>
          <p className="mt-1 text-sm text-forest/60 line-clamp-2">{issue.description}</p>
          <p className="mt-2.5 text-xs text-forest/45 flex items-center gap-1.5 flex-wrap">
            {issue.reportedBy?.name && <span>{issue.reportedBy.name}</span>}
            {coords.length === 2 && (
              <span className="inline-flex items-center gap-1">
                <MapPinned size={11} /> {Number(coords[1]).toFixed(4)}, {Number(coords[0]).toFixed(4)}
              </span>
            )}
            <span>{new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>
      </Card>
    </button>
  );
}

// ─── My reports ─────────────────────────────────────────────────────────────────
function MyIssues({ token, onOpen }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await gwFetch('/api/issues/mine', {}, token);
        if (mounted) setList(data?.issues || []);
      } catch (err) {
        if (mounted) setError(err.message);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  if (error) return <ErrorBanner message={error} />;
  if (!list) return <div className="space-y-3"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>;
  if (list.length === 0) {
    return (
      <Card>
        <Empty title="You have not reported anything yet" body="Use the Report tab to log a neighbourhood environmental issue." />
      </Card>
    );
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {list.map((issue) => (
        <IssueCard key={issue._id} issue={issue} onOpen={() => onOpen(issue._id)} />
      ))}
    </div>
  );
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
function LeaderboardView() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await gwFetch('/api/admin/leaderboard');
        setBoard(data?.leaderboard || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>;
  if (error) return <ErrorBanner message={error} />;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl">Community Impact Leaderboard</h3>
          <p className="text-sm text-forest/65 mt-1">Neighbourhood champions reporting and resolving environmental issues.</p>
        </div>
        <Badge tone="gold">Top Reporters</Badge>
      </div>

      <div className="space-y-3">
        {board.map((u, idx) => (
          <div key={u._id || idx} className="flex items-center justify-between p-4 rounded-2xl bg-cream/70 border border-forest/10">
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-400 text-ink' : idx === 1 ? 'bg-slate-300 text-ink' : idx === 2 ? 'bg-amber-700 text-cream' : 'bg-forest/10 text-forest'}`}>
                {idx + 1}
              </span>
              <div>
                <p className="font-medium text-forest text-sm">{u.name}</p>
                <p className="text-xs text-forest/55">{u.role === 'admin' ? 'Community Admin' : 'Active Citizen'}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display text-lg font-bold text-forest">{u.points ?? 0}</span>
              <span className="text-xs text-forest/60 ml-1">pts</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
function AdminStatsView({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await gwFetch('/api/admin/stats', {}, token);
        setStats(data?.stats || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `greenwatch-issues-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Export failed: ' + e.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs text-forest/60 uppercase tracking-wider font-semibold">Total Issues</p>
          <p className="font-display text-4xl mt-2 text-forest">{stats?.totalIssues ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-forest/60 uppercase tracking-wider font-semibold">Resolved</p>
          <p className="font-display text-4xl mt-2 text-emerald-600">{stats?.byStatus?.resolved ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-forest/60 uppercase tracking-wider font-semibold">In Progress</p>
          <p className="font-display text-4xl mt-2 text-amber-600">{stats?.byStatus?.in_progress ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-forest/60 uppercase tracking-wider font-semibold">Resolution Rate</p>
          <p className="font-display text-4xl mt-2 text-forest">{stats?.resolutionRate ?? '0%'}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 className="font-display text-xl">Issue Management & Data Export</h4>
            <p className="text-sm text-forest/65 mt-1">Download complete environmental issues history in CSV format for municipal reporting.</p>
          </div>
          <PrimaryButton onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

// ─── Detail overlay ─────────────────────────────────────────────────────────────
function IssueDetail({ id, issue, loading, token, isAdmin, onClose, onChanged }) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (issue) {
      setStatus(issue.status || 'reported');
      setUpvoted(false);
      setNote('');
    }
  }, [issue]);

  const toggleUpvote = async () => {
    if (!token) return setError('Sign in to upvote an issue.');
    setUpvoting(true);
    setError('');
    try {
      const data = await gwFetch(`/api/issues/${id}/upvote`, { method: 'POST', body: JSON.stringify({}) }, token);
      setUpvoted(data?.upvoted ?? false);
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpvoting(false);
    }
  };

  const saveStatus = async () => {
    if (!isAdmin) return;
    setBusy(true);
    setError('');
    try {
      const body = { status };
      if (note.trim()) body.note = note.trim();
      await gwFetch(`/api/issues/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }, token);
      setNote('');
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const coords = issue?.location?.coordinates || [];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-paper rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {loading || !issue ? (
          <div className="p-6 space-y-4"><Skeleton className="h-52" /><Skeleton className="h-40" /></div>
        ) : (
          <>
            <div className="relative">
              {issue.images?.[0] ? (
                <img src={issue.images[0]} alt={issue.title} className="w-full h-60 object-cover" />
              ) : (
                <div className="w-full h-60 bg-mist/40 flex items-center justify-center">
                  <AlertTriangle size={26} className="text-forest/35" />
                </div>
              )}
              <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 bg-ink/40 text-cream rounded-full p-1.5 hover:bg-ink/60 transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge tone="ink">{catLabel(issue.category)}</Badge>
                <Badge tone={statusTone(issue.status)}>{statusLabel(issue.status)}</Badge>
                <Badge tone="gold">priority: {issue.priority || 'medium'}</Badge>
              </div>
              <h2 className="font-display text-3xl leading-tight">{issue.title}</h2>
              {issue.address && <p className="mt-1 text-sm text-forest/55"><MapPin size={12} className="inline mr-1" />{issue.address}</p>}
              {coords.length === 2 && (
                <p className="mt-1 text-xs text-forest/45">Coordinates: {Number(coords[1]).toFixed(5)}, {Number(coords[0]).toFixed(5)}</p>
              )}
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">{issue.description}</p>

              {issue.images?.length > 1 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {issue.images.slice(1).map((src, i) => (
                    <img key={i} src={src} alt={`Additional photo ${i + 2}`} className="w-full h-28 object-cover rounded-xl" />
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={toggleUpvote}
                  disabled={upvoting}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    upvoted ? 'bg-forest text-cream' : 'bg-cream border border-ink/10 text-forest/70 hover:bg-mist/40'
                  }`}
                >
                  <ThumbsUp size={14} /> {issue.upvoteCount ?? 0} {upvoted ? 'Upvoted' : 'Upvote'}
                </button>
                <p className="text-xs text-forest/45">
                  Reported by {issue.reportedBy?.name || 'a neighbour'} · {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {issue.statusHistory?.length > 0 && (
                <div className="mt-5 rounded-2xl bg-cream border border-ink/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-forest/45 mb-3">Timeline</p>
                  <div className="space-y-3">
                    {issue.statusHistory.map((h, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-forest/40 shrink-0" />
                        <div>
                          <p className="text-sm text-forest/80"><span className="font-medium">{statusLabel(h.status)}</span> · {new Date(h.changedAt).toLocaleDateString()}</p>
                          {h.note && <p className="text-xs text-forest/55 mt-0.5">{h.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/10 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gold mb-3 flex items-center gap-1"><ShieldAlert size={12} />Admin — update status</p>
                  <div className="flex flex-wrap gap-2">
                    <select className={inputCls + ' w-auto'} value={status} onChange={(e) => setStatus(e.target.value)}>
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <input className={inputCls + ' flex-1 min-w-[160px]'} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the reporter (optional)" maxLength={300} />
                    <PrimaryButton type="button" onClick={saveStatus} disabled={busy}>
                      {busy ? 'Saving…' : 'Update'}
                    </PrimaryButton>
                  </div>
                  {error && <div className="mt-3"><ErrorBanner message={error} /></div>}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <GhostButton type="button" onClick={onClose}><ArrowLeft size={14} /> Back</GhostButton>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
