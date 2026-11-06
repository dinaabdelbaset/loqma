import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  ArrowRight,
  Sparkles, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Copy, 
  Check, 
  ShieldCheck, 
  CheckCircle2,
  MessageCircle,
  Camera,
  Shield,
  Lock,
  User
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createOrder, processCardPayment } from '../services/api';
import CreditCardPayment, { detectCardNetwork } from './CreditCardPayment';
import { saveOrderToHistory } from '../services/ordersHistory';
import SmartCrossSell from './SmartCrossSell';

type Step = 'cart' | 'delivery' | 'payment' | 'success';
type PaymentMethod = 'instapay' | 'vodafone' | 'card' | 'cod';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    deliveryFee,
    totalPrice,
  } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { language, dir, t, tDishName } = useLanguage();
  const isEn = language === 'en';
  const navigate = useNavigate();

  // فتح السلة تلقائياً لو قادم من تسجيل الدخول
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openCart') === 'true') {
      setIsCartOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setIsCartOpen]);

  // حساب عربون الـ 50% للطلبات الكاش
  const deposit50Amount = Math.round(totalPrice * 0.5);
  const remaining50Amount = Math.max(0, totalPrice - deposit50Amount);

  // بيانات العميل والتوصيل
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // ملء بيانات العميل تلقائياً عند تسجيل الدخول
  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.name && !name) setName(user.name);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [isLoggedIn, user]);

  // خطوة الشراء الحالية
  const [step, setStep] = useState<Step>('cart');

  // حماية صارمة: منع أي مستخدم غير مسجل من فتح خطوات التوصيل والدفع
  useEffect(() => {
    if (!isLoggedIn && (step === 'delivery' || step === 'payment')) {
      setStep('cart');
    }
  }, [isLoggedIn, step]);

  // نظام الدفع
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('instapay');
  const [transferRef, setTransferRef] = useState(''); // رقم التحويل أو رقم المحفظة
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // إيصال التحويل (إنستاباي / فودافون كاش / عربون الكاش)
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);

  // نظام حماية الأوردر الكاش بالعربون (Deposit Protection)
  const [depositOption, setDepositOption] = useState<'deposit_50' | 'full_cash'>('deposit_50');
  const [depositPaymentChoice, setDepositPaymentChoice] = useState<'instapay' | 'vodafone'>('instapay');

  // بيانات الدفع بالبطاقة البنكية
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // تفاصيل الأوردر المؤكد
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    dateStr: string;
    methodLabel: string;
    transferInfo: string;
    totalAmount: number;
    depositAmount?: number;
    remainingAmount?: number;
    hasReceipt?: boolean;
  } | null>(null);

  if (!isCartOpen) return null;

  const cartList = Object.values(cart);

  // نسخ النصوص بضغطة زر (رقم الهاتف أو المعرف)
  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // رفع سكرين شوت إيصال التحويل
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 8 ميجابايت.');
      return;
    }

    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => {
    setReceiptImage(null);
    setReceiptFileName(null);
  };

  // التحقق من بيانات التوصيل قبل الانتقال للدفع
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('يجب تسجيل الدخول أولاً لإتمام طلبك.');
      setIsCartOpen(false);
      navigate('/login?redirect=cart');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('من فضلك أكمل بيانات الاسم، الهاتف، والعنوان بالتفصيل للمتابعة.');
      return;
    }
    setStep('payment');
  };

  // إتمام الدفع وإرسال الإشعار لتليجرام المطعم وحفظ الأوردر في قاعدة البيانات (MySQL)
  const handleCompletePaymentAndOrder = async () => {
    if (!isLoggedIn) {
      alert('يجب تسجيل الدخول أولاً لإتمام وحفظ الأوردر.');
      setIsCartOpen(false);
      navigate('/login?redirect=cart');
      return;
    }
    // حساب مبالغ العربون والمتبقي
    let currentDeposit = 0;
    let currentRemaining = totalPrice;

    if (paymentMethod === 'card' || paymentMethod === 'instapay' || paymentMethod === 'vodafone') {
      currentDeposit = totalPrice;
      currentRemaining = 0;
    } else if (paymentMethod === 'cod') {
      if (depositOption === 'deposit_50') {
        currentDeposit = Math.round(totalPrice * 0.5);
        currentRemaining = totalPrice - currentDeposit;
      } else {
        currentDeposit = 0;
        currentRemaining = totalPrice;
      }
    }

    if (paymentMethod === 'instapay' || paymentMethod === 'vodafone') {
      if (!transferRef.trim() && !receiptImage) {
        alert('من فضلك ارفع سكرين شوت إيصال التحويل أو اكتب رقم المحفظة / اسم الحساب لتأكيد استلام المبلغ.');
        return;
      }
    } else if (paymentMethod === 'card') {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        alert('من فضلك أكمل بيانات البطاقة البنكية للدفع.');
        return;
      }
    } else if (paymentMethod === 'cod' && depositOption === 'deposit_50') {
      if (!transferRef.trim() && !receiptImage) {
        alert(`من فضلك ارفع سكرين شوت إيصال عربون الـ 50% (${Math.round(totalPrice * 0.5)} ج.م) أو اكتب رقم التحويل لضمان جدية الحجز.`);
        return;
      }
    }

    setIsProcessingPayment(true);

    try {
      // 1. تجهيز الوجبات والأطباق للإرسال للباك إند
      const formattedItems = cartList.map((c) => ({
        id: c.item.id,
        name: c.item.name,
        price: c.unitPrice,
        quantity: c.quantity,
        total: c.unitPrice * c.quantity,
        size: c.size,
        stuffing: c.stuffing,
        cooking_style: c.cookingStyle,
        addons: c.addons,
        special_instructions: c.specialInstructions,
      }));

      // 2. إرسال الأوردر لقاعدة بيانات السيرفر مع صورة الإيصال ومبالغ العربون
      const apiResponse = await createOrder({
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        notes: notes.trim() || undefined,
        payment_method: paymentMethod,
        transfer_ref: transferRef.trim() || (paymentMethod === 'card' ? `Card ${cardNumber.slice(-4)}` : undefined),
        receipt_image: receiptImage || undefined,
        deposit_amount: currentDeposit,
        remaining_amount: currentRemaining,
        subtotal,
        delivery_fee: deliveryFee,
        total_price: totalPrice,
        items: formattedItems,
      });

      const orderId = apiResponse?.data?.orderId || `LQ-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. معالجة الدفع الإلكتروني إذا تم اختيار البطاقة البنكية
      if (paymentMethod === 'card') {
        const brand = detectCardNetwork(cardNumber);
        await processCardPayment({
          amount: totalPrice,
          order_number: orderId,
          currency: 'EGP',
          payment_method: 'card',
          cardholder_name: cardName,
          card_brand: brand,
          card_last_four: cardNumber.replace(/\s/g, '').slice(-4),
        });
      }

      const now = new Date();
      const dateStr = now.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      let methodLabel = '';
      let transferInfo = '';

      if (paymentMethod === 'instapay') {
        methodLabel = 'إنستاباي (InstaPay) ⚡';
        transferInfo = `تم التحويل عبر إنستاباي - المرجع: (${transferRef || 'تم إرفاق إيصال التحويل'})`;
      } else if (paymentMethod === 'vodafone') {
        methodLabel = 'فودافون كاش / محفظة إلكترونية 📱';
        transferInfo = `تم التحويل إلى 01065272373 من: (${transferRef || 'تم إرفاق إيصال التحويل'})`;
      } else if (paymentMethod === 'card') {
        const brand = detectCardNetwork(cardNumber);
        const brandName = brand === 'visa' ? 'Visa' : brand === 'mastercard' ? 'Mastercard' : brand === 'meeza' ? 'ميزة Meeza' : 'بطاقة بنكية';
        methodLabel = `دفع بنكي مؤكد (${brandName}) 💳`;
        transferInfo = `مدفوع أونلاين بالبطاقة المنتهية بـ (••• ${cardNumber.slice(-4) || '7890'})`;
      } else {
        if (depositOption === 'deposit_50') {
          methodLabel = `كاش عند الاستلام (مع عربون 50% : ${currentDeposit} ج) 💵🛡️`;
          transferInfo = `تم دفع 50% عربون جدية (${currentDeposit} ج) والمتبقي (${currentRemaining} ج) كاش للمندوب`;
        } else {
          methodLabel = 'كاش عند الاستلام بالكامل 💵';
          transferInfo = `سيتم دفع كامل المبلغ (${totalPrice} ج) نقداً للمندوب بعد التأكيد الهاتفي`;
        }
      }

      const orderData = {
        orderId,
        dateStr,
        methodLabel,
        transferInfo,
        totalAmount: totalPrice,
        depositAmount: currentDeposit,
        remainingAmount: currentRemaining,
        hasReceipt: !!receiptImage,
      };

      setCompletedOrder(orderData);

      // 4. حفظ الطلب في بروفايل العميل وسجل الطلبات
      try {
        saveOrderToHistory({
          orderNumber: orderId,
          createdAt: new Date().toISOString(),
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          paymentMethod: methodLabel,
          paymentStatus: paymentMethod === 'cod' && depositOption !== 'deposit_50' ? 'بانتظار التأكيد' : 'مدفوع مؤكد',
          totalPrice,
          depositAmount: currentDeposit,
          remainingAmount: currentRemaining,
          subtotal,
          deliveryFee,
          notes: notes.trim() || undefined,
          items: Object.values(cart).map((c) => ({
            id: c.item.id,
            name: c.item.name,
            price: c.unitPrice,
            quantity: c.quantity,
            total: c.unitPrice * c.quantity,
            size: c.size,
            image: c.item.image,
          })),
        });
      } catch (histErr) {
        console.error('Error recording order history:', histErr);
      }

      // 5. تفريغ السلة بعد إتمام الطلب بنجاح
      clearCart();

      setIsProcessingPayment(false);
      setStep('success');
      // تم إرسال الإشعار والصورة آلياً من السيرفر مباشرة لتليجرام صاحب المطعم
    } catch (err) {
      console.error(err);
      setIsProcessingPayment(false);
      alert('حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir={dir}>
      {/* الخلفية المعتمة */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className={`fixed inset-y-0 ${isEn ? 'right-0' : 'left-0'} max-w-full flex ${isEn ? 'pr-0' : 'pl-0'}`}>
        <div className={`w-screen max-w-lg bg-[#F7F4EF] dark:bg-[#1E1713] shadow-2xl flex flex-col ${isEn ? 'border-l' : 'border-r'} border-[#D2C4B7] dark:border-[#382A20]`}>
          
          {/* رأس السلة ومؤشر الخطوات */}
          <div className="px-5 py-4 bg-white dark:bg-[#241A14] border-b border-[#D2C4B7] dark:border-[#382A20]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#8A9684]/15 text-[#8A9684] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#8A9684]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1F1713] dark:text-white">
                    {step === 'cart' && (isEn ? 'Your Loqma Basket' : 'سلة سفرة لقمة')}
                    {step === 'delivery' && (isEn ? 'Delivery Address' : 'بيانات عنوان التوصيل')}
                    {step === 'payment' && (isEn ? 'Payment & Settlement' : 'نظام الدفع وتحويل الحساب')}
                    {step === 'success' && (isEn ? 'Order Placed Successfully!' : 'تم إتمام الطلب والدفع بنجاح!')}
                  </h3>
                  <span className="text-xs text-[#55453B] dark:text-[#A09383]">
                    {step === 'success' ? (isEn ? 'Order notification sent to the kitchen' : 'تم إرسال إشعار الأوردر فوراً') : `${totalItems} ${isEn ? 'items selected' : 'أطباق مختارة'} • ${totalPrice} ${t('currency')}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-[#55453B] dark:text-[#D6C9BD] hover:text-[#1F1713] hover:bg-[#D2C4B7]/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* شريط المراحل التفاعلي */}
            {step !== 'success' && (
              <div className="flex items-center justify-between gap-1 text-[11px] pt-1 border-t border-[#D2C4B7]/40 dark:border-[#382A20]">
                <div className={`flex items-center gap-1 font-bold ${step === 'cart' ? 'text-[#8A9684]' : 'text-[#1F1713] dark:text-white'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'cart' ? 'bg-[#8A9684] text-white' : 'bg-[#D2C4B7] text-[#1F1713]'}`}>1</span>
                  <span>{isEn ? 'Cart' : 'السلة'}</span>
                </div>
                <div className="h-[2px] flex-1 bg-[#D2C4B7]/60 dark:bg-[#382A20] mx-1"></div>
                <div className={`flex items-center gap-1 font-bold ${step === 'delivery' ? 'text-[#8A9684]' : 'text-[#1F1713] dark:text-white'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'delivery' ? 'bg-[#8A9684] text-white' : 'bg-[#D2C4B7] text-[#1F1713]'}`}>2</span>
                  <span>{isEn ? 'Address' : 'التوصيل'}</span>
                </div>
                <div className="h-[2px] flex-1 bg-[#D2C4B7]/60 dark:bg-[#382A20] mx-1"></div>
                <div className={`flex items-center gap-1 font-bold ${step === 'payment' ? 'text-[#8A9684]' : 'text-[#55453B] dark:text-[#A09383]'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'payment' ? 'bg-[#8A9684] text-white' : 'bg-[#D2C4B7] text-[#55453B]'}`}>3</span>
                  <span>{isEn ? 'Payment' : 'الدفع'}</span>
                </div>
              </div>
            )}
          </div>

          {/* جسم المحتوى المتغير بحسب الخطوة */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* الحالة 1: السلة فارغة */}
            {cartList.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D2C4B7]/30 flex items-center justify-center text-[#8A9684]">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <h4 className="font-bold text-lg text-[#1F1713] dark:text-white mb-1">{t('cartEmpty')}</h4>
                <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] max-w-xs mx-auto mb-6">
                  {t('cartEmptyDesc')}
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#3D312A] dark:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2B221D] transition-colors border border-[#8A9684]/40"
                >
                  {t('cartBrowseMenu')}
                </button>
              </div>
            ) : step === 'cart' ? (
              
              /* الخطوة 1: مراجعة الأصناف */
              <>
                <div className="flex items-center justify-between pb-2 border-b border-[#D2C4B7] dark:border-[#382A20]">
                  <span className="text-xs font-bold text-[#55453B] dark:text-[#D6C9BD]">{isEn ? 'Selected Dishes' : 'الأطباق والتخصيصات'}</span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('cartClear')}</span>
                  </button>
                </div>

                {cartList.map((cartItem) => (
                  <div
                    key={cartItem.key}
                    className="bg-white dark:bg-[#241A14] p-3.5 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] shadow-xs flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs sm:text-sm text-[#1F1713] dark:text-white">
                          {isEn ? tDishName(cartItem.item.name) : cartItem.item.name}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-[#8A9684]">
                            {cartItem.unitPrice * cartItem.quantity} ج.م
                          </span>
                          <span className="text-[10px] text-[#6E5D53]">
                            ({cartItem.unitPrice} ج للوجبة)
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(cartItem.key)}
                        className="text-[#D2C4B7] hover:text-red-600 p-1 transition-colors"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {cartItem.size && cartItem.size !== 'عادي' && (
                        <span className="bg-[#8A9684]/15 text-[#8A9684] font-bold px-2 py-0.5 rounded-md border border-[#D2C4B7]">
                          الحجم: {cartItem.size}
                        </span>
                      )}
                      {cartItem.stuffing && (
                        <span className="bg-[#8A9684]/15 text-[#3D312A] font-bold px-2 py-0.5 rounded-md border border-[#D2C4B7]">
                          حشو: {cartItem.stuffing}
                        </span>
                      )}
                      {cartItem.cookingStyle && (
                        <span className="bg-[#F7F4EF] text-[#3D312A] font-bold px-2 py-0.5 rounded-md border border-[#D2C4B7]">
                          تسوية: {cartItem.cookingStyle}
                        </span>
                      )}
                      {cartItem.addons && cartItem.addons.length > 0 && (
                        <span className="bg-[#8A9684]/15 text-[#8A9684] font-bold px-2 py-0.5 rounded-md border border-[#8A9684]/30">
                          + {cartItem.addons.map((a) => a.name).join('، ')}
                        </span>
                      )}
                    </div>

                    {cartItem.specialInstructions && (
                      <p className="text-[10px] text-[#6E5D53] italic bg-[#F7F4EF] p-1.5 rounded-lg border border-[#D2C4B7]">
                        💬 ملاحظة: "{cartItem.specialInstructions}"
                      </p>
                    )}

                    <div className="pt-2 border-t border-[#D2C4B7] flex items-center justify-between">
                      <span className="text-[11px] text-[#6E5D53]">الكمية:</span>
                      <div className="flex items-center gap-1.5 bg-[#F7F4EF] px-2 py-1 rounded-xl border border-[#D2C4B7]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartItem.key, cartItem.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white text-[#3D312A] flex items-center justify-center hover:bg-[#D2C4B7]/30 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center text-[#3D312A]">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartItem.key, cartItem.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-[#3D312A] text-[#F7F4EF] flex items-center justify-center hover:bg-[#2B221D] transition-colors border border-[#8A9684]/40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* محرك الترشيحات الذكية اللحظية (Smart AI Cross-Sell) */}
                <div className="pt-2">
                  <SmartCrossSell cartDishIds={cartList.map((i) => i.item.id)} />
                </div>
              </>
            ) : step === 'delivery' ? (
              
              /* الخطوة 2: بيانات التوصيل */
              <form id="delivery-form" onSubmit={handleProceedToPayment} className="space-y-3.5 bg-white p-4 rounded-2xl border border-[#D2C4B7]">
                <div className="flex items-center justify-between pb-2 border-b border-[#D2C4B7]">
                  <span className="text-xs font-bold text-[#3D312A]">معلومات استلام الأوردر</span>
                  {isLoggedIn && user && (
                    <div className="flex items-center gap-1.5 text-[11px] bg-[#8A9684]/15 text-[#3D312A] px-2.5 py-1 rounded-full font-bold">
                      <User className="w-3.5 h-3.5 text-[#8A9684]" />
                      <span>الحساب: {user.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1713] dark:text-white mb-1">
                    {isEn ? 'Full Name *' : 'الاسم بالكامل *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isEn ? 'e.g. John Doe' : 'مثال: أحمد عبد الله'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1713] dark:text-white focus:outline-none focus:border-[#8A9684]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1713] dark:text-white mb-1">
                    {isEn ? 'Phone / WhatsApp Number *' : 'رقم الهاتف / الواتساب *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1713] dark:text-white focus:outline-none focus:border-[#8A9684]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1713] dark:text-white mb-1">
                    {isEn ? 'Detailed Delivery Address *' : 'عنوان التوصيل بالتفصيل *'}
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder={isEn ? 'Area, street, building number, apartment' : 'المنطقة، اسم الشارع، رقم العمارة، الشقة والدور'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1713] dark:text-white focus:outline-none focus:border-[#8A9684]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1713] dark:text-white mb-1">
                    {isEn ? 'Chef / Delivery Instructions (Optional)' : 'ملاحظات الشيف والتوصيل (اختياري)'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. Ring twice, extra hot delivery...' : 'مثال: التوصيل ساخن، رن الجرس مرتين'}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#FAF7F2] dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1713] dark:text-white focus:outline-none focus:border-[#8A9684]"
                  />
                </div>
              </form>
            ) : step === 'payment' ? (

              /* الخطوة 3: نظام الدفع والتحويل المصري */
              <div className="space-y-4">
                
                {/* ملخص المبلغ المطلوب دفعه */}
                <div className="bg-[#3D312A] text-[#F7F4EF] p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[11px] text-[#D2C4B7] block">المبلغ الإجمالي المستحق للسداد:</span>
                    <span className="text-xl font-black text-white">{totalPrice} ج.م</span>
                  </div>
                  <div className="text-left text-[11px] text-[#8A9684] bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <span>{totalItems} أطباق جاهزة للطهي</span>
                  </div>
                </div>

                {/* اختيار وسيلة الدفع */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#3D312A] block">اختر وسيلة الدفع المفضلة لديك:</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* إنستاباي */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                        paymentMethod === 'instapay'
                          ? 'bg-[#8A9684]/15 border-[#8A9684] shadow-xs'
                          : 'bg-white border-[#D2C4B7] hover:bg-[#F7F4EF]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Sparkles className="w-4 h-4 text-[#8A9684]" />
                        <span className="text-[10px] bg-[#8A9684] text-white px-1.5 py-0.5 rounded-full font-bold">فوري ⚡</span>
                      </div>
                      <span className="font-bold text-xs text-[#3D312A]">إنستاباي InstaPay</span>
                      <span className="text-[10px] text-[#6E5D53]">تحويل فوري بدون رسوم</span>
                    </button>

                    {/* فودافون كاش ومحافظ */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vodafone')}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                        paymentMethod === 'vodafone'
                          ? 'bg-[#8A9684]/15 border-[#8A9684] shadow-xs'
                          : 'bg-white border-[#D2C4B7] hover:bg-[#F7F4EF]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Smartphone className="w-4 h-4 text-rose-600" />
                        <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full font-bold">كاش 📱</span>
                      </div>
                      <span className="font-bold text-xs text-[#3D312A]">فودافون كاش والمحافظ</span>
                      <span className="text-[10px] text-[#6E5D53]">إلى محفظة المطعم</span>
                    </button>

                    {/* بطاقة بنكية */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                        paymentMethod === 'card'
                          ? 'bg-[#8A9684]/15 border-[#8A9684] shadow-xs'
                          : 'bg-white border-[#D2C4B7] hover:bg-[#F7F4EF]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">أونلاين 💳</span>
                      </div>
                      <span className="font-bold text-xs text-[#3D312A]">فيزا ومستركارد</span>
                      <span className="text-[10px] text-[#6E5D53]">دفع بنكي آمن ومباشر</span>
                    </button>

                    {/* كاش عند الاستلام */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                        paymentMethod === 'cod'
                          ? 'bg-[#8A9684]/15 border-[#8A9684] shadow-xs'
                          : 'bg-white border-[#D2C4B7] hover:bg-[#F7F4EF]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">نقدي 💵</span>
                      </div>
                      <span className="font-bold text-xs text-[#3D312A]">كاش عند الاستلام</span>
                      <span className="text-[10px] text-[#6E5D53]">الدفع للمندوب باليد</span>
                    </button>
                  </div>
                </div>

                {/* تفاصيل وسيلة الدفع المختارة وحقول التأكيد */}
                <div className="bg-white p-4 rounded-2xl border border-[#D2C4B7] shadow-xs space-y-4">
                  
                  {/* 1. إنستاباي (InstaPay) */}
                  {paymentMethod === 'instapay' && (
                    <div className="space-y-3.5">
                      <div className="bg-[#8A9684]/10 p-3.5 rounded-xl border border-[#8A9684]/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#3D312A] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#8A9684]" />
                            بيانات تحويل إنستاباي الخاصة بـ "لقمة":
                          </span>
                          <span className="text-[10px] bg-[#8A9684]/20 text-[#3D312A] px-2 py-0.5 rounded-full font-bold">
                            تحويل لحظي
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-[#D2C4B7] shadow-xs">
                          <div>
                            <span className="text-[10px] text-[#6E5D53] block">رقم الهاتف / الحساب:</span>
                            <span className="text-sm font-black text-[#3D312A] tracking-wider font-mono" dir="ltr">01065272373</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy('01065272373', 'instapay_phone')}
                            className="bg-[#8A9684] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#768270] transition-colors shadow-xs cursor-pointer"
                          >
                            {copiedField === 'instapay_phone' ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>تم النسخ</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>نسخ الرقم</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-[#6E5D53] flex items-center gap-1">
                          <span>المستفيد: <strong>سفرة مطبخ لقمة للأكلات البيتي</strong></span>
                        </div>
                      </div>

                      {/* منطقة رفع سكرين شوت إيصال التحويل */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#3D312A]">
                          إرفاق سكرين شوت إيصال التحويل (موصى به) 📸
                        </label>
                        
                        {!receiptImage ? (
                          <label className="border-2 border-dashed border-[#8A9684]/50 hover:border-[#8A9684] bg-[#8A9684]/5 hover:bg-[#8A9684]/10 transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReceiptUpload}
                              className="hidden"
                            />
                            <div className="w-10 h-10 rounded-full bg-[#8A9684]/20 text-[#8A9684] flex items-center justify-center">
                              <Camera className="w-5 h-5 text-[#8A9684]" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[#3D312A] block">
                                اضغط هنا لرفع أو تصوير إيصال إنستاباي
                              </span>
                              <span className="text-[10px] text-[#6E5D53]">
                                يدعم الصور من المعرض أو كاميرا الهاتف مباشرة
                              </span>
                            </div>
                          </label>
                        ) : (
                          <div className="relative border border-[#8A9684] bg-emerald-50/50 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={receiptImage}
                                alt="معاينة إيصال التحويل"
                                className="w-14 h-14 object-cover rounded-lg border border-[#8A9684]/40 shadow-xs"
                              />
                              <div>
                                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  تم إرفاق الإيصال بنجاح
                                </span>
                                <span className="text-[10px] text-[#6E5D53] block truncate max-w-[180px]">
                                  {receiptFileName || 'receipt_screenshot.jpg'}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveReceipt}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>حذف</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* حقل اسم الحساب أو المرجع الإضافي */}
                      <div>
                        <label className="block text-xs font-bold text-[#3D312A] mb-1">
                          اسم صاحب الحساب أو رقم المحول منه (اختياري مع الصورة)
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: تم التحويل من حساب أحمد مصطفى أو رقم 010XXXXXXX"
                          value={transferRef}
                          onChange={(e) => setTransferRef(e.target.value)}
                          className="w-full bg-[#F7F4EF] border border-[#D2C4B7] rounded-xl px-3.5 py-2.5 text-xs text-[#3D312A] focus:outline-none focus:border-[#8A9684]"
                        />
                        <span className="text-[10px] text-[#6E5D53] mt-1 block">
                          * يتم إرسال الإيصال والمرجع فوراً لصاحب المطعم على تليجرام لتأكيد الأوردر وبدء الطهي.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 2. فودافون كاش والمحافظ */}
                  {paymentMethod === 'vodafone' && (
                    <div className="space-y-3.5">
                      <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#3D312A] flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-rose-600" />
                            محفظة فودافون كاش لاستقبال التحويل:
                          </span>
                          <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">
                            محفظة معتمدة
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-rose-200 shadow-xs">
                          <div>
                            <span className="text-[10px] text-[#6E5D53] block">رقم الكاش:</span>
                            <span className="text-sm font-black text-[#3D312A] tracking-wider font-mono" dir="ltr">01065272373</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy('01065272373', 'vodafone_phone')}
                            className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                          >
                            {copiedField === 'vodafone_phone' ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>تم النسخ</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>نسخ الرقم</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* كود تحويل سريع */}
                        <div className="bg-white/80 p-2 rounded-lg border border-rose-200/60 flex items-center justify-between text-[11px]">
                          <span className="text-[#6E5D53]">كود التحويل المباشر من خطك:</span>
                          <span className="font-mono font-bold text-rose-700 dir-ltr select-all" dir="ltr">
                            *9*7*01065272373*{totalPrice}#
                          </span>
                        </div>
                      </div>

                      {/* منطقة رفع سكرين شوت إيصال التحويل */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#3D312A]">
                          إرفاق سكرين شوت إيصال تحويل الكاش (موصى به) 📸
                        </label>
                        
                        {!receiptImage ? (
                          <label className="border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-colors rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReceiptUpload}
                              className="hidden"
                            />
                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                              <Camera className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[#3D312A] block">
                                اضغط هنا لرفع سكرين شوت التحويل من المحفظة أو رسالة SMS
                              </span>
                              <span className="text-[10px] text-[#6E5D53]">
                                يتم إرسال الصورة مباشرة للمطبخ لإثبات الدفع فوراً
                              </span>
                            </div>
                          </label>
                        ) : (
                          <div className="relative border border-rose-300 bg-rose-50/60 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={receiptImage}
                                alt="معاينة إيصال فودافون كاش"
                                className="w-14 h-14 object-cover rounded-lg border border-rose-300 shadow-xs"
                              />
                              <div>
                                <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                                  تم إرفاق إيصال الكاش بنجاح
                                </span>
                                <span className="text-[10px] text-[#6E5D53] block truncate max-w-[180px]">
                                  {receiptFileName || 'vodafone_cash_receipt.jpg'}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveReceipt}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>حذف</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#3D312A] mb-1">
                          رقم المحفظة التي قمت بالتحويل منها (أو رقم العملية)
                        </label>
                        <input
                          type="tel"
                          placeholder="مثال: 01098765432"
                          value={transferRef}
                          onChange={(e) => setTransferRef(e.target.value)}
                          className="w-full bg-[#F7F4EF] border border-[#D2C4B7] rounded-xl px-3.5 py-2.5 text-xs text-[#3D312A] focus:outline-none focus:border-[#8A9684]"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. فيزا وماستركارد وميزة (مكون تفاعلي مجسم ثلاثي الأبعاد مع 3D Card Flip للـ CVV) */}
                  {paymentMethod === 'card' && (
                    <CreditCardPayment
                      amount={totalPrice}
                      currency="ج.م"
                      isSubmitting={isProcessingPayment}
                      onCardDataChange={(data) => {
                        setCardNumber(data.cardNumber);
                        setCardName(data.cardName);
                        setCardExpiry(data.cardExpiry);
                        setCardCvv(data.cardCvv);
                      }}
                    />
                  )}

                  {/* 4. كاش عند الاستلام + حماية العربون (Deposit Protection) لمنع خسارة المطبخ */}
                  {paymentMethod === 'cod' && (
                    <div className="space-y-3.5">
                      <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-600/30">
                        <div className="flex items-center gap-1.5 text-[#3D312A] font-bold text-xs mb-1">
                          <Shield className="w-4 h-4 text-amber-600" />
                          <span>نظام حماية الطلبات الطازجة لضمان الجدية</span>
                        </div>
                        <p className="text-[11px] text-[#6E5D53] leading-relaxed">
                          وجبات لقمة تُطهى مخصوصاً وطازجة بمجرد تأكيد طلبك. لحماية وقت المطبخ وتجنب إلغاء الطلبات بعد الطهي، يمكنك الاختيار بين:
                        </p>
                      </div>

                      {/* خيارات العربون */}
                      <div className="space-y-2">
                        {/* خيار 1: دفع عربون جدية 50% من قيمة الأوردر والمتبقي كاش للمندوب */}
                        <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                          depositOption === 'deposit_50'
                            ? 'bg-[#8A9684]/15 border-[#8A9684] shadow-xs'
                            : 'bg-white border-[#D2C4B7] hover:bg-[#F7F4EF]'
                        }`}>
                          <div className="flex items-start gap-2.5">
                            <input
                              type="radio"
                              name="deposit_choice"
                              checked={depositOption === 'deposit_50'}
                              onChange={() => setDepositOption('deposit_50')}
                              className="mt-0.5 accent-[#8A9684]"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-[#3D312A]">
                                  دفع عربون جدية 50% ({deposit50Amount} ج.م) والمتبقي كاش للمندوب
                                </span>
                                <span className="text-[10px] bg-[#8A9684] text-white px-2 py-0.5 rounded-full font-bold">
                                  موصى به ⭐
                                </span>
                              </div>
                              <span className="text-[11px] text-[#6E5D53] block mt-1">
                                تحويل 50% من قيمة الأوردر <strong>({deposit50Amount} ج.م)</strong> عبر (إنستاباي أو فودافون كاش) لتأكيد جدية الحجز وبدء الطهي، والمتبقي <strong>({remaining50Amount} ج.م)</strong> تدفعه للمندوب نقداً عند الاستلام.
                              </span>
                            </div>
                          </div>
                        </label>

                        {/* خيار 2: كامل المبلغ كاش للمندوب مع تأكيد هاتفي */}
                        <label className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                          depositOption === 'full_cash'
                            ? 'bg-[#8A9684]/15 border-[#8A9684] shadow-xs'
                            : 'bg-white border-[#D2C4B7] hover:bg-[#F7F4EF]'
                        }`}>
                          <div className="flex items-start gap-2.5">
                            <input
                              type="radio"
                              name="deposit_choice"
                              checked={depositOption === 'full_cash'}
                              onChange={() => setDepositOption('full_cash')}
                              className="mt-0.5 accent-[#8A9684]"
                            />
                            <div className="flex-1">
                              <span className="font-bold text-xs text-[#3D312A] block">
                                دفع كامل المبلغ ({totalPrice} ج.م) كاش عند الاستلام
                              </span>
                              <span className="text-[11px] text-[#6E5D53] block mt-0.5">
                                ⚠️ يتطلب هذا الخيار اتصالاً هاتفياً مسبقاً من خدمة عملاء لقمة لتأكيد الطلب شفهياً قبل إشعال النار وبدء الطهي.
                              </span>
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* في حالة اختيار دفع العربون 50% */}
                      {depositOption === 'deposit_50' && (
                        <div className="bg-[#F7F4EF] p-3 rounded-xl border border-[#D2C4B7] space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-[#3D312A]">
                            <span>اختر طريقة تحويل العربون ({deposit50Amount} ج.م):</span>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setDepositPaymentChoice('instapay')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  depositPaymentChoice === 'instapay'
                                    ? 'bg-[#8A9684] text-white shadow-xs'
                                    : 'bg-white text-[#6E5D53] border border-[#D2C4B7]'
                                }`}
                              >
                                إنستاباي ⚡
                              </button>
                              <button
                                type="button"
                                onClick={() => setDepositPaymentChoice('vodafone')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  depositPaymentChoice === 'vodafone'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-white text-[#6E5D53] border border-[#D2C4B7]'
                                }`}
                              >
                                فودافون كاش 📱
                              </button>
                            </div>
                          </div>

                          {/* رقم التحويل مع زر النسخ */}
                          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#D2C4B7]">
                            <div>
                              <span className="text-[10px] text-[#6E5D53] block">
                                {depositPaymentChoice === 'instapay' ? 'رقم إنستاباي لدفع العربون:' : 'رقم فودافون كاش لدفع العربون:'}
                              </span>
                              <span className="text-xs font-black text-[#3D312A] tracking-wider font-mono" dir="ltr">01065272373</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy('01065272373', 'deposit_phone')}
                              className="bg-[#3D312A] text-white px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 hover:bg-[#2B221D] transition-colors cursor-pointer"
                            >
                              {copiedField === 'deposit_phone' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>تم النسخ</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>نسخ الرقم</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* كود تحويل سريع لفودافون كاش بقيمة الـ 50% */}
                          {depositPaymentChoice === 'vodafone' && (
                            <div className="bg-white/80 p-2 rounded-lg border border-rose-200/60 flex items-center justify-between text-[11px]">
                              <span className="text-[#6E5D53]">كود التحويل السريع للعربون:</span>
                              <span className="font-mono font-bold text-rose-700 select-all" dir="ltr">
                                *9*7*01065272373*{deposit50Amount}#
                              </span>
                            </div>
                          )}

                          {/* رفع إيصال تحويل العربون الـ 50% */}
                          <div>
                            <label className="block text-[11px] font-bold text-[#3D312A] mb-1">
                              إرفاق سكرين شوت إيصال عربون الـ 50% ({deposit50Amount} ج.م) 📸
                            </label>
                            {!receiptImage ? (
                              <label className="border-2 border-dashed border-[#8A9684]/40 hover:border-[#8A9684] bg-white rounded-lg p-2.5 flex items-center justify-center gap-2 cursor-pointer text-center transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleReceiptUpload}
                                  className="hidden"
                                />
                                <Camera className="w-4 h-4 text-[#8A9684]" />
                                <span className="text-xs font-bold text-[#3D312A]">
                                  اضغط لإرفاق سكرين شوت تحويل العربون ({deposit50Amount} ج.م)
                                </span>
                              </label>
                            ) : (
                              <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-500">
                                <div className="flex items-center gap-2">
                                  <img src={receiptImage} alt="إيصال العربون" className="w-10 h-10 object-cover rounded" />
                                  <span className="text-xs font-bold text-emerald-800">تم إرفاق إيصال العربون</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleRemoveReceipt}
                                  className="text-rose-600 text-xs font-bold hover:underline cursor-pointer"
                                >
                                  حذف
                                </button>
                              </div>
                            )}
                          </div>

                          {/* حقل رقم المحفظة / المرجع */}
                          <input
                            type="text"
                            placeholder="أو اكتب رقم المحفظة المحول منها العربون..."
                            value={transferRef}
                            onChange={(e) => setTransferRef(e.target.value)}
                            className="w-full bg-white border border-[#D2C4B7] rounded-lg px-3 py-1.5 text-xs text-[#3D312A] focus:outline-none focus:border-[#8A9684]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>

            ) : (

              /* الخطوة 4: شاشة النجاح والإشعار */
              completedOrder && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-md animate-bounce">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="inline-block bg-[#8A9684]/15 text-[#8A9684] px-3 py-1 rounded-full text-xs font-bold border border-[#8A9684]/30 mb-2">
                      تم استلام وتأكيد الطلب
                    </span>
                    <h4 className="text-xl font-black text-[#3D312A]">
                      شكراً لك يا {name}!
                    </h4>
                    <p className="text-xs text-[#6E5D53] mt-1">
                      تم تسجيل طلبك بنجاح وإرسال الإشعار وتفاصيل السداد فوراً لإدارة مطبخ لقمة.
                    </p>
                  </div>

                  {/* بطاقة إيصال الفاتورة الرقمية */}
                  <div className="bg-white p-4 rounded-2xl border border-[#D2C4B7] shadow-sm text-right space-y-2.5 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-[#D2C4B7]">
                      <span className="font-bold text-[#6E5D53]">رقم الأوردر:</span>
                      <span className="font-mono font-black text-[#8A9684] text-sm">{completedOrder.orderId}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#6E5D53]">إجمالي قيمة الأوردر:</span>
                      <span className="font-bold text-[#3D312A] text-sm">{completedOrder.totalAmount} ج.م</span>
                    </div>

                    {completedOrder.depositAmount && completedOrder.depositAmount > 0 && (
                      <div className="flex justify-between items-center bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                        <span className="font-bold text-amber-900">عربون الجدية المدفوع:</span>
                        <span className="font-black text-amber-800 text-xs">{completedOrder.depositAmount} ج.م</span>
                      </div>
                    )}

                    {completedOrder.remainingAmount && completedOrder.remainingAmount > 0 && (
                      <div className="flex justify-between items-center bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <span className="font-bold text-emerald-900">المتبقي كاش للمندوب عند الاستلام:</span>
                        <span className="font-black text-emerald-800 text-xs">{completedOrder.remainingAmount} ج.م</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-[#6E5D53]">طريقة السداد:</span>
                      <span className="font-bold text-emerald-700">{completedOrder.methodLabel}</span>
                    </div>

                    {completedOrder.hasReceipt && (
                      <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/70 p-2 rounded-lg text-[11px] font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>تم إرفاق صورة إيصال السداد وإرسالها للمطبخ مع الأوردر 📸</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-[#6E5D53]">رقم هاتف العميل:</span>
                      <span className="font-bold text-[#3D312A]" dir="ltr">{phone}</span>
                    </div>

                    <div className="pt-2 border-t border-[#D2C4B7] text-[11px] text-[#6E5D53]">
                      <span>📍 عنوان التوصيل: {address}</span>
                    </div>
                  </div>

                  {/* أزرار ما بعد إتمام الطلب */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearCart();
                        setIsCartOpen(false);
                        setStep('cart');
                      }}
                      className="w-full bg-[#3D312A] hover:bg-[#2B221D] text-[#F7F4EF] py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <span>العودة للموقع ومتابعة التصفح</span>
                    </button>

                    <a
                      href={`https://wa.me/201065272373?text=${encodeURIComponent(`مرحباً لقمة! أود الاستفسار عن الأوردر رقم ${completedOrder.orderId}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-white hover:bg-[#F7F4EF] text-[#3D312A] border border-[#D2C4B7] py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#8A9684]" />
                      <span>تواصل مع الإدارة للاستفسار (اختياري)</span>
                    </a>
                  </div>
                </div>
              )
            )}

          </div>

          {/* ذيل السلة وأزرار المتابعة */}
          {cartList.length > 0 && step !== 'success' && (
            <div className="p-4 sm:p-5 bg-white dark:bg-[#1E1713] border-t border-[#D2C4B7] dark:border-[#382A20] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#55453B] dark:text-[#D6C9BD]">
                  <span>{t('cartSubtotal')}:</span>
                  <span className="font-bold text-[#1F1713] dark:text-white">{subtotal} {t('currency')}</span>
                </div>
                <div className="flex justify-between text-[#55453B] dark:text-[#D6C9BD]">
                  <span>{t('cartDeliveryFee')}:</span>
                  <span className="font-bold text-[#1F1713] dark:text-white">
                    {deliveryFee === 0 ? (
                      <span className="text-[#8A9684] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#8A9684]" />
                        <span>{isEn ? 'Free (over 400 EGP)' : 'مجاني (طلب فوق 400 ج)'}</span>
                      </span>
                    ) : (
                      `${deliveryFee} ${t('currency')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#1F1713] dark:text-white pt-2 border-t border-[#D2C4B7] dark:border-[#382A20]">
                  <span>{t('cartTotal')}:</span>
                  <span className="text-[#8A9684] text-base">{totalPrice} {t('currency')}</span>
                </div>
              </div>

              {/* أزرار التنقل بحسب الخطوة */}
              {step === 'cart' && (
                !isLoggedIn ? (
                  <div className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300/80 dark:border-amber-800 rounded-2xl p-4 text-center space-y-3 shadow-xs">
                    <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto">
                      <Lock className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1F1713] dark:text-white">
                        {isEn ? 'Sign in required to complete order' : 'تسجيل الدخول مطلوب لإتمام الأوردر'}
                      </h4>
                      <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] mt-1 leading-relaxed">
                        {isEn ? 'To confirm your feast and track delivery, please sign in with your account first.' : 'حرصاً على تأكيد طلبك وتتبع الشحنة، يجب تسجيل الدخول بحسابك أولاً.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/login?redirect=cart');
                      }}
                      className="w-full bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <span>{isEn ? 'Sign In Now to Continue' : 'تسجيل الدخول الآن للمتابعة'}</span>
                      {isEn ? <ArrowRight className="w-4 h-4 text-[#8A9684] dark:text-white" /> : <ArrowLeft className="w-4 h-4 text-[#8A9684]" />}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep('delivery')}
                    className="w-full bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer border border-[#8A9684]/50"
                  >
                    <span>{isEn ? `Proceed to Delivery (${user?.name || 'Continue'})` : `متابعة بيانات التوصيل (${user?.name || 'متابعة'})`}</span>
                    {isEn ? <ArrowRight className="w-4 h-4 text-[#8A9684] dark:text-white" /> : <ArrowLeft className="w-4 h-4 text-[#8A9684]" />}
                  </button>
                )
              )}

              {step === 'delivery' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="w-1/3 bg-[#FAF7F2] dark:bg-[#241A14] text-[#1F1713] dark:text-white border border-[#D2C4B7] dark:border-[#382A20] py-3 rounded-xl font-bold text-xs hover:bg-[#D2C4B7]/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {isEn ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    <span>{isEn ? 'Back to Cart' : 'رجوع للسلة'}</span>
                  </button>
                  <button
                    type="submit"
                    form="delivery-form"
                    className="w-2/3 bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-[#F7F4EF] py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer border border-[#8A9684]/50"
                  >
                    <span>{isEn ? 'Proceed to Payment' : 'المتابعة لاختيار طريقة الدفع'}</span>
                    {isEn ? <ArrowRight className="w-4 h-4 text-[#8A9684] dark:text-white" /> : <ArrowLeft className="w-4 h-4 text-[#8A9684]" />}
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('delivery')}
                    className="w-1/3 bg-[#F7F4EF] dark:bg-[#1E1713] text-[#3D312A] dark:text-[#F7F4EF] border border-[#D2C4B7] dark:border-[#382A20] py-3 rounded-xl font-bold text-xs hover:bg-[#D2C4B7]/30 transition-colors flex items-center justify-center gap-1"
                  >
                    {isEn ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    <span>{isEn ? 'Edit Address' : 'تعديل العنوان'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleCompletePaymentAndOrder}
                    className="w-2/3 bg-[#8A9684] hover:bg-[#768270] disabled:opacity-60 text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{isEn ? 'Confirming Payment...' : 'جاري تأكيد السداد...'}</span>
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-white" />
                        <span>{isEn ? 'Confirm & Send Order' : 'تأكيد الدفع وإرسال الأوردر'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
