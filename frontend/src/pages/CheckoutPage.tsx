import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  ShoppingBag,
  Calendar,
  Clock,
  MapPin,
  Flame,
  ChefHat,
  PackageCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import { saveOrderToHistory } from '../services/ordersHistory';

// قائمة المناطق مع رسوم التوصيل بسيارة مجهزة لحفظ الصواني والطواجن
const DELIVERY_ZONES = [
  { id: 'maadi', name: 'المعادي وطرة وزهراء المعادي', fee: 35 },
  { id: 'tagamoa', name: 'التجمع الخامس والتجمع الأول', fee: 45 },
  { id: 'rehab_madinaty', name: 'الرحاب ومدينتي والشروق', fee: 55 },
  { id: 'nasr_heliopolis', name: 'مدينة نصر ومصر الجديدة', fee: 40 },
  { id: 'dokki_mohandessin', name: 'الدقي والمهندسين والزمالك', fee: 40 },
  { id: 'zayed_october', name: 'الشيخ زايد ومدينة 6 أكتوبر', fee: 55 },
  { id: 'mokattam', name: 'المقطم والهضبة الوسطى', fee: 35 },
  { id: 'haram_giza', name: 'الهرم وفيصل والجيزة', fee: 40 },
  { id: 'other', name: 'منطقة أخرى بالقاهرة الكبرى', fee: 45 },
];

export default function CheckoutPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMethod = (searchParams.get('method') as 'instapay' | 'vodafone' | 'card' | 'cod') || 'card';
  const [selectedMethod, setSelectedMethod] = useState<'instapay' | 'vodafone' | 'card' | 'cod'>(initialMethod);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { cart, subtotal: cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();

  // بيانات العميل
  const [customerName, setCustomerName] = useState(user?.name || 'أحمد محمود');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '01012345678');
  const [selectedZone, setSelectedZone] = useState<string>(DELIVERY_ZONES[0].id);
  const [customerAddress, setCustomerAddress] = useState('شارع النصر، عمارة 14، الدور الرابع، شقة 8');

  // موعد ودورة الغداء البيتي
  const [deliveryDateType, setDeliveryDateType] = useState<'tomorrow' | 'today' | 'custom'>('tomorrow');
  const [customDate, setCustomDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState<string>('batch_1');
  const [customTimeText, setCustomTimeText] = useState('3:30 عصراً مع رجوع الأولاد من المدرسة');

  // خيارات العناية البيتية والتغليف
  const [isInsulatedPack, setIsInsulatedPack] = useState(true);
  const [dietaryNotes, setDietaryNotes] = useState<string[]>(['ملح خفيف جداً']);
  const [customNotes, setCustomNotes] = useState('');
  const [transferRef, setTransferRef] = useState('');

  // حالات الإرسال والنجاح
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  useEffect(() => {
    const m = searchParams.get('method');
    if (m && ['card', 'instapay', 'vodafone', 'cod'].includes(m)) {
      setSelectedMethod(m as any);
    }
  }, [searchParams]);

  const handleSelectMethod = (m: 'instapay' | 'vodafone' | 'card' | 'cod') => {
    setSelectedMethod(m);
    setSearchParams({ method: m });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // عناصر السلة الحقيقية، وإذا كانت فارغة نوفر أطباق افتراضية للتجربة
  const cartItemsList = Object.values(cart);
  const hasCartItems = cartItemsList.length > 0;

  const currentZoneObj = DELIVERY_ZONES.find((z) => z.id === selectedZone) || DELIVERY_ZONES[0];
  const deliveryFee = currentZoneObj.fee;
  const insulatedPackFee = isInsulatedPack ? 25 : 0;

  const subtotal = hasCartItems 
    ? cartSubtotal 
    : 520; // fallback if empty for preview

  const total = subtotal + deliveryFee + insulatedPackFee;

  const toggleDietaryNote = (note: string) => {
    setDietaryNotes((prev) => 
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  // دورة التسليم بالنص الواضح
  const getDeliverySlotLabel = () => {
    if (deliverySlot === 'batch_1') return 'دورة غداء أولى: 1:30 ظهراً إلى 3:00 عصراً (مع رجوع الأولاد من المدارس)';
    if (deliverySlot === 'batch_2') return 'دورة غداء ثانية: 3:30 عصراً إلى 5:30 مساءً (مع عودة الموظفين من الشغل)';
    if (deliverySlot === 'batch_evening') return 'دورة العشاء والعزومات: 6:30 مساءً إلى 8:30 مساءً';
    return customTimeText || 'موعد مخصص حسب طلب العميل';
  };

  const getDeliveryDateLabel = () => {
    if (deliveryDateType === 'today') return 'اليوم (طازج خلال ساعات العمل)';
    if (deliveryDateType === 'tomorrow') return 'غداً (حجز مسبق ومفضل للغداء البيتي)';
    return customDate || 'تاريخ مخصص محدد';
  };

  const handleConfirmOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert('يرجى استكمال بيانات الاسم، الهاتف، والعنوان بالتفصيل');
      return;
    }

    setIsSubmitting(true);

    const itemsPayload = hasCartItems
      ? cartItemsList.map((c) => ({
          name: c.item.name,
          quantity: c.quantity,
          price: c.unitPrice || c.item.price,
          total: (c.unitPrice || c.item.price) * c.quantity,
          size: c.size || 'عادي',
          stuffing: c.stuffing,
          addons: c.addons,
          special_instructions: c.specialInstructions,
        }))
      : [
          { name: 'طاجن عكاوي بلدي مع بصل مكرمل', quantity: 1, price: 340, total: 340, size: 'عائلي' },
          { name: 'محشي مشكل فاخر بالسمن البلدي', quantity: 1, price: 180, total: 180, size: 'طبق كبير' }
        ];

    const allDietaryText = [
      dietaryNotes.join(' - '),
      customNotes.trim()
    ].filter(Boolean).join(' | ');

    const payload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: `${currentZoneObj.name} - ${customerAddress}`,
      delivery_date: getDeliveryDateLabel(),
      delivery_slot: getDeliverySlotLabel(),
      delivery_zone: currentZoneObj.name,
      is_insulated_pack: isInsulatedPack,
      notes: customNotes,
      dietary_notes: allDietaryText,
      payment_method: selectedMethod,
      transfer_ref: transferRef || (selectedMethod === 'card' ? 'CARD-MOCK-OK' : undefined),
      subtotal,
      delivery_fee: deliveryFee + insulatedPackFee,
      total_price: total,
      items: itemsPayload,
    };

    try {
      const res = await createOrder(payload);
      const orderId = res?.data?.orderId || `LQ-${Math.floor(1000 + Math.random() * 9000)}`;

      // حفظ في السجل المحلي للعميل
      saveOrderToHistory({
        orderNumber: orderId,
        createdAt: new Date().toISOString(),
        customerName,
        customerPhone,
        customerAddress: payload.customer_address,
        deliveryDate: payload.delivery_date,
        deliverySlot: payload.delivery_slot,
        deliveryZone: payload.delivery_zone,
        isInsulatedPack,
        dietaryNotes: allDietaryText,
        paymentMethod: selectedMethod,
        paymentStatus: selectedMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'new',
        totalPrice: total,
        subtotal,
        deliveryFee: deliveryFee + insulatedPackFee,
        items: itemsPayload,
      });

      setCompletedOrder({
        orderId,
        total,
        paymentMethod: selectedMethod,
        deliveryDate: payload.delivery_date,
        deliverySlot: payload.delivery_slot,
        customerName,
        customerPhone,
      });

      if (hasCartItems) {
        clearCart();
      }
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // شاشة نجاح الطلب
  if (completedOrder) {
    const waPhone = '201065272373';
    const waText = encodeURIComponent(
      `أهلاً بمطبخ لقمة البيتي 🌸\nأنا سجلت أوردر رقم: ${completedOrder.orderId}\nالاسم: ${completedOrder.customerName}\nالمبلغ: ${completedOrder.total} ج.م\nالموعد: ${completedOrder.deliveryDate} - ${completedOrder.deliverySlot}`
    );

    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#120E0C] text-[#3D312A] dark:text-[#F7F4EF] py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#1C1612] rounded-3xl p-8 border-2 border-[#8A9684]/30 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200">
              تم استلام طلب الغداء البيتي بنجاح!
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#3D312A] dark:text-white mt-3">
              تسلم إيدك يا {completedOrder.customerName}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              طلبك وصل المطبخ الآن وجاري تجهيزه طازة ومتحمر بأفضل جودة ونظافة.
            </p>
          </div>

          <div className="bg-[#FAF8F5] dark:bg-[#251D18] p-5 rounded-2xl border border-[#E5DFD5] dark:border-[#382A20] text-start space-y-2.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-stone-800">
              <span className="text-stone-500 font-bold">رقم الأوردر:</span>
              <span className="font-mono text-base font-black text-[#26472A] dark:text-emerald-400">
                {completedOrder.orderId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-bold">موعد استلام الغداء:</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{completedOrder.deliverySlot}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-bold">تاريخ التوصيل:</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{completedOrder.deliveryDate}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-200 dark:border-stone-800">
              <span className="text-stone-500 font-bold">الإجمالي المطلوب:</span>
              <span className="font-black text-sm text-[#26472A] dark:text-amber-400">{completedOrder.total} ج.م</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`https://wa.me/${waPhone}?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>متابعة تفاصيل الغداء عبر واتساب</span>
            </a>

            <Link
              to="/profile"
              className="py-3 px-5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#251D18] hover:bg-stone-50 text-xs font-bold text-stone-700 dark:text-stone-200 flex items-center justify-center gap-1.5"
            >
              <span>مشاهدة في حسابي</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#120E0C] text-[#3D312A] dark:text-[#F7F4EF] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8 text-center sm:text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] text-xs font-bold mb-2">
            <ChefHat className="w-4 h-4" />
            <span>نظام أكل بيتي مصري أصيل • حجز وتوصيل طازج</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#3D312A] dark:text-white">
            إتمام طلب الغداء البيتي
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            حدّد موعد الغداء، نَفَس الطبخة وعنوانك لنجهز سفرتك ساخنة في ميعادها
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* العمود الأيمن: وسائل الدفع وبيانات التوصيل */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. بيانات وتفاصيل التوصيل */}
            <div className="bg-white dark:bg-[#1C1612] rounded-2xl p-6 border border-[#E5DFD5] dark:border-[#382A20] shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#3D312A] dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#26472A] text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>بيانات المستلم والمنطقة</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">الاسم بالكامل</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-sm focus:outline-none focus:border-[#26472A]"
                    placeholder="اسم المستلم"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">رقم الهاتف (واتساب)</label>
                  <input 
                    type="tel" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-sm focus:outline-none focus:border-[#26472A]"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              </div>

              {/* اختيار المنطقة والحي لتحديد التوصيل بسيارة مجهزة */}
              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#26472A]" />
                    <span>المنطقة والحي (توصيل سيارة لحفظ الصواني):</span>
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                    الرسوم: {deliveryFee} ج.م
                  </span>
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-sm font-bold focus:outline-none focus:border-[#26472A] cursor-pointer"
                >
                  {DELIVERY_ZONES.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — ({zone.fee} ج.م توصيل مجهز)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">العنوان بالتفصيل (الشارع، العمارة، رقم الشقة)</label>
                <input 
                  type="text" 
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-sm focus:outline-none focus:border-[#26472A]"
                  placeholder="شارع كذا، عمارة كذا، الدور والشقة"
                />
              </div>
            </div>

            {/* 2. تاريخ ودورة موعد استلام الغداء (ميزة الأكل البيتي الأساسية) */}
            <div className="bg-white dark:bg-[#1C1612] rounded-2xl p-6 border-2 border-[#8A9684]/40 dark:border-[#382A20] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#3D312A] dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8A9684] text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>تاريخ ودورة موعد وصول الغداء</span>
                </h2>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md">
                  طهي طازة في الميعاد
                </span>
              </div>

              {/* اختيار اليوم */}
              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8A9684]" />
                  <span>تاريخ التسليم المطلوب:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryDateType('tomorrow')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      deliveryDateType === 'tomorrow'
                        ? 'border-[#26472A] bg-[#26472A] text-white shadow-xs'
                        : 'border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>غداً (مستحسن للأكل البيتي ⭐)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryDateType('today')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      deliveryDateType === 'today'
                        ? 'border-[#26472A] bg-[#26472A] text-white shadow-xs'
                        : 'border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>اليوم (طازج فوري)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryDateType('custom')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      deliveryDateType === 'custom'
                        ? 'border-[#26472A] bg-[#26472A] text-white shadow-xs'
                        : 'border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>تاريخ مخصص</span>
                  </button>
                </div>

                {deliveryDateType === 'custom' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-xs focus:outline-none"
                  />
                )}
              </div>

              {/* اختيار دورة وموعد الغداء */}
              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8A9684]" />
                  <span>دورة خروج طعام الغداء من المطبخ:</span>
                </label>
                <div className="space-y-2">
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    deliverySlot === 'batch_1'
                      ? 'border-[#26472A] bg-[#26472A]/5 dark:bg-[#26472A]/20'
                      : 'border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18]'
                  }`}>
                    <input 
                      type="radio" 
                      name="delivery_slot" 
                      checked={deliverySlot === 'batch_1'}
                      onChange={() => setDeliverySlot('batch_1')}
                      className="mt-0.5 text-[#26472A]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#3D312A] dark:text-white block">
                        دورة غداء أولى: من 1:30 ظهراً إلى 3:00 عصراً 🏫
                      </span>
                      <span className="text-[11px] text-stone-500">
                        الأنسب للمنازل وتزامن رجوع الأولاد من المدارس، يوصل الأكل بيغلي.
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    deliverySlot === 'batch_2'
                      ? 'border-[#26472A] bg-[#26472A]/5 dark:bg-[#26472A]/20'
                      : 'border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18]'
                  }`}>
                    <input 
                      type="radio" 
                      name="delivery_slot" 
                      checked={deliverySlot === 'batch_2'}
                      onChange={() => setDeliverySlot('batch_2')}
                      className="mt-0.5 text-[#26472A]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#3D312A] dark:text-white block">
                        دورة غداء ثانية: من 3:30 عصراً إلى 5:30 مساءً 💼
                      </span>
                      <span className="text-[11px] text-stone-500">
                        الأنسب للموظفين والأمهات العاملات مع عودة المنزل، جاهز ع السفرة فوراً.
                      </span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    deliverySlot === 'batch_evening'
                      ? 'border-[#26472A] bg-[#26472A]/5 dark:bg-[#26472A]/20'
                      : 'border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18]'
                  }`}>
                    <input 
                      type="radio" 
                      name="delivery_slot" 
                      checked={deliverySlot === 'batch_evening'}
                      onChange={() => setDeliverySlot('batch_evening')}
                      className="mt-0.5 text-[#26472A]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#3D312A] dark:text-white block">
                        دورة العشاء والعزومات: من 6:30 مساءً إلى 8:30 مساءً 🌙
                      </span>
                      <span className="text-[11px] text-stone-500">
                        مخصصة لسهرات العائلة والتجمعات المسائية.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* موعد دقيق إضافي */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                  تحديد وقت تقريبي مفضل بدقة (مثال: "عايز الغداء يوصل الساعة 3:30 عصراً بالضبط"):
                </label>
                <input 
                  type="text" 
                  value={customTimeText}
                  onChange={(e) => setCustomTimeText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-xs focus:outline-none"
                  placeholder="مثال: يوصل 3:30 عصراً مع رجوع الأولاد"
                />
              </div>
            </div>

            {/* 3. العناية البيتية والتغليف الحراري ونَفَس الطبخة */}
            <div className="bg-white dark:bg-[#1C1612] rounded-2xl p-6 border border-[#E5DFD5] dark:border-[#382A20] shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#3D312A] dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#8A9684] text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>رعاية المطبخ البيتي ونَفَس الأكل</span>
              </h2>

              {/* خيار السرافيس العازلة للحرارة */}
              <div 
                onClick={() => setIsInsulatedPack(!isInsulatedPack)}
                className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                  isInsulatedPack
                    ? 'border-[#26472A] bg-[#26472A]/5 dark:bg-[#26472A]/20'
                    : 'border-[#E5DFD5] dark:border-[#382A20] bg-stone-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    isInsulatedPack ? 'bg-[#26472A] border-[#26472A] text-white' : 'border-stone-400'
                  }`}>
                    {isInsulatedPack && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      <span>تغليف في سرافيس وحافظات عازلة للحرارة للتقديم المباشر (+25 ج.م)</span>
                    </span>
                    <span className="text-[11px] text-stone-500">
                      تصلك الصواني في أوعية حرارية محكمة توضع على السفرة فوراً وتحتفظ بحرارتها لساعات.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#26472A] dark:text-amber-400 shrink-0">
                  +25 ج.م
                </span>
              </div>

              {/* نَفَس الطبخة والدايت للطلب كاملاً */}
              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">
                  تفضيلات صحية ونَفَس الأكل (تطبق على طهي الوجبات):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'ملح خفيف جداً (ضغط)',
                    'سمن بلدي خفيف / دهون قليلة',
                    'بدون شطة نهائياً (للأولاد)',
                    'تحمير دهبي مقرمش بالفرن',
                    'شوربة فريش دسم خفيف'
                  ].map((chip) => {
                    const isSelected = dietaryNotes.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleDietaryNote(chip)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#2D4F35] bg-[#2D4F35] text-white'
                            : 'border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">
                  ملاحظات إضافية للمطبخ:
                </label>
                <input 
                  type="text" 
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-xs focus:outline-none"
                  placeholder="أي طلب خاص للشيف أو تنبيه حساسية طعام..."
                />
              </div>
            </div>

            {/* 4. وسائل الدفع */}
            <div className="bg-white dark:bg-[#1C1612] rounded-2xl p-6 border border-[#E5DFD5] dark:border-[#382A20] shadow-sm">
              <h2 className="text-base font-bold text-[#3D312A] dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#26472A] text-white text-xs flex items-center justify-center font-bold">4</span>
                <span>اختر طريقة الدفع</span>
              </h2>

              {/* أزرار اختيار الوسيلة */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                <button
                  type="button"
                  onClick={() => handleSelectMethod('card')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    selectedMethod === 'card'
                      ? 'border-[#26472A] bg-[#26472A]/5 dark:bg-[#26472A]/20 ring-2 ring-[#26472A]'
                      : 'border-[#E5DFD5] dark:border-[#382A20] hover:bg-stone-50 dark:hover:bg-[#241C16]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#26472A] dark:text-amber-400" />
                  <span className="text-xs font-bold">بطاقة بنكية</span>
                  <span className="text-[10px] text-stone-500">فيزا / ماستركارد</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMethod('instapay')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    selectedMethod === 'instapay'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-600'
                      : 'border-[#E5DFD5] dark:border-[#382A20] hover:bg-stone-50 dark:hover:bg-[#241C16]'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-bold">InstaPay</span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold">تحويل فوري</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMethod('vodafone')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    selectedMethod === 'vodafone'
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-600'
                      : 'border-[#E5DFD5] dark:border-[#382A20] hover:bg-stone-50 dark:hover:bg-[#241C16]'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-red-600" />
                  <span className="text-xs font-bold">محفظة إلكترونية</span>
                  <span className="text-[10px] text-stone-500">فودافون كاش</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectMethod('cod')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    selectedMethod === 'cod'
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/30 ring-2 ring-amber-600'
                      : 'border-[#E5DFD5] dark:border-[#382A20] hover:bg-stone-50 dark:hover:bg-[#241C16]'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-bold">عند الاستلام</span>
                  <span className="text-[10px] text-stone-500">كاش للمندوب</span>
                </button>
              </div>

              {/* تفاصيل البطاقة البنكية */}
              {selectedMethod === 'card' && (
                <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#251D18] border border-[#E5DFD5] dark:border-[#382A20] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">الدفع بالفيزا / ماستركارد</span>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      تشفير بنكي آمن
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    سيتم خصم مبلغ الطلب وتأكيد موعد الغداء فورياً ليدخل جدول الطهي بالمطبخ.
                  </p>
                </div>
              )}

              {/* إنستاباي */}
              {selectedMethod === 'instapay' && (
                <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300">التحويل الفوري عبر تطبيق InstaPay</span>
                    <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">0% عمولة</span>
                  </div>
                  <div className="bg-white dark:bg-[#1C1612] p-3 rounded-lg border border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-stone-500">عنوان الدفع اللحظي (IPA)</span>
                      <span className="text-sm font-bold font-mono text-purple-700 dark:text-purple-400">loqma@instapay</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('loqma@instapay', 'ipa')}
                      className="px-3 py-1.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1 hover:bg-purple-200 transition-colors cursor-pointer"
                    >
                      {copiedField === 'ipa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'ipa' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={transferRef}
                    onChange={(e) => setTransferRef(e.target.value)}
                    placeholder="اسم المحوّل أو رقم المرجع بالتحويل..."
                    className="w-full px-3.5 py-2 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-white dark:bg-[#1C1612] text-xs focus:outline-none"
                  />
                </div>
              )}

              {/* فودافون كاش */}
              {selectedMethod === 'vodafone' && (
                <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-900 dark:text-red-300">التحويل على محفظة فودافون كاش</span>
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">فوري</span>
                  </div>
                  <div className="bg-white dark:bg-[#1C1612] p-3 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-stone-500">رقم محفظة لقمة للتحويل</span>
                      <span className="text-sm font-bold font-mono text-red-700 dark:text-red-400">01098765432</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01098765432', 'voda')}
                      className="px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-1 hover:bg-red-200 transition-colors cursor-pointer"
                    >
                      {copiedField === 'voda' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'voda' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* كاش عند الاستلام */}
              {selectedMethod === 'cod' && (
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-amber-700" />
                    <span>الدفع نقداً عند استلام الوجبة ساخنة على باب منزلك:</span>
                  </p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300">
                    يمكنك الدفع كاش لمندوب التوصيل المخصص عند استلام الصواني والطواجن في ميعاد الغداء المحدد.
                  </p>
                </div>
              )}

              {/* زر تأكيد وإرسال الطلب النهائي */}
              <button 
                type="button"
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="w-full mt-6 py-4 px-6 rounded-xl bg-[#26472A] hover:bg-[#1F3922] disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-[#26472A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>جاري تسجيل الطلب وإخطار المطبخ...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>تأكيد طلب الغداء البيتي ({total} ج.م)</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* العمود الأيسر: ملخص الطلب والفاتورة */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-[#1C1612] rounded-2xl p-6 border border-[#E5DFD5] dark:border-[#382A20] shadow-sm sticky top-24 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5] dark:border-[#382A20]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#26472A]" />
                  <h3 className="font-bold text-sm">
                    ملخص سفرة الغداء ({hasCartItems ? cartItemsList.length : 2} أصناف)
                  </h3>
                </div>
                <Link to="/menu" className="text-xs text-[#26472A] dark:text-amber-400 font-bold hover:underline">
                  تعديل المنيو
                </Link>
              </div>

              {/* عناصر الطلب */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {hasCartItems ? (
                  cartItemsList.map((c) => (
                    <div key={c.key} className="flex items-start gap-3 py-1">
                      <img 
                        src={c.item.image || '/images/dishes/ready_mahshi_tray.jpg'} 
                        alt={c.item.name} 
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 dark:border-stone-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#3D312A] dark:text-white truncate">{c.item.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                          <span>الكمية: {c.quantity}</span>
                          {c.size && <span>• الحجم: {c.size}</span>}
                        </div>
                        {c.specialInstructions && (
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 block truncate">
                            {c.specialInstructions}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 shrink-0">
                        {(c.unitPrice || c.item.price) * c.quantity} ج.م
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80" 
                        alt="طاجن عكاوي" 
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 dark:border-stone-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#3D312A] dark:text-white truncate">طاجن عكاوي بلدي مع بصل مكرمل</p>
                        <span className="text-[11px] text-stone-500">الكمية: 1 • حجم عائلي</span>
                      </div>
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">340 ج.م</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=300&q=80" 
                        alt="محشي مشكل" 
                        className="w-12 h-12 rounded-lg object-cover border border-stone-200 dark:border-stone-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#3D312A] dark:text-white truncate">محشي مشكل فاخر بالسمن البلدي</p>
                        <span className="text-[11px] text-stone-500">الكمية: 1 • صينية فرن</span>
                      </div>
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">180 ج.م</span>
                    </div>
                  </>
                )}
              </div>

              {/* حساب الفاتورة */}
              <div className="space-y-2 pt-3 border-t border-[#E5DFD5] dark:border-[#382A20] text-xs">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>المجموع الفرعي للأكلات</span>
                  <span>{subtotal} ج.م</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>توصيل مجهز بالسيارة ({currentZoneObj.name.split(' ')[0]})</span>
                  <span>{deliveryFee} ج.م</span>
                </div>
                {isInsulatedPack && (
                  <div className="flex justify-between text-amber-700 dark:text-amber-400 font-bold">
                    <span>سرافيس وحافظات حرارية للتقديم</span>
                    <span>+25 ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>مكونات وسمن بلدي 100%</span>
                  <span className="text-emerald-600 font-bold">مضمونة ✅</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#3D312A] dark:text-white pt-3 border-t border-dashed border-[#E5DFD5] dark:border-[#382A20]">
                  <span>الإجمالي الكلي</span>
                  <span className="text-[#26472A] dark:text-amber-400 text-base">{total} ج.م</span>
                </div>
              </div>

              {/* مواعيد التسليم المختارة */}
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>موعد التسليم المقرر:</span>
                </div>
                <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-snug">
                  {getDeliveryDateLabel()} — {getDeliverySlotLabel()}
                </p>
              </div>

              {/* شارات الأمان */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#251D18] border border-[#E5DFD5] dark:border-[#382A20] text-[11px] text-stone-500 flex items-center justify-around text-center">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>نظافة معتمدة</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>تسوية طازة</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
