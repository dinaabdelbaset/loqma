import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Check, 
  Sparkles, 
  ChefHat, 
  Briefcase, 
  Users, 
  GraduationCap, 
  HeartHandshake, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Smartphone,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { createSubscription } from '../services/api';

interface PlanDetail {
  id: 'employees' | 'family' | 'students';
  badge: string;
  badgeEn: string;
  title: string;
  titleEn: string;
  target: string;
  targetEn: string;
  icon: any;
  color: string;
  bgLight: string;
  description: string;
  descriptionEn: string;
  weeklyPrice: number;
  monthlyPrice: number;
  savings: string;
  features: string[];
  featuresEn: string[];
  suggestedSlot: string;
}

const PLANS_DATA: PlanDetail[] = [
  {
    id: 'employees',
    badge: 'للشركات والمكاتب 💼',
    badgeEn: 'Corporate & Offices 💼',
    title: 'باقة الموظفين والشركات',
    titleEn: 'Employee & Corporate Lunch Pass',
    target: 'للموظفين وفرق العمل في الشركات والمكاتب',
    targetEn: 'For corporate teams, remote workers, and office staff',
    icon: Briefcase,
    color: '#26472A',
    bgLight: 'bg-[#26472A]/10',
    description: 'وجبة غداء دافية ونظيفة يومياً تصلك في موعد استراحة الغداء بالضبط في مكتبك أو شركتك، بدون بهدلة طلبات الدليفري اليومية.',
    descriptionEn: 'Hot, wholesome, baladi lunch delivered precisely at your office lunch break without the daily takeout hassle.',
    weeklyPrice: 690,
    monthlyPrice: 2850,
    savings: 'وفر 25% مقارنة بالطلب الفردي',
    suggestedSlot: 'دورة الغداء المكتبي: 1:30 ظهراً إلى 2:30 ظهراً',
    features: [
      'وجبة متكاملة: بروتين طازج + خضار بيتي + أرز/سلطة + بولة شوربة دافية',
      'توصيل يومي دقيق في موعد استراحة الغداء بالشركة',
      'تغليف فردي معقم ومحكم مع أدوات طعام كاملة',
      'منيو متجدد يومياً طوال الشهر بدون تكرار ممل',
      'إمكانية تجميد الأيام في حال الإجازات الرسمية وسفر العمل'
    ],
    featuresEn: [
      'Full course: Fresh protein + baladi stew + rice/salad + hot broth',
      'Punctual delivery timed with your office lunch break',
      'Individually sealed thermal packaging with cutlery',
      'Rotated daily chef menu all month long',
      'Flexibility to pause days for vacations and sick leave'
    ]
  },
  {
    id: 'family',
    badge: 'الأكثر طلباً للأمهات 👑',
    badgeEn: 'Most Popular for Families 👑',
    title: 'باقة الأمهات والأسرة',
    titleEn: 'Family & Working Mothers Pass',
    target: 'للعائلات والأمهات العاملات لراحة بال تامة طوال الشهر',
    targetEn: 'For busy mothers and families seeking home-cooked peace of mind',
    icon: Users,
    color: '#8A9684',
    bgLight: 'bg-[#8A9684]/15',
    description: 'ريحي بالك من سؤال "هنتغدى إيه النهاردة؟" صواني وطواجن دافية تكفي 4 إلى 5 أفراد تصلك فوراً مع رجوع الأولاد من المدارس.',
    descriptionEn: 'End the daily "what’s for lunch?" struggle. Family trays and casseroles for 4-5 people timed with school pickup.',
    weeklyPrice: 1350,
    monthlyPrice: 5400,
    savings: 'وفر 30% مع صواني وسرافيس عائلية',
    suggestedSlot: 'دورة غداء الأسرة والمدارس: 2:00 ظهراً إلى 3:30 عصراً',
    features: [
      'صواني وطواجن عائلية دسمة تكفي الأسرة (4 - 5 أفراد)',
      'سمنة بلدي طبيعية 100% وخضار فريش بدون مكسبات طعم',
      'تصلك ساخنة في موعد رجوع الأولاد وتوضع على السفرة مباشرة',
      'مرونة استبدال أي وجبة وتعديل الملح والدهون حسب رغبة العائلة',
      'حلو بيتي مجاناً كل يوم خميس مع وجبة نهاية الأسبوع'
    ],
    featuresEn: [
      'Generous family trays serving 4-5 people',
      '100% pure cow ghee, fresh meats, zero artificial enhancers',
      'Arrives steaming hot ready for the family dining table',
      'Flexibility to swap dishes and adjust salt/ghee for kids',
      'Complimentary homemade dessert every Thursday'
    ]
  },
  {
    id: 'students',
    badge: 'نَفَس ماما للمغتربين 🎓',
    badgeEn: 'Mom\'s Cooking for Students 🎓',
    title: 'باقة المغتربين والطلبة',
    titleEn: 'Students & Expats Home Pass',
    target: 'للطلبة الجامعيين والشباب المغتربين',
    targetEn: 'For university students and young expats missing home cooking',
    icon: GraduationCap,
    color: '#B46C38',
    bgLight: 'bg-[#B46C38]/15',
    description: 'أكل ماما الصافي ونظافة البيت من غير زيوت رديئة أو أكل شوارع، وجبات مشبعة ومغذية بأسعار خاصة مدعومة للطلبة.',
    descriptionEn: 'Real mom\'s cooking without cheap restaurant oils or junk food. Nutritious, hearty, and student-budget friendly.',
    weeklyPrice: 480,
    monthlyPrice: 1950,
    savings: 'سعر خاص مدعوم للطلبة والشباب',
    suggestedSlot: 'دورة غداء الطلبة: 3:00 عصراً إلى 5:00 مساءً',
    features: [
      'وجبة فردية دسمة ومشبعة مع أرز وشوربة وخضار بلدي',
      'لحوم وفراخ طازجة تذبح يومياً بدون أي دهون مهدرجة',
      'سعر اقتصادي جداً أقل من وجبات الفاست فود التجارية',
      'سهولة الدفع أسبوعياً أو شهرياً عبر فودافون كاش أو إنستاباي',
      'توصيل لسكن الطلبة أو الشقق المشتركة في ميعاد المحاضرات'
    ],
    featuresEn: [
      'Hearty single portion with rice, stew, and natural bone broth',
      'Fresh meats and poultry prepared cleanly with baladi ghee',
      'Budget-friendly pricing far healthier than fast food',
      'Easy weekly/monthly payments via Vodafone Cash or InstaPay',
      'Direct delivery to university housing and dorms'
    ]
  }
];

export default function SubscriptionsPage() {
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const { user } = useAuth();
  const BreadcrumbArrow = isEn ? ChevronRight : ChevronLeft;

  const [selectedPlan, setSelectedPlan] = useState<'employees' | 'family' | 'students'>('family');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'weekly'>('monthly');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);

  // نافذة الاشتراك التفاعلية
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('المعادي وطرة');
  const [deliverySlot, setDeliverySlot] = useState('دورة غداء أولى: 1:30 ظهراً إلى 3:00 عصراً');
  const [dietaryNotes, setDietaryNotes] = useState('ملح خفيف وسمن بلدي طبيعي');
  const [paymentMethod, setPaymentMethod] = useState('instapay');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState<any | null>(null);

  const activePlanData = PLANS_DATA.find((p) => p.id === selectedPlan) || PLANS_DATA[1];

  const currentPrice = billingCycle === 'monthly'
    ? (daysPerWeek === 3 ? Math.round(activePlanData.monthlyPrice * 0.65) : activePlanData.monthlyPrice)
    : (daysPerWeek === 3 ? Math.round(activePlanData.weeklyPrice * 0.65) : activePlanData.weeklyPrice);

  const handleOpenSubscribe = (planId: 'employees' | 'family' | 'students') => {
    setSelectedPlan(planId);
    setIsSubscribeModalOpen(true);
  };

  const handleSubmitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert('يرجى كتابة الاسم ورقم الموبايل والعنوان بالتفصيل');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createSubscription({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        delivery_zone: deliveryZone,
        plan_type: selectedPlan,
        duration: billingCycle,
        days_per_week: daysPerWeek,
        delivery_slot: deliverySlot,
        dietary_notes: dietaryNotes,
        price: currentPrice,
        payment_method: paymentMethod,
      });

      const subId = res?.data?.subscriptionId || `SUB-${Math.floor(1000 + Math.random() * 9000)}`;

      setSubscriptionSuccess({
        subId,
        customerName,
        planTitle: activePlanData.title,
        price: currentPrice,
        billingCycle,
        daysPerWeek,
        deliverySlot,
      });
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء تسجيل الاشتراك');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F7F4EF] dark:bg-[#120E0C] text-[#1F1713] dark:text-[#F7F4EF] min-h-screen py-8 sm:py-14 transition-colors" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">

        {/* مسار الصفحة */}
        <nav className="flex items-center gap-2 text-xs font-bold text-[#55453B] dark:text-[#D6C9BD]">
          <Link to="/" className="hover:text-[#8A9684] transition-colors">{t('home')}</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 opacity-60" />
          <span className="text-[#1F1713] dark:text-white font-black">
            {isEn ? 'Home Meal Subscriptions' : 'اشتراكات وجبات البيت (غداء يومي دافئ)'}
          </span>
        </nav>

        {/* هيرو الصفحة التعريفي */}
        <div className="relative rounded-3xl sm:rounded-[40px] overflow-hidden bg-gradient-to-br from-[#26472A] via-[#1E3922] to-[#120E0C] text-white p-6 sm:p-12 border-2 border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>حل العقدة الأزلية: "هنتغدى إيه النهاردة؟" ✨</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif-title leading-tight">
              اشتراكات وجبات البيت الشهرية والأسبوعية
            </h1>

            <p className="text-xs sm:text-base text-stone-200 leading-relaxed">
              غداء بيتي نظيف، مطبوخ بسمنة بلدي طبيعية 100% وخضار ولحوم فريش، يوصلك يومياً ساخناً في موعدك المحدد للشركات أو للمنازل بدون حيرة وتفكير.
            </p>

            {/* محدد التكرار والمدة */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="bg-black/40 p-1.5 rounded-2xl border border-white/10 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-[#26472A] shadow-md'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  اشتراك شهري (خصم 25%) 🏆
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('weekly')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    billingCycle === 'weekly'
                      ? 'bg-white text-[#26472A] shadow-md'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  تجربة أسبوعية (5 أيام)
                </button>
              </div>

              <div className="bg-black/40 px-3 py-2 rounded-2xl border border-white/10 text-xs font-bold text-amber-200 flex items-center gap-2">
                <span>أيام الأسبوع:</span>
                <button
                  type="button"
                  onClick={() => setDaysPerWeek(3)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                    daysPerWeek === 3 ? 'bg-amber-400 text-stone-900' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  3 أيام
                </button>
                <button
                  type="button"
                  onClick={() => setDaysPerWeek(5)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                    daysPerWeek === 5 ? 'bg-amber-400 text-stone-900' : 'text-stone-300 hover:text-white'
                  }`}
                >
                  5 أيام (الأنسب)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* كروت الباقات الثلاث المميزة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {PLANS_DATA.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const price = billingCycle === 'monthly'
              ? (daysPerWeek === 3 ? Math.round(plan.monthlyPrice * 0.65) : plan.monthlyPrice)
              : (daysPerWeek === 3 ? Math.round(plan.weeklyPrice * 0.65) : plan.weeklyPrice);

            return (
              <div
                key={plan.id}
                className={`rounded-3xl border-2 p-6 sm:p-8 flex flex-col justify-between transition-all bg-white dark:bg-[#18110D] relative overflow-hidden shadow-md hover:shadow-2xl ${
                  isSelected
                    ? 'border-[#26472A] dark:border-amber-500 ring-4 ring-[#26472A]/10 scale-102'
                    : 'border-[#D2C4B7] dark:border-[#382A20] hover:border-[#8A9684]'
                }`}
              >
                {/* الشارة العلوية */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                    {isEn ? plan.badgeEn : plan.badge}
                  </span>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${plan.bgLight} text-stone-800 dark:text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h3 className="text-xl font-black font-serif-title text-[#1F1713] dark:text-white">
                    {isEn ? plan.titleEn : plan.title}
                  </h3>
                  <p className="text-xs font-bold text-[#8A9684] dark:text-amber-400">
                    {isEn ? plan.targetEn : plan.target}
                  </p>
                  <p className="text-xs text-[#55453B] dark:text-[#A09383] leading-relaxed">
                    {isEn ? plan.descriptionEn : plan.description}
                  </p>
                </div>

                {/* السعر والحسبة */}
                <div className="bg-[#FAF5EE] dark:bg-[#20150E] p-4 rounded-2xl border border-[#D2C4B7]/60 dark:border-[#382A20] mb-6 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-[#1F1713] dark:text-white font-serif">
                      {price} {t('currency')}
                    </span>
                    <span className="text-[11px] font-bold text-stone-500">
                      / {billingCycle === 'monthly' ? `شهرياً (${daysPerWeek} أيام/أسبوع)` : `أسبوعياً (${daysPerWeek} أيام)`}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 block">
                    ✨ {plan.savings}
                  </span>
                </div>

                {/* الميزات */}
                <div className="space-y-2.5 mb-8 flex-1">
                  <span className="text-xs font-black text-[#1F1713] dark:text-white block">
                    ما تشمله الباقة:
                  </span>
                  {(isEn ? plan.featuresEn : plan.features).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#55453B] dark:text-[#D6C9BD] leading-normal">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* زر الاشتراك */}
                <button
                  type="button"
                  onClick={() => handleOpenSubscribe(plan.id)}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#26472A] hover:bg-[#1E3922] text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>اشترك الآن في {plan.title}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* مميزات الاشتراكات البيتية */}
        <div className="bg-white dark:bg-[#18110D] p-6 sm:p-10 rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-black text-[#8A9684] uppercase tracking-wider">
              راحة ومرونة 100%
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-serif-title text-[#1F1713] dark:text-white">
              لماذا يشترك عملاؤنا في وجبات لقمة الشهرية؟
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-start">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto sm:mx-0">
                <ChefHat className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-[#1F1713] dark:text-white">طبيعي وسمنة بلدي</h4>
              <p className="text-xs text-stone-500">خامات بلدي 100% بدون أي دهون مهدرجة أو مرقات صناعية.</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto sm:mx-0">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-[#1F1713] dark:text-white">تسليم بالدقيقة</h4>
              <p className="text-xs text-stone-500">وجبتك تخرج طازجة لتصل ساخنة ومضبوطة مع ميعاد بريك الغداء.</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center mx-auto sm:mx-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-[#1F1713] dark:text-white">مرونة تجميد الأيام</h4>
              <p className="text-xs text-stone-500">مسافر أو عندك إجازة؟ بلغنا قبلها بيوم ونرحّل أيامك دون أي خسارة.</p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto sm:mx-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-[#1F1713] dark:text-white">رعاية صحية خاصة</h4>
              <p className="text-xs text-stone-500">إمكانية تحديد ملح خفيف للضغط، بدون دهون للسكر، أو أكل هادي للأولاد.</p>
            </div>
          </div>
        </div>

      </div>

      {/* نافذة استكمال الاشتراك التفاعلية */}
      {isSubscribeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#18110D] w-full max-w-lg rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5">
            
            {subscriptionSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black font-serif-title text-[#1F1713] dark:text-white">
                  مبروك! تم تفعيل اشتراكك في {subscriptionSuccess.planTitle}
                </h3>
                <p className="text-xs text-stone-500">
                  رقم الاشتراك: <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{subscriptionSuccess.subId}</span>
                </p>
                <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#20150E] text-xs text-start space-y-1.5 border border-[#D2C4B7]">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-bold">المشترك:</span>
                    <span className="font-bold">{subscriptionSuccess.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-bold">المبلغ المستحق:</span>
                    <span className="font-black text-emerald-700">{subscriptionSuccess.price} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-bold">دورة الغداء اليومية:</span>
                    <span className="font-bold">{subscriptionSuccess.deliverySlot}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <a
                    href={`https://wa.me/201065272373?text=${encodeURIComponent(`أهلاً بمطبخ لقمة، أنا اشتركت في ${subscriptionSuccess.planTitle} برقم: ${subscriptionSuccess.subId}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>تأكيد الاشتراك عبر واتساب</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubscribeModalOpen(false);
                      setSubscriptionSuccess(null);
                    }}
                    className="py-3 px-4 rounded-xl border border-stone-300 text-xs font-bold"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitSubscription} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <h3 className="font-black text-base text-[#1F1713] dark:text-white">
                      استكمال الاشتراك في {activePlanData.title}
                    </h3>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                      {currentPrice} ج.م ({billingCycle === 'monthly' ? 'شهرياً' : 'أسبوعياً'} - {daysPerWeek} أيام/أسبوع)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubscribeModalOpen(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">الاسم بالكامل</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسم المشترك أو اسم الشركة"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">رقم الموبايل (واتساب)</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">المنطقة والحي</label>
                    <input
                      type="text"
                      required
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      placeholder="المعادي / التجمع / زايد..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">العنوان بالتفصيل (الشركة / العمارة / الدور)</label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="اسم الشارع، رقم العمارة، الدور، رقم الشقة أو المكتب"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">دورة وموعد وصول الغداء اليومي</label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="دورة غداء أولى: 1:30 ظهراً إلى 3:00 عصراً (مدارس ومكاتب)">
                      دورة غداء أولى: 1:30 ظهراً إلى 3:00 عصراً (مدارس ومكاتب)
                    </option>
                    <option value="دورة غداء ثانية: 3:30 عصراً إلى 5:30 مساءً (موظفين)">
                      دورة غداء ثانية: 3:30 عصراً إلى 5:30 مساءً (موظفين)
                    </option>
                    <option value="دورة عشاء ومساء: 6:30 مساءً إلى 8:30 مساءً">
                      دورة عشاء ومساء: 6:30 مساءً إلى 8:30 مساءً
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">نَفَس الأكل وملاحظات الدايت (اختياري)</label>
                  <input
                    type="text"
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    placeholder="ملح خفيف للضغط، بدون دهون للسكر، بدون شطة للأطفال..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">طريقة السداد المفضلة</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`p-2 rounded-xl border text-center font-bold ${
                        paymentMethod === 'instapay' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-stone-300'
                      }`}
                    >
                      InstaPay
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vodafone')}
                      className={`p-2 rounded-xl border text-center font-bold ${
                        paymentMethod === 'vodafone' ? 'border-red-600 bg-red-50 text-red-700' : 'border-stone-300'
                      }`}
                    >
                      فودافون كاش
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2 rounded-xl border text-center font-bold ${
                        paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-stone-300'
                      }`}
                    >
                      فيزا / كارت
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#26472A] hover:bg-[#1E3922] disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>تأكيد الاشتراك الآن ({currentPrice} ج.م)</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
