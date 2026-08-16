import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ShieldCheck, Compass, MapPin } from 'lucide-react';
import * as THREE from 'three';

export default function InteractiveHeroSphere() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Dynamic transforms based on scroll progress
  const sphereScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.25, 0.9]);
  const sphereY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -20, 30]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const width = canvasRef.current.clientWidth || 600;
    const height = canvasRef.current.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.5;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Create Mossy Floating Island/Globe
    const sphereGeometry = new THREE.IcosahedronGeometry(1.8, 40);
    
    // Custom Shader / Material for Organic Mossy Nature Island
    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 512;
    canvasTexture.height = 512;
    const ctx = canvasTexture.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#1B3A2C');
      grad.addColorStop(0.3, '#2D5A43');
      grad.addColorStop(0.6, '#487A5B');
      grad.addColorStop(0.85, '#97CDAB');
      grad.addColorStop(1, '#C4A35A');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Noise spots for moss/terrain details
      ctx.fillStyle = 'rgba(15, 33, 24, 0.35)';
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 14 + 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const texture = new THREE.CanvasTexture(canvasTexture);

    // Bump map for 3D moss terrain displacement
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 256;
    bumpCanvas.height = 256;
    const bCtx = bumpCanvas.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#808080';
      bCtx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 800; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const v = Math.floor(Math.random() * 255);
        bCtx.fillStyle = `rgb(${v},${v},${v})`;
        bCtx.fillRect(x, y, Math.random() * 6 + 1, Math.random() * 6 + 1);
      }
    }
    const bumpMap = new THREE.CanvasTexture(bumpCanvas);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      bumpMap: bumpMap,
      bumpScale: 0.12,
      roughness: 0.75,
      metalness: 0.1,
    });

    const mesh = new THREE.Mesh(sphereGeometry, material);
    scene.add(mesh);

    // Outer atmosphere glow ring
    const atmosphereGeo = new THREE.IcosahedronGeometry(1.92, 20);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x97cdab,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // Floating spore particles / fireflies field
    const particleCount = 120;
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc4a35a,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particlesGeo, particleMat);
    scene.add(particles);

    // Lighting
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x97cdab, 1.2);
    dirLight2.position.set(-5, -3, -2);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x1b3a2c, 1.5);
    scene.add(ambientLight);

    // Animation Loop
    let reqId;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onScroll = () => {
      const p = window.scrollY / (document.body.scrollHeight || 1);
      targetRotationY = p * Math.PI * 4;
      targetRotationX = p * Math.PI * 1.5;

      if (p < 0.3) setActiveStep(0);
      else if (p < 0.6) setActiveStep(1);
      else setActiveStep(2);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      // Smooth interpolation
      mesh.rotation.y += 0.003 + (targetRotationY - mesh.rotation.y) * 0.05;
      mesh.rotation.x += (targetRotationX - mesh.rotation.x) * 0.05;
      atmosphereMesh.rotation.y -= 0.002;
      particles.rotation.y += 0.001;

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
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      sphereGeometry.dispose();
      material.dispose();
    };
  }, []);

  const steps = [
    {
      subtitle: 'NATURE RELATIONSHIP PLATFORM',
      heading: 'In 14 days, we shape a living ecological identity.',
      body: 'NaturePulse turns your everyday surroundings into a deep layer of quiet discovery — connecting field notes, species tracking, and urban biodiversity.',
    },
    {
      subtitle: 'STAND OUT & OBSERVE',
      heading: 'Observe nature\'s thread with precision & intelligence.',
      body: 'Pulse AI connects isolated observations into a single narrative, helping you tune into dawn birdsong, native trees, and seasonal rhythms.',
    },
    {
      subtitle: 'MEASURE & RETURN',
      heading: 'Build lasting trust with your local ecosystem.',
      body: 'Track your 5-dimensional Nature Connection score over time and collaborate with a thriving community of urban explorers.',
    },
  ];

  return (
    <div ref={containerRef} className="relative min-h-[220vh] bg-[#0A1610] text-white">
      {/* Sticky viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Glowing Background Radial Accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#97CDAB]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[C4A35A]/10 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl w-full mx-auto px-6 grid lg:grid-cols-12 gap-8 items-center z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 z-20 space-y-6">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#97CDAB]/15 border border-[#97CDAB]/30 text-[#97CDAB] text-xs uppercase tracking-[0.2em] font-semibold mb-4">
                <Sparkles size={13} />
                {steps[activeStep].subtitle}
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white">
                {steps[activeStep].heading}
              </h1>

              <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed font-light">
                {steps[activeStep].body}
              </p>

              {/* Slide indicators */}
              <div className="flex items-center gap-2 pt-6">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      activeStep === idx ? 'w-8 bg-[#97CDAB]' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D Interactive Canvas & Floating Tooltips */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[460px] sm:min-h-[560px]">
            
            {/* WebGL Canvas */}
            <motion.div style={{ scale: sphereScale, y: sphereY }} className="relative w-full h-[450px] sm:h-[550px] flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            </motion.div>

            {/* Floating Tooltip Pins (matching video callout badges!) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: activeStep === 0 ? 1 : 0.3, scale: activeStep === 0 ? 1 : 0.9, x: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute top-12 right-6 sm:right-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3.5 shadow-2xl z-30 max-w-[220px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#97CDAB]/20 flex items-center justify-center text-[#97CDAB]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Nature Connection</p>
                  <p className="text-[10px] text-white/60">Verified in 14 Days</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: activeStep === 1 ? 1 : 0.3, scale: activeStep === 1 ? 1 : 0.9, x: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-24 left-4 sm:left-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3.5 shadow-2xl z-30 max-w-[220px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Compass size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Stand out & earn trust</p>
                  <p className="text-[10px] text-white/60">AI Field Notebook</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: activeStep === 2 ? 1 : 0.3, scale: activeStep === 2 ? 1 : 0.9, y: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-6 right-10 sm:right-20 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3.5 shadow-2xl z-30 max-w-[220px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Launch faster & grow</p>
                  <p className="text-[10px] text-white/60">12,000+ Active Habitats</p>
                </div>
              </div>
            </motion.div>

          </div>

        </div>

        {/* Scroll hint indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 text-xs tracking-widest uppercase">
          <span>Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/40 flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1 h-2 bg-white rounded-full"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
