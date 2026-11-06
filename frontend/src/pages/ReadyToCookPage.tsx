import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Plus, 
  Check, 
  Clock, 
  ChefHat, 
  Snowflake,
  PackageCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import type { MenuItem } from '../data/menuData';

interface ReadyToCookDish {
  id: number;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  instructions: string;
  instructionsEn: string;
  price: number;
  weight: string;
  weightEn: string;
  image: string;
  servings: string;
  servingsEn: string;
  cookingTime: string;
  cookingTimeEn: string;
  badge: string;
  badgeEn: string;
  category: 'meat' | 'chicken' | 'baking' | 'mahshi';
}

const READY_DISHES: ReadyToCookDish[] = [
  {
    id: 9501,
    name: 'صينية طاجن ورق عنب بالموزة البلدي (جاهزة للفرن)',
    nameEn: 'Oven-Ready Baladi Shank & Grape Leaves Tray',
    tagline: 'ورق عنب بناتي طازج ملفوف يدوياً مرصوص فوق شرائح موزة بلدي متبلة',
    taglineEn: 'Tender hand-rolled grape leaves layered over spiced baladi veal shank steaks',
    description: 'تصلك في صينية فرن محكمة الغلق مع برطمان مرقة البط المركزة الدسمة، فقط صبي المرقة وأدخليها الفرن 45 دقيقة.',
    descriptionEn: 'Arrives sealed tight in a bake tray with a jar of aged duck broth. Just pour and bake for 45 minutes.',
    instructions: 'صبي المرقة المرفقة وغطيها بفويل، ضعيها في فرن ساخن 190° لمدة 45 دقيقة ثم انزعي الفويل 5 دقائق لتتشمع.',
    instructionsEn: 'Pour included broth, seal with foil, bake at 190°C for 45 mins, uncover 5 mins to caramelize.',
    price: 260,
    weight: '1.2 كجم تقريباً',
    weightEn: 'Approx. 1.2 kg',
    image: '/images/dishes/ready_mahshi_tray.jpg',
    servings: '3 - 4 أفراد',
    servingsEn: '3 - 4 Servings',
    cookingTime: '45 دقيقة فرن',
    cookingTimeEn: '45 mins Oven',
    badge: 'الأكثر طلباً للعزومات 🔥',
    badgeEn: 'Best Seller for Feasts 🔥',
    category: 'mahshi'
  },
  {
    id: 9502,
    name: 'كفتة حاتي بلدي متبلة على الشوي (1 كجم)',
    nameEn: 'Marinated Baladi Hati Kofta Skewers (1 kg)',
    tagline: 'لحم كندوز بلدي مفروم مع لية ضاني فريش وتتبيلة بصل وبهارات الحاتي السرية',
    taglineEn: 'Minced baladi beef blended with lamb fat and secret Hati grill seasonings',
    description: 'مصبعة ومجهزة على أسياخ خشبية، جاهزة للشوي على الفحم أو في صينية الفرن أو الجريل بدون أن تفك أو تكش.',
    descriptionEn: 'Pre-skewered on wooden skewers. Never shrinks or breaks on charcoal, grill pan, or oven.',
    instructions: 'اشويها على فحم هادئ أو في طاسة جريل ساخنة مدهونة بمسحة سمن بلدي لمدة 10 إلى 12 دقيقة مع التقليب.',
    instructionsEn: 'Grill over medium coals or hot skillet brushed with baladi ghee for 10-12 minutes, turning gently.',
    price: 340,
    weight: '1 كجم (14-16 سيخ)',
    weightEn: '1 kg (14-16 Skewers)',
    image: '/images/dishes/ready_kofta.jpg',
    servings: '4 - 5 أفراد',
    servingsEn: '4 - 5 Servings',
    cookingTime: '12 دقيقة شوي',
    cookingTimeEn: '12 mins Grill',
    badge: 'تتبيلة حاتي سرية 🥩',
    badgeEn: 'Secret Hati Recipe 🥩',
    category: 'meat'
  },
  {
    id: 9503,
    name: 'حواوشي بلدي إسكندراني ني بالخلطة (4 أرغفة)',
    nameEn: 'Raw Alexandrian Baladi Hawawshi Dough (4 Loaves)',
    tagline: 'لحمة مفرومة بلدي متبلة بالفلفل الحار والبارد داخل عجين بلدي طازج',
    taglineEn: 'Spiced minced baladi beef packed inside fresh artisan dough loaves',
    description: 'جاهز للتسوية الفورية على طاسة الجريل أو في الفرن، مقرمش من بره ودايب ومستوي من جوه.',
    descriptionEn: 'Ready for skillet or oven. Golden and crispy exterior with juicy melt-in-mouth filling.',
    instructions: 'سوي الرغيف في طاسة تيفال مدهونة سمنة بلدي على نار متوسطة 6 دقائق لكل وجه مع تغطية الطاسة.',
    instructionsEn: 'Cook on a covered non-stick pan brushed with ghee on medium heat for 6 mins per side.',
    price: 180,
    weight: '4 أرغفة جامبو',
    weightEn: '4 Jumbo Loaves',
    image: '/images/dishes/ready_hawawshi.jpg',
    servings: '2 - 4 أفراد',
    servingsEn: '2 - 4 Servings',
    cookingTime: '12 دقيقة طاسة/فرن',
    cookingTimeEn: '12 mins Pan/Oven',
    badge: 'عجين بلدي فريش 🤤',
    badgeEn: 'Fresh Baladi Dough 🤤',
    category: 'meat'
  },
  {
    id: 9504,
    name: 'دجاجة بلدي فلاحي متبلة للشوي بماء البصل والأعشاب',
    nameEn: 'Butterfly Marinated Baladi Chicken for Roasting',
    tagline: 'دجاجة بلدي فريش 1.3 كجم مفتوحة فراشة ومتبلة 12 ساعة في الثلاجة',
    taglineEn: '1.3 kg butterfly-cut countryside chicken marinated 12 hours in onion water and mountain herbs',
    description: 'تتبيلة ريفية عميقة بماء البصل، طماطم فريش، مستردة، وزعتر جبلي. جاهزة للفرن بكيس حراري مرفق مجاناً.',
    descriptionEn: 'Deep rustic marinade with fresh tomato, mustard, and wild thyme. Free thermal roasting bag included.',
    instructions: 'ضعيها داخل الكيس الحراري المرفق مع ثقب صغير بالسكين، وأدخليها فرناً 200° لمدة 50 دقيقة لتحمير كهرماني.',
    instructionsEn: 'Place inside provided oven bag, puncture top, bake at 200°C for 50 minutes until amber brown.',
    price: 195,
    weight: '1.3 كجم تقريباً',
    weightEn: 'Approx. 1.3 kg',
    image: '/images/dishes/ready_chicken.jpg',
    servings: '3 أفراد',
    servingsEn: '3 Servings',
    cookingTime: '50 دقيقة بالفرن',
    cookingTimeEn: '50 mins Oven',
    badge: 'متبلة 12 ساعة 🍗',
    badgeEn: '12-Hour Marinated 🍗',
    category: 'chicken'
  },
  {
    id: 9505,
    name: 'صينية رقاق بلدي بالسمن الفلاحي واللحمة المفرومة',
    nameEn: 'Layered Baladi Roqaq Tray with Minced Meat',
    tagline: 'طبقات رقاق ناشف بلدي مسقية شوربة ومحشوة بلحم مفروم معصج بالسمن',
    taglineEn: 'Flaky dry baladi roqaq soaked in rich bone broth with braised minced beef',
    description: 'مجهزة كاملة ومدهونة بالسمن البلدي الصافي على الوجه، فقط أشعلي الفرن وضعي الصينية مباشرة.',
    descriptionEn: 'Fully assembled with top brushed in pure cow ghee. Straight from your fridge to your hot oven.',
    instructions: 'توضع في الرف الأوسط على حرارة 180° لمدة 25 دقيقة حتى تصبح ذهبية مقرمشة وطرية من القلب.',
    instructionsEn: 'Bake on middle rack at 180°C for 25 minutes until golden crisp on top and soft inside.',
    price: 210,
    weight: 'صينية مدورة مقاس 30',
    weightEn: 'Round Tray Size 30',
    image: '/images/dishes/ready_roqaq.jpg',
    servings: '4 - 6 أفراد',
    servingsEn: '4 - 6 Servings',
    cookingTime: '25 دقيقة فرن',
    cookingTimeEn: '25 mins Oven',
    badge: 'مورقة سمن بلدي 🧈',
    badgeEn: 'Baladi Ghee Flaky 🧈',
    category: 'baking'
  },
  {
    id: 9506,
    name: 'ممبار بلدي مسلوق وجاهز للتحمير السريع (1 كجم)',
    nameEn: 'Boiled Baladi Mombar Ready for Sizzle Fry (1 kg)',
    tagline: 'ممبار بقري بلدي متنضف فلة ومسلوق في الشوربة العطرية ومتبل تماماً',
    taglineEn: 'Cleaned baladi beef mombar stuffed with seasoned herb rice, boiled in aromatics',
    description: 'مسلوق ومحشي رز بخلطة زمان، محفوظ في أكياس مفرغة من الهواء. يحتاج فقط 5 دقائق تحمير في طاسة السمن.',
    descriptionEn: 'Boiled and vacuum packed. Needs only 5 quick minutes of sizzling in hot ghee to turn crispy.',
    instructions: 'سخني طاسة السمن البلدي وانزلي بالممبار حتى يأخذ اللون الذهبي المحمر المقرمش ورشي كزبرة وملح وفلفل.',
    instructionsEn: 'Heat ghee in a deep skillet, fry till crispy reddish-gold, and sprinkle with coriander and pepper.',
    price: 280,
    weight: '1 كجم مسلوق جاهز',
    weightEn: '1 kg Pre-boiled',
    image: '/images/dishes/ready_mombar.jpg',
    servings: '4 أفراد',
    servingsEn: '4 Servings',
    cookingTime: '5 دقائق تحمير',
    cookingTimeEn: '5 mins Sizzle Fry',
    badge: 'مسلوق وجاهز ع القلي ♨️',
    badgeEn: 'Ready to Fry ♨️',
    category: 'mahshi'
  },
  {
    id: 9507,
    name: 'طاجن عكاوي بلدي متبل بالبصل القاورما المكرمل',
    nameEn: 'Baladi Oxtail Clay Tajine with Caramelized Baby Onions',
    tagline: 'قطع عكاوي بقري بلدي دسمة متبلة بجوزة الطيب مع بصل قاورما صغير',
    taglineEn: 'Rich baladi oxtail seasoned with nutmeg and baby pearl onions',
    description: 'داخل طاجن فخار مسلفن، متبلة بصوص بني دافئ جاهزة لدخول الفرن لتستوي وتذوب كالملبن.',
    descriptionEn: 'Sealed inside a genuine clay pot with brown jus. Ready to slow bake until gelatinously tender.',
    instructions: 'أدخلي الطاجن مسلفناً إلى الفرن على 180° لمدة ساعتين حتى تدوب اللحمة تماماً وتتكرمل.',
    instructionsEn: 'Bake foil-sealed at 180°C for 2 hours until the oxtail meat melts like butter.',
    price: 360,
    weight: '1 كجم بالعظم والصوص',
    weightEn: '1 kg with bone & sauce',
    image: '/images/dishes/ready_akkawi.jpg',
    servings: '2 - 3 أفراد',
    servingsEn: '2 - 3 Servings',
    cookingTime: 'تسوية بطيئة ساعتين',
    cookingTimeEn: '2 hrs Slow Bake',
    badge: 'عكاوي دايبة دوب 🍲',
    badgeEn: 'Melt-in-Mouth Oxtail 🍲',
    category: 'meat'
  },
  {
    id: 9508,
    name: 'سمبوسك مقرمشة مكس جبن بلدي ولحم مفروم (20 قطعة)',
    nameEn: 'Crispy Baladi Cheese & Minced Meat Sambousek (20 pcs)',
    tagline: '10 قطع جبنة براميلي وزعتر ونعناع + 10 قطع لحمة مفرومة معصجة بلدي',
    taglineEn: '10 pcs Baramili cheese with mint & thyme + 10 pcs baladi spiced ground beef',
    description: 'ملفوفة بعجينة خفيفة ومحكمة الغلق لا تفتح في الزيت، جاهزة للقلي السريع أو الإيرفراير.',
    descriptionEn: 'Rolled in pastry and sealed tight. Ready for air frying or golden deep fry.',
    instructions: 'تقلى في زيت متوسط الحرارة 3 دقائق أو في القلاية الهوائية (Air Fryer) مع رشة زيت خفيفة 7 دقائق.',
    instructionsEn: 'Fry 3 mins in medium oil or air fry at 180°C for 7 mins with a light oil spray.',
    price: 130,
    weight: 'طبق 20 قطعة',
    weightEn: 'Pack of 20 Pieces',
    image: '/images/dishes/ready_sambousak.jpg',
    servings: 'مقبلات عائلية',
    servingsEn: 'Family Appetizer',
    cookingTime: '3-5 دقائق قلي/إيرفراير',
    cookingTimeEn: '3-5 mins Fry/Airfry',
    badge: 'مقرمشة ولذيذة 🥟',
    badgeEn: 'Golden Crispy 🥟',
    category: 'baking'
  }
];

export default function ReadyToCookPage() {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'all' | 'meat' | 'chicken' | 'baking' | 'mahshi'>('all');
  const [justAdded, setJustAdded] = useState<{ [id: number]: boolean }>({});
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const BreadcrumbArrow = isEn ? ChevronRight : ChevronLeft;

  const handleAddToCart = (dish: ReadyToCookDish) => {
    const cartItem: MenuItem = {
      id: dish.id,
      name: isEn ? dish.nameEn : dish.name,
      description: isEn ? dish.descriptionEn : dish.description,
      price: dish.price,
      categoryId: 'ready-to-cook',
      image: dish.image,
      tag: isEn ? dish.badgeEn : dish.badge
    };

    addToCart(cartItem, 1);
    setJustAdded((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setJustAdded((prev) => ({ ...prev, [dish.id]: false }));
    }, 1500);
  };

  const filteredDishes = activeTab === 'all'
    ? READY_DISHES
    : READY_DISHES.filter((d) => d.category === activeTab);

  const tabs = [
    { id: 'all', label: isEn ? 'All Ready-to-Bake (8)' : 'كافة الأصناف الجاهزة (8)' },
    { id: 'meat', label: isEn ? 'Meats & Hawawshi' : 'لحوم وحواوشي (Meat)' },
    { id: 'chicken', label: isEn ? 'Poultry & Grills' : 'دواجن ومشويات (Chicken)' },
    { id: 'mahshi', label: isEn ? 'Mahshi & Mombar' : 'محاشي وممبار (Mahshi)' },
    { id: 'baking', label: isEn ? 'Roqaq & Pastries' : 'صواني ورقاق ومخبوزات (Baking)' }
  ];

  return (
    <div className="bg-[#F7F4EF] dark:bg-[#120E0C] text-[#1F1713] dark:text-[#F7F4EF] min-h-screen py-8 sm:py-14 transition-colors" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* شريط المسار (Breadcrumbs) */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#55453B] dark:text-[#D6C9BD] border-b border-[#D2C4B7]/60 dark:border-[#382A20] pb-3">
          <Link to="/" className="hover:text-amber-600 transition-colors">{t('navHome')}</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 text-[#8A9684]" />
          <span className="font-bold text-[#26472A] dark:text-[#A3D4A8]">{t('navReadyToCook')}</span>
        </nav>

        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-4 py-1.5 rounded-full text-xs font-black border border-[#8A9684]/30 shadow-xs">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>{isEn ? 'Loqma Ready-to-Bake • Fresh from Prep Kitchen' : 'لقمة جاهز ع التسوية • Ready to Cook & Bake'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1F1713] dark:text-white font-serif-title leading-tight">
            {isEn ? 'Prepped & Marinated for Direct Baking at Home' : 'متبل ومجهز لفرنك.. تسوية في بيتك وسخونة تفتح النفس'}
          </h1>

          <p className="text-xs sm:text-base text-[#55453B] dark:text-[#D6C9BD] leading-relaxed font-medium">
            {isEn
              ? 'Enjoy the mouthwatering aroma of baking at home without spending hours peeling and prepping. We clean, marinate with baladi cow ghee, and send it chilled in baking trays with chef instructions.'
              : 'عشان ريحة البيت اللي بتفتح النفس وقت العزومة من غير وقفة وتعب في المطبخ.. جهزنا لك صواني الفرن، الكفتة، والمحاشي متبلة ومغلفة بسمن بلدي ومكونات طازة، تطلعيها من الثلاجة على الفرن مباشرة.'
            }
          </p>
        </div>

        {/* مزايا الجاهز على التسوية */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="bg-white dark:bg-[#1E1713] p-4 rounded-2xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
            <span className="text-xs font-black text-[#1F1713] dark:text-white block">{isEn ? 'Saves 3 Hours' : 'توفير 3 ساعات مطبخ'}</span>
            <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD]">{isEn ? 'Straight to oven or grill' : 'على الفرن أو الشواية فوراً'}</span>
          </div>
          <div className="bg-white dark:bg-[#1E1713] p-4 rounded-2xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <ChefHat className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <span className="text-xs font-black text-[#1F1713] dark:text-white block">{isEn ? 'Secret Chef Marinades' : 'تتبيلات الشيف السرية'}</span>
            <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD]">{isEn ? 'Baladi cow ghee & fresh herbs' : 'سمن بلدي وبهارات ريفية'}</span>
          </div>
          <div className="bg-white dark:bg-[#1E1713] p-4 rounded-2xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <PackageCheck className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
            <span className="text-xs font-black text-[#1F1713] dark:text-white block">{isEn ? 'Airtight Vacuum Trays' : 'تغليف هوائي معقم'}</span>
            <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD]">{isEn ? 'Sealed for freshness' : 'صواني محكمة لحفظ الطزاجة'}</span>
          </div>
          <div className="bg-white dark:bg-[#1E1713] p-4 rounded-2xl border-2 border-[#D2C4B7] dark:border-[#382A20]">
            <Snowflake className="w-5 h-5 text-cyan-600 mx-auto mb-1.5" />
            <span className="text-xs font-black text-[#1F1713] dark:text-white block">{isEn ? 'Never Frozen' : 'طازة وغير مجمد'}</span>
            <span className="text-[10px] text-[#55453B] dark:text-[#D6C9BD]">{isEn ? 'Keeps 48 hrs refrigerated' : 'صالح 48 ساعة بالتبريد'}</span>
          </div>
        </div>

        {/* أزرار التصفية والتبويب */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-[#1E1713] text-[#1F1713] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20] hover:border-amber-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* شبكة الأطباق الجاهزة على التسوية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => {
            const title = isEn ? dish.nameEn : dish.name;
            const tagline = isEn ? dish.taglineEn : dish.tagline;
            const desc = isEn ? dish.descriptionEn : dish.description;
            const instructions = isEn ? dish.instructionsEn : dish.instructions;
            const badge = isEn ? dish.badgeEn : dish.badge;
            const weight = isEn ? dish.weightEn : dish.weight;
            const servings = isEn ? dish.servingsEn : dish.servings;
            const cookingTime = isEn ? dish.cookingTimeEn : dish.cookingTime;

            return (
              <div
                key={dish.id}
                className="bg-white dark:bg-[#1E1713] rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* صورة الصنف */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/10">
                    <img
                      src={dish.image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/categories/grills.jpg';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-amber-700/90 text-white text-[11px] font-black px-3 py-1 rounded-full backdrop-blur-md shadow-xs">
                      {badge}
                    </div>
                    <div className="absolute bottom-3 right-3 left-3 bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{cookingTime}</span>
                      </span>
                      <span className="text-[11px] text-amber-300 font-semibold">
                        {weight} • {servings}
                      </span>
                    </div>
                  </div>

                  {/* تفاصيل وتتبيلة الصنف */}
                  <div className="p-5 sm:p-6 space-y-3.5">
                    <h3 className="text-base sm:text-lg font-black text-[#1F1713] dark:text-white leading-snug">
                      {title}
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-400 font-bold">
                      {tagline}
                    </p>
                    <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed font-medium">
                      {desc}
                    </p>

                    {/* طريقة التسوية المقترحة من الشيف */}
                    <div className="p-3 rounded-xl bg-[#FAF5EE] dark:bg-[#261D17] border border-[#D2C4B7]/60 dark:border-[#382A20] space-y-1">
                      <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Chef Cooking Instructions:' : 'طريقة التسوية من الشيف:'}</span>
                      </span>
                      <p className="text-[11px] text-[#55453B] dark:text-[#D6C9BD] leading-relaxed font-medium">
                        {instructions}
                      </p>
                    </div>
                  </div>
                </div>

                {/* السعر وزر الإضافة للسلة */}
                <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-[#D2C4B7]/40 dark:border-[#382A20]/40 mt-3">
                  <div>
                    <span className="text-xs text-[#55453B] dark:text-[#D6C9BD] block font-medium">{isEn ? 'Price' : 'السعر'}</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-serif">
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
