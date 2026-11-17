import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import FooterBoho from './components/FooterBoho';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import AIChefChatModal from './components/AIChefChatModal';
import FeastCalculatorModal from './components/FeastCalculatorModal';

// استيراد الصفحات المخصصة
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';
import MenuPage from './pages/MenuPage';
import BurgerPage from './pages/BurgerPage';
import SchedulePage from './pages/SchedulePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ReviewsPage from './pages/ReviewsPage';
import HealthyPage from './pages/HealthyPage';
import ReadyToCookPage from './pages/ReadyToCookPage';
import CheckoutPage from './pages/CheckoutPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import KitchenDisplayPage from './pages/KitchenDisplayPage';

function AppContent() {
  const { dir } = useLanguage();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isFeastOpen, setIsFeastOpen] = useState(false);

  useEffect(() => {
    const handleOpenAIChat = () => setIsAIChatOpen(true);
    const handleOpenFeast = () => setIsFeastOpen(true);

    window.addEventListener('loqma:open-ai-chat', handleOpenAIChat);
    window.addEventListener('loqma:open-feast-calculator', handleOpenFeast);

    return () => {
      window.removeEventListener('loqma:open-ai-chat', handleOpenAIChat);
      window.removeEventListener('loqma:open-feast-calculator', handleOpenFeast);
    };
  }, []);

  return (
    <div 
      className="min-h-screen bg-[#F7F4EF] dark:bg-[#120E0C] text-[#3D312A] dark:text-[#F7F4EF] flex flex-col font-sans selection:bg-[#8A9684] selection:text-white transition-colors duration-300" 
      dir={dir}
    >
      {/* شريط التنقل العلوي الموحد */}
      <Navbar />

      {/* محتوى الصفحات بحسب المسار */}
      <div className="flex-1">
        <Routes>
          {/* الصفحة الرئيسية */}
          <Route path="/" element={<HomePage />} />
          
          {/* صفحة جدول غداء الأسبوع المخصصة */}
          <Route path="/schedule" element={<SchedulePage />} />

          {/* صفحة اشتراكات وجبات البيت الشهرية والأسبوعية */}
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/subscribe" element={<SubscriptionsPage />} />

          {/* صفحة الأكل الصحي ومحسوب السعرات */}
          <Route path="/healthy" element={<HealthyPage />} />

          {/* صفحة متبل جاهز على التسوية والفرن */}
          <Route path="/ready-to-cook" element={<ReadyToCookPage />} />
          <Route path="/ready" element={<ReadyToCookPage />} />

          {/* صفحة عن لقمة وقصة المطبخ والجودة */}
          <Route path="/about" element={<AboutPage />} />

          {/* صفحة آراء وتقييمات العملاء */}
          <Route path="/reviews" element={<ReviewsPage />} />

          {/* صفحة تسجيل الدخول وإنشاء الحساب */}
          <Route path="/login" element={<LoginPage />} />

          {/* صفحة إتمام الطلب وبوابات الدفع المستقلة */}
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* صفحة تتبع تجهيز الوجبة المباشر في المطبخ */}
          <Route path="/track" element={<OrderTrackingPage />} />
          <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />

          {/* شاشة تشغيل المطبخ البيتي وتنظيم الطهي */}
          <Route path="/kitchen" element={<KitchenDisplayPage />} />
          <Route path="/kds" element={<KitchenDisplayPage />} />

          {/* صفحة الملف الشخصي وحساب العميل وسجل الطلبات */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* صفحة فهرس الأقسام الـ 16 الكاملة */}
          <Route path="/categories" element={<CategoriesPage />} />
          
          {/* صفحة القسم المخصصة لكل قسم من الـ 16 قسم */}
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          
          {/* صفحة المنيو الكامل مع التصفية والبحث في 114 طبق */}
          <Route path="/menu" element={<MenuPage />} />
          
          {/* أنيميشن تجميع الأطباق التفاعلي باستخدام GSAP */}
          <Route path="/burger" element={<BurgerPage />} />
          <Route path="/assembly" element={<BurgerPage />} />
        </Routes>
      </div>

      {/* درج السلة الجانبي المشترك لجميع الصفحات */}
      <CartDrawer />

      {/* زر محادثة الواتساب العائم المباشر لخدمة العملاء والطلبات */}
      <FloatingWhatsApp />

      {/* نوافذ الذكاء الاصطناعي والعزومات التفاعلية */}
      <AIChefChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <FeastCalculatorModal isOpen={isFeastOpen} onClose={() => setIsFeastOpen(false)} />

      {/* تذييل الصفحة البوهيمي المشترك */}
      <FooterBoho />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
