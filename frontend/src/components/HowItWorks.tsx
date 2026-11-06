import { Utensils, Flame, Bike, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HowItWorks() {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const steps = [
    {
      step: '01',
      title: t('howStep1Title'),
      description: t('howStep1Desc'),
      icon: <Utensils className="w-7 h-7 text-[#8A9684]" />,
      badge: isEn ? 'Step One' : 'الخطوة الأولى',
    },
    {
      step: '02',
      title: t('howStep2Title'),
      description: t('howStep2Desc'),
      icon: <Flame className="w-7 h-7 text-[#8A9684]" />,
      badge: isEn ? 'Step Two' : 'الخطوة الثانية',
    },
    {
      step: '03',
      title: t('howStep3Title'),
      description: t('howStep3Desc'),
      icon: <Bike className="w-7 h-7 text-[#8A9684]" />,
      badge: isEn ? 'Step Three' : 'الخطوة الثالثة',
    },
  ];

  const ArrowIcon = isEn ? ArrowRight : ArrowLeft;

  return (
    <section className="px-5 sm:px-10 py-12 bg-[#F7F4EF] dark:bg-[#120E0C] border-t border-[#D2C4B7] dark:border-[#382A20]">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-[#1F1713] dark:text-white font-serif-title mb-2">
          {t('howTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD]">
          {t('howSubtitle')}
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((s, idx) => (
          <div
            key={s.step}
            className="bg-white dark:bg-[#1E1713] rounded-3xl p-6 border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-md flex flex-col justify-between relative group hover:border-[#8A9684] transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] dark:bg-[#261D17] border border-[#D2C4B7] dark:border-[#382A20] flex items-center justify-center shadow-xs">
                  {s.icon}
                </div>
                <span className="text-3xl font-black font-mono text-[#D2C4B7] dark:text-[#4A382D] group-hover:text-[#8A9684] transition-colors">
                  {s.step}
                </span>
              </div>

              <span className="text-[11px] font-bold text-[#26472A] dark:text-[#A3D4A8] bg-[#8A9684]/15 px-2.5 py-0.5 rounded-full border border-[#8A9684]/30 inline-block mb-2">
                {s.badge}
              </span>

              <h3 className="text-base sm:text-lg font-black text-[#1F1713] dark:text-white font-serif-title mb-2">
                {s.title}
              </h3>

              <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed">
                {s.description}
              </p>
            </div>

            {idx < 2 && (
              <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 z-10 text-[#D2C4B7] dark:text-[#4A382D]">
                <ArrowIcon className="w-6 h-6 animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
