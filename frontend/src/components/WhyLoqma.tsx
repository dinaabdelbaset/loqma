import { ShieldCheck, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function WhyLoqma() {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const pillars = [
    {
      id: 1,
      title: isEn ? '100% Pure Baladi Ghee' : 'سمن بلدي بقري 100%',
      subtitle: isEn ? 'Zero Hydrogenated Oils' : 'صفر زيوت مهدرجة',
      description: isEn 
        ? 'We cook exclusively with pure country ghee and cold-pressed extra virgin olive oil. Your family\'s wellness is our top priority.'
        : 'نطبخ بالسمن البلدي الفلاحي الصافي وزيت الزيتون البكر المعصور على البارد. صحتك وصحة أولادك خط أحمر.',
      icon: '🧈',
      badge: isEn ? '100% Natural' : 'نقاء طبيعي',
      accentColor: 'border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#1E1713] hover:border-[#8A9684]',
    },
    {
      id: 2,
      title: isEn ? 'Fresh Local Baladi Meats' : 'لحوم ودواجن بلدية فريش',
      subtitle: isEn ? 'Halal Slaughtered Daily' : 'مذبوحة حلال يومياً',
      description: isEn
        ? 'Zero frozen or imported meats. All poultry and meats are farm-fresh from certified Egyptian rural farms daily.'
        : 'لا نستخدم أي مجمدات أو لحوم مستوردة نهائياً. كل الدواجن واللحوم بلدية طازجة من مزارع مصرية معتمدة.',
      icon: '🥩',
      badge: isEn ? 'Farm Fresh' : 'بلدي فريش',
      accentColor: 'border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#1E1713] hover:border-[#8A9684]',
    },
    {
      id: 3,
      title: isEn ? 'Claypot Heat-Lock Delivery' : 'طواجن فخار وحفظ حراري',
      subtitle: isEn ? 'Arrives Bubbling to Your Table' : 'يصلك بيغلي كأنه في فرنك',
      description: isEn
        ? 'Packed inside natural earthenware pots with insulated thermal containers to ensure your food arrives piping hot.'
        : 'تغليف ذكي داخل أواني فخارية طبيعية وحقائب تسليم حرارية معزولة تضمن وصول وجبتك ساخنة في ميعادها.',
      icon: '🏺',
      badge: isEn ? 'Heat Locked' : 'سخونة مضمونة',
      accentColor: 'border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#1E1713] hover:border-[#8A9684]',
    },
    {
      id: 4,
      title: isEn ? 'Artisan Mothers & Chefs' : 'نَفَس أمهات وشيفات بيوت',
      subtitle: isEn ? 'Commercial Hygiene Standards' : 'معايير تعقيم فندقية',
      description: isEn
        ? 'Cooked with heartfelt motherly care in state-of-the-art kitchens subject to rigorous food safety inspections.'
        : 'أكلات مطبوخة بحب ورعاية أمهات بيوت مصريات محترفات، داخل مطابخ تخضع لفحص دوري لمعايير سلامة الغذاء.',
      icon: '👩‍🍳',
      badge: isEn ? '100% Clean' : 'نظافة 100%',
      accentColor: 'border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#1E1713] hover:border-[#8A9684]',
    },
  ];

  return (
    <section id="about" className="px-5 sm:px-10 py-14 bg-[#F7F4EF] dark:bg-[#120E0C] border-t border-[#D2C4B7] dark:border-[#382A20]">
      
      {/* عنوان القسم */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-4 py-1.5 rounded-full text-xs font-bold border border-[#8A9684]/30 mb-3 shadow-xs">
          <Award className="w-3.5 h-3.5" />
          <span>{t('whyBadge')}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-[#1F1713] dark:text-white font-serif-title mb-3">
          {t('whyTitle')}
        </h2>

        <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] max-w-2xl mx-auto leading-relaxed">
          {t('whySubtitle')}
        </p>
      </div>

      {/* الركائز الأربعة في كروت بوهيمية أنيقة */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {pillars.map((pillar) => (
          <div
            key={pillar.id}
            className={`rounded-3xl p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between ${pillar.accentColor}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl p-2 bg-[#FAF7F2] dark:bg-[#261D17] rounded-2xl shadow-xs border border-stone-200/60 dark:border-[#382A20] inline-block">
                  {pillar.icon}
                </span>
                <span className="text-[11px] font-bold text-[#55453B] dark:text-[#D6C9BD] bg-[#FAF7F2] dark:bg-[#261D17] px-2.5 py-1 rounded-full border border-stone-200/80 dark:border-[#382A20] shadow-2xs">
                  {pillar.badge}
                </span>
              </div>

              <h3 className="text-lg font-black text-[#1F1713] dark:text-white mb-1 font-serif-title">
                {pillar.title}
              </h3>

              <span className="text-xs font-bold text-[#8A9684] dark:text-[#A3D4A8] block mb-3">
                {pillar.subtitle}
              </span>

              <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed">
                {pillar.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-200/50 dark:border-[#382A20] flex items-center gap-1.5 text-[11px] font-bold text-[#55453B] dark:text-[#D6C9BD]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8A9684]" />
              <span>{isEn ? 'Quality Certified' : 'معتمد بضمان الجودة'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* شريط الإحصائيات والأرقام الموثوقة */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-[#1E1713] rounded-3xl p-6 sm:p-8 border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-md grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <span className="text-3xl sm:text-4xl font-black text-[#26472A] dark:text-[#A3D4A8] font-serif-title block mb-1">
            +4,800
          </span>
          <span className="text-xs font-bold text-[#1F1713] dark:text-white">
            {isEn ? 'Delivered Home Tajines' : 'طاجن بيتي تم توصيله'}
          </span>
        </div>

        <div>
          <span className="text-3xl sm:text-4xl font-black text-[#26472A] dark:text-[#A3D4A8] font-serif-title block mb-1">
            100%
          </span>
          <span className="text-xs font-bold text-[#1F1713] dark:text-white">
            {isEn ? 'Pure Egyptian Baladi Ghee' : 'سمن بلدي بقري صافي'}
          </span>
        </div>

        <div>
          <span className="text-3xl sm:text-4xl font-black text-[#26472A] dark:text-[#A3D4A8] font-serif-title block mb-1">
            4.9 / 5
          </span>
          <span className="text-xs font-bold text-[#1F1713] dark:text-white">
            {isEn ? 'Verified Customer Rating' : 'تقييم الأكيلة وعائلاتنا'}
          </span>
        </div>

        <div>
          <span className="text-3xl sm:text-4xl font-black text-[#26472A] dark:text-[#A3D4A8] font-serif-title block mb-1">
            0%
          </span>
          <span className="text-xs font-bold text-[#1F1713] dark:text-white">
            {isEn ? 'Hydrogenated Oils or Freezers' : 'زيوت مهدرجة أو مجمدات'}
          </span>
        </div>
      </div>

    </section>
  );
}
