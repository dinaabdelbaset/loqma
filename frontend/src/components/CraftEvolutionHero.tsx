import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Sparkles, 
  ShoppingBag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CraftStage {
  id: number;
  stageNum: string;
  enTitle: string;
  arTitle: string;
  enSubTitle: string;
  kicker: string;
  kickerEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  theme: 'light' | 'dark';
  badge: string;
  badgeEn: string;
  stats: { label: string; value: string; labelEn?: string; valueEn?: string }[];
}

interface SideDishCard {
  id: number;
  kicker: string;
  name: string;
  nameEn: string;
  image: string;
  badge: string;
  badgeEn: string;
  footerNote: string;
  footerNoteEn: string;
}

const SIDE_DISH_CARDS: SideDishCard[] = [
  {
    id: 0,
    kicker: 'PURE TEXTURE',
    name: 'سمن بلدي فلاحي',
    nameEn: 'Pure Baladi Ghee',
    image: '/images/craft_hero/card_butter.jpg',
    badge: '100% طبيعي بدون إضافات',
    badgeEn: '100% Pure & Natural',
    footerNote: 'أساس كل طبقة مورّقة وهشة في "لقمة"',
    footerNoteEn: 'The foundation of every flaky layer at Loqma'
  },
  {
    id: 1,
    kicker: 'MOLOKHIA TASH’A',
    name: 'طاجن ملوخية خضراء',
    nameEn: 'Green Molokhia Tajine',
    image: '/images/craft_hero/card_molokhia.jpg',
    badge: 'طشة توم وكسبرة بتفور ♨️',
    badgeEn: 'Sizzling Garlic & Coriander ♨️',
    footerNote: 'شهقة زمان وسر الطشة الفلاحي الأصيلة',
    footerNoteEn: 'Old-world Egyptian garlic tasha magic'
  },
  {
    id: 2,
    kicker: 'EGYPTIAN FEAST',
    name: 'صينية محشي مشكل',
    nameEn: 'Mixed Stuffed Mahshi',
    image: '/images/craft_hero/card_mahshi.jpg',
    badge: 'كرنب وورق عنب خلطة بلدي 🥬',
    badgeEn: 'Hand-Rolled Vine Leaves & Cabbage 🥬',
    footerNote: 'ملفوف يدوي دايب في شوربة البط الدسمة',
    footerNoteEn: 'Melt-in-your-mouth rolls simmered in rich duck broth'
  },
  {
    id: 3,
    kicker: 'CLAYPOT TAJINE',
    name: 'طواجن فخار زمان',
    nameEn: 'Claypot Oven Tajines',
    image: '/images/craft_hero/card_tajin.jpg',
    badge: 'لحمة موزة دايبة في البصل 🍲',
    badgeEn: 'Tender Lamb Shank in Onion Broth 🍲',
    footerNote: 'طاجن فخار خارج مباشرة من بيت النار',
    footerNoteEn: 'Earthenware claypot served bubbling from the embers'
  },
  {
    id: 4,
    kicker: 'CRISPY DELIGHT',
    name: 'ممبار بلدي محمر',
    nameEn: 'Golden Crispy Mombar',
    image: '/images/craft_hero/card_mombar.jpg',
    badge: 'مقرمش بالسمن البلدي 🤤',
    badgeEn: 'Crisped in 100% Pure Ghee 🤤',
    footerNote: 'رز مفلفل بخلطة بلدي وقرمشة دهبية',
    footerNoteEn: 'Fluffy spiced rice stuffing with a golden crunch'
  }
];

const STAGES: CraftStage[] = [
  {
    id: 0,
    stageNum: '01',
    enTitle: 'CRAFTED IN LAYERS.',
    arTitle: 'مورّق.. طبقة ورا طبقة',
    enSubTitle: 'Melt-in-Your-Mouth Lamination',
    kicker: 'حرفة السمن البلدي المصري • Artisanal Dough Base',
    kickerEn: 'Egyptian Ghee Heritage • Artisanal Dough Base',
    description: 'عجينة بلدية مخدومة على أصولها، مخمّرة ببطء ومورّقة بالسمن البلدي الفلاحي الصافي 100% لتمنحك قرمشة ذهبية وخفة استثنائية تأسر الحواس.',
    descriptionEn: 'Slowly fermented artisanal country dough, laminated with 100% pure Egyptian ghee for an irresistible golden crunch and extraordinary lightness.',
    image: '/images/craft_hero/stage1_seamless.jpg',
    theme: 'light',
    badge: 'عجين التخمير البطيء',
    badgeEn: 'Slow Fermented Dough',
    stats: [
      { label: '🌾 سر الطازة', value: 'تتعمل مخصوص فور طلبك', labelEn: '🌾 Fresh Guarantee', valueEn: 'Hand-made specifically upon your order' },
      { label: '❤️ متعة الطعم', value: 'تذوب في بُقّك ومش هتشبع', labelEn: '❤️ Pure Flavor', valueEn: 'Melts in your mouth effortlessly' }
    ]
  },
  {
    id: 1,
    stageNum: '02',
    enTitle: 'THE BUTTER FOLD.',
    arTitle: 'سمن بلدي فلاحي صافي',
    enSubTitle: '100% Pure Baladi Butter',
    kicker: 'نقاء المكونات الطبيعية • 100% Pure Baladi Butter',
    kickerEn: 'Natural Pure Ingredients • 100% Pure Butter',
    description: 'قالب من السمن البلدي الطبيعي الصافي يُطوى بحرفية داخل نسيج العجين، لتبني مئات الرقائق المتناهية الدقة لتمنحك مذاق البيوت الأصيل.',
    descriptionEn: 'A slab of natural grass-fed baladi butter is meticulously folded into the dough, creating hundreds of micro-layers of pure home-cooked flavor.',
    image: '/images/craft_hero/stage2_seamless.jpg',
    theme: 'light',
    badge: 'سمن بلدي أصلي 100%',
    badgeEn: '100% Pure Baladi Ghee',
    stats: [
      { label: '🧈 سمن بلدي 100%', value: 'ريحة زمان اللي بتفتح النفس', labelEn: '🧈 100% Pure Ghee', valueEn: 'Authentic nostalgic aroma' },
      { label: '🌿 خفيفة ع القلب', value: 'طعم أصيل بدون أي دهون مهدرجة', labelEn: '🌿 Heart Healthy', valueEn: 'Zero hydrogenated oils or additives' }
    ]
  },
  {
    id: 2,
    stageNum: '03',
    enTitle: 'THE ART OF THE FOLD.',
    arTitle: 'فن الطي والتوريق الهندسي',
    enSubTitle: 'Master Artisan Lamination',
    kicker: 'هندسة التوريق اليدوية • Master Lamination',
    kickerEn: 'Handmade Precision • Master Lamination',
    description: 'طيّة تعانق طيّة بالمليمتر.. تتداخل 128 طبقة رقيقة تحت أيدي خبازينا لتتنفس وتنتفخ بخفة مدهشة عند ملامسة دفء بيت النار.',
    descriptionEn: 'Fold upon fold with millimeter precision.. 128 micro-layers woven by master bakers that expand and puff into airy golden perfection.',
    image: '/images/craft_hero/stage3_seamless.jpg',
    theme: 'light',
    badge: 'توريق يدوي أصيل',
    badgeEn: 'Artisanal Hand Rolling',
    stats: [
      { label: '🔥 سر القرمشة', value: 'توريق هتدمنه من أول لقمة', labelEn: '🔥 Crisp Secret', valueEn: 'Layering you will love from first bite' },
      { label: '👑 إحساس الصنعة', value: 'تذوب في بُقك مش في إيدك', labelEn: '👑 True Craft', valueEn: 'Melts in mouth, delicate in hand' }
    ]
  },
  {
    id: 3,
    stageNum: '04',
    enTitle: 'BAKED TO RISE.',
    arTitle: 'دفء الفرن البلدي المتوهج',
    enSubTitle: 'The Clay Oven Glow',
    kicker: 'حرارة الحجر الفخاري • Stone Oven Glow',
    kickerEn: 'Earthen Stone Oven • Sizzling Fire',
    description: 'داخل بيت النار الهادئ على حرارة مدروسة، يتبخر السمن البلدي ليرفع الرقائق عالياً، وتكتسي القشرة الخارجية باللون الكهرماني الذهبي الساحر.',
    descriptionEn: 'Inside the steady glow of the rustic oven, pure butter vapor lifts the pastry layers, glazing the crust in a spellbinding golden amber sheen.',
    image: '/images/craft_hero/stage4_seamless.jpg',
    theme: 'dark',
    badge: 'خبز حراري متوازن',
    badgeEn: 'Slow Heat Baking',
    stats: [
      { label: '♨️ من الفرن لبيتك', value: 'بتوصلك سخنة وبتدخن طازة', labelEn: '♨️ Oven to Table', valueEn: 'Delivered steaming hot & freshly baked' },
      { label: '🌟 قشرة ذهبية', value: 'مقرمشة بلون الكراميل الساحر', labelEn: '🌟 Golden Crust', valueEn: 'Caramelized crunch and buttery aroma' }
    ]
  },
  {
    id: 4,
    stageNum: '05',
    enTitle: 'LAYERS WORTH BREAKING.',
    arTitle: 'طبقات تستحق التجربة',
    enSubTitle: 'Airy Honeycomb Flakes',
    kicker: 'خفة وهشاشة لا تُقاوم • Honeycomb Airy Flakes',
    kickerEn: 'Unmatched Flakiness • Honeycomb Airy Flakes',
    description: 'عند أول لمسة تتطاير الرقائق المقرمشة كأوراق الذهب، كاشفة عن مسامات هوائية منتظمة كقرص العسل ورائحة سمن بلدي دافئة تذوب في الفم.',
    descriptionEn: 'At first touch, the golden flakes shatter delicately to reveal airy honeycomb chambers and the comforting warmth of authentic Egyptian ghee.',
    image: '/images/craft_hero/stage5_seamless.jpg',
    theme: 'light',
    badge: 'قرمشة استثنائية',
    badgeEn: 'Exceptional Crunch',
    stats: [
      { label: '🤤 اسمع الصوت', value: 'قرمشة مورقة هتطلبها كل يوم', labelEn: '🤤 Hear the Crunch', valueEn: 'Crisp airy layers you will crave daily' },
      { label: '💎 ضمان السعادة', value: 'أول ما تفتحها.. هتقلب البيت كله!', labelEn: '💎 Pure Joy', valueEn: 'A heavenly aroma filling the room' }
    ]
  }
];

export default function CraftEvolutionHero() {
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const initialStage = parseInt(searchParams.get('stage') || '0', 10);
  const [currentIdx, setCurrentIdx] = useState(
    !isNaN(initialStage) && initialStage >= 0 && initialStage < STAGES.length ? initialStage : 0
  );

  const stage = STAGES[currentIdx];
  const isDark = stage.theme === 'dark';
  const activeSideDish = SIDE_DISH_CARDS[currentIdx % SIDE_DISH_CARDS.length];

  // دوران العرض السريع المستمر
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % STAGES.length);
    }, 1600);

    return () => clearInterval(timer);
  }, []);

  const isEn = language === 'en';

  return (
    <section 
      dir={isEn ? 'ltr' : 'rtl'}
      className={`relative w-full overflow-hidden transition-colors duration-700 select-none ${
        isDark ? 'bg-[#181412] text-[#F7F4EF]' : 'bg-[#F7F4EF] text-[#3D312A]'
      }`}
    >
      {/* شبكة النقاط الخلفية */}
      <div 
        className="absolute inset-0 studio-dots opacity-40 pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center min-h-[520px]">
          
          {/* العمود الأول: النصوص والعناوين التحريرية */}
          <div className={`lg:col-span-5 flex flex-col justify-center ${isEn ? 'text-left' : 'text-right'}`}>
            
            {/* الشارة العلوية */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider transition-colors duration-300 ${
                isDark 
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30' 
                  : 'bg-[#8A9684]/15 text-[#26472A] border border-[#8A9684]/30'
              }`}>
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>{isEn ? stage.kickerEn : stage.kicker}</span>
              </span>
            </div>

            {/* العنوان الإنجليزي التحريري */}
            <h1 
              key={`en-${currentIdx}`}
              dir="ltr"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight font-serif leading-[1.08] mb-2 animate-in fade-in duration-300 uppercase inline-block"
              style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}
            >
              {stage.enTitle}
            </h1>

            {/* العنوان الثانوي */}
            <h2 
              key={`sub-${currentIdx}`}
              className={`text-xl sm:text-2xl md:text-3xl font-black mb-4 tracking-tight animate-in fade-in duration-300 ${
                isDark ? 'text-amber-200' : 'text-[#1F1713]'
              }`}
            >
              {isEn ? stage.enSubTitle : stage.arTitle}
            </h2>

            {/* الفقرة الوصفية */}
            <p 
              key={`desc-${currentIdx}`}
              className={`text-xs sm:text-sm md:text-base leading-relaxed mb-6 max-w-lg transition-colors duration-300 animate-in fade-in duration-300 ${
                isDark ? 'text-[#D2C4B7]' : 'text-[#55453B]'
              }`}
            >
              {isEn ? stage.descriptionEn : stage.description}
            </p>

            {/* إحصائيات وبطاقات الصنعة */}
            <div className="grid grid-cols-2 gap-3 mb-6 w-full max-w-sm">
              {stage.stats.map((stat, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-2xl border transition-all duration-300 ${
                    isDark 
                      ? 'bg-white/[0.04] border-white/10 text-white' 
                      : 'bg-white/80 border-[#D2C4B7]/70 shadow-xs text-[#1F1713]'
                  }`}
                >
                  <span className={`block text-[11px] font-bold tracking-wide mb-1 ${
                    isDark ? 'text-amber-300' : 'text-[#8A9684]'
                  }`}>
                    {isEn ? (stat.labelEn || stat.label) : stat.label}
                  </span>
                  <span className="text-xs sm:text-sm font-black block leading-snug">
                    {isEn ? (stat.valueEn || stat.value) : stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* أزرار الإجراء والطلب المباشر */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                to="/menu"
                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-md transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                  isDark
                    ? 'bg-amber-400 text-[#181412] hover:bg-amber-300 shadow-amber-950/50'
                    : 'bg-[#3D312A] text-[#F7F4EF] hover:bg-[#2B221D] shadow-[#3D312A]/20'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('heroShopNow')}</span>
                {isEn ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4 rotate-180" />}
              </Link>
            </div>

          </div>

          {/* العمود الثاني: الصور المتغيرة مع بعض جنباً إلى جنب */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center justify-center gap-6 lg:gap-8 my-4 lg:my-0">
            
            {/* 1. بطل العرض الطافي (المرحلة المتغيرة) */}
            <div className="relative flex-1 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[360px] md:min-h-[400px] w-full">
              <div 
                className={`absolute w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
                  isDark ? 'bg-amber-500/10' : 'bg-[#D2C4B7]/40'
                }`}
              />

              <div className="relative w-full max-w-[380px] h-[280px] sm:h-[340px] md:h-[380px] flex items-center justify-center">
                {STAGES.map((s, idx) => {
                  const isActive = idx === currentIdx;
                  return (
                    <div
                      key={s.id}
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
                        isActive 
                          ? 'opacity-100 scale-100 z-10 animate-float-slow' 
                          : 'opacity-0 scale-95 pointer-events-none z-0'
                      }`}
                    >
                      <img
                        src={s.image}
                        alt={isEn ? s.enTitle : s.arTitle}
                        className="max-h-[260px] sm:max-h-[320px] md:max-h-[360px] w-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.45)]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* مؤشرات المراحل الخمس */}
              <div className="flex items-center gap-2 mt-3 z-20">
                {STAGES.map((s, idx) => {
                  const isActive = idx === currentIdx;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                        isActive 
                          ? isDark ? 'w-8 bg-amber-400' : 'w-8 bg-[#3D312A]' 
                          : isDark ? 'w-2 bg-white/20 hover:bg-white/40' : 'w-2 bg-[#D2C4B7] hover:bg-[#8A9684]'
                      }`}
                      title={isEn ? s.enTitle : s.arTitle}
                    />
                  );
                })}
              </div>
            </div>

            {/* 2. كروت الأطباق الجانبية الأوتوماتيكية المتغيرة */}
            <div className="shrink-0 flex flex-col items-center justify-center w-full max-w-[240px] sm:max-w-[250px]">
              <div 
                className={`w-full rounded-3xl border overflow-hidden transition-all duration-500 group shadow-lg ${
                  isDark 
                    ? 'bg-white/[0.04] border-white/15' 
                    : 'bg-white border-[#D2C4B7]/80'
                }`}
              >
                <div className="p-3 pb-2 flex items-center justify-between border-b border-black/5 dark:border-white/10">
                  <span className={`text-[10px] font-mono tracking-widest font-black ${
                    isDark ? 'text-amber-400' : 'text-[#8A9684]'
                  }`}>
                    {activeSideDish.kicker}
                  </span>
                  <span className={`text-xs font-bold font-serif-title ${
                    isDark ? 'text-white' : 'text-[#1F1713]'
                  }`}>
                    {isEn ? activeSideDish.nameEn : activeSideDish.name}
                  </span>
                </div>

                <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-[#D2C4B7]/20">
                  {SIDE_DISH_CARDS.map((dish, idx) => {
                    const isActive = idx === (currentIdx % SIDE_DISH_CARDS.length);
                    return (
                      <div
                        key={dish.id}
                        className={`absolute inset-0 transition-all duration-500 ease-out ${
                          isActive 
                            ? 'opacity-100 scale-100 z-10' 
                            : 'opacity-0 scale-95 pointer-events-none z-0'
                        }`}
                      >
                        <img
                          src={dish.image}
                          alt={isEn ? dish.nameEn : dish.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        
                        <span className="absolute bottom-2.5 left-2 right-2 text-center text-[10px] text-white font-bold drop-shadow-md">
                          {isEn ? dish.badgeEn : dish.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 text-center">
                  <p className={`text-[10px] leading-tight font-medium ${
                    isDark ? 'text-[#D2C4B7]' : 'text-[#55453B]'
                  }`}>
                    {isEn ? activeSideDish.footerNoteEn : activeSideDish.footerNote}
                  </p>
                </div>
              </div>

              {/* مؤشرات الأطباق الخمسة */}
              <div className="flex items-center gap-1.5 mt-3">
                {SIDE_DISH_CARDS.map((dish, idx) => {
                  const isActive = idx === (currentIdx % SIDE_DISH_CARDS.length);
                  return (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive 
                          ? isDark ? 'bg-amber-300 w-4' : 'bg-[#3D312A] w-4'
                          : isDark ? 'bg-white/20 hover:bg-white/40' : 'bg-[#D2C4B7] hover:bg-[#8A9684]'
                      }`}
                      title={isEn ? dish.nameEn : dish.name}
                    />
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
