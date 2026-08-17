import { useRef, useEffect, useCallback, useState } from 'react';

const BG = 'transparent';
const PERSPECTIVE = 1300;

const DEFAULT_CENTRE = {
  voidColor: 'transparent',
  voidRadius: 35,
  voidX: 50,
  voidY: 50,
};

const DEFAULTS = {
  background: 'transparent',
  showCenter: true,
  centre: DEFAULT_CENTRE,
  particleCount: 758,
  particleSize: 1,
  colors: ['#4ADE80', '#22C55E', '#A7F3D0', '#ffffff', '#166534'],
  outerRadius: 100,
  tilt: 20,
  tiltSideway: 160,
  trail: 45,
  orbitSpeed: 1,
  pullSpeed: 0,
};

export default function BlackHole(props = {}) {
  const {
    background = DEFAULTS.background,
    showCenter = DEFAULTS.showCenter,
    centre,
    particleCount = DEFAULTS.particleCount,
    particleSize: particleSizeRaw = DEFAULTS.particleSize,
    colors = DEFAULTS.colors,
    outerRadius = DEFAULTS.outerRadius,
    tilt = DEFAULTS.tilt,
    tiltSideway = DEFAULTS.tiltSideway,
    trail: trailRaw = DEFAULTS.trail,
    orbitSpeed = DEFAULTS.orbitSpeed,
    pullSpeed: pullSpeedRaw = DEFAULTS.pullSpeed,
    style,
  } = props;

  const {
    voidColor: rawVoidColor,
    voidRadius: rawVoidRadius,
    voidX,
    voidY,
  } = {
    ...DEFAULT_CENTRE,
    ...centre,
  };

  const voidColor = rawVoidColor || 'transparent';
  const perspective = PERSPECTIVE;

  const particleSize = 0.5 + (Math.max(1, Math.min(50, particleSizeRaw ?? 20)) - 1) * (4 / 49);
  const pullSpeed = Math.max(0, pullSpeedRaw ?? 1) / 2;
  const trailAlpha = Math.max(0.02, 1 - (Math.max(0, trailRaw ?? 40) / 50) * 0.98);

  const voidRadius = showCenter !== false ? rawVoidRadius : 1;

  const outerRadFromSize = useCallback(
    (w, _h) => {
      const maxR = w / 2;
      const pct = Math.max(0, Math.min(100, outerRadius)) / 100;
      return voidRadius + pct * (maxR - voidRadius);
    },
    [voidRadius, outerRadius]
  );

  const canvasRef = useRef(null);
  const fgCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(0);
  const sizeRef = useRef({ w: 600, h: 600 });
  const [sizeVersion, setSizeVersion] = useState(0);

  const initParticles = useCallback(
    (count, horizonRad, outerRad, colorsLength) => {
      const pts = [];
      for (let i = 0; i < count; i++) {
        const radius = horizonRad + Math.pow(Math.random(), 2) * (outerRad - horizonRad);
        pts.push({
          angle: Math.random() * Math.PI * 2,
          radius,
          height: (Math.random() - 0.5) * 16,
          speedOffset: 0.75 + Math.random() * 0.5,
          colorIdx: Math.floor(Math.random() * colorsLength),
        });
      }
      particlesRef.current = pts;
    },
    []
  );

  useEffect(() => {
    const { w, h } = sizeRef.current;
    initParticles(
      particleCount,
      voidRadius,
      outerRadFromSize(w, h),
      colors.length
    );
  }, [
    particleCount,
    voidRadius,
    colors.length,
    initParticles,
    outerRadFromSize,
    sizeVersion,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    if (!container || !canvas || !fgCanvas) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        fgCanvas.width = width * dpr;
        fgCanvas.height = height * dpr;
        fgCanvas.style.width = `${width}px`;
        fgCanvas.style.height = `${height}px`;
        const prev = sizeRef.current;
        sizeRef.current = { w: width, h: height };
        if (prev.w !== width || prev.h !== height) {
          setSizeVersion((v) => v + 1);
        }
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    if (!canvas || !fgCanvas) return;
    const ctx = canvas.getContext('2d');
    const fgCtx = fgCanvas.getContext('2d');
    if (!ctx || !fgCtx) return;

    const clearLayers = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fgCtx.setTransform(1, 0, 0, 1, 0, 0);
      fgCtx.globalAlpha = 1;
      fgCtx.globalCompositeOperation = 'source-over';
      fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
    };
    clearLayers();

    let lastTime = performance.now();

    const draw = (now) => {
      const dt = Math.min((now - lastTime) / 16.667, 3);
      lastTime = now;

      const { w, h } = sizeRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.globalAlpha = 1.0;
      fgCtx.globalAlpha = 1.0;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      fgCtx.globalCompositeOperation = 'destination-out';
      fgCtx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
      fgCtx.fillRect(0, 0, w, h);
      fgCtx.globalCompositeOperation = 'source-over';

      const outerRad = outerRadFromSize(w, h);

      const voidCx = (voidX / 100) * w;
      const voidCy = (voidY / 100) * h;

      const pts = particlesRef.current;
      const tiltRad = (tilt * Math.PI) / 180;
      const tiltSidewayRad = (tiltSideway * Math.PI) / 180;

      const backgroundParticles = [];
      const foregroundParticles = [];

      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];

        const speedFactor = Math.sqrt(voidRadius / Math.max(pt.radius, 10));
        const localOrbitSpeed = orbitSpeed * speedFactor * pt.speedOffset;
        const localPullSpeed = pullSpeed * speedFactor * pt.speedOffset;

        pt.angle += localOrbitSpeed * 0.012 * dt;
        pt.radius -= localPullSpeed * dt;

        if (pt.radius < voidRadius) {
          pt.radius =
            voidRadius +
            0.7 * (outerRad - voidRadius) +
            Math.random() * 0.3 * (outerRad - voidRadius);
          pt.angle = Math.random() * Math.PI * 2;
          pt.height = (Math.random() - 0.5) * 16;
          continue;
        }

        const cosA = Math.cos(pt.angle);
        const sinA = Math.sin(pt.angle);

        const x_base = pt.radius * cosA;
        const y_base = pt.height;
        const z_base = pt.radius * sinA;

        const x1 = x_base;
        const y1 = y_base * Math.cos(tiltRad) + z_base * Math.sin(tiltRad);
        const z1 = -y_base * Math.sin(tiltRad) + z_base * Math.cos(tiltRad);

        const x3d = x1 * Math.cos(tiltSidewayRad) - y1 * Math.sin(tiltSidewayRad);
        const y3d = x1 * Math.sin(tiltSidewayRad) + y1 * Math.cos(tiltSidewayRad);
        const z3d = z1;

        const scale = perspective / (perspective + z3d);
        const px = voidCx + x3d * scale;
        const py = voidCy + y3d * scale;

        if (px < -30 || px > w + 30 || py < -30 || py > h + 30) continue;

        const size = Math.max(0.3, particleSize * scale);
        const alpha = Math.max(0.35, 1 - ((z3d + outerRad) / (2 * outerRad)) * 0.45);
        const color = colors[pt.colorIdx % colors.length];

        const projectedPt = {
          x: px,
          y: py,
          size,
          alpha,
          z: z3d,
          color,
        };

        if (z3d >= 0) {
          backgroundParticles.push(projectedPt);
        } else {
          foregroundParticles.push(projectedPt);
        }
      }

      backgroundParticles.sort((a, b) => b.z - a.z);
      foregroundParticles.sort((a, b) => b.z - a.z);

      for (let i = 0; i < backgroundParticles.length; i++) {
        const pt = backgroundParticles[i];
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      if (showCenter !== false) {
        const hexToRgb = (colorStr) => {
          let r = 0, g = 0, b = 0, a = 1;
          if (!colorStr) return { r, g, b, a };

          if (colorStr.startsWith('#')) {
            const hex = colorStr.replace('#', '');
            if (hex.length === 3 || hex.length === 4) {
              r = parseInt(hex[0] + hex[0], 16);
              g = parseInt(hex[1] + hex[1], 16);
              b = parseInt(hex[2] + hex[2], 16);
              if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255;
            } else if (hex.length >= 6) {
              r = parseInt(hex.substring(0, 2), 16);
              g = parseInt(hex.substring(2, 4), 16);
              b = parseInt(hex.substring(4, 6), 16);
              if (hex.length >= 8) a = parseInt(hex.substring(6, 8), 16) / 255;
            }
          } else if (colorStr.startsWith('rgb')) {
            const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
            if (match) {
              r = parseInt(match[1]);
              g = parseInt(match[2]);
              b = parseInt(match[3]);
              if (match[4] !== undefined) a = parseFloat(match[4]);
            }
          }
          return { r, g, b, a };
        };
        const voidRgb = hexToRgb(voidColor);

        const sphereGrad = ctx.createRadialGradient(
          voidCx - voidRadius * 0.25,
          voidCy - voidRadius * 0.3,
          voidRadius * 0.05,
          voidCx,
          voidCy,
          voidRadius
        );
        const edgeR = Math.min(255, voidRgb.r + 18);
        const edgeG = Math.min(255, voidRgb.g + 18);
        const edgeB = Math.min(255, voidRgb.b + 18);
        const voidAlpha = voidRgb.a;

        sphereGrad.addColorStop(
          0,
          `rgba(${Math.min(255, voidRgb.r + 8)}, ${Math.min(255, voidRgb.g + 8)}, ${Math.min(255, voidRgb.b + 8)}, ${voidAlpha})`
        );
        sphereGrad.addColorStop(
          0.65,
          `rgba(${voidRgb.r}, ${voidRgb.g}, ${voidRgb.b}, ${voidAlpha})`
        );
        sphereGrad.addColorStop(
          0.92,
          `rgba(${edgeR}, ${edgeG}, ${edgeB}, ${voidAlpha})`
        );
        sphereGrad.addColorStop(
          1,
          `rgba(${edgeR}, ${edgeG}, ${edgeB}, ${voidAlpha * 0.9})`
        );

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(voidCx, voidCy, voidRadius, 0, Math.PI * 2);
        ctx.fill();

        const rimGrad = ctx.createRadialGradient(
          voidCx,
          voidCy,
          voidRadius * 0.88,
          voidCx,
          voidCy,
          voidRadius * 1.02
        );
        rimGrad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        rimGrad.addColorStop(0.6, `rgba(180, 180, 200, 0.06)`);
        rimGrad.addColorStop(0.85, `rgba(180, 180, 200, 0.12)`);
        rimGrad.addColorStop(1, `rgba(180, 180, 200, 0)`);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(voidCx, voidCy, voidRadius * 1.02, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < foregroundParticles.length; i++) {
        const pt = foregroundParticles[i];
        fgCtx.globalAlpha = pt.alpha;
        fgCtx.fillStyle = pt.color;
        fgCtx.beginPath();
        fgCtx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        fgCtx.fill();
      }
      fgCtx.globalAlpha = 1.0;

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [
    voidX,
    voidY,
    voidRadius,
    voidColor,
    showCenter,
    particleCount,
    particleSize,
    JSON.stringify(colors),
    outerRadFromSize,
    tilt,
    tiltSideway,
    trailAlpha,
    orbitSpeed,
    pullSpeed,
    perspective,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background,
        ...style,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <canvas
        ref={fgCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
