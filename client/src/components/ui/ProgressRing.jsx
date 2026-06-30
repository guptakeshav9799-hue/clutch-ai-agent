import { useEffect, useRef } from 'react';

export default function ProgressRing({ value = 0, size = 120, strokeWidth = 8, color, label }) {
  const canvasRef = useRef(null);
  const animatedValue = useRef(0);

  const getColor = (val) => {
    if (color) return color;
    if (val >= 75) return '#10B981';
    if (val >= 50) return '#3B82F6';
    if (val >= 25) return '#F59E0B';
    return '#EF4444';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let animFrame;
    const targetValue = Math.min(100, Math.max(0, value));
    const speed = 2;

    const draw = () => {
      if (Math.abs(animatedValue.current - targetValue) > 0.5) {
        animatedValue.current += (targetValue - animatedValue.current) * 0.08;
      } else {
        animatedValue.current = targetValue;
      }

      ctx.clearRect(0, 0, size, size);
      const center = size / 2;
      const radius = center - strokeWidth;

      // Background circle
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(45, 45, 61, 0.6)';
      ctx.lineWidth = strokeWidth;
      ctx.stroke();

      // Progress arc
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (animatedValue.current / 100) * Math.PI * 2;
      
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      const ringColor = getColor(animatedValue.current);
      gradient.addColorStop(0, ringColor);
      gradient.addColorStop(1, ringColor + '99');

      ctx.beginPath();
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Center text
      ctx.fillStyle = '#F8FAFC';
      ctx.font = `bold ${size * 0.25}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(animatedValue.current), center, label ? center - 8 : center);

      if (label) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = `500 ${size * 0.1}px Inter, sans-serif`;
        ctx.fillText(label, center, center + size * 0.15);
      }

      if (Math.abs(animatedValue.current - targetValue) > 0.5) {
        animFrame = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [value, size, strokeWidth, color, label]);

  return (
    <div className="progress-ring-container">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
