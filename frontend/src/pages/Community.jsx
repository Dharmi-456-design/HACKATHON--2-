import { useEffect, useState } from 'react';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

export default function Community() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/community')
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Shared field</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-1">Neighbors noticing the same weather.</h1>
      <p className="mt-2 text-sm text-forest/65 max-w-2xl">
        Public observations show a first name, a city, and a habitat-scale note. No exact locations. Confidence stays visible so no one pretends certainty they do not have.
      </p>
      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}

      {loading ? (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-48" /><Skeleton className="h-48" />
        </div>
      ) : !items.length ? (
        <Card className="mt-8"><Empty title="The shared field is quiet" body="When you save a discovery, you can choose to publish it at city scale." /></Card>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <Card key={it.id} className="overflow-hidden">
              {it.image_url && <img src={it.image_url} alt="" className="h-40 w-full object-cover" />}
              <div className="p-5">
                <div className="flex gap-2 mb-2">
                  <Badge>{it.confidence}</Badge>
                  <Badge tone="ink">{it.category}</Badge>
                </div>
                <h3 className="font-display text-2xl">{it.common_name}</h3>
                {it.scientific_name && <p className="italic text-xs text-forest/50">{it.scientific_name}</p>}
                <p className="mt-2 text-sm text-forest/70">{it.note}</p>
                <p className="mt-3 text-xs text-forest/45">
                  {it.display_name} · {it.city}{it.region ? `, ${it.region}` : ''} · {formatWhen(it.created_at)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
