'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const orbs = [
        { x: width * 0.2, y: height * 0.25, radius: Math.min(width, height) * 0.28, color: 'rgba(124, 77, 255, 0.16)' },
        { x: width * 0.8, y: height * 0.7, radius: Math.min(width, height) * 0.3, color: 'rgba(6, 182, 212, 0.12)' },
        { x: width * 0.5, y: height * 0.85, radius: Math.min(width, height) * 0.24, color: 'rgba(236, 72, 153, 0.09)' },
      ];
      orbs.forEach((orb) => {
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(8, 4, 21, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      draw();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas id="bg-canvas" ref={canvasRef} />;
}
