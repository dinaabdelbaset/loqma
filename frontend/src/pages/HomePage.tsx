import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  Flame, 
  Plus, 
  Check, 
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Bot,
  Calendar,
  Users
} from 'lucide-react';
import CraftEvolutionHero from '../components/CraftEvolutionHero';
import ProductVideo from '../components/ProductVideo';
import ContinuousFoodStory from '../components/ContinuousFoodStory';
import WeeklySchedule from '../components/WeeklySchedule';
import WhyLoqma from '../components/WhyLoqma';
import HowItWorks from '../components/HowItWorks';
import CustomerReviews from '../components/CustomerReviews';
import DishDetailModal from '../components/DishDetailModal';
import { MENU_CATEGORIES, INITIAL_MENU_ITEMS, type MenuItem, type MenuCategory } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';
import { getCategories, getDishes } from '../services/api';

export default function HomePage() {
  const { addToCart } = useCart();
  const { language, t, tCategoryName, tCategoryDesc, tDishName, tDishDesc } = useLanguage();
  const isEn = language === 'en';
  const [justAdded, setJustAdded] = useState<{ [id: number]: boolean }>({});
  const [selectedDishForModal, setSelectedDishForModal] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>(MENU_CATEGORIES);
  const [bestDishes, setBestDishes] = useState<MenuItem[]>(() => {
    return INITIAL_MENU_ITEMS.filter((item) => item.categoryId === 'best-sellers').slice(0, 8);
  });

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getCategories(),
      getDishes({ bestSellers: true })
    ]).then(([cats, bests]) => {
      if (isMounted) {
        if (cats && cats.length > 0) setCategories(cats);
        if (bests && bests.length > 0) setBestDishes(bests.slice(0, 8));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdd = (dish: MenuItem) => {
    addToCart(dish, 1);
    setJustAdded((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setJustAdded((prev) => ({ ...prev, [dish.id]: false }));
    }, 1500);
  };

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const ChevronIcon = language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="bg-[#F7F4EF] dark:bg-[#120E0C] text-[#3D312A] dark:text-[#F7F4EF] transition-colors duration-300">
      
      {/* 1. قسم الهيرو التحريري الفاخر المتطابق مع فيديو اللابتوب */}
      <CraftEvolutionHero />

      {/* 2. قسم استكشاف أقسام سفرة لقمة (Categories Showcase) */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[#D2C4B7] dark:border-[#382A20]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#8A9684]/30 mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('categoriesBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1F1713] dark:text-white font-serif-title">
              {t('categoriesTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] mt-1 max-w-xl">
              {t('categoriesSubtitle')}
            </p>
          </div>

          <Link
            to="/categories"
            className="group flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1F1713] dark:text-white hover:text-[#8A9684] bg-[#D2C4B7]/30 dark:bg-[#241A14] hover:bg-[#D2C4B7]/60 px-5 py-3 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] shadow-xs transition-all"
          >
            <span>{t('categoriesViewAll')}</span>
            <ArrowIcon className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform text-[#8A9684]" />
          </Link>
        </div>

        {/* شبكة الأقسام الأولى مع الصور الواقعية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((cat) => {
            const count = INITIAL_MENU_ITEMS.filter((i) => i.categoryId === cat.id).length;
            const catName = tCategoryName(cat.id, cat.name);
            const catDesc = tCategoryDesc(cat.id, cat.description);

            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="group bg-white dark:bg-[#1E1713] rounded-3xl overflow-hidden border-2 border-[#D2C4B7] dark:border-[#382A20] hover:border-[#8A9684] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-[#D2C4B7]/30 dark:bg-[#241A14]">
                    <img
                      src={cat.bannerImg}
                      alt={catName}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <span className="absolute bottom-3 right-3 bg-[#3D312A] text-[#F7F4EF] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md border border-[#8A9684]/40">
                      {cat.icon} {catName}
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed line-clamp-2">
                      {catDesc}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-2.5 border-t border-[#D2C4B7]/30 dark:border-[#382A20] flex items-center justify-between text-xs font-bold text-[#55453B] dark:text-[#D6C9BD]">
                    <span>{count} {t('categoryDishesCount')}</span>
                    <span className="text-[#8A9684] flex items-center gap-1 group-hover:translate-x-[-3px] transition-transform font-black">
                      <span>{t('categoryEnter')}</span>
                      <ChevronIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* زر التصفح الكامل للأقسام المتبقية */}
        <div className="mt-8 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 border border-[#8A9684]/40"
          >
            <span>{language === 'ar' ? 'استكشف باقي الأقسام (طواجن فلاحي، محشي بيتي، الفرن الفلاحي، والمحمر بالزبدة)' : 'Explore All 16 Kitchen Categories (Claypot Tajines, Stuffed Mahshi, Rustic Oven)'}</span>
            <ArrowIcon className="w-4 h-4 text-[#8A9684] dark:text-white" />
          </Link>
        </div>
      </section>

      {/* 3. أكثر الأطباق طلباً (Best Sellers Highlights) مع زر الإضافة السريعة */}
      <section className="py-16 px-4 sm:px-8 bg-[#D2C4B7]/20 dark:bg-[#18120E] border-y border-[#D2C4B7] dark:border-[#382A20]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#8A9684]/30 mb-2 shadow-xs">
                <Flame className="w-3.5 h-3.5" />
                <span>{t('bestSellersBadge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1F1713] dark:text-white font-serif-title">
                {t('bestSellersTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] mt-1 max-w-xl">
                {t('bestSellersSubtitle')}
              </p>
            </div>

            <Link
              to="/category/best-sellers"
              className="group flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1F1713] dark:text-white hover:text-[#8A9684] bg-white dark:bg-[#1E1713] px-5 py-3 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] shadow-xs transition-all"
            >
              <span>{language === 'ar' ? 'عرض كل أحسن الأطباق' : 'View All Best Sellers'}</span>
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform text-[#8A9684]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestDishes.map((dish) => {
              const isAdded = justAdded[dish.id];
              const dishName = tDishName(dish.name);
              const dishDesc = tDishDesc(dish.name, dish.description);

              return (
                <div
                  key={dish.id}
                  className="bg-white dark:bg-[#1E1713] rounded-3xl overflow-hidden border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-md hover:shadow-xl hover:border-[#8A9684] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div 
                    onClick={() => setSelectedDishForModal(dish)}
                    className="cursor-pointer"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-[#D2C4B7]/30 dark:bg-[#241A14]">
                      {dish.videoUrl ? (
                        <ProductVideo
                          src={dish.videoUrl}
                          poster={dish.image || '/images/categories/charcoal-grills.jpg'}
                          alt={dishName}
                          aspectRatio="h-44 w-full"
                          threshold={0.5}
                          lazy={true}
                          badgeText={language === 'ar' ? 'فيديو الأكلة ♨️' : 'Food Film ♨️'}
                          showMuteButton={true}
                          onClick={() => setSelectedDishForModal(dish)}
                        />
                      ) : (
                        <>
                          <img
                            src={dish.image || '/images/categories/charcoal-grills.jpg'}
                            alt={dishName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </>
                      )}
                      
                      {dish.tag && (
                        <div className="absolute top-3 right-3 bg-white/95 dark:bg-[#1E1713]/95 backdrop-blur-xs text-[#26472A] dark:text-[#A3D4A8] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md border border-[#8A9684]/30">
                          {language === 'ar' ? dish.tag : 'Top Pick ⭐'}
                        </div>
                      )}

                      <div className="absolute top-3 left-3 bg-[#3D312A]/85 hover:bg-[#8A9684] text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-md transition-colors">
                        <SlidersHorizontal className="w-3 h-3 text-[#F7F4EF]" />
                        <span>{language === 'ar' ? 'تخصيص' : 'Customize'}</span>
                      </div>
                    </div>

                    <div className="p-4 pb-2">
                      <h3 className="font-bold text-base text-[#1F1713] dark:text-white group-hover:text-[#8A9684] transition-colors mb-1 font-serif-title">
                        {dishName}
                      </h3>
                      <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed line-clamp-2 mb-2">
                        {dishDesc}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-[#D2C4B7]/30 dark:border-[#382A20] flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl font-black text-[#1F1713] dark:text-white">{dish.price}</span>
                        <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mx-1">{t('currency')}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDishForModal(dish)}
                        className="text-[10px] font-bold text-[#1F1713] dark:text-white hover:text-[#8A9684] bg-[#D2C4B7]/30 dark:bg-[#241A14] hover:bg-[#D2C4B7]/60 px-2.5 py-1 rounded-lg border border-[#D2C4B7] dark:border-[#382A20] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3 h-3 text-[#8A9684]" />
                        <span>{language === 'ar' ? 'خيارات' : 'Options'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(dish)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] shadow-black/20 border border-[#8A9684]/40'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>{t('bestSellersAddedSuccess')}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-[#8A9684] dark:text-white" />
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
      </section>

      {/* 3.5. ستوديو خدمات لقمة بالذكاء الاصطناعي (AI Studio Services) */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto border-t border-[#D2C4B7] dark:border-[#382A20]">
        <div className="bg-gradient-to-r from-[#241A14] via-[#2D2018] to-[#1F1713] rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-white/10 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-black border border-emerald-400/30 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{isEn ? 'Smart AI Dining Services' : 'خدمات لقمة الذكية بالذكاء الاصطناعي'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-serif-title mb-2">
              {isEn ? 'Your Personal Baladi Chef & Event Planner' : 'شيفك الفلاحي الخاص ومخطط عزوماتك بالـ AI'}
            </h2>
            <p className="text-xs sm:text-sm text-[#E8DFD5] leading-relaxed">
              {isEn
                ? 'Leverage our bespoke AI algorithms to tailor your weekly family lunch, budget your gathering, or chat in Egyptian Arabic with our chef.'
                : 'استغل أدواتنا الذكية المبتكرة: احسب تكلفة عزومتك بدقة، اسأل الشيف عن ميزانيتك وحساسيات طعامك، أو صمم جدول أسبوع مخصص لعيلتك.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto relative z-10">
            {/* كارت 1: شيف لقمة الذكي */}
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/15 flex flex-col justify-between transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#2D4F35] flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6 text-emerald-300" />
                </div>
                <h3 className="font-black text-lg text-white mb-2">
                  {isEn ? 'AI Baladi Chef' : 'شيف لقمة الذكي (AI)'}
                </h3>
                <p className="text-xs sm:text-sm text-[#E8DFD5] leading-relaxed mb-6">
                  {isEn
                    ? 'Chat in Egyptian Arabic: tell him your budget, party size, or allergies to get an instant meal.'
                    : 'اسأله بالعامية: معاك ميزانية محددة، حساسية ألبان/لاكتوز، أو عاوز أكلة معينة وهيظبطلك وجبتك فوراً.'
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('loqma:open-ai-chat'))}
                className="w-full bg-white hover:bg-[#FAF5EE] text-[#1F1713] py-3 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isEn ? 'Chat with AI Chef 🤖' : 'تحدث مع الشيف 🤖'}</span>
              </button>
            </div>

            {/* كارت 2: حاسبة ومخطط العزومات */}
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/15 flex flex-col justify-between transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-600/80 flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-amber-200" />
                </div>
                <h3 className="font-black text-lg text-white mb-2">
                  {isEn ? 'Interactive Feast Calculator' : 'حاسبة ومخطط العزومات 👑'}
                </h3>
                <p className="text-xs sm:text-sm text-[#E8DFD5] leading-relaxed mb-6">
                  {isEn
                    ? 'Input your guest count (4 to 50+) and budget to get a balanced tray menu with 12-15% discount.'
                    : 'حدد عدد ضيوفك (10 أو 20 فرد) واحسب تشكيلة الصواني والمحاشي والتكلفة التقديرية بدقة.'
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('loqma:open-feast-calculator'))}
                className="w-full bg-amber-500 hover:bg-amber-400 text-[#1F1713] py-3 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isEn ? 'Plan Your Feast 👑' : 'احسب عزومتك الآن 👑'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. حكاية الملوخية وسر الطشة السينمائية */}
      <section id="story">
        <ContinuousFoodStory />
      </section>

      {/* 5. جدول غداء الأسبوع الموفر */}
      <section id="schedule">
        <WeeklySchedule />
      </section>

      {/* 6. لماذا لقمة؟ ركائز الجودة الأربعة */}
      <WhyLoqma />

      {/* 7. خطوات الطلب والتوصيل */}
      <HowItWorks />

      {/* 8. تقييمات وآراء العملاء */}
      <section id="reviews">
        <CustomerReviews />
      </section>

      {/* نافذة تفاصيل الطبق، اختيار الحجم، والإضافات */}
      {selectedDishForModal && (
        <DishDetailModal
          dish={selectedDishForModal}
          categoryBanner="/images/categories/charcoal-grills.jpg"
          onClose={() => setSelectedDishForModal(null)}
        />
      )}

    </div>
  );
}
