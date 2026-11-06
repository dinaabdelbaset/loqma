import { useState, useEffect } from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';
import { getSmartCrossSell, type CrossSellItem } from '../services/aiApi';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface SmartCrossSellProps {
  cartDishIds: number[];
}

export default function SmartCrossSell({ cartDishIds }: SmartCrossSellProps) {
  const { language, t } = useLanguage();
  const isEn = language === 'en';
  const { addToCart } = useCart();

  const [recommendations, setRecommendations] = useState<CrossSellItem[]>([]);
  const [justAdded, setJustAdded] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    if (cartDishIds.length > 0) {
      let isMounted = true;

      getSmartCrossSell(cartDishIds, language).then((res) => {
        if (isMounted && res && res.recommendations) {
          setRecommendations(res.recommendations);
        }
      });

      return () => {
        isMounted = false;
      };
    } else {
      setRecommendations([]);
    }
  }, [cartDishIds.join(','), language]);

  const handleAdd = (item: CrossSellItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.discounted_price, // سعر الخصم المكمل
      categoryId: item.categoryId || 'salads',
      image: item.image,
      tag: 'إضافة مكملة للسفرة 🍽️'
    }, 1);

    setJustAdded((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setJustAdded((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  if (cartDishIds.length === 0 || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#FAF5EE] dark:bg-[#1C130D] rounded-2xl p-3.5 border border-[#D2C4B7] dark:border-[#382A20] space-y-3">
      {/* عنوان المحرك الذكي */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-[#1F1713] dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>{isEn ? 'AI Smart Complementary Additions:' : 'يكمل سفرتك مع هذا الطلب (ذكاء اصطناعي):'}</span>
        </span>
        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300/40">
          {isEn ? '10% Pair Discount' : 'خصم 10% مكملات'}
        </span>
      </div>

      {/* بطاقات الإضافات المكملة */}
      <div className="space-y-2">
        {recommendations.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#241A14] p-2.5 rounded-xl border border-[#D2C4B7]/70 dark:border-[#382A20] flex items-center justify-between gap-3 shadow-2xs hover:border-[#8A9684] transition-all"
          >
            <div className="flex items-center gap-2 min-w-0">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#D2C4B7] dark:border-[#382A20]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/categories/salads.jpg';
                  }}
                />
              )}
              <div className="min-w-0">
                <h5 className="font-bold text-xs text-[#1F1713] dark:text-white truncate">
                  {item.name}
                </h5>
                <span className="text-[10px] text-[#8A9684] dark:text-[#A3D4A8] font-bold block truncate">
                  {isEn && item.pairing_reason_en ? item.pairing_reason_en : item.pairing_reason}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    {item.discounted_price} {t('egp')}
                  </span>
                  <span className="text-[10px] text-stone-400 line-through">
                    {item.price}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAdd(item)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 flex items-center gap-1 ${
                justAdded[item.id]
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1F1713] dark:bg-amber-600 hover:bg-[#2B221D] text-white'
              }`}
            >
              {justAdded[item.id] ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isEn ? 'Added' : 'تم'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isEn ? 'Add' : 'أضف'}</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
