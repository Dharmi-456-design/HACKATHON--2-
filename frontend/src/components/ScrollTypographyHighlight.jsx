import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const TEXT = "A relationship with nature is recognized long before it is defined. Your everyday surroundings shape how you perceive, protect, and reconnect with the living world. We help cultivate that difference.";

function Word({ children, progress, range, isDark }) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  const color = useTransform(
    progress,
    range,
    isDark
      ? ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 1)']
      : ['rgba(15, 23, 42, 0.25)', 'rgba(15, 23, 42, 1)']
  );
  const y = useTransform(progress, range, [4, 0]);

  return (
    <motion.span style={{ opacity, color, y }} className="inline-block mr-3 transition-colors duration-150 font-semibold">
      {children}
    </motion.span>
  );
}

export default function ScrollTypographyHighlight() {
  const textRef = useRef(null);
  const { isDark } = useTheme();
  
  // Target the text container directly so progress reaches 100% synchronously as the text scrolls through view
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ['start 0.85', 'end 0.45'],
  });

  const words = TEXT.split(' ');
  const total = words.length;

  const SHOWCASE = [
    {
      title: 'Misty Ancient Pine Forest',
      category: 'Deep Evergreen Canopy',
      img: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Sunlit Rainforest Waterfall',
      category: 'Tropical Oasis Stream',
      img: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Sun-Drenched Woodland Trail',
      category: 'Golden Hour Forest',
      img: 'https://images.unsplash.com/photo-1507041957456-9c397ce39c97?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Dewy Emerald Fern Leaves',
      category: 'Micro-Habitat Canopy',
      img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <section className={`py-32 px-6 relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#0E1E15] text-white' : 'bg-[#F1F5F1] text-slate-900'
    }`}>
      {/* Scroll illuminated headline */}
      <div ref={textRef} className="max-w-5xl mx-auto text-center py-4">
        <p className={`text-[11px] uppercase tracking-[0.28em] font-semibold mb-6 ${
          isDark ? 'text-[#E6C176]' : 'text-amber-700'
        }`}>
          THE PHILOSOPHY
        </p>

        <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[1.28] tracking-tight">
          {words.map((word, i) => {
            // Calculate overlapping progress range for smooth, continuous line-by-line highlight
            const start = (i / total) * 0.75;
            const end = Math.min(start + 0.28, 1);
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]} isDark={isDark}>
                {word}
              </Word>
            );
          })}
        </h2>
      </div>

      {/* Parallax Image Grid Showcase */}
      <div className="max-w-7xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {SHOWCASE.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className={`group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl cursor-pointer border ${
              isDark ? 'border-white/15' : 'border-slate-300'
            }`}
          >
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-0 inset-x-0 p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#96CD7B] font-semibold">
                {item.category}
              </p>
              <h3 className="font-display text-lg text-white font-semibold mt-1">
                {item.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

