import { useState } from 'react';
import { Search, Plus, UtensilsCrossed, Sparkles } from 'lucide-react';
import { MENU_CATEGORIES, INITIAL_MENU_ITEMS, type MenuCategory, type MenuItem } from '../data/menuData';

interface FullMenuProps {
  onAddToCart?: (dish: { id: number; name: string; price: number }) => void;
}

export default function FullMenu({ onAddToCart }: FullMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string>('best-sellers');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  const currentCategory = MENU_CATEGORIES.find((c) => c.id === activeCategory) || MENU_CATEGORIES[0];

  // تصفية الأطباق بحسب القسم والبحث
  const filteredItems = menuItems.filter((item) => {
    const matchCategory = item.categoryId === activeCategory;
    const matchSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <section id="full-menu" className="px-5 sm:px-10 py-12 bg-[#F7F4EF] border-t border-[#D2C4B7]">
      
      {/* عنوان القسم ومقدمته */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#8A9684] px-4 py-1.5 rounded-full text-xs font-bold border border-[#8A9684]/30 mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>منيو لقمة الكامل • Complete Authentic Menu</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-[#3D312A] font-serif-title mb-2">
          قائمة طعام "لقمة".. كل ما تشتهيه سفرة زمان
        </h2>

        <p className="text-xs sm:text-sm text-[#6E5D53] max-w-xl mx-auto leading-relaxed">
          اختر من بين 16 قسماً متنوعاً يلبي كل الأذواق والعزومات، مطبوخة طازجة يومياً بسمن بلدي ومكونات من المزرعة لسفرتك.
        </p>
      </div>

      {/* شريط البحث في المنيو */}
      <div className="max-w-md mx-auto mb-8 relative">
        <input
          type="text"
          placeholder="ابحث عن أكلتك المفضلة في المنيو..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border-2 border-[#D2C4B7] rounded-full py-3 pr-11 pl-4 text-xs sm:text-sm text-[#3D312A] placeholder-[#6E5D53] focus:outline-none focus:border-[#8A9684] shadow-xs transition-all text-right"
        />
        <Search className="w-4 h-4 text-[#8A9684] absolute right-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* شريط الأقسام الـ 16 (Pill Categories Bar) قابل للتمرير بسلاسة */}
      <div className="max-w-5xl mx-auto mb-10 overflow-x-auto pb-3 scrollbar-thin">
        <div className="flex items-center gap-2.5 min-w-max px-1">
          {MENU_CATEGORIES.map((cat: MenuCategory) => {
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-[#3D312A] text-[#F7F4EF] shadow-md border border-[#8A9684] scale-105 ring-2 ring-white'
                    : cat.highlight
                    ? 'bg-[#8A9684] text-white hover:bg-[#788572]'
                    : 'bg-white hover:bg-[#F7F4EF] text-[#3D312A] border border-[#D2C4B7]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* تفاصيل القسم النشط والأطباق التابعة له */}
      <div className="max-w-5xl mx-auto">
        
        {/* شريط رأس القسم الحالي */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#D2C4B7]">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#3D312A] font-serif-title flex items-center gap-2">
              <span>{currentCategory.icon}</span>
              <span>{currentCategory.name}</span>
            </h3>
            <p className="text-xs text-[#6E5D53] mt-0.5">
              {currentCategory.description}
            </p>
          </div>

          <span className="text-xs font-bold text-[#3D312A] bg-[#8A9684]/15 px-3 py-1 rounded-full border border-[#D2C4B7]">
            {filteredItems.length} أطباق جاهزة
          </span>
        </div>

        {/* شبكة الأطباق أو رسالة انتظار الأصناف الجديدة */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border-2 border-[#D2C4B7] shadow-md hover:shadow-xl hover:border-[#8A9684] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 bg-[#F7F4EF] rounded-2xl border border-[#D2C4B7]">
                      {item.icon || '🍲'}
                    </span>
                    {item.tag && (
                      <span className="text-[11px] font-bold text-[#8A9684] bg-[#8A9684]/15 px-2.5 py-1 rounded-full border border-[#8A9684]/30">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-[#3D312A] group-hover:text-[#8A9684] transition-colors mb-1.5">
                    {item.name}
                  </h4>

                  <p className="text-xs text-[#6E5D53] leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D2C4B7] flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-[#3D312A]">{item.price}</span>
                    <span className="text-xs text-[#6E5D53] font-bold mr-1">ج.م</span>
                    {item.calories && (
                      <span className="block text-[10px] text-[#6E5D53]">
                        {item.calories} كالوري
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddToCart?.({ id: item.id, name: item.name, price: item.price })}
                    className="bg-[#3D312A] hover:bg-[#2B221D] text-[#F7F4EF] border border-[#8A9684]/40 px-4 py-2 rounded-xl text-xs font-bold transition-all transform active:scale-95 flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#8A9684]" />
                    <span>أضف للسلة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-[#D2C4B7] text-center max-w-lg mx-auto">
            <UtensilsCrossed className="w-12 h-12 text-[#8A9684] mx-auto mb-3" />
            <h4 className="font-bold text-base text-[#3D312A] mb-1">
              قسم "{currentCategory.name}" جاهز لإضافة الأصناف!
            </h4>
            <p className="text-xs text-[#6E5D53] leading-relaxed">
              القالب والخانة مهيأة تماماً ومربوطة بالتصنيف.. ابعث لي أطباق وأسعار هذا القسم وسأقوم بوضعها هنا فوراً.
            </p>
          </div>
        )}

      </div>

    </section>
  );
}
