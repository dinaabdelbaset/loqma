import { useState, useMemo } from 'react';
import { X, Plus, Minus, Check, Flame, Sparkles, ChefHat } from 'lucide-react';
import type { MenuItem } from '../data/menuData';
import { useCart, type CartAddon } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ProductVideo from './ProductVideo';

interface DishDetailModalProps {
  dish: MenuItem | null;
  categoryBanner?: string;
  onClose: () => void;
}

const AVAILABLE_ADDONS_DATA = [
  { id: 'bread', nameAr: 'عيش بلدي سخن مقمر من الفرن (3 أرغفة)', nameEn: 'Warm Baladi Bread (3 Loaves)', price: 10 },
  { id: 'tahini', nameAr: 'سلطة طحينة سمسم بيور بالخل والثوم', nameEn: 'Pure Sesame Tahini with Garlic Dip', price: 18 },
  { id: 'pickles', nameAr: 'مخلل بيتي مشكل مقرمش', nameEn: 'Crispy Mixed Homemade Pickles', price: 10 },
  { id: 'baladi_salad', nameAr: 'سلطة بلدي خضراء بالدقة الفلاحي', nameEn: 'Fresh Green Salad with Rural Daqqa', price: 15 },
  { id: 'eggplant', nameAr: 'باذنجان مخلل بالثوم والفلفل الأحمر', nameEn: 'Garlic & Red Pepper Pickled Eggplant', price: 20 },
  { id: 'extra_tasha', nameAr: 'طشة ثوم وكزبرة وسمن بلدي إضافية', nameEn: 'Extra Sizzling Garlic & Ghee Tasha', price: 15 },
  { id: 'soup', nameAr: 'بولة شوربة لسان عصفور بمرقة بلدي', nameEn: 'Bowl of Orzo Soup in Baladi Broth', price: 35 },
  { id: 'pepsi', nameAr: 'كانز بيبسي مثلج', nameEn: 'Chilled Pepsi Can', price: 27 },
];

export default function DishDetailModal({ dish, categoryBanner, onClose }: DishDetailModalProps) {
  if (!dish) return null;

  return (
    <DishDetailModalContent
      dish={dish}
      categoryBanner={categoryBanner}
      onClose={onClose}
    />
  );
}

function DishDetailModalContent({ 
  dish, 
  categoryBanner, 
  onClose 
}: { 
  dish: MenuItem; 
  categoryBanner?: string; 
  onClose: () => void; 
}) {
  const { addCustomizedToCart, setIsCartOpen } = useCart();
  const { language, t, tDishName, tDishDesc } = useLanguage();
  const isEn = language === 'en';

  const dishTitle = tDishName(dish.name);
  const dishDescription = tDishDesc(dish.name, dish.description);

  // تحديد خيارات الحجم والوزن بناءً على تصنيف الطبق
  const sizeOptions = useMemo(() => {
    const cat = dish.categoryId;
    
    // مشويات ولحوم ومحمر
    if (['charcoal-grills', 'grills', 'butter-browned'].includes(cat)) {
      return [
        { 
          label: isEn ? 'Quarter Kilo (Single Portion)' : 'ربع كيلو (حجم أساسي)', 
          priceDelta: 0, 
          desc: isEn ? 'Perfect for 1 person' : 'مناسب لفرد واحد' 
        },
        { 
          label: isEn ? 'Half Kilo (Value Feast)' : 'نصف كيلو (عرض توفير)', 
          priceDelta: Math.round(dish.price * 0.95), 
          desc: isEn ? 'Generous for 2 persons' : 'مناسب لفردين' 
        },
        { 
          label: isEn ? 'Full Kilo (Family Gathering)' : 'كيلو كامل (وليمة عائلية)', 
          priceDelta: Math.round(dish.price * 2.8), 
          desc: isEn ? 'Serves 4-5 persons' : 'تكفي 4-5 أفراد' 
        },
      ];
    }

    // حمام وبط
    if (cat === 'pigeon-duck') {
      if (dish.name.includes('حمام')) {
        return [
          { 
            label: isEn ? '1 Stuffed Pigeon' : 'فردة حمام واحدة', 
            priceDelta: 0, 
            desc: isEn ? 'Pan-roasted in pure ghee' : 'محمرة بالسمن البلدي' 
          },
          { 
            label: isEn ? 'Pair of Pigeons (2 Birds)' : 'جوز حمام (فردتين كاملتين)', 
            priceDelta: dish.price - 15, 
            desc: isEn ? 'Classic Egyptian feast' : 'وجبة الحمام الكلاسيكية' 
          },
        ];
      }
      return [
        { 
          label: isEn ? 'Half Country Duck' : 'نصف بطة (حجم أساسي)', 
          priceDelta: 0, 
          desc: isEn ? 'Generous meal for 2' : 'وجبة فردين' 
        },
        { 
          label: isEn ? 'Whole Baladi Duck' : 'بطة بلدي كاملة', 
          priceDelta: dish.price, 
          desc: isEn ? 'Full family banquet' : 'عزومة عائلية متكاملة' 
        },
      ];
    }

    // طواجن وفتة ومحاشي وفرن فلاحي
    if (['clay-tagines', 'fattah-rice', 'mahshi', 'hagouga', 'rustic-oven'].includes(cat)) {
      return [
        { 
          label: isEn ? 'Medium Claypot (1 Person)' : 'طاجن وسط (شخص واحد)', 
          priceDelta: 0, 
          desc: isEn ? 'Generous standard claypot' : 'الحجم الفلاحي المعتاد' 
        },
        { 
          label: isEn ? 'Large Claypot (2 Persons)' : 'طاجن كبير (شخصين)', 
          priceDelta: 60, 
          desc: isEn ? 'Double portion with extra ghee' : 'كمية مضاعفة مع سمن بلدي زيادة' 
        },
        { 
          label: isEn ? 'Family Banquet Platter (3-4 Persons)' : 'سرفيس عائلي لقمة (3-4 أفراد)', 
          priceDelta: 140, 
          desc: isEn ? 'Grand festive casserole' : 'صينية عزومات متكاملة' 
        },
      ];
    }

    // شوربات وسلطات وحلويات ومشروبات
    return [
      { label: isEn ? 'Standard Size' : 'حجم عادي (مفرد)', priceDelta: 0, desc: isEn ? 'Single serving' : 'الحجم القياسي' },
      { label: isEn ? 'Large Double Size' : 'حجم كبير دبل', priceDelta: 20, desc: isEn ? 'Double portion' : 'حصة مضاعفة' },
    ];
  }, [dish, isEn]);

  // تحديد خيارات الحشو
  const stuffingOptions = useMemo(() => {
    if (dish.categoryId === 'pigeon-duck' || dish.name.includes('محشي') || dish.name.includes('حمام')) {
      return [
        { label: isEn ? 'Sa\'idi Baladi Freekeh with Ghee (Best Seller ⭐)' : 'فريك صعيدي بلدي بالسمن (الأكثر طلباً ⭐)' },
        { label: isEn ? 'Egyptian Spiced Rice with Nuts & Herbs' : 'أرز مصري مفلفل بخلطة البهارات والمكسرات' },
        { label: isEn ? 'Mixed Freekeh & Spiced Rice' : 'ميكس فريك وأرز بالخلطة' },
      ];
    }
    return [];
  }, [dish, isEn]);

  const cookingStyles = useMemo(() => {
    if (['charcoal-grills', 'grills'].includes(dish.categoryId)) {
      return [
        { label: isEn ? 'Tender & Juicy Charcoal Grill' : 'تسوية فحم بلدي مظبوط (طرية وعصارية)' },
        { label: isEn ? 'Crispy & Well Done Charcoal Grill' : 'تسوية مقمرة ومقرمشة ومحمرة زيادة' },
      ];
    }
    if (['clay-tagines', 'rustic-oven', 'hagouga'].includes(dish.categoryId)) {
      return [
        { label: isEn ? 'Slow Claypot Stew with Thick Jus' : 'تسوية فخار مسبك مع صوص غني' },
        { label: isEn ? 'High Oven Broil with Golden Gratin Top' : 'تسوية فرن حامي بوش جراتان محمر' },
      ];
    }
    return [];
  }, [dish, isEn]);

  // الحالات التفاعلية
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedStuffing, setSelectedStuffing] = useState<string>(
    stuffingOptions[0]?.label || ''
  );
  const [selectedCookingStyle, setSelectedCookingStyle] = useState<string>(
    cookingStyles[0]?.label || ''
  );
  const [selectedAddons, setSelectedAddons] = useState<{ [id: string]: boolean }>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const selectedSize = sizeOptions[selectedSizeIndex] || sizeOptions[0];

  const addonsTotal = useMemo(() => {
    return AVAILABLE_ADDONS_DATA.reduce((sum, a) => {
      return selectedAddons[a.id] ? sum + a.price : sum;
    }, 0);
  }, [selectedAddons]);

  const unitPrice = dish.price + (selectedSize?.priceDelta || 0) + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: !prev[addonId],
    }));
  };

  // خيارات نَفَس الطبخة والدايت البيتي
  const homeKitchenOptions = useMemo(() => [
    { id: 'low_salt', label: isEn ? '🧂 Very Low Salt (Blood Pressure)' : '🧂 ملح خفيف جداً (لمرضى الضغط)' },
    { id: 'low_fat', label: isEn ? '🧈 Light Ghee / Low Fat (Diabetes & Seniors)' : '🧈 سمن خفيف / قليل الدهون (لكبار السن والسكر)' },
    { id: 'mild_spices', label: isEn ? '👶 No Chili / Gentle Spices (Kids)' : '👶 بدون شطة / بهارات هادية (للأطفال)' },
    { id: 'crust_golden', label: isEn ? '🥮 Light Golden Broil' : '🥮 تحمير دهبي هادي' },
    { id: 'crust_crisp', label: isEn ? '🔥 Well-done Crispy Crust' : '🔥 تحمير مقمر ومقرمش ع الوش' },
  ], [isEn]);

  const [selectedHomeOptions, setSelectedHomeOptions] = useState<string[]>([]);

  const toggleHomeOption = (label: string) => {
    setSelectedHomeOptions((prev) => 
      prev.includes(label) ? prev.filter((o) => o !== label) : [...prev, label]
    );
  };

  const handleAddToCart = () => {
    const activeAddons: CartAddon[] = AVAILABLE_ADDONS_DATA
      .filter((a) => selectedAddons[a.id])
      .map((a) => ({
        id: a.id,
        name: isEn ? a.nameEn : a.nameAr,
        price: a.price,
      }));

    const finalInstructions = [
      selectedHomeOptions.length > 0 ? `[نَفَس الطبخة: ${selectedHomeOptions.join(' - ')}]` : '',
      specialInstructions.trim()
    ].filter(Boolean).join(' | ');

    addCustomizedToCart({
      item: dish,
      quantity,
      size: selectedSize?.label,
      sizePriceModifier: selectedSize?.priceDelta || 0,
      stuffing: selectedStuffing,
      cookingStyle: selectedCookingStyle,
      addons: activeAddons,
      specialInstructions: finalInstructions,
      unitPrice,
    });

    setIsAddedSuccess(true);
    setTimeout(() => {
      setIsAddedSuccess(false);
      onClose();
      setIsCartOpen(true);
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      <div 
        className="bg-[#F7F4EF] dark:bg-[#1E1713] w-full max-w-2xl rounded-3xl sm:rounded-[36px] border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
          title={isEn ? "Close" : "إغلاق"}
        >
          <X className="w-5 h-5" />
        </button>

        {/* رأس النافذة: صورة الوجبة أو الفيديو التوضيحي */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-black shrink-0">
          {dish.videoUrl ? (
            <ProductVideo
              src={dish.videoUrl}
              poster={dish.image || categoryBanner || '/images/categories/charcoal-grills.jpg'}
              alt={dishTitle}
              aspectRatio="h-full w-full"
              threshold={0.3}
              lazy={false}
              badgeText={isEn ? "Food Film ♨️" : "فيديو الصنعة ♨️"}
              showMuteButton={true}
              className="w-full h-full"
              videoClassName="w-full h-full object-cover object-center"
            />
          ) : (
            <>
              <img
                src={dish.image || categoryBanner || '/images/categories/charcoal-grills.jpg'}
                alt={dishTitle}
                className="w-full h-full object-cover filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            </>
          )}

          <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between pointer-events-none">
            <div>
              <span className="inline-block bg-[#8A9684] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1 shadow-md">
                {dish.tag || (isEn ? "Loqma Signature" : "أكلات لقمة الأصيلة")}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-serif-title drop-shadow-md">
                {dishTitle}
              </h2>
            </div>

            <div className="text-left bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-white/20">
              <span className="text-[10px] text-stone-300 block">{isEn ? "Starting at" : "يبدأ من"}</span>
              <span className="text-lg sm:text-xl font-black text-amber-300">
                {dish.price} {t('currency')}
              </span>
            </div>
          </div>
        </div>

        {/* جسم النافذة: الخيارات والأحجام والإضافات */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          
          {/* وصف الطبق وسعراته */}
          <div>
            <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] leading-relaxed mb-3 font-medium">
              {dishDescription}
            </p>
            {dish.calories && (
              <div className="inline-flex items-center gap-1.5 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-3 py-1 rounded-full text-xs font-bold border border-[#8A9684]/30">
                <Flame className="w-3.5 h-3.5" />
                <span>{dish.calories} {t('scheduleCalories')}</span>
              </div>
            )}
          </div>

          {/* 1. اختيار الحجم أو الوزن */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs sm:text-sm font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#8A9684]" />
                <span>{isEn ? "Select Size / Portion (Required):" : "اختر الحجم أو الوزن (مطلوب):"}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {sizeOptions.map((opt, idx) => {
                const isSelected = selectedSizeIndex === idx;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#8A9684] bg-[#8A9684]/15 shadow-sm'
                        : 'border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#241A14] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs text-[#1F1713] dark:text-white">{opt.label}</span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-[#8A9684] bg-[#8A9684]' : 'border-[#D2C4B7]'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#55453B] dark:text-[#A09383] mb-2">{opt.desc}</span>
                    <span className="text-xs font-black text-[#8A9684] dark:text-[#A3D4A8]">
                      {opt.priceDelta > 0 ? `+${opt.priceDelta} ${t('currency')}` : (isEn ? "Included" : "السعر الأساسي")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. نوع الحشو (إن وجد) */}
          {stuffingOptions.length > 0 && (
            <div>
              <label className="block text-xs sm:text-sm font-black text-[#1F1713] dark:text-white mb-2.5">
                {isEn ? "Stuffing Choice:" : "نوع الحشو:"}
              </label>

              <div className="space-y-2">
                {stuffingOptions.map((opt) => {
                  const isSelected = selectedStuffing === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedStuffing(opt.label)}
                      className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#8A9684] bg-[#8A9684]/15'
                          : 'border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#241A14] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#1F1713] dark:text-white">{opt.label}</span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-[#8A9684] bg-[#8A9684]' : 'border-[#D2C4B7]'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. درجة التسوية (إن وجد) */}
          {cookingStyles.length > 0 && (
            <div>
              <label className="block text-xs sm:text-sm font-black text-[#1F1713] dark:text-white mb-2.5">
                {isEn ? "Cooking Style & Technique:" : "درجة ونوع التسوية:"}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cookingStyles.map((opt) => {
                  const isSelected = selectedCookingStyle === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedCookingStyle(opt.label)}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#8A9684] bg-[#8A9684]/15'
                          : 'border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#241A14] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#1F1713] dark:text-white">{opt.label}</span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-[#8A9684] bg-[#8A9684]' : 'border-[#D2C4B7]'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. إضافات سفرة زمان (Add-ons) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs sm:text-sm font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#8A9684]" />
                <span>{isEn ? "Complementary Add-ons & Sides (Optional):" : "إضافات ومقبلات تكمل اللقمة (اختياري):"}</span>
              </label>
              <span className="text-[11px] text-[#55453B] dark:text-[#A09383]">{isEn ? "Select any" : "اختر ما تحب"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_ADDONS_DATA.map((addon) => {
                const isChecked = !!selectedAddons[addon.id];
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      isChecked
                        ? 'border-[#8A9684] bg-[#8A9684]/15'
                        : 'border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#241A14] hover:border-[#8A9684]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md border-2 flex items-center justify-center ${
                          isChecked ? 'border-[#8A9684] bg-[#8A9684] text-white' : 'border-[#D2C4B7]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold text-[#1F1713] dark:text-white">
                        {isEn ? addon.nameEn : addon.nameAr}
                      </span>
                    </div>

                    <span className="text-xs font-black text-[#8A9684] shrink-0 mx-2">
                      +{addon.price} {t('currency')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. تخصيص نَفَس الطبخة والدايت والمرضى */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#8A9684]" />
                <span>{isEn ? "Personalized Home Cooking & Diet (Optional):" : "نَفَس الطبخة والدايت البيتي (رعاية خاصة):"}</span>
              </label>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/50">
                {isEn ? "Care for Family" : "اهتمام بصحة عائلتك"}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {homeKitchenOptions.map((opt) => {
                const isSelected = selectedHomeOptions.includes(opt.label);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleHomeOption(opt.label)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-[#2D4F35] bg-[#2D4F35] text-white shadow-xs'
                        : 'border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#241A14] text-[#3D312A] dark:text-[#E2D9D0] hover:border-[#8A9684]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. ملاحظات الشيف الخاصة */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#1F1713] dark:text-white mb-1.5">
              {isEn ? "Special Chef Instructions (Optional):" : "ملاحظات إضافية للشيف (اختياري):"}
            </label>
            <input
              type="text"
              placeholder={isEn ? "e.g. Extra lemon, light garlic, well-done bread..." : "مثال: بدون بصل، دقة خفيفة، شطة زيادة، ليمون إضافي..."}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full bg-white dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1713] dark:text-white placeholder-[#6E5D53] focus:outline-none focus:border-[#8A9684]"
            />
          </div>

        </div>

        {/* ذيل النافذة الثابت */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1E1713] border-t border-[#D2C4B7] dark:border-[#382A20] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#261D17] p-1.5 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white dark:bg-[#1E1713] text-[#1F1713] dark:text-white flex items-center justify-center hover:bg-[#D2C4B7]/30 transition-colors font-bold text-sm shadow-xs"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-7 text-center font-black text-sm text-[#1F1713] dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-[#3D312A] dark:bg-amber-600 text-[#F7F4EF] flex items-center justify-center hover:bg-[#2B221D] transition-colors font-bold text-sm shadow-xs border border-[#8A9684]/40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-[#55453B] dark:text-[#A09383] block">
                {isEn ? "Custom Total:" : "الإجمالي المخصص:"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#1F1713] dark:text-white">
                {totalPrice}
              </span>
              <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mx-1">{t('currency')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full sm:w-auto sm:min-w-[240px] py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
              isAddedSuccess
                ? 'bg-[#8A9684] text-white'
                : 'bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] border border-[#8A9684]/50 shadow-md'
            }`}
          >
            {isAddedSuccess ? (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>{isEn ? "Added to Cart Successfully!" : "تمت الإضافة للسلة بنجاح!"}</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>{isEn ? `Add to Cart (${totalPrice} EGP)` : `أضف للسلة (${totalPrice} ج.م)`}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
