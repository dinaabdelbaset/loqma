import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Star, 
  ShoppingBag, 
  MessageCircle,
  Truck,
  Heart
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export interface WeeklyMeal {
  id: number;
  day: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
  dayIndex: number;
  dayName: string;
  dayNameEn: string;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  chefSecret: string;
  chefSecretEn: string;
  sides: string[];
  sidesEn: string[];
  calories: number;
  servings: string;
  servingsEn: string;
  prepTime: string;
  prepTimeEn: string;
  price: number;
  originalPrice: number;
  tag: string;
  tagEn: string;
  image: string;
  rating: number;
  ordersCount: number;
}

interface WeeklyScheduleProps {
  onAddMealToCart?: (meal: { id: number; name: string; price: number }) => void;
}

const getTodayDayKey = (): 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' => {
  if (typeof window === 'undefined') return 'sun';
  const currentDay = new Date().getDay();
  switch (currentDay) {
    case 0: return 'sun';
    case 1: return 'mon';
    case 2: return 'tue';
    case 3: return 'wed';
    case 4: return 'thu';
    case 5: return 'fri';
    default: return 'sun';
  }
};

const WEEK_MEALS: WeeklyMeal[] = [
  {
    id: 501,
    day: 'sun',
    dayIndex: 0,
    dayName: 'الأحد',
    dayNameEn: 'Sunday',
    name: 'صينية بطاطس بالفراخ البلدي في الفرن',
    nameEn: 'Rustic Clay-Oven Chicken & Potatoes',
    tagline: 'بداية الأسبوع بريحة زمان وطعم الفلاحي الأصيل',
    taglineEn: 'Starting the week with nostalgic aromas and countryside flavor',
    description: 'حلقات بطاطس بلدي دايبة كالمربى في عصير طماطم مسبك بالبصل والبهارات الريفية، مع قطع دجاج بلدي محمر بالسمن الفلاحي ومقرمش من الوجه.',
    descriptionEn: 'Tender country potatoes braised in slow-cooked tomato onion reduction with half a baladi chicken crisped with golden butter.',
    chefSecret: 'سر الصنعة: دجاج بلدي متبل بماء البصل والفلفل الأسود مع مرقة غنية ومستكة يونانية.',
    chefSecretEn: 'Chef Secret: Baladi chicken marinated with onion water and cracked black pepper in rich cardamom broth.',
    sides: ['أرز مصري مفلفل بالشعرية والسمن البلدي', 'شوربة لسان عصفور بلدي بالليمون', 'مخلل مشكل بيتي مقرمش', 'عيش بلدي طازج سخن'],
    sidesEn: ['Egyptian vermicelli rice in baladi ghee', 'Lemon orzo soup', 'Homemade crispy pickles', 'Hot baladi bread'],
    calories: 680,
    servings: 'فرد واحد مشبع جداً',
    servingsEn: '1 Generous Person',
    prepTime: 'يجهز طازجاً: 1:30 ظهراً',
    prepTimeEn: 'Freshly Ready: 1:30 PM',
    price: 120,
    originalPrice: 145,
    tag: 'غداء الأحد الأيقوني 🍗',
    tagEn: 'Iconic Sunday Roast 🍗',
    image: '/images/schedule/sunday_potato_chicken.jpg',
    rating: 4.9,
    ordersCount: 215,
  },
  {
    id: 502,
    day: 'mon',
    dayIndex: 1,
    dayName: 'الإثنين',
    dayNameEn: 'Monday',
    name: 'طاجن بامية باللحمة الضاني البلدي في الفخار',
    nameEn: 'Claypot Lamb Okra Tajine',
    tagline: 'تسبيكة فخار ريفية على نار هادية بالسمنة',
    taglineEn: 'Slow 3-hour claypot simmer with pure baladi ghee',
    description: 'بامية بلدي ناعمة صغيرة مقمعة يدوياً حبة حبة، مطهوة بصلصة طماطم بلدي وثوم صعيدي مدقوق مع قطع لحم ضاني بلدي طرية دايبة وفلفل أخضر مشوي.',
    descriptionEn: 'Baby country okra simmered for 3 hours in Qenawi clay with garlic, tomato reduction, and succulent lamb chunks.',
    chefSecret: 'سر الصنعة: تسوية بطيئة 3 ساعات داخل فخار قناوي مع رشة كزبرة يابسة خشنة.',
    chefSecretEn: 'Chef Secret: Slow 3-hour bake inside Qenawi clay with coarse coriander seeds.',
    sides: ['أرز أبيض بلدي بالمستكة والسمن الفلاحي', 'سلطة خضراء بلدي بدقة الثوم والخل', 'ليمون مخلل بالعصفر وحبة البركة', 'عيش بلدي مفقع'],
    sidesEn: ['White rice with mastic & ghee', 'Baladi green salad with daqqa', 'Pickled lemon with safflower', 'Puffed baladi bread'],
    calories: 740,
    servings: 'فرد واحد مشبع جداً',
    servingsEn: '1 Generous Person',
    prepTime: 'يجهز طازجاً: 1:45 ظهراً',
    prepTimeEn: 'Freshly Ready: 1:45 PM',
    price: 145,
    originalPrice: 175,
    tag: 'فخار الفرن الحامي 🏺',
    tagEn: 'Sizzling Claypot 🏺',
    image: '/images/schedule/monday_bamia_lamb.jpg',
    rating: 5.0,
    ordersCount: 289,
  },
  {
    id: 503,
    day: 'tue',
    dayIndex: 2,
    dayName: 'الثلاثاء',
    dayNameEn: 'Tuesday',
    name: 'محشي مشكل فلاحي مع بط بلدي محمر',
    nameEn: 'Stuffed Mahshi with Roasted Duck',
    tagline: 'عزومة منتصف الأسبوع ببركة ونَفَس زمان',
    taglineEn: 'Mid-week grand gathering with authentic heritage',
    description: 'تشكيلة أصابع محشي ورق عنب، كرنب فلاحي، وكوسة بتتبيلة الأرز المصرية والخضرة الطازجة بالسمن البلدي، مع قطعة بط بلدي محمرة بالزبدة.',
    descriptionEn: 'Hand-rolled vine leaves, cabbage, and zucchini stuffed with Egyptian spiced rice and herbs, with golden pan-roasted baladi duck.',
    chefSecret: 'سر الصنعة: سقية المحشي بمرقة البط المعتقة بالحبهان وورق اللورا ورشة دبس رمان.',
    chefSecretEn: 'Chef Secret: Soaking the rolls in aged duck broth with cardamom, bay leaves, and pomegranate molasses.',
    sides: ['شوربة بط بلدي دسمة بالليمون', 'ملوخية خضراء كبسولة طازجة', 'باذنجان مخلل بالدقة والتوم', 'عيش بلدي ساخن'],
    sidesEn: ['Rich duck soup with lemon', 'Fresh green molokhia', 'Pickled garlic eggplant', 'Hot baladi bread'],
    calories: 820,
    servings: 'فرد واحد مشبع جداً',
    servingsEn: '1 Generous Person',
    prepTime: 'يجهز طازجاً: 2:00 ظهراً',
    prepTimeEn: 'Freshly Ready: 2:00 PM',
    price: 155,
    originalPrice: 190,
    tag: 'سفرة زمان والبركة 🦆',
    tagEn: 'Royal Duck Feast 🦆',
    image: '/images/schedule/tuesday_mahshi_duck.jpg',
    rating: 4.9,
    ordersCount: 340,
  },
  {
    id: 504,
    day: 'wed',
    dayIndex: 3,
    dayName: 'الأربعاء',
    dayNameEn: 'Wednesday',
    name: 'طاجن ملوخية خضراء بالطشة مع فراخ محمرة',
    nameEn: 'Green Molokhia Tajine with Baladi Chicken',
    tagline: 'سر الطشة والشهقة وسكون اللقمة الفلاحي',
    taglineEn: 'The legendary Egyptian garlic tasha and baladi chicken',
    description: 'أوراق ملوخية طازجة مخروطة يومياً على أصولها، مطبوخة بمرقة دسمة مع طشة الثوم البلدي والكزبرة الجافة بالسمنة، مع نصف دجاجة بلدي محمرة ذهبية.',
    descriptionEn: 'Freshly minced jute mallow leaves simmered in rich chicken broth with sizzling crushed garlic and coriander, served with half roasted chicken.',
    chefSecret: 'سر الصنعة: طشة بالسمن البلدي البقري الفلاحي وثوم مهروس طازة مع شهقة الطباخ.',
    chefSecretEn: 'Chef Secret: Sizzling tasha in pure cow ghee and fresh crushed garlic with the chef’s shah\'a.',
    sides: ['أرز حبة وحبة مصري مفلفل', 'باذنجان مخلل بالفلفل الحار والكمون', 'طماطم متبلة بالخل والليمون', 'عيش بلدي سخن مقمر'],
    sidesEn: ['Two-tone Egyptian rice', 'Spicy pickled eggplant', 'Marinated tomato slices', 'Toasted baladi bread'],
    calories: 640,
    servings: 'فرد واحد مشبع جداً',
    servingsEn: '1 Generous Person',
    prepTime: 'يجهز طازجاً: 1:30 ظهراً',
    prepTimeEn: 'Freshly Ready: 1:30 PM',
    price: 115,
    originalPrice: 140,
    tag: 'الأكثر طلباً أسبوعياً 🍲',
    tagEn: 'Weekly Best Seller 🍲',
    image: '/images/schedule/wednesday_molokhia_chicken.jpg',
    rating: 4.9,
    ordersCount: 420,
  },
  {
    id: 505,
    day: 'thu',
    dayIndex: 4,
    dayName: 'الخميس',
    dayNameEn: 'Thursday',
    name: 'صينية سمك قاروص سنجاري إسكندراني',
    nameEn: 'Alexandrian Sayadiyah Seabass Fish Feast',
    tagline: 'ختام الأسبوع ببحريات فريش وتتبيلة كمونية ساحرة',
    taglineEn: 'Ending the week with fresh Mediterranean seafood & cumin daqqa',
    description: 'سمكة قاروص بحر طازجة مفتوحة سنجاري بخلطة الخضار والأعشاب، زيت زيتون بكر وليمون وثوم كموني في الفرن البلدي، مع أرز صيادية بصل مكرمل.',
    descriptionEn: 'Fresh whole seabass split Singari style with herbs, extra virgin olive oil, and cumin, served with caramelized onion Sayadiyah rice.',
    chefSecret: 'سر الصنعة: تتبيلة كمونية إسكندرانية قديمة مع كرفس بلدي وشبت وشرائح ليمون أضاليا.',
    chefSecretEn: 'Chef Secret: Old Alexandrian cumin marinade with fresh Egyptian celery, dill, and Adalia lemons.',
    sides: ['أرز صيادية بني بالبصل المكرمل', 'سلطة طحينة سمسم صافي بالكمون', 'سلطة بابا غنوج مشوي على الفحم', 'عيش بلدي طازة'],
    sidesEn: ['Caramelized onion Sayadiyah rice', 'Pure sesame tahini dip', 'Charcoal-smoked Baba Ghanoush', 'Fresh baladi bread'],
    calories: 590,
    servings: 'فرد واحد مشبع جداً',
    servingsEn: '1 Generous Person',
    prepTime: 'يجهز طازجاً: 2:15 ظهراً',
    prepTimeEn: 'Freshly Ready: 2:15 PM',
    price: 160,
    originalPrice: 195,
    tag: 'خميس البحريات الطازة 🐟',
    tagEn: 'Thursday Seafood Catch 🐟',
    image: '/images/schedule/thursday_sayadiyah_fish.jpg',
    rating: 4.8,
    ordersCount: 260,
  },
  {
    id: 506,
    day: 'fri',
    dayIndex: 5,
    dayName: 'الجمعة',
    dayNameEn: 'Friday',
    name: 'طاجن فتة مصرية بالخل والثوم مع موزة بلدي',
    nameEn: 'Egyptian Garlic Vinegar Fattah with Lamb Shank',
    tagline: 'غداء الجمعة بريحة الخل والتوم والسمن الفلاحي الأصيل',
    taglineEn: 'Friday festive lunch with garlic-vinegar daqqa & pure ghee',
    description: 'أرز أبيض بلدي مفلفل مع عيش بلدي مقرمش محمر بالسمنة، مسقي بصلصة الطماطم المسبكة ودقة الخل والثوم، مع قطعة موزة ضاني أو كندوز بلدي محمرة دايبة.',
    descriptionEn: 'Fluffy Egyptian white rice with ghee-toasted flatbread, rich tomato sauce, garlic-vinegar daqqa, and a melt-in-the-mouth lamb shank.',
    chefSecret: 'سر الصنعة: دقة ثوم بلدي محمر بالكزبرة ورشة خل أبيض مع شوربة دسمة تسقي العيش بالسمن البلدي.',
    chefSecretEn: 'Chef Secret: Golden garlic daqqa with coriander, white vinegar, and rich marrow broth.',
    sides: ['شوربة لسان عصفور بلدي ليمونية', 'صلصة طماطم مسبكة إضافية', 'سلطة خضراء بلدي بالبصل الأخضر', 'عيش بلدي سخن'],
    sidesEn: ['Lemon orzo soup', 'Extra spiced tomato sauce', 'Green salad with scallions', 'Warm baladi bread'],
    calories: 780,
    servings: 'فرد واحد مشبع جداً',
    servingsEn: '1 Generous Person',
    prepTime: 'يجهز طازجاً بعد صلاة الجمعة: 1:30 ظهراً',
    prepTimeEn: 'Freshly Ready after Friday Prayer: 1:30 PM',
    price: 150,
    originalPrice: 180,
    tag: 'فتة الجمعة وبركتها 🧄🥩',
    tagEn: 'Blessed Friday Fattah 🧄🥩',
    image: '/images/schedule/friday_fatta_moza.jpg',
    rating: 5.0,
    ordersCount: 395,
  },
];

export default function WeeklySchedule({ onAddMealToCart }: WeeklyScheduleProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const todayDayKey = getTodayDayKey();
  const [selectedDay, setSelectedDay] = useState<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri'>(todayDayKey);
  const [justAddedMealId, setJustAddedMealId] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>('weekly');
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  const currentMeal = WEEK_MEALS.find((m) => m.day === selectedDay) || WEEK_MEALS[0];

  const handleOrderMeal = () => {
    if (onAddMealToCart) {
      onAddMealToCart({
        id: currentMeal.id,
        name: isEn ? currentMeal.nameEn : currentMeal.name,
        price: currentMeal.price,
      });
    } else {
      addToCart({
        id: currentMeal.id,
        name: isEn ? currentMeal.nameEn : currentMeal.name,
        categoryId: 'weekly-meals',
        price: currentMeal.price,
        description: isEn ? currentMeal.descriptionEn : currentMeal.description,
        calories: currentMeal.calories,
        tag: isEn ? currentMeal.tagEn : currentMeal.tag,
        image: currentMeal.image,
      });
    }

    setJustAddedMealId(currentMeal.id);
    setTimeout(() => {
      setJustAddedMealId(null);
    }, 2000);
    setIsCartOpen(true);
  };

  const handleSubscribePlan = () => {
    const isWeekly = selectedPlan === 'weekly';
    const planPrice = isWeekly ? 490 : 1850;
    const planName = isWeekly
      ? (isEn ? 'Weekly Lunch Pass (5 Days)' : 'باقة الغداء الأسبوعية (5 وجبات متكاملة)')
      : (isEn ? 'Monthly Lunch Pass (22 Days)' : 'باقة الغداء الشهرية (22 وجبة متكاملة)');

    addToCart({
      id: isWeekly ? 9001 : 9002,
      name: planName,
      categoryId: 'weekly-meals',
      price: planPrice,
      description: isWeekly
        ? (isEn ? '5 hot daily lunch meals delivered Sunday to Thursday with complete sides and drinks' : '5 وجبات غداء ساخنة يومياً من الأحد للخميس مع كامل الأطباق الجانبية')
        : (isEn ? '22 hot daily lunch meals with free delivery and priority chef preparation' : '22 وجبة غداء ساخنة يومياً طوال الشهر مع توصيل مجاني يومياً'),
      calories: 700,
      tag: isWeekly ? (isEn ? 'Save 20% 🔥' : 'توفير 20% 🔥') : (isEn ? 'Save 26% 👑' : 'توفير 26% 👑'),
      image: currentMeal.image,
    });

    setSubscribedSuccess(true);
    setTimeout(() => setSubscribedSuccess(false), 3000);
    setIsCartOpen(true);
  };

  return (
    <section id="schedule" className="px-4 sm:px-8 lg:px-12 py-16 sm:py-20 bg-[#FAF7F2] dark:bg-[#120E0C] border-t border-[#E8DEC8]/80 dark:border-[#382A20] text-[#3D312A] dark:text-[#F7F4EF] relative overflow-hidden">
      
      {/* لمسات خلفية بوهيمية */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8A9684]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3D312A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* عنوان القسم ومقدمته */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-[#EFE8DD] dark:bg-[#1E1713] text-[#3D312A] dark:text-[#A3D4A8] px-4 py-1.5 rounded-full text-xs font-bold border border-[#D2C4B7]/70 dark:border-[#382A20] mb-3.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#8A9684]" />
            <span className="font-serif">{isEn ? 'Weekly Lunch Schedule • Fresh Daily Cooking' : 'جدول غداء الأسبوع • طهي بيتي طازة يومياً'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1F1713] dark:text-white tracking-tight font-serif mb-4 leading-tight">
            {isEn ? "No More Guessing 'What’s for Lunch Tomorrow?'" : 'ارتاح من حيرة "هنتغدى إيه بكره؟"'}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-[#55453B] dark:text-[#D6C9BD] leading-relaxed max-w-2xl mx-auto">
            {isEn 
              ? 'We cook one signature homemade lunch feast each morning in limited batches with 100% pure ghee and fresh local market ingredients. Order today\'s lunch or subscribe to our weekly lunch pass for automatic hot delivery and 20% off.' 
              : 'بنطبخ كل يوم وجبة غداء رئيسية واحدة بكميات محدودة لضمان أقصى درجات الطزاجة والنفس البلدي بالسمن الفلاحي.. اطلب وجبة اليوم فوراً أو اشترك في الباقة الأسبوعية لراحة بالك وخصم خاص.'
            }
          </p>

          {/* شريط الضمانات والتوصيل */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs font-bold text-[#55453B] dark:text-[#D6C9BD]">
            <span className="flex items-center gap-1.5 bg-white/70 dark:bg-[#1E1713] px-3 py-1 rounded-full border border-[#D2C4B7]/60 dark:border-[#382A20] shadow-xs">
              <Truck className="w-3.5 h-3.5 text-[#8A9684]" />
              <span>{isEn ? 'Hot Delivery 1:00 - 3:30 PM' : 'توصيل ساخن بين 1:00 و 3:30 ظهراً'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/70 dark:bg-[#1E1713] px-3 py-1 rounded-full border border-[#D2C4B7]/60 dark:border-[#382A20] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isEn ? '100% Heat Lock in Insulated Bags' : 'ضمان السخونة 100% بحقائب معزولة'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/70 dark:bg-[#1E1713] px-3 py-1 rounded-full border border-[#D2C4B7]/60 dark:border-[#382A20] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isEn ? '100% Pure Baladi Ghee' : 'سمن بلدي بقري فلاحي 100%'}</span>
            </span>
          </div>
        </div>

        {/* شريط الأيام التفاعلي */}
        <div className="mb-8 sm:mb-12">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 p-1.5 sm:p-2 bg-[#EFE9DF] dark:bg-[#1E1713] rounded-2xl sm:rounded-3xl border border-[#DFD5C5] dark:border-[#382A20] shadow-inner">
            {WEEK_MEALS.map((meal) => {
              const isSelected = meal.day === selectedDay;
              const isToday = meal.day === todayDayKey;
              return (
                <button
                  key={meal.day}
                  type="button"
                  onClick={() => setSelectedDay(meal.day)}
                  className={`relative py-3 sm:py-4 px-1.5 sm:px-3 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center gap-1 sm:gap-1.5 ${
                    isSelected
                      ? 'bg-[#3D312A] dark:bg-amber-600 text-[#F7F4EF] shadow-lg shadow-[#3D312A]/25 scale-[1.02] border border-[#3D312A]'
                      : 'bg-white/60 dark:bg-[#241A14] text-[#1F1713] dark:text-[#D6C9BD] hover:bg-white hover:shadow-xs border border-transparent'
                  }`}
                >
                  {isToday && (
                    <span className={`absolute -top-2.5 right-1/2 transform translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs ${
                      isSelected ? 'bg-[#8A9684] text-white' : 'bg-[#3D312A] text-white'
                    }`}>
                      {isEn ? 'Today' : 'اليوم'}
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <span className={`text-xs sm:text-base font-black ${isSelected ? 'text-[#F7F4EF]' : 'text-[#1F1713] dark:text-white'}`}>
                      {isEn ? meal.dayNameEn : meal.dayName}
                    </span>
                  </div>

                  <span className={`text-[10px] sm:text-xs font-medium truncate max-w-full ${
                    isSelected ? 'text-[#D2C4B7]' : 'text-[#55453B] dark:text-[#A09383]'
                  }`}>
                    {isEn ? meal.nameEn.split(' ')[0] : meal.name.split(' ')[0]} {isEn ? meal.nameEn.split(' ')[1] : meal.name.split(' ')[1]}
                  </span>

                  <span className={`text-[10px] sm:text-xs font-black ${
                    isSelected ? 'text-amber-300' : 'text-[#8A9684]'
                  }`}>
                    {meal.price} {t('currency')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* كارت عرض وجبة اليوم المفصلة */}
        <div className="bg-white dark:bg-[#1E1713] rounded-3xl sm:rounded-[36px] border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-xl overflow-hidden mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* صورة الوجبة والشارات */}
            <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[420px] bg-stone-100 overflow-hidden">
              <img
                src={currentMeal.image}
                alt={isEn ? currentMeal.nameEn : currentMeal.name}
                className="w-full h-full object-cover filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                <span className="bg-[#3D312A]/90 dark:bg-black/90 backdrop-blur-xs text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full border border-amber-400/30 shadow-md">
                  {isEn ? currentMeal.tagEn : currentMeal.tag}
                </span>
                <span className="bg-white/95 text-[#26472A] text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-[#8A9684]/30">
                  <Star className="w-3.5 h-3.5 fill-current text-[#8A9684]" />
                  <span>{currentMeal.rating} ({currentMeal.ordersCount} {isEn ? 'orders' : 'أوردر'})</span>
                </span>
              </div>
            </div>

            {/* تفاصيل الطبق وسر الصنعة والأطباق الجانبية */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-[#26472A] dark:text-[#A3D4A8] bg-[#8A9684]/15 px-3 py-1 rounded-full border border-[#8A9684]/30">
                    {currentMeal.calories} {t('scheduleCalories')}
                  </span>
                  <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] bg-[#EFE9DF] dark:bg-[#261D17] px-3 py-1 rounded-full border border-[#D2C4B7]/70 dark:border-[#382A20]">
                    {isEn ? currentMeal.servingsEn : currentMeal.servings}
                  </span>
                  <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] bg-[#EFE9DF] dark:bg-[#261D17] px-3 py-1 rounded-full border border-[#D2C4B7]/70 dark:border-[#382A20] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#8A9684]" />
                    <span>{isEn ? currentMeal.prepTimeEn : currentMeal.prepTime}</span>
                  </span>
                </div>

                <h3 className="text-xl sm:text-3xl font-black text-[#1F1713] dark:text-white font-serif mb-2 leading-snug">
                  {isEn ? currentMeal.nameEn : currentMeal.name}
                </h3>

                <p className="text-xs sm:text-sm font-bold text-[#8A9684] mb-3">
                  {isEn ? currentMeal.taglineEn : currentMeal.tagline}
                </p>

                <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] leading-relaxed mb-4">
                  {isEn ? currentMeal.descriptionEn : currentMeal.description}
                </p>

                {/* سر الصنعة للشيف */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#261D17] border-2 border-[#D2C4B7] dark:border-[#382A20] text-xs sm:text-sm mb-5 flex items-start gap-2.5 shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#26472A] dark:text-[#A3D4A8] shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-semibold text-[#1F1713] dark:text-[#F7F4EF]">
                    <strong className="text-[#26472A] dark:text-[#A3D4A8] font-black">{t('scheduleChefSecret')} </strong>
                    <span>{isEn ? currentMeal.chefSecretEn : currentMeal.chefSecret.replace(/^سر الصنعة:\s*/, '')}</span>
                  </p>
                </div>

                {/* الأطباق الجانبية المشملة مجاناً مع الوجبة */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#241A14] border border-[#EDE2D4] dark:border-[#382A20] mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-[#1F1713] dark:text-white flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-[#8A9684]" />
                      <span>{t('scheduleIncludesFree')}</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#8A9684] bg-white dark:bg-[#1E1713] px-2 py-0.5 rounded-full border border-[#D2C4B7] dark:border-[#382A20]">
                      {isEn ? '4 Free Sides' : '4 أصناف جانبية'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#55453B] dark:text-[#D6C9BD]">
                    {(isEn ? currentMeal.sidesEn : currentMeal.sides).map((side, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/80 dark:bg-[#1E1713] px-2.5 py-1.5 rounded-xl border border-[#EDE2D4]/70 dark:border-[#382A20]">
                        <span className="w-4 h-4 rounded-full bg-[#8A9684]/15 text-[#8A9684] flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                        <span className="font-medium text-[11px] sm:text-xs truncate">{side}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* السعر وأزرار الطلب المباشر */}
              <div className="pt-4 border-t border-[#EDE2D4] dark:border-[#382A20] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#1F1713] dark:text-white font-serif">{currentMeal.price}</span>
                    <span className="text-xs text-[#55453B] dark:text-[#A09383] font-bold">{t('currency')}</span>
                    <span className="text-xs text-[#A8988C] line-through mx-1 font-bold">{currentMeal.originalPrice} {t('currency')}</span>
                  </div>
                  <span className="block text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                    {isEn ? `Save ${currentMeal.originalPrice - currentMeal.price} EGP on early order` : `توفير ${currentMeal.originalPrice - currentMeal.price} ج.م عند الطلب المبكر`}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleOrderMeal}
                    className="flex-1 sm:flex-initial bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] px-6 sm:px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-lg shadow-[#3D312A]/20 transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {justAddedMealId === currentMeal.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{t('bestSellersAddedSuccess')}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#8A9684] dark:text-white" />
                        <span>{isEn ? `Order ${currentMeal.dayNameEn} Lunch` : `اطلب غداء ${currentMeal.dayName}`}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/201065272373?text=${encodeURIComponent(isEn ? `Hello Loqma! I would like to order ${currentMeal.dayNameEn} lunch: ${currentMeal.nameEn} for ${currentMeal.price} EGP.` : `مرحباً لقمة! أريد طلب غداء يوم ${currentMeal.dayName}: ${currentMeal.name} بسعر ${currentMeal.price} جنيه.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[#EFE8DD] dark:bg-[#241A14] hover:bg-[#E5DCCF] text-[#3D312A] dark:text-white border border-[#D2C4B7] dark:border-[#382A20] shadow-xs transition-colors flex items-center justify-center"
                    title={isEn ? "WhatsApp Direct Order" : "طلب فوري عبر واتساب"}
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* باقات الاشتراك الموفرة */}
        <div className="bg-gradient-to-br from-[#3D312A] to-[#241C17] text-[#F7F4EF] rounded-3xl sm:rounded-[36px] p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-[#D2C4B7]/20">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 bg-[#8A9684] text-[#F7F4EF] px-3.5 py-1 rounded-full text-[11px] font-bold mb-3 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{isEn ? "Weekly & Monthly Savings Passes for Families & Offices" : "عرض التوفير الأسبوعي والشهري للموظفين والعائلات"}</span>
              </div>

              <h4 className="text-xl sm:text-3xl font-black font-serif mb-2 leading-snug">
                {isEn ? "Save your mind from daily cooking.. Subscribe to Loqma Passes" : "ريح بالك من تفكير الغداء.. واشترك في باقات لقمة الموفرة"}
              </h4>

              <p className="text-xs sm:text-sm text-[#D2C4B7] leading-relaxed mb-6">
                {isEn 
                  ? "Choose your preferred lunch hour, and receive a different sizzling homemade meal on time every day with special discounts and free delivery." 
                  : "حدد موعد استراحة غدائك أو غداء بيتك، واستلم يومياً وجبة مختلفة ساخنة في موعدك بالدقيقة بدون أي مجهود، مع خصم خاص وتوصيل مجاني يومياً."
                }
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div
                  onClick={() => setSelectedPlan('weekly')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlan === 'weekly'
                      ? 'bg-white/15 border-[#8A9684] shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-[#F7F4EF]">
                      {isEn ? "Weekly Pass (5 Days)" : "باقة الأسبوع (5 أيام)"}
                    </span>
                    <span className="text-[10px] font-bold bg-[#8A9684] text-white px-2 py-0.5 rounded-full">
                      {isEn ? "Save 20%" : "وفر 20%"}
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-amber-300 font-serif">490 {t('currency')} <span className="text-xs text-white/60 line-through font-normal">625 {t('currency')}</span></div>
                  <p className="text-[11px] text-[#D2C4B7] mt-1">
                    {isEn ? "Sunday to Thursday + Free Daily Hot Delivery" : "من الأحد للخميس + توصيل مجاني يومياً"}
                  </p>
                </div>

                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedPlan === 'monthly'
                      ? 'bg-white/15 border-[#8A9684] shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-[#F7F4EF]">
                      {isEn ? "Monthly Pass (22 Days)" : "باقة الشهر (22 يوم)"}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full">
                      {isEn ? "Save 26%" : "وفر 26%"}
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-amber-300 font-serif">1850 {t('currency')} <span className="text-xs text-white/60 line-through font-normal">2500 {t('currency')}</span></div>
                  <p className="text-[11px] text-[#D2C4B7] mt-1">
                    {isEn ? "22 Hot Lunch Meals + Priority Prep & Delivery" : "22 يوم عمل + أولوية طهي وتوصيل مجاني"}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
              <span className="text-xs text-[#D2C4B7] mb-1">
                {isEn ? "Selected Plan Price:" : "قيمة الباقة المختارة:"}
              </span>
              <div className="text-3xl sm:text-5xl font-black text-amber-300 font-serif mb-2">
                {selectedPlan === 'weekly' ? '490' : '1850'} {t('currency')}
              </div>
              <p className="text-xs text-emerald-400 font-bold mb-6">
                ✓ {isEn ? "Free Daily Delivery Included" : "التوصيل مجاني يومياً داخل الباقة"}
              </p>

              <button
                type="button"
                onClick={handleSubscribePlan}
                className="w-full bg-[#8A9684] hover:bg-[#727d6d] text-white py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {subscribedSuccess ? (
                  <>
                    <Check className="w-5 h-5 text-white" />
                    <span>{isEn ? "Pass Added to Cart!" : "تمت إضافة الباقة للسلة!"}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>{isEn ? "Confirm Subscription Now" : "تأكيد الاشتراك في الباقة الآن"}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
