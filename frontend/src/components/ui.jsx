import { motion } from 'framer-motion';

export function PulseOrb({ size = 56, className = '' }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full bg-moss/20 animate-pulse-ring" />
      <span className="absolute inset-[18%] rounded-full bg-moss/30 animate-pulse-ring" style={{ animationDelay: '0.6s' }} />
      <span className="relative rounded-full bg-gradient-to-br from-sage to-forest shadow-inner" style={{ width: size * 0.42, height: size * 0.42 }} />
    </div>
  );
}

export function ConnectionRing({
  score,
  size = 168,
}) {
  const r = 68;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score.overall)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="currentColor" className="text-cream-deep" strokeWidth="10" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="url(#np-ring)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="np-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7A9B78" />
            <stop offset="100%" stopColor="var(--color-forest)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-display text-[40px] leading-none text-ink tracking-tight">{score.overall}</p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-forest/55 mt-1">of 100</p>
      </div>
    </div>
  );
}

export function DimBars({ score }) {
  const dims = [
    ['Observe', score.observe],
    ['Explore', score.explore],
    ['Learn', score.learn],
    ['Act', score.act],
    ['Return', score.return_dim],
  ];
  return (
    <div className="space-y-2.5 w-full">
      {dims.map(([label, val]) => (
        <div key={label}>
          <div className="flex justify-between text-[11px] uppercase tracking-[0.14em] text-forest/55 mb-1">
            <span>{label}</span>
            <span>{val}</span>
          </div>
          <div className="h-1.5 rounded-full bg-cream-deep overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${val}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-sage to-forest"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Badge({ children, tone = 'sage' }) {
  const tones = {
    sage: 'bg-mist/70 text-forest',
    gold: 'bg-gold/15 text-gold',
    ink: 'bg-ink/8 text-ink',
    warn: 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.16em] ${tones[tone] || tones.sage}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`bg-paper rounded-3xl shadow-soft border border-ink/5 ${className}`}>{children}</div>;
}

export function PrimaryButton({
  children,
  className = '',
  ...props
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-forest text-cream px-5 py-2.5 text-sm font-medium hover:bg-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = '',
  ...props
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-forest/20 text-forest px-5 py-2.5 text-sm font-medium hover:bg-mist/40 transition-colors disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  error,
  children,
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.16em] text-forest/55 mb-1.5">{label}</span>
      {children}
      {error && <span className="block mt-1 text-xs text-red-700 dark:text-red-400">{error}</span>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-2xl bg-cream border border-ink/10 px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 outline-none focus:border-moss/50 focus:ring-2 focus:ring-moss/15 transition-colors';

export function Empty({
  title,
  body,
  action,
}) {
  return (
    <div className="text-center py-14 px-6">
      <PulseOrb size={72} className="mx-auto mb-4" />
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mt-2 text-sm text-forest/65 max-w-md mx-auto leading-relaxed">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-cream-deep/80 ${className}`} />;
}

export function ErrorBanner({ message }) {
  return (
    <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-sm px-4 py-3">
      {message}
    </div>
  );
}

export const TYPE_LABEL = {
  observe: 'Observe',
  explore: 'Explore',
  learn: 'Learn',
  act: 'Act',
  return: 'Return',
};
