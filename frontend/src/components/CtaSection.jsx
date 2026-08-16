import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Material Symbols Outlined helper component
export function MIcon({ name, size = 20, fill = 0, weight = 400, grade = 0, opticalSize = 24, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined select-none inline-block ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
      }}
    >
      {name}
    </span>
  );
}

// FadeUp Framer Motion helper component
export function FadeUp({ children, delay = 0, y = 24, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Polymorphic PrimaryButton with text slide animation on hover
export function PrimaryButton({ children, as = 'a', href = '#', onClick, className = '', size = 'lg' }) {
  const [isHovered, setIsHovered] = useState(false);

  const Component = as === 'button' ? 'button' : 'a';

  return (
    <Component
      href={as === 'a' ? href : undefined}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-black leading-none transition-colors overflow-hidden h-12 px-9 text-sm font-medium cursor-pointer ${className}`}
    >
      <div className="relative overflow-hidden flex flex-col items-center">
        <motion.span
          animate={{ y: isHovered ? '-100%' : '0%' }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="block"
        >
          {children}
        </motion.span>
        <motion.span
          animate={{ y: isHovered ? '0%' : '100%' }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 block text-black flex items-center justify-center"
        >
          {children}
        </motion.span>
      </div>
    </Component>
  );
}

// ChatPanel (Left Side of Dashboard Mock)
export function ChatPanel({ initialScroll = 'top', animateMessagesIn = true }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Welcome to the Vibe Design course! I'll guide you through building stunning websites with AI. What would you like to learn first?",
    },
    {
      role: 'user',
      text: 'I want to learn how to build a hero section with a cinematic video background using AI.',
    },
    {
      role: 'assistant',
      text: "Great choice! In this course, you'll learn how to create full-screen looping videos, liquid glass nav bars, email signups, and manifesto buttons — all with AI assistance. Let's dive in!",
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      if (initialScroll === 'top') {
        scrollRef.current.scrollTop = 0;
      } else {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [initialScroll]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userMsg = inputVal;
    setInputVal('');

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userMsg },
      {
        role: 'assistant',
        text: 'Analyzing prompt... NaturePulse AI is crafting your customized liquid glass UI components now.',
      },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-[#08080A]/60 backdrop-blur-xl p-3 sm:p-4 overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/10 shrink-0">
        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white">
          <MIcon name="auto_awesome" size={14} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white leading-tight">Vibe Design course</span>
          <span className="text-[11px] text-white/40 leading-tight">Learn how to build website with AI</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide">
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          const content = (
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isUser
                  ? 'ml-auto bg-white/15 text-white/90 text-right'
                  : 'bg-white/5 text-white/70 border border-white/5 text-left'
              }`}
            >
              {m.text}
            </div>
          );

          return animateMessagesIn ? (
            <FadeUp key={i} delay={i * 0.12} y={16}>
              {content}
            </FadeUp>
          ) : (
            <div key={i}>{content}</div>
          );
        })}
      </div>

      {/* Input Row */}
      <div className="liquid-glass rounded-2xl p-1.5 flex items-center gap-2 mt-2 shrink-0">
        <textarea
          rows={1}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the course..."
          className="flex-1 bg-transparent border-0 text-xs text-white placeholder-white/40 focus:outline-none resize-none px-3 py-2 scrollbar-hide"
        />
        <button
          onClick={handleSend}
          className="bg-white text-black rounded-xl p-2 hover:bg-white/90 transition-colors cursor-pointer shrink-0"
        >
          <MIcon name="arrow_upward" size={16} />
        </button>
      </div>
    </div>
  );
}

// VelorahHeroPreview (Right Side of Dashboard Mock)
export function VelorahHeroPreview() {
  const VIDEO_SRC =
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4';

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-2xl flex flex-col justify-between"
      style={{ backgroundColor: 'hsl(201 100% 13%)' }}
    >
      {/* Background Looping Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Nav Row */}
      <div className="relative z-10 flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 select-none">
        <div className="text-white text-sm sm:text-base md:text-lg font-instrument italic tracking-tight">
          Velorah<sup className="text-[0.5em] not-italic">®</sup>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[9px] lg:text-[10px] text-white/60">
          <span className="text-white font-medium">Home</span>
          <span className="hover:text-white cursor-pointer transition-colors">Studio</span>
          <span className="hover:text-white cursor-pointer transition-colors">About</span>
          <span className="hover:text-white cursor-pointer transition-colors">Journal</span>
          <span className="hover:text-white cursor-pointer transition-colors">Reach Us</span>
        </div>

        <div className="liquid-glass rounded-full px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] text-white font-medium">
          Begin Journey
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-3 sm:px-4 pt-3 sm:pt-5 md:pt-7 pb-6 select-none my-auto">
        <h1 className="font-instrument font-normal leading-[0.95] tracking-[-0.03em] text-lg sm:text-2xl md:text-3xl lg:text-4xl max-w-[90%] text-white animate-fade-rise">
          Where <em className="not-italic text-white/55">dreams</em> rise{' '}
          <em className="not-italic text-white/55">through the silence.</em>
        </h1>

        <p className="animate-fade-rise-delay text-white/60 text-[9px] sm:text-[11px] md:text-xs leading-relaxed max-w-[80%] sm:max-w-sm md:max-w-md mt-2 sm:mt-3 md:mt-4 font-light">
          We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>

        <button className="animate-fade-rise-delay-2 liquid-glass rounded-full px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 text-[9px] sm:text-[10px] text-white font-medium mt-3 sm:mt-4 md:mt-5 hover:bg-white/20 transition-colors cursor-pointer">
          Begin Journey
        </button>
      </div>
    </div>
  );
}

// CtaDashboardMock Container
export function CtaDashboardMock() {
  return (
    <div className="liquid-glass w-full max-w-[1100px] aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9] rounded-2xl mx-auto overflow-hidden p-2 sm:p-3 shadow-2xl">
      <div className="grid h-full grid-cols-1 sm:grid-cols-[minmax(220px,320px)_1fr] gap-2 sm:gap-3">
        <div className="min-h-0 hidden sm:block">
          <ChatPanel initialScroll="top" animateMessagesIn />
        </div>
        <div className="min-h-0">
          <VelorahHeroPreview />
        </div>
      </div>
    </div>
  );
}

// Main CtaSection Component
export default function CtaSection() {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const dashboardY = useTransform(scrollYProgress, [0, 1], ['120px', '-120px']);
  const grassY = useTransform(scrollYProgress, [0, 1], isMobile ? ['80px', '-40px'] : ['200px', '-200px']);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative w-full overflow-hidden bg-black text-white font-sans"
      style={{ background: 'linear-gradient(to bottom, transparent 0%, #14191E 100%)' }}
    >
      <div className="relative mx-auto max-w-[1080px] px-4 sm:px-6 pt-24 sm:pt-32 md:pt-40 pb-[440px] sm:pb-[520px] md:pb-[440px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start">
          {/* Left Column */}
          <div className="relative z-20 max-w-[400px]">
            <FadeUp delay={0.1}>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] leading-[1.05] text-white font-sans">
                Learn how can one go from 0 to $11.5k with AI in 60 days.
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-6 text-white/80 text-base sm:text-lg leading-[1.5] max-w-[380px] font-light">
                Learn to turn your ideas into stunning websites with AI — the same skills agencies charge $5,000 for. Join the UI Rocket training and start building like a pro today.
              </p>
            </FadeUp>
            <FadeUp delay={0.3} className="mt-10">
              <PrimaryButton as="button">Start for free</PrimaryButton>
            </FadeUp>
          </div>
        </div>
      </div>

      {/* Dashboard pinned to right edge, behind grass, parallax Y */}
      <motion.div
        style={{ y: dashboardY }}
        className="absolute top-[440px] sm:top-[460px] md:top-[500px] lg:top-20 left-4 right-4 sm:left-auto sm:-right-[8%] md:-right-[10%] lg:-right-[12%] z-10 sm:w-[85%] md:w-[80%] lg:w-[68%]"
      >
        <CtaDashboardMock />
      </motion.div>

      {/* Foreground grass — in front of dashboard, parallax Y */}
      <motion.img
        src="https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1780586778/cta-bg_mlwy5s.png"
        alt=""
        aria-hidden
        style={{ y: grassY }}
        className="pointer-events-none select-none absolute left-0 right-0 bottom-[-40px] sm:bottom-[-80px] lg:bottom-[-140px] w-full z-30 object-cover"
      />
    </section>
  );
}
