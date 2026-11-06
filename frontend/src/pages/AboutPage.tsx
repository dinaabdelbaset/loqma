import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const BreadcrumbArrow = isEn ? ChevronRight : ChevronLeft;
  const ArrowIcon = isEn ? ArrowRight : ArrowLeft;

  const values = [
    {
      icon: '🧈',
      title: isEn ? '100% Pure Baladi Cow Ghee' : 'سمن بلدي بقري فلاحي 100%',
      description: isEn
        ? 'We strictly reject hydrogenated oils and refined fats. Every dish is anchored on authentic baladi ghee and extra virgin olive oil to safeguard your family’s health.'
        : 'نرفض تماماً استخدام أي دهون مهدرجة أو زيوت نباتية مكررة. أساس كل أطباقنا السمن البلدي الطبيعي وزيت الزيتون البكر الممتاز لحماية صحة عائلتك.',
      badge: isEn ? 'Zero Compromise' : 'نقاء بدون مساومة'
    },
    {
      icon: '🌿',
      title: isEn ? 'Farm-Fresh Daily Greens' : 'خضار الغيط طازة يومياً',
      description: isEn
        ? 'Molokhia is picked and minced same-day morning. Stuffed grape leaves are hand-rolled grain by grain. No commercial frozen packs ever.'
        : 'الملوخية تُقطف وتُخرط صباح اليوم، المحاشي تُلف يدوياً بكل حبة أرز وورق عنب طري، ولا نستخدم أي خضروات مجمدة أو أكياس جاهزة نهائياً.',
      badge: isEn ? '100% Fresh' : 'طزاجة 100%'
    },
    {
      icon: '🥩',
      title: isEn ? 'Fresh Baladi Meats & Poultry' : 'لحوم ودواجن بلدية فريش',
      description: isEn
        ? 'Baladi veal, shank, countryside duck, and fresh chicken sourced from certified local farms, slaughtered halal daily with zero imported frozen meats.'
        : 'كل اللحوم كبده بلدي، موزة، بتلو، وبط وفراخ فلاحي من مزارع معتمدة مذبوحة حلال يومياً بدون أي مجمدات مستوردة أو مصنعات لحوم.',
      badge: isEn ? 'Halal Slaughtered Daily' : 'مذبوحة حلال يومياً'
    },
    {
      icon: '🏺',
      title: isEn ? 'Authentic Aswan Clay Tajines' : 'طواجن فخار أسواني طبيعي',
      description: isEn
        ? 'Slowly baked inside traditional hearth clay ovens over gentle embers, infusing dishes with pure rustic smoke and unforgettable heritage flavor.'
        : 'نطبخ في فخار أسواني نقي مسوى في أفران بيت النار على حرارة هادئة ليتشرب الأكل نكهة الحطب والدخان الطبيعي الأصيل.',
      badge: isEn ? 'Hearth Heritage Flavor' : 'نكهة أفران زمان'
    }
  ];

  const standards = isEn ? [
    'Routine laboratory inspections testing pure ghee and ingredients authenticity.',
    'Full medical sterile masks and gloves worn across all preparation and packing phases.',
    'Hospital-grade 316 surgical stainless steel cookware and heat-sterilized clay pots.',
    'Double-sealed airtight vacuum wrapping shielding meals against transport contamination.',
    'Heated thermal couriers maintaining food core temperature above 65°C upon delivery.'
  ] : [
    'فحص مخبري دوري لجودة السمن والمكونات الغذائية.',
    'ارتداء كامل لأقنعة وقفازات التعقيم الطبية في جميع مراحل الطهي والتغليف.',
    'أواني طهي ستانلس ستيل غذائي طبي 316 وفخار نقي معقم.',
    'تغليف مزدوج محكم العزل ضد الهواء والتلوث أثناء النقل.',
    'حقائب توصيل حرارية معزولة تضمن وصول الطعام بدرجة حرارة تفوق 65° مئوية.'
  ];

  return (
    <div className="bg-[#F7F4EF] dark:bg-[#120E0C] text-[#1F1713] dark:text-[#F7F4EF] min-h-screen py-8 sm:py-14 transition-colors" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* شريط المسار (Breadcrumbs) */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#55453B] dark:text-[#D6C9BD] border-b border-[#D2C4B7]/60 dark:border-[#382A20] pb-3">
          <Link to="/" className="hover:text-amber-600 transition-colors">{t('navHome')}</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 text-[#8A9684]" />
          <span className="font-bold text-[#26472A] dark:text-[#A3D4A8]">{t('navAbout')}</span>
        </nav>

        {/* 1. الترويسة الرئيسية والقصة */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-4 py-1.5 rounded-full text-xs font-black border border-[#8A9684]/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isEn ? 'Story of "Loqma" • Authentic Egyptian Home Kitchen' : 'حكاية "لقمة" • طهي بيتي مصري بلمسة بوهيمية'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1F1713] dark:text-white font-serif-title leading-tight">
            {isEn ? 'Restoring Honor to True Egyptian Home Cooking' : 'رجعنا للأكل البيتي هيبته ونَفَسه الأصيل'}
          </h1>

          <p className="text-xs sm:text-base text-[#55453B] dark:text-[#D6C9BD] leading-relaxed font-medium">
            {isEn
              ? 'Loqma began with a nostalgic longing: we missed our mothers\' and grandmothers\' cooking amidst fast food chains and processed fats. We set out to give every home, working professional, and family in Egypt a hot, honest meal cooked with love, purity, and 100% pure baladi cow ghee.'
              : 'بدأت "لقمة" من حلم بسيط: افتقدنا طعم أكل أمهاتنا وجداتنا في زحمة مطاعم الوجبات السريعة والزيوت المهدرجة. أردنا أن نوفر لكل بيت وموظف وعيلة في مصر وجبة ساخنة مطبوخة بحب ونظافة، بنفس السمن البلدي وريحة زمان اللي بتفتح النفس.'
            }
          </p>
        </div>

        {/* 2. ركائز الجودة الأربعة (The 4 Pillars) */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-3xl font-black text-[#1F1713] dark:text-white font-serif-title mb-2">
              {isEn ? 'The Constitution of Loqma Kitchen' : 'دستور مطبخ "لقمة"'}
            </h2>
            <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD]">
              {isEn ? 'Four uncompromising pillars guiding every dish leaving our ovens' : 'أربعة مبادئ لا نتنازل عنها في أي طبق يخرج من مطبخنا'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {values.map((val, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-[#1E1713] p-6 sm:p-7 rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl">{val.icon}</span>
                  <span className="text-[11px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-300/40">
                    {val.badge}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#1F1713] dark:text-white">
                  {val.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] leading-relaxed font-medium">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. معايير النظافة والطهي */}
        <div className="bg-[#FAF5EE] dark:bg-[#1E1713] rounded-3xl p-6 sm:p-10 border-2 border-[#D2C4B7] dark:border-[#382A20] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300/40">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isEn ? 'Highest Food Safety Protocol' : 'أعلى معايير سلامة الغذاء'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#1F1713] dark:text-white font-serif-title">
              {isEn ? 'Open Kitchen with Hospital-Grade Hygiene' : 'مطبخ مفتوح برقابة فندقية صارمة'}
            </h3>
            <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] leading-relaxed font-medium">
              {isEn
                ? 'Your family\'s health is our sacred trust. Our culinary brigade adheres strictly to international sterilization protocols through every culinary stage.'
                : 'صحة عائلتك أمانة في أعناقنا. تطبق فرقنا أعلى بروتوكولات النظافة والتعقيم الفندقي المعتمدة عالمياً في كل مرحلة من مراحل إعداد وجبتك.'
              }
            </p>
          </div>

          <div className="lg:col-span-7 space-y-2.5">
            {standards.map((std, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 bg-white dark:bg-[#261D17] p-3.5 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20]"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-bold text-[#1F1713] dark:text-[#F7F4EF]">
                  {std}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. إحصائيات وأرقام لقمة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white dark:bg-[#1E1713] p-5 sm:p-6 rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <span className="text-2xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 block font-serif">114+</span>
            <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mt-1 block">{isEn ? 'Authentic Egyptian Dishes' : 'طبق بيتي مصري أصيل'}</span>
          </div>
          <div className="bg-white dark:bg-[#1E1713] p-5 sm:p-6 rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <span className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 block font-serif">100%</span>
            <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mt-1 block">{isEn ? 'Baladi Cow Ghee (0% Trans Fat)' : 'سمن بلدي بدون زيوت مهدرجة'}</span>
          </div>
          <div className="bg-white dark:bg-[#1E1713] p-5 sm:p-6 rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <span className="text-2xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 block font-serif">18,500+</span>
            <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mt-1 block">{isEn ? 'Hot Meals Delivered' : 'وجبة ساخنة تم توصيلها'}</span>
          </div>
          <div className="bg-white dark:bg-[#1E1713] p-5 sm:p-6 rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <span className="text-2xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 block font-serif">4.9 / 5</span>
            <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mt-1 block">{isEn ? 'Customer Satisfaction Rating' : 'تقييم رضا عملائنا الأوفياء'}</span>
          </div>
        </div>

        {/* 5. دعوة لتجربة الأكل */}
        <div className="bg-gradient-to-r from-[#241A14] to-[#3D2E24] text-white p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl border border-white/10">
          <h2 className="text-2xl sm:text-4xl font-black font-serif-title">
            {isEn ? 'Ready to Taste Genuine Egyptian Heritage?' : 'جاهز تدوق نَفَس زمان الحقيقي؟'}
          </h2>
          <p className="text-xs sm:text-sm text-[#E8DFD5] max-w-xl mx-auto">
            {isEn
              ? 'Browse our complete menu and order today to enjoy your hot countryside feast in under 2 hours.'
              : 'تصفح قائمتنا الكاملة واطلب الآن لتصلك سفرة بيتك الساخنة في أقل من ساعتين.'
            }
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/menu"
              className="bg-amber-500 hover:bg-amber-400 text-[#1F1713] px-6 py-3 rounded-full font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>{isEn ? 'Browse Full Menu' : 'تصفح المنيو الكامل'}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
            <Link
              to="/schedule"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <span>{isEn ? 'Weekly Lunch Schedule' : 'جدول وجبات الأسبوع'}</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
