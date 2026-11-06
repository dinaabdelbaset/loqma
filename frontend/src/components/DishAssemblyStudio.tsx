import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, RotateCcw, Sparkles } from 'lucide-react';
import wallBg from '../assets/boho_evening_wall.jpg';
import Burger3DCanvas from './Burger3DCanvas';

interface Props {
  initialDishId?: string;
}

export default function DishAssemblyStudio({ initialDishId: _initialDishId = 'burger' }: Props) {
  const [replayTrigger, setReplayTrigger] = useState(1);
  const [isReplaying, setIsReplaying] = useState(false);

  const handleReplay = () => {
    setIsReplaying(true);
    setReplayTrigger((prev) => prev + 1);
    setTimeout(() => {
      setIsReplaying(false);
    }, 1800);
  };

  return (
    <section
      aria-label="استوديو برجر لقمة 3D الفاخر"
      className="relative w-full min-h-[620px] sm:min-h-[680px] lg:min-h-[740px] flex flex-col items-center justify-between py-6 sm:py-8 px-4 overflow-hidden select-none bg-[#140E0A] text-white"
    >
      {/* 1. خلفية حائط السلاتس الخشبية البوهيمية والاباجورات الخوص الفاخرة */}
      <div className="absolute inset-0 z-0">
        <img
          src={wallBg}
          alt="حائط خشبي بوهيمي دافئ مع اباجورات خوص وشموع هادئة"
          className="w-full h-full object-cover object-center brightness-[0.95] contrast-[1.05]"
          draggable={false}
        />
        {/* تدرج هادئ لتغميق الأطراف وتأكيد الإضاءة البؤرية على البرجر */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#140E0A]/35 to-[#140E0A]/90 pointer-events-none" />
      </div>

      {/* 2. العنوان الرئيسي داخل القوس البوهيمي أعلى البرجر */}
      <div className="relative z-10 text-center max-w-2xl mx-auto pt-2 sm:pt-4 px-3">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-[#F7F4EF] font-serif-title tracking-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)] leading-tight">
          طعم البيت الأصيل.. بسحر المساء وسكون لقمة
        </h1>
      </div>

      {/* 3. مجسم البرجر ثلاثي الأبعاد 3D WebGL الحقيقي التفاعلي بين الشموع */}
      <div className="relative z-10 w-full max-w-[460px] my-auto flex flex-col items-center justify-center">
        <Burger3DCanvas
          replayTrigger={replayTrigger}
          className="w-full"
        />
      </div>

      {/* 4. النصوص والأزرار السفلية المطابقة للهوية البوهيمية */}
      <div className="relative z-10 text-center max-w-xl mx-auto pb-2 sm:pb-4 flex flex-col items-center gap-3">
        {/* العنوان الفرعي الإنجليزي */}
        <p className="text-[11px] sm:text-xs md:text-sm text-[#D2C4B7] font-latin-serif tracking-widest uppercase font-medium drop-shadow-md">
          Bohemian Evening Feast & Comfort Kitchen
        </p>

        {/* زرا الإجراء (Call to Actions) وزر إعادة التشغيل السينمائي */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          {/* زر عشاء اليوم - الزر الرئيسي Espresso Brown مع لمسة Sage Green */}
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-[#3D312A] hover:bg-[#2B221D] text-[#F7F4EF] px-7 sm:px-9 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-xl shadow-black/40 transition-all duration-300 active:scale-95 cursor-pointer border border-[#8A9684]/50 hover:border-[#8A9684] hover:shadow-2xl"
          >
            <span>استكشف عشاء اليوم</span>
            <ArrowLeft className="w-3.5 h-3.5 text-[#8A9684]" />
          </Link>

          {/* زر جدول الأسبوع - الزر الثانوي Muted Beige */}
          <Link
            to="/schedule"
            className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 border border-[#D2C4B7]/40 hover:border-[#8A9684]/70 text-[#F7F4EF] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold backdrop-blur-md transition-all duration-300 active:scale-95 cursor-pointer shadow-md hover:bg-white/10"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D2C4B7]" />
            <span>جدول الأسبوع</span>
          </Link>
        </div>

        {/* زر إعادة العرض السينمائي 3D الأنيق */}
        <button
          type="button"
          onClick={handleReplay}
          disabled={isReplaying}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-medium transition-all duration-300 cursor-pointer ${
            isReplaying 
              ? 'text-[#8A9684] bg-white/10 border border-[#8A9684]/50 cursor-wait' 
              : 'text-[#D2C4B7] hover:text-[#F7F4EF] bg-white/5 hover:bg-white/10 border border-[#D2C4B7]/30 hover:border-[#8A9684]/50'
          }`}
          title="إعادة مشاهدة حركة هبوط البرجر السينمائية ثلاثية الأبعاد"
        >
          {isReplaying ? (
            <>
              <Sparkles className="w-3 h-3 text-[#8A9684] animate-spin" />
              <span>جاري العرض السينمائي 3D...</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-3 h-3 text-[#8A9684] group-hover:rotate-180 transition-transform duration-500" />
              <span>إعادة العرض السينمائي 3D ↺</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}