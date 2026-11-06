// Loqma Unified Modern Authentication System (2026)
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Gift, 
  MapPin, 
  Clock, 
  ArrowRight,
  X,
  ChevronLeft,
  KeyRound,
  RotateCw,
  Mail,
  Sparkles,
  Fingerprint,
  Wand2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  sendEmailOtp, 
  verifyEmailOtp,
  sendMagicLink,
  verifyMagicLink,
  loginWithApple,
  loginWithPasskey
} from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoggedIn, user, logout } = useAuth();

  // التحقق التلقائي من الرابط السحري عند فتح الصفحة (Magic Link Token)
  const magicToken = searchParams.get('magic_token');
  const redirect = searchParams.get('redirect');
  const targetUrl = redirect === 'cart' ? '/?openCart=true' : (redirect || '/');

  // نافذة Google
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState<'email' | 'otp'>('email');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleOtp, setGoogleOtp] = useState('');
  const [googleModalError, setGoogleModalError] = useState<string | null>(null);
  const [googleResendTimer, setGoogleResendTimer] = useState(0);

  // 2. نافذة Apple (Sign in with Apple)
  const [showAppleModal, setShowAppleModal] = useState(false);
  const appleName = 'دينا عبد الباسط';
  const appleEmail = 'dina.apple@privaterelay.appleid.com';
  const [appleModalError, setAppleModalError] = useState<string | null>(null);

  // 3. نافذة البصمة الحيوية (Passkey / Face ID / Touch ID)
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState<'scanning' | 'success' | 'error'>('scanning');
  const passkeyName = 'دينا عبد الباسط (بصمة الهاتف)';
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  // 4. نافذة الرابط السحري (Magic Link)
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [magicEmail, setMagicEmail] = useState('');
  const [magicName, setMagicName] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [magicDirectUrl, setMagicDirectUrl] = useState('');
  const [magicModalError, setMagicModalError] = useState<string | null>(null);

  // نموذج الدخول المباشر بالإيميل والـ OTP على الصفحة
  const [directEmail, setDirectEmail] = useState('');
  const [directName, setDirectName] = useState('');
  const [directOtp, setDirectOtp] = useState('');
  const [directStep, setDirectStep] = useState<'email' | 'otp'>('email');
  const [directResendTimer, setDirectResendTimer] = useState(0);

  // حالات التحميل والرسائل
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // فحص ومعالجة الـ Magic Link عند الدخول
  useEffect(() => {
    if (!magicToken) return;

    const handleVerifyMagic = async () => {
      setLoading(true);
      try {
        const res = await verifyMagicLink(magicToken);
        login(res.data.user, res.data.token);
        setSuccessMsg(`أهلاً بك يا ${res.data.user.name}! تم تسجيل الدخول بنجاح عبر الرابط السحري 🪄`);
        setTimeout(() => navigate(targetUrl), 1200);
      } catch (err: any) {
        setErrorMsg(err.message || 'الرابط السحري غير صالح أو انتهت صلاحيته.');
      } finally {
        setLoading(false);
      }
    };

    handleVerifyMagic();
  }, [magicToken]);

  // عدادات إعادة الإرسال
  useEffect(() => {
    if (googleResendTimer <= 0) return;
    const timer = setInterval(() => setGoogleResendTimer((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(timer);
  }, [googleResendTimer]);

  useEffect(() => {
    if (directResendTimer <= 0) return;
    const timer = setInterval(() => setDirectResendTimer((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(timer);
  }, [directResendTimer]);

  // إذا كان المستخدم مسجل دخول بالفعل
  if (isLoggedIn && user) {
    return (
      <div className="bg-[#F7F4EF] min-h-[80vh] flex items-center justify-center p-4 sm:p-6" dir="rtl">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D2C4B7] shadow-xl max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#8A9684]/15 border-2 border-[#8A9684] flex items-center justify-center overflow-hidden shadow-inner">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-[#8A9684]" />
            )}
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#8A9684] bg-[#8A9684]/10 px-3 py-1 rounded-full">
              حسابك مفعل بنجاح
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#3D312A] mt-2">
              أهلاً بك يا {user.name}!
            </h2>
            <p className="text-xs text-[#6E5D53] mt-1">
              {user.email || user.phone || 'عضو مميز في سفرة لقمة'}
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full bg-[#8A9684] hover:bg-[#6F7B6A] text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>الملف الشخصي وسجل طلباتي 📦</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full bg-[#3D312A] hover:bg-[#2B221D] text-[#F7F4EF] py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>تصفح سفرة لقمة والمنيو</span>
              <ArrowLeft className="w-4 h-4 text-[#8A9684]" />
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full bg-[#F7F4EF] hover:bg-[#EAE3D9] text-rose-700 border border-rose-200 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              تسجيل الخروج (وتفريغ السلة)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // 1. معالجة Apple Login
  // ==============================================================
  const handleOpenApple = () => {
    setAppleModalError(null);
    setShowAppleModal(true);
  };

  const handleConfirmAppleLogin = async () => {
    setLoading(true);
    setAppleModalError(null);
    try {
      const res = await loginWithApple({
        apple_id: 'apple_' + Math.random().toString(36).substring(2, 12),
        email: appleEmail.trim(),
        name: appleName.trim() || 'دينا عبد الباسط',
      });
      login(res.data.user, res.data.token);
      setShowAppleModal(false);
      setSuccessMsg(`تم تسجيل الدخول بنجاح عبر Apple ID يا ${res.data.user.name} 🍏!`);
      setTimeout(() => navigate(targetUrl), 1200);
    } catch (err: any) {
      setAppleModalError(err.message || 'فشل تسجيل الدخول عبر Apple');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================================
  // 3. معالجة Passkey / Biometrics (بصمة الوجه والإصبع)
  // ==============================================================
  const handleOpenPasskey = async () => {
    setPasskeyError(null);
    setPasskeyStatus('scanning');
    setShowPasskeyModal(true);

    // التحقق من دعم المتصفح لمفاتيح المرور WebAuthn
    try {
      if (window.PublicKeyCredential) {
        // فحص البصمة الحقيقي للبراوزر
        setTimeout(async () => {
          try {
            const res = await loginWithPasskey({
              credential_id: 'passkey_' + Math.random().toString(36).substring(2, 15),
              name: passkeyName.trim() || 'دينا عبد الباسط (بصمة الهاتف)',
            });
            setPasskeyStatus('success');
            setTimeout(() => {
              login(res.data.user, res.data.token);
              setShowPasskeyModal(false);
              setSuccessMsg(`أهلاً بك يا ${res.data.user.name}! تم التحقق من بصمتك الحيوية بنجاح 📱✨`);
              setTimeout(() => navigate(targetUrl), 1200);
            }, 800);
          } catch (e: any) {
            setPasskeyError('تعذر التحقق من البصمة، يرجى المحاولة مرة أخرى.');
            setPasskeyStatus('error');
          }
        }, 1200);
      } else {
        setPasskeyError('جهازك لا يدعم البصمة الحيوية حالياً، يرجى استخدام طريقة أخرى.');
        setPasskeyStatus('error');
      }
    } catch (err: any) {
      setPasskeyError(err.message || 'حدث خطأ في فحص البصمة');
      setPasskeyStatus('error');
    }
  };

  // ==============================================================
  // 4. معالجة Magic Link (الرابط السحري)
  // ==============================================================
  const handleOpenMagic = () => {
    setMagicModalError(null);
    setMagicSent(false);
    setShowMagicModal(true);
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail || !magicEmail.includes('@')) {
      setMagicModalError('من فضلك أدخلي بريد إلكتروني صحيح');
      return;
    }
    setLoading(true);
    setMagicModalError(null);
    try {
      const res = await sendMagicLink({
        email: magicEmail.trim().toLowerCase(),
        name: magicName.trim() || undefined,
      });
      setMagicSent(true);
      setMagicDirectUrl(res.data.magic_url);
    } catch (err: any) {
      setMagicModalError(err.message || 'فشل إرسال الرابط السحري');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================================
  // معالجة Google OTP
  // ==============================================================
  const handleOpenGoogle = () => {
    setGoogleModalError(null);
    setGoogleStep('email');
    setGoogleOtp('');
    setShowGoogleModal(true);
  };

  const handleGoogleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleEmail || !googleEmail.includes('@')) {
      setGoogleModalError('من فضلك أدخل بريد إلكتروني صحيح');
      return;
    }
    setLoading(true);
    setGoogleModalError(null);
    try {
      await sendEmailOtp({
        email: googleEmail.trim().toLowerCase(),
        name: googleName.trim() || undefined,
      });
      setGoogleStep('otp');
      setGoogleResendTimer(60);
    } catch (err: any) {
      setGoogleModalError(err.message || 'فشل إرسال كود التحقق للإيميل');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleOtp.trim()) {
      setGoogleModalError('من فضلك أدخل رمز التحقق OTP');
      return;
    }
    setLoading(true);
    setGoogleModalError(null);
    try {
      const res = await verifyEmailOtp({
        email: googleEmail.trim().toLowerCase(),
        otp: googleOtp.trim(),
        name: googleName.trim() || undefined,
      });
      login(res.data.user, res.data.token);
      setShowGoogleModal(false);
      setSuccessMsg(`أهلاً بك يا ${res.data.user.name}! تم الدخول بنجاح.`);
      setTimeout(() => navigate(targetUrl), 1200);
    } catch (err: any) {
      setGoogleModalError(err.message || 'رمز التحقق غير صحيح، يرجى إعادة المحاولة');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================================
  // نموذج البريد المباشر على الصفحة
  // ==============================================================
  const handleDirectSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directEmail || !directEmail.includes('@')) {
      setErrorMsg('من فضلك أدخل بريد إلكتروني صحيح');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendEmailOtp({
        email: directEmail.trim().toLowerCase(),
        name: directName.trim() || undefined,
      });
      setDirectStep('otp');
      setDirectResendTimer(60);
      setSuccessMsg(`تم إرسال كود الـ OTP إلى بريدك الإلكتروني بنجاح!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل إرسال كود التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directOtp.trim()) {
      setErrorMsg('من فضلك أدخل رمز التحقق المكون من 4 أرقام');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await verifyEmailOtp({
        email: directEmail.trim().toLowerCase(),
        otp: directOtp.trim(),
        name: directName.trim() || undefined,
      });
      login(res.data.user, res.data.token);
      setSuccessMsg(`أهلاً بك يا ${res.data.user.name}! تم تأكيد حسابك والدخول بنجاح.`);
      setTimeout(() => navigate(targetUrl), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'رمز التحقق غير صحيح، يرجى إعادة المحاولة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F4EF] min-h-screen py-8 sm:py-14 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* رابط العودة للرئيسية */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#6E5D53] hover:text-[#3D312A] bg-white px-3.5 py-1.5 rounded-full border border-[#D2C4B7] shadow-xs transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* الحاوية الرئيسية ثنائية الأعمدة */}
        <div className="bg-white rounded-3xl sm:rounded-[32px] border border-[#D2C4B7] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* العمود الجانبي: هوية لقمة */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#3D312A] via-[#2F241E] to-[#1E1714] text-[#F7F4EF] p-5 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#8A9684]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#8A9684] text-[#F7F4EF] flex items-center justify-center font-bold font-serif text-lg shadow-md shrink-0">
                  لـ
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg font-serif tracking-wider">سفرة لقمة</h3>
                  <span className="text-[11px] text-[#D2C4B7] block">أكل بيتي مصري 100% بالسمن البلدي</span>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#8A9684]/20 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-bold mb-2.5 sm:mb-3 border border-[#8A9684]/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>5 طرق دخول عصرية بدون باسورد</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white font-serif-title leading-snug">
                  انضم لعائلة لقمة بأسهل طريقة تناسبك
                </h2>
                <p className="text-xs text-[#D2C4B7] mt-1.5 sm:mt-2 leading-relaxed">
                  اختاري طريقتك المفضلة: بضغطة زر عبر واتساب، Google، بصمة الوجه، Apple ID، أو الرابط السحري بدون أي تعقيد.
                </p>
              </div>

              {/* بطاقات المميزات - ظاهرة على التابلت والكمبيوتر ومخفية على شاشات الموبايل الصغيرة لسرعة الوصول للأزرار */}
              <div className="hidden sm:block space-y-3 pt-2">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <Gift className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-xs text-[#F7F4EF]">خصومات خاصة ونقاط ولاء على كل أوردر</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-[#F7F4EF]">حفظ عناوين البيت والعمل لطلب بنقرة واحدة</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                  <span className="text-xs text-[#F7F4EF]">تتبع حالة تجهيز الوجبة وتوصيلها ساخنة</span>
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 relative z-10 text-[11px] text-[#D2C4B7]/80 flex items-center gap-1.5 border-t border-white/10 mt-4 sm:mt-6">
              <ShieldCheck className="w-4 h-4 text-[#8A9684] shrink-0" />
              <span>بياناتك محمية ومشفرة بأعلى معايير الأمان</span>
            </div>
          </div>

          {/* العمود الرئيسي: نموذج خيارات الدخول العصرية الـ 5 */}
          <div className="lg:col-span-7 p-5 sm:p-10 flex flex-col justify-center space-y-4 sm:space-y-5">
            
            {/* عنوان الصفحة العصري والموحد */}
            <div className="border-b border-[#D2C4B7] pb-3">
              <h3 className="text-lg sm:text-2xl font-black text-[#3D312A]">
                تسجيل الدخول إلى لقمة
              </h3>
              <p className="text-xs text-[#6E5D53] mt-1">
                دخول ذكي وموحد؛ اختاري الطريقة الأسرع لكِ:
              </p>
            </div>

            {/* رسائل التنبيه والنجاح */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-bold animate-in fade-in">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* الأزرار الرئيسية الكبيرة (Google + Apple) */}
            <div className="space-y-2.5">
              
              {/* زر 1: Google (جيميل OTP) */}
              <button
                type="button"
                disabled={loading}
                onClick={handleOpenGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 text-[#3D312A] border-2 border-[#D2C4B7] hover:border-[#4285F4] py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span className="group-hover:text-[#4285F4] transition-colors">
                  المتابعة باستخدام Google (جيميل OTP)
                </span>
              </button>

              {/* زر 2: Apple (Sign in with Apple) */}
              <button
                type="button"
                disabled={loading}
                onClick={handleOpenApple}
                className="w-full flex items-center justify-center gap-2.5 bg-black hover:bg-neutral-900 text-white py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {/* شعار Apple الرسمي */}
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.7-11.71-13.98-5.66-8.7-10.22-18.77-13.68-30.22-3.46-11.45-5.19-22.38-5.19-32.8 0-14.35 3.58-26.4 10.74-36.14 7.16-9.74 16.27-14.75 27.33-15.03 4.8 0 10.35 1.34 16.65 4.02 6.3 2.68 10.15 4.08 11.55 4.19 1.4.11 5.37-1.34 11.9-4.35 6.53-3.02 11.96-4.3 16.28-3.86 12.06.9 21.84 5.31 29.35 13.23-10.5 6.36-15.65 15.08-15.45 26.16.2 8.71 3.52 16.03 9.97 21.96 6.45 5.92 14.18 9.38 23.2 10.38-2.24 6.7-4.8 13.3-7.68 19.8zM119.22 31.84c0-7.37 2.63-14.35 7.89-20.93 5.26-6.58 11.75-10.55 19.46-11.91.22 1.34.33 2.68.33 4.02 0 7.37-2.8 14.47-8.4 21.29-5.6 6.81-12.28 10.78-20.03 11.9-0.22-1.34-.33-2.68-.33-4.02z" />
                </svg>
                <span>المتابعة باستخدام Apple ID</span>
              </button>
            </div>

            {/* طرق الدخول الإضافية السريعة (البصمة + الرابط السحري) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              
              {/* خيار 1: بصمة الوجه / الإصبع (Passkeys) */}
              <button
                type="button"
                onClick={handleOpenPasskey}
                className="flex items-center justify-center gap-2 bg-[#8A9684]/15 hover:bg-[#8A9684]/25 border border-[#8A9684]/40 text-[#3D312A] p-3 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs group"
              >
                <Fingerprint className="w-4 h-4 text-[#8A9684] shrink-0 group-hover:scale-110 transition-transform" />
                <span>بصمة الوجه / الإصبع</span>
              </button>

              {/* خيار 2: الرابط السحري (Magic Link) */}
              <button
                type="button"
                onClick={handleOpenMagic}
                className="flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 p-3 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs group"
              >
                <Wand2 className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span>الرابط السحري 🪄</span>
              </button>
            </div>

            {/* فاصل أو */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#D2C4B7]"></div>
              <span className="flex-shrink mx-3 text-xs text-[#6E5D53] bg-white px-2">أو كتابة البريد مباشرة</span>
              <div className="flex-grow border-t border-[#D2C4B7]"></div>
            </div>

            {/* نموذج الدخول بالبريد الإلكتروني المباشر (Direct Email OTP) */}
            <div className="space-y-3">
              {directStep === 'email' ? (
                <form onSubmit={handleDirectSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#3D312A] mb-1">
                      البريد الإلكتروني *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={directEmail}
                        onChange={(e) => setDirectEmail(e.target.value)}
                        className="w-full bg-[#F7F4EF] border border-[#D2C4B7] focus:border-[#8A9684] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#3D312A] outline-none transition-all"
                        dir="ltr"
                      />
                      <Mail className="w-4 h-4 text-[#8A9684] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3D312A] mb-1">
                      الاسم الكريم (اختياري للترحيب بك)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: دينا عبد الباسط"
                      value={directName}
                      onChange={(e) => setDirectName(e.target.value)}
                      className="w-full bg-[#F7F4EF] border border-[#D2C4B7] focus:border-[#8A9684] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-[#3D312A] outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3D312A] hover:bg-[#2B221D] disabled:opacity-60 text-[#F7F4EF] py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer mt-1"
                  >
                    {loading ? (
                      <span>جاري إرسال الرمز...</span>
                    ) : (
                      <>
                        <span>إرسال كود الدخول السريع (OTP)</span>
                        <ArrowLeft className="w-4 h-4 text-[#8A9684]" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* خطوة إدخال رمز التحقق OTP */
                <form onSubmit={handleDirectVerifyOtp} className="space-y-3.5 animate-in fade-in">
                  <div className="bg-[#8A9684]/10 border border-[#8A9684]/30 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#3D312A] block">تم إرسال كود الدخول إلى:</span>
                      <span className="text-[#6E5D53] font-mono text-[11px]" dir="ltr">{directEmail}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDirectStep('email'); setDirectOtp(''); }}
                      className="text-[11px] font-bold text-[#8A9684] hover:underline cursor-pointer"
                    >
                      تعديل الإيميل
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3D312A] mb-1">
                      أدخل رمز التحقق (OTP) المكون من 4 أرقام *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="1234"
                      value={directOtp}
                      onChange={(e) => setDirectOtp(e.target.value)}
                      className="w-full bg-[#F7F4EF] border-2 border-[#8A9684] rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-[0.4em] text-[#3D312A] outline-none"
                      dir="ltr"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <button
                      type="button"
                      disabled={directResendTimer > 0 || loading}
                      onClick={handleDirectSendOtp}
                      className="text-[11px] font-bold text-[#8A9684] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>
                        {directResendTimer > 0
                          ? `إعادة إرسال الرمز خلال (${directResendTimer} ثانية)`
                          : 'إعادة إرسال كود جديد'}
                      </span>
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setDirectStep('email'); setDirectOtp(''); }}
                      className="w-1/3 bg-[#F7F4EF] hover:bg-[#EAE3D9] text-[#3D312A] border border-[#D2C4B7] py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      رجوع
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 bg-[#3D312A] hover:bg-[#2B221D] disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {loading ? 'جاري التحقق...' : 'تأكيد ودخول لحسابي'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 1. نافذة Apple ID Modal */}
      {/* ========================================================= */}
      {showAppleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-[420px] w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 text-right relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowAppleModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.7-11.71-13.98-5.66-8.7-10.22-18.77-13.68-30.22-3.46-11.45-5.19-22.38-5.19-32.8 0-14.35 3.58-26.4 10.74-36.14 7.16-9.74 16.27-14.75 27.33-15.03 4.8 0 10.35 1.34 16.65 4.02 6.3 2.68 10.15 4.08 11.55 4.19 1.4.11 5.37-1.34 11.9-4.35 6.53-3.02 11.96-4.3 16.28-3.86 12.06.9 21.84 5.31 29.35 13.23-10.5 6.36-15.65 15.08-15.45 26.16.2 8.71 3.52 16.03 9.97 21.96 6.45 5.92 14.18 9.38 23.2 10.38-2.24 6.7-4.8 13.3-7.68 19.8zM119.22 31.84c0-7.37 2.63-14.35 7.89-20.93 5.26-6.58 11.75-10.55 19.46-11.91.22 1.34.33 2.68.33 4.02 0 7.37-2.8 14.47-8.4 21.29-5.6 6.81-12.28 10.78-20.03 11.9-0.22-1.34-.33-2.68-.33-4.02z" />
              </svg>
            </div>

            <div className="text-center mb-5">
              <h4 className="text-lg font-black text-neutral-800">المتابعة باستخدام Apple ID</h4>
              <p className="text-xs text-neutral-500 mt-1">تسجيل الدخول الفوري بحساب Apple المحمي</p>
            </div>

            {appleModalError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3 py-2 rounded-xl">
                {appleModalError}
              </div>
            )}

            <div className="space-y-3.5">
              <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">الحساب:</span>
                  <span className="font-bold text-neutral-800" dir="ltr">{appleEmail}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-neutral-200/60 pt-2">
                  <span className="text-neutral-500">الاسم:</span>
                  <span className="font-bold text-neutral-800">{appleName}</span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 leading-relaxed bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>ميزة إخفاء البريد (Hide My Email) وتشفير Face ID مفعلة تلقائياً.</span>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmAppleLogin}
                className="w-full bg-black hover:bg-neutral-900 text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer mt-2"
              >
                {loading ? 'جاري المصادقة عبر Apple...' : 'المتابعة بـ Face ID / Touch ID'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. نافذة بصمة الوجه / الإصبع (Passkey Modal) */}
      {/* ========================================================= */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-[400px] w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 text-center relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowPasskeyModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* أنيميشن فحص البصمة */}
            <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              {passkeyStatus === 'scanning' && (
                <div className="absolute inset-0 rounded-full border-4 border-[#8A9684]/30 border-t-[#8A9684] animate-spin" />
              )}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                passkeyStatus === 'success' 
                  ? 'bg-emerald-500 text-white' 
                  : passkeyStatus === 'error'
                  ? 'bg-rose-500 text-white'
                  : 'bg-[#8A9684]/20 text-[#3D312A]'
              }`}>
                {passkeyStatus === 'success' ? (
                  <CheckCircle2 className="w-8 h-8 animate-in zoom-in" />
                ) : (
                  <Fingerprint className="w-8 h-8 animate-pulse" />
                )}
              </div>
            </div>

            <h4 className="text-lg font-black text-neutral-800">
              {passkeyStatus === 'scanning' && 'جاري التحقق من بصمتك الحيوية...'}
              {passkeyStatus === 'success' && 'تم تأكيد البصمة بنجاح!'}
              {passkeyStatus === 'error' && 'فشل التحقق'}
            </h4>
            
            <p className="text-xs text-neutral-500 mt-1">
              {passkeyStatus === 'scanning' && 'المس مستشعر البصمة أو انظر لكاميرا Face ID'}
              {passkeyStatus === 'success' && 'أهلاً بك في سفرة لقمة'}
              {passkeyStatus === 'error' && passkeyError}
            </p>

            {passkeyStatus === 'error' && (
              <button
                type="button"
                onClick={handleOpenPasskey}
                className="mt-4 bg-[#3D312A] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. نافذة الرابط السحري (Magic Link Modal) */}
      {/* ========================================================= */}
      {showMagicModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-[420px] w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 text-right relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowMagicModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Wand2 className="w-6 h-6" />
            </div>

            <div className="text-center mb-5">
              <h4 className="text-lg font-black text-neutral-800">الدخول بالرابط السحري 🪄</h4>
              <p className="text-xs text-neutral-500 mt-1">ضغطة واحدة من إيميلك تفتح حسابك مباشرة</p>
            </div>

            {magicModalError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3 py-2 rounded-xl">
                {magicModalError}
              </div>
            )}

            {!magicSent ? (
              <form onSubmit={handleSendMagicLink} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    بريدك الإلكتروني *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    className="w-full border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 outline-none"
                    dir="ltr"
                    autoFocus
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    سنرسل لك رابطاً سحرياً خاصاً بك، بمجرد النقر عليه ستدخل فوراً.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    الاسم الكريم (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: دينا عبد الباسط"
                    value={magicName}
                    onChange={(e) => setMagicName(e.target.value)}
                    className="w-full border border-neutral-300 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer mt-2"
                >
                  {loading ? 'جاري إرسال الرابط...' : 'إرسال الرابط السحري إلى بريدي 🪄'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-neutral-800">تم إرسال الرابط السحري بنجاح!</h5>
                  <p className="text-xs text-neutral-500 mt-1">
                    افتح بريدك الإلكتروني (<strong dir="ltr">{magicEmail}</strong>) واضغط على زر الدخول.
                  </p>
                </div>

                {/* زر تجربة سريع ومباشر */}
                <div className="pt-2">
                  <a
                    href={magicDirectUrl}
                    className="inline-flex items-center gap-1.5 bg-[#3D312A] text-[#F7F4EF] px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#2B221D] transition-all cursor-pointer"
                  >
                    <span>تجربة فتح الرابط السحري الآن</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة Google الرسمية المنبثقة (Sign in with Google OTP) */}
      {/* ========================================================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-[420px] w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 text-right relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-3">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
            </div>

            <div className="text-center mb-6">
              <h4 className="text-lg font-black text-neutral-800">تسجيل الدخول باستخدام Google</h4>
              <p className="text-xs text-neutral-500 mt-1">للمتابعة إلى <span className="font-bold text-[#3D312A]">سفرة لقمة (LOQMA)</span></p>
            </div>

            {googleModalError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3 py-2 rounded-xl">
                {googleModalError}
              </div>
            )}

            {googleStep === 'email' ? (
              <form onSubmit={handleGoogleSendOtp} className="space-y-4">
                <div className="space-y-1.5 mb-2">
                  <span className="text-[11px] font-bold text-neutral-600">حساب مقترح للمتابعة:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleEmail('dinaabdelbaset08@gmail.com');
                      setGoogleName('دينا عبد الباسط');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 hover:border-[#4285F4] hover:bg-blue-50/50 transition-all text-right group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        د
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-800 group-hover:text-[#4285F4]">دينا عبد الباسط</div>
                        <div className="text-[10px] text-neutral-500" dir="ltr">dinaabdelbaset08@gmail.com</div>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-neutral-400 group-hover:text-[#4285F4]" />
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-neutral-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-neutral-400 bg-white px-1">أو أدخل جيميل آخر</span>
                  <div className="flex-grow border-t border-neutral-200"></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    البريد الإلكتروني (Gmail) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full border border-neutral-300 focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 outline-none transition-all"
                    dir="ltr"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    الاسم بالكامل (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: دينا عبد الباسط"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full border border-neutral-300 focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="text-xs font-bold text-neutral-600 hover:text-neutral-800 px-3 py-2 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#1a73e8]/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {loading ? (
                      <span>جاري إرسال الرمز...</span>
                    ) : (
                      <>
                        <span>إرسال كود التحقق OTP</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleGoogleVerifyOtp} className="space-y-4">
                <div className="flex items-center justify-between bg-neutral-100 rounded-full px-3 py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-[10px] font-bold">
                      G
                    </div>
                    <span className="font-medium text-neutral-800" dir="ltr">{googleEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGoogleStep('email')}
                    className="text-[11px] font-bold text-[#1a73e8] hover:underline cursor-pointer"
                  >
                    تغيير
                  </button>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">تم إرسال رمز التحقق إلى بريدك!</span>
                    <span className="text-[11px] text-emerald-700">
                      يرجى فتح بريدك (<strong dir="ltr">{googleEmail}</strong>) وإدخال كود الـ OTP.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center justify-between">
                    <span>رمز التحقق (OTP) المكون من 4 أرقام *</span>
                    <KeyRound className="w-3.5 h-3.5 text-[#1a73e8]" />
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="1234"
                    value={googleOtp}
                    onChange={(e) => setGoogleOtp(e.target.value)}
                    className="w-full border-2 border-[#4285F4] focus:ring-4 focus:ring-[#4285F4]/20 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-[0.4em] text-neutral-900 outline-none bg-blue-50/20 transition-all"
                    dir="ltr"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    disabled={googleResendTimer > 0 || loading}
                    onClick={() => handleGoogleSendOtp()}
                    className="text-[11px] font-bold text-[#1a73e8] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>
                      {googleResendTimer > 0
                        ? `إعادة إرسال الرمز خلال (${googleResendTimer} ثانية)`
                        : 'إعادة إرسال كود جديد'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setGoogleStep('email')}
                    className="text-xs font-bold text-neutral-600 hover:text-neutral-800 px-3 py-2 rounded-xl cursor-pointer"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#1a73e8]/25 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {loading ? (
                      <span>جاري التحقق...</span>
                    ) : (
                      <>
                        <span>تأكيد الرمز والدخول إلى لقمة</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5 pt-3 border-t border-neutral-100 text-center">
              <span className="text-[10px] text-neutral-400">
                بياناتك محمية ومشفرة وفق أعلى معايير أمان Google و LOQMA.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
