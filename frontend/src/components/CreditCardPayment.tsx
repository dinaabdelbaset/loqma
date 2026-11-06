import { useState, useEffect } from 'react';
import { 
  Lock, 
  RotateCw, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck
} from 'lucide-react';
import { processCardPayment } from '../services/api';

export type CardNetwork = 'visa' | 'mastercard' | 'meeza' | 'unknown';

export function detectCardNetwork(number: string): CardNetwork {
  const clean = number.replace(/\D/g, '');
  if (!clean) return 'unknown';
  
  // Meeza (ميزة - الشبكة الوطنية المصرية للمدفوعات): 5078, 9792, or begins with 50
  if (/^(5078|9792|50)/.test(clean)) {
    return 'meeza';
  }
  // Visa: Starts with 4
  if (/^4/.test(clean)) {
    return 'visa';
  }
  // Mastercard: Starts with 51-55 or 2221-2720
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(clean)) {
    return 'mastercard';
  }
  return 'unknown';
}

interface CreditCardPaymentProps {
  amount: number;
  currency?: string;
  orderNumber?: string;
  isSubmitting?: boolean;
  onPaymentSuccess?: (paymentData: any) => void;
  onCardDataChange?: (cardData: {
    cardNumber: string;
    cardName: string;
    cardExpiry: string;
    cardCvv: string;
    cardBrand: CardNetwork;
    isValid: boolean;
  }) => void;
  showPayButton?: boolean;
}

export default function CreditCardPayment({
  amount,
  currency = 'ج.م',
  orderNumber,
  isSubmitting = false,
  onPaymentSuccess,
  onCardDataChange,
  showPayButton = false,
}: CreditCardPaymentProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [network, setNetwork] = useState<CardNetwork>('unknown');

  // أخطاء التحقق
  const [errors, setErrors] = useState<{
    number?: string;
    name?: string;
    expiry?: string;
    cvv?: string;
  }>({});
  const [touched, setTouched] = useState<{
    number?: boolean;
    name?: boolean;
    expiry?: boolean;
    cvv?: boolean;
  }>({});

  const [internalProcessing, setInternalProcessing] = useState(false);
  const [successPayment, setSuccessPayment] = useState<any>(null);

  // كشف شبكة البطاقة تلقائياً
  useEffect(() => {
    const detected = detectCardNetwork(cardNumber);
    setNetwork(detected);
  }, [cardNumber]);

  // التحقق من صحة المدخلات
  const validateForm = () => {
    const errs: typeof errors = {};
    const rawNumber = cardNumber.replace(/\s/g, '');
    
    if (!rawNumber) {
      errs.number = 'رقم البطاقة مطلوب';
    } else if (rawNumber.length < 16) {
      errs.number = 'رقم البطاقة غير مكتمل (16 رقماً)';
    }

    if (!cardName.trim()) {
      errs.name = 'اسم حامل البطاقة مطلوب';
    } else if (cardName.trim().length < 3) {
      errs.name = 'الاسم يجب أن لا يقل عن 3 أحرف';
    }

    if (!cardExpiry) {
      errs.expiry = 'تاريخ الانتهاء مطلوب';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
      errs.expiry = 'الصيغة غير صحيحة (شهر/سنة MM/YY)';
    } else {
      const [m, y] = cardExpiry.split('/').map(Number);
      const now = new Date();
      const currentYear = Number(now.getFullYear().toString().slice(-2));
      const currentMonth = now.getMonth() + 1;
      if (y < currentYear || (y === currentYear && m < currentMonth)) {
        errs.expiry = 'تاريخ البطاقة منتهي الصلاحية';
      }
    }

    if (!cardCvv) {
      errs.cvv = 'رمز CVV مطلوب';
    } else if (cardCvv.length < 3) {
      errs.cvv = 'رمز الأمان 3 أرقام على الأقل';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // إبلاغ المكون الأب بأي تغيير
  useEffect(() => {
    const rawNumber = cardNumber.replace(/\s/g, '');
    const isValid = 
      rawNumber.length === 16 &&
      cardName.trim().length >= 3 &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry) &&
      cardCvv.length >= 3;

    if (onCardDataChange) {
      onCardDataChange({
        cardNumber,
        cardName,
        cardExpiry,
        cardCvv,
        cardBrand: network,
        isValid,
      });
    }
  }, [cardNumber, cardName, cardExpiry, cardCvv, network]);

  // تنسيق رقم البطاقة
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // تنسيق تاريخ الانتهاء
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2, 4)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  // رمز الأمان
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(digits);
  };

  // الدفع المستقل (عند استخدام المكون كشاشة كاملة)
  const handleDirectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ number: true, name: true, expiry: true, cvv: true });
    if (!validateForm()) return;

    setInternalProcessing(true);
    try {
      const response = await processCardPayment({
        amount,
        order_number: orderNumber,
        currency: 'EGP',
        payment_method: 'card',
        cardholder_name: cardName,
        card_brand: network,
        card_last_four: cardNumber.replace(/\s/g, '').slice(-4),
      });

      setSuccessPayment(response.data);
      if (onPaymentSuccess) {
        onPaymentSuccess(response.data);
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء معالجة الدفع');
    } finally {
      setInternalProcessing(false);
    }
  };

  return (
    <div className="w-full space-y-4" dir="rtl">
      
      {/* 3D Realistic Card Container with Flip Animation */}
      <div className="perspective-1000 w-full max-w-[360px] mx-auto select-none">
        <div 
          className={`relative w-full aspect-[1.586/1] rounded-2xl shadow-2xl transition-transform duration-700 transform-style-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
          title="اضغط لقلب الكارت ورؤية الوجه الآخر"
        >
          {/* ================= وجه الكارت الأمامي (FRONT - مستوحى بالكامل من كارت CIB Platinum Business) ================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl p-4 sm:p-5 text-white bg-gradient-to-tr from-[#05070B] via-[#090E18] to-[#0F172A] border border-slate-700/50 flex flex-col justify-between overflow-hidden backface-hidden shadow-2xl"
          >
            {/* لمعة رقمية / سيتي سكايلاين كحلي في الخلفية كما في الصورة المرجعية */}
            <div className="absolute top-0 right-0 w-3/4 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(30,58,138,0.35)_0%,rgba(15,23,42,0.1)_60%,transparent_100%)] pointer-events-none" />
            <div className="absolute top-2 right-12 w-32 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            
            {/* خطوط تقنية رقيقة شبكية شبيهة بصورة الكارت */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#60A5FA_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

            {/* الجزء العلوي: لوجو لقمة بلاتينوم في اليسار + كلمة credit وشعار VISA في اليمين */}
            <div className="flex items-start justify-between relative z-10" dir="ltr">
              {/* لوجو البنك / لقمة بلاتينوم بيزنس */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-sm flex items-center justify-center">
                  <span className="font-black text-black text-xs tracking-tighter">LQ</span>
                </div>
                <div className="leading-tight text-left">
                  <span className="font-black text-white tracking-widest text-xs block">LOQMA</span>
                  <span className="text-[7.5px] uppercase tracking-wider text-slate-300 font-semibold block">
                    BUSINESS PLATINUM
                  </span>
                </div>
              </div>

              {/* يمين الكارت: كلمة credit وشعار الشبكة الرسمي */}
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-300 lowercase font-mono tracking-wider mb-0.5">credit</span>
                <div className="h-6 flex items-center">
                  {network === 'visa' || network === 'unknown' ? (
                    <span className="font-black italic text-lg tracking-tighter text-white drop-shadow font-serif">
                      VISA
                    </span>
                  ) : network === 'mastercard' ? (
                    <img src="/images/cards/mastercard.png" alt="Mastercard" className="h-5 object-contain drop-shadow" />
                  ) : (
                    <img src="/images/cards/meeza.png" alt="Meeza ميزة" className="h-6 object-contain drop-shadow" />
                  )}
                </div>
              </div>
            </div>

            {/* الجزء الأوسط: شريحة EMV الفضية الواقعية + علامة الويف اللاتلامسي */}
            <div className="flex items-center gap-2.5 my-auto relative z-10" dir="ltr">
              {/* شريحة إلكترونية فضية/بلاتينية واقعية تماماً كما في كارت CIB */}
              <div className="w-11 h-8 rounded-md bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 p-[1.5px] shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-[4px] border border-slate-600/50 grid grid-cols-2 grid-rows-3 gap-[1px] p-[2px] opacity-90">
                  <div className="border border-slate-600/40 rounded-[1px]"></div>
                  <div className="border border-slate-600/40 rounded-[1px]"></div>
                  <div className="border border-slate-600/40 rounded-[1px] col-span-2"></div>
                  <div className="border border-slate-600/40 rounded-[1px]"></div>
                  <div className="border border-slate-600/40 rounded-[1px]"></div>
                </div>
              </div>

              {/* علامة الويف اللاتلامسي البيضاء الأنيقة */}
              <svg className="w-5 h-5 text-white/90 rotate-90 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" strokeLinecap="round" />
                <path d="M8.5 15.5a6 6 0 0 1 7 0" strokeLinecap="round" />
                <path d="M12 18.5a2.5 2.5 0 0 1 0-3" strokeLinecap="round" />
              </svg>
            </div>

            {/* الجزء السفلي: رقم الكارت وتاريخ الصلاحية والاسم بنمط بارز Embossed Silver */}
            <div className="relative z-10 space-y-1" dir="ltr">
              {/* رقم الكارت بخط بارز مطابق تماماً للصورة */}
              <div className="text-left font-mono tracking-[0.19em] text-base sm:text-lg font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]">
                {cardNumber || '4000 1234 5678 9101'}
              </div>

              {/* تاريخ الانتهاء بنمط VALID THRU المطابق للبنوك المصرية */}
              <div className="flex items-center gap-2 pt-0.5 text-xs text-white">
                <div className="text-[6.5px] uppercase leading-tight text-slate-300 font-bold text-left">
                  <span>VALID</span><br />
                  <span>THRU</span>
                </div>
                <span className="font-mono font-bold text-slate-100 text-[11px] sm:text-xs tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                  {cardExpiry || '12/28'}
                </span>
              </div>

              {/* اسم حامل الكارت واسم الشركة التابع لها */}
              <div className="flex items-end justify-between pt-0.5 text-left font-mono">
                <div>
                  <span className="font-bold text-white uppercase block text-[11px] sm:text-xs tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                    {cardName || 'KARIM ADEL'}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-slate-400 block font-sans font-semibold">
                    LOQMA FOOD COMPANY
                  </span>
                </div>

                {/* علامة الحماية الأمنية البلاتينية */}
                <div className="opacity-80">
                  <span className="text-[7.5px] text-slate-400 border border-slate-600 px-1 py-0.5 rounded font-mono">
                    SECURE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= ظهر الكارت (BACK - 3D FLIPPED) ================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl text-white bg-gradient-to-tr from-[#05070B] via-[#090E18] to-[#0F172A] border border-slate-700/50 flex flex-col justify-between overflow-hidden backface-hidden rotate-y-180 shadow-2xl"
          >
            {/* الشريط المغناطيسي الأسود العريض في الأعلى */}
            <div className="w-full h-11 bg-black/95 mt-4 relative">
              <div className="w-full h-[1px] bg-slate-700/60 mt-1"></div>
            </div>

            {/* لوحة التوقيع البيضاء ورمز الـ CVV */}
            <div className="px-5 py-1.5" dir="ltr">
              <div className="flex items-center justify-between text-[8px] text-slate-300 uppercase font-mono mb-1">
                <span>Authorized Signature - Not Valid Unless Signed</span>
                <span>CVV / CVC</span>
              </div>
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 h-8 rounded flex items-center justify-end px-3 border border-slate-300">
                <span className="font-mono font-bold text-slate-900 tracking-widest text-xs">
                  {cardCvv ? '•'.repeat(cardCvv.length) : '•••'}
                </span>
              </div>
            </div>

            {/* أسفل الظهر: الشعار والبيانات البنكية الآمنة */}
            <div className="px-5 pb-3 flex items-center justify-between text-[8px] text-slate-400 font-mono" dir="ltr">
              <div>
                <span className="block font-bold text-slate-300">LOQMA PLATINUM SUPPORT</span>
                <span>24/7 Hotline: 01065272373</span>
              </div>
              <span className="font-black italic text-base text-white/90">VISA</span>
            </div>
          </div>
        </div>
      </div>

      {/* زر توضيحي لقلب الكارت */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-[11px] text-[#6E5D53] hover:text-[#3D312A] flex items-center gap-1.5 transition-colors cursor-pointer bg-white/70 px-3 py-1 rounded-full border border-[#D2C4B7]"
        >
          <RotateCw className="w-3 h-3 text-[#8A9684]" />
          <span>{isFlipped ? 'عرض وجه البطاقة الأمامي' : 'عرض ظهر البطاقة ورمز CVV'}</span>
        </button>
      </div>

      {/* حقول إدخال البيانات المجهزة بربط فوري و 3D Flip تفاعلي */}
      <div className="space-y-3 pt-1">
        {/* شارة الأمان */}
        <div className="flex items-center justify-between text-[11px] text-[#6E5D53] pb-1 border-b border-[#D2C4B7]">
          <span className="flex items-center gap-1 font-bold text-[#3D312A]">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            دفع بنكي مشفر وآمن 100% (PCI-DSS & SSL)
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              {network === 'visa' ? 'Visa' : network === 'mastercard' ? 'Mastercard' : network === 'meeza' ? 'ميزة Meeza' : 'بوابة معتمدة'}
            </span>
          </div>
        </div>

        {/* 1. رقم البطاقة */}
        <div>
          <label className="block text-xs font-bold text-[#3D312A] mb-1">
            رقم البطاقة البنكية (16 رقم) *
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={19}
              placeholder="4111 2222 3333 4444"
              value={cardNumber}
              onChange={handleNumberChange}
              onFocus={() => setIsFlipped(false)}
              onBlur={() => setTouched({ ...touched, number: true })}
              className={`w-full bg-[#F7F4EF] border rounded-xl px-3.5 py-2.5 text-xs text-[#3D312A] focus:outline-none tracking-widest font-mono ${
                touched.number && errors.number ? 'border-rose-500 focus:border-rose-600' : 'border-[#D2C4B7] focus:border-[#8A9684]'
              }`}
              dir="ltr"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {network === 'visa' && (
                <img src="/images/cards/visa.png" alt="Visa" className="h-4 object-contain" />
              )}
              {network === 'mastercard' && (
                <img src="/images/cards/mastercard.png" alt="Mastercard" className="h-4 object-contain" />
              )}
              {network === 'meeza' && (
                <img src="/images/cards/meeza.png" alt="Meeza" className="h-5 object-contain" />
              )}
            </div>
          </div>
          {touched.number && errors.number && (
            <span className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-bold">
              <AlertCircle className="w-3 h-3" />
              {errors.number}
            </span>
          )}
        </div>

        {/* 2. اسم حامل البطاقة */}
        <div>
          <label className="block text-xs font-bold text-[#3D312A] mb-1">
            اسم حامل البطاقة (كما هو مدون على الكارت) *
          </label>
          <input
            type="text"
            placeholder="مثال: AHMED MOHAMED"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            onFocus={() => setIsFlipped(false)}
            onBlur={() => setTouched({ ...touched, name: true })}
            className={`w-full bg-[#F7F4EF] border rounded-xl px-3.5 py-2.5 text-xs text-[#3D312A] focus:outline-none ${
              touched.name && errors.name ? 'border-rose-500 focus:border-rose-600' : 'border-[#D2C4B7] focus:border-[#8A9684]'
            }`}
          />
          {touched.name && errors.name && (
            <span className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-bold">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </span>
          )}
        </div>

        {/* 3. تاريخ الانتهاء ورمز CVV */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-[#3D312A] mb-1">
              تاريخ الانتهاء (MM/YY) *
            </label>
            <input
              type="text"
              maxLength={5}
              placeholder="08/28"
              value={cardExpiry}
              onChange={handleExpiryChange}
              onFocus={() => setIsFlipped(false)}
              onBlur={() => setTouched({ ...touched, expiry: true })}
              className={`w-full bg-[#F7F4EF] border rounded-xl px-3.5 py-2.5 text-xs text-[#3D312A] focus:outline-none text-center font-mono ${
                touched.expiry && errors.expiry ? 'border-rose-500 focus:border-rose-600' : 'border-[#D2C4B7] focus:border-[#8A9684]'
              }`}
              dir="ltr"
            />
            {touched.expiry && errors.expiry && (
              <span className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3 h-3" />
                {errors.expiry}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D312A] mb-1 flex items-center justify-between">
              <span>رمز الأمان (CVV) *</span>
              <span className="text-[10px] text-[#8A9684] font-normal">3 أرقام بالظهر</span>
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="•••"
              value={cardCvv}
              onChange={handleCvvChange}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => {
                setIsFlipped(false);
                setTouched({ ...touched, cvv: true });
              }}
              className={`w-full bg-[#F7F4EF] border rounded-xl px-3.5 py-2.5 text-xs text-[#3D312A] focus:outline-none text-center font-mono ${
                touched.cvv && errors.cvv ? 'border-rose-500 focus:border-rose-600' : 'border-[#D2C4B7] focus:border-[#8A9684]'
              }`}
              dir="ltr"
            />
            {touched.cvv && errors.cvv && (
              <span className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3 h-3" />
                {errors.cvv}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* زر الدفع المستقل إذا كان مطلوباً */}
      {showPayButton && (
        <button
          type="button"
          disabled={internalProcessing || isSubmitting}
          onClick={handleDirectPayment}
          className="w-full bg-[#8A9684] hover:bg-[#768270] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
        >
          {internalProcessing || isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>جاري التحقق والخصم الآمن...</span>
            </span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>دفع {amount} {currency} بأمان</span>
            </>
          )}
        </button>
      )}

      {/* إشعار نجاح الدفع المكتمل */}
      {successPayment && (
        <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-right space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>تمت عملية الدفع بنجاح!</span>
          </div>
          <div className="text-[11px] text-emerald-900 font-mono">
            رقم العملية: {successPayment.transaction_reference}
          </div>
        </div>
      )}
    </div>
  );
}
