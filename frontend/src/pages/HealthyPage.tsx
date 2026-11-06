import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Plus, 
  Check, 
  Heart, 
  Activity, 
  Apple, 
  Scale,
  Leaf,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import type { MenuItem } from '../data/menuData';

interface HealthyDish {
  id: number;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dietType: 'high-protein' | 'low-carb' | 'keto' | 'balanced';
  dietLabel: string;
  dietLabelEn: string;
  servings: string;
  servingsEn: string;
}

const HEALTHY_DISHES: HealthyDish[] = [
  {
    id: 9001,
    name: 'صدور دجاج مشوية بالأعشاب وخضار سوتيه',
    nameEn: 'Herb-Grilled Chicken Breast with Sautéed Veggies',
    tagline: 'صدر دجاج بلدي 250جم متبل بالزعتر والليمون مع بروكلي وجزر وكوسة سوتيه',
    taglineEn: '250g baladi chicken breast marinated in thyme & lemon with broccoli, carrots & zucchini',
    description: 'مشوي على الجريل بدون أي زيوت مهدرجة، متبل بزيت زيتون بكر ممتاز وعصير ليمون وأعشاب ريفية طازجة.',
    descriptionEn: 'Grilled without hydrogenated oils, dressed with EVOO, lemon juice, and rustic fresh herbs.',
    price: 135,
    image: '/images/dishes/grilled_chicken_breast.jpg',
    calories: 380,
    protein: 48,
    carbs: 12,
    fats: 8,
    dietType: 'high-protein',
    dietLabel: 'بروتين عالي 💪',
    dietLabelEn: 'High Protein 💪',
    servings: 'فرد واحد مشبع',
    servingsEn: '1 Generous Serving'
  },
  {
    id: 9002,
    name: 'فيليه سالمون مشوي مع كينوا وبروكلي سوتيه',
    nameEn: 'Grilled Salmon Fillet with Quinoa & Steamed Broccoli',
    tagline: 'قطعة سالمون نرويجي طازج 220جم غني بالأوميجا 3 مع كينوا بالخضار',
    taglineEn: '220g fresh Norwegian salmon rich in Omega-3 with rainbow vegetable quinoa',
    description: 'مطهو بالفرن بلمسة ليمون وشبت وزيت زيتون بكر. وجبة مثالية للرياضيين وصحة القلب والشرايين.',
    descriptionEn: 'Oven-baked with lemon, dill, and extra virgin olive oil. Ideal for cardiovascular wellness.',
    price: 245,
    image: '/images/dishes/baked_salmon.jpg',
    calories: 440,
    protein: 42,
    carbs: 22,
    fats: 14,
    dietType: 'keto',
    dietLabel: 'كيتو وأوميجا 3 🐟',
    dietLabelEn: 'Keto & Omega-3 🐟',
    servings: 'فرد واحد',
    servingsEn: '1 Serving'
  },
  {
    id: 9003,
    name: 'طاجن تورلي خضار فريش ني في ني بزيت الزيتون',
    nameEn: 'Rustic Vegetable Clay Tajine (Nai-fi-Nai)',
    tagline: 'كوسة، فاصوليا خضراء، بطاطس، وجزر مع صوص طماطم فريش خفيف',
    taglineEn: 'Zucchini, green beans, carrots, and potatoes in a light fresh tomato reduction',
    description: 'مطهي على البخار داخل طاجن فخار أسواني بدون أي تسبيك أو دهون ثقيلة. خفيف جداً على المعدة وغني بالألياف.',
    descriptionEn: 'Slow-steamed inside an Aswan clay pot with zero heavy fats. High fiber and light on digestion.',
    price: 85,
    image: '/images/dishes/vegetable_tagine.jpg',
    calories: 210,
    protein: 8,
    carbs: 34,
    fats: 4,
    dietType: 'balanced',
    dietLabel: 'غني بالألياف 🌿',
    dietLabelEn: 'High Fiber 🌿',
    servings: 'فرد - فردين',
    servingsEn: '1 - 2 Servings'
  },
  {
    id: 9004,
    name: 'شيش طاووق بلدي مشوي مع أرز بسمتي لايت',
    nameEn: 'Grilled Baladi Shish Tawook with Light Basmati',
    tagline: 'أوراك دجاج مخلية متبلة بزبادي لايت ومستردة مع أرز بسمتي مسلوق وخضار مشوي',
    taglineEn: 'Boneless chicken cubes marinated in light yogurt and mustard with steamed basmati',
    description: 'قطع شيش متبلة على أصولها ومشوية على أسياخ خشبية مع فلفل ألوان وبصل مشوي خفيف السعرات.',
    descriptionEn: 'Charcoal grilled skewers with sweet bell peppers and sweet red onions.',
    price: 145,
    image: '/images/dishes/shish_tawook.jpg',
    calories: 420,
    protein: 44,
    carbs: 38,
    fats: 9,
    dietType: 'high-protein',
    dietLabel: 'دايت متوازن ⚡',
    dietLabelEn: 'Balanced Diet ⚡',
    servings: 'فرد واحد مشبع',
    servingsEn: '1 Generous Serving'
  },
  {
    id: 9005,
    name: 'كفتة لحم بقري بلدي مشوية دايت بدون دهون',
    nameEn: 'Lean Baladi Beef Kofta (95% Lean Meat)',
    tagline: 'لحم بقري صافي مفروم 95% أحمر مع بقدونس وبصل مبشور وسلطة خضراء',
    taglineEn: 'Pure 95% lean baladi minced beef with parsley, onions, and fresh baladi salad',
    description: 'مشوية على الفحم الهادئ بدون دهون إضافية أو بقسماط تجاري، تقدم مع سلطة بلدي وخبز سن بلدي محمص.',
    descriptionEn: 'Gently grilled over embers with no breadcrumbs or added fat. Served with bran bread.',
    price: 160,
    image: '/images/dishes/diet_kofta.jpg',
    calories: 360,
    protein: 46,
    carbs: 6,
    fats: 12,
    dietType: 'low-carb',
    dietLabel: 'لو كارب 🥩',
    dietLabelEn: 'Low Carb 🥩',
    servings: 'فرد واحد',
    servingsEn: '1 Serving'
  },
  {
    id: 9006,
    name: 'سلطة كينوا سوبر فود بالرمان والأفوكادو',
    nameEn: 'Superfood Quinoa Salad with Pomegranate & Avocado',
    tagline: 'كينوا عضوية مع جرجير فريش، حبات رمان، أفوكادو، ودريسينج ليمون وزيت زيتون',
    taglineEn: 'Organic quinoa, baby arugula, pomegranate pearls, ripe avocado, EVOO lemon dressing',
    description: 'سلطة كاملة القيمة الغذائية مضادة للأكسدة تمنحك طاقة وشبعاً طوال اليوم بدون انتفاخ أو ثقل.',
    descriptionEn: 'Antioxidant-dense power salad delivering sustained clean energy without bloating.',
    price: 95,
    image: '/images/dishes/quinoa_salad.jpg',
    calories: 280,
    protein: 11,
    carbs: 28,
    fats: 13,
    dietType: 'balanced',
    dietLabel: 'سوبر فود 🥑',
    dietLabelEn: 'Superfood 🥑',
    servings: 'طبق رئيسي أو جانبي',
    servingsEn: 'Main or Side'
  },
  {
    id: 9007,
    name: 'طاجن بامية دايت خفيفة بقطع اللحم البتلو',
    nameEn: 'Light Baladi Veal Okra Tajine',
    tagline: 'بامية فلاحي صغيرة مقمعة اليوم مع لحم بتلو مسلوق وصلصة طماطم خفيفة',
    taglineEn: 'Fresh small baladi okra with tender boiled veal chunks and mild tomato salsa',
    description: 'طهي هادئ بني في ني، لحم بتلو مسلوق طري وخفيف جداً على الكوليسترول مع عصرة ليمون وكسبرة خضراء.',
    descriptionEn: 'Gentle steam simmer, very low in saturated fats and easy on cholesterol levels.',
    price: 175,
    image: '/images/dishes/okra_tagine.jpg',
    calories: 320,
    protein: 38,
    carbs: 16,
    fats: 9,
    dietType: 'low-carb',
    dietLabel: 'لو كارب وصحي 🍲',
    dietLabelEn: 'Low Carb Healthy 🍲',
    servings: 'فرد واحد مشبع',
    servingsEn: '1 Generous Serving'
  },
  {
    id: 9008,
    name: 'شوربة خضار مشكل بقطع الدجاج البلدي المسلوق',
    nameEn: 'Nourishing Countryside Chicken & Garden Veggie Soup',
    tagline: 'مرقة دجاج بلدي خفيفة مصفاة من الدهون مع كوسة، جزر، فاصوليا، وخرشوف',
    taglineEn: 'Clarified baladi chicken broth with zucchini, carrots, green beans, and artichoke',
    description: 'أفضل وجبة للتعافي والراحة، خفيفة على المعدة غنية بالفيتامينات والمعادن الطبيعية.',
    descriptionEn: 'Comforting restorative broth, light on digestion and packed with micro-nutrients.',
    price: 75,
    image: '/images/dishes/veg_chicken_soup.jpg',
    calories: 190,
    protein: 26,
    carbs: 14,
    fats: 3,
    dietType: 'high-protein',
    dietLabel: 'خفيف ودافئ 🥣',
    dietLabelEn: 'Light & Warm 🥣',
    servings: 'بولة كبيرة',
    servingsEn: 'Large Bowl'
  }
];

export default function HealthyPage() {
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-protein' | 'low-carb' | 'keto' | 'balanced'>('all');
  const [justAdded, setJustAdded] = useState<{ [id: number]: boolean }>({});
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const BreadcrumbArrow = isEn ? ChevronRight : ChevronLeft;

  const handleAddToCart = (dish: HealthyDish) => {
    const cartItem: MenuItem = {
      id: dish.id,
      name: isEn ? dish.nameEn : dish.name,
      description: isEn ? dish.descriptionEn : dish.description,
      price: dish.price,
      categoryId: 'healthy',
      image: dish.image,
      calories: dish.calories,
      tag: isEn ? dish.dietLabelEn : dish.dietLabel
    };

    addToCart(cartItem, 1);
    setJustAdded((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setJustAdded((prev) => ({ ...prev, [dish.id]: false }));
    }, 1500);
  };

  const filteredDishes = activeFilter === 'all'
    ? HEALTHY_DISHES
    : HEALTHY_DISHES.filter((d) => d.dietType === activeFilter);

  const filterTabs = [
    { id: 'all', label: isEn ? 'All Healthy Dishes (8)' : 'كافة الأطباق الصحية (8)' },
    { id: 'high-protein', label: isEn ? 'High Protein' : 'بروتين عالي (High Protein)' },
    { id: 'low-carb', label: isEn ? 'Low Carb' : 'قليل الكارب (Low Carb)' },
    { id: 'keto', label: isEn ? 'Keto Diet' : 'كيتو دايت (Keto)' },
    { id: 'balanced', label: isEn ? 'Balanced & Light' : 'متوازن وخفيف (Balanced)' }
  ];

  return (
    <div className="bg-[#F7F4EF] dark:bg-[#120E0C] text-[#1F1713] dark:text-[#F7F4EF] min-h-screen py-8 sm:py-14 transition-colors" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* شريط المسار (Breadcrumbs) */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#55453B] dark:text-[#D6C9BD] border-b border-[#D2C4B7]/60 dark:border-[#382A20] pb-3">
          <Link to="/" className="hover:text-amber-600 transition-colors">{t('navHome')}</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 text-[#8A9684]" />
          <span className="font-bold text-[#26472A] dark:text-[#A3D4A8]">{t('navHealthy')}</span>
        </nav>

        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-4 py-1.5 rounded-full text-xs font-black border border-[#8A9684]/30 shadow-xs">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>{isEn ? 'Loqma Fit • Healthy & Macro-Calculated Living' : 'لقمة هيلثي • Healthy & Fit Living'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1F1713] dark:text-white font-serif-title leading-tight">
            {isEn ? 'Macro-Calculated Baladi Clean Food' : 'أكل بيتي صحي محسوب السعرات والماكروز'}
          </h1>

          <p className="text-xs sm:text-base text-[#55453B] dark:text-[#D6C9BD] leading-relaxed font-medium">
            {isEn
              ? 'Dieting shouldn\'t mean deprivation. We bridge the irresistible taste of authentic Egyptian food with strict nutritional macros: zero trans fats, lean meats, and precise counts of protein, carbs, and good fats.'
              : 'عشان الدايت مش حرمان.. جمعنا لك بين نَفَس الأكل البيتي المصري اللذيذ، وبين معايير التغذية الصحية الدقيقة: صفر دهون مهدرجة، لحوم فريش، وخضار طازة مع إحصاء دقيق للبروتين، الكارب، والدهون.'
            }
          </p>
        </div>

        {/* شريط مميزات القسم الصحي */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="bg-white dark:bg-[#1E1713] p-4 rounded-2xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <Scale className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <span className="text-xs font-black text-[#1F1713] dark:text-white block">{isEn ? 'Precise Macros' : 'ماكروز وسعرات دقيقة'}</span>
            <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD]">{isEn ? 'Calculated to the gram' : 'محسوبة بالجرام لكل وجبة'}</span>
          </div>
          <div className="bg-white dark:bg-[#1E1713] p-4 rounded-2xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <Heart className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
            <span className="text-xs font-black text-[#1F1713] dark:text-white block">{isEn ? 'Extra Virgin Olive Oil' : 'زيت زيتون بكر ممتاز'}</span>
            <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD]">{isEn ? '0% Trans fats or deep frying' : 'صفر دهون مهدرجة ومقليات'}</span>
          </div>
          <div className="bg-white dark:bg-[#1E1713] p-4 rounded-2xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <Activity className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
            <span className="text-xs font-black text-[#1F1713] dark:text-white block">{isEn ? 'High Protein' : 'بروتين عالي ومشبع'}</span>
            <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD]">{isEn ? 'Clean lean baladi cuts' : 'دواجن ولحوم بلدي صافية'}</span>
          </div>
          <div className="bg-white dark:bg-[#1E1713] p-4 rounded-2xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <Apple className="w-5 h-5 text-green-500 mx-auto mb-1.5" />
            <span className="text-xs font-black text-[#1F1713] dark:text-white block">{isEn ? 'Fresh Steamed Greens' : 'خضار فريش ني في ني'}</span>
            <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD]">{isEn ? 'High fiber & easy digestion' : 'غني بالألياف وسهل الهضم'}</span>
          </div>
        </div>

        {/* أزرار التصفية والأنظمة الغذائية */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#2D4F35] text-white shadow-md scale-105'
                  : 'bg-white dark:bg-[#1E1713] text-[#1F1713] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20] hover:border-emerald-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* شبكة الأطباق الصحية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => {
            const title = isEn ? dish.nameEn : dish.name;
            const tagline = isEn ? dish.taglineEn : dish.tagline;
            const desc = isEn ? dish.descriptionEn : dish.description;
            const badge = isEn ? dish.dietLabelEn : dish.dietLabel;
            const servings = isEn ? dish.servingsEn : dish.servings;

            return (
              <div
                key={dish.id}
                className="bg-white dark:bg-[#1E1713] rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* صورة الطبق */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/10">
                    <img
                      src={dish.image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/categories/clay-tagines.jpg';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-[#2D4F35]/95 text-white text-[11px] font-black px-3 py-1 rounded-full backdrop-blur-md shadow-xs">
                      {badge}
                    </div>
                    <div className="absolute bottom-3 right-3 left-3 bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>{dish.calories} {isEn ? 'Calories' : 'سعر حراري'}</span>
                      </span>
                      <span className="text-[11px] text-amber-300 font-semibold">
                        {servings}
                      </span>
                    </div>
                  </div>

                  {/* تفاصيل الطبق والماكروز */}
                  <div className="p-5 sm:p-6 space-y-3.5">
                    <h3 className="text-base sm:text-lg font-black text-[#1F1713] dark:text-white leading-snug">
                      {title}
                    </h3>
                    <p className="text-xs text-[#26472A] dark:text-[#A3D4A8] font-bold">
                      {tagline}
                    </p>
                    <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed font-medium">
                      {desc}
                    </p>

                    {/* شريط توزيع الماكروز الغذائي */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#FAF5EE] dark:bg-[#261D17] border border-[#D2C4B7]/60 dark:border-[#382A20] text-center">
                      <div>
                        <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD] block font-bold">{isEn ? 'Protein' : 'بروتين'}</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{dish.protein} {isEn ? 'g' : 'جم'}</span>
                      </div>
                      <div className="border-r border-l border-[#D2C4B7]/60 dark:border-[#382A20]">
                        <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD] block font-bold">{isEn ? 'Carbs' : 'كارب'}</span>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">{dish.carbs} {isEn ? 'g' : 'جم'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD] block font-bold">{isEn ? 'Healthy Fats' : 'دهون صحية'}</span>
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400">{dish.fats} {isEn ? 'g' : 'جم'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* السعر وزر الإضافة للسلة */}
                <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-[#D2C4B7]/40 dark:border-[#382A20]/40 mt-3">
                  <div>
                    <span className="text-xs text-[#55453B] dark:text-[#D6C9BD] block font-medium">{isEn ? 'Price' : 'السعر'}</span>
                    <span className="text-lg font-black text-[#1F1713] dark:text-white font-serif">
                      {dish.price} {t('egp')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(dish)}
                    className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                      justAdded[dish.id]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1F1713] dark:bg-amber-600 hover:bg-[#2B221D] text-white border border-[#8A9684]/40'
                    }`}
                  >
                    {justAdded[dish.id] ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{t('bestSellersAddedSuccess')}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>{t('bestSellersAddQuick')}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
