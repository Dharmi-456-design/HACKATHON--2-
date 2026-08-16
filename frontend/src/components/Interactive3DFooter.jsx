import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Compass, ShieldCheck, Leaf, Globe, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { usePublicStats } from '../hooks/usePublicStats';

export default function Interactive3DFooter() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const stats = usePublicStats();

  // Lazy-load Three.js only when footer is near viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanup = null;
    let isDisposed = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !cleanup && !isDisposed) {
          import('three').then((THREE) => {
            if (isDisposed || !canvasRef.current) return;

            const scene = new THREE.Scene();
            const width = canvasRef.current.clientWidth || 1200;
            const height = canvasRef.current.clientHeight || 550;
            const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            camera.position.z = 8;

            const renderer = new THREE.WebGLRenderer({
              canvas: canvasRef.current,
              alpha: true,
              antialias: true,
              powerPreference: 'high-performance',
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

            // 1. 3D Floating Spore Particles
            const count = 120;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);

            for (let i = 0; i < count * 3; i += 3) {
              positions[i] = (Math.random() - 0.5) * 18;
              positions[i + 1] = (Math.random() - 0.5) * 12;
              positions[i + 2] = (Math.random() - 0.5) * 12;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const material = new THREE.PointsMaterial({
              color: 0x97cdab,
              size: 0.06,
              transparent: true,
              opacity: 0.7,
              blending: THREE.AdditiveBlending,
            });
            const spores = new THREE.Points(geometry, material);
            scene.add(spores);

            // 2. 3D Wireframe Ecosystem Sphere
            const sphereGeo = new THREE.IcosahedronGeometry(2.4, 2);
            const sphereMat = new THREE.MeshBasicMaterial({
              color: 0x97cdab,
              wireframe: true,
              transparent: true,
              opacity: 0.22,
            });
            const ecoSphere = new THREE.Mesh(sphereGeo, sphereMat);
            ecoSphere.position.set(0, 0, -1.5);
            scene.add(ecoSphere);

            let mouseX = 0;
            let mouseY = 0;
            const onMouseMove = (e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
              mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            };

            window.addEventListener('mousemove', onMouseMove, { passive: true });

            let reqId;
            let running = true;
            const animate = () => {
              if (!running) return;
              reqId = requestAnimationFrame(animate);

              spores.rotation.y += 0.001;
              spores.rotation.x += 0.0005;
              ecoSphere.rotation.y += 0.003;
              ecoSphere.rotation.x += 0.0015;

              camera.position.x += (mouseX * 0.9 - camera.position.x) * 0.04;
              camera.position.y += (-mouseY * 0.6 - camera.position.y) * 0.04;
              camera.lookAt(scene.position);

              renderer.render(scene, camera);
            };

            animate();

            const handleResize = () => {
              if (!canvasRef.current) return;
              const w = canvasRef.current.clientWidth;
              const h = canvasRef.current.clientHeight;
              camera.aspect = w / h;
              camera.updateProjectionMatrix();
              renderer.setSize(w, h);
            };

            window.addEventListener('resize', handleResize, { passive: true });

            cleanup = () => {
              running = false;
              cancelAnimationFrame(reqId);
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('resize', handleResize);
              renderer.dispose();
              geometry.dispose();
              material.dispose();
              sphereGeo.dispose();
              sphereMat.dispose();
            };
          });
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(container);

    return () => {
      isDisposed = true;
      observer.disconnect();
      if (cleanup) cleanup();
    };
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <footer ref={containerRef} className="relative bg-[#060E09] text-white pt-24 pb-12 overflow-hidden select-none border-t border-white/10">
      {/* 3D Background Canvas Layer */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        {/* ────────────────── 1. NEWSLETTER & BIO-TELEMETRY CARD ────────────────── */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#13271C]/90 to-[#0A1610]/95 border border-[#97CDAB]/30 p-8 sm:p-12 mb-20 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#97CDAB]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#97CDAB]/15 border border-[#97CDAB]/30 text-[#97CDAB] text-xs font-mono font-semibold tracking-wider uppercase">
                <Sparkles size={13} aria-hidden="true" /> Living Sanctuary Network
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Deepen your daily dialogue with living nature.
              </h2>
              <p className="text-white/70 text-sm sm:text-base max-w-xl leading-relaxed">
                Receive weekly ecological phenology briefings, seasonal species migrations, and local field observer protocols.
              </p>
            </div>

            <div className="lg:col-span-5">
              {subscribed ? (
                <div className="p-6 rounded-2xl bg-[#97CDAB]/15 border border-[#97CDAB]/40 text-center">
                  <p className="font-display text-lg font-bold text-[#97CDAB]">You are connected.</p>
                  <p className="text-xs text-white/80 mt-1">Check your inbox for this week's ecological field dispatch.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <label htmlFor="footer-email-input" className="sr-only">
                    Email address for ecological dispatches
                  </label>
                  <input
                    id="footer-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#97CDAB] transition-colors"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to weekly ecological dispatch"
                    className="rounded-2xl bg-[#97CDAB] text-[#060E09] font-bold text-sm px-6 py-3.5 hover:bg-white transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg group shrink-0"
                  >
                    Subscribe <ArrowRight size={16} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ────────────────── 2. LINK COLUMNS ────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-b border-white/10">
          {/* Column 1: Platform */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all">
            <p className="text-xs uppercase tracking-[0.22em] text-[#97CDAB] font-bold mb-4 flex items-center gap-2">
              <Compass size={14} aria-hidden="true" /> Platform
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#hero" className="hover:text-white transition-colors">3D Experience</a></li>
              <li><a href="#pulse" className="hover:text-white transition-colors">Pulse AI Engine</a></li>
              <li><a href="#journey" className="hover:text-white transition-colors">The 6-Step Loop</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Reviews & Trust</a></li>
            </ul>
          </div>

          {/* Column 2: Exploration */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all">
            <p className="text-xs uppercase tracking-[0.22em] text-[#E6C176] font-bold mb-4 flex items-center gap-2">
              <Leaf size={14} aria-hidden="true" /> Exploration
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#reviews" className="hover:text-white transition-colors">Observer Reviews</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">Habitat Mapping</a></li>
              <li><a href="#pulse" className="hover:text-white transition-colors">Nature Lens AI</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Membership</a></li>
            </ul>
          </div>

          {/* Column 3: Science & Privacy */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all">
            <p className="text-xs uppercase tracking-[0.22em] text-[#97CDAB] font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={14} aria-hidden="true" /> Ethics & Privacy
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><span className="hover:text-white transition-colors cursor-pointer">Zero Coarse Tracking</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Open Field Protocol</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Non-Gamified Design</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Biodiversity Standards</span></li>
            </ul>
          </div>

          {/* Column 4: Community & Contact */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all">
            <p className="text-xs uppercase tracking-[0.22em] text-[#E6C176] font-bold mb-4 flex items-center gap-2">
              <Globe size={14} aria-hidden="true" /> Community
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/login" className="hover:text-white transition-colors">Field Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Urban Explorers</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Support & Docs</span></li>
            </ul>
          </div>
        </div>

        {/* ────────────────── 3. BOTTOM COPYRIGHT & STATUS BAR ────────────────── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/60">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white/80">
              {stats && typeof stats.habitats === 'number'
                ? `${stats.habitats.toLocaleString()} Ecological Habitats Active`
                : 'Ecological Habitats Active'}
            </span>
          </div>

          <p>© {new Date().getFullYear()} NaturePulse Platform. Built for living ecosystems.</p>

          <div className="flex items-center gap-3">
            {[
              { icon: Twitter, href: '#', label: 'Twitter profile' },
              { icon: Github, href: '#', label: 'GitHub repository' },
              { icon: Linkedin, href: '#', label: 'LinkedIn profile' },
              { icon: Mail, href: 'mailto:contact@naturepulse.app', label: 'Contact email' },
            ].map((s, idx) => (
              <a
                key={idx}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-white/80 hover:text-[#97CDAB] hover:border-[#97CDAB]/40 transition-colors shadow-sm"
              >
                <s.icon size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
