"use client";

import { useEffect, useRef } from "react";

/* Theme: primary #572BAE, accent #8465C2 (from globals.css) */
const PRIMARY = { r: 87, g: 43, b: 174 };
const ACCENT = { r: 132, g: 101, b: 194 };
const ACCENT_LIGHT = { r: 196, g: 181, b: 230 };

interface Particle {
  x: number;
  y: number;
  pathIndex: number;
  progress: number;
  speed: number;
  size: number;
  opacity: number;
}

interface CircuitPath {
  points: { x: number; y: number }[];
  length: number;
}

function getPathLength(points: { x: number; y: number }[]) {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

function getPointAtProgress(points: { x: number; y: number }[], progress: number) {
  const totalLength = getPathLength(points);
  let targetLength = progress * totalLength;
  let accumulated = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const segLength = Math.sqrt(dx * dx + dy * dy);

    if (accumulated + segLength >= targetLength) {
      const t = (targetLength - accumulated) / segLength;
      return {
        x: points[i - 1].x + dx * t,
        y: points[i - 1].y + dy * t,
      };
    }
    accumulated += segLength;
  }
  return points[points.length - 1];
}

export default function NeuralCircuit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const processorGlowRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const pathsRef = useRef<CircuitPath[]>([]);
  const timeRef = useRef(0);
  const scaleRef = useRef(1.85);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initPaths(rect.width, rect.height);
    }

    function initPaths(w: number, h: number) {
      const cx = w / 2;
      const cy = h / 2;
      const paths: CircuitPath[] = [];

      paths.push({ points: [{ x: cx - 55, y: cy - 55 }, { x: cx - 100, y: cy - 55 }, { x: cx - 100, y: cy - 100 }, { x: cx - 160, y: cy - 100 }, { x: cx - 200, y: cy - 100 }], length: 0 });
      paths.push({ points: [{ x: cx - 55, y: cy - 40 }, { x: cx - 120, y: cy - 40 }, { x: cx - 150, y: cy - 70 }, { x: cx - 220, y: cy - 70 }], length: 0 });
      paths.push({ points: [{ x: cx - 55, y: cy - 25 }, { x: cx - 130, y: cy - 25 }, { x: cx - 170, y: cy - 50 }, { x: cx - 240, y: cy - 50 }, { x: cx - 300, y: cy - 50 }], length: 0 });
      paths.push({ points: [{ x: cx - 55, y: cy - 10 }, { x: cx - 140, y: cy - 10 }, { x: cx - 180, y: cy - 30 }, { x: cx - 260, y: cy - 30 }, { x: cx - 340, y: cy - 30 }], length: 0 });
      paths.push({ points: [{ x: cx - 55, y: cy + 5 }, { x: cx - 120, y: cy + 5 }, { x: cx - 160, y: cy + 5 }, { x: cx - 200, y: cy - 10 }, { x: cx - 280, y: cy - 10 }, { x: cx - 360, y: cy - 10 }], length: 0 });
      paths.push({ points: [{ x: cx - 55, y: cy + 20 }, { x: cx - 110, y: cy + 20 }, { x: cx - 150, y: cy + 20 }, { x: cx - 190, y: cy + 10 }, { x: cx - 300, y: cy + 10 }], length: 0 });
      paths.push({ points: [{ x: cx - 55, y: cy + 35 }, { x: cx - 130, y: cy + 35 }, { x: cx - 160, y: cy + 55 }, { x: cx - 240, y: cy + 55 }], length: 0 });
      paths.push({ points: [{ x: cx - 55, y: cy + 50 }, { x: cx - 100, y: cy + 50 }, { x: cx - 130, y: cy + 75 }, { x: cx - 200, y: cy + 75 }, { x: cx - 280, y: cy + 75 }], length: 0 });
      paths.push({ points: [{ x: cx - 40, y: cy + 55 }, { x: cx - 40, y: cy + 90 }, { x: cx - 80, y: cy + 110 }, { x: cx - 160, y: cy + 110 }, { x: cx - 220, y: cy + 110 }], length: 0 });
      paths.push({ points: [{ x: cx - 25, y: cy + 55 }, { x: cx - 25, y: cy + 80 }, { x: cx - 60, y: cy + 130 }, { x: cx - 140, y: cy + 130 }], length: 0 });
      paths.push({ points: [{ x: cx - 40, y: cy - 55 }, { x: cx - 40, y: cy - 85 }, { x: cx - 70, y: cy - 110 }, { x: cx - 150, y: cy - 110 }], length: 0 });
      paths.push({ points: [{ x: cx - 20, y: cy - 55 }, { x: cx - 20, y: cy - 95 }, { x: cx - 50, y: cy - 130 }, { x: cx - 120, y: cy - 130 }, { x: cx - 200, y: cy - 130 }], length: 0 });

      paths.push({ points: [{ x: cx + 55, y: cy - 55 }, { x: cx + 100, y: cy - 55 }, { x: cx + 100, y: cy - 100 }, { x: cx + 160, y: cy - 100 }, { x: cx + 200, y: cy - 100 }], length: 0 });
      paths.push({ points: [{ x: cx + 55, y: cy - 40 }, { x: cx + 120, y: cy - 40 }, { x: cx + 150, y: cy - 70 }, { x: cx + 220, y: cy - 70 }], length: 0 });
      paths.push({ points: [{ x: cx + 55, y: cy - 25 }, { x: cx + 130, y: cy - 25 }, { x: cx + 170, y: cy - 50 }, { x: cx + 240, y: cy - 50 }, { x: cx + 300, y: cy - 50 }], length: 0 });
      paths.push({ points: [{ x: cx + 55, y: cy - 10 }, { x: cx + 140, y: cy - 10 }, { x: cx + 180, y: cy - 30 }, { x: cx + 260, y: cy - 30 }, { x: cx + 340, y: cy - 30 }], length: 0 });
      paths.push({ points: [{ x: cx + 55, y: cy + 5 }, { x: cx + 120, y: cy + 5 }, { x: cx + 160, y: cy + 5 }, { x: cx + 200, y: cy - 10 }, { x: cx + 280, y: cy - 10 }, { x: cx + 360, y: cy - 10 }], length: 0 });
      paths.push({ points: [{ x: cx + 55, y: cy + 20 }, { x: cx + 110, y: cy + 20 }, { x: cx + 150, y: cy + 20 }, { x: cx + 190, y: cy + 10 }, { x: cx + 300, y: cy + 10 }], length: 0 });
      paths.push({ points: [{ x: cx + 55, y: cy + 35 }, { x: cx + 130, y: cy + 35 }, { x: cx + 160, y: cy + 55 }, { x: cx + 240, y: cy + 55 }], length: 0 });
      paths.push({ points: [{ x: cx + 55, y: cy + 50 }, { x: cx + 100, y: cy + 50 }, { x: cx + 130, y: cy + 75 }, { x: cx + 200, y: cy + 75 }, { x: cx + 280, y: cy + 75 }], length: 0 });
      paths.push({ points: [{ x: cx + 40, y: cy + 55 }, { x: cx + 40, y: cy + 90 }, { x: cx + 80, y: cy + 110 }, { x: cx + 160, y: cy + 110 }, { x: cx + 220, y: cy + 110 }], length: 0 });
      paths.push({ points: [{ x: cx + 25, y: cy + 55 }, { x: cx + 25, y: cy + 80 }, { x: cx + 60, y: cy + 130 }, { x: cx + 140, y: cy + 130 }], length: 0 });
      paths.push({ points: [{ x: cx + 40, y: cy - 55 }, { x: cx + 40, y: cy - 85 }, { x: cx + 70, y: cy - 110 }, { x: cx + 150, y: cy - 110 }], length: 0 });
      paths.push({ points: [{ x: cx + 20, y: cy - 55 }, { x: cx + 20, y: cy - 95 }, { x: cx + 50, y: cy - 130 }, { x: cx + 120, y: cy - 130 }, { x: cx + 200, y: cy - 130 }], length: 0 });

      paths.push({ points: [{ x: cx - 55, y: cy - 45 }, { x: cx - 75, y: cy - 60 }, { x: cx - 85, y: cy - 80 }, { x: cx - 75, y: cy - 95 }, { x: cx - 55, y: cy - 100 }, { x: cx - 35, y: cy - 95 }], length: 0 });
      paths.push({ points: [{ x: cx - 55, y: cy + 45 }, { x: cx - 75, y: cy + 60 }, { x: cx - 85, y: cy + 80 }, { x: cx - 75, y: cy + 95 }, { x: cx - 55, y: cy + 100 }, { x: cx - 35, y: cy + 95 }], length: 0 });
      paths.push({ points: [{ x: cx + 55, y: cy - 45 }, { x: cx + 75, y: cy - 60 }, { x: cx + 85, y: cy - 80 }, { x: cx + 75, y: cy - 95 }, { x: cx + 55, y: cy - 100 }, { x: cx + 35, y: cy - 95 }], length: 0 });
      paths.push({ points: [{ x: cx + 55, y: cy + 45 }, { x: cx + 75, y: cy + 60 }, { x: cx + 85, y: cy + 80 }, { x: cx + 75, y: cy + 95 }, { x: cx + 55, y: cy + 100 }, { x: cx + 35, y: cy + 95 }], length: 0 });

      const maxPathX = 360;
      const maxPathY = 130;
      const scaleX = (0.4 * w) / (maxPathX * 1.25);
      const scaleY = (0.4 * h) / maxPathY;
      const scale = Math.max(scaleX, scaleY);
      scaleRef.current = scale;
      for (const p of paths) {
        for (const pt of p.points) {
          pt.x = cx + (pt.x - cx) * scale * 1.25;
          pt.y = cy + (pt.y - cy) * scale;
        }
        p.length = getPathLength(p.points);
      }
      pathsRef.current = paths;

      const particles: Particle[] = [];
      for (let i = 0; i < paths.length * 2; i++) {
        particles.push({
          x: 0, y: 0,
          pathIndex: Math.floor(Math.random() * paths.length),
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.004,
          size: 1.5 + Math.random() * 2,
          opacity: 0.6 + Math.random() * 0.4,
        });
      }
      particlesRef.current = particles;
    }

    function drawCircuitPath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], baseOpacity: number) {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${baseOpacity * 0.35})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      for (let i = 0; i < points.length; i++) {
        if (i === 0 || i === points.length - 1) {
          ctx.beginPath();
          ctx.arc(points[i].x, points[i].y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${baseOpacity * 0.6})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(points[i].x, points[i].y, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${PRIMARY.r}, ${PRIMARY.g}, ${PRIMARY.b}, ${baseOpacity * 0.15})`;
          ctx.fill();
        } else if (Math.random() < 0.02) {
          ctx.beginPath();
          ctx.arc(points[i].x, points[i].y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${baseOpacity * 0.4})`;
          ctx.fill();
        }
      }
    }

    function drawProcessor(ctx: CanvasRenderingContext2D, cx: number, cy: number, glowIntensity: number, scale: number) {
      const size = 50 * scale;
      const half = size / 2;
      const glowRadius = (60 + glowIntensity * 20) * scale;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      gradient.addColorStop(0, `rgba(${PRIMARY.r}, ${PRIMARY.g}, ${PRIMARY.b}, ${0.15 + glowIntensity * 0.2})`);
      gradient.addColorStop(0.5, `rgba(${PRIMARY.r}, ${PRIMARY.g}, ${PRIMARY.b}, ${0.05 + glowIntensity * 0.1})`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(cx - glowRadius, cy - glowRadius, glowRadius * 2, glowRadius * 2);

      ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${0.4 + glowIntensity * 0.4})`;
      ctx.lineWidth = Math.max(1.5, 2 * scale);
      ctx.strokeRect(cx - half, cy - half, size, size);
      ctx.fillStyle = `rgba(${PRIMARY.r}, ${PRIMARY.g}, ${PRIMARY.b}, ${0.08 + glowIntensity * 0.15})`;
      ctx.fillRect(cx - half, cy - half, size, size);

      const innerSize = 30 * scale;
      const innerHalf = innerSize / 2;
      ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${0.3 + glowIntensity * 0.3})`;
      ctx.lineWidth = Math.max(0.8, 1 * scale);
      ctx.strokeRect(cx - innerHalf, cy - innerHalf, innerSize, innerSize);
      ctx.fillStyle = `rgba(${PRIMARY.r}, ${PRIMARY.g}, ${PRIMARY.b}, ${0.05 + glowIntensity * 0.1})`;
      ctx.fillRect(cx - innerHalf, cy - innerHalf, innerSize, innerSize);

      const pinCount = 5;
      const pinSpacing = size / (pinCount + 1);
      const pinLength = 10 * scale;
      ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${0.3 + glowIntensity * 0.3})`;
      ctx.lineWidth = Math.max(1, 1.5 * scale);
      for (let i = 1; i <= pinCount; i++) {
        const px = cx - half + i * pinSpacing;
        ctx.beginPath();
        ctx.moveTo(px, cy - half);
        ctx.lineTo(px, cy - half - pinLength);
        ctx.stroke();
      }
      for (let i = 1; i <= pinCount; i++) {
        const px = cx - half + i * pinSpacing;
        ctx.beginPath();
        ctx.moveTo(px, cy + half);
        ctx.lineTo(px, cy + half + pinLength);
        ctx.stroke();
      }
      for (let i = 1; i <= pinCount; i++) {
        const py = cy - half + i * pinSpacing;
        ctx.beginPath();
        ctx.moveTo(cx - half, py);
        ctx.lineTo(cx - half - pinLength, py);
        ctx.stroke();
      }
      for (let i = 1; i <= pinCount; i++) {
        const py = cy - half + i * pinSpacing;
        ctx.beginPath();
        ctx.moveTo(cx + half, py);
        ctx.lineTo(cx + half + pinLength, py);
        ctx.stroke();
      }

      const centerRadius = (3 + glowIntensity * 2) * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, centerRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT_LIGHT.r}, ${ACCENT_LIGHT.g}, ${ACCENT_LIGHT.b}, ${0.6 + glowIntensity * 0.4})`;
      ctx.fill();
    }

    function drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, glowIntensity: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${0.3 + glowIntensity * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = `rgba(${PRIMARY.r}, ${PRIMARY.g}, ${PRIMARY.b}, ${0.1 + glowIntensity * 0.15})`;
      ctx.fill();
    }

    function animate() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);
      timeRef.current += 0.016;
      processorGlowRef.current = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(timeRef.current * 1.5));
      const baseFade = 0.6 + 0.4 * Math.sin(timeRef.current * 0.5);
      for (const path of pathsRef.current) drawCircuitPath(ctx, path.points, baseFade);

      for (const particle of particlesRef.current) {
        particle.progress += particle.speed;
        if (particle.progress > 1) {
          particle.progress = 0;
          particle.pathIndex = Math.floor(Math.random() * pathsRef.current.length);
          particle.speed = 0.002 + Math.random() * 0.004;
        }
        const path = pathsRef.current[particle.pathIndex];
        if (!path) continue;
        const pos = getPointAtProgress(path.points, particle.progress);
        particle.x = pos.x;
        particle.y = pos.y;
        const grd = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 4);
        grd.addColorStop(0, `rgba(${ACCENT_LIGHT.r}, ${ACCENT_LIGHT.g}, ${ACCENT_LIGHT.b}, ${particle.opacity * 0.8})`);
        grd.addColorStop(0.5, `rgba(${ACCENT.r}, ${ACCENT.g}, ${ACCENT.b}, ${particle.opacity * 0.3})`);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(particle.x - particle.size * 4, particle.y - particle.size * 4, particle.size * 8, particle.size * 8);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT_LIGHT.r}, ${ACCENT_LIGHT.g}, ${ACCENT_LIGHT.b}, ${particle.opacity})`;
        ctx.fill();
      }

      drawProcessor(ctx, cx, cy, processorGlowRef.current, scaleRef.current);
      const s = scaleRef.current;
      const hexPositions = [
        { x: cx - 80 * s, y: cy - 30 * s }, { x: cx - 80 * s, y: cy + 30 * s }, { x: cx + 80 * s, y: cy - 30 * s },
        { x: cx + 80 * s, y: cy + 30 * s }, { x: cx, y: cy - 80 * s }, { x: cx, y: cy + 80 * s },
      ];
      for (const pos of hexPositions) {
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 2 + pos.x * 0.01);
        drawHexagon(ctx, pos.x, pos.y, 6 * s, pulse);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
