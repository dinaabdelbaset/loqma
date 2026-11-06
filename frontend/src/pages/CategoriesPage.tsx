import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { MENU_CATEGORIES, INITIAL_MENU_ITEMS, type MenuCategory } from '../data/menuData';
import { getCategories } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<MenuCategory[]>(MENU_CATEGORIES);
  const { language, t, tCategoryName, tCategoryDesc } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    let isMounted = true;
    getCategories().then((data) => {
      if (isMounted) {
        setCategories(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const ArrowIcon = isEn ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#F7F4EF] dark:bg-[#120E0C] text-[#3D312A] dark:text-[#F7F4EF] py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* عنوان الصفحة ومقدمتها */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-4 py-1.5 rounded-full text-xs font-bold border border-[#8A9684]/30 mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#8A9684]" />
            <span>{isEn ? 'Loqma Feast • 16 Authentic Egyptian Kitchen Categories' : 'سفرة لقمة • 16 قسماً مصرياً أصيلاً (Dynamic API)'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1F1713] dark:text-white font-serif-title mb-4">
            {isEn ? 'Browse Loqma Kitchen Categories' : 'تصفح أقسام قائمة طعام "لقمة"'}
          </h1>

          <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? 'Each category tells an authentic countryside story.. Choose your favorite category to view all signature dishes, recipes, and live prices.'
              : 'كل قسم هو حكاية فلاحية خاصة.. اختر القسم الذي تشتهيه وتعرف على أطباقه ومكوناته بأسعارها الدقيقة وصورها الحية من الباك إند مباشرة.'
            }
          </p>
        </div>

        {/* شبكة الأقسام الـ 16 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, index) => {
            const count = cat.dishesCount || INITIAL_MENU_ITEMS.filter((i) => i.categoryId === cat.id).length;
            const catName = tCategoryName(cat.id, cat.name);
            const catDesc = tCategoryDesc(cat.id, cat.description);

            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="group bg-white dark:bg-[#1E1713] rounded-3xl overflow-hidden border-2 border-[#D2C4B7] dark:border-[#382A20] hover:border-[#8A9684] shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* صورة القسم الغنية */}
                  <div className="relative h-44 w-full overflow-hidden bg-[#D2C4B7] dark:bg-[#241A14]">
                    <img
                      src={cat.bannerImg}
                      alt={catName}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* رقم وترتيب القسم */}
                    <div className="absolute top-3 right-3 bg-[#3D312A]/85 backdrop-blur-xs text-[#F7F4EF] text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                      {isEn ? `Category #${index + 1}` : `قسم #${index + 1}`}
                    </div>

                    {/* بادج القسم */}
                    {(cat.badge || cat.tag) && (
                      <div className="absolute bottom-3 right-3 bg-[#8A9684] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        {isEn ? 'Signature Category' : (cat.badge || cat.tag)}
                      </div>
                    )}
                  </div>

                  {/* بيانات وتفاصيل القسم */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl p-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#261D17] border border-[#D2C4B7] dark:border-[#382A20]">
                        {cat.icon}
                      </span>
                      <div>
                        <h3 className="font-black text-lg text-[#1F1713] dark:text-white group-hover:text-[#8A9684] transition-colors font-serif-title">
                          {catName}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] line-clamp-2 leading-relaxed">
                      {catDesc}
                    </p>
                  </div>
                </div>

                {/* ذيل الكارت مع عدد الأطباق */}
                <div className="px-5 py-3.5 bg-[#FAF7F2]/60 dark:bg-[#261D17]/60 border-t border-[#D2C4B7] dark:border-[#382A20] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8A9684]">
                    🍽️ {count} {isEn ? 'Dishes Available' : 'أطباق جاهزة'}
                  </span>

                  <span className="text-xs font-bold text-[#1F1713] dark:text-white group-hover:text-[#8A9684] flex items-center gap-1 transition-colors">
                    <span>{t('categoryEnter')}</span>
                    <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
