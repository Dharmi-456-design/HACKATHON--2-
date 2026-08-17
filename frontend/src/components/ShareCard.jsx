import { useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng, toBlob } from 'html-to-image';
import { Download, Copy, X, Leaf } from 'lucide-react';
import { formatWhen } from '../lib/api';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ShareCard({ discovery, onClose }) {
  const cardRef = useRef(null);

  const download = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${discovery.common_name?.replace(/\s+/g, '-') || 'discovery'}-naturepulse.png`;
    a.click();
  };

  const copyImage = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await toBlob(cardRef.current);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch {
      alert('Copy not supported in this browser. Use Download instead.');
    }
  };

  const funFact = discovery.why_it_matters?.split('.')[0] || '';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: 90, opacity: 0 }}
        transition={{ duration: prefersReducedMotion() ? 0 : 0.5, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* The card to capture */}
        <div
          ref={cardRef}
          className="bg-paper rounded-3xl border border-ink/10 overflow-hidden shadow-lift"
          style={{ width: 340, fontFamily: "'Source Sans 3', sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <img src="/logo.webp" alt="NaturePulse Logo" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover' }} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontWeight: 600, color: '#14261C' }}>NaturePulse</span>
          </div>

          {/* Species image */}
          {discovery.image_url && (
            <img
              src={discovery.image_url}
              alt={discovery.common_name}
              style={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
          )}

          {/* Content */}
          <div className="px-5 py-4">
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#C4A35A', marginBottom: 4 }}>
              {discovery.category}
            </p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: '#14261C', lineHeight: 1.2 }}>
              {discovery.common_name}
            </p>
            {discovery.scientific_name && (
              <p style={{ fontStyle: 'italic', fontSize: 12, color: '#3D5C4A', marginTop: 2 }}>
                {discovery.scientific_name}
              </p>
            )}
            {funFact && (
              <p style={{ fontSize: 12, color: '#1B3A2C', marginTop: 8, lineHeight: 1.5, opacity: 0.8 }}>
                "{funFact}."
              </p>
            )}
          </div>

          {/* Footer strip */}
          <div style={{ background: '#1B3A2C', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#C5D4C0', fontSize: 10, letterSpacing: '0.12em' }}>Discovered with NaturePulse</span>
            <span style={{ color: '#C5D4C0', fontSize: 10 }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={download}
            className="inline-flex items-center gap-2 rounded-full bg-forest text-cream px-5 py-2.5 text-sm font-medium hover:bg-ink transition-colors"
          >
            <Download size={14} /> Download
          </button>
          <button
            onClick={copyImage}
            className="inline-flex items-center gap-2 rounded-full border border-forest/20 text-forest px-5 py-2.5 text-sm font-medium hover:bg-mist/40 transition-colors"
          >
            <Copy size={14} /> Copy Image
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-ink/10 text-forest/60 px-3 py-2.5 hover:bg-cream-deep transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
