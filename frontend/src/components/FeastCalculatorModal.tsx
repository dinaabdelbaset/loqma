import { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  Check, 
  ShoppingBag, 
  X, 
  Flame, 
  ChefHat, 
  MessageCircle, 
  Truck, 
  ShieldCheck,
  Utensils
} from 'lucide-react';
import { planFeast, type FeastPlannerResponse } from '../services/aiApi';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface FeastCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeastCalculatorModal({ isOpen, onClose }: FeastCalculatorModalProps) {
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const { addToCart } = useCart();

  const [guests, setGuests] = useState<number>(8);
  const [tier, setTier] = useState<string>('classic');
  const [preference, setPreference] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [feastData, setFeastData] = useState<FeastPlannerResponse | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const guestPresets = [4, 6, 8, 10, 15, 20, 30];

  const tiers = [
    { id: 'budget', label: isEn ? 'Budget Friendly' : 'اقتصادي موفر', desc: isEn ? 'Hearty baladi meals' : 'وجبات مشبعة وموفرة' },
    { id: 'classic', label: isEn ? 'Classic Luxury' : 'كلاسيك فاخر', desc: isEn ? 'Balanced signature trays' : 'تشكيلة متوازنة تشرفك' },
    { id: 'royal', label: isEn ? 'Royal Feast (15% Off)' : 'ملوكي ديلوكس (خصم 15%)', desc: isEn ? 'Duck, shank & prime meats' : 'بط وموزات ولحوم فاخرة' },
  ];

  const preferences = [
    { id: 'all', label: isEn ? 'Mixed Egyptian Feast 👑' : 'مكس سفرة مصرية 👑' },
    { id: 'grills', label: isEn ? 'Charcoal Grills 🔥' : 'مشويات ع الفحم 🔥' },
    { id: 'tajines', label: isEn ? 'Clay Pot Tajines 🏺' : 'طواجن وفخار زمان 🏺' },
    { id: 'mahshi', label: isEn ? 'Mahshi & Roqaq Trays 🍲' : 'محاشي وصواني ورقاق 🍲' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchFeastPlan();
    }
  }, [isOpen, guests, tier, preference]);

  const fetchFeastPlan = async () => {
    setLoading(true);
    try {
      const data = await planFeast(guests, tier, preference, language);
      setFeastData(data);
    } catch {
      // Fallback handled in aiApi
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeastToCart = () => {
    if (!feastData || !feastData.all_dishes) return;

    feastData.all_dishes.forEach((d) => {
      addToCart({
        id: d.id,
        name: d.name,
        description: d.description,
        price: d.price,
        categoryId: d.categoryId || 'family-trays',
        image: d.image,
        tag: 'عزومة لقمة الملكية 👑'
      }, 1);
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
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
        {/* الترويسة الرئيسية */}
        <div className="p-4 sm:p-6 bg-[#FAF5EE] dark:bg-[#20150E] border-b border-[#D2C4B7] dark:border-[#382A20] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1F1713] dark:bg-amber-600 text-white flex items-center justify-center shadow-md border border-white/20">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-xl text-[#1F1713] dark:text-white font-serif-title">
                  {isEn ? 'Interactive Feast & Catering Calculator' : 'حاسبة ومخطط العزومات التفاعلي 👑'}
                </h3>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-300/40">
                  {isEn ? 'Smart AI Engine' : 'ذكاء اصطناعي'}
                </span>
              </div>
              <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] font-medium">
                {isEn 
                  ? 'Calculate the exact portions, courses, and bundle discounts for your guests.' 
                  : 'حدد عدد ضيوفك وميزانيتك، والموقع ينسق لك أشهى تشكيلة صواني متوازنة بخصم خاص.'
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

        {/* محتوى الحاسبة وأدوات التحكم */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-[#150F0B]">
          
          {/* 1. اختيار عدد الضيوف */}
          <div className="bg-[#FAF5EE] dark:bg-[#1F1610] p-4 sm:p-5 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#8A9684]" />
                <span>{isEn ? 'Number of Guests / Diners:' : 'عدد الضيوف المعزومين:'}</span>
              </label>
              <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 font-serif bg-white dark:bg-[#281B13] px-3 py-1 rounded-xl border border-[#D2C4B7] dark:border-[#382A20]">
                {guests} {isEn ? 'Guests' : 'أفراد'}
              </span>
            </div>

            {/* الأزرار السريعة لعدد الضيوف */}
            <div className="flex flex-wrap items-center gap-2">
              {guestPresets.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGuests(g)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    guests === g
                      ? 'bg-[#1F1713] dark:bg-amber-600 text-white shadow-md scale-105'
                      : 'bg-white dark:bg-[#261A14] text-[#1F1713] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20] hover:border-[#8A9684]'
                  }`}
                >
                  {g} {isEn ? 'people' : 'أفراد'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. اختيار النمط والميزانية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* نمط السفرة */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#8A9684]" />
                <span>{isEn ? 'Feast Style Preference:' : 'شهوة ونمط السفرة المفضلة:'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {preferences.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreference(p.id)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-start transition-all cursor-pointer ${
                      preference === p.id
                        ? 'bg-[#2D4F35] text-white shadow-sm'
                        : 'bg-[#FAF5EE] dark:bg-[#1E140F] text-[#1F1713] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* فئة الميزانية */}
            <div className="space-y-2">
              <label className="text-xs font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isEn ? 'Budget & Luxury Tier:' : 'فئة الميزانية والدسامة:'}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    className={`p-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      tier === t.id
                        ? 'bg-[#1F1713] dark:bg-amber-600 text-white shadow-sm'
                        : 'bg-[#FAF5EE] dark:bg-[#1E140F] text-[#1F1713] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20]'
                    }`}
                  >
                    <span className="block">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. نتائج الحساب المالي وباقة العزومة */}
          {feastData && feastData.summary && (
            <div className="space-y-4">
              
              {/* شريط الإحصائيات الذهبي */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-[#241A14] to-[#3D2E24] p-4 sm:p-5 rounded-2xl text-white shadow-md">
                <div>
                  <span className="text-[10px] text-amber-200 block font-medium">
                    {isEn ? 'Estimated Bundle Total' : 'إجمالي سعر الباقة بعد الخصم'}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400 font-serif">
                    {feastData.summary.bundle_price} {t('egp')}
                  </span>
                  <span className="text-[10px] text-emerald-300 block line-through">
                    {feastData.summary.original_price} {t('egp')}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-amber-200 block font-medium">
                    {isEn ? 'Cost Per Guest' : 'تكلفة الضيف الواحد'}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-white font-serif">
                    {feastData.summary.price_per_guest} {t('egp')}
                  </span>
                  <span className="text-[10px] text-emerald-300 block">
                    {isEn ? 'Economical & Generous' : 'موفر ومشبع جداً'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-amber-200 block font-medium">
                    {isEn ? 'Catering Discount' : 'وفرت في باقة العزومة'}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400 font-serif">
                    {feastData.summary.discount_amount} {t('egp')}
                  </span>
                  <span className="text-[10px] text-emerald-200 block">
                    ({feastData.summary.discount_percentage}% {isEn ? 'Off' : 'خصم خاص'})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-amber-200 block font-medium">
                    {isEn ? 'Fresh Baladi Bread' : 'العيش البلدي المجاني'}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-white font-serif">
                    {feastData.bread_loaves_included} {isEn ? 'Loaves' : 'رغيف'}
                  </span>
                  <span className="text-[10px] text-amber-300 block">
                    {isEn ? 'Included Free' : 'مشمول هدية سخن'}
                  </span>
                </div>
              </div>

              {/* تشكيلة الأطباق في الباقة */}
              <div className="space-y-3">
                <h4 className="font-black text-xs sm:text-sm text-[#1F1713] dark:text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{isEn ? 'Curated Feast Trays & Dishes:' : 'الأطباق والصواني المنسقة في عزومتك:'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {feastData.all_dishes.map((dish, i) => (
                    <div 
                      key={i}
                      className="bg-[#FAF5EE] dark:bg-[#1E140F] p-3 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {dish.image && (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#D2C4B7] dark:border-[#382A20]"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/categories/family-trays.jpg';
                            }}
                          />
                        )}
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-[#1F1713] dark:text-white truncate">
                            {dish.name}
                          </h5>
                          <p className="text-[10px] text-[#55453B] dark:text-[#D6C9BD] truncate">
                            {dish.description}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 shrink-0">
                        {dish.price} {t('egp')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* مزايا التوصيل والضمان */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] pt-1">
                <div className="flex items-center gap-2 bg-[#F7F4EF] dark:bg-[#1E140F] p-2.5 rounded-xl border border-[#D2C4B7]/60 dark:border-[#382A20]">
                  <Truck className="w-4 h-4 text-[#8A9684]" />
                  <span>{isEn ? 'Delivered in thermal heat-insulated containers' : 'توصيل في أواني فخارية عازلة للحرارة'}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F7F4EF] dark:bg-[#1E140F] p-2.5 rounded-xl border border-[#D2C4B7]/60 dark:border-[#382A20]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isEn ? '100% Baladi Cow Ghee Guarantee' : 'ضمان سمن بلدي فلاحي 100%'}</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ذيل النافذة والأزرار الرئيسية */}
        <div className="p-4 sm:p-5 bg-[#FAF5EE] dark:bg-[#20150E] border-t border-[#D2C4B7] dark:border-[#382A20] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-start">
            <span className="text-xs text-[#55453B] dark:text-[#D6C9BD] block font-medium">
              {isEn ? 'Ready to place this feast?' : 'جاهز لاعتماد العزومة؟'}
            </span>
            <span className="text-base sm:text-lg font-black text-[#1F1713] dark:text-white font-serif">
              {feastData ? `${feastData.summary.bundle_price} ${t('egp')}` : '...'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://wa.me/201065272373?text=${encodeURIComponent(
                isEn 
                  ? `Hello Loqma, I want to book a feast for ${guests} guests (${tier} tier) with a total of ${feastData?.summary.bundle_price || 0} EGP.`
                  : `مرحباً لقمة، أود حجز وتنسيق عزومة لعدد ${guests} أفراد (باقة ${tier}) بإجمالي ${feastData?.summary.bundle_price || 0} ج.م.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer flex-1 sm:flex-none"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isEn ? 'WhatsApp Catering' : 'تنسيق واتساب'}</span>
            </a>

            <button
              type="button"
              onClick={handleAddFeastToCart}
              disabled={loading || !feastData}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1F1713] dark:bg-amber-600 hover:bg-[#2B221D] text-white'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isEn ? 'Feast Added to Cart!' : 'تمت إضافة العزومة للسلة!'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isEn ? 'Add Entire Feast to Cart' : '🛒 إضافة العزومة بالكامل للسلة'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
