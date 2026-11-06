import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, MessageCircle, MapPin, Heart, Star, Sparkles, ChefHat } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FooterBoho() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-[#241A14] text-[#F7F4EF] border-t-2 border-[#D2C4B7]/20 pt-14 pb-8 px-5 sm:px-10 transition-colors">
      
      {/* 1. شريط الضمان والدفع المصري المعتمد */}
      <div className="max-w-6xl mx-auto pb-10 border-b border-white/15 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* شارة الضمان */}
        <div className="flex items-center gap-3.5 bg-white/10 p-4 sm:p-5 rounded-2xl border border-white/15 backdrop-blur-xs">
          <div className="w-12 h-12 rounded-xl bg-[#2D4F35] flex items-center justify-center shrink-0 shadow-lg border border-white/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-black text-sm sm:text-base text-white">{t('footerGuaranteeTitle')}</h4>
            <p className="text-xs text-[#E8DFD5] leading-relaxed mt-0.5">
              {t('footerGuaranteeDesc')}
            </p>
          </div>
        </div>

        {/* طرق الدفع المصرية المدعومة */}
        <div className={`flex flex-col items-start ${language === 'ar' ? 'md:items-end text-right' : 'md:items-start text-left'} gap-2.5`}>
          <span className="text-xs font-black text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('footerPayments')}</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white/15 hover:bg-white/20 border border-white/25 px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-xs">
              ⚡ InstaPay
            </span>
            <span className="bg-white/15 hover:bg-white/20 border border-white/25 px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-xs">
              📱 Vodafone Cash
            </span>
            <span className="bg-white/15 hover:bg-white/20 border border-white/25 px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-xs">
              💳 Visa & Mastercard
            </span>
            <span className="bg-white/15 hover:bg-white/20 border border-white/25 px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-xs">
              💵 {language === 'ar' ? 'كاش عند الاستلام' : 'Cash on Delivery'}
            </span>
          </div>
        </div>

      </div>

      {/* 2. الأعمدة الأربعة للفوتر */}
      <div className="max-w-6xl mx-auto py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* عن لقمة */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-black text-amber-400 font-serif-title">LOQMA</span>
            <span className="text-xl font-bold text-white border-r-2 border-white/20 pr-2 font-serif-title">
              {language === 'ar' ? 'لقمة' : 'Kitchen'}
            </span>
          </div>
          <p className="text-xs text-[#E8DFD5] leading-relaxed mb-4 font-medium">
            {t('footerAboutText')}
          </p>
          <div className="flex items-center gap-2 text-xs text-[#E8DFD5] font-semibold">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{language === 'ar' ? 'القاهرة الكبرى، التجمع، المعادي، زايد' : 'Greater Cairo, New Cairo, Maadi, Zayed'}</span>
          </div>
        </div>

        {/* أقسام المطبخ السريعة */}
        <div>
          <h4 className="font-black text-sm text-white mb-3 flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span>{t('footerKitchenSections')}</span>
          </h4>
          <ul className="space-y-2 text-xs text-[#E8DFD5] font-semibold">
            <li>
              <Link to="/healthy" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="text-emerald-400">🥗</span>
                <span>{language === 'ar' ? 'أكل صحي محسوب السعرات' : 'Healthy Low-Calorie Food'}</span>
              </Link>
            </li>
            <li>
              <Link to="/ready-to-cook" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="text-amber-400">🔥</span>
                <span>{language === 'ar' ? 'متبل جاهز على التسوية والفرن' : 'Ready to Cook & Bake'}</span>
              </Link>
            </li>
            <li>
              <Link to="/schedule" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="text-blue-400">📅</span>
                <span>{language === 'ar' ? 'جدول غداء الأسبوع' : 'Weekly Lunch Schedule'}</span>
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="text-orange-400">🍲</span>
                <span>{language === 'ar' ? 'قائمة الطعام الكاملة (114 طبق)' : 'Full Menu (114 Dishes)'}</span>
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                <span className="text-purple-400">🍱</span>
                <span>{language === 'ar' ? 'فهرس الأقسام الـ 16' : '16 Food Categories'}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* صفحات مهمة ومواعيد العمل */}
        <div>
          <h4 className="font-black text-sm text-white mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{t('footerPages')}</span>
          </h4>
          <ul className="space-y-2 text-xs text-[#E8DFD5] font-semibold mb-4">
            <li>
              <Link to="/about" className="hover:text-amber-300 transition-colors">
                • {language === 'ar' ? 'قصة لقمة ومعايير الجودة' : 'About Loqma & Quality Standards'}
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                <span>• {language === 'ar' ? 'آراء وتقييمات العملاء' : 'Customer Reviews'}</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-current" /> 4.9
                </span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-amber-300 transition-colors">
                • {language === 'ar' ? 'الملف الشخصي وسجل الطلبات' : 'My Profile & Order History'}
              </Link>
            </li>
          </ul>

          <div className="space-y-1.5 text-xs text-[#E8DFD5] pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>{language === 'ar' ? 'استقبال الطلبات: 9:00 ص - 6:00 م' : 'Orders open: 9:00 AM - 6:00 PM'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span>{language === 'ar' ? 'توصيل الغداء الساخن: 1:00 ظ - 7:00 م' : 'Hot Lunch Delivery: 1:00 PM - 7:00 PM'}</span>
            </div>
          </div>
        </div>

        {/* خدمة العملاء والتواصل */}
        <div>
          <h4 className="font-black text-sm text-white mb-3">{t('footerContactChef')}</h4>
          <p className="text-xs text-[#E8DFD5] mb-3 font-medium">
            {language === 'ar' 
              ? 'لطلبات العزومات الكبيرة، الاشتراكات الشهرية، أو الوجبات المخصصة:' 
              : 'For catering inquiries, weekly subscriptions, or custom dietary meals:'
            }
          </p>
          <a
            href="https://wa.me/201065272373"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md mb-2.5 cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>{t('footerWhatsAppBtn')}</span>
          </a>
          <span className="block text-xs text-white font-bold">
            📞 {language === 'ar' ? 'خدمة العملاء:' : 'Hotline:'} <span className="text-amber-300 font-mono tracking-wider">01065272373</span>
          </span>
        </div>

      </div>

      {/* 3. شريط حقوق الملكية السفلي */}
      <div className="max-w-6xl mx-auto pt-6 border-t border-white/15 text-center text-xs text-[#E8DFD5] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>{t('footerRights')}</span>
        <div className="flex items-center gap-1.5 font-bold">
          <span>{t('footerMadeWithLove')}</span>
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
        </div>
      </div>
    </footer>
  );
}
