import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, UtensilsCrossed, Sparkles, Check, ArrowLeft, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { MENU_CATEGORIES, INITIAL_MENU_ITEMS, type MenuItem, type MenuCategory } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import DishDetailModal from '../components/DishDetailModal';
import ProductVideo from '../components/ProductVideo';
import { getCategories, getDishes } from '../services/api';

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>(MENU_CATEGORIES);
  const [dishes, setDishes] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('best-sellers');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<{ [id: number]: number }>({});
  const [justAdded, setJustAdded] = useState<{ [id: number]: boolean }>({});
  const [selectedDishForModal, setSelectedDishForModal] = useState<MenuItem | null>(null);
  const { addToCart } = useCart();
  const { language, dir, t, tCategoryName, tCategoryDesc, tDishName, tDishDesc } = useLanguage();
  const isEn = language === 'en';
  const ArrowIcon = isEn ? ArrowRight : ArrowLeft;

  useEffect(() => {
    let isMounted = true;
    Promise.all([getCategories(), getDishes()]).then(([cats, allDishes]) => {
      if (isMounted) {
        if (cats && cats.length > 0) setCategories(cats);
        if (allDishes && allDishes.length > 0) setDishes(allDishes);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCategory) || categories[0];
  }, [categories, activeCategory]);

  const filteredItems = useMemo(() => {
    return dishes.filter((item) => {
      const matchCategory = searchQuery.trim() !== '' ? true : item.categoryId === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const translatedName = tDishName(item.name).toLowerCase();
      const translatedDesc = tDishDesc(item.name, item.description).toLowerCase();

      const matchSearch =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        translatedName.includes(q) ||
        translatedDesc.includes(q);

      return matchCategory && matchSearch;
    });
  }, [dishes, activeCategory, searchQuery, language]);

  const handleQtyChange = (id: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleAdd = (dish: MenuItem) => {
    const qty = quantities[dish.id] || 1;
    addToCart(dish, qty);
    setJustAdded((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setJustAdded((prev) => ({ ...prev, [dish.id]: false }));
    }, 1500);
  };

  const currentCatTitle = tCategoryName(currentCategory.id, currentCategory.name);
  const currentCatDesc = tCategoryDesc(currentCategory.id, currentCategory.description);

  return (
    <div className="min-h-screen bg-[#F7F4EF] dark:bg-[#120E0C] text-[#1F1713] dark:text-[#F7F4EF] py-10 px-4 sm:px-8 transition-colors" dir={dir}>
      <div className="max-w-7xl mx-auto">
        
        {/* رأس الصفحة */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-4 py-1.5 rounded-full text-xs font-bold border border-[#8A9684]/30 mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#8A9684]" />
            <span>{isEn ? 'Full Loqma Menu • 114 Authentic Egyptian Dishes' : 'منيو لقمة الكامل • 114 طبقاً مصرياً أصيلاً'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1F1713] dark:text-white font-serif-title mb-3">
            {isEn ? 'Loqma Full Dining Menu' : 'قائمة طعام "لقمة" كاملة'}
          </h1>

          <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'Browse across 16 authentic categories or search your favorite dish. You can also view dedicated category pages!'
              : 'تنقل بين الأقسام الـ 16 أو ابحث باسم الطبق المفضل لديك. يمكنك الدخول لصفحة أي قسم مخصصة أيضاً!'
            }
          </p>
        </div>

        {/* شريط البحث الذكي */}
        <div className="max-w-md mx-auto mb-8 relative">
          <input
            type="text"
            placeholder={isEn ? 'Search full menu (114 dishes)...' : 'ابحث في كامل المنيو (114 طبق)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#1E1713] border-2 border-[#D2C4B7] dark:border-[#382A20] rounded-full py-3 px-11 text-xs sm:text-sm text-[#1F1713] dark:text-white placeholder-[#8C7A6B] focus:outline-none focus:border-[#8A9684] shadow-xs"
          />
          <Search className={`w-4 h-4 text-[#8A9684] absolute top-1/2 -translate-y-1/2 ${isEn ? 'left-4' : 'right-4'}`} />
        </div>

        {/* شريط تبديل الأقسام الـ 16 */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-center gap-2 min-w-max">
            {categories.map((cat) => {
              const isActive = cat.id === activeCategory && !searchQuery.trim();
              const catTitle = tCategoryName(cat.id, cat.name);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1F1713] dark:bg-amber-600 text-white shadow-md border border-[#8A9684] scale-105 ring-2 ring-white/30'
                      : 'bg-white dark:bg-[#1E1713] hover:bg-[#F7F4EF] dark:hover:bg-[#261D17] text-[#1F1713] dark:text-[#F7F4EF] border border-[#D2C4B7] dark:border-[#382A20]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{catTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* معلومات القسم النشط وزر الانتقال لصفحته المخصصة */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-4 mb-6 border-b border-[#D2C4B7] dark:border-[#382A20] gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1F1713] dark:text-white font-serif-title flex items-center gap-2">
              <span>{currentCategory.icon}</span>
              <span>
                {searchQuery.trim() ? (isEn ? `Search results for "${searchQuery}"` : `نتائج البحث عن "${searchQuery}"`) : currentCatTitle}
              </span>
            </h2>
            <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] mt-0.5">
              {searchQuery.trim()
                ? (isEn ? `Found ${filteredItems.length} matching dishes` : `تم العثور على ${filteredItems.length} أطباق مطابقة`)
                : currentCatDesc}
            </p>
          </div>

          {!searchQuery.trim() && (
            <Link
              to={`/category/${currentCategory.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F1713] dark:text-white hover:text-[#8A9684] bg-white dark:bg-[#1E1713] px-4 py-2 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] shadow-xs hover:bg-[#F7F4EF] dark:hover:bg-[#261D17] transition-all"
            >
              <span>{isEn ? 'Open Dedicated Category Page' : 'فتح صفحة القسم المخصصة'}</span>
              <ArrowIcon className="w-3.5 h-3.5 text-[#8A9684]" />
            </Link>
          )}
        </div>

        {/* شبكة الأطباق */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((dish) => {
              const currentQty = quantities[dish.id] || 1;
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
                    <div className="relative h-44 w-full overflow-hidden bg-[#D2C4B7] dark:bg-[#241A14]">
                      {dish.videoUrl ? (
                        <ProductVideo
                          src={dish.videoUrl}
                          poster={dish.image || currentCategory.bannerImg}
                          alt={dishName}
                          aspectRatio="h-44 w-full"
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
                      
                      {dish.tag && (
                        <div className="absolute top-3 right-3 bg-white/95 dark:bg-[#1E1713]/95 backdrop-blur-xs text-[#26472A] dark:text-[#A3D4A8] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                          {dish.tag}
                        </div>
                      )}

                      <div className="absolute top-3 left-3 bg-[#1F1713]/80 hover:bg-[#8A9684] text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-md transition-colors">
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>{isEn ? 'Customize' : 'تخصيص'}</span>
                      </div>

                      {dish.calories && (
                        <div className="absolute bottom-3 left-3 bg-[#1F1713]/80 text-[#F7F4EF] text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-xs">
                          {dish.calories} {isEn ? 'Cal' : 'سعرة'}
                        </div>
                      )}
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
                    <div className="pt-3 border-t border-[#D2C4B7] dark:border-[#382A20] flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl font-black text-[#1F1713] dark:text-white">{dish.price}</span>
                        <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mx-1">{t('egp')}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDishForModal(dish)}
                        className="text-[10px] font-bold text-[#1F1713] dark:text-white hover:text-[#8A9684] bg-[#8A9684]/15 hover:bg-[#8A9684]/25 px-2.5 py-1 rounded-lg border border-[#D2C4B7] dark:border-[#382A20] transition-all flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3 h-3 text-[#8A9684]" />
                        <span>{isEn ? 'Sizes & Add-ons' : 'الأحجام والإضافات'}</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
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
                        onClick={() => handleAdd(dish)}
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
              {isEn ? 'Try searching for molokhia, duck, stuffed veggies, or soup.' : 'جرب البحث بكلمة أخرى مثل: ملوخية، بط، محشي، طاجن، أو كباب.'}
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="bg-[#1F1713] dark:bg-amber-600 text-[#F7F4EF] border border-[#8A9684]/40 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2B221D]"
            >
              {isEn ? 'Reset and Show Full Menu' : 'إعادة ضبط وعرض كامل المنيو'}
            </button>
          </div>
        )}

      </div>

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
