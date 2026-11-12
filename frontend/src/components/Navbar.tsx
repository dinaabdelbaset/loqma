import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sparkles, User as UserIcon, Moon, Sun, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  // إدارة حالة الوضع الليلي / النهاري (Dark / Light Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('loqma-theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('loqma-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('loqma-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const navLinks = [
    { name: t('navHome'), path: '/' },
    { name: t('navMenu'), path: '/menu' },
    { name: t('navHealthy'), path: '/healthy' },
    { name: t('navReadyToCook'), path: '/ready-to-cook' },
    { name: t('navSchedule'), path: '/schedule' },
    { name: t('navReviews'), path: '/reviews' },
    { name: t('navAbout'), path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F7F4EF]/95 dark:bg-[#120E0C]/95 backdrop-blur-xl border-b border-[#D2C4B7]/60 dark:border-[#382A20] transition-colors duration-300 text-[#3D312A] dark:text-[#F7F4EF] shadow-xs">
      {/* شريط الإعلان العلوي فائق النعومة والرشاقة */}
      <div className="bg-[#2D4F35] text-[#F7F4EF] text-[10px] sm:text-[11px] py-1.5 px-4 font-medium tracking-wide flex items-center justify-center text-center shadow-xs">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
          <span>{t('announcement')}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* الشعار والهوية المودرن التحريرية الفاخرة (Editorial Luxury) */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#3D312A] dark:bg-amber-600 text-[#F7F4EF] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300 shrink-0">
              <span className="font-serif text-sm font-bold">لـ</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span 
                className="text-lg sm:text-2xl font-black text-[#3D312A] dark:text-white tracking-wider font-serif"
                style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}
              >
                LOQMA
              </span>
              <span className="text-[11px] sm:text-xs text-[#8A9684] dark:text-amber-300 font-bold tracking-widest border-r border-[#D2C4B7] dark:border-[#382A20] pr-1.5 sm:pr-2 mr-0.5 hidden xs:inline">
                لـُقـْمـَة
              </span>
            </div>
          </Link>

          {/* روابط التنقل المودرن للشاشات الكبيرة */}
          <nav className="hidden md:flex items-center gap-1 bg-white/70 dark:bg-[#1E1713]/90 p-1 rounded-full border border-[#D2C4B7]/60 dark:border-[#382A20] backdrop-blur-md shadow-xs">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1F1713] dark:bg-amber-600 text-[#F7F4EF] shadow-xs'
                      : 'text-[#1F1713] dark:text-[#E8DFD5] hover:text-[#26472A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* أزرار الموبايل: السلة + القائمة فقط | الشاشات الكبيرة: كل الأزرار */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* زر اللغة - مخفي على الموبايل (موجود في القائمة المنسدلة) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="hidden md:flex p-1.5 lg:px-3 lg:py-1.5 rounded-full border border-[#D2C4B7] dark:border-[#3D2E24] bg-white dark:bg-[#1E1713] text-[#3D312A] dark:text-amber-300 hover:bg-[#F7F4EF] dark:hover:bg-[#261D17] transition-all duration-300 shadow-xs items-center gap-1.5 cursor-pointer"
              title={language === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
              aria-label="تبديل اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-[#8A9684]" />
              <span className="text-[11px] font-bold hidden lg:inline">
                {language === 'ar' ? 'English' : 'عربي'}
              </span>
            </button>

            {/* زر الثيم - مخفي على الموبايل */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden md:flex p-1.5 lg:px-3 lg:py-1.5 rounded-full border border-[#D2C4B7] dark:border-[#3D2E24] bg-white dark:bg-[#1E1713] text-[#3D312A] dark:text-amber-300 hover:bg-[#F7F4EF] dark:hover:bg-[#261D17] transition-all duration-300 shadow-xs items-center gap-1.5 cursor-pointer"
              title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
              aria-label="تبديل وضع الإضاءة"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#3D312A]" />
              )}
            </button>

            {/* زر تسجيل الدخول - مخفي على الموبايل */}
            <Link
              to={isLoggedIn ? '/profile' : '/login'}
              className={`hidden md:flex items-center gap-1.5 p-1.5 lg:px-3.5 lg:py-2 rounded-full font-bold text-xs transition-all duration-300 border ${
                isLoggedIn
                  ? 'bg-[#8A9684]/15 border-[#8A9684]/40 text-[#26472A] dark:text-[#A3D4A8] hover:bg-[#8A9684]/25'
                  : 'bg-white hover:bg-[#F7F4EF] border-[#D2C4B7] text-[#3D312A] shadow-xs hover:border-[#8A9684]'
              }`}
              title={isLoggedIn ? `بروفايلي (${user?.name})` : t('navLogin')}
            >
              {isLoggedIn && user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-4 h-4 rounded-full object-cover border border-[#8A9684]" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-[#8A9684]" />
              )}
              <span className="text-[11px] hidden lg:inline">
                {isLoggedIn ? (user?.name?.split(' ')[0] || t('navProfile')) : t('navLogin')}
              </span>
            </Link>

            {/* زر السلة - ظاهر دايمًا */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 bg-[#3D312A] hover:bg-[#2B221D] text-[#F7F4EF] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold shadow-md shadow-[#3D312A]/20 transition-all duration-300 active:scale-95 cursor-pointer text-xs border border-white/10"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('navCart')}</span>
              {totalItems > 0 && (
                <span className="hidden md:inline bg-[#8A9684] px-1.5 py-0.5 rounded-full text-[10px] font-black">
                  {subtotal} {t('currency')}
                </span>
              )}
              {totalItems > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* زر القائمة للموبايل فقط */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/60 dark:bg-[#1E1713] border border-[#D2C4B7] dark:border-[#382A20] text-[#3D312A] dark:text-white hover:bg-white transition-colors cursor-pointer"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* القائمة المنسدلة للموبايل */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F4EF] dark:bg-[#1E1713] border-b border-[#D2C4B7] dark:border-[#382A20] px-4 pt-2 pb-4 space-y-1 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-xs font-bold text-[#3D312A] dark:text-[#D6C9BD] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to={isLoggedIn ? '/profile' : '/login'}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#8A9684] bg-white dark:bg-[#241A14] border border-[#D2C4B7]/60 dark:border-[#382A20] hover:bg-[#8A9684]/10 transition-colors mt-2"
          >
            <UserIcon className="w-4 h-4" />
            <span>{isLoggedIn ? `${t('navProfile')} (${user?.name})` : t('navLogin')}</span>
          </Link>

          {/* زر تبديل اللغة للموبايل */}
          <button
            type="button"
            onClick={() => {
              toggleLanguage();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-[#3D312A] dark:text-[#F7F4EF] bg-white dark:bg-[#1E1713] border border-[#D2C4B7]/60 dark:border-[#3D2E24] transition-colors mt-2"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#8A9684]" />
              <span>{language === 'ar' ? 'English Language' : 'اللغة العربية'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF5EE] dark:bg-[#261D17] text-[#8A9684] dark:text-amber-300 border border-[#D2C4B7]/40">
              {language === 'ar' ? 'EN' : 'AR'}
            </span>
          </button>

          {/* زر تبديل الثيم للموبايل */}
          <button
            type="button"
            onClick={() => {
              toggleTheme();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-[#3D312A] dark:text-[#F7F4EF] bg-white dark:bg-[#1E1713] border border-[#D2C4B7]/60 dark:border-[#3D2E24] transition-colors mt-2"
          >
            <span className="flex items-center gap-2">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#3D312A]" />}
              <span>{isDarkMode ? 'التحويل للوضع النهاري (Light)' : 'التحويل للوضع الليلي (Dark)'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF5EE] dark:bg-[#261D17] text-[#8A9684] dark:text-amber-300 border border-[#D2C4B7]/40">
              {isDarkMode ? 'مفعل 🌙' : 'مفعل ☀️'}
            </span>
          </button>
        </div>
      )}
    </header>
  );
}
