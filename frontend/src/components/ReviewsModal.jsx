import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, ShieldCheck, ThumbsUp } from 'lucide-react';

export default function ReviewsModal({ isOpen, onClose, reports = [] }) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl bg-[#0E1E15] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-auto text-white overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-6 mb-6 shrink-0">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                  <ShieldCheck size={14} /> REAL COMMUNITY FIELD REPORTS
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold">
                  What Urban Explorers Share
                </h2>
                <p className="text-sm text-white/70 mt-1">
                  Every report below was shared by a real NaturePulse community member.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 shrink-0">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search field reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#96CD7B]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
                <Filter size={14} className="text-white/40 shrink-0" />
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                      selectedTag === t
                        ? 'bg-[#96CD7B] text-[#0A1610]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

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
                          <ThumbsUp size={13} />
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
