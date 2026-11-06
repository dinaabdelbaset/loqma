import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Check, 
  ShoppingBag, 
  X, 
  Flame, 
  Users, 
  MessageCircle, 
  UtensilsCrossed 
} from 'lucide-react';
import { generateCustomMealPlan, type MealPlanResponse } from '../services/aiApi';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface WeeklyMealPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeeklyMealPlannerModal({ isOpen, onClose }: WeeklyMealPlannerModalProps) {
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const { addToCart } = useCart();

  const [familyMembers, setFamilyMembers] = useState<number>(4);
  const [dietaryStyle, setDietaryStyle] = useState<string>('balanced');
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState<MealPlanResponse | null>(null);
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  const styles = [
    { id: 'balanced', label: isEn ? 'Balanced Egyptian Family 🍲' : 'متوازن عائلي منوع 🍲' },
    { id: 'traditional', label: isEn ? 'Hearty Countryside Ghee 🧈' : 'ريفي أصيل بسمن بلدي 🧈' },
    { id: 'healthy', label: isEn ? 'Fit & Macro-Calculated 🥗' : 'صحي ومحسوب السعرات 🥗' },
    { id: 'ready-to-cook', label: isEn ? 'Ready-to-Bake at Home 🔥' : 'جاهز ع التسوية بفرنك 🔥' },
  ];

  const commonDislikes = isEn ? [
    { id: 'rabbit', label: 'No Rabbit', term: 'أرانب' },
    { id: 'okra', label: 'No Okra (Bamia)', term: 'بامية' },
    { id: 'duck', label: 'No Duck', term: 'بط' },
    { id: 'trotters', label: 'No Trotters', term: 'كوارع' },
    { id: 'liver', label: 'No Liver', term: 'كبدة' },
  ] : [
    { id: 'rabbit', label: 'بدون أرانب', term: 'أرانب' },
    { id: 'okra', label: 'بدون بامية', term: 'بامية' },
    { id: 'duck', label: 'بدون بط', term: 'بط' },
    { id: 'trotters', label: 'بدون كوارع', term: 'كوارع' },
    { id: 'liver', label: 'بدون كبدة', term: 'كبدة' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchPlan();
    }
  }, [isOpen, familyMembers, dietaryStyle, selectedDislikes.join(',')]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const data = await generateCustomMealPlan(
        familyMembers,
        dietaryStyle,
        selectedDislikes,
        'standard',
        language
      );
      setPlanData(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const toggleDislike = (term: string) => {
    setSelectedDislikes((prev) => 
      prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term]
    );
  };

  const handleSubscribePlan = () => {
    if (!planData || !planData.days) return;

    planData.days.forEach((day) => {
      addToCart({
        id: day.main_dish.id,
        name: `${day.day_ar}: ${day.main_dish.name}`,
        description: day.theme_ar,
        price: day.daily_cost,
        categoryId: 'weekly',
        image: day.main_dish.image,
        tag: 'اشتراك أسبوعي مخصص 📅'
      }, 1);
    });

    setSubscribedSuccess(true);
    setTimeout(() => {
      setSubscribedSuccess(false);
      onClose();
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#18110D] rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors"
        dir={dir}
      >
        {/* ترويسة النافذة */}
        <div className="p-4 sm:p-6 bg-[#FAF5EE] dark:bg-[#20150E] border-b border-[#D2C4B7] dark:border-[#382A20] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2D4F35] text-white flex items-center justify-center shadow-md border border-white/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-xl text-[#1F1713] dark:text-white font-serif-title">
                  {isEn ? 'AI Custom Weekly Meal Planner' : 'صانع جدول الأسبوع المخصص بالذكاء الاصطناعي 📅'}
                </h3>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-300/40">
                  {isEn ? '15% Subscription Discount' : 'خصم اشتراك 15%'}
                </span>
              </div>
              <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] font-medium">
                {isEn 
                  ? 'Generate a balanced 6-day Egyptian home-cooked menu customized to your family size & preferences.'
                  : 'حدد عدد عيلتك ونمط الأكل اللي بتحبوه، والذكاء الاصطناعي يجهزلك جدول 6 أيام غداء متوازن بخصم خاص.'
                }
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-[#1F1713] dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم النافذة وأدوات الاختيار */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-[#150F0B]">
          
          {/* 1. عدد أفراد الأسرة ونمط الطهي */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* عدد الأفراد */}
            <div className="bg-[#FAF5EE] dark:bg-[#1F1610] p-4 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#8A9684]" />
                  <span>{isEn ? 'Family Size:' : 'عدد أفراد الأسرة:'}</span>
                </label>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-serif">
                  {familyMembers} {isEn ? 'Persons' : 'أفراد'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFamilyMembers(num)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      familyMembers === num
                        ? 'bg-[#1F1713] dark:bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-[#261A14] text-[#1F1713] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* أكلات مستبعدة */}
            <div className="bg-[#FAF5EE] dark:bg-[#1F1610] p-4 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] space-y-2">
              <label className="text-xs font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-rose-500" />
                <span>{isEn ? 'Exclude Disliked Foods:' : 'استبعاد أكلات معينة:'}</span>
              </label>

              <div className="flex flex-wrap gap-1.5">
                {commonDislikes.map((item) => {
                  const active = selectedDislikes.includes(item.term);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleDislike(item.term)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        active
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white dark:bg-[#261A14] text-[#55453B] dark:text-[#D6C9BD] border-[#D2C4B7] dark:border-[#382A20]'
                      }`}
                    >
                      {item.label} {active && '✕'}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 2. اختيار النمط الغذائي للأسبوع */}
          <div className="space-y-2">
            <label className="text-xs font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? 'Weekly Culinary Style:' : 'النمط الغذائي للأسبوع:'}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {styles.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setDietaryStyle(st.id)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                    dietaryStyle === st.id
                      ? 'bg-[#2D4F35] text-white shadow-sm scale-102'
                      : 'bg-[#FAF5EE] dark:bg-[#1E140F] text-[#1F1713] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20]'
                  }`}
                >
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. نتائج الخطة الأسبوعية الذكية */}
          {planData && planData.days && (
            <div className="space-y-4">
              
              {/* ملخص التسعير والخصم */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-[#241A14] to-[#3D2E24] p-4 sm:p-5 rounded-2xl text-white shadow-md">
                <div>
                  <span className="text-[10px] text-amber-200 block font-medium">
                    {isEn ? '6-Day Weekly Total' : 'إجمالي الأسبوع (6 أيام غداء)'}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400 font-serif">
                    {planData.summary.final_weekly_price} {t('egp')}
                  </span>
                  <span className="text-[10px] text-emerald-300 block line-through">
                    {planData.summary.original_total} {t('egp')}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-amber-200 block font-medium">
                    {isEn ? 'Weekly Savings' : 'وفرت باشتراك الأسبوع'}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400 font-serif">
                    {planData.summary.weekly_discount_amount} {t('egp')}
                  </span>
                  <span className="text-[10px] text-emerald-200 block">
                    (15% {isEn ? 'Off' : 'خصم كامل'})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-amber-200 block font-medium">
                    {isEn ? 'Daily Family Average' : 'متوسط تكلفة غداء اليوم'}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-white font-serif">
                    {planData.summary.daily_average} {t('egp')}
                  </span>
                  <span className="text-[10px] text-amber-300 block">
                    {isEn ? 'Full meal for all' : `وجبة كاملة لـ ${familyMembers} أفراد`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-amber-200 block font-medium">
                    {isEn ? 'Cost Per Person Daily' : 'تكلفة الفرد في اليوم'}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-white font-serif">
                    {planData.summary.cost_per_person_per_day} {t('egp')}
                  </span>
                  <span className="text-[10px] text-emerald-300 block">
                    {isEn ? 'Cheaper than fast food' : 'أوفر من الدليفري التجاري'}
                  </span>
                </div>
              </div>

              {/* بطاقات الأيام الستة */}
              <div className="space-y-3">
                <h4 className="font-black text-xs sm:text-sm text-[#1F1713] dark:text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{isEn ? 'Generated 6-Day Menu Plan:' : 'جدول غداء الأسبوع المولد لك:'}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {planData.days.map((day, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FAF5EE] dark:bg-[#1E140F] p-3.5 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black bg-[#1F1713] dark:bg-amber-600 text-white px-2.5 py-0.5 rounded-md">
                          {isEn ? day.day : day.day_ar}
                        </span>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-serif">
                          {day.daily_cost} {t('egp')}
                        </span>
                      </div>

                      <h5 className="font-bold text-xs sm:text-sm text-[#1F1713] dark:text-white">
                        {isEn && day.theme_en ? day.theme_en : day.theme_ar}
                      </h5>

                      <p className="text-[11px] text-[#55453B] dark:text-[#D6C9BD] leading-relaxed">
                        {day.main_dish.name} — {day.main_dish.description}
                      </p>

                      <div className="flex flex-wrap gap-1 text-[10px] text-[#26472A] dark:text-[#A3D4A8] font-bold">
                        {day.sides_included.map((s, si) => (
                          <span key={si} className="bg-white/80 dark:bg-[#281B13] px-2 py-0.5 rounded-md border border-[#D2C4B7]/60 dark:border-[#382A20]">
                            • {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ذيل النافذة والأزرار */}
        <div className="p-4 sm:p-5 bg-[#FAF5EE] dark:bg-[#20150E] border-t border-[#D2C4B7] dark:border-[#382A20] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-start">
            <span className="text-xs text-[#55453B] dark:text-[#D6C9BD] block font-medium">
              {isEn ? 'Ready to subscribe to this weekly plan?' : 'جاهز للاشتراك وتوفير الحيرة والمصاريف؟'}
            </span>
            <span className="text-base sm:text-lg font-black text-[#1F1713] dark:text-white font-serif">
              {planData ? `${planData.summary.final_weekly_price} ${t('egp')}` : '...'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://wa.me/201065272373?text=${encodeURIComponent(
                isEn
                  ? `Hello Loqma, I want to subscribe to the custom weekly plan for ${familyMembers} persons (${planData?.summary.final_weekly_price || 0} EGP).`
                  : `مرحباً لقمة، أود الاشتراك في باقة غداء الأسبوع المخصصة لـ ${familyMembers} أفراد بسعر ${planData?.summary.final_weekly_price || 0} ج.م.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer flex-1 sm:flex-none"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isEn ? 'WhatsApp Subscription' : 'اشتراك واتساب مباشر'}</span>
            </a>

            <button
              type="button"
              onClick={handleSubscribePlan}
              disabled={loading || !planData}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                subscribedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1F1713] dark:bg-amber-600 hover:bg-[#2B221D] text-white'
              }`}
            >
              {subscribedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isEn ? 'Subscribed & Added to Cart!' : 'تم الاشتراك والإضافة للسلة!'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isEn ? 'Add All 6 Meals to Cart' : '🛒 إضافة وجبات الأسبوع الـ 6 للسلة'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
