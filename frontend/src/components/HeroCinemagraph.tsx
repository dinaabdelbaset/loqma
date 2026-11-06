import { useEffect, useRef } from 'react';
import heroArchImg from '../assets/boho_hero_arch_clean.png';

interface HeroCinemagraphProps {
  onOrderMolokhia?: () => void;
}

export default function HeroCinemagraph({ onOrderMolokhia }: HeroCinemagraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // سينماجراف البخار الحي - محاكاة بخار حقيقي ناعم متصاعد بانسيابية 60 إطار بالثانية
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || 500);
    let height = (canvas.height = canvas.offsetHeight || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    interface SteamParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      maxSize: number;
      opacity: number;
      maxOpacity: number;
      life: number;
      maxLife: number;
    }

    const particles: SteamParticle[] = [];
    const maxParticles = 35;

    const createParticle = (): SteamParticle => {
      const potX = width * 0.46 + Math.random() * (width * 0.32);
      const potY = height * 0.68 + Math.random() * (height * 0.08);
      const maxLife = 90 + Math.random() * 80;

      return {
        x: potX,
        y: potY,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -(0.55 + Math.random() * 0.65),
        size: 14 + Math.random() * 12,
        maxSize: 38 + Math.random() * 28,
        opacity: 0,
        maxOpacity: 0.16 + Math.random() * 0.14,
        life: 0,
        maxLife,
      };
    };

    for (let i = 0; i < maxParticles; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife;
      p.y += p.vy * p.life;
      particles.push(p);
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx + Math.sin(p.life * 0.04) * 0.25;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        const currentSize = p.size + (p.maxSize - p.size) * progress;

        let currentOpacity = 0;
        if (progress < 0.25) {
          currentOpacity = (progress / 0.25) * p.maxOpacity;
        } else {
          currentOpacity = p.maxOpacity * (1 - (progress - 0.25) / 0.75);
        }

        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          currentSize * 0.08,
          p.x,
          p.y,
          currentSize
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 1.2})`);
        grad.addColorStop(0.45, `rgba(250, 246, 238, ${currentOpacity * 0.8})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife || p.y < height * 0.2) {
          particles[i] = createParticle();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative max-w-sm sm:max-w-md w-full mx-auto select-none group">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#3D312A]/15 border border-[#D2C4B7] bg-[#F7F4EF]">
        <img
          src={heroArchImg}
          alt="طاجن ملوخية مصري بالتقلية والعيش البلدي في قوس بوهيمي"
          className="w-full h-auto object-contain block transition-transform duration-700 group-hover:scale-[1.01]"
        />

        {/* طبقة البخار الواقعي المتصاعد بانسيابية */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-95"
        />

        {/* بادج أنيق هادئ في الأعلى */}
        <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 bg-[#3D312A]/75 backdrop-blur-md text-[#F7F4EF] px-3.5 py-1 rounded-full text-[11px] font-bold border border-white/20 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#8A9684] animate-pulse" />
          <span>طاجن فخار أسواني أصيل</span>
        </div>
      </div>

      {onOrderMolokhia && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={onOrderMolokhia}
            className="text-xs font-bold text-[#8A9684] hover:text-[#788572] inline-flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>اطلب هذا الطاجن طازة الآن مع العيش البلدي والأرز</span>
            <span>←</span>
          </button>
        </div>
      )}
    </div>
  );
}
