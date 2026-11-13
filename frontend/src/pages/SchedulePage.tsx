import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Flame, 
  Heart,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import WeeklySchedule from '../components/WeeklySchedule';
import { useLanguage } from '../context/LanguageContext';

export default function SchedulePage() {
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const BreadcrumbArrow = isEn ? ChevronRight : ChevronLeft;

  return (
    <div className="bg-[#F7F4EF] dark:bg-[#120E0C] text-[#1F1713] dark:text-[#F7F4EF] min-h-screen py-8 sm:py-12 transition-colors" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* شريط المسار (Breadcrumbs) */}
        <nav className="flex items-center gap-2 text-xs text-[#55453B] dark:text-[#D6C9BD] border-b border-[#D2C4B7]/50 dark:border-[#382A20] pb-3">
          <Link to="/" className="hover:text-[#8A9684] transition-colors">{t('navHome')}</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 text-[#8A9684]" />
          <span className="font-bold text-[#26472A] dark:text-[#A3D4A8]">{t('navSchedule')}</span>
        </nav>

        {/* ترويسة الصفحة الفاخرة */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-4 py-1.5 rounded-full text-xs font-bold border border-[#8A9684]/30 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#8A9684]" />
            <span>{isEn ? 'Fresh Baladi Cooking Daily (Sunday - Friday)' : 'طهي فلاحي طازج يومياً من الأحد إلى الجمعة'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1F1713] dark:text-white font-serif-title leading-tight">
            {isEn ? 'Loqma Weekly Lunch Schedule' : 'جدول غداء الأسبوع مع "لقمة"'}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#55453B] dark:text-[#D6C9BD] leading-relaxed">
            {isEn
              ? 'Never wonder "What are we having for lunch tomorrow?". Every day we prepare one signature full lunch meal with 100% baladi cow ghee in limited batches. Order today\'s meal now or subscribe to a weekly pass!'
              : 'ارتاح من حيرة "هنتغدى إيه بكره؟".. بنطبخ كل يوم وجبة غداء رئيسية واحدة كاملة بالسمن البلدي وبكميات محدودة لضمان أقصى طزاجة. اطلب وجبة اليوم فوراً أو اشترك في الباقة لراحة بالك وتوفير مصاريفك!'
            }
          </p>

          {/* مزايا الاشتراك السريع */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-bold text-[#1F1713] dark:text-[#D6C9BD]">
            <span className="flex items-center gap-1.5 bg-white dark:bg-[#1E1713] px-3 py-1.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] shadow-xs">
              <Truck className="w-3.5 h-3.5 text-[#8A9684]" />
              <span>{isEn ? 'Hot Delivery 1:00 - 3:30 PM' : 'توصيل ساخن 1:00 - 3:30 ظهراً'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white dark:bg-[#1E1713] px-3 py-1.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isEn ? '100% Hot Food Guarantee' : 'ضمان سخونة الأكل 100%'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white dark:bg-[#1E1713] px-3 py-1.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? 'Pure Cow Ghee & Fresh Greens' : 'سمن فلاحي ومكونات طازة'}</span>
            </span>
          </div>
        </div>

        {/* محتوى جدول الأسبوع التفاعلي الكامل */}
        <div className="pt-2">
          <WeeklySchedule />
        </div>

        {/* الأسئلة الشائعة حول جدول واشتراكات الأسبوع */}
        <div className="bg-white dark:bg-[#1E1713] rounded-3xl p-6 sm:p-10 border border-[#D2C4B7] dark:border-[#382A20] shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#26472A] dark:text-[#A3D4A8] uppercase tracking-wider">
              {isEn ? 'Everything You Need to Know' : 'كل ما تحتاج معرفته'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#1F1713] dark:text-white font-serif-title">
              {isEn ? 'Frequently Asked Questions about Lunch Schedule' : 'الأسئلة الشائعة حول جدول واشتراك الغداء'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
            <div className="bg-[#F7F4EF] dark:bg-[#241A14] p-4 sm:p-5 rounded-2xl border border-[#D2C4B7]/60 dark:border-[#382A20] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1F1713] dark:text-white">
                <Clock className="w-4 h-4 text-[#8A9684]" />
                <span>{isEn ? 'When is lunch delivered?' : 'متى يتم توصيل وجبة الغداء؟'}</span>
              </div>
              <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed">
                {isEn
                  ? 'We cook fresh every morning. Couriers leave in insulated thermal bags to deliver your meal piping hot between 1:00 PM and 3:30 PM.'
                  : 'يتم الطهي طازجاً صباح كل يوم، وتخرج الوجبات مع المناديب داخل حقائب حرارية معزولة لتصلك ساخنة في ميعاد الغداء المحدد بين 1:00 ظهراً و 3:30 عصراً.'
                }
              </p>
            </div>

            <div className="bg-[#F7F4EF] dark:bg-[#241A14] p-4 sm:p-5 rounded-2xl border border-[#D2C4B7]/60 dark:border-[#382A20] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1F1713] dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isEn ? 'Can I order for a single day only?' : 'هل يمكنني طلب وجبة ليوم واحد فقط؟'}</span>
              </div>
              <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed">
                {isEn
                  ? 'Yes, absolutely! You can order today\'s lunch as a one-time order, or subscribe to the weekly pass for discounted rates and guaranteed delivery.'
                  : 'نعم بالتأكيد! يمكنك طلب وجبة اليوم الحالي كطلب فردي في أي وقت، أو الاشتراك في الباقة الأسبوعية للحصول على خصم خاص وتوصيل يومي مضمون.'
                }
              </p>
            </div>

            <div className="bg-[#F7F4EF] dark:bg-[#241A14] p-4 sm:p-5 rounded-2xl border border-[#D2C4B7]/60 dark:border-[#382A20] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1F1713] dark:text-white">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isEn ? 'What if I need to postpone a subscription day?' : 'ماذا لو أردت إيقاف أو تأجيل يوم في الاشتراك؟'}</span>
              </div>
              <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed">
                {isEn
                  ? 'Simply message our WhatsApp support before 10:00 AM to postpone, and your day will roll over to the next cycle with no fees.'
                  : 'بكل بساطة، يمكنك إرسال رسالة واتساب لخدمة العملاء قبل الساعة 10:00 صباحاً لتأجيل وجبة اليوم، ويتم ترحيل رصيدك لليوم التالي دون أي رسوم إضافية.'
                }
              </p>
            </div>

            <div className="bg-[#F7F4EF] dark:bg-[#241A14] p-4 sm:p-5 rounded-2xl border border-[#D2C4B7]/60 dark:border-[#382A20] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1F1713] dark:text-white">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>{isEn ? 'Is the portion enough for one person?' : 'هل الوجبات تكفي فرداً واحداً؟'}</span>
              </div>
              <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] leading-relaxed">
                {isEn
                  ? 'Our portions are generous and hearty, packed with baladi cow ghee, complete with side rice, soup, salads, pickles, and hot bread.'
                  : 'وجباتنا غنية ومشبعة جداً بالسمن البلدي وتأتي مع أطباق جانبية متكاملة (أرز، شوربة، سلطات، مخلل، عيش طازج) تكفي فرداً كبيراً بأريحية تامة.'
                }
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
