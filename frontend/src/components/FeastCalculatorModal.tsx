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
  Utensils
} from 'lucide-react';
import { planFeast, type FeastPlannerResponse } from '../services/aiApi';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface FeastCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// بكجات العزومات البيتية الجاهزة المعتمدة
const READY_FEAST_PACKAGES = [
  {
    id: 'family_feast',
    name: 'عزومة العيلة ولمّة الحبايب',
    nameEn: 'Grand Baladi Family Gathering',
    guests: '6 - 8 أفراد',
    price: 1850,
    originalPrice: 2200,
    badge: 'الأكثر طلباً للعائلات 👑',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&q=80',
    description: 'صينية محاشي مشكلة مشكلة فاخرة + بط بلدي محمر بالسمن الفلاحي + صينية رقاق باللحمة المفرومة + طاجن ملوخية خضرا بطشة التوم + سلطات بلدي وطحينة ومخلل.',
    items: [
      { name: 'صينية محاشي مشكلة (ورق عنب وكوسة وباذنجان وفلفل)', price: 380 },
      { name: 'بطة بلدي فلاحي محمرة بالسمن مع بطاطس ومرقة دسمة', price: 620 },
      { name: 'صينية رقاق بلدي بالسمن واللحمة المفرومة المعصجة', price: 280 },
      { name: 'طاجن ملوخية خضراء بمرقة البط وطشة الثوم والكزبرة', price: 160 },
      { name: 'سرفيس أرز مصري بالشعرية والمكسرات المحمصة', price: 210 },
      { name: 'تشكيلة سلطات خضراء، طحينة سمسم، مخلل بيتي وعيش بلدي', price: 200 }
    ]
  },
  {
    id: 'friends_feast',
    name: 'عزومة الصحاب وشباب الشغل',
    nameEn: 'Friends & Colleagues Feast',
    guests: '4 - 5 أفراد',
    price: 1150,
    originalPrice: 1380,
    badge: 'طواجن وبشاميل ومشويات 🔥',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
    description: 'طاجن لحمة بلدي بالبصل المكرمل + صينية مكرونة بشاميل غنية باللحمة + 1 كجم كفتة حاتي مشوية ع الفحم + أرز بالمكسرات وسلطات.',
    items: [
      { name: 'طاجن لحمة كندوز بلدي بصلصة البصل المكرمل الفلاحي', price: 340 },
      { name: 'صينية مكرونة بشاميل غنية وسايحة باللحمة المفرومة', price: 240 },
      { name: '1 كجم كفتة حاتي بلدي مشوية على الفحم مع بقدونس وبصل', price: 340 },
      { name: 'سرفيس أرز بالخلطة والمكسرات', price: 130 },
      { name: 'سلطة طحينة وسلطة خضراء وعيش بلدي سخن', price: 100 }
    ]
  },
  {
    id: 'royal_feast',
    name: 'عزومة البركة والوليمة الكبيرة',
    nameEn: 'Royal Banquet & Large Feast',
    guests: '10 - 14 فرد',
    price: 3200,
    originalPrice: 3850,
    badge: 'وليمة تشرف قدام أي ضيف 🏆',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80',
    description: 'فخدة ضاني بلدي أو ديك رومي كبير محمر + صينيتين محاشي مشكلة + صينيتين مكرونة بشاميل ورقاق + طواجن بامية بالموزات وسلطات كاملة.',
    items: [
      { name: 'فخدة ضاني بلدي متبلة بالأعشاب ومحمرة بالسمن في الفرن', price: 1250 },
      { name: '2 صينية محاشي مشكلة سرفيس كبير للعزومات', price: 650 },
      { name: 'صينية مكرونة بشاميل دبل + صينية رقاق مورق بلدي', price: 480 },
      { name: '2 طاجن بامية بلدي باللحمة الضاني والموزات', price: 420 },
      { name: 'سرفيس أرز بسمتي بالمكسرات والزبيب + كبدة', price: 250 },
      { name: 'مقبلات، سلطات بلدي، طحينة، مخللات، وبوفيه عيش بلدي سخن', price: 150 }
    ]
  }
];

export default function FeastCalculatorModal({ isOpen, onClose }: FeastCalculatorModalProps) {
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const { addToCart } = useCart();

  // تبويب: بكجات جاهزة أو حاسبة AI مخصصة
  const [activeMode, setActiveMode] = useState<'packages' | 'custom_ai'>('packages');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('family_feast');

  // خيار السرافيس العازلة للحرارة
  const [isInsulatedPlatters, setIsInsulatedPlatters] = useState(true);

  // لحاسبة الذكاء الاصطناعي
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
    if (isOpen && activeMode === 'custom_ai') {
      fetchFeastPlan();
    }
  }, [isOpen, guests, tier, preference, activeMode]);

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

  const selectedPackage = READY_FEAST_PACKAGES.find((p) => p.id === selectedPackageId) || READY_FEAST_PACKAGES[0];

  const handleAddFeastToCart = () => {
    const insulatedNote = isInsulatedPlatters ? ' (في سرافيس عازلة للحرارة للتقديم المباشر)' : '';

    if (activeMode === 'packages') {
      selectedPackage.items.forEach((item, idx) => {
        addToCart({
          id: 9700 + idx + (selectedPackage.id === 'family_feast' ? 10 : 30),
          name: `${item.name}${insulatedNote}`,
          description: `صنف ضمن ${selectedPackage.name}`,
          price: item.price,
          categoryId: 'family-trays',
          image: selectedPackage.image,
          tag: selectedPackage.badge
        }, 1);
      });
    } else if (feastData && feastData.all_dishes) {
      feastData.all_dishes.forEach((d: any) => {
        addToCart({
          id: d.id,
          name: `${d.name}${insulatedNote}`,
          description: d.description,
          price: d.price,
          categoryId: d.categoryId || 'family-trays',
          image: d.image,
          tag: 'عزومة لقمة الملكية 👑'
        }, 1);
      });
    }

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
        className="bg-white dark:bg-[#18110D] rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors"
        dir={dir}
      >
        {/* الترويسة الرئيسية */}
        <div className="p-4 sm:p-5 bg-[#FAF5EE] dark:bg-[#20150E] border-b border-[#D2C4B7] dark:border-[#382A20] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1F1713] dark:bg-amber-600 text-white flex items-center justify-center shadow-md">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-[#1F1713] dark:text-white font-serif-title">
                  ركن العزومات والولائم البيتية الكبيرة 👑
                </h3>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-300/40">
                  تشرفك قدام ضيوفك
                </span>
              </div>
              <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] font-medium">
                صواني وطواجن دافية تصلك جاهزة للسفرة مباشرة مع التغليف الحراري الفاخر.
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

        {/* محدد التبويب: بكجات جاهزة vs حاسبة ذكية */}
        <div className="px-4 sm:px-6 pt-4 pb-2 bg-[#FAF5EE]/50 dark:bg-[#1F1610] border-b border-[#D2C4B7]/60 dark:border-[#382A20] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMode('packages')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeMode === 'packages'
                  ? 'bg-[#1F1713] dark:bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#251D18] text-stone-700 dark:text-stone-300 border border-[#D2C4B7] dark:border-[#382A20]'
              }`}
            >
              بكجات عزومات جاهزة ومجربة (سريعة) 🍲
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('custom_ai')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeMode === 'custom_ai'
                  ? 'bg-[#1F1713] dark:bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#251D18] text-stone-700 dark:text-stone-300 border border-[#D2C4B7] dark:border-[#382A20]'
              }`}
            >
              حاسبة ومخطط الذكاء الاصطناعي المخصص 🤖
            </button>
          </div>

          {/* خيار السرافيس العازلة للحرارة */}
          <div 
            onClick={() => setIsInsulatedPlatters(!isInsulatedPlatters)}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
              isInsulatedPlatters 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                : 'bg-stone-50 border-stone-300 text-stone-500'
            }`}
          >
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
              isInsulatedPlatters ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-400'
            }`}>
              {isInsulatedPlatters && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>سرافيس عازلة للحرارة للتقديم المباشر 🔥</span>
          </div>
        </div>

        {/* محتوى النافذة */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-[#150F0B]">

          {/* شريط السرافيس للشاشات الصغيرة */}
          <div 
            onClick={() => setIsInsulatedPlatters(!isInsulatedPlatters)}
            className={`sm:hidden p-3 rounded-xl border flex items-center gap-2 text-xs font-bold cursor-pointer ${
              isInsulatedPlatters 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                : 'bg-stone-50 border-stone-300 text-stone-500'
            }`}
          >
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
              isInsulatedPlatters ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-400'
            }`}>
              {isInsulatedPlatters && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>طلب الأكل في سرافيس عازلة للحرارة للتقديم على السفرة مباشرة</span>
          </div>

          {/* الوضع 1: البكجات الجاهزة */}
          {activeMode === 'packages' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {READY_FEAST_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-4 rounded-2xl border-2 text-start transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#26472A] dark:border-amber-500 bg-[#26472A]/5 dark:bg-[#26472A]/20 shadow-md ring-2 ring-[#26472A]/20'
                          : 'border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF5EE] dark:bg-[#1E140F] hover:border-[#8A9684]'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300/40 inline-block mb-1.5">
                          {pkg.badge}
                        </span>
                        <h4 className="font-black text-sm text-[#1F1713] dark:text-white">
                          {pkg.name}
                        </h4>
                        <span className="text-xs text-stone-500 block mt-0.5">
                          تكفي: {pkg.guests}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-200 dark:border-stone-800 flex items-baseline justify-between">
                        <span className="text-base font-black text-[#26472A] dark:text-amber-400">
                          {pkg.price} {t('currency')}
                        </span>
                        <span className="text-[11px] text-stone-400 line-through">
                          {pkg.originalPrice} ج.م
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* تفاصيل البكج المختار */}
              <div className="bg-[#FAF5EE] dark:bg-[#1E140F] p-5 sm:p-6 rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D2C4B7] dark:border-[#382A20]">
                  <div>
                    <h4 className="font-black text-lg text-[#1F1713] dark:text-white">
                      قائمة أطباق: {selectedPackage.name}
                    </h4>
                    <p className="text-xs text-[#55453B] dark:text-[#A09383] mt-0.5">
                      {selectedPackage.description}
                    </p>
                  </div>
                  <div className="text-start sm:text-end">
                    <span className="text-xl font-black text-[#26472A] dark:text-amber-400 font-serif">
                      {selectedPackage.price} {t('currency')}
                    </span>
                    <span className="text-[10px] text-emerald-600 block font-bold">
                      شامل التوصيل والسلطات والعيش
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    محتويات البكج بالتفصيل:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedPackage.items.map((it, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#251D18] p-3 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800 dark:text-stone-200">{it.name}</span>
                        <span className="text-[11px] font-black text-[#8A9684] shrink-0 mx-2">{it.price} ج.م</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isInsulatedPlatters && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>خدمة السرافيس العازلة:</strong> يصل الأكل في أطباق وسرافيس فويل حرارية فاخرة توضع على السفرة فوراً وتحتفظ بالحرارة لساعات!
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* الوضع 2: حاسبة الذكاء الاصطناعي */}
          {activeMode === 'custom_ai' && (
            <div className="space-y-6">
              {/* 1. اختيار عدد الضيوف */}
              <div className="bg-[#FAF5EE] dark:bg-[#1F1610] p-4 sm:p-5 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#8A9684]" />
                    <span>عدد الضيوف المعزومين:</span>
                  </label>
                  <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 font-serif bg-white dark:bg-[#281B13] px-3 py-1 rounded-xl border border-[#D2C4B7] dark:border-[#382A20]">
                    {guests} أفراد
                  </span>
                </div>

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
                      {g} أفراد
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. النمط والميزانية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#8A9684]" />
                    <span>شهوة ونمط السفرة المفضلة:</span>
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

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>فئة الميزانية والدسامة:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {tiers.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTier(t.id)}
                        className={`p-2.5 rounded-xl text-center transition-all cursor-pointer ${
                          tier === t.id
                            ? 'bg-amber-600 text-white shadow-sm font-black'
                            : 'bg-[#FAF5EE] dark:bg-[#1E140F] text-[#1F1713] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20] font-bold'
                        }`}
                      >
                        <span className="text-xs block">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* أطباق الخطة المقترحة من الـ AI */}
              {loading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-stone-500">جاري تنسيق أشهى سفرة وحساب الكميات بدقة...</p>
                </div>
              ) : feastData && (
                <div className="bg-[#FAF5EE] dark:bg-[#1E140F] p-4 sm:p-5 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-800 dark:text-stone-200">
                      تشكيلة الأطباق المقترحة ({feastData.all_dishes?.length || 0} أطباق):
                    </span>
                    <span className="text-xs font-black text-[#26472A] dark:text-amber-400">
                      إجمالي العزومة: {feastData.summary.bundle_price} ج.م (وفرت {feastData.summary.total_savings} ج.م)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {feastData.all_dishes?.map((dish: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-[#251D18] border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
                        <span className="font-bold truncate">{dish.name}</span>
                        <span className="text-[#8A9684] font-black shrink-0 mx-2">{dish.price} ج.م</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ذيل النافذة */}
        <div className="p-4 sm:p-5 bg-[#FAF5EE] dark:bg-[#20150E] border-t border-[#D2C4B7] dark:border-[#382A20] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-start">
            <span className="text-xs text-[#55453B] dark:text-[#D6C9BD] block font-medium">
              إجمالي العزومة:
            </span>
            <span className="text-base sm:text-lg font-black text-[#1F1713] dark:text-white font-serif">
              {activeMode === 'packages'
                ? `${selectedPackage.price} ${t('currency')}`
                : `${feastData?.summary.bundle_price || 0} ${t('currency')}`
              }
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://wa.me/201065272373?text=${encodeURIComponent(
                `مرحباً لقمة، أود حجز وتنسيق ${activeMode === 'packages' ? selectedPackage.name : `عزومة لعدد ${guests} أفراد`} بسعر ${activeMode === 'packages' ? selectedPackage.price : feastData?.summary.bundle_price} ج.م مع السرافيس العازلة للحرارة.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer flex-1 sm:flex-none"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تنسيق واتساب</span>
            </a>

            <button
              type="button"
              onClick={handleAddFeastToCart}
              disabled={activeMode === 'custom_ai' && (loading || !feastData)}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1F1713] dark:bg-amber-600 hover:bg-[#2B221D] text-white'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>تمت إضافة العزومة للسلة!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>🛒 إضافة العزومة بالكامل للسلة</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
