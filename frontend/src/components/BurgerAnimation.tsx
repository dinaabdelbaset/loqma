import { useEffect, useRef, useState, useTransition, useCallback } from 'react';
import gsap from 'gsap';
import { RotateCcw, Layers, CheckCircle2 } from 'lucide-react';

interface BurgerLayerConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  filename: string;
  zIndex: number;
  widthPercent: number;
  bottomOffsetPercent: number;
  explodedOffset: number; // Y offset in exploded view
  initialRotation: number;
  finalRotation: number;
}

// Stacking order from bottom to top:
// 1. burger-bottom (Base Bun)
// 2. burger-patty (Beef Patty)
// 3. cheese (Cheddar)
// 4. tomato (Tomato slice)
// 5. lettuce (Lettuce)
// 6. burger-top (Top Bun)
const BURGER_LAYERS: BurgerLayerConfig[] = [
  {
    id: 'bottom-bun',
    nameAr: 'خبز البرجر السفلي (Base Bun)',
    nameEn: 'Brioche Bun Bottom',
    filename: '/images/burger/burger-bottom.png',
    zIndex: 10,
    widthPercent: 82,
    bottomOffsetPercent: 8,
    explodedOffset: 120, // down
    initialRotation: 3,
    finalRotation: 0,
  },
  {
    id: 'patty',
    nameAr: 'شريحة لحم مشوية على الجريل',
    nameEn: 'Grilled Beef Patty',
    filename: '/images/burger/burger-patty.png',
    zIndex: 20,
    widthPercent: 78,
    bottomOffsetPercent: 18,
    explodedOffset: 70,
    initialRotation: -5,
    finalRotation: 0,
  },
  {
    id: 'cheese',
    nameAr: 'شريحة جبن شيدر ذائبة',
    nameEn: 'Melted Cheddar Cheese',
    filename: '/images/burger/cheese.png',
    zIndex: 30,
    widthPercent: 72,
    bottomOffsetPercent: 26,
    explodedOffset: 20,
    initialRotation: 7,
    finalRotation: 0,
  },
  {
    id: 'tomato',
    nameAr: 'شريحة طماطم طازجة',
    nameEn: 'Juicy Tomato Slice',
    filename: '/images/burger/tomato.png',
    zIndex: 40,
    widthPercent: 68,
    bottomOffsetPercent: 32,
    explodedOffset: -30,
    initialRotation: -4,
    finalRotation: 0,
  },
  {
    id: 'lettuce',
    nameAr: 'خس كريسبي مقرمش',
    nameEn: 'Crispy Fresh Lettuce',
    filename: '/images/burger/lettuce.png',
    zIndex: 50,
    widthPercent: 86,
    bottomOffsetPercent: 38,
    explodedOffset: -80,
    initialRotation: 5,
    finalRotation: 0,
  },
  {
    id: 'top-bun',
    nameAr: 'خبز البرجر الذهبي بالسمسم',
    nameEn: 'Sesame Brioche Bun Top',
    filename: '/images/burger/burger-top.png',
    zIndex: 60,
    widthPercent: 84,
    bottomOffsetPercent: 44,
    explodedOffset: -140, // up
    initialRotation: -3,
    finalRotation: 0,
  },
];

export default function BurgerAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [isExploded, setIsExploded] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [, startTransition] = useTransition();

  const buildAndPlayAnimation = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    startTransition(() => {
      setAnimationComplete(false);
      setIsExploded(false);
    });

    const tl = gsap.timeline({
      onComplete: () => {
        startTransition(() => {
          setAnimationComplete(true);
        });
      },
    });

    timelineRef.current = tl;

    // Reset initial states - all layers placed above the screen
    layerRefs.current.forEach((el, index) => {
      if (!el) return;
      const cfg = BURGER_LAYERS[index];
      gsap.set(el, {
        y: -850,
        opacity: 0,
        scale: 1.15,
        rotation: cfg.initialRotation,
        transformOrigin: '50% 50%',
      });
    });

    if (shadowRef.current) {
      gsap.set(shadowRef.current, { scale: 0.25, opacity: 0.15 });
    }

    // Short anticipation pause
    tl.to({}, { duration: 0.25 });

    // Animate layers sequentially from bottom to top
    BURGER_LAYERS.forEach((cfg, index) => {
      const el = layerRefs.current[index];
      if (!el) return;

      // Drop down timeline with satisfying bounce
      tl.to(
        el,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: cfg.finalRotation,
          duration: 0.65,
          ease: 'bounce.out',
        },
        index === 0 ? '+=0.05' : '-=0.32' // Fluid overlapping rhythm
      );

      // Micro-impact compression on the layers already landed below it
      if (index > 0) {
        const lowerLayers = layerRefs.current.slice(0, index).filter(Boolean);
        tl.to(
          lowerLayers,
          {
            scaleY: 0.94,
            duration: 0.07,
            yoyo: true,
            repeat: 1,
            ease: 'power1.out',
          },
          '<'
        );
      }

      // Shadow intensifies and expands as the burger grows taller and heavier
      if (shadowRef.current) {
        const progress = (index + 1) / BURGER_LAYERS.length;
        const shadowScale = 0.35 + progress * 0.65;
        const shadowOpacity = 0.25 + progress * 0.55;
        tl.to(
          shadowRef.current,
          {
            scale: shadowScale,
            opacity: shadowOpacity,
            duration: 0.35,
            ease: 'power2.out',
          },
          '<'
        );
      }
    });

    // Final celebration squash and bounce when burger is fully assembled
    tl.to(
      stageRef.current,
      {
        y: -14,
        scaleX: 1.02,
        scaleY: 0.98,
        duration: 0.2,
        ease: 'power2.out',
      },
      '+=0.08'
    ).to(stageRef.current, {
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.4,
      ease: 'bounce.out',
    });
  }, [startTransition]);

  // Run GSAP animation on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      buildAndPlayAnimation();
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [buildAndPlayAnimation]);

  // Toggle Exploded View (spacing out layers so user can inspect each ingredient)
  const toggleExplodedView = () => {
    if (!animationComplete) return;

    const nextState = !isExploded;
    setIsExploded(nextState);

    layerRefs.current.forEach((el, index) => {
      if (!el) return;
      const cfg = BURGER_LAYERS[index];
      if (nextState) {
        gsap.to(el, {
          y: cfg.explodedOffset,
          duration: 0.7,
          ease: 'back.out(1.5)',
        });
      } else {
        gsap.to(el, {
          y: 0,
          duration: 0.55,
          ease: 'power2.inOut',
        });
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[85vh] flex flex-col items-center justify-center py-6 px-4 overflow-hidden select-none"
    >
      {/* Dynamic Warm Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[340px] sm:w-[520px] h-[340px] sm:h-[520px] bg-[#8A9684]/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Burger Assembly Stage */}
      <div className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[450px] h-[380px] sm:h-[440px] flex items-center justify-center">
        
        {/* Dynamic Floor Shadow under Burger */}
        <div
          ref={shadowRef}
          className="absolute bottom-6 w-[75%] h-9 bg-black/45 rounded-[100%] blur-md pointer-events-none transition-transform"
        />

        {/* Serving Surface Accent */}
        <div className="absolute bottom-2 w-[88%] h-12 rounded-full border-b-4 border-amber-900/10 bg-gradient-to-b from-stone-200/50 to-stone-300/70 blur-[1px] -z-10 shadow-inner" />

        {/* Stack Stage Container */}
        <div
          ref={stageRef}
          className="relative w-full h-full flex items-center justify-center"
        >
          {BURGER_LAYERS.map((layer, index) => (
            <div
              key={layer.id}
              ref={(el) => {
                layerRefs.current[index] = el;
              }}
              style={{
                zIndex: layer.zIndex,
                width: `${layer.widthPercent}%`,
                bottom: `${layer.bottomOffsetPercent}%`,
              }}
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto group cursor-pointer"
            >
              <img
                src={layer.filename}
                alt={layer.nameAr}
                className="w-full h-auto object-contain drop-shadow-md select-none transition-transform duration-200 group-hover:scale-105"
                draggable={false}
              />

              {/* Tooltip on hover showing ingredient info */}
              {animationComplete && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute -top-8 px-2.5 py-1 rounded bg-[#3D312A]/90 text-white text-[11px] whitespace-nowrap shadow-lg backdrop-blur-xs flex items-center gap-1.5 z-50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A9684]" />
                  <span>{layer.nameAr}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="z-10 mt-4 flex flex-wrap items-center justify-center gap-3">
        {/* Replay Button */}
        <button
          id="replay-btn"
          onClick={buildAndPlayAnimation}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3D312A] hover:bg-[#2B221D] active:scale-95 text-[#F7F4EF] font-medium text-sm shadow-md border border-[#8A9684]/40 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#8A9684]" />
          <span>إعادة تشغيل الأنيميشن</span>
        </button>

        {/* Exploded / Compact Toggle */}
        <button
          id="explode-btn"
          onClick={toggleExplodedView}
          disabled={!animationComplete}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm border shadow-xs transition-all cursor-pointer ${
            animationComplete
              ? 'bg-white hover:bg-[#F7F4EF] border-[#D2C4B7] text-[#3D312A] active:scale-95'
              : 'bg-stone-100 border-[#D2C4B7] text-stone-400 cursor-not-allowed opacity-60'
          }`}
        >
          <Layers className="w-4 h-4 text-[#8A9684]" />
          <span>{isExploded ? 'إعادة ضم الطبقات' : 'استعراض الطبقات منفصلة (Exploded)'}</span>
        </button>
      </div>

      {/* Ingredient Indicators / Pills */}
      <div className="z-10 mt-4 flex flex-wrap items-center justify-center gap-2 max-w-xl">
        {BURGER_LAYERS.map((layer) => (
          <div
            key={layer.id}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#D2C4B7] text-[#3D312A] text-xs shadow-2xs backdrop-blur-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8A9684]" />
            <span>{layer.nameAr.split('(')[0].trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
