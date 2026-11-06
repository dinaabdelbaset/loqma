import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Sparkles } from 'lucide-react';

/**
 * مدير مركزي لتشغيل الفيديو (Global Video Playback Manager)
 * يضمن عدم تشغيل أكثر من فيديو واحد في نفس الوقت على مستوى الموقع بالكامل.
 * عند تشغيل فيديو جديد، يتم إيقاف الفيديو السابق تلقائياً فوراً.
 */
class VideoPlaybackManager {
  private static activeVideo: HTMLVideoElement | null = null;
  private static subscribers = new Set<(active: HTMLVideoElement | null) => void>();

  static subscribe(fn: (active: HTMLVideoElement | null) => void) {
    this.subscribers.add(fn);
    return () => {
      this.subscribers.delete(fn);
    };
  }

  static async play(video: HTMLVideoElement): Promise<void> {
    if (this.activeVideo && this.activeVideo !== video) {
      try {
        this.activeVideo.pause();
      } catch {
        // تجاهل أخطاء الإيقاف إن وُجدت
      }
    }
    this.activeVideo = video;
    this.notify();

    try {
      await video.play();
    } catch {
      // التعامل مع منع المتصفح للتشغيل التلقائي إن وُجد
    }
  }

  static pause(video: HTMLVideoElement): void {
    if (this.activeVideo === video) {
      this.activeVideo = null;
      this.notify();
    }
    try {
      video.pause();
    } catch {
      // تجاهل أخطاء الإيقاف
    }
  }

  static release(video: HTMLVideoElement): void {
    if (this.activeVideo === video) {
      this.activeVideo = null;
      this.notify();
    }
  }

  private static notify() {
    this.subscribers.forEach((fn) => fn(this.activeVideo));
  }
}

export interface ProductVideoProps {
  /** مسار ملف الفيديو (.mp4 / webm) */
  src: string;
  /** صورة المعاينة المصغرة (Thumbnail / Poster) تظهر قبل التحميل وأثناء التمرير */
  poster?: string;
  /** وصف بديل للفيديو والـ Thumbnail */
  alt?: string;
  /** كلاسات مخصصة للحاوية الخارجية */
  className?: string;
  /** كلاسات مخصصة لعنصر الـ video نفسه */
  videoClassName?: string;
  /** نسبة الأبعاد مثل: "aspect-video" أو "aspect-square" أو "h-full w-full" */
  aspectRatio?: string;
  /** نسبة الظهور المطلوبة لبدء التشغيل التلقائي (الافتراضي: 0.5 أي 50%) */
  threshold?: number;
  /** تفعيل التحميل الكسول (Lazy Loading) */
  lazy?: boolean;
  /** إظهار زر التحكم في كتم/تشغيل الصوت */
  showMuteButton?: boolean;
  /** إظهار شارة فيديو توضيحي */
  badgeText?: string;
  /** حدث عند النقر على الفيديو */
  onClick?: () => void;
  /** حدث تحديث وقت الفيديو */
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  /** مرجع خارجي اختياري لعنصر الفيديو */
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export default function ProductVideo({
  src,
  poster,
  alt = 'فيديو المنتج',
  className = '',
  videoClassName = '',
  aspectRatio = 'aspect-video',
  threshold = 0.5,
  lazy = true,
  showMuteButton = true,
  badgeText,
  onClick,
  onTimeUpdate,
  videoRef: externalVideoRef,
}: ProductVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;

  // الحالات
  const [isLoaded, setIsLoaded] = useState(!lazy);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // كتم الصوت إجباري للتشغيل التلقائي
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  // مزامنة حالة التشغيل مع المدير المركزي
  useEffect(() => {
    const video = videoRef.current;
    const unsubscribe = VideoPlaybackManager.subscribe((activeVideo) => {
      if (video && activeVideo !== video) {
        setIsPlaying(false);
      }
    });

    return () => {
      unsubscribe();
      if (video) {
        VideoPlaybackManager.release(video);
      }
    };
  }, [videoRef]);

  // إعداد الـ Intersection Observer للتحكم في التشغيل التلقائي عند ظهور 50%
  useEffect(() => {
    const container = containerRef.current;
    const currentVideo = videoRef.current;
    if (!container) return;

    // 1. مراقب التحميل الكسول (Lazy Load Observer) لتحميل السورس قبل الوصول بقليل
    let lazyObserver: IntersectionObserver | null = null;
    if (lazy && !isLoaded) {
      lazyObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsLoaded(true);
            lazyObserver?.disconnect();
          }
        },
        { rootMargin: '200px' } // يبدأ تجهيز الفيديو قبل وصول المستخدم بـ 200 بكسل
      );
      lazyObserver.observe(container);
    }

    // 2. مراقب التشغيل التلقائي بنسبة 50% (Auto Play on Scroll at 50% visibility)
    const playObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const video = videoRef.current;
        if (!video) return;

        // التحقق من أن نسبة الظهور في الشاشة بلغت 50% على الأقل
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          if (!isLoaded) {
            setIsLoaded(true);
          }
          VideoPlaybackManager.play(video);
          setIsPlaying(true);
        } else {
          // الإيقاف التلقائي فور خروج الفيديو أو انخفاض نسبة ظهوره عن 50%
          VideoPlaybackManager.pause(video);
          setIsPlaying(false);
        }
      },
      {
        threshold: [0, threshold, 1.0],
      }
    );

    playObserver.observe(container);

    // إيقاف الفيديو عند قفل الشاشة أو تغيير التبويب لحفظ البطارية والبيانات
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (document.hidden && video) {
        VideoPlaybackManager.pause(video);
        setIsPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      lazyObserver?.disconnect();
      playObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (currentVideo) {
        VideoPlaybackManager.release(currentVideo);
      }
    };
  }, [threshold, lazy, isLoaded, videoRef]);

  // تبديل كتم الصوت
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // النقر للتشغيل/الإيقاف اليدوي
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      VideoPlaybackManager.pause(video);
      setIsPlaying(false);
    } else {
      VideoPlaybackManager.play(video);
      setIsPlaying(true);
    }

    if (onClick) onClick();
  };

  return (
    <div
      ref={containerRef}
      onClick={handleTogglePlay}
      className={`relative overflow-hidden bg-black/90 select-none cursor-pointer group ${aspectRatio} ${className}`}
      dir="ltr"
    >
      {/* عنصر الفيديو التلقائي */}
      <video
        ref={videoRef}
        src={isLoaded ? src : undefined}
        poster={poster}
        muted={isMuted}
        loop
        playsInline
        preload={lazy ? 'none' : 'metadata'}
        onTimeUpdate={onTimeUpdate}
        onPlaying={() => setHasStartedPlaying(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          hasStartedPlaying ? 'opacity-100' : 'opacity-90'
        } ${videoClassName}`}
      />

      {/* صورة المعاينة (Poster Overlay) مع انتقال ناعم حتى بدء الحركة */}
      {poster && !hasStartedPlaying && (
        <img
          src={poster}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700"
          loading="lazy"
        />
      )}

      {/* تدرج سينمائي خفيف لحماية وضوح النصوص */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* شارة الفيديو التوضيحية */}
      {badgeText && (
        <div 
          dir="rtl"
          className="absolute bottom-3 right-3 z-20 bg-black/65 backdrop-blur-md text-[#F7F4EF] text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1.5 shadow-md pointer-events-none"
        >
          <Sparkles className="w-3 h-3 text-[#8A9684] animate-pulse" />
          <span>{badgeText}</span>
        </div>
      )}

      {/* مؤشر التشغيل المصغر يظهر عند الإيقاف المؤقت */}
      {!isPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 backdrop-blur-[1px] transition-all">
          <div className="w-11 h-11 rounded-full bg-[#3D312A]/80 text-[#F7F4EF] border border-white/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
          </div>
        </div>
      )}

      {/* أزرار الصوت والتحكم بالزاوية العلوية */}
      {showMuteButton && (
        <button
          type="button"
          onClick={toggleMute}
          title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 shadow-lg transition-transform active:scale-95"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-white/90" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-[#8A9684]" />
          )}
        </button>
      )}

      {/* مؤشر حالة التشغيل الصغير في الزاوية */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase transition-colors ${
            isPlaying
              ? 'bg-emerald-500/80 text-white'
              : 'bg-black/50 text-white/70'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPlaying ? 'bg-white animate-ping' : 'bg-white/50'
            }`}
          />
          {isPlaying ? 'PLAYING' : 'PAUSED'}
        </span>
      </div>
    </div>
  );
}
