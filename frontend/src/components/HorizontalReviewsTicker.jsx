import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Jimmy Slagle',
    role: 'Parker AI',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    quote: 'Alexandr is an artist. Absolutely brilliant. He is someone who loves the craft of design. His first message to me was "I don\'t want to do what every other AI company does. I want it to be unique."',
  },
  {
    id: 2,
    name: 'Ty Zamkow',
    role: 'Nolana AI',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    quote: 'Alexandr did an outstanding job on our logo! He\'s incredibly responsive, fully dedicated, and went above and beyond to ensure we achieved the perfect result.',
  },
  {
    id: 3,
    name: 'Nathan Graville',
    role: 'Gaviti',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    quote: 'Alex has been amazing. Only a month in, but Produx Design very active role in our operation already in terms of web, UI/UX, and eventual marketing.',
  },
  {
    id: 4,
    name: 'Delbert Ty',
    role: 'Gather AI',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&q=80',
    quote: 'Great experience working together. The team went above and beyond expectations at every stage and brought strong thinking, taste, and attention to detail.',
  },
  {
    id: 5,
    name: 'Arianna Armelli',
    role: 'Dorothy Tech',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    quote: 'Profound impact on our product identity. The level of craftsmanship and speed of execution completely transformed our user engagement metrics.',
  },
];

export default function HorizontalReviewsTicker() {
  const sectionRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-45%']);

  return (
    <section ref={sectionRef} className="py-24 bg-[#111f17] text-white overflow-hidden relative">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#97CDAB] font-semibold mb-2">COMMUNITY TRUST</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Beyond clients.<br />Trusted partners.
          </h2>
        </div>

        <a
          href="#community"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-white/70 hover:text-[#97CDAB] transition-colors group"
        >
          Read all reviews <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Horizontal Carousel Track */}
      <div className="w-full overflow-hidden cursor-grab active:cursor-grabbing py-4">
        <motion.div style={{ x }} className="flex gap-6 pl-6 w-max">
          {REVIEWS.concat(REVIEWS).map((rev, idx) => (
            <div
              key={`${rev.id}-${idx}`}
              className="w-[360px] sm:w-[420px] shrink-0 bg-[#16271F] border border-white/8 hover:border-[#97CDAB]/40 rounded-3xl p-7 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#97CDAB]/30"
                  />
                  <div>
                    <h4 className="font-semibold text-base text-white group-hover:text-[#97CDAB] transition-colors">
                      {rev.name}
                    </h4>
                    <p className="text-xs text-white/50">{rev.role}</p>
                  </div>

                  <div className="ml-auto flex gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light italic">
                  "{rev.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/6 flex items-center justify-between text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Quote size={12} className="text-[#97CDAB]" /> Verified Feedback
                </span>
                <span>Nature Explorer Partner</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
