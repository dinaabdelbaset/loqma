import { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Flame, 
  Sparkles, 
  PackageCheck, 
  Clock, 
  MapPin, 
  RefreshCw, 
  Filter,
  Volume2,
  VolumeX,
  Layers
} from 'lucide-react';
import { getKitchenOrders, updateOrderStatus } from '../services/api';
import { getCustomerOrdersHistory } from '../services/ordersHistory';

interface KitchenOrder {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliverySlot?: string;
  deliveryDate?: string;
  isInsulatedPack?: boolean;
  dietaryNotes?: string;
  orderStatus: string;
  totalPrice: number;
  items: Array<{ name: string; quantity: number; size?: string }>;
  createdAt: string;
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeBatchFilter, setActiveBatchFilter] = useState<'all' | 'batch_1' | 'batch_2' | 'evening'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 20000); // تحديث كل 20 ثانية
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const serverOrders = await getKitchenOrders();
      if (Array.isArray(serverOrders) && serverOrders.length > 0) {
        setOrders(serverOrders);
      } else {
        // دمج مع الطلبات المحلية
        const local = getCustomerOrdersHistory();
        if (local.length > 0) {
          setOrders(local.map((l) => ({
            orderNumber: l.orderNumber,
            customerName: l.customerName,
            customerPhone: l.customerPhone,
            customerAddress: l.customerAddress,
            deliverySlot: l.deliverySlot || 'دورة غداء أولى: 1:30 ظهراً إلى 3:00 عصراً',
            deliveryDate: l.deliveryDate || 'اليوم',
            isInsulatedPack: l.isInsulatedPack ?? true,
            dietaryNotes: l.dietaryNotes || 'سمن بلدي طبيعي',
            orderStatus: l.orderStatus || 'new',
            totalPrice: l.totalPrice,
            items: l.items || [],
            createdAt: l.createdAt,
          })));
        } else {
          // بيانات تجريبية للمطبخ
          setOrders([
            {
              orderNumber: 'LQ-8201',
              customerName: 'مدام هالة فهمي',
              customerPhone: '01012345678',
              customerAddress: 'المعادي - شارع دجلة، عمارة 9',
              deliverySlot: 'دورة غداء أولى: 1:30 ظهراً إلى 3:00 عصراً',
              deliveryDate: 'اليوم',
              isInsulatedPack: true,
              dietaryNotes: 'ملح خفيف جداً - بدون شطة للأولاد',
              orderStatus: 'cooking',
              totalPrice: 580,
              items: [
                { name: 'صينية مكرونة بشاميل غنية باللحمة البلدي', quantity: 1, size: 'عائلي' },
                { name: 'طاجن ملوخية خضراء بمرقة البط البلدي', quantity: 1 }
              ],
              createdAt: new Date().toISOString()
            },
            {
              orderNumber: 'LQ-8202',
              customerName: 'م. خالد النجار',
              customerPhone: '01234567890',
              customerAddress: 'التجمع الخامس - الحي الثاني',
              deliverySlot: 'دورة غداء ثانية: 3:30 عصراً إلى 5:30 مساءً',
              deliveryDate: 'اليوم',
              isInsulatedPack: true,
              dietaryNotes: 'تحمير مقمر ومقرمش ع الوش',
              orderStatus: 'new',
              totalPrice: 420,
              items: [
                { name: 'صينية بطاطس بالفراخ البلدي المتبلة', quantity: 1 },
                { name: 'سرفيس أرز بالشعرية والسمن الفلاحي', quantity: 1 }
              ],
              createdAt: new Date().toISOString()
            },
            {
              orderNumber: 'LQ-8203',
              customerName: 'د. ياسمين صبري',
              customerPhone: '01198765432',
              customerAddress: 'الشيخ زايد - بيفرلي هيلز',
              deliverySlot: 'دورة غداء أولى: 1:30 ظهراً إلى 3:00 عصراً',
              deliveryDate: 'اليوم',
              isInsulatedPack: true,
              dietaryNotes: 'دايت - سمن خفيف قليل الدهون',
              orderStatus: 'baking',
              totalPrice: 380,
              items: [
                { name: 'صدور دجاج مشوية بالأعشاب وخضار سوتيه', quantity: 2 },
                { name: 'شوربة خضار مشكل بالدجاج البلدي', quantity: 1 }
              ],
              createdAt: new Date().toISOString()
            }
          ]);
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderNumber: string, nextStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderNumber === orderNumber ? { ...o, orderStatus: nextStatus } : o))
    );

    await updateOrderStatus(orderNumber, nextStatus);

    // صوت تنبيه اختياري
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch {
        // ignore
      }
    }
  };

  // ملخص إحصائيات المطبخ لحصر التجهيزات
  const totalBéchamel = orders.reduce((sum, o) => {
    return sum + o.items.filter((it) => it.name.includes('بشاميل')).reduce((s, it) => s + (it.quantity || 1), 0);
  }, 0);

  const totalMahshi = orders.reduce((sum, o) => {
    return sum + o.items.filter((it) => it.name.includes('محشي') || it.name.includes('عنب')).reduce((s, it) => s + (it.quantity || 1), 0);
  }, 0);

  const totalTajines = orders.reduce((sum, o) => {
    return sum + o.items.filter((it) => it.name.includes('طاجن') || it.name.includes('عكاوي')).reduce((s, it) => s + (it.quantity || 1), 0);
  }, 0);

  const totalDiet = orders.reduce((sum, o) => {
    return sum + o.items.filter((it) => it.name.includes('دايت') || it.name.includes('سوتيه') || it.name.includes('مشوي')).reduce((s, it) => s + (it.quantity || 1), 0);
  }, 0);

  // تصفية الطلبات حسب الدورات
  const filteredOrders = orders.filter((o) => {
    if (activeBatchFilter === 'all') return true;
    const slot = (o.deliverySlot || '').toLowerCase();
    if (activeBatchFilter === 'batch_1') return slot.includes('أولى') || slot.includes('1:30');
    if (activeBatchFilter === 'batch_2') return slot.includes('ثانية') || slot.includes('3:30');
    if (activeBatchFilter === 'evening') return slot.includes('عشاء') || slot.includes('6:30');
    return true;
  });

  return (
    <div className="bg-[#191411] text-[#F7F4EF] min-h-screen py-6 px-4 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* رأس شاشة المطبخ */}
        <div className="bg-[#241B16] p-4 sm:p-6 rounded-3xl border border-[#382A20] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-serif-title">
                  شاشة تشغيل المطبخ البيتي (Kitchen Display)
                </h1>
                <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse">
                  مباشر 🔴
                </span>
              </div>
              <p className="text-xs text-stone-400">
                تنظيم طهي صواني الغداء بحسب الدورات ومتابعة درجات التسوية ونَفَس الأكل المطلوب.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl border border-[#382A20] bg-[#1E1612] text-stone-300 hover:text-white"
              title={soundEnabled ? 'كتم التنبيه' : 'تشغيل التنبيه'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>
            <button
              type="button"
              onClick={loadOrders}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث الطلبات</span>
            </button>
          </div>
        </div>

        {/* حصر تجهيزات المطبخ لليوم (Preparation Summary Counters) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#241B16] p-4 rounded-2xl border border-amber-600/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 font-bold block">صواني بشاميل مطلوبة:</span>
              <span className="text-2xl font-black text-amber-400 font-serif">{totalBéchamel} صينية</span>
            </div>
            <Layers className="w-8 h-8 text-amber-500/40" />
          </div>

          <div className="bg-[#241B16] p-4 rounded-2xl border border-emerald-600/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 font-bold block">أصناف محاشي وورق عنب:</span>
              <span className="text-2xl font-black text-emerald-400 font-serif">{totalMahshi} حلة/صينية</span>
            </div>
            <Sparkles className="w-8 h-8 text-emerald-500/40" />
          </div>

          <div className="bg-[#241B16] p-4 rounded-2xl border border-red-600/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 font-bold block">طواجن فخار وعكاوي:</span>
              <span className="text-2xl font-black text-red-400 font-serif">{totalTajines} طاجن</span>
            </div>
            <Flame className="w-8 h-8 text-red-500/40" />
          </div>

          <div className="bg-[#241B16] p-4 rounded-2xl border border-blue-600/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 font-bold block">وجبات دايت وصحي:</span>
              <span className="text-2xl font-black text-blue-400 font-serif">{totalDiet} وجبة</span>
            </div>
            <PackageCheck className="w-8 h-8 text-blue-500/40" />
          </div>
        </div>

        {/* فلترة الطلبات حسب دورات الغداء */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#382A20] pb-3">
          <span className="text-xs text-stone-400 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>عرض حسب الدورة:</span>
          </span>
          <button
            type="button"
            onClick={() => setActiveBatchFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBatchFilter === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-[#241B16] text-stone-400 border border-[#382A20]'
            }`}
          >
            جميع الطلبات ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveBatchFilter('batch_1')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBatchFilter === 'batch_1'
                ? 'bg-amber-600 text-white'
                : 'bg-[#241B16] text-stone-400 border border-[#382A20]'
            }`}
          >
            🏫 دورة 1:30 ظهراً (المدارس والبيوت)
          </button>
          <button
            type="button"
            onClick={() => setActiveBatchFilter('batch_2')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBatchFilter === 'batch_2'
                ? 'bg-amber-600 text-white'
                : 'bg-[#241B16] text-stone-400 border border-[#382A20]'
            }`}
          >
            💼 دورة 3:30 عصراً (الموظفين)
          </button>
          <button
            type="button"
            onClick={() => setActiveBatchFilter('evening')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBatchFilter === 'evening'
                ? 'bg-amber-600 text-white'
                : 'bg-[#241B16] text-stone-400 border border-[#382A20]'
            }`}
          >
            🌙 دورة العشاء والمساء
          </button>
        </div>

        {/* شبكة كروت الطلبات للمطبخ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const status = order.orderStatus || 'new';

            return (
              <div
                key={order.orderNumber}
                className="bg-[#241B16] rounded-3xl border-2 border-[#382A20] p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-amber-600/60 transition-all"
              >
                {/* رأس كارت الطلب */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#382A20]">
                    <div>
                      <span className="font-mono text-base font-black text-amber-400">
                        #{order.orderNumber}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        {order.customerName}
                      </h3>
                    </div>
                    <span className="text-[11px] bg-black/50 text-stone-300 font-bold px-2.5 py-1 rounded-xl border border-stone-800">
                      {order.totalPrice} ج.م
                    </span>
                  </div>

                  {/* موعد وتاريخ التسليم */}
                  <div className="py-2.5 space-y-1.5 text-xs text-stone-300">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{order.deliverySlot}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{order.customerAddress}</span>
                    </div>
                  </div>

                  {/* تنبيه التغليف وسرافيس الحرارة */}
                  {order.isInsulatedPack && (
                    <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-600/40 text-[11px] text-emerald-300 font-bold flex items-center gap-1.5 my-2">
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>مطلوب سرافيس وحافظات عازلة لحفظ السخونة 🔥</span>
                    </div>
                  )}

                  {/* نَفَس الطبخة والدايت */}
                  {order.dietaryNotes && (
                    <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-600/40 text-[11px] text-amber-200 font-bold my-2">
                      <span>🌿 نَفَس الأكل: {order.dietaryNotes}</span>
                    </div>
                  )}

                  {/* تفاصيل الأصناف */}
                  <div className="pt-2 border-t border-[#382A20] space-y-1.5">
                    <span className="text-[11px] text-stone-400 font-bold block">الأطباق والصواني المطلوبة:</span>
                    {order.items.map((it, idx) => (
                      <div key={idx} className="bg-[#1C1511] p-2 rounded-xl flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{it.name}</span>
                        <span className="text-amber-400 font-black font-mono">× {it.quantity || 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* أزرار التحكم في حالة الطهي والتحمير */}
                <div className="pt-3 border-t border-[#382A20] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">الحالة الحالية:</span>
                    <span className="font-bold text-amber-400">
                      {status === 'cooking' && '🍲 قيد الطهي'}
                      {status === 'baking' && '🥮 في الفرن للتحمير'}
                      {status === 'insulated' && '♨️ تم التغليف الحراري'}
                      {status === 'delivering' && '🛵 مع مندوب السيارة'}
                      {status === 'delivered' && '✅ تم التسليم'}
                      {status === 'new' && '🆕 جديد'}
                    </span>
                  </div>

                  {/* أزرار التحويل المباشر */}
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.orderNumber, 'cooking')}
                      className={`p-2 rounded-xl transition-all ${
                        status === 'cooking'
                          ? 'bg-amber-600 text-white font-black'
                          : 'bg-[#1C1511] text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      🍲 بدء الطهي
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.orderNumber, 'baking')}
                      className={`p-2 rounded-xl transition-all ${
                        status === 'baking'
                          ? 'bg-amber-600 text-white font-black'
                          : 'bg-[#1C1511] text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      🥮 في الفرن
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.orderNumber, 'insulated')}
                      className={`p-2 rounded-xl transition-all ${
                        status === 'insulated'
                          ? 'bg-emerald-600 text-white font-black'
                          : 'bg-[#1C1511] text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      ♨️ تغليف حراري
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.orderNumber, 'delivering')}
                      className={`p-2 rounded-xl transition-all ${
                        status === 'delivering'
                          ? 'bg-blue-600 text-white font-black'
                          : 'bg-[#1C1511] text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      🛵 مع المندوب
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
