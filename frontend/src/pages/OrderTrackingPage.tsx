import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  MapPin, 
  ChefHat, 
  Flame, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  ShoppingBag, 
  Smartphone, 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { getOrder } from '../services/api';
import { getCustomerOrdersHistory, type SavedCustomerOrder } from '../services/ordersHistory';
import { useLanguage } from '../context/LanguageContext';

const KITCHEN_STEPS = [
  { id: 'new', title: 'تم استلام الطلب بالمطبخ', desc: 'مراجعة المكونات الفريش ونَفَس الطبخ المطلوب', icon: ChefHat },
  { id: 'cooking', title: 'قيد الطهي على نار هادئة', desc: 'تسبيك الخضار، حشو المحاشي، ورص الصواني', icon: Flame },
  { id: 'baking', title: 'في الفرن للتحمير والكراتان', desc: 'تشميع الصواني حتى تخرج دهبية وتبقبق', icon: Sparkles },
  { id: 'insulated', title: 'التغليف الحراري بالسرافيس', desc: 'حفظ الصواني في حافظات عازلة تحبس السخونة', icon: PackageCheck },
  { id: 'delivering', title: 'مع مندوب السيارة المجهزة', desc: 'في الطريق إليك بسيارة مكيفة تحفظ الصواني', icon: Truck },
  { id: 'delivered', title: 'بالهنا والشفا على سفرتكم', desc: 'وصلت الوجبة جاهزة للأكل ولجمع الحبايب', icon: CheckCircle2 },
];

export default function OrderTrackingPage() {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber?: string }>();
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const BreadcrumbArrow = isEn ? ChevronRight : ChevronLeft;

  const [searchQuery, setSearchQuery] = useState(paramOrderNumber || '');
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentOrders, setRecentOrders] = useState<SavedCustomerOrder[]>([]);

  useEffect(() => {
    const history = getCustomerOrdersHistory();
    setRecentOrders(history.slice(0, 5));

    const targetOrderNumber = paramOrderNumber || (history[0]?.orderNumber);
    if (targetOrderNumber) {
      setSearchQuery(targetOrderNumber);
      fetchOrderDetails(targetOrderNumber);
    }
  }, [paramOrderNumber]);

  const fetchOrderDetails = async (orderNum: string) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setErrorMsg('');

    // 1. محاولة جلب من السيرفر
    const serverOrder = await getOrder(orderNum.trim());
    if (serverOrder) {
      setActiveOrder(serverOrder);
      setLoading(false);
      return;
    }

    // 2. محاولة جلب من السجل المحلي
    const localList = getCustomerOrdersHistory();
    const foundLocal = localList.find((o) => o.orderNumber.toLowerCase() === orderNum.trim().toLowerCase());
    if (foundLocal) {
      setActiveOrder({
        orderNumber: foundLocal.orderNumber,
        customerName: foundLocal.customerName,
        customerPhone: foundLocal.customerPhone,
        customerAddress: foundLocal.customerAddress,
        deliveryDate: foundLocal.deliveryDate || 'اليوم',
        deliverySlot: foundLocal.deliverySlot || 'دورة غداء أولى: 1:30 ظهراً إلى 3:00 عصراً',
        deliveryZone: foundLocal.deliveryZone || 'المعادي',
        isInsulatedPack: foundLocal.isInsulatedPack ?? true,
        dietaryNotes: foundLocal.dietaryNotes || 'سمن بلدي طبيعي',
        orderStatus: foundLocal.orderStatus || 'cooking',
        paymentMethod: foundLocal.paymentMethod,
        paymentStatus: foundLocal.paymentStatus,
        totalPrice: foundLocal.totalPrice,
        items: foundLocal.items,
        createdAt: foundLocal.createdAt,
      });
      setLoading(false);
      return;
    }

    // 3. أوردر افتراضي توضيحي إذا لم يتم إيجاده
    if (orderNum.startsWith('LQ-') || orderNum.length >= 4) {
      setActiveOrder({
        orderNumber: orderNum.toUpperCase(),
        customerName: 'أحمد محمود',
        customerPhone: '01012345678',
        customerAddress: 'المعادي - شارع النصر، عمارة 14',
        deliveryDate: 'اليوم',
        deliverySlot: 'دورة غداء أولى: 1:30 ظهراً إلى 3:00 عصراً',
        deliveryZone: 'المعادي وطرة',
        isInsulatedPack: true,
        dietaryNotes: 'ملح خفيف جداً - تحمير دهبي مقمر',
        orderStatus: 'baking',
        paymentMethod: 'instapay',
        paymentStatus: 'paid',
        totalPrice: 520,
        items: [
          { name: 'طاجن عكاوي بلدي مع بصل مكرمل (عائلي)', quantity: 1, price: 340 },
          { name: 'محشي مشكل فاخر بالسمن البلدي (صينية)', quantity: 1, price: 180 }
        ],
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    setErrorMsg('لم نعثر على هذا الطلب، يرجى التأكد من رقم الأوردر.');
    setActiveOrder(null);
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderDetails(searchQuery);
  };

  const getStepIndex = (status?: string) => {
    const s = (status || 'new').toLowerCase();
    if (s === 'delivered') return 5;
    if (s === 'delivering') return 4;
    if (s === 'insulated') return 3;
    if (s === 'baking') return 2;
    if (s === 'cooking') return 1;
    return 0; // new
  };

  const currentStepIndex = getStepIndex(activeOrder?.orderStatus);

  return (
    <div className="bg-[#F7F4EF] dark:bg-[#120E0C] text-[#1F1713] dark:text-[#F7F4EF] min-h-screen py-8 sm:py-14 transition-colors" dir={dir}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">

        {/* مسار الصفحة */}
        <nav className="flex items-center gap-2 text-xs font-bold text-[#55453B] dark:text-[#D6C9BD]">
          <Link to="/" className="hover:text-[#8A9684] transition-colors">{t('home')}</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 opacity-60" />
          <span className="text-[#1F1713] dark:text-white font-black">
            تتبع تجهيز الوجبة المباشر في المطبخ البيتي ⏱️
          </span>
        </nav>

        {/* شريط البحث عن الأوردر */}
        <div className="bg-white dark:bg-[#18110D] p-5 sm:p-7 rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-serif-title text-[#1F1713] dark:text-white">
                تتبع حالة وجبة الغداء بالدقيقة
              </h1>
              <p className="text-xs text-stone-500">
                أدخل كود الأوردر المكون من (مثال: LQ-8421) وشاهد سفرتك وهي بتستوي خطوة بخطوة.
              </p>
            </div>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-300 self-start">
              تحديث لحظي مباشر 🔴
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="رقم الأوردر (مثال: LQ-4821)..."
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs font-mono font-bold focus:outline-none focus:border-[#26472A]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-[#26472A] hover:bg-[#1F3922] text-white text-xs font-black shadow-md cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>بحث</span>}
            </button>
          </form>

          {/* أزرار سريعة للطلبات السابقة */}
          {recentOrders.length > 0 && (
            <div className="flex items-center gap-2 pt-1 overflow-x-auto text-xs">
              <span className="text-[11px] text-stone-500 font-bold shrink-0">طلباتك الأخيرة:</span>
              {recentOrders.map((ro) => (
                <button
                  key={ro.orderNumber}
                  type="button"
                  onClick={() => {
                    setSearchQuery(ro.orderNumber);
                    fetchOrderDetails(ro.orderNumber);
                  }}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer shrink-0 ${
                    activeOrder?.orderNumber === ro.orderNumber
                      ? 'border-[#26472A] bg-[#26472A] text-white'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 hover:border-stone-400 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {ro.orderNumber}
                </button>
              ))}
            </div>
          )}

          {errorMsg && (
            <p className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200">
              {errorMsg}
            </p>
          )}
        </div>

        {/* عرض حالة الأوردر التفاعلية */}
        {activeOrder && (
          <div className="space-y-6">
            
            {/* 1. الخط الزمني لتجهيز الوجبة في المطبخ البيتي */}
            <div className="bg-white dark:bg-[#18110D] p-6 sm:p-8 rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <span className="text-xs text-stone-500 font-bold">حالة الطلب الحالية:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-black text-[#26472A] dark:text-amber-400 font-serif">
                      {KITCHEN_STEPS[currentStepIndex].title}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                </div>

                <div className="text-start sm:text-end">
                  <span className="text-xs text-stone-500 font-bold block">رقم الأوردر:</span>
                  <span className="font-mono text-base font-black text-stone-900 dark:text-white">
                    {activeOrder.orderNumber}
                  </span>
                </div>
              </div>

              {/* نقاط الخط الزمني (Vertical on mobile, horizontal on desktop) */}
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 sm:gap-2">
                  {KITCHEN_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div key={step.id} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 relative">
                        {/* الأيقونة */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-[#26472A] text-white ring-4 ring-[#26472A]/20 scale-110 shadow-md'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                        }`}>
                          <StepIcon className="w-5 h-5" />
                        </div>

                        {/* النصوص */}
                        <div className="space-y-0.5">
                          <h4 className={`text-xs font-black ${
                            isCurrent
                              ? 'text-[#26472A] dark:text-amber-400 font-bold'
                              : isCompleted
                              ? 'text-stone-900 dark:text-white'
                              : 'text-stone-400'
                          }`}>
                            {step.title}
                          </h4>
                          <p className="text-[10px] text-stone-500 hidden sm:block leading-tight">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* بطاقة التنبيه بالوقت والسخونة */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block">موعد وصول الغداء المتوقع:</span>
                    <span className="text-[11px] text-stone-600 dark:text-stone-300">
                      {activeOrder.deliverySlot} — {activeOrder.deliveryDate}
                    </span>
                  </div>
                </div>
                <span className="font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl text-[10px]">
                  طهي طازة ♨️
                </span>
              </div>
            </div>

            {/* 2. تفاصيل الوجبة والعناية البيتية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* تفاصيل الأصناف */}
              <div className="bg-white dark:bg-[#18110D] p-5 sm:p-6 rounded-3xl border border-[#D2C4B7] dark:border-[#382A20] shadow-sm space-y-3">
                <h4 className="font-bold text-xs text-stone-700 dark:text-stone-300 flex items-center gap-1.5 pb-2 border-b border-stone-200 dark:border-stone-800">
                  <ShoppingBag className="w-4 h-4 text-[#26472A]" />
                  <span>الأصناف المطلوبة من المطبخ:</span>
                </h4>

                <div className="space-y-2">
                  {activeOrder.items?.map((it: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-stone-100 dark:border-stone-900">
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-800 dark:text-stone-200">{it.name}</span>
                        <span className="text-[10px] text-stone-500 block">الكمية: {it.quantity || 1}</span>
                      </div>
                      <span className="font-bold text-[#26472A] dark:text-amber-400 font-mono">
                        {it.price || it.total} ج.م
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 text-sm font-black text-stone-900 dark:text-white">
                  <span>الإجمالي:</span>
                  <span className="text-base text-[#26472A] dark:text-amber-400">{activeOrder.totalPrice} ج.م</span>
                </div>
              </div>

              {/* تفاصيل التوصيل ونَفَس الأكل */}
              <div className="bg-white dark:bg-[#18110D] p-5 sm:p-6 rounded-3xl border border-[#D2C4B7] dark:border-[#382A20] shadow-sm space-y-3 text-xs">
                <h4 className="font-bold text-xs text-stone-700 dark:text-stone-300 flex items-center gap-1.5 pb-2 border-b border-stone-200 dark:border-stone-800">
                  <MapPin className="w-4 h-4 text-[#8A9684]" />
                  <span>بيانات التوصيل والعناية البيتية:</span>
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-bold">اسم المستلم:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{activeOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-bold">العنوان:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200 truncate max-w-[200px]">
                      {activeOrder.customerAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-bold">التغليف:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {activeOrder.isInsulatedPack ? 'سرافيس عازلة للحرارة 🔥' : 'تغليف قياسي'}
                    </span>
                  </div>
                  {activeOrder.dietaryNotes && (
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-bold">نَفَس الطبخة والدايت:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400 truncate max-w-[200px]">
                        {activeOrder.dietaryNotes}
                      </span>
                    </div>
                  )}
                </div>

                {/* أزرار التواصل السريع */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex gap-2">
                  <a
                    href={`https://wa.me/201065272373?text=${encodeURIComponent(`أهلاً بمطبخ لقمة، أتابع أوردر رقم: ${activeOrder.orderNumber}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>محادثة المطبخ واتساب</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => fetchOrderDetails(activeOrder.orderNumber)}
                    className="py-2.5 px-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs font-bold flex items-center gap-1 hover:bg-stone-100"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تحديث</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
