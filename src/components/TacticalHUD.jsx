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
      const radius = Math.min(centerX, centerY) * 0.85;

      // Draw Grid Background (Subtle)
      ctx.strokeStyle = "rgba(37, 99, 235, 0.05)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw Radar Circles
      ctx.strokeStyle = "rgba(37, 99, 235, 0.15)";
      ctx.lineWidth = 1;
      [0.2, 0.4, 0.6, 0.8, 1.0].forEach((r) => {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Draw Crosshair (Tactical)
      ctx.strokeStyle = "rgba(37, 99, 235, 0.3)";
      ctx.beginPath();
      ctx.moveTo(centerX - radius - 20, centerY);
      ctx.lineTo(centerX + radius + 20, centerY);
      ctx.moveTo(centerX, centerY - radius - 20);
      ctx.lineTo(centerX, centerY + radius + 20);
      ctx.stroke();

      // Scan Line (Premium Gradient)
      angle += 0.015;
      const scanGradient = ctx.createConicGradient(angle, centerX, centerY);
      scanGradient.addColorStop(0, "rgba(37, 99, 235, 0.4)");
      scanGradient.addColorStop(0.2, "rgba(37, 99, 235, 0)");
      
      ctx.fillStyle = scanGradient;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + 0.8);
      ctx.fill();

      // Radar Points (Operatives)
      points.forEach((p) => {
        const px = centerX + (p.x - 0.5) * radius * 2.2;
        const py = centerY + (p.y - 0.5) * radius * 2.2;
        
        // Point Core
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(37, 99, 235, 1)";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Point Ring
        ctx.strokeStyle = `rgba(59, 130, 246, ${p.opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(px, py, 8 + (1 - p.opacity) * 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Label (Simulated ID)
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity * 0.7})`;
        ctx.font = "bold 8px 'JetBrains Mono', monospace";
        ctx.fillText(`OP_${Math.floor(p.x * 1000)}`, px + 12, py - 12);
        
        p.opacity -= 0.003;
        if (p.opacity <= 0) {
          p.x = Math.random() * 0.8 + 0.1;
          p.y = Math.random() * 0.8 + 0.1;
          p.opacity = 0.8 + Math.random() * 0.2;
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
    <div className="w-full h-full min-h-[400px] relative bg-[var(--bg-main)]/50 rounded-[2.5rem] overflow-hidden border border-[var(--border-main)] shadow-2xl group/hud hover:border-blue-500/20 transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-black/20 pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full grayscale-[0.5] group-hover/hud:grayscale-0 transition-all duration-700" />
      
      {/* HUD Overlays */}
      <div className="absolute top-8 left-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shadow-glow-primary" />
            <div className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] italic">SECTOR_SCAN_ACTIVE</div>
          </div>
          <div className="text-[9px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-[0.2em] ml-5 italic">COORD: 40.7128° N, 74.0060° W</div>
      </div>

      <div className="absolute bottom-8 right-8 text-right space-y-4">
          <div>
            <div className="text-[9px] font-black text-[var(--text-main)] opacity-20 uppercase tracking-[0.4em] italic mb-2">Signal_Lock</div>
            <div className="flex gap-1.5 justify-end">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <motion.div 
                        key={i} 
                        initial={{ height: 4 }}
                        animate={{ height: i < 5 ? (8 + Math.random() * 12) : 4 }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        className={`w-1.5 rounded-full ${i < 5 ? 'bg-blue-600 shadow-glow-primary' : 'bg-[var(--border-main)]'}`} 
                    />
                ))}
            </div>
          </div>
          <div className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-500 uppercase tracking-widest italic animate-pulse shadow-xl">
            UPLINK_STABLE
          </div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-blue-500/30 rounded-tl-[2.5rem]" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-blue-500/30 rounded-tr-[2.5rem]" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-blue-500/30 rounded-bl-[2.5rem]" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-blue-500/30 rounded-br-[2.5rem]" />
    </div>
  );
};

export default TacticalHUD;
