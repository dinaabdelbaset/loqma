import { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag, 
  ChefHat 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import step1Img from '../assets/story/step_1_ingredients.jpg';
import step2Img from '../assets/story/step_2_broth.jpg';
import step3Img from '../assets/story/step_3_sizzle.jpg';
import step4Img from '../assets/story/step_4_tajin.jpg';
import ProductVideo from './ProductVideo';

interface ContinuousFoodStoryProps {
  onAddToCart?: () => void;
}

interface StoryStep {
  id: number;
  number: string;
  stageName: string;
  stageNameEn: string;
  title: string;
  titleEn: string;
  subtitle: string;
  description: string;
  descriptionEn: string;
  image: string;
  startTime: number;
  endTime: number;
  highlightTag: string;
  highlightTagEn: string;
  badges: string[];
  badgesEn: string[];
  chefSecret: string;
  chefSecretEn: string;
}

const STEPS: StoryStep[] = [
  {
    id: 0,
    number: '01',
    stageName: 'الحصاد والمكونات الفريش',
    stageNameEn: 'Fresh Harvest & Ingredients',
    title: 'قطفة الغيط وثوم الصعيد البلدي',
    titleEn: 'Morning Harvest & Sa\'idi Baladi Garlic',
    subtitle: 'The Fresh Harvest & Ingredients',
    description:
      'نبدأ بأوراق ملوخية بلدي فريش خضراء نضرة تُقطف صباحاً، مع فصوص ثوم صعيدي فلاحي مدقوقة في الهون، وحبوب كزبرة بلدي جافة تُحمّص وتُطحن فريش قبل الطهي مباشرة.',
    descriptionEn:
      'We begin with fresh emerald-green jute leaves picked at dawn, whole cloves of rustic Sa\'idi garlic crushed in a brass mortar, and whole coriander seeds toasted and freshly ground on the spot.',
    image: step1Img,
    startTime: 0.0,
    endTime: 3.79,
    highlightTag: 'طازجة من الغيط 🌿',
    highlightTagEn: 'Fresh From The Fields 🌿',
    badges: ['ملوخية بلدي فريش', 'ثوم صعيدي فلاحي', 'كزبرة مطحونة فريش'],
    badgesEn: ['Fresh Baladi Molokhia', 'Sa\'idi Country Garlic', 'Freshly Ground Coriander'],
    chefSecret: 'سر الخضار: لا نستخدم أي مجمدات، فقط الورق الطازج المقرطف بعناية.',
    chefSecretEn: 'Green Secret: Zero frozen greens, only hand-picked fresh leaves pruned with meticulous care.',
  },
  {
    id: 1,
    number: '02',
    stageName: 'المرقة البلدي وسر النَفَس',
    stageNameEn: 'Simmering Baladi Broth',
    title: 'غليان الشوربة الفلاحي الدسمة',
    titleEn: 'The Rich Simmering Baladi Broth',
    subtitle: 'The Rich Simmering Broth',
    description:
      'أساس الملوخية المظبوطة هو مرقة فراخ بلدي معتقة، متبلة بالمستكة اليوناني الحرة، فصوص الحبهان الأخضر، ورق اللورا، وبصلة مكرملة. تغلي بهدوء لتستخلص قواماً غنياً يربط الملوخية.',
    descriptionEn:
      'The soul of true molokhia is aged baladi chicken broth, spiced with pure Greek mastic, whole green cardamom pods, bay leaves, and caramelized onion, simmered slowly to create velvety richness.',
    image: step2Img,
    startTime: 3.79,
    endTime: 7.42,
    highlightTag: 'شوربة بلدي دسمة 🍲',
    highlightTagEn: 'Rich Country Broth 🍲',
    badges: ['مرقة فراخ بلدي', 'مستكة وحبهان أصلي', 'طهي هادئ بطيء'],
    badgesEn: ['Baladi Chicken Broth', 'Pure Mastic & Cardamom', 'Slow Gentle Simmer'],
    chefSecret: 'سر القوام: تظبيط نسبة الشوربة للملوخية ليخرج القوام عِرق ناعم لا يسقط أبداً.',
    chefSecretEn: 'Texture Secret: Precise broth-to-leaf ratio so the soup holds a continuous, silky ribbon that never separates.',
  },
  {
    id: 2,
    number: '03',
    stageName: 'فوران الطشة والشهقة',
    stageNameEn: 'The Sizzling Garlic Tasha',
    title: 'سحر طشة السمن البلدي وفوران التوم',
    titleEn: 'The Sizzling Garlic Tasha & Pure Ghee',
    subtitle: 'The Sizzling Garlic Tasha & Ghee',
    description:
      'اللحظة الأيقونية في المطبخ المصري.. ملعقة سمن بلدي بقري صافي تفور في طاسة النحاس، ينزل عليها الثوم المدقوق والكزبرة الناشفة، حتى تأخذ اللون الذهبي المحمر وتفوح برائحة تزلزل المكان.',
    descriptionEn:
      'The iconic moment in Egyptian culinary history.. a generous spoon of pure country ghee sizzling in a heavy copper skillet, welcoming crushed garlic and coriander until golden amber with that unforgettable aroma.',
    image: step3Img,
    startTime: 7.42,
    endTime: 9.67,
    highlightTag: 'سمن بلدي 100% 🔥',
    highlightTagEn: '100% Pure Baladi Ghee 🔥',
    badges: ['سمن بلدي بقري صافي', 'ثوم محمر ذهبي', 'الشهقة المصرية الشهيرة'],
    badgesEn: ['100% Pure Baladi Ghee', 'Golden Crisp Garlic', 'Legendary Egyptian Shah\'a'],
    chefSecret: 'سر الطشة: التحمير على نار متوسطة حتى يقرمش الثوم دون أدنى مرارة.',
    chefSecretEn: 'Tasha Secret: Sautéing gently on medium flame until garlic turns crispy golden without any hint of bitterness.',
  },
  {
    id: 3,
    number: '04',
    stageName: 'طاجن الفخار وأول غمسة',
    stageNameEn: 'Claypot Tajine & First Dip',
    title: 'نزول الطشة وأول غمسة بالعيش السخن',
    titleEn: 'The Sizzling Pour & The First Baladi Bread Dip',
    subtitle: 'The Piping Hot Tagen & The First Bite',
    description:
      'نزول الطشة وهي بتفور فوق خضار الملوخية المخملي داخل طاجن فخار أسواني أصلي محتفظ بالحرارة، وتقديمها فوراً مع رغيف عيش بلدي سخن مفقع من الفرن جاهز لأحلى (وِدن قطة).',
    descriptionEn:
      'Pouring the bubbling sizzle atop the emerald-green velvet within an authentic heat-retaining Aswan earthenware tajine, served immediately with puffed baladi bread fresh from the fire.',
    image: step4Img,
    startTime: 9.67,
    endTime: 12.91,
    highlightTag: 'جاهز للأكل حالاً 🏺',
    highlightTagEn: 'Piping Hot & Ready 🏺',
    badges: ['طاجن فخار أسواني', 'عيش بلدي سخن مفقع', 'غمسة ودن قطة'],
    badgesEn: ['Aswan Clay Tajine', 'Puffed Baladi Bread', 'Cat\'s Ear Bread Dip'],
    chefSecret: 'سر التقديم: الملوخية لا تُغطى بعد الطشة للحفاظ على لونها الأخضر الملكي.',
    chefSecretEn: 'Serving Secret: Molokhia is never covered after the sizzle to safeguard its vibrant royal emerald green hue.',
  },
];

export default function ContinuousFoodStory({ onAddToCart }: ContinuousFoodStoryProps) {
  const { language, t } = useLanguage();
  const isEn = language === 'en';
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const stepDurationMs = 5000;
    const intervalTickMs = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalTickMs;
      const pct = Math.min(100, (elapsed / stepDurationMs) * 100);
      setProgress(pct);

      if (elapsed >= stepDurationMs) {
        elapsed = 0;
        setProgress(0);
        setActiveStep((prev) => (prev + 1) % STEPS.length);
      }
    }, intervalTickMs);

    return () => clearInterval(timer);
  }, [activeStep]);

  const handleSelectStep = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  const handleNext = () => {
    const nextIdx = (activeStep + 1) % STEPS.length;
    handleSelectStep(nextIdx);
  };

  const currentStep = STEPS[activeStep];
  const ChevronIcon = isEn ? ChevronRight : ChevronLeft;

  return (
    <section className="px-5 sm:px-10 py-10 bg-[#F7F4EF] dark:bg-[#120E0C] border-t border-[#D2C4B7] dark:border-[#382A20] relative overflow-hidden select-none">
      <div className="max-w-5xl mx-auto bg-white dark:bg-[#1E1713] rounded-3xl sm:rounded-[36px] border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-2xl shadow-[#D2C4B7]/30 dark:shadow-none overflow-hidden">
        {/* Step Progress Navigation Bar */}
        <div className="px-5 sm:px-8 pt-5 pb-3 bg-[#F7F4EF] dark:bg-[#18120E] border-b border-[#D2C4B7]/40 dark:border-[#382A20]">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {STEPS.map((s, idx) => {
              const isCurrent = idx === activeStep;
              const isCompleted = idx < activeStep;
              const fillPercent = isCompleted ? 100 : isCurrent ? progress : 0;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectStep(idx)}
                  className={`flex flex-col ${isEn ? 'items-start text-left' : 'items-start text-right'} group cursor-pointer focus:outline-none`}
                >
                  <div className="w-full h-1.5 bg-[#D2C4B7]/50 dark:bg-[#382A20] rounded-full overflow-hidden mb-2 relative">
                    <div
                      className="h-full bg-[#8A9684] rounded-full transition-all duration-100 ease-linear"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] sm:text-xs font-mono font-bold ${isCurrent ? 'text-[#8A9684]' : 'text-[#55453B] dark:text-[#A09383]'}`}>
                      {s.number}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-bold truncate hidden sm:inline ${isCurrent ? 'text-[#1F1713] dark:text-white' : 'text-[#55453B] dark:text-[#A09383]'}`}>
                      {isEn ? s.stageNameEn : s.stageName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Story Content & Live Real Video */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Story Texts & Details */}
          <div className={`lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between order-2 lg:order-1 ${isEn ? 'text-left' : 'text-right'}`}>
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono font-extrabold text-[#26472A] dark:text-[#A3D4A8] bg-[#8A9684]/15 px-3 py-1 rounded-full border border-[#8A9684]/30">
                  {isEn ? `Stage ${currentStep.number} of 04` : `المرحلة ${currentStep.number} من 04`}
                </span>

                <span className="text-xs font-bold text-[#26472A] dark:text-[#A3D4A8] bg-[#8A9684]/10 px-3 py-1 rounded-full border border-[#8A9684]/30">
                  {isEn ? currentStep.highlightTagEn : currentStep.highlightTag}
                </span>
              </div>

              <h3 className="text-xl sm:text-3xl font-black text-[#1F1713] dark:text-white font-serif-title mb-1.5 leading-tight">
                {isEn ? currentStep.titleEn : currentStep.title}
              </h3>

              <p className="text-[11px] sm:text-xs text-[#55453B] dark:text-[#A09383] font-medium tracking-wide mb-4">
                {currentStep.subtitle}
              </p>

              <p className="text-xs sm:text-sm text-[#3D312A] dark:text-[#D6C9BD] leading-relaxed mb-6 font-medium">
                {isEn ? currentStep.descriptionEn : currentStep.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {(isEn ? currentStep.badgesEn : currentStep.badges).map((badge, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-bold bg-[#F7F4EF] dark:bg-[#261D17] text-[#1F1713] dark:text-white px-3 py-1 rounded-lg border border-[#D2C4B7] dark:border-[#382A20] flex items-center gap-1 shadow-xs"
                  >
                    <span className="text-[#8A9684]">•</span>
                    <span>{badge}</span>
                  </span>
                ))}
              </div>

              <div className={`bg-[#F7F4EF] dark:bg-[#261D17] ${isEn ? 'border-l-4' : 'border-r-4'} border-[#8A9684] p-3.5 rounded-xl mb-6 text-xs text-[#3D312A] dark:text-[#D6C9BD]`}>
                <div className="flex items-center gap-1.5 font-bold text-[#8A9684] mb-1">
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>{t('storyChefSecret')}</span>
                </div>
                <p className="leading-relaxed font-medium">
                  {isEn ? currentStep.chefSecretEn : currentStep.chefSecret}
                </p>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="pt-4 border-t border-[#D2C4B7]/40 dark:border-[#382A20] flex flex-wrap items-center justify-between gap-3">
              {activeStep === 3 ? (
                <button
                  type="button"
                  onClick={onAddToCart}
                  className="bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-lg shadow-black/20 flex items-center gap-2 transform active:scale-95 cursor-pointer flex-1 sm:flex-none justify-center border border-[#8A9684]/50"
                >
                  <ShoppingBag className="w-4 h-4 text-[#8A9684] dark:text-white" />
                  <span>{t('storyOrderTajinNow')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer border border-[#8A9684]/40"
                >
                  <span>{t('storyNextStage')}</span>
                  <ChevronIcon className="w-4 h-4 text-[#8A9684] dark:text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Unified Stitched Real Video Container */}
          <div className="lg:col-span-7 relative h-80 sm:h-96 lg:h-[500px] overflow-hidden bg-black order-1 lg:order-2 flex items-center justify-center group rounded-2xl">
            <ProductVideo
              src="/videos/molokhia_story.mp4"
              poster={step4Img}
              videoRef={videoRef}
              threshold={0.5}
              lazy={true}
              badgeText={isEn ? "100% Real Authentic Film • No Watermarks" : "فيديو حي حقيقي 100% • بدون علامات مائية"}
              aspectRatio="h-full w-full"
              className="w-full h-full"
              videoClassName="w-full h-full object-cover object-center"
            />

            {/* Current Step Big Number */}
            <div className={`absolute top-4 ${isEn ? 'right-4' : 'left-4'} z-20 text-white/30 font-black text-4xl sm:text-5xl font-mono select-none pointer-events-none`}>
              {currentStep.number}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
