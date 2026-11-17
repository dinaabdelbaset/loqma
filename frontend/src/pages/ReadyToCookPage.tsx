import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Plus, 
  Check, 
  Clock, 
  Snowflake,
  PackageCheck,
  ChevronRight,
  ChevronLeft,
  HeartHandshake
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import type { MenuItem } from '../data/menuData';

export interface ReadyToCookDish {
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
  category: 'oven_trays' | 'frozen_fry' | 'sauces_prep' | 'pantry_spices';
}

export const READY_DISHES: ReadyToCookDish[] = [
  // 1. صواني على الفرن مباشرة
  {
    id: 9501,
    name: 'صينية مكرونة بشاميل غنية باللحمة البلدي (جاهزة للفرن)',
    nameEn: 'Oven-Ready Rich Baladi Béchamel Pasta Tray',
    tagline: 'مكرونة قلم بصوص بشاميل كريمي بالسمن البلدي محشوة بلحمة مفرومة معصجة',
    taglineEn: 'Rigatoni pasta with rich creamy baladi ghee béchamel and minced beef',
    description: 'مجهزة بالكامل في صينية فويل سميكة ومدهونة بالبيض والقشطة البلدي على الوجه، فقط شغلي الفرن ودخليها مباشرة تخرج ذهبية وتبقبق.',
    descriptionEn: 'Fully assembled in oven-ready foil tray topped with rustic cream. Straight to your hot oven.',
    instructions: 'تدخل الفرن ساخن على درجة 200° لمدة 35 دقيقة ثم الشواية دقيقتين حتى تأخذ وش دهبي جراتان.',
    instructionsEn: 'Bake in preheated oven at 200°C for 35 mins, then broil 2 mins for a golden gratin crust.',
    price: 240,
    weight: 'صينية عائلية (1.4 كجم)',
    weightEn: 'Family Tray (1.4 kg)',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
    servings: '4 - 5 أفراد',
    servingsEn: '4 - 5 Servings',
    cookingTime: '35 دقيقة فرن',
    cookingTimeEn: '35 mins Oven',
    badge: 'بشاميل بلدي أصيل 🧈',
    badgeEn: 'Baladi Béchamel 🧈',
    category: 'oven_trays'
  },
  {
    id: 9502,
    name: 'صينية جلاش بلدي باللحمة المفرومة والجبنة الرومي',
    nameEn: 'Layered Baladi Goulash with Meat & Roumi Cheese',
    tagline: 'طبقات جلاش مورقة بالسمن البلدي الفلاحي بحشوة لحمة كندوز مفرومة ورومي قديم',
    taglineEn: 'Flaky filo layers brushed with ghee, stuffed with minced beef & aged Roumi cheese',
    description: 'تصلك مقطعة ومجهزة بالصينية مع خليط الحليب والبيض والبهارات الفلاحي، أدخليها الفرن فوراً لتورق وتقرمش.',
    descriptionEn: 'Arrives pre-cut with seasoned milk-egg wash. Bakes flaky, puffy, and golden crisp.',
    instructions: 'تخبز في الفرن على 180° لمدة 25-30 دقيقة حتى يصبح لونها دهبي كرسبي وتنتفخ الطبقات.',
    instructionsEn: 'Bake at 180°C for 25-30 mins until crispy and puffed up.',
    price: 190,
    weight: 'صينية مستطيلة مقاس 28',
    weightEn: 'Rectangular Tray 28cm',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80',
    servings: '4 - 5 أفراد',
    servingsEn: '4 - 5 Servings',
    cookingTime: '25 دقيقة فرن',
    cookingTimeEn: '25 mins Oven',
    badge: 'مورقة 100% سمنة بلدي ✨',
    badgeEn: 'Baladi Ghee Flaky ✨',
    category: 'oven_trays'
  },
  {
    id: 9503,
    name: 'صينية بطاطس بالفراخ البلدي المتبلة (جاهزة للفرن)',
    nameEn: 'Oven-Ready Baladi Chicken & Potato Casserole',
    tagline: 'شرائح بطاطس فريش مع أوراك/صدور فراخ بلدي متبلة بماء البصل والطماطم والشوربة',
    taglineEn: 'Sliced fresh potatoes with marinated countryside chicken in tomato jus',
    description: 'جاهزة ومتبلة بالصلصة والبهارات والسمن البلدي داخل صينية فويل محكمة، فقط انزعي الغطاء وأدخليها الفرن لتتسبك.',
    descriptionEn: 'Fully prepped in thick foil pan with rich spices and ghee. Remove lid and bake to tender perfection.',
    instructions: 'توضع في فرن 200° لمدة 45 دقيقة ثم تفتح الشواية 5 دقائق لتحمير الفراخ باللون الوردي المحمر.',
    instructionsEn: 'Bake at 200°C for 45 mins, then broil 5 mins until skin is crisp and browned.',
    price: 260,
    weight: 'صينية كبيرة 1.5 كجم',
    weightEn: 'Large 1.5 kg Tray',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&q=80',
    servings: '4 أفراد',
    servingsEn: '4 Servings',
    cookingTime: '45 دقيقة فرن',
    cookingTimeEn: '45 mins Oven',
    badge: 'ريحة زمان وخضار فريش 🥔',
    badgeEn: 'Fresh Veggies 🥔',
    category: 'oven_trays'
  },
  {
    id: 9504,
    name: 'صينية رقاق بلدي بالسمن الفلاحي والشوربة المركزة',
    nameEn: 'Baladi Roqaq Tray with Minced Meat & Duck Broth',
    tagline: 'طبقات رقاق ناشف مسقية بمرقة البط البلدي ومحشوة لحمة مفرومة بلدي',
    taglineEn: 'Dry baladi roqaq soaked in aged broth and layered with savory minced beef',
    description: 'مجهزة ومورقة، وش الصينية مدهون سمن بلدي صافي لتأخذ وش مقمر مقرمش من بره وطري ومورق من جوه.',
    descriptionEn: 'Prepped and brushed with pure ghee. Golden crunchy outside, melt-in-mouth soft inside.',
    instructions: 'توضع في الفرن الأوسط على حرارة 180° لمدة 25 دقيقة حتى تحمر الأطراف والوجه.',
    instructionsEn: 'Bake middle rack at 180°C for 25 mins until edges and top turn deep amber.',
    price: 210,
    weight: 'صينية مدورة مقاس 30',
    weightEn: 'Round Tray 30cm',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&q=80',
    servings: '4 - 6 أفراد',
    servingsEn: '4 - 6 Servings',
    cookingTime: '25 دقيقة فرن',
    cookingTimeEn: '25 mins Oven',
    badge: 'طعم الأفراح والمناسبات 🥮',
    badgeEn: 'Festive Classic 🥮',
    category: 'oven_trays'
  },

  // 2. مفرزنات جاهزة على القلي والشوي
  {
    id: 9505,
    name: 'سمبوسك مقرمشة بحشوات مشكلة (24 قطعة مفرزة)',
    nameEn: 'Frozen Mixed Sambousek Pastries (24 pcs)',
    tagline: '8 جبنة كيري ونعناع + 8 لحمة بلدي معصجة + 8 مكس خضار وجبن شيدر',
    taglineEn: '8 Kiri & Mint + 8 Baladi Beef + 8 Cheddar Veggie mix',
    description: 'عجينة خفيفة مقرمشة محكمة الغلق لا تمتص الزيت، جاهزة للنزول في الزيت الساخن أو الإيرفراير فوراً.',
    descriptionEn: 'Light non-greasy dough sealed tight. Ready for deep fry or air fryer in minutes.',
    instructions: 'تقلى مباشرة من الفريزر في زيت متوسط 3-4 دقائق، أو في الإيرفراير رشة زيت 8 دقائق.',
    instructionsEn: 'Fry frozen in medium oil for 3-4 mins, or air fry with oil spray for 8 mins.',
    price: 145,
    weight: 'طبق 24 قطعة (750 جم)',
    weightEn: '24 pcs Pack (750g)',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
    servings: 'مقبلات عائلية',
    servingsEn: 'Family Appetizer',
    cookingTime: '4 دقائق قلي/إيرفراير',
    cookingTimeEn: '4 mins Fry/Airfry',
    badge: 'مقرمشة وما بتفكش 🥟',
    badgeEn: 'Extra Crispy 🥟',
    category: 'frozen_fry'
  },
  {
    id: 9506,
    name: 'كبيبة بلدي شامية محشية لحمة ومكسرات (12 حبة)',
    nameEn: 'Baladi Kibbeh Stuffed with Beef & Pine Nuts (12 pcs)',
    tagline: 'برغل ناعم بلحم بلدي مفروم محشوة لحمة معصجة وصنوبر ومكسرات وبهار حلو',
    taglineEn: 'Bulgur dough filled with seasoned beef mince, roasted pine nuts, and allspice',
    description: 'مصنوعة يدوياً بحرفية، مجمدة ومفصولة بورق زبدة لضمان القرمشة الخارجية والحشوة الدايبة.',
    descriptionEn: 'Artisan handcrafted kibbeh separated by parchment. Crunchy crust with juicy center.',
    instructions: 'تقلى في زيت غزير ساخن 5 دقائق على نار متوسطة بدون تقليب في أول دقيقتين.',
    instructionsEn: 'Deep fry in hot oil 5 mins over medium flame without stirring first 2 mins.',
    price: 165,
    weight: 'طبق 12 حبة جامبو',
    weightEn: 'Pack of 12 Jumbo',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&q=80',
    servings: '3 - 4 أفراد',
    servingsEn: '3 - 4 Servings',
    cookingTime: '5 دقائق تحمير',
    cookingTimeEn: '5 mins Fry',
    badge: 'محشوة مكسرات بلدي 🌰',
    badgeEn: 'Nut Stuffed 🌰',
    category: 'frozen_fry'
  },
  {
    id: 9507,
    name: 'كفتة حاتي بلدي متبلة ومصبعة على الشوي (1 كجم)',
    nameEn: 'Marinated Baladi Hati Kofta Skewers (1 kg)',
    tagline: 'لحم كندوز بلدي مفروم وشين مع لية ضاني فريش وبهارات الحاتي السرية',
    taglineEn: 'Minced baladi beef blended with lamb fat and secret Hati seasonings',
    description: 'مصبعة على أسياخ خشبية ومجهزة، لا تكش ولا تفك على الشواية أو في صينية الفرن أو الجريل.',
    descriptionEn: 'Pre-shaped on skewers. Never breaks or shrinks on charcoal or oven pan.',
    instructions: 'اشويها على فحم هادئ أو في طاسة جريل ساخنة مدهونة بمسحة سمن بلدي لمدة 10 دقائق.',
    instructionsEn: 'Grill over coals or hot skillet brushed with baladi ghee for 10 mins.',
    price: 340,
    weight: '1 كجم (14-16 سيخ)',
    weightEn: '1 kg (14-16 Skewers)',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
    servings: '4 - 5 أفراد',
    servingsEn: '4 - 5 Servings',
    cookingTime: '10 دقائق شوي',
    cookingTimeEn: '10 mins Grill',
    badge: 'تتبيلة حاتي سرية 🥩',
    badgeEn: 'Secret Hati 🥩',
    category: 'frozen_fry'
  },
  {
    id: 9508,
    name: 'بانيه صدور دجاج فريش واستربس كريسبي متبل ومفرز (1 كجم)',
    nameEn: 'Crispy Breaded Chicken Breast & Strips (1 kg)',
    tagline: 'صدور فراخ بلدي فريش متبلة بماء البصل والليمون ومغلفة بخلطة بقسماط كرسبي مقرمشة',
    taglineEn: 'Fresh baladi chicken breasts breaded in extra crunchy seasoned crumbs',
    description: 'مجهزة طبقات ومفروزة، تخرج من الفريزر على القلي أو الإيرفراير مباشرة ذهبية ومقرمشة وطرية من الداخل.',
    descriptionEn: 'Layered and pre-breaded. Fries to golden perfection straight from freezer.',
    instructions: 'تقلى في زيت ساخن 4-5 دقائق أو في القلاية الهوائية رشة زيت على 190° لمدة 12 دقيقة.',
    instructionsEn: 'Fry 4-5 mins in hot oil or air fry at 190°C for 12 mins.',
    price: 240,
    weight: '1 كجم صافي',
    weightEn: '1 kg Net',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80',
    servings: '4 - 6 أفراد',
    servingsEn: '4 - 6 Servings',
    cookingTime: '5 دقائق قلي',
    cookingTimeEn: '5 mins Fry',
    badge: 'فراخ بلدي كريسبي 🍗',
    badgeEn: 'Crispy Baladi 🍗',
    category: 'frozen_fry'
  },
  {
    id: 9509,
    name: 'ورق عنب بناتي ملفوف ومتبل جاهز بمرقة البط (1 كجم)',
    nameEn: 'Hand-Rolled Grape Leaves with Baladi Broth Jar',
    tagline: 'ورق عنب طازج ملفوف صوابع صغيرة بخلطة الأرز المصري والخضرة الفريش مع برطمان مرقة البط',
    taglineEn: 'Tender hand-rolled grape leaves with rice & fresh herbs + aged duck broth jar',
    description: 'مرصوص وجاهز في حلة أو صينية، يصلك مع برطمان مرقة البط المركزة لصبها والتسوية فوراً.',
    descriptionEn: 'Tightly rolled in cooking tray with rich duck broth jar. Pour and simmer.',
    instructions: 'صبي المرقة المرفقة وضعي طبقاً ثقيلاً فوق المحشي، واتركيه يغلي ثم هدي النار 45 دقيقة.',
    instructionsEn: 'Pour broth, weigh down with heatproof plate, bring to boil then simmer on low 45 mins.',
    price: 220,
    weight: '1 كجم محشي + برطمان شوربة',
    weightEn: '1 kg Mahshi + Broth Jar',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&q=80',
    servings: '3 - 4 أفراد',
    servingsEn: '3 - 4 Servings',
    cookingTime: '45 دقيقة تسوية',
    cookingTimeEn: '45 mins Simmer',
    badge: 'ملفوف صوابع ع المسطرة 🌿',
    badgeEn: 'Hand-Rolled 🌿',
    category: 'frozen_fry'
  },

  // 3. صلصات وتجهيزات ست البيت
  {
    id: 9510,
    name: 'تسبيكة خضار بلدي متسبكة بالطماطم الفريش والسمن البلدي (برطمان 1 كجم)',
    nameEn: 'Baladi Tomato Stew Base in Pure Ghee (1 kg Jar)',
    tagline: 'طماطم بلدي حمراء متسبكة على نار هادية مع بصل وثوم وسمنة بلدي وبهارات المطبخ الأصيل',
    taglineEn: 'Slow-simmered baladi tomato reduction with onion, garlic, and pure cow ghee',
    description: 'جاهزة لإسقاط البامية أو البسلة أو اللوبيا أو الفاصوليا فوراً وتوفير ساعة كاملة من وقفة المطبخ.',
    descriptionEn: 'The ultimate kitchen shortcut. Just add okra, peas, or beans and simmer 15 mins.',
    instructions: 'سخني 4 ملاعق من التسبيكة في الحلة، أضيفي الخضار والشوربة واتركيها تتسبك 15 دقيقة.',
    instructionsEn: 'Heat 4 spoons in your pot, add fresh vegetables and broth, simmer 15 mins.',
    price: 95,
    weight: 'برطمان زجاجي 1 كجم',
    weightEn: '1 kg Glass Jar',
    image: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?w=500&q=80',
    servings: 'تكفي 3 إلى 4 طبخات',
    servingsEn: 'Makes 3-4 Meals',
    cookingTime: 'جاهزة للاستخدام الفوري',
    cookingTimeEn: 'Instant Use',
    badge: 'بدون مواد حافظة 🍅',
    badgeEn: 'Zero Preservatives 🍅',
    category: 'sauces_prep'
  },
  {
    id: 9511,
    name: 'بصل مفروم ناعم متبل بالسمن البلدي والبهارات (عبوة 1 كجم تفريز)',
    nameEn: 'Seasoned Minced Onions with Baladi Ghee (1 kg Freezer Pack)',
    tagline: 'بصل بلدي فريش مفروم ومشوّح تشويحة خفيفة بالسمن البلدي والفلفل الأسود ومفرز مكعبات',
    taglineEn: 'Minced baladi onions lightly sautéed in ghee and black pepper, portioned in cubes',
    description: 'وفري دموع تقطيع البصل ووقت الطبخ، طلعي المكعب وعلى الحلة مباشرة لأي صينية أو شوربة أو خضار.',
    descriptionEn: 'Save tears and prep time. Pop frozen onion cubes straight into your cooking pot.',
    instructions: 'يوضع المكعب مجمداً في الحلة أو الطاسة ويسخن 60 ثانية ويبدأ الطبخ.',
    instructionsEn: 'Place cube frozen into pot or pan, heat 60 seconds and start cooking.',
    price: 85,
    weight: 'عبوة 1 كجم (مكعبات مقسمة)',
    weightEn: '1 kg Pack (Portioned)',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80',
    servings: 'تكفي شهر كامل',
    servingsEn: 'Lasts 1 Month',
    cookingTime: 'فوري على الحلة',
    cookingTimeEn: 'Instant',
    badge: 'وداعاً لدموع البصل 🧅',
    badgeEn: 'No Onion Tears 🧅',
    category: 'sauces_prep'
  },
  {
    id: 9512,
    name: 'شوربة لحمة/فراخ بلدي مركزة طبيعية (زجاجة 1 لتر مفرزة)',
    nameEn: 'Concentrated Natural Baladi Bone Broth (1 Liter)',
    tagline: 'مرقة عظام ولحوم بلدي مسلوقة 8 ساعات مع مستكة وحبهان وورق لورا بدون أي مكعبات صناعية',
    taglineEn: '8-hour slow-cooked baladi bone broth with mastic, cardamom, zero artificial bouillon',
    description: 'شوربة غنية بالجيلاتين والفوائد الطبيعية، مثالية لتسوية المحاشي، الملوخية، لسان العصفور، والصواني.',
    descriptionEn: 'Rich in natural collagen. Perfect base for molokhia, mahshi, and rice.',
    instructions: 'تذوب الزجاجة وتغلى وتستخدم كأساس فوري لأي شوربة أو خضار أو لتسوية الأرز البسمتي.',
    instructionsEn: 'Thaw and boil. Use as rich base for orzo soup, rice, and hearty stews.',
    price: 75,
    weight: 'زجاجة محكمة 1 لتر',
    weightEn: '1 Liter Bottle',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&q=80',
    servings: 'تكفي 5 أطباق شوربة',
    servingsEn: 'Serves 5 Bowls',
    cookingTime: 'تغلى في 3 دقائق',
    cookingTimeEn: 'Boil in 3 mins',
    badge: 'مرقة طبيعية 100% 🍲',
    badgeEn: '100% Natural Broth 🍲',
    category: 'sauces_prep'
  },

  // 4. برطمانات وخيرات ومونة ست البيت
  {
    id: 9513,
    name: 'برطمان سمنة بلدي بقري فلاحي صافي 100% (1 كجم زجاجي)',
    nameEn: 'Pure Baladi Cow Ghee Rustic Jar (1 kg)',
    tagline: 'سمن بلدي أصلية من مزارع الريف المصري على الفرازة ومغلية على الحطب',
    taglineEn: '100% pure authentic countryside cow ghee simmered slowly on woodfire',
    description: 'رائحة وطعم الأكل المصري الأصيل، بدون أي إضافات أو زيوت نباتية. نضمن نقاءها وجودتها المفرزة.',
    descriptionEn: 'The true aroma of Egyptian village kitchens. Zero additives, pure gold.',
    instructions: 'تحفظ في الثلاجة أو المطبخ، ملعقة واحدة تعمر أي طاجن أو أرز أو بيض بلدي.',
    instructionsEn: 'Store in cool pantry. One spoonful enriches any tajine, rice, or eggs.',
    price: 340,
    weight: 'برطمان زجاجي 1 كجم',
    weightEn: '1 kg Glass Jar',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80',
    servings: 'تكفي شهرين طبخ',
    servingsEn: 'Lasts 2 Months',
    cookingTime: 'جاهز للاستخدام الفوري',
    cookingTimeEn: 'Ready to use',
    badge: 'سمنة بلدي أصلية 🧈',
    badgeEn: '100% Pure Ghee 🧈',
    category: 'pantry_spices'
  },
  {
    id: 9514,
    name: 'برطمان خلطة بهارات المحشي الفلاحي السرية (250 جم)',
    nameEn: 'Secret Baladi Mahshi Herb Spice Blend (250g)',
    tagline: 'توليفة من 12 نوع بهار مصري محمص ومطحون طازج بنعناع بلدي وزعتر وكمون بلدي',
    taglineEn: 'Roasted blend of 12 artisan Egyptian spices with dry mint, cumin, and coriander',
    description: 'سر ريحة المحشي اللي تقلب الشارع! تضاف لخلطة الأرز وصلصة الطماطم فتعطي نكهة معتقة متميزة.',
    descriptionEn: 'The secret aroma behind authentic Egyptian stuffed cabbage & vine leaves.',
    instructions: 'أضيفي ملعقة كبيرة لكل كيلو أرز محشي أثناء تسبيك الطماطم على النار.',
    instructionsEn: 'Add 1 tablespoon per 1kg rice during tomato simmer.',
    price: 65,
    weight: 'عبوة 250 جم',
    weightEn: '250g Jar',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80',
    servings: 'تكفي 15 حلة محشي',
    servingsEn: 'Makes 15 pots',
    cookingTime: 'فوري مع الخلطة',
    cookingTimeEn: 'Instant blend',
    badge: 'خلطة سرية للأمهات 🌿',
    badgeEn: 'Secret Blend 🌿',
    category: 'pantry_spices'
  },
  {
    id: 9515,
    name: 'برطمان بهارات كفتة الحاتي والمشويات البلدية (250 جم)',
    nameEn: 'Hati Kofta & Grill Seasoning Rub (250g)',
    tagline: 'بهارات الكبابجي الأصلية مع جوزة الطيب والكبابة الصيني والمستكة المطحونة',
    taglineEn: 'Authentic grill-master seasoning with nutmeg, allspice, and ground mastic',
    description: 'السر في تماسك الكفتة المشوية ورائحة الفحم الشهية، بدون الحاجة لأي إضافات صناعية.',
    descriptionEn: 'Keeps meat skewers juicy, aromatic, and firm without artificial meat binders.',
    instructions: 'تضاف ملعقة ونصف لكل كيلو لحم مفروم مع ماء البصل قبل التشكيل بساعتين.',
    instructionsEn: 'Mix 1.5 tbsp per 1kg minced meat with onion water 2 hours before grilling.',
    price: 70,
    weight: 'عبوة 250 جم',
    weightEn: '250g Jar',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&q=80',
    servings: 'تكفي 10 كجم كفتة',
    servingsEn: 'For 10 kg meat',
    cookingTime: 'تتبيل فوري',
    cookingTimeEn: 'Instant Rub',
    badge: 'سر كفتة الحاتي 🥩',
    badgeEn: 'Hati Secret 🥩',
    category: 'pantry_spices'
  },
  {
    id: 9516,
    name: 'برطمان ليمون معصفر فلاحي بحبة البركة والعصفر وزيت الزيتون (1 كجم)',
    nameEn: 'Artisan Pickled Baladi Lemon with Nigella & Saffron (1 kg)',
    tagline: 'ليمون بنزهير بلدي مسلوق على الهادي ومحشو عصفر وحبة البركة ومغمور بزيت الزيتون',
    taglineEn: 'Aged Egyptian lemons stuffed with safflower & black seed in olive oil',
    description: 'دايب كالملبن وحامض ومزبوط الملح بدون أي مواد حافظة، يفتح النفس جنب أي طاجن أو ملوخية.',
    descriptionEn: 'Melt-in-mouth pickled lemons cured naturally with no chemical accelerators.',
    instructions: 'يقدم فوراً كمقبلات فاخرة بجانب وجبات الغداء والمشويات والصواني.',
    instructionsEn: 'Serve straight from jar as gourmet appetizing side dish.',
    price: 85,
    weight: 'برطمان 1 كجم صافي',
    weightEn: '1 kg Net Jar',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&q=80',
    servings: 'تكفي شهرين مقبلات',
    servingsEn: 'Lasts 2 Months',
    cookingTime: 'جاهز للأكل فوراً',
    cookingTimeEn: 'Ready to Eat',
    badge: 'معصفر دايب ملبن 🍋',
    badgeEn: 'Artisan Pickled 🍋',
    category: 'pantry_spices'
  },
  {
    id: 9517,
    name: 'برطمان باذنجان مخلل بالثوم والدقة والفلفل الأحمر البلدي (750 جم)',
    nameEn: 'Garlic & Red Chili Pickled Baladi Eggplant (750g)',
    tagline: 'باذنجان عروس بنفسجي مقلي خفيف ومحشي دقة ثوم بلدي وخل وفلفل أحمر شطة مفروم',
    taglineEn: 'Tender purple baby eggplant stuffed with garlic, vinegar, and crushed red peppers',
    description: 'المقبلات الرسمية للملوخية والبامية والبشاميل، متبل على أصوله ومغمور بزيت زيتون وخل.',
    descriptionEn: 'The traditional sidekick for molokhia and tajines. Spicy, garlicky, and tangy.',
    instructions: 'يقدم بارداً بجانب وجبة الغداء.',
    instructionsEn: 'Serve chilled alongside home meals.',
    price: 60,
    weight: 'برطمان 750 جم',
    weightEn: '750g Jar',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&q=80',
    servings: 'تكفي 10 وجبات',
    servingsEn: '10 Meals',
    cookingTime: 'جاهز للأكل فوراً',
    cookingTimeEn: 'Ready to Eat',
    badge: 'دقة ريفية حكاية 🍆',
    badgeEn: 'Garlic Tangy 🍆',
    category: 'pantry_spices'
  },
  {
    id: 9518,
    name: 'برطمان طشة ثوم وكزبرة فلاحي مجهزة على الطبخ (350 جم)',
    nameEn: 'Prepped Sizzling Garlic & Ghee Tasha Jar (350g)',
    tagline: 'ثوم صعيدي فريش مفروم ومشوّح نصف تشويحة بالسمن البلدي والكزبرة الناشفة المطحونة',
    taglineEn: 'Minced fresh garlic par-cooked in cow ghee with toasted coriander seeds',
    description: 'وفري وقت دق الثوم! ملعقة واحدة على وش الملوخية أو البامية أو الفتة وتسمعي الطشة فوراً.',
    descriptionEn: 'Saves garlic prep time. One spoon in hot pan for the ultimate sizzling aroma.',
    instructions: 'سخني ملعقة في طاسة صغيرة 30 ثانية وصبيها على وش الملوخية أو الطاجن.',
    instructionsEn: 'Heat 1 tbsp in small skillet for 30s and pour sizzling over your soup.',
    price: 55,
    weight: 'برطمان 350 جم',
    weightEn: '350g Jar',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80',
    servings: 'تكفي 20 طشة',
    servingsEn: '20 Tasha Servings',
    cookingTime: '30 ثانية تسخين',
    cookingTimeEn: '30 secs sizzle',
    badge: 'طشة الملوخية الفلاحي 🧄',
    badgeEn: 'Sizzling Tasha 🧄',
    category: 'pantry_spices'
  }
];

export default function ReadyToCookPage() {
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'all' | 'oven_trays' | 'frozen_fry' | 'sauces_prep' | 'pantry_spices'>('all');
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
    { id: 'all', label: isEn ? 'All Ready-to-Cook (18)' : 'كافة الأصناف والمونة (18)' },
    { id: 'oven_trays', label: isEn ? 'Oven-Ready Trays' : '🥘 صواني على الفرن مباشرة' },
    { id: 'frozen_fry', label: isEn ? 'Ready to Fry & Grill' : '🥟 مفرزنات على القلي والشوي' },
    { id: 'sauces_prep', label: isEn ? 'Homemade Sauces & Prep' : '🍅 صلصات وتجهيزات ست البيت' },
    { id: 'pantry_spices', label: isEn ? 'Rustic Pantry & Spices' : '🏺 برطمانات وخيرات ومونة البيت' },
  ];

  return (
    <div className="bg-[#F7F4EF] dark:bg-[#120E0C] text-[#1F1713] dark:text-[#F7F4EF] min-h-screen py-8 sm:py-14 transition-colors" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* مسار الصفحة (Breadcrumb) */}
        <nav className="flex items-center gap-2 text-xs font-bold text-[#55453B] dark:text-[#D6C9BD]">
          <Link to="/" className="hover:text-[#8A9684] transition-colors">{t('home')}</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 opacity-60" />
          <span className="text-[#1F1713] dark:text-white font-black">
            {isEn ? 'Home Cooking Prep & Freezer Pantry' : 'مفرزنات وتجهيزات ست البيت (جاهز ع التسوية)'}
          </span>
        </nav>

        {/* ترويسة الصفحة مع البنر البوهيمي المخصص */}
        <div className="relative rounded-3xl sm:rounded-[40px] overflow-hidden bg-gradient-to-br from-[#2D241E] via-[#1E1713] to-[#120E0C] text-white p-6 sm:p-12 border-2 border-[#D2C4B7]/20 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8A9684]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Snowflake className="w-4 h-4 text-amber-300" />
              <span>{isEn ? 'Handmade Meal Prep & Freezer Trays' : 'تفريزات ومجهّزات ست البيت والأمهات العاملات ❄️'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif-title leading-tight">
              {isEn ? 'Oven-Ready Dishes & Homemade Prep' : 'مفرزنات وصواني على الفرن والقلي مباشرة'}
            </h1>
            
            <p className="text-xs sm:text-base text-[#D6C9BD] leading-relaxed">
              {isEn 
                ? 'Save hours in the kitchen with hand-prepped family trays, seasoned kofta, crispy sambousek, and concentrated natural bone broths. Straight from our kitchen to your oven or freezer.'
                : 'ريحي نفسك من وقفة المطبخ وتجهيزات العزومات! صواني مجهزة ومفرزنات متبلة بالسمن البلدي تدخل فرنك أو طاستك تطلع طازة بتفور وريحتها قالعة العمارة.'}
            </p>

            <div className="pt-2 flex flex-wrap gap-3 text-xs font-bold text-amber-200">
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>صواني فويل جاهزة للفرن</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <span>سمن بلدي وخضار فريش 100%</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <PackageCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>تغليف محكم يحفظ التتبيلة</span>
              </span>
            </div>
          </div>
        </div>

        {/* أزرار التبويبات والتصنيف السريع */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3 border-b border-[#D2C4B7]/60 dark:border-[#382A20] pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1F1713] dark:bg-amber-600 text-white shadow-md scale-105'
                  : 'bg-white dark:bg-[#1E1713] text-[#55453B] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20] hover:border-[#8A9684]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* شبكة الأطباق والتجهيزات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDishes.map((dish) => {
            const isAdded = !!justAdded[dish.id];
            return (
              <div
                key={dish.id}
                className="bg-white dark:bg-[#18110D] rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] hover:border-[#8A9684] dark:hover:border-amber-600 transition-all shadow-md hover:shadow-xl flex flex-col overflow-hidden group"
              >
                {/* صورة الصنف مع الشارة */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                  <img
                    src={dish.image}
                    alt={isEn ? dish.nameEn : dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-[#1F1713]/85 text-amber-300 backdrop-blur-xs text-[11px] font-black px-3 py-1 rounded-full border border-amber-300/30">
                    {isEn ? dish.badgeEn : dish.badge}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{isEn ? dish.cookingTimeEn : dish.cookingTime}</span>
                  </div>
                </div>

                {/* تفاصيل الطبق والتعليمات */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-black text-base text-[#1F1713] dark:text-white leading-snug">
                      {isEn ? dish.nameEn : dish.name}
                    </h3>
                    <p className="text-xs text-[#8A9684] dark:text-amber-400 font-bold">
                      {isEn ? dish.taglineEn : dish.tagline}
                    </p>
                    <p className="text-xs text-[#55453B] dark:text-[#A09383] leading-relaxed">
                      {isEn ? dish.descriptionEn : dish.description}
                    </p>
                  </div>

                  {/* طريقة التسوية السريعة */}
                  <div className="bg-[#FAF5EE] dark:bg-[#20150E] p-3 rounded-2xl border border-[#D2C4B7]/60 dark:border-[#382A20] text-[11px] text-[#55453B] dark:text-[#D6C9BD] space-y-1">
                    <div className="font-black text-[#1F1713] dark:text-white flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isEn ? 'Easy Home Prep:' : 'طريقة التسوية بالبيت:'}</span>
                    </div>
                    <p className="leading-normal">{isEn ? dish.instructionsEn : dish.instructions}</p>
                  </div>

                  {/* تفاصيل الحجم والسعر والزر */}
                  <div className="pt-2 border-t border-[#D2C4B7]/40 dark:border-[#382A20] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                        {isEn ? dish.weightEn : dish.weight} • {isEn ? dish.servingsEn : dish.servings}
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#1F1713] dark:text-white">
                        {dish.price} {t('currency')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(dish)}
                      className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#1F1713] dark:bg-amber-600 hover:bg-[#3D312A] text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Added!' : 'أضيفت للسلة'}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Add to Cart' : 'أضف للسلة'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
