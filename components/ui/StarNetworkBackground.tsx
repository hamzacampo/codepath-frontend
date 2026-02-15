"use client";

import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  baseSize: number;
  vx: number;
  vy: number;
  vz: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  glowRadius: number;
}

const STAR_COUNT = 50;
const CONNECTION_DISTANCE = 180;
const MAX_CONNECTIONS_PER_STAR = 3;
const DEPTH = 400;
const TARGET_FPS = 30;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;

function createStar(width: number, height: number): Star {
  const baseSize = Math.random() * 6.5 + 0.8;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * DEPTH,
    size: baseSize,
    baseSize,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    vz: (Math.random() - 0.5) * 0.15,
    brightness: Math.random() * 0.5 + 0.5,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    twinkleOffset: Math.random() * Math.PI * 2,
    glowRadius: baseSize * (Math.random() * 6 + 4),
  };
}

export function StarNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const getProjected = useCallback((star: Star) => {
    const scale = DEPTH / (DEPTH + star.z);
    return { scale };
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      ctx.clearRect(0, 0, width, height);

      const stars = starsRef.current;

      // Update star positions
      for (const star of stars) {
        star.x += star.vx;
        star.y += star.vy;
        star.z += star.vz;

        // Wrap around edges with padding
        if (star.x < -50) star.x = width + 50;
        if (star.x > width + 50) star.x = -50;
        if (star.y < -50) star.y = height + 50;
        if (star.y > height + 50) star.y = -50;
        if (star.z < 0) star.z = DEPTH;
        if (star.z > DEPTH) star.z = 0;

        // Mouse interaction - gentle repulsion
        if (mouseRef.current.active) {
          const dx = star.x - mouseRef.current.x;
          const dy = star.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 0) {
            const force = ((150 - dist) / 150) * 0.15;
            star.vx += (dx / dist) * force;
            star.vy += (dy / dist) * force;
          }
        }

        // Dampen velocity
        star.vx *= 0.999;
        star.vy *= 0.999;

        // Calculate twinkle
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        star.brightness = 0.5 + twinkle * 0.3;

        const { scale } = getProjected(star);
        star.size = star.baseSize * scale;
      }

      // Draw connections first (behind stars)
      for (let i = 0; i < stars.length; i++) {
        let connections = 0;
        const starA = stars[i];
        const scaleA = DEPTH / (DEPTH + starA.z);

        for (let j = i + 1; j < stars.length; j++) {
          if (connections >= MAX_CONNECTIONS_PER_STAR) break;

          const starB = stars[j];
          const dx = starA.x - starB.x;
          const dy = starA.y - starB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Adjust connection distance by depth
          const scaleB = DEPTH / (DEPTH + starB.z);
          const avgScale = (scaleA + scaleB) / 2;
          const adjustedDist = CONNECTION_DISTANCE * avgScale;

          if (dist < adjustedDist) {
            const opacity = (1 - dist / adjustedDist) * 0.35 * avgScale;
            const avgBrightness = (starA.brightness + starB.brightness) / 2;
            const lineAlpha = opacity * avgBrightness * 0.6;

            ctx.beginPath();
            ctx.moveTo(starA.x, starA.y);
            ctx.lineTo(starB.x, starB.y);
            ctx.strokeStyle = `rgba(195, 185, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.5 * avgScale;
            ctx.stroke();

            connections++;
          }
        }
      }

      // Draw stars (on top of connections)
      for (const star of stars) {
        const { scale } = getProjected(star);
        const projectedSize = star.size;
        const alpha = star.brightness * scale;

        // Outer soft glow
        const glowSize = star.glowRadius * scale;
        const outerGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
        outerGlow.addColorStop(0, `rgba(200, 190, 255, ${alpha * 0.4})`);
        outerGlow.addColorStop(0.3, `rgba(180, 170, 240, ${alpha * 0.15})`);
        outerGlow.addColorStop(0.6, `rgba(160, 150, 220, ${alpha * 0.05})`);
        outerGlow.addColorStop(1, `rgba(140, 130, 200, 0)`);

        ctx.beginPath();
        ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();

        // Inner bright core
        const innerGlow = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          projectedSize * 2
        );
        innerGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
        innerGlow.addColorStop(0.4, `rgba(230, 225, 255, ${alpha * 0.6})`);
        innerGlow.addColorStop(1, `rgba(200, 190, 255, 0)`);

        ctx.beginPath();
        ctx.arc(star.x, star.y, projectedSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = innerGlow;
        ctx.fill();

        // Star point core
        ctx.beginPath();
        ctx.arc(star.x, star.y, projectedSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Cross-hair shine for larger stars
        if (star.baseSize > 1.5) {
          const shineLength = projectedSize * 4;
          const shineAlpha = alpha * 0.3;

          ctx.beginPath();
          ctx.moveTo(star.x - shineLength, star.y);
          ctx.lineTo(star.x + shineLength, star.y);
          ctx.strokeStyle = `rgba(220, 215, 255, ${shineAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(star.x, star.y - shineLength);
          ctx.lineTo(star.x, star.y + shineLength);
          ctx.strokeStyle = `rgba(220, 215, 255, ${shineAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    },
    [getProjected]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Reinitialize stars if needed
      if (starsRef.current.length === 0) {
        starsRef.current = Array.from({ length: STAR_COUNT }, () =>
          createStar(window.innerWidth, window.innerHeight)
        );
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    let startTime = performance.now();
    let lastDrawTime = 0;

    const animate = (timestamp: number) => {
      animationRef.current = requestAnimationFrame(animate);
      const elapsed = timestamp - lastDrawTime;
      if (elapsed < FRAME_INTERVAL_MS) return;
      lastDrawTime = timestamp - (elapsed % FRAME_INTERVAL_MS);
      const time = (timestamp - startTime) / 1000;
      draw(ctx, window.innerWidth, window.innerHeight, time);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}

