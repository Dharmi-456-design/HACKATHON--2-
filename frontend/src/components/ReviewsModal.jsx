import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import { X, Star, Search, Filter, ShieldCheck, Quote } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
=======
import { X, Search, Filter, ShieldCheck, ThumbsUp } from 'lucide-react';
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5

export default function ReviewsModal({ isOpen, onClose, reports = [] }) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const { isDark } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const tags = ['All', ...new Set(reports.map((r) => r.tag).filter(Boolean))];

  const filteredReports = reports.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.quote.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.species.toLowerCase().includes(q);
    const matchesTag = selectedTag === 'All' || r.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reviews-modal-title"
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
<<<<<<< HEAD
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full max-w-5xl rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-auto overflow-hidden max-h-[85vh] flex flex-col transition-colors ${
              isDark ? 'bg-[#0E1E15] border border-white/15 text-white' : 'bg-[#FDFBF7] border border-[#E3DDD1] text-[#0F2418]'
            }`}
=======
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl bg-[#0E1E15] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-auto text-white overflow-hidden max-h-[85vh] flex flex-col"
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5
          >
            {/* Header */}
            <div className={`flex items-start justify-between border-b pb-6 mb-6 shrink-0 ${
              isDark ? 'border-white/10' : 'border-[#E3DDD1]'
            }`}>
              <div>
<<<<<<< HEAD
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider mb-2 ${
                  isDark ? 'bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B]' : 'bg-[#E1EFE0] border border-[#C3DEC0] text-[#183B28]'
                }`}>
                  <ShieldCheck size={14} /> 100% VERIFIED COMMUNITY REVIEWS
=======
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                  <ShieldCheck size={14} aria-hidden="true" /> REAL COMMUNITY FIELD REPORTS
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5
                </div>
                <h2 id="reviews-modal-title" className="font-display text-2xl sm:text-3xl font-bold">
                  What Urban Explorers Share
                </h2>
<<<<<<< HEAD
                <p className={`text-sm mt-1 ${isDark ? 'text-white/70' : 'text-[#3E5C48]'}`}>
                  Read authentic stories from 12,000+ botanists, researchers, and nature lovers worldwide.
=======
                <p className="text-sm text-white/70 mt-1">
                  Every report below was shared by a real NaturePulse community member.
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5
                </p>
              </div>

              <button
                onClick={onClose}
<<<<<<< HEAD
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white' : 'bg-[#F2ECE1] hover:bg-[#EDE6D8] text-[#183B28] hover:text-[#0F2418]'
                }`}
=======
                aria-label="Close field reports modal"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 shrink-0">
              <div className="relative w-full sm:w-72">
<<<<<<< HEAD
                <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-[#3E5C48]'}`} />
=======
                <Search size={16} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <label htmlFor="search-field-reports" className="sr-only">Search field reports</label>
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5
                <input
                  id="search-field-reports"
                  type="text"
                  placeholder="Search field reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#96CD7B]'
                      : 'bg-[#F2ECE1] border border-[#E0D8C8] text-[#0F2418] placeholder-[#4F6856] focus:border-[#183B28]'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
<<<<<<< HEAD
                <Filter size={14} className={isDark ? 'text-white/40 shrink-0' : 'text-[#3E5C48] shrink-0'} />
=======
                <Filter size={14} aria-hidden="true" className="text-white/40 shrink-0" />
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                      selectedTag === t
                        ? isDark ? 'bg-[#96CD7B] text-[#0A1610]' : 'bg-[#183B28] text-[#FAF7F0]'
                        : isDark ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white' : 'bg-[#F2ECE1] text-[#3E5C48] hover:bg-[#EDE6D8]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

<<<<<<< HEAD
            {/* Reviews Grid */}
            <div className="overflow-y-auto pr-2 grid sm:grid-cols-2 gap-4 flex-1 scrollbar-hide">
              {filteredReviews.map((r) => (
                <div
                  key={r.id}
                  className={`rounded-2xl p-5 flex flex-col justify-between transition-all border ${
                    isDark
                      ? 'bg-white/5 border-white/10 hover:border-[#96CD7B]/40 hover:bg-white/[0.07]'
                      : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28]/40 hover:bg-[#EDE6D8]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isDark ? 'bg-[#96CD7B]/20 text-[#96CD7B]' : 'bg-[#E1EFE0] text-[#183B28] font-semibold'
                      }`}>
                        {r.tag}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                      </div>
                    </div>

                    <p className={`text-sm leading-relaxed font-light italic mb-4 ${
                      isDark ? 'text-white/85' : 'text-[#0F2418]'
                    }`}>
                      "{r.quote}"
                    </p>
                  </div>

                  <div className={`flex items-center gap-3 pt-3 border-t ${
                    isDark ? 'border-white/10' : 'border-[#E0D8C8]'
                  }`}>
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className={`w-10 h-10 rounded-full object-cover border ${
                        isDark ? 'border-white/20' : 'border-[#D4CBB8]'
                      }`}
                    />
                    <div>
                      <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{r.name}</h4>
                      <p className={`text-xs ${isDark ? 'text-white/60' : 'text-[#3E5C48]'}`}>
                        {r.role} · <span className={isDark ? 'text-[#96CD7B]' : 'text-[#183B28] font-semibold'}>{r.city}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer summary */}
            <div className={`pt-4 mt-4 border-t text-center text-xs shrink-0 ${
              isDark ? 'border-white/10 text-white/50' : 'border-[#E3DDD1] text-[#3E5C48]'
            }`}>
              Showing {filteredReviews.length} of {ALL_REVIEWS.length} community reviews
=======
            {/* Reports Grid */}
            {reports.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                <span className="text-4xl mb-4">🌿</span>
                <h3 className="font-display text-xl font-semibold mb-2">No field reports yet</h3>
                <p className="text-sm text-white/60 max-w-sm">
                  Be the first to share a species observation from the Community feed — it will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto pr-2 grid sm:grid-cols-2 gap-4 flex-1 scrollbar-hide">
                {filteredReports.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white/5 border border-white/10 hover:border-[#96CD7B]/40 rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-white/[0.07]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#96CD7B]/20 text-[#96CD7B]">
                          {r.species || r.tag}
                        </span>
                        <div className="flex items-center gap-1.5 text-[#96CD7B] text-xs font-mono">
                          <ThumbsUp size={13} aria-hidden="true" />
                          {r.upvotes}
                        </div>
                      </div>

                      <p className="text-sm text-white/85 leading-relaxed font-light italic mb-4">
                        "{r.quote}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                      {r.avatar ? (
                        <img
                          src={r.avatar}
                          alt={r.name}
                          loading="lazy"
                          decoding="async"
                          width="40"
                          height="40"
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 flex items-center justify-center text-lg">
                          🌿
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-white">{r.name}</h4>
                        <p className="text-xs text-white/60">
                          {r.role} · <span className="text-[#96CD7B]">{r.city}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer summary */}
            <div className="pt-4 mt-4 border-t border-white/10 text-center text-xs text-white/50 shrink-0">
              Showing {filteredReports.length} of {reports.length} community field reports
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
