import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Search, Filter, ShieldCheck, Quote } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ALL_REVIEWS = [
  {
    id: 1,
    name: 'Jimmy Slagle',
    role: 'Urban Botanist & Educator',
    city: 'Seattle, WA',
    rating: 5,
    tag: 'Field Protocol',
    quote: 'NaturePulse fundamentally shifted how I look at urban tree canopies. It turns a quick morning walk into a rich, structured ecological recording session.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 2,
    name: 'Ty Zamkow',
    role: 'Biodiversity Explorer',
    city: 'Portland, OR',
    rating: 5,
    tag: 'Species Tracking',
    quote: 'The 5-dimensional connection score keeps me accountable. Returning to the same urban stream every week reveals seasonal rhythms I used to miss completely.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 3,
    name: 'Nathan Graville',
    role: 'Field Telemetry Specialist',
    city: 'San Francisco, CA',
    rating: 5,
    tag: 'Pulse AI',
    quote: 'Pulse AI doesn’t just identify species — it connects soil moisture, light levels, and bird migration into a coherent story. Absolutely brilliant.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 4,
    name: 'Arianna Armelli',
    role: 'Ecological Designer',
    city: 'Denver, CO',
    rating: 5,
    tag: 'Urban Habitat',
    quote: 'Our entire design studio relies on NaturePulse field notes for baseline habitat telemetry. The interface is breathtaking and quiet.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 5,
    name: 'Fawaz Buqammaz',
    role: 'Avian Acoustic Researcher',
    city: 'Austin, TX',
    rating: 5,
    tag: 'Dawn Chorus',
    quote: 'Acoustic telemetry at 5:30 AM has never been this seamless. NaturePulse helped us log 340+ bird calls across 12 neighborhood zones.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 6,
    name: 'Elena Rostova',
    role: 'Conservation Biologist',
    city: 'Chicago, IL',
    rating: 5,
    tag: 'Community Mapped',
    quote: 'The community biodiversity map makes localized citizen science feel tangible and deeply connected across cities.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 7,
    name: 'Devin Sterling',
    role: 'Permaculture Strategist',
    city: 'Vancouver, BC',
    rating: 5,
    tag: 'Sanctuary Care',
    quote: 'The 14-day nature relationship challenge changed my daily habits forever. I notice every moss seam and lichen pattern now.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 8,
    name: 'Marcus Vance',
    role: 'Soil Microbiologist',
    city: 'Boston, MA',
    rating: 5,
    tag: 'Field Protocol',
    quote: 'Tracking fungal networks and soil crusts with NaturePulse has given our urban research group invaluable baseline data.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 9,
    name: 'Maya Lin-Chao',
    role: 'Environmental Journalist',
    city: 'New York, NY',
    rating: 5,
    tag: 'Pulse AI',
    quote: 'NaturePulse turns raw natural observations into poetic, scientifically accurate field reports in seconds.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 10,
    name: 'Liam O’Connor',
    role: 'Wilderness Educator',
    city: 'Binghamton, NY',
    rating: 5,
    tag: 'Species Tracking',
    quote: 'My students log native flora daily. The streak system focuses on quiet relationship building rather than gamified points.',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 11,
    name: 'Sophia Chen',
    role: 'Urban Forestry Lead',
    city: 'Toronto, ON',
    rating: 5,
    tag: 'Urban Habitat',
    quote: 'An essential app for municipal tree canopy tracking. The speed and beauty of the UI make field logging a joy.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 12,
    name: 'David K. Thorne',
    role: 'Amateur Mycologist',
    city: 'Asheville, NC',
    rating: 5,
    tag: 'Field Protocol',
    quote: 'I logged 85 species of fungi in Pisgah Forest. The species passport and AI vision telemetry are standard-setting.',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
  },
];

export default function ReviewsModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const { isDark } = useTheme();

  const tags = ['All', 'Field Protocol', 'Species Tracking', 'Pulse AI', 'Urban Habitat', 'Dawn Chorus'];

  const filteredReviews = ALL_REVIEWS.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.quote.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
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
            className={`relative w-full max-w-5xl rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-auto overflow-hidden max-h-[85vh] flex flex-col transition-colors ${
              isDark ? 'bg-[#0E1E15] border border-white/15 text-white' : 'bg-[#FDFBF7] border border-[#E3DDD1] text-[#0F2418]'
            }`}
          >
            {/* Header */}
            <div className={`flex items-start justify-between border-b pb-6 mb-6 shrink-0 ${
              isDark ? 'border-white/10' : 'border-[#E3DDD1]'
            }`}>
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider mb-2 ${
                  isDark ? 'bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B]' : 'bg-[#E1EFE0] border border-[#C3DEC0] text-[#183B28]'
                }`}>
                  <ShieldCheck size={14} /> 100% VERIFIED COMMUNITY REVIEWS
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold">
                  What Urban Explorers Say
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-white/70' : 'text-[#3E5C48]'}`}>
                  Read authentic stories from 12,000+ botanists, researchers, and nature lovers worldwide.
                </p>
              </div>

              <button
                onClick={onClose}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white' : 'bg-[#F2ECE1] hover:bg-[#EDE6D8] text-[#183B28] hover:text-[#0F2418]'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 shrink-0">
              <div className="relative w-full sm:w-72">
                <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-[#3E5C48]'}`} />
                <input
                  type="text"
                  placeholder="Search reviews..."
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
                <Filter size={14} className={isDark ? 'text-white/40 shrink-0' : 'text-[#3E5C48] shrink-0'} />
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
