import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const TEXT = "A relationship with nature is recognized long before it is defined. Your everyday surroundings shape how you perceive, protect, and reconnect with the living world. We help cultivate that difference.";

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  const color = useTransform(progress, range, ['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 1)']);
  const y = useTransform(progress, range, [4, 0]);

  return (
    <motion.span style={{ opacity, color, y }} className="inline-block mr-3 transition-colors duration-150">
      {children}
    </motion.span>
  );
}

export default function ScrollTypographyHighlight() {
  const textRef = useRef(null);
  
  // Target the text container directly so progress reaches 100% synchronously as the text scrolls through view
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ['start 0.85', 'end 0.45'],
  });

  const words = TEXT.split(' ');
  const total = words.length;

  const SHOWCASE = [
    { title: 'Ancient Forest Canopy', category: 'Forest Park Edge', img: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Redwood_National_Park%2C_Fog_in_the_Forest.jpg' },
    { title: 'Champa Night Bloom', category: 'Plumeria Rubra', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Plumeria_rubra_flower.jpg' },
    { title: 'Indian Myna Foraging', category: 'Urban Wildlife', img: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Common_Myna_%28Acridotheres_tristis%29.jpg' },
    { title: 'Wetland Riparian Stream', category: 'Willamette River', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Vallee_des_Couleurs_waterfall.jpg' },
  ];

  return (
    <section className="py-32 bg-[#0E1E15] text-white px-6 relative overflow-hidden">
      {/* Scroll illuminated headline */}
      <div ref={textRef} className="max-w-5xl mx-auto text-center py-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#E6C176] font-semibold mb-6">
          THE PHILOSOPHY
        </p>

        <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[1.28] tracking-tight">
          {words.map((word, i) => {
            // Calculate overlapping progress range for smooth, continuous line-by-line highlight
            const start = (i / total) * 0.75;
            const end = Math.min(start + 0.28, 1);
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
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
            className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl cursor-pointer"
          >
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-0 inset-x-0 p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#96CD7B] font-semibold">
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

