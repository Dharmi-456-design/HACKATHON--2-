import { useCallback, useEffect, useState } from 'react';
import { Camera, Save, Share2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, fileToResizedBase64, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Field, GhostButton, PrimaryButton, Skeleton, inputCls } from '../components/ui';

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

  useEffect(() => {
    load();
  }, [load]);

  const onFile = async (file) => {
    if (!file) return;
    setError('');
    setAnalysis(null);
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
      const data = await apiFetch(
        '/api/analyze',
        {
          method: 'POST',
          body: JSON.stringify({
            imageBase64: filePayload.base64,
            contentType: filePayload.mime,
            city: profile?.city,
            note: notes,
          }),
        },
        token
      );
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
      const up = await apiFetch(
        '/api/upload',
        {
          method: 'POST',
          body: JSON.stringify({
            fileName: filePayload.name,
            fileBase64: filePayload.base64,
            contentType: filePayload.mime,
          }),
        },
        token
      );
      const created = await apiFetch(
        '/api/discoveries',
        {
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
            notes,
            place_name: placeName,
            city: profile?.city || '',
            is_public: isPublic,
            raw_analysis: analysis,
          }),
        },
        token
      );
      if (isPublic) {
        await apiFetch(
          '/api/community',
          {
            method: 'POST',
            body: JSON.stringify({
              common_name: created.common_name,
              scientific_name: created.scientific_name,
              category: created.category,
              note: notes || analysis?.description,
              image_url: up.url,
              confidence: created.confidence,
              city: profile?.city,
            }),
          },
          token
        ).catch(() => {});
      }
      setPreview('');
      setFilePayload(null);
      setAnalysis(null);
      setNotes('');
      setPlaceName('');
      setIsPublic(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch('/api/discoveries', { method: 'DELETE', body: JSON.stringify({ id }) }, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Nature Lens</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-1">Look carefully. Name only what you know.</h1>
      <p className="mt-2 text-sm text-forest/65 max-w-2xl">
        Pulse reads the photograph and returns structured notes. If confidence is low, the observation stays unnamed.
        After every discovery, there is a real-world next step — not another screen.
      </p>

      {error && <div className="mt-5"><ErrorBanner message={error} /></div>}

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <label className="block border-2 border-dashed border-forest/20 rounded-3xl bg-cream/60 hover:bg-mist/30 cursor-pointer overflow-hidden transition-colors">
            {preview ? (
              <img src={preview} alt="Selected observation" className="w-full h-72 object-cover" />
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-forest/55">
                <Camera size={28} />
                <p className="mt-3 text-sm">Drop a field photograph or tap to choose</p>
                <p className="text-xs mt-1">JPG or PNG · we resize on your device</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          <div className="mt-4 space-y-3">
            <Field label="Place name — park, river, neighborhood. Never a street address.">
              <input className={inputCls} value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder="Forest Park edge, Powell Butte, backyard maple" />
            </Field>
            <Field label="What you noticed in your own words">
              <textarea className={inputCls + ' min-h-[88px]'} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Three true details are better than a guess." />
            </Field>
            <label className="flex items-center gap-2 text-sm text-forest/70 cursor-pointer">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-forest cursor-pointer" />
              Share to community (city only, never a pin)
            </label>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton onClick={analyze} disabled={!filePayload || analyzing}>
                {analyzing ? 'Pulse is looking…' : 'Ask Pulse to read this'}
              </PrimaryButton>
              <GhostButton onClick={save} disabled={!filePayload || saving}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save observation'}
              </GhostButton>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          {!analysis && !analyzing && (
            <Empty
              title="Nothing read yet"
              body="Pulse will describe visible features, offer a name only when confident, explain why the observation matters, and suggest a way to experience it in the real world."
            />
          )}
          {analyzing && (
            <div className="space-y-3">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          )}
          {analysis && (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge tone={analysis.confidence === 'high' ? 'sage' : 'warn'}>{analysis.confidence}</Badge>
                <Badge tone="ink">{analysis.category}</Badge>
                {!analysis.identified && <Badge tone="gold">Unnamed — on purpose</Badge>}
              </div>
              <h2 className="font-display text-3xl">{analysis.common_name || 'Unnamed observation'}</h2>
              {analysis.scientific_name && <p className="italic text-sm text-forest/55 mt-1">{analysis.scientific_name}</p>}
              <p className="mt-4 text-sm text-forest/80 leading-relaxed">{analysis.description}</p>
              {!!analysis.visible_features?.length && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {analysis.visible_features.map((f) => (
                    <li key={f} className="text-xs rounded-full bg-cream px-3 py-1 text-forest/70 border border-ink/5">{f}</li>
                  ))}
                </ul>
              )}
              <div className="mt-5 rounded-2xl bg-cream p-4 border border-ink/5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-forest/45">Why this matters</p>
                <p className="mt-1 text-sm leading-relaxed">{analysis.why_it_matters}</p>
              </div>
              <div className="mt-3 rounded-2xl bg-mist/40 p-4 border border-ink/5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-forest/45">Experience it</p>
                <p className="mt-1 text-sm leading-relaxed">{analysis.experience_suggestion}</p>
              </div>
              {analysis.ecological_role && (
                <p className="mt-4 text-sm text-forest/70"><span className="text-forest/45 uppercase tracking-[0.14em] text-[11px]">Role · </span>{analysis.ecological_role}</p>
              )}
              {analysis.uncertainty_note && (
                <p className="mt-3 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl px-3 py-2">{analysis.uncertainty_note}</p>
              )}
            </div>
          )}
        </Card>
      </div>

      <h2 className="font-display text-3xl mt-12 mb-4">Your field record</h2>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" />
        </div>
      ) : discoveries.length === 0 ? (
        <Card><Empty title="No discoveries yet" body="The first useful observation is often a weed, a crow, or a puddle." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {discoveries.map((d) => (
            <Card key={d.id} className="overflow-hidden">
              {d.image_url ? <img src={d.image_url} alt="" className="h-40 w-full object-cover" /> : <div className="h-24 bg-cream" />}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge>{d.confidence}</Badge>
                  {d.is_public && <Share2 size={12} className="text-forest/40" />}
                </div>
                <h3 className="font-display text-xl">{d.common_name}</h3>
                <p className="text-xs text-forest/50 mt-1">{d.place_name || d.city} · {formatWhen(d.created_at)}</p>
                <p className="mt-2 text-sm text-forest/70 line-clamp-3">{d.why_it_matters || d.description}</p>
                <button onClick={() => remove(d.id)} className="mt-3 text-xs text-forest/50 inline-flex items-center gap-1 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
