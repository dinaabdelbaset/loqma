import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'ar' | 'en';

export interface TranslationsDictionary {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const CATEGORY_TRANSLATIONS: Record<string, { name: string; desc: string; badge: string }> = {
  'best-sellers': {
    name: 'Best Sellers',
    desc: 'Our most loved and frequently ordered signature dishes',
    badge: 'Top Rated ⭐',
  },
  'soups': {
    name: 'Authentic Soups',
    desc: 'Rich homemade broths simmered with Greek mastic & cardamom',
    badge: 'Baladi Broth 🥣',
  },
  'salads': {
    name: 'Salads & Dips',
    desc: 'Crisp daily market salads and Egyptian dips with garlic-vinegar daqqa',
    badge: 'Fresh & Crisp 🥗',
  },
  'grills': {
    name: 'Rustic Oven Grills',
    desc: 'Baked meat parcels, baladi sausage, and seasoned liver',
    badge: 'Beef Parcel & Sausage 🥩',
  },
  'hagouga': {
    name: 'Pies & Baked Roqaq',
    desc: 'Flaky Feteer Meshaltet layered with country ghee, crispy meat roqaq & goulash',
    badge: 'Pure Country Ghee 🧈',
  },
  'charcoal-grills': {
    name: 'Charcoal Grills',
    desc: 'Tender kebab, kofta, lamb chops, and tarb on smoky lumpwood charcoal',
    badge: 'Smoky Charcoal 🔥',
  },
  'pigeon-duck': {
    name: 'Pigeon & Duck',
    desc: 'Sa\'idi freekeh-stuffed pigeons & country duck roasted in golden ghee',
    badge: 'Royal Feast 🕊️',
  },
  'rustic-oven': {
    name: 'Rustic Oven Trays',
    desc: 'Traditional oven casseroles, baked clotted-cream rice (Me\'amar) & roqaq',
    badge: 'Clay Oven Casseroles 🏺',
  },
  'clay-tagines': {
    name: 'Claypot Tajines',
    desc: 'Authentic Aswan claypot stews served bubbling straight from the embers',
    badge: 'Aswan Claypot 🍲',
  },
  'butter-browned': {
    name: 'Ghee Sautéed Meats',
    desc: 'Tender beef slices, spiced liver, and giblets sautéed in 100% pure ghee',
    badge: 'Pure Baladi Butter 🧈',
  },
  'fattah-rice': {
    name: 'Fattah & Festive Rice',
    desc: 'Egyptian garlic-vinegar fattah and spiced wedding rice with toasted almonds',
    badge: 'Garlic Vinegar Daqqa 🍚',
  },
  'mahshi': {
    name: 'Homemade Mahshi',
    desc: 'Hand-rolled vine leaves, cabbage, zucchini with special herbs and mombar',
    badge: 'Hand-Rolled 🥬',
  },
  'sides': {
    name: 'Sides & Extras',
    desc: 'Molokhia with garlic sizzle, golden fried potatoes, and pickles',
    badge: 'Sizzling Tasha 🍲',
  },
  'kids-meals': {
    name: 'Kids Meals',
    desc: 'Wholesome, balanced, and delicious dishes loved by little ones',
    badge: 'Wholesome & Fun 👶',
  },
  'desserts': {
    name: 'Artisanal Desserts',
    desc: 'Oven-baked rice pudding with fresh buffalo milk & clotted cream',
    badge: 'Cream & Honey 🍯',
  },
  'beverages': {
    name: 'Cold Drinks & Tea',
    desc: 'Egyptian sodas, chilled mineral water, and steaming fresh mint tea',
    badge: 'Chilled & Fresh 🥤',
  },
};

export const DISH_TRANSLATIONS: Record<string, { name: string; desc: string }> = {
  'ورقة لحم': {
    name: 'Waraqet Lahma (Rustic Beef Parcel)',
    desc: 'Tender beef cubes braised with baby onions, sweet peppers, and Egyptian spices in baking parchment.',
  },
  'طاجن بامية باللحم الضاني': {
    name: 'Lamb Okra Claypot Tajine',
    desc: 'Baby country okra simmered slowly for 3 hours with succulent lamb in rich garlic tomato broth.',
  },
  'نصف دجاجة مشوية': {
    name: 'Half Roasted Baladi Chicken',
    desc: 'Farm-raised country chicken marinated in onion water, cracked pepper, and roasted golden with butter.',
  },
  'كباب وكفتة مشكل': {
    name: 'Charcoal Kebab & Kofta Platter',
    desc: 'Finely minced baladi meat with parsley and oriental herbs, grilled over red-hot lumpwood embers.',
  },
  'حمام محشي فريك صعيدي': {
    name: 'Sa\'idi Freekeh Stuffed Pigeon',
    desc: 'Plump country pigeon stuffed with green roasted freekeh and giblets, pan-fried in pure baladi ghee.',
  },
  'طاجن ملوخية بالفراخ البلدي': {
    name: 'Molokhia Tajine with Baladi Chicken',
    desc: 'Hand-minced fresh jute mallow simmered in rich chicken broth with a sizzling garlic-coriander tasha.',
  },
  'صينية رقاق باللحمة البلدي': {
    name: 'Crispy Roqaq Pie with Minced Meat',
    desc: 'Golden flaky layers of hand-baked dough soaked in marrow broth and stuffed with spiced baladi minced meat.',
  },
  'أرز معمر بالقشطة الفلاحي': {
    name: 'Baked Cream Rice (Roz Me\'amar)',
    desc: 'Egyptian short-grain rice baked in unglazed clay with whole buffalo milk, clotted cream, and pure ghee.',
  },
  'طاجن عكاوي بالبصل القاورمة': {
    name: 'Oxtail Tajine with Caramelized Onions',
    desc: 'Fall-off-the-bone oxtail stewed slowly with caramelized pearl onions, cloves, and rich beef jus.',
  },
  'كبدة بلدى': {
    name: 'Egyptian Baladi Liver',
    desc: 'Freshly cut country beef liver seared on high heat with garlic, green chili, and lemon cumin daqqa.',
  },
  'نيفة الحجة': {
    name: 'Neefa Slow-Roasted Mutton',
    desc: 'Authentic slow-roasted tender goat or lamb ribs flavored with Egyptian mountain herbs and cumin.',
  },
  'شوربة كوارع مخلية': {
    name: 'Boneless Trotter Soup (Kawaree)',
    desc: 'Rich gelatinous collagen broth with melt-in-your-mouth trotter chunks, roasted garlic, and vinegar.',
  },
  'باقة الغداء الأسبوعية (5 وجبات متكاملة)': {
    name: 'Weekly Lunch Pass (5 Full Feasts)',
    desc: '5 hot daily lunch meals delivered from Saturday to Wednesday with complete sides and drinks.',
  },
  'شاي': {
    name: 'Traditional Egyptian Mint Tea',
    desc: 'Brewed black tea leaves with fresh local mint sprigs, served piping hot.',
  },
};

export const DICTIONARY: TranslationsDictionary = {
  // Navigation
  navHome: { ar: 'الرئيسية', en: 'Home' },
  navMenu: { ar: 'قائمة الطعام', en: 'Menu' },
  navCategories: { ar: 'الأقسام', en: 'Categories' },
  navSchedule: { ar: 'جدول الأسبوع', en: 'Weekly Schedule' },
  navHealthy: { ar: 'أكل صحي 🥗', en: 'Healthy Food 🥗' },
  navReadyToCook: { ar: 'جاهز ع التسوية 🔥', en: 'Ready to Cook 🔥' },
  navAbout: { ar: 'عن لقمة', en: 'About Us' },
  navReviews: { ar: 'ريفيوهات ⭐', en: 'Reviews ⭐' },
  navLogin: { ar: 'دخول', en: 'Login' },
  navProfile: { ar: 'حسابي', en: 'Profile' },
  navLogout: { ar: 'تسجيل خروج', en: 'Logout' },
  navCart: { ar: 'السلة', en: 'Cart' },
  navDayMode: { ar: 'نهاري', en: 'Light' },
  navNightMode: { ar: 'ليلي', en: 'Dark' },
  navLangToggle: { ar: 'English', en: 'عربي' },
  announcement: { 
    ar: 'توصيل مجاني للطلبات فوق 400 ج.م • أكل بيتي مصري 100% بسمن بلدي ومكونات طازجة', 
    en: 'Free delivery on orders over 400 EGP • 100% Egyptian homemade with pure baladi ghee & fresh ingredients' 
  },

  // Hero Section
  heroShopNow: { ar: 'اطلب الآن • SHOP NOW', en: 'ORDER NOW • SHOP NOW' },
  heroExploreMenu: { ar: 'استكشف سفرة لقمة', en: 'Explore Loqma Table' },
  heroFastDelivery: { ar: 'توصيل ساخن وفوري', en: 'Hot & Sizzling Delivery' },
  heroPureGhee: { ar: '100% سمن بلدي طبيعي', en: '100% Pure Baladi Ghee' },

  // Categories Showcase
  categoriesBadge: { ar: '16 قسماً متنوعاً لكل شهوة وعزومة', en: '16 Diverse Kitchen Categories for Every Craving' },
  categoriesTitle: { ar: 'تصفح سفرة "لقمة" حسب القسم', en: 'Explore Loqma\'s Table by Category' },
  categoriesSubtitle: { ar: 'اختر القسم الذي تشتهيه لينقلك لصفحته المخصصة بجميع أطباقه، تفاصيله، وأسعاره المحدثة.', en: 'Choose your desired category to view its signature dishes, ingredients, and updated prices.' },
  categoriesViewAll: { ar: 'عرض كافة الأقسام (16)', en: 'View All Categories (16)' },
  categoryEnter: { ar: 'دخول القسم', en: 'Explore Category' },
  categoryDishesCount: { ar: 'أطباق', en: 'Dishes' },

  // Best Sellers Section
  bestSellersBadge: { ar: 'الأعلى طلباً وحباً لدى زبائننا', en: 'Our Most Loved Signature Best Sellers' },
  bestSellersTitle: { ar: 'صواني وطواجن العيلة الأكثر مبيعاً', en: 'Best Selling Family Trays & Tajines' },
  bestSellersSubtitle: { ar: 'أكلات مصرية أصيلة خارجة من الفرن البلدي بسمن بقري صافي ومكونات طازجة 100%.', en: 'Authentic Egyptian comfort dishes straight from the rustic oven with 100% pure butter and fresh market produce.' },
  bestSellersViewFullMenu: { ar: 'تصفح قائمة الطعام كاملة (114 طبق)', en: 'Browse Complete Menu (114 Dishes)' },
  bestSellersDishDetails: { ar: 'التفاصيل', en: 'Details' },
  bestSellersAddQuick: { ar: 'أضف للسلة', en: 'Add to Cart' },
  bestSellersAddedSuccess: { ar: 'تمت الإضافة للسلة!', en: 'Added to cart!' },

  // Continuous Food Story
  storyBadge: { ar: 'قصة الطبق • Real Continuous Food Film', en: 'The Cooking Story • Real Continuous Food Film' },
  storyOrderTajinNow: { ar: 'اطلب طاجن الملوخية سخن الآن (95 ج.م)', en: 'Order Piping Hot Molokhia Tajine (95 EGP)' },
  storyNextStage: { ar: 'شاهد المرحلة التالية', en: 'Watch Next Stage' },
  storyChefSecret: { ar: 'سر نَفَس الشيف في لقمة:', en: 'The Chef\'s Secret Touch:' },
  storyStageNumber: { ar: 'المرحلة', en: 'Stage' },
  storyStageOf: { ar: 'من 04', en: 'of 04' },

  // Weekly Schedule
  scheduleBadge: { ar: 'أكل بيتي فريش يومياً بجدول محدد', en: 'Fresh Daily Homemade Lunch on Schedule' },
  scheduleTitle: { ar: 'جدول غداء الأسبوع من "لقمة"', en: 'Loqma\'s Weekly Lunch Schedule' },
  scheduleSubtitle: { ar: 'كل يوم صينية أو طاجن مختلف مطبوخ طازجاً في صباح نفس اليوم بسمن بلدي ومكونات فريش.', en: 'Every day a unique oven tray or claypot stew, cooked fresh every morning with pure ghee and local produce.' },
  scheduleChefSecret: { ar: 'سر الشيف:', en: 'Chef\'s Secret:' },
  scheduleIncludesFree: { ar: 'يقدم مع الوجبة مجاناً بدون أي تكلفة إضافية:', en: 'Includes free complimentary side dishes:' },
  scheduleOrderMeal: { ar: 'اطلب غداء اليوم طازة', en: 'Order Today\'s Fresh Lunch' },
  scheduleSubscribeWeek: { ar: 'اشترك في باقة الأسبوع (خصم 20%)', en: 'Subscribe to Weekly Pass (20% Off)' },
  scheduleCalories: { ar: 'سعرة حرارية', en: 'Calories' },
  scheduleServings: { ar: 'فرد واحد مشبع جداً', en: '1 Generous Person' },
  scheduleFreshPrep: { ar: 'يجهز طازجاً:', en: 'Freshly Ready at:' },

  // Why Loqma
  whyBadge: { ar: 'سر جودة لقمة • The 4 Quality Pillars', en: 'The Loqma Quality • The 4 Quality Pillars' },
  whyTitle: { ar: 'ليه أكل "لقمة" مختلف عن أي أكل تاني دوقته؟', en: 'Why Does Loqma Taste Unlike Any Other Food?' },
  whySubtitle: { ar: 'لأننا نرفض تنازلات المطاعم التجارية السريعة، ونلتزم بأصول الطهي البيتية المصرية اللي تربينا عليها بدون توفير في الجودة.', en: 'We reject commercial shortcuts and commit 100% to authentic Egyptian homemade recipes with zero compromise.' },

  // How It Works
  howTitle: { ar: 'كيف يعمل "لقمة"؟ في 3 خطوات بسيطة', en: 'How Loqma Works in 3 Simple Steps' },
  howSubtitle: { ar: 'من مطبخنا لسفرتك بأعلى معايير السلاسة والسرعة وسخونة الأكل.', en: 'From our kitchen to your table with speed, elegance, and piping-hot food.' },
  howStep1Title: { ar: 'اختر وجبة اليوم أو جدول أسبوعك', en: '1. Pick Today’s Feast or Weekly Schedule' },
  howStep1Desc: { ar: 'تصفح أطباق الطواجن، الصواني، أو الأكل الصحي، أو اشترك في باقة الغداء الأسبوعية لتصلك وجباتك تلقائياً.', en: 'Browse authentic claypot tajines, healthy meals, or subscribe to the weekly lunch pass for automatic hot delivery.' },
  howStep2Title: { ar: 'نطبخها لك فريش مخصوص في الصباح', en: '2. Cooked Fresh in the Morning Just For You' },
  howStep2Desc: { ar: 'تبدأ شيفاتنا في طهي طاجنك فور طلبك بسمن بلدي ومكونات طازجة اليوم بدون أي أكل بايت أو سابق التحضير.', en: 'Our chefs hand-craft your meal upon ordering using 100% pure butter and fresh market produce with no leftovers.' },
  howStep3Title: { ar: 'توصلك سخنة بتفور في ميعاد غداك', en: '3. Delivered Sizzling Hot on Lunch Time' },
  howStep3Desc: { ar: 'تصلك الوجبة مغلفة بحقائب حرارية خاصة تحفظ سخونة الفخار، مع الخبز البلدي الساخن والمقبلات على باب بيتك.', en: 'Delivered in insulated thermal containers preserving oven heat, accompanied by warm baladi flatbread and dips.' },

  // Customer Reviews
  reviewsBadge: { ar: 'تقييمات زبائننا المعتمدة ⭐ 4.9 من 5', en: 'Verified Diner Reviews ⭐ 4.9 out of 5' },
  reviewsTitle: { ar: 'آراء وشهادات زبائن "لقمة"', en: 'What Diners Say About Loqma' },
  reviewsSubtitle: { ar: 'نَفَس بيتي حقيقي وثقة مئات العائلات في القاهرة الكبرى والشيخ زايد والتجمع.', en: 'Real homemade passion trusted by hundreds of families across Cairo, Sheikh Zayed, and New Cairo.' },
  reviewsAddBtn: { ar: 'شاركنا رأيك في أكلك ✍️', en: 'Share Your Dining Experience ✍️' },

  // Cart
  cartTitle: { ar: 'سلة مشترياتك من لقمة', en: 'Your Loqma Cart' },
  cartEmpty: { ar: 'سلتك فارغة حالياً', en: 'Your cart is currently empty' },
  cartEmptyDesc: { ar: 'استكشف قائمة طعامنا وأضف ما تشتهيه من الأكلات البيتية الفاخرة.', en: 'Explore our menu and add authentic Egyptian homemade dishes.' },
  cartBrowseMenu: { ar: 'استكشف قائمة الأكلات', en: 'Explore Menu' },
  cartSubtotal: { ar: 'المجموع الفرعي', en: 'Subtotal' },
  cartDeliveryFee: { ar: 'رسوم التوصيل الساخن', en: 'Hot Delivery Fee' },
  cartTotal: { ar: 'الإجمالي النهائي', en: 'Total Price' },
  cartCheckout: { ar: 'متابعة إتمام الطلب', en: 'Proceed to Checkout' },
  cartItemAdded: { ar: 'تمت الإضافة للسلة!', en: 'Added to cart!' },
  cartDepositNote: { ar: 'عربون تأكيد الطلب', en: 'Order Confirmation Deposit' },
  cartClear: { ar: 'تفريغ السلة', en: 'Clear Cart' },

  // Profile & Orders
  profileTitle: { ar: 'الملف الشخصي وحسابي', en: 'Customer Profile & Account' },
  profileWelcome: { ar: 'أهلاً بك يا', en: 'Welcome back,' },
  profileOrdersHistory: { ar: 'سجل طلباتي السابقة', en: 'Order History' },
  profileNoOrders: { ar: 'لا توجد طلبات سابقة حتى الآن', en: 'No previous orders yet' },
  profileOrderNum: { ar: 'رقم الأوردر', en: 'Order #' },
  profileDate: { ar: 'تاريخ الطلب', en: 'Date' },
  profileStatus: { ar: 'الحالة', en: 'Status' },
  profileTotal: { ar: 'الإجمالي', en: 'Total' },
  profileItems: { ar: 'الأصناف', en: 'Items' },
  profileReorder: { ar: 'إعادة الطلب ↺', en: 'Reorder ↺' },
  profileLogoutConfirm: { ar: 'تم تسجيل الخروج وتفريغ السلة بنجاح', en: 'Logged out & cart cleared successfully' },

  // Common Actions
  addToCart: { ar: 'أضف للسلة', en: 'Add to Cart' },
  quickAdd: { ar: 'إضافة سريعة', en: 'Quick Add' },
  viewDetails: { ar: 'التفاصيل', en: 'View Details' },
  currency: { ar: 'ج.م', en: 'EGP' },
  calories: { ar: 'سعر حراري', en: 'Calories' },
  servings: { ar: 'فرد', en: 'Person' },

  // Footer
  footerGuaranteeTitle: { ar: 'ضمان لقمة الذهبي للرضا 100%', en: 'Loqma 100% Golden Satisfaction Guarantee' },
  footerGuaranteeDesc: { ar: 'إذا لم يكن الطعم بيتي أصيل وساخن كما وعدناك، نعيد لك الحساب أو نرسل بديلاً فوراً.', en: 'If the taste is not authentic and hot as promised, we refund you or send a replacement immediately.' },
  footerPayments: { ar: 'طرق الدفع المصرية المعتمدة:', en: 'Accepted Egyptian Payment Methods:' },
  footerAboutText: { ar: 'منصة طعام منزلي مصري فاخر بروح وبساطة بوهيمية. نطبخ بسمن بلدي صافي وخضار فريش، لتصلك السفرة ساخنة بحب.', en: 'Egyptian artisanal homemade food platform with a warm boho spirit. Cooked with 100% pure ghee and fresh local produce.' },
  footerDeliveryHours: { ar: 'مواعيد التوصيل اليومي', en: 'Daily Delivery Hours' },
  footerKitchenSections: { ar: 'أقسام المطبخ والخدمات', en: 'Kitchen & Services' },
  footerPages: { ar: 'صفحات وتوصيل', en: 'Pages & Delivery' },
  footerContactChef: { ar: 'تواصل مع الشيف', en: 'Contact the Chef' },
  footerWhatsAppBtn: { ar: 'محادثة واتساب مباشرة', en: 'Direct WhatsApp Chat' },
  footerRights: { ar: '© 2026 LOQMA | لقمة - جميع الحقوق محفوظة.', en: '© 2026 LOQMA | All rights reserved.' },
  footerMadeWithLove: { ar: 'صُنِع بنَفَس وحب مصري أصيل', en: 'Crafted with authentic Egyptian passion and love' }
};

interface LanguageContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  tCategoryName: (id: string, defaultName?: string) => string;
  tCategoryDesc: (id: string, defaultDesc?: string) => string;
  tDishName: (name: string) => string;
  tDishDesc: (name: string, defaultDesc?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('loqma_lang') as Language;
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'ar';
  });

  const dir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
      if (language === 'en') {
        document.documentElement.classList.add('lang-en');
      } else {
        document.documentElement.classList.remove('lang-en');
      }
    }
    localStorage.setItem('loqma_lang', language);
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string): string => {
    const item = DICTIONARY[key];
    if (!item) return key;
    return item[language] || item.ar || key;
  };

  const tCategoryName = (id: string, defaultName?: string): string => {
    if (language === 'ar') return defaultName || id;
    return CATEGORY_TRANSLATIONS[id]?.name || defaultName || id;
  };

  const tCategoryDesc = (id: string, defaultDesc?: string): string => {
    if (language === 'ar') return defaultDesc || '';
    return CATEGORY_TRANSLATIONS[id]?.desc || defaultDesc || '';
  };

  const tDishName = (name: string): string => {
    if (language === 'ar') return name;
    return DISH_TRANSLATIONS[name]?.name || name;
  };

  const tDishDesc = (name: string, defaultDesc?: string): string => {
    if (language === 'ar') return defaultDesc || '';
    return DISH_TRANSLATIONS[name]?.desc || defaultDesc || '';
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        dir, 
        t, 
        setLanguage, 
        toggleLanguage,
        tCategoryName,
        tCategoryDesc,
        tDishName,
        tDishDesc,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
