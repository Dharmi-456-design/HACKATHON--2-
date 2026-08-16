import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Compass, ShieldCheck, Leaf, Globe, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import * as THREE from 'three';

export default function Interactive3DFooter() {
  const canvasRef = useRef(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // 3D Canvas Spore Field, Eco-Sphere & Ambient Ring effect
  useEffect(() => {
    if (!canvasRef.current) return;

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 1. 3D Floating Spore Particles
    const count = 160;
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
    const sphereGeo = new THREE.IcosahedronGeometry(2.4, 3);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x97cdab,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const ecoSphere = new THREE.Mesh(sphereGeo, sphereMat);
    ecoSphere.position.set(0, 0, -1.5);
    scene.add(ecoSphere);

    // Mouse Tracking for Interactive 3D Camera & Sphere Rotation Shift
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
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      spores.rotation.y += 0.001;
      spores.rotation.x += 0.0005;
      ecoSphere.rotation.y += 0.003;
      ecoSphere.rotation.x += 0.0015;

      // Smooth camera interactive drift based on mouse position
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

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
    };
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative bg-[#060E09] text-white pt-28 pb-12 overflow-hidden border-t border-white/10 select-none">
      {/* 3D WebGL Background Canvas */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <canvas ref={canvasRef} className="w-full h-full opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060E09]/80 via-transparent to-[#060E09]" />
      </div>

      {/* 3D Giant Interactive Watermark Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none overflow-hidden opacity-10 [perspective:1000px] z-0">
        <motion.h1
          animate={{ rotateX: [0, 4, -4, 0], rotateY: [0, -6, 6, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="font-display text-[13vw] font-extrabold tracking-widest text-white uppercase whitespace-nowrap drop-shadow-[0_20px_50px_rgba(151,205,171,0.3)]"
        >
          NATURE PULSE
        </motion.h1>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* ────────────────── 1. 3D HERO BRANDING & NEWSLETTER BOX ────────────────── */}
        <div className="grid lg:grid-cols-12 gap-12 items-center pb-20 border-b border-white/10">
          
          {/* Left Column: Creative 3D Branding */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#97CDAB]/15 border border-[#97CDAB]/30 text-[#97CDAB] text-xs font-semibold uppercase tracking-[0.2em] shadow-sm">
              <Sparkles size={14} className="text-[#E6C176]" />
              3D Nature Relationship Platform
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Reconnect with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#97CDAB] via-[#E6C176] to-[#97CDAB]">living world</span>.
            </h2>

            <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-xl font-light">
              NaturePulse is a calm, intelligent companion that connects isolated observations into a living ecological narrative.
            </p>
          </div>

          {/* Right Column: 3D Glass Interactive Newsletter Card */}
          <div className="lg:col-span-6 [perspective:1000px]">
            <motion.div
              whileHover={{ rotateX: 4, rotateY: -4, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
              className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/15 p-8 sm:p-10 shadow-2xl relative overflow-hidden gpu-layer"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#97CDAB]/15 rounded-full blur-3xl pointer-events-none" />

              <h3 className="font-display text-2xl font-semibold text-white mb-2">
                Join the Field Dispatch
              </h3>
              <p className="text-sm text-white/70 mb-6 font-normal">
                Receive weekly ecological insights, seasonal observations, and local habitat guides. Zero spam.
              </p>

              {subscribed ? (
                <div className="p-4 rounded-2xl bg-[#97CDAB]/20 border border-[#97CDAB]/40 text-[#97CDAB] text-sm font-semibold flex items-center gap-3">
                  <ShieldCheck size={20} />
                  Welcome to the NaturePulse dispatch community!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#97CDAB] transition-colors"
                  />
                  <button
                    type="submit"
                    className="rounded-2xl bg-[#97CDAB] text-[#060E09] font-bold text-sm px-6 py-3.5 hover:bg-white transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg group shrink-0"
                  >
                    Subscribe <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>

        </div>

        {/* ────────────────── 2. INTERACTIVE 3D LINK COLUMNS ────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-b border-white/10 [perspective:1000px]">
          
          {/* Column 1: Platform */}
          <motion.div
            whileHover={{ y: -6, rotateX: 4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-[#97CDAB] font-bold mb-4 flex items-center gap-2">
              <Compass size={14} /> Platform
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#hero" className="hover:text-white transition-colors">3D Experience</a></li>
              <li><a href="#pulse" className="hover:text-white transition-colors">Pulse AI Engine</a></li>
              <li><a href="#journey" className="hover:text-white transition-colors">The 6-Step Loop</a></li>
              <li><a href="#trust" className="hover:text-white transition-colors">Trust & Ethics</a></li>
            </ul>
          </motion.div>

          {/* Column 2: Exploration */}
          <motion.div
            whileHover={{ y: -6, rotateX: 4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-[#E6C176] font-bold mb-4 flex items-center gap-2">
              <Leaf size={14} /> Exploration
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#reviews" className="hover:text-white transition-colors">Observer Reviews</a></li>
              <li><a href="#hero" className="hover:text-white transition-colors">Habitat Mapping</a></li>
              <li><a href="#pulse" className="hover:text-white transition-colors">Nature Lens AI</a></li>
              <li><a href="#journey" className="hover:text-white transition-colors">Connection Score</a></li>
            </ul>
          </motion.div>

          {/* Column 3: Science & Privacy */}
          <motion.div
            whileHover={{ y: -6, rotateX: 4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-[#97CDAB] font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={14} /> Ethics & Privacy
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><span className="hover:text-white transition-colors cursor-pointer">Zero Coarse Tracking</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Open Field Protocol</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Non-Gamified Design</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Biodiversity Standards</span></li>
            </ul>
          </motion.div>

          {/* Column 4: Community & Contact */}
          <motion.div
            whileHover={{ y: -6, rotateX: 4 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-[#E6C176] font-bold mb-4 flex items-center gap-2">
              <Globe size={14} /> Community
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/login" className="hover:text-white transition-colors">Field Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Urban Explorers</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Support & Docs</span></li>
            </ul>
          </motion.div>

        </div>

        {/* ────────────────── 3. BOTTOM COPYRIGHT & STATUS BAR ────────────────── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/60">
          
          {/* Status Indicator */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white/80">12,000+ Ecological Habitats Active</span>
          </div>

          {/* Brand Copyright */}
          <p>© {new Date().getFullYear()} NaturePulse Platform. Built for living ecosystems.</p>

          {/* 3D Social Icons */}
          <div className="flex items-center gap-3">
            {[
              { icon: Twitter, href: '#' },
              { icon: Github, href: '#' },
              { icon: Linkedin, href: '#' },
              { icon: Mail, href: '#' },
            ].map((s, idx) => (
              <motion.a
                key={idx}
                href={s.href}
                whileHover={{ scale: 1.15, y: -2 }}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-white/80 hover:text-[#97CDAB] hover:border-[#97CDAB]/40 transition-colors shadow-sm"
              >
                <s.icon size={16} />
              </motion.a>
            ))}
          </div>

        </div>

      </div>
    </footer>
  );
}
