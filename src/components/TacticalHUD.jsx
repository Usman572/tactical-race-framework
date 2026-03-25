import { useEffect, useRef } from "react";

const TacticalHUD = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    let angle = 0;
    const points = Array.from({ length: 5 }, () => ({
      x: Math.random() * 0.8 + 0.1,
      y: Math.random() * 0.8 + 0.1,
      opacity: Math.random(),
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.9;

      // Draw Radar Circles
      ctx.strokeStyle = "rgba(37, 99, 235, 0.2)";
      ctx.lineWidth = 1;
      [0.3, 0.6, 0.9].forEach((r) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw Crosshair
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // Scan Line
      angle += 0.02;
      const gradient = ctx.createConicGradient(angle, centerX, centerY);
      gradient.addColorStop(0, "rgba(37, 99, 235, 0.5)");
      gradient.addColorStop(0.1, "rgba(37, 99, 235, 0)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + 0.5);
      ctx.fill();

      // Radar Points
      points.forEach((p) => {
        const px = centerX + (p.x - 0.5) * radius * 2;
        const py = centerY + (p.y - 0.5) * radius * 2;
        
        ctx.fillStyle = `rgba(37, 99, 235, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pulse effect for points
        p.opacity -= 0.005;
        if (p.opacity <= 0) {
          p.x = Math.random() * 0.8 + 0.1;
          p.y = Math.random() * 0.8 + 0.1;
          p.opacity = 1;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] relative bg-slate-900/50 rounded-3xl overflow-hidden border border-white/5">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-4 left-4">
          <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Scanning Sector...</div>
      </div>
      <div className="absolute bottom-4 right-4 text-right">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Strength</div>
          <div className="flex gap-1 mt-1 justify-end">
              {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-1 h-3 rounded-full ${i < 4 ? 'bg-blue-500' : 'bg-slate-700'}`} />
              ))}
          </div>
      </div>
    </div>
  );
};

export default TacticalHUD;
