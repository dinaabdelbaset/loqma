import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  UtensilsCrossed, 
  MessageCircle,
  Flame, 
  Check,
  SlidersHorizontal
} from 'lucide-react';
import { MENU_CATEGORIES, INITIAL_MENU_ITEMS, type MenuItem, type MenuCategory } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import DishDetailModal from '../components/DishDetailModal';
import ProductVideo from '../components/ProductVideo';
import { getCategory } from '../services/api';

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<{ [id: number]: number }>({});
  const [justAdded, setJustAdded] = useState<{ [id: number]: boolean }>({});
  const [selectedDishForModal, setSelectedDishForModal] = useState<MenuItem | null>(null);
  const { addToCart } = useCart();
  const { language, dir, t, tCategoryName, tCategoryDesc, tDishName, tDishDesc } = useLanguage();
  const isEn = language === 'en';
  const BreadcrumbArrow = isEn ? ChevronRight : ChevronLeft;

  // القسم والأطباق المحملة ديناميكياً من الباك إند
  const fallbackCat = useMemo(() => {
    return MENU_CATEGORIES.find((c) => c.id === categoryId) || MENU_CATEGORIES[0];
  }, [categoryId]);

  const [currentCategory, setCurrentCategory] = useState<MenuCategory>(fallbackCat);
  const [categoryDishes, setCategoryDishes] = useState<MenuItem[]>(() => {
    return INITIAL_MENU_ITEMS.filter((item) => item.categoryId === fallbackCat.id);
  });

  useEffect(() => {
    let isMounted = true;
    if (categoryId) {
      getCategory(categoryId).then((res) => {
        if (isMounted && res) {
          setCurrentCategory(res.category);
          setCategoryDishes(res.dishes);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  // تصفية بالبحث
  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return categoryDishes;
    const query = searchQuery.toLowerCase();
    return categoryDishes.filter((item) => {
      const translatedName = tDishName(item.name).toLowerCase();
      const translatedDesc = tDishDesc(item.name, item.description).toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        translatedName.includes(query) ||
        translatedDesc.includes(query) ||
        (item.tag && item.tag.toLowerCase().includes(query))
      );
    });
  }, [categoryDishes, searchQuery, language]);

  const handleQtyChange = (id: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (dish: MenuItem) => {
    const qty = quantities[dish.id] || 1;
    addToCart(dish, qty);
    setJustAdded((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setJustAdded((prev) => ({ ...prev, [dish.id]: false }));
    }, 1500);
  };

  const currentCatName = tCategoryName(currentCategory.id, currentCategory.name);
  const currentCatDesc = tCategoryDesc(currentCategory.id, currentCategory.description);

  return (
    <div className="min-h-screen bg-[#F7F4EF] dark:bg-[#120E0C] text-[#1F1713] dark:text-[#F7F4EF] pb-20 transition-colors" dir={dir}>
      
      {/* شريط مسار التنقل (Breadcrumbs) */}
      <div className="bg-[#F7F4EF] dark:bg-[#18120E] border-b border-[#D2C4B7] dark:border-[#382A20] py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-bold text-[#382B23] dark:text-[#D6C9BD]">
          <Link to="/" className="hover:text-[#8A9684] transition-colors">{t('navHome')}</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 text-[#8A9684]" />
          <Link to="/categories" className="hover:text-[#8A9684] transition-colors">{t('categoriesBadge')}</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 text-[#8A9684]" />
          <span className="text-[#26472A] dark:text-[#A3D4A8] font-black">{currentCatName}</span>
        </div>
      </div>

      {/* بنر القسم السينمائي الغني */}
      <section className="relative overflow-hidden bg-[#241A14] text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={currentCategory.bannerImg}
            alt={currentCatName}
            className="w-full h-full object-cover object-center opacity-35 filter brightness-90 scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#241A14] via-[#241A14]/75 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20 flex flex-col items-start justify-end">
          <div className="inline-flex items-center gap-2 bg-[#2D4F35] text-white px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 shadow-md backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#F7F4EF]" />
            <span>{isEn ? 'Signature Authentic Recipe' : (currentCategory.badge || 'أكلات ريفية أصلية')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif-title mb-4 tracking-tight flex items-center gap-3 text-white">
            <span>{currentCategory.icon}</span>
            <span>{currentCatName}</span>
          </h1>

          <p className="text-sm sm:text-base text-[#F7F4EF]/90 max-w-2xl leading-relaxed mb-6 font-medium">
            {currentCatDesc} — {isEn ? 'Crafted with 100% baladi cow ghee and farm-fresh ingredients daily.' : 'محضرة على أصولها الفلاحية بسمن بلدي ومكونات طازجة يومياً من مزارعنا لسفرتك.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-white">
            <span className="bg-white/15 px-4 py-2 rounded-xl backdrop-blur-xs border border-white/20 text-white">
              🍽️ {categoryDishes.length} {t('categoryDishesCount')}
            </span>
            <span className="bg-white/15 px-4 py-2 rounded-xl backdrop-blur-xs border border-white/20 text-white">
              ⏱️ {isEn ? 'Fresh Preparation & Clay Pot Baking' : 'تجهيز فوري وتسوية ع الفحم والفخار'}
            </span>
          </div>
        </div>
      </section>

      {/* شريط التبديل السريع بين كافة الأقسام الـ 16 (Horizontal Category Switcher) */}
      <div className="sticky top-14 sm:top-16 z-30 bg-[#F7F4EF]/95 dark:bg-[#18120E]/95 backdrop-blur-md border-b border-[#D2C4B7] dark:border-[#382A20] py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 min-w-max">
            {MENU_CATEGORIES.map((cat) => {
              const isActive = cat.id === currentCategory.id;
              const catTitle = tCategoryName(cat.id, cat.name);
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                    isActive
                      ? 'bg-[#1F1713] dark:bg-amber-600 text-white shadow-md border border-[#8A9684] scale-105 ring-2 ring-white/30'
                      : 'bg-white dark:bg-[#1E1713] hover:bg-[#F7F4EF] dark:hover:bg-[#261D17] text-[#1F1713] dark:text-[#F7F4EF] border border-[#D2C4B7] dark:border-[#382A20]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{catTitle}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* محتوى الصفحة والأطباق */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* شريط البحث ومعلومات النتائج */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1F1713] dark:text-white font-serif-title">
              {isEn ? `Dishes in "${currentCatName}"` : `أطباق قسم "${currentCatName}"`}
            </h2>
            <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] mt-0.5">
              {isEn 
                ? 'All dishes are cooked fresh daily and delivered piping hot in heat-insulated clay wares.'
                : 'جميع الأطباق مطبوخة طازجة يومياً وتقدم ساخنة بأواني فخارية عازلة للحرارة.'
              }
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder={isEn ? `Search in ${currentCatName}...` : `ابحث في ${currentCatName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#1E1713] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl py-2.5 px-10 text-xs text-[#1F1713] dark:text-white placeholder-[#8C7A6B] focus:outline-none focus:border-[#8A9684] shadow-xs"
            />
            <Search className={`w-4 h-4 text-[#8A9684] absolute top-1/2 -translate-y-1/2 ${isEn ? 'right-3' : 'left-3'}`} />
          </div>
        </div>

        {/* شبكة الأطباق بتصميم بوهيمي ساحر وصور حقيقية */}
        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => {
              const currentQty = quantities[dish.id] || 1;
              const isAdded = justAdded[dish.id];
              const dishName = tDishName(dish.name);
              const dishDesc = tDishDesc(dish.name, dish.description);

              return (
                <div
                  key={dish.id}
                  className="bg-white dark:bg-[#1E1713] rounded-3xl overflow-hidden border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-md hover:shadow-xl hover:border-[#8A9684] transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* رأس بطاقة الطبق وصورته */}
                  <div 
                    onClick={() => setSelectedDishForModal(dish)}
                    className="cursor-pointer"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-[#D2C4B7] dark:bg-[#241A14]">
                      {dish.videoUrl ? (
                        <ProductVideo
                          src={dish.videoUrl}
                          poster={dish.image || currentCategory.bannerImg}
                          alt={dishName}
                          aspectRatio="h-48 w-full"
                          threshold={0.5}
                          lazy={true}
                          badgeText={isEn ? 'Dish Reel ♨️' : 'فيديو الأكلة ♨️'}
                          showMuteButton={true}
                          onClick={() => setSelectedDishForModal(dish)}
                        />
                      ) : (
                        <>
                          <img
                            src={dish.image || currentCategory.bannerImg}
                            alt={dishName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </>
                      )}
                      
                      {/* الشارة والبادج */}
                      {dish.tag && (
                        <div className="absolute top-3 right-3 bg-white/95 dark:bg-[#1E1713]/95 backdrop-blur-xs text-[#26472A] dark:text-[#A3D4A8] text-[11px] font-bold px-3 py-1 rounded-full shadow-md border border-[#D2C4B7] dark:border-[#382A20] flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#8A9684]" />
                          <span>{dish.tag}</span>
                        </div>
                      )}

                      {/* السعرات الحرارية */}
                      {dish.calories && (
                        <div className="absolute bottom-3 left-3 bg-[#1F1713]/85 text-[#F7F4EF] text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs">
                          {dish.calories} {isEn ? 'Cal' : 'سعرة'}
                        </div>
                      )}
                    </div>

                    {/* تفاصيل الطبق */}
                    <div className="p-4 sm:p-5 pb-2">
                      <h3 className="font-bold text-base sm:text-lg text-[#1F1713] dark:text-white group-hover:text-[#8A9684] transition-colors mb-1.5 font-serif-title flex items-center justify-between">
                        <span>{dishName}</span>
                      </h3>

                      <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed mb-2 line-clamp-3">
                        {dishDesc}
                      </p>
                    </div>
                  </div>

                  {/* ذيل البطاقة، السعر، وأزرار الإضافة */}
                  <div className="p-4 sm:p-5 pt-0">
                    <div className="pt-3 border-t border-[#D2C4B7] dark:border-[#382A20] flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl sm:text-2xl font-black text-[#1F1713] dark:text-white">
                          {dish.price}
                        </span>
                        <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mx-1">{t('egp')}</span>
                      </div>

                      {/* زر خيارات الحجم السريع */}
                      <button
                        type="button"
                        onClick={() => setSelectedDishForModal(dish)}
                        className="text-[11px] font-bold text-[#1F1713] dark:text-white hover:text-[#8A9684] bg-[#8A9684]/15 hover:bg-[#8A9684]/25 px-3 py-1.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] transition-all flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3 h-3 text-[#8A9684]" />
                        <span>{isEn ? 'Sizes & Add-ons' : 'الأحجام والإضافات'}</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {/* محدد الكمية السريع */}
                      <div className="flex items-center gap-1 bg-[#F7F4EF] dark:bg-[#120E0C] px-2 py-1 rounded-xl border border-[#D2C4B7] dark:border-[#382A20]">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(dish.id, -1)}
                          className="w-5 h-5 rounded bg-white dark:bg-[#261D17] text-[#1F1713] dark:text-white flex items-center justify-center hover:bg-[#D2C4B7]/30 transition-colors text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-[#1F1713] dark:text-white">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(dish.id, 1)}
                          className="w-5 h-5 rounded bg-[#1F1713] dark:bg-amber-600 text-[#F7F4EF] flex items-center justify-center hover:bg-[#2B221D] transition-colors text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(dish)}
                        className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                          isAdded
                            ? 'bg-[#2D4F35] text-white'
                            : 'bg-[#1F1713] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] border border-[#8A9684]/40 shadow-md'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{t('bestSellersAddedSuccess')}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 text-[#8A9684] dark:text-white" />
                            <span>{t('bestSellersAddQuick')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1E1713] rounded-3xl p-12 text-center border-2 border-dashed border-[#D2C4B7] dark:border-[#382A20] max-w-md mx-auto my-8">
            <UtensilsCrossed className="w-12 h-12 text-[#8A9684] mx-auto mb-3" />
            <h4 className="font-bold text-base text-[#1F1713] dark:text-white mb-1">
              {isEn ? `No dishes found matching "${searchQuery}"` : `لم نعثر على أطباق تطابق "${searchQuery}"`}
            </h4>
            <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] mb-4">
              {isEn ? 'Try searching for meat, duck, chicken, rice, or tajine.' : 'جرب البحث بكلمة أخرى مثل: لحم، كوارع، فراخ، أرز، أو مسلوق.'}
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="bg-[#1F1713] dark:bg-amber-600 text-[#F7F4EF] border border-[#8A9684]/40 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2B221D]"
            >
              {isEn ? 'View all category dishes' : 'عرض كافة أطباق القسم'}
            </button>
          </div>
        )}

        {/* بنر مخصص للعزومات والطلبات الخاصة */}
        <section className="mt-16 bg-[#D2C4B7]/25 dark:bg-[#1E1713] border-2 border-[#D2C4B7] dark:border-[#382A20] rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-start">
            <span className="text-xs font-bold text-[#26472A] dark:text-[#A3D4A8] bg-white dark:bg-[#261D17] px-3 py-1 rounded-full border border-[#D2C4B7] dark:border-[#382A20]">
              {isEn ? 'Loqma Royal Catering 👑' : 'خدمة عزومات لقمة الملكية 👑'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#1F1713] dark:text-white font-serif-title">
              {isEn ? 'Hosting a Big Family Gathering or Feast?' : 'عندك عزومة أو مناسبة عائلية كبيرة؟'}
            </h3>
            <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] max-w-xl">
              {isEn 
                ? 'We prepare full catering trays and authentic hot clay tajines with baladi rice, salads, and sides tailored to your taste.'
                : 'بنجهزلك صواني وطواجن العزومات الكاملة في فخار حراري أصلي مع الأرز والمقبلات والسلطات حسب رغبتك.'
              }
            </p>
          </div>

          <a
            href="https://wa.me/201065272373?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%B9%D8%B2%D9%88%D9%85%D8%A7%D8%AA%20%D9%88%D8%B5%D9%88%D8%A7%D9%86%D9%8A%20%D9%84%D9%82%D9%85%D8%A9"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1F1713] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] border border-[#8A9684]/50 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>{isEn ? 'Book Catering on WhatsApp' : 'تنسيق عزومة عبر الواتساب'}</span>
          </a>
        </section>

      </main>

      {/* نافذة تفاصيل الطبق، اختيار الحجم، والإضافات */}
      {selectedDishForModal && (
        <DishDetailModal
          dish={selectedDishForModal}
          onClose={() => setSelectedDishForModal(null)}
        />
      )}

    </div>
  );
}
