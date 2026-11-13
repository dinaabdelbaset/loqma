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
  ShoppingBag
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function CheckoutPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMethod = (searchParams.get('method') as 'instapay' | 'vodafone' | 'card' | 'cod') || 'card';
  const [selectedMethod, setSelectedMethod] = useState<'instapay' | 'vodafone' | 'card' | 'cod'>(initialMethod);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const sampleItems = [
    { name: 'طاجن عكاوي بلدي مع بصل مكرمل', price: 340, qty: 1, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80' },
    { name: 'محشي مشكل فاخر (ورق عنب وكوسة وبطاطس)', price: 180, qty: 1, image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=300&q=80' },
  ];

  const subtotal = 520;
  const delivery = 35;
  const total = subtotal + delivery;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#120E0C] text-[#3D312A] dark:text-[#F7F4EF] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8 text-center sm:text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>بوابة الدفع الآمنة 100%</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#3D312A] dark:text-white">
            إتمام الطلب ووسائل الدفع
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            اختر وسيلة الدفع المناسبة واستكمل طلب أشهى الأطباق البيتية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* العمود الأيمن: وسائل الدفع وبيانات التوصيل */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. بيانات التوصيل */}
            <div className="bg-white dark:bg-[#1C1612] rounded-2xl p-6 border border-[#E5DFD5] dark:border-[#382A20] shadow-sm">
              <h2 className="text-base font-bold text-[#3D312A] dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#26472A] text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>عنوان وبيانات التوصيل</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">الاسم بالكامل</label>
                  <input 
                    type="text" 
                    defaultValue="أحمد محمود"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-sm focus:outline-none focus:border-[#26472A]"
                    placeholder="اسم المستلم"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">رقم الهاتف الأساسي</label>
                    <input 
                      type="tel" 
                      defaultValue="01012345678"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-sm focus:outline-none focus:border-[#26472A]"
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">المنطقة / الحي</label>
                    <input 
                      type="text" 
                      defaultValue="المعادي الجديدة"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-sm focus:outline-none focus:border-[#26472A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">العنوان بالتفصيل (الشارع، العمارة، رقم الشقة)</label>
                  <input 
                    type="text" 
                    defaultValue="شارع النصر، عمارة 14، الدور الرابع، شقة 8"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF8F5] dark:bg-[#251D18] text-sm focus:outline-none focus:border-[#26472A]"
                  />
                </div>
              </div>
            </div>

            {/* 2. وسائل الدفع المتعددة */}
            <div className="bg-white dark:bg-[#1C1612] rounded-2xl p-6 border border-[#E5DFD5] dark:border-[#382A20] shadow-sm">
              <h2 className="text-base font-bold text-[#3D312A] dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#26472A] text-white text-xs flex items-center justify-center font-bold">2</span>
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
                  <span className="text-[10px] text-stone-500">كاش للطيار</span>
                </button>
              </div>

              {/* تفاصيل كل وسيلة دفع */}
              {selectedMethod === 'card' && (
                <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#251D18] border border-[#E5DFD5] dark:border-[#382A20] space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5] dark:border-[#382A20]">
                    <div>
                      <span className="text-sm font-bold text-stone-800 dark:text-stone-200 block">بطاقة لقمة بلاتينوم الائتمانية (الوجه والظهر)</span>
                      <span className="text-[11px] text-stone-500">تصميم ديجيتال كامل لوجه وظهر البطاقة مع شريحة الدفع والـ CVV</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تشفير 256-bit</span>
                    </div>
                  </div>

                  {/* كارتان متجاوران: وجه الكارت وظهر الكارت معاً للفيجما والعرض الشامل */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. وجه الكارت (FRONT CARD DESIGN) */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-stone-600 dark:text-stone-300 block text-center">
                        وجه البطاقة (Front Face)
                      </span>
                      <div className="relative w-full aspect-[1.586/1] rounded-2xl p-4 sm:p-5 text-white bg-gradient-to-tr from-[#05070B] via-[#090E18] to-[#0F172A] border border-slate-700/60 shadow-xl flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 w-3/4 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(30,58,138,0.35)_0%,rgba(15,23,42,0.1)_60%,transparent_100%)] pointer-events-none" />
                        <div className="absolute top-2 right-12 w-32 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                        
                        {/* أعلى الوجه */}
                        <div className="flex items-start justify-between relative z-10" dir="ltr">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-sm flex items-center justify-center">
                              <span className="font-black text-black text-xs tracking-tighter">LQ</span>
                            </div>
                            <div className="leading-tight text-left">
                              <span className="font-black text-white tracking-widest text-xs block">LOQMA</span>
                              <span className="text-[7.5px] uppercase tracking-wider text-slate-300 font-semibold block">PLATINUM</span>
                            </div>
                          </div>
                          <span className="font-black italic text-lg tracking-tighter text-white drop-shadow font-serif">VISA</span>
                        </div>

                        {/* منتصف الوجه: شريحة EMV وعلامة الويف */}
                        <div className="flex items-center gap-2.5 my-auto relative z-10" dir="ltr">
                          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 p-[1.5px] shadow-md flex items-center justify-center">
                            <div className="w-full h-full rounded-[4px] border border-slate-600/50 grid grid-cols-2 grid-rows-3 gap-[1px] p-[2px] opacity-90">
                              <div className="border border-slate-600/40 rounded-[1px]"></div>
                              <div className="border border-slate-600/40 rounded-[1px]"></div>
                              <div className="border border-slate-600/40 rounded-[1px] col-span-2"></div>
                              <div className="border border-slate-600/40 rounded-[1px]"></div>
                              <div className="border border-slate-600/40 rounded-[1px]"></div>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-white/90 rotate-90 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12.55a11 11 0 0 1 14.08 0" strokeLinecap="round" />
                            <path d="M8.5 15.5a6 6 0 0 1 7 0" strokeLinecap="round" />
                            <path d="M12 18.5a2.5 2.5 0 0 1 0-3" strokeLinecap="round" />
                          </svg>
                        </div>

                        {/* أسفل الوجه: الرقم والاسم والتاريخ */}
                        <div className="relative z-10 space-y-1" dir="ltr">
                          <div className="text-left font-mono tracking-[0.19em] text-sm sm:text-base font-bold text-white drop-shadow">
                            4000 1234 5678 9101
                          </div>
                          <div className="flex items-center justify-between text-left font-mono text-[10px] text-slate-200">
                            <div>
                              <span className="font-bold text-white uppercase block">KARIM ADEL</span>
                              <span className="text-[7.5px] uppercase tracking-wider text-slate-400">LOQMA FOOD CO.</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[6.5px] text-slate-400 uppercase block">VALID THRU</span>
                              <span className="font-bold text-white">12/28</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. ظهر الكارت (BACK CARD DESIGN) */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-stone-600 dark:text-stone-300 block text-center">
                        ظهر البطاقة (Back Face & CVV)
                      </span>
                      <div className="relative w-full aspect-[1.586/1] rounded-2xl text-white bg-gradient-to-tr from-[#05070B] via-[#090E18] to-[#0F172A] border border-slate-700/60 shadow-xl flex flex-col justify-between overflow-hidden">
                        {/* الشريط المغناطيسي */}
                        <div className="w-full h-9 bg-black/95 mt-3 relative">
                          <div className="w-full h-[1px] bg-slate-700/60 mt-1"></div>
                        </div>

                        {/* شريط التوقيع والـ CVV */}
                        <div className="px-4 py-1" dir="ltr">
                          <div className="flex items-center justify-between text-[7px] text-slate-300 uppercase font-mono mb-0.5">
                            <span>Authorized Signature</span>
                            <span>CVV / CVC</span>
                          </div>
                          <div className="bg-gradient-to-r from-slate-100 to-slate-200 h-7 rounded flex items-center justify-end px-2.5 border border-slate-300">
                            <span className="font-mono font-bold text-slate-900 tracking-widest text-xs">
                              892
                            </span>
                          </div>
                        </div>

                        {/* أسفل الظهر */}
                        <div className="px-4 pb-3 flex items-center justify-between text-[7.5px] text-slate-400 font-mono" dir="ltr">
                          <div>
                            <span className="block font-bold text-slate-300">LOQMA PLATINUM SUPPORT</span>
                            <span>Hotline: 01065272373</span>
                          </div>
                          <span className="font-black italic text-sm text-white/90">VISA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* حقول إدخال البيانات المعتادة */}
                  <div className="space-y-3 pt-3 border-t border-[#E5DFD5] dark:border-[#382A20]">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 mb-1">اسم حامل البطاقة (Cardholder Name)</label>
                      <input 
                        type="text" 
                        defaultValue="KARIM ADEL"
                        className="w-full px-3.5 py-2 rounded-lg border border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#1C1612] text-sm focus:outline-none focus:border-[#26472A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-500 mb-1">رقم الكارت (Card Number)</label>
                      <input 
                        type="text" 
                        defaultValue="4000 1234 5678 9101"
                        className="w-full px-3.5 py-2 rounded-lg border border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#1C1612] text-sm tracking-wider font-mono focus:outline-none focus:border-[#26472A]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-1">تاريخ الانتهاء (Expiry)</label>
                        <input 
                          type="text" 
                          defaultValue="12/28"
                          className="w-full px-3.5 py-2 rounded-lg border border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#1C1612] text-sm text-center font-mono focus:outline-none focus:border-[#26472A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-1">رمز الأمان (CVV)</label>
                        <input 
                          type="text" 
                          defaultValue="892"
                          maxLength={4}
                          className="w-full px-3.5 py-2 rounded-lg border border-[#D2C4B7] dark:border-[#382A20] bg-white dark:bg-[#1C1612] text-sm text-center font-mono focus:outline-none focus:border-[#26472A]"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {selectedMethod === 'instapay' && (
                <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300">التحويل عبر تطبيق InstaPay</span>
                    <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">بدون رسوم</span>
                  </div>

                  <div className="bg-white dark:bg-[#1C1612] p-3 rounded-lg border border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-stone-500">عنوان الدفع اللحظي (IPA)</span>
                      <span className="text-sm font-bold font-mono text-purple-700 dark:text-purple-400">loqma@instapay</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('loqma@instapay', 'ipa')}
                      className="px-3 py-1.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1 hover:bg-purple-200 transition-colors"
                    >
                      {copiedField === 'ipa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'ipa' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                      اسم الحساب أو رقم المرجع بعد التحويل
                    </label>
                    <input 
                      type="text" 
                      placeholder="مثال: أحمد محمود أو رقم المعاملة"
                      className="w-full px-3.5 py-2 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-white dark:bg-[#1C1612] text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'vodafone' && (
                <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 space-y-3 animate-in fade-in">
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
                      className="px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-1 hover:bg-red-200 transition-colors"
                    >
                      {copiedField === 'voda' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'voda' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'cod' && (
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 space-y-1.5 animate-in fade-in">
                  <p className="font-bold">✨ الدفع نقداً عند استلام الوجبة:</p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300">
                    يمكنك الدفع كاش لمندوب التوصيل عند استلام الطلب ساخناً وطازجاً على باب منزلك.
                  </p>
                </div>
              )}

              {/* زر إتمام الدفع النهائي */}
              <button 
                type="button"
                className="w-full mt-6 py-3.5 px-6 rounded-xl bg-[#26472A] hover:bg-[#1F3922] text-white font-bold text-sm shadow-lg shadow-[#26472A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>تأكيد ودفع الطلب ({total} ج.م)</span>
              </button>
            </div>

          </div>

          {/* العمود الأيسر: ملخص الطلب والفاتورة */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-[#1C1612] rounded-2xl p-6 border border-[#E5DFD5] dark:border-[#382A20] shadow-sm sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5] dark:border-[#382A20] mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#26472A]" />
                  <h3 className="font-bold text-sm">ملخص سلة الطلب (2 طبق)</h3>
                </div>
                <Link to="/menu" className="text-xs text-[#26472A] dark:text-amber-400 font-bold hover:underline">
                  تعديل
                </Link>
              </div>

              {/* عناصر الطلب */}
              <div className="space-y-3 mb-6">
                {sampleItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 rounded-lg object-cover border border-stone-200 dark:border-stone-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#3D312A] dark:text-white truncate">{item.name}</p>
                      <span className="text-[11px] text-stone-500">الكمية: {item.qty}</span>
                    </div>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{item.price} ج.م</span>
                  </div>
                ))}
              </div>

              {/* حساب الفاتورة */}
              <div className="space-y-2 pt-4 border-t border-[#E5DFD5] dark:border-[#382A20] text-xs">
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>المجموع الفرعي</span>
                  <span>{subtotal} ج.م</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>رسوم التوصيل السريع</span>
                  <span>{delivery} ج.م</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>ضريبة القيمة المضافة</span>
                  <span className="text-emerald-600 font-bold">شاملة</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#3D312A] dark:text-white pt-3 border-t border-dashed border-[#E5DFD5] dark:border-[#382A20]">
                  <span>الإجمالي الكلي المطلوب</span>
                  <span className="text-[#26472A] dark:text-amber-400 text-base">{total} ج.م</span>
                </div>
              </div>

              {/* شارات الأمان */}
              <div className="mt-6 p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#251D18] border border-[#E5DFD5] dark:border-[#382A20] text-[11px] text-stone-500 flex items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>دفع مشفر</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>طازج 100%</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
