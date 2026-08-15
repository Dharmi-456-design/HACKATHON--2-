import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Compass, BookOpen, HandHeart, RotateCcw, Sparkles } from 'lucide-react';
import { PulseOrb } from '../components/ui';
import ThemeToggle from '../components/ThemeToggle';

const JOURNEY = [
  { icon: Eye, title: 'Observe', body: 'Notice what is already beside you — bark, birdsong, a wet seam of moss.' },
  { icon: BookOpen, title: 'Understand', body: 'Ask why it matters without inventing a name you do not have.' },
  { icon: Compass, title: 'Experience', body: 'Step into a place. Sit. Listen. Return at a different hour.' },
  { icon: HandHeart, title: 'Act', body: 'Do one modest, legal, local thing that keeps a relationship honest.' },
  { icon: Sparkles, title: 'Measure', body: 'Watch your Nature Connection across Observe, Explore, Learn, Act, Return.' },
  { icon: RotateCcw, title: 'Return', body: 'A single visit is a snapshot. Returning is how a landscape becomes familiar.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="fixed top-0 inset-x-0 z-30 backdrop-blur-md bg-cream/80 border-b border-ink/5 transition-colors">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <PulseOrb size={36} />
            <span className="font-display text-xl tracking-tight">NaturePulse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-forest/80">
            <a href="#journey" className="hover:text-ink transition-colors">The journey</a>
            <a href="#pulse" className="hover:text-ink transition-colors">Pulse</a>
            <a href="#trust" className="hover:text-ink transition-colors">Trust</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="hidden sm:inline-flex text-sm px-3 py-2 text-forest hover:text-ink transition-colors">Sign in</Link>
            <Link to="/login" className="inline-flex items-center gap-1.5 rounded-full bg-forest text-cream text-sm px-4 py-2 hover:bg-ink transition-colors">
              Begin <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-16 w-[480px] h-[480px] rounded-full bg-mist/60 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[360px] h-[360px] rounded-full bg-gold/10 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-14 items-center relative">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold mb-4">AI-powered Nature Relationship Platform</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-[68px] leading-[0.95] text-ink">
              Reconnect with the living world already around you.
            </h1>
            <p className="mt-6 text-lg text-forest/75 leading-relaxed max-w-lg">
              NaturePulse turns everyday surroundings into a quiet layer of discovery.
              Observe. Understand. Experience. Act. Measure. Return.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-forest text-cream px-6 py-3 text-sm hover:bg-ink transition-colors">
                Open the field notebook <ArrowRight size={16} />
              </Link>
              <a href="#journey" className="inline-flex items-center gap-2 rounded-full border border-forest/20 text-forest px-6 py-3 text-sm hover:bg-mist/40 transition-colors">
                How it works
              </a>
            </div>
            <p className="mt-6 text-xs text-forest/50 max-w-md">
              We never invent a species name. We never expose your exact location. City and habitat are enough.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-[32px] overflow-hidden shadow-lift border border-ink/5 bg-paper">
              <img
                src="/forest_pond.jpg"
                alt="NaturePulse — a still forest pond at first light"
                className="w-full h-[420px] object-cover"
              />
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-forest/45">Today’s mission</p>
                  <p className="font-display text-xl mt-0.5">Stand still under one tree</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-forest/45">Connection</p>
                  <p className="font-display text-2xl">78<span className="text-sm text-forest/40">/100</span></p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="journey" className="py-20 border-t border-ink/5">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold">The loop</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 max-w-2xl">A relationship, not a streak.</h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {JOURNEY.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-3xl bg-paper p-6 border border-ink/5 shadow-soft"
              >
                <div className="w-10 h-10 rounded-2xl bg-mist/70 flex items-center justify-center text-forest mb-4">
                  <step.icon size={18} />
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-forest/40">0{i + 1}</p>
                <h3 className="font-display text-2xl mt-1">{step.title}</h3>
                <p className="mt-2 text-sm text-forest/70 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pulse" className="py-20 bg-forest text-cream transition-colors">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Meet Pulse</p>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">Calm. Encouraging. Intelligent. Practical.</h2>
            <p className="mt-5 text-cream/75 leading-relaxed">
              Pulse is your field companion. It writes daily missions from your city, your time, and what you have already noticed.
              It reads a photograph only as far as the image supports. When it does not know, it says so.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-cream/80">
              <li>— Personalized missions that require real-world interaction</li>
              <li>— Nature Lens with structured, cautious image understanding</li>
              <li>— Ecological stories that connect several observations without forcing a plot</li>
            </ul>
          </div>
          <div className="rounded-[28px] bg-ink/30 border border-cream/10 p-6 backdrop-blur-xs">
            <div className="flex items-center gap-3 mb-5">
              <PulseOrb size={44} />
              <div>
                <p className="font-display text-xl">Pulse</p>
                <p className="text-xs text-cream/50">Your nature guide</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl bg-cream/10 px-4 py-3 text-cream/90">I have twelve minutes before a meeting. What should I actually do?</div>
              <div className="rounded-2xl bg-cream text-ink px-4 py-3">
                Twelve minutes is enough. Walk to the nearest street tree you can name by location, not by species. Stand still. Count textures on the bark. Then come back and tell me one thing that surprised you.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="py-20">
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-3 gap-6">
          {[
            ['No invented names', 'If Pulse is unsure, the observation stays unnamed. Honesty is part of ecological literacy.'],
            ['No exact locations', 'We store city and habitat, never a pin on your house. Community posts are equally coarse.'],
            ['Care, not performance', 'Actions are modest and local. We do not overclaim impact or sell a carbon fairy tale.'],
          ].map(([t, b]) => (
            <div key={t} className="rounded-3xl border border-ink/8 p-6 bg-paper shadow-soft">
              <h3 className="font-display text-2xl">{t}</h3>
              <p className="mt-2 text-sm text-forest/70 leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- NEW SECTION: Product Preview --- */}
      <section className="py-24 bg-mist/20">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Dashboard</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 mb-12">Your ecological home base.</h2>
          <div className="relative rounded-[32px] overflow-hidden shadow-lift border border-ink/10 max-w-5xl mx-auto">
            <img src="/landing_preview.jpg" alt="NaturePulse Dashboard Preview" className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: Key Features --- */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold text-center">Features</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 text-center mb-16">Everything you need to connect.</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Compass, title: 'Habitat Mapping', desc: 'Discover nearby green spaces based on ecology, not just street addresses.' },
              { icon: HandHeart, title: 'Local Actions', desc: 'Practical, meaningful tasks tailored to the time you have right now.' },
              { icon: BookOpen, title: 'Field Notes', desc: 'Keep a private journal of your observations with AI-assisted insights.' },
              { icon: Sparkles, title: 'Ecological Stories', desc: 'Watch your daily observations weave into a continuous narrative.' }
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-3xl bg-paper border border-ink/5 hover:border-forest/20 transition-colors shadow-sm group">
                <div className="w-12 h-12 rounded-2xl bg-forest text-cream flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <f.icon size={20} />
                </div>
                <h3 className="font-display text-xl">{f.title}</h3>
                <p className="mt-3 text-sm text-forest/70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: Statistics --- */}
      <section className="py-20 bg-forest text-cream">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '12k+', label: 'Active Observers' },
            { val: '450+', label: 'Cities Mapped' },
            { val: '80k', label: 'Field Notes' },
            { val: '100%', label: 'Privacy Focused' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl sm:text-5xl text-gold">{s.val}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-cream/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- NEW SECTION: Benefits --- */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-[32px] overflow-hidden border border-ink/5 shadow-soft">
            <img src="/login_nature.jpg" alt="Nature path" className="w-full h-[500px] object-cover" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Why Choose Us</p>
            <h2 className="font-display text-4xl sm:text-5xl mt-2 mb-6">Designed for actual reality.</h2>
            <div className="space-y-6">
              {[
                { title: 'Screen time that leads outside', desc: 'Unlike endless feeds, our app is designed to be closed. We give you a mission and send you out.' },
                { title: 'Zero guilt, zero gamification', desc: 'No streaks to lose, no leaderboards to climb. Just a quiet space to record your relationship with nature.' },
                { title: 'Scientific yet accessible', desc: 'We bridge the gap between rigorous ecology and everyday walking, making nature understandable.' }
              ].map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-mist/50 flex flex-shrink-0 items-center justify-center mt-1 text-forest">
                    <ArrowRight size={12} />
                  </div>
                  <div>
                    <h4 className="font-display text-xl">{b.title}</h4>
                    <p className="mt-2 text-sm text-forest/70">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: Testimonials --- */}
      <section className="py-24 bg-mist/10 border-y border-ink/5">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="font-display text-4xl text-center mb-16">Stories from the field.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: "It completely changed how I walk to work. I notice the moss on the brick walls now.", name: "Sarah L.", loc: "Urban Ecologist" },
              { text: "The missions are perfectly sized. 10 minutes is actually 10 minutes. It respects my time.", name: "Marcus T.", loc: "Software Engineer" },
              { text: "I love that it doesn't force me to pretend I know the exact Latin name of every bird.", name: "Elena R.", loc: "Amateur Birdwatcher" }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-paper border border-ink/5 shadow-sm">
                <div className="flex gap-1 text-gold mb-4">
                  {[1,2,3,4,5].map(s => <span key={s}>★</span>)}
                </div>
                <p className="text-forest/80 italic mb-6 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-display font-medium">{t.name}</p>
                  <p className="text-xs text-forest/50">{t.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: FAQ --- */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold text-center">Questions</p>
          <h2 className="font-display text-4xl sm:text-5xl mt-2 text-center mb-12">Common inquiries.</h2>
          <div className="space-y-4">
            {[
              { q: "Is it really free?", a: "Yes. Core observation tools and daily missions are free." },
              { q: "Do you track my exact location?", a: "No. We only use city-level and habitat-level data. Never precise GPS coordinates." },
              { q: "Do I need to know about plants?", a: "Not at all. Pulse is designed for beginners. You just need to notice things." },
              { q: "Is there a mobile app?", a: "NaturePulse is a progressive web app. You can install it directly to your home screen." }
            ].map((faq, i) => (
              <details key={i} className="group rounded-2xl bg-paper border border-ink/5 overflow-hidden">
                <summary className="p-5 font-display text-lg cursor-pointer select-none flex items-center justify-between hover:bg-mist/10">
                  {faq.q}
                  <span className="text-forest/40 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-5 pt-0 text-sm text-forest/70 border-t border-ink/5 mt-2 bg-paper/50">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: Final CTA --- */}
      <section className="py-24 px-5">
        <div className="max-w-4xl mx-auto rounded-[40px] bg-forest text-cream p-12 sm:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-mist/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl sm:text-6xl mb-6">Ready to return?</h2>
            <p className="text-cream/80 max-w-lg mx-auto mb-10 text-lg">
              Join thousands of others building a quieter, more honest relationship with the living world.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto rounded-full bg-cream text-forest px-8 py-4 font-medium hover:bg-white transition-colors">
                Create free account
              </Link>
              <Link to="/login" className="w-full sm:w-auto rounded-full border border-cream/30 text-cream px-8 py-4 font-medium hover:bg-cream/10 transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/8 py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PulseOrb size={28} />
            <span className="font-display text-lg">NaturePulse</span>
          </div>
          <p className="text-xs text-forest/50 max-w-md">
            An AI-powered Nature Relationship Platform. Helping people notice, understand, experience, and care for the natural world around them.
          </p>
        </div>
      </footer>
    </div>
  );
}
