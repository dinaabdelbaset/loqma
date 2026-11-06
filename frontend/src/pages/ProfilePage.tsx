import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Clock, 
  RotateCcw, 
  LogOut, 
  CheckCircle2, 
  Package, 
  Sparkles, 
  FileText, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  getCustomerOrdersHistory, 
  syncAndFetchOrders, 
  type SavedCustomerOrder 
} from '../services/ordersHistory';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { reorderItems, setIsCartOpen, totalItems } = useCart();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<SavedCustomerOrder[]>(() => getCustomerOrdersHistory());
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'details'>('orders');

  // بيانات العنوان القابلة للتعديل
  const [savedAddress, setSavedAddress] = useState(() => {
    return localStorage.getItem('loqma_saved_address') || 'العبور، الحي السابع، شارع أحمد عرابي';
  });
  const [savedPhone, setSavedPhone] = useState(() => {
    return user?.phone || localStorage.getItem('loqma_saved_phone') || '01060401644';
  });
  const [addressSavedToast, setAddressSavedToast] = useState(false);

  // حماية الصفحة: إذا لم يكن المستخدم مسجلاً، يمكنه رؤية الطلبات المحفوظة محلياً أو يتم توجيهه للدخول
  useEffect(() => {
    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const fetched = await syncAndFetchOrders(user?.phone || savedPhone, user?.name);
        setOrders(fetched);
      } catch (e) {
        console.error('Error fetching orders:', e);
      } finally {
        setLoadingOrders(false);
      }
    };
    loadOrders();
  }, [user, savedPhone]);

  const handleCopyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedOrder(num);
    setTimeout(() => setCopiedOrder(null), 2000);
  };

  const handleReorder = (order: SavedCustomerOrder) => {
    if (!order.items || order.items.length === 0) return;
    reorderItems(order.items);
  };

  const handleLogout = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من تسجيل الخروج؟ سيتم تفريغ السلة الحالية.' : 'Are you sure you want to log out? Your current cart will be cleared.')) {
      logout();
      navigate('/');
    }
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('loqma_saved_address', savedAddress);
    localStorage.setItem('loqma_saved_phone', savedPhone);
    setAddressSavedToast(true);
    setTimeout(() => setAddressSavedToast(false), 2500);
  };

  // إحصائيات سريعة للعميل
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalOrdersCount = orders.length;

  return (
    <div className="min-h-screen bg-[#F7F4EF] dark:bg-[#120E0C] text-[#3D312A] dark:text-[#F7F4EF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* بطاقة رأس البروفايل الفاخرة */}
        <div className="bg-white dark:bg-[#1E1713] rounded-3xl p-6 sm:p-8 border border-[#D2C4B7] dark:border-[#382A20] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8A9684]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
              {/* صورة أو أيقونة العميل */}
              <div className="w-20 h-20 rounded-full bg-[#8A9684]/15 border-2 border-[#8A9684] flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-[#8A9684]" />
                )}
              </div>

              {/* الاسم والمعلومات */}
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-[#1F1713] dark:text-white font-serif-title">
                    {user?.name || (language === 'ar' ? 'ضيف لقمة الكريم' : 'Loqma Valued Guest')}
                  </h1>
                  <span className="text-[11px] font-bold bg-[#8A9684]/20 text-[#26472A] dark:text-[#A3D4A8] px-3 py-0.5 rounded-full border border-[#8A9684]/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{language === 'ar' ? 'عميل مميز 🌟' : 'VIP Diner 🌟'}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#55453B] dark:text-[#D6C9BD]">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#8A9684]" />
                    <span dir="ltr">{savedPhone}</span>
                  </span>
                  {user?.email && (
                    <span className="text-xs">
                      • {user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات السريعة */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="bg-[#8A9684]/15 hover:bg-[#8A9684]/25 text-[#26472A] dark:text-[#A3D4A8] px-4 py-2 rounded-xl text-xs font-bold border border-[#8A9684]/30 transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'ar' ? 'السلة' : 'Cart'}</span>
                {totalItems > 0 && (
                  <span className="bg-[#8A9684] text-white px-1.5 py-0.2 rounded-full text-[10px]">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 transition-all flex items-center gap-1.5 cursor-pointer"
                title={language === 'ar' ? 'تسجيل الخروج وتفريغ السلة' : 'Logout and clear cart'}
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'ar' ? 'خروج وتفريغ السلة' : 'Logout & Clear Cart'}</span>
              </button>
            </div>
          </div>

          {/* شريط الإحصائيات الفورية */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-[#D2C4B7]/40 dark:border-[#382A20]">
            <div className="bg-[#FAF7F2] dark:bg-[#241A14] p-3.5 rounded-2xl border border-[#EDE2D4] dark:border-[#382A20] text-center">
              <span className="text-[11px] text-[#6E5D53] dark:text-[#A09383] block mb-1">
                {language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
              </span>
              <span className="text-lg font-black text-[#1F1713] dark:text-white">
                {totalOrdersCount}
              </span>
            </div>

            <div className="bg-[#FAF7F2] dark:bg-[#241A14] p-3.5 rounded-2xl border border-[#EDE2D4] dark:border-[#382A20] text-center">
              <span className="text-[11px] text-[#6E5D53] dark:text-[#A09383] block mb-1">
                {language === 'ar' ? 'إجمالي المصروف' : 'Total Spent'}
              </span>
              <span className="text-lg font-black text-[#26472A] dark:text-[#A3D4A8]">
                {totalSpent} {t('currency')}
              </span>
            </div>

            <div className="bg-[#FAF7F2] dark:bg-[#241A14] p-3.5 rounded-2xl border border-[#EDE2D4] dark:border-[#382A20] text-center">
              <span className="text-[11px] text-[#6E5D53] dark:text-[#A09383] block mb-1">
                {language === 'ar' ? 'آخر طلبية' : 'Latest Order'}
              </span>
              <span className="text-xs font-bold text-[#1F1713] dark:text-white truncate block">
                {orders[0] ? orders[0].orderNumber : '—'}
              </span>
            </div>

            <div className="bg-[#FAF7F2] dark:bg-[#241A14] p-3.5 rounded-2xl border border-[#EDE2D4] dark:border-[#382A20] text-center">
              <span className="text-[11px] text-[#6E5D53] dark:text-[#A09383] block mb-1">
                {language === 'ar' ? 'ضمان الرضا' : 'Guarantee'}
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100%</span>
              </span>
            </div>
          </div>
        </div>

        {/* التبويبات: سجل الطلبات / تفاصيل العنوان */}
        <div className="flex items-center gap-3 border-b border-[#D2C4B7] dark:border-[#382A20] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#3D312A] text-white dark:bg-amber-600 shadow-sm'
                : 'bg-white dark:bg-[#1E1713] text-[#55453B] dark:text-[#D6C9BD] hover:bg-black/5'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{language === 'ar' ? 'سجل طلباتي السابقة' : 'My Orders History'} ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'details'
                ? 'bg-[#3D312A] text-white dark:bg-amber-600 shadow-sm'
                : 'bg-white dark:bg-[#1E1713] text-[#55453B] dark:text-[#D6C9BD] hover:bg-black/5'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{language === 'ar' ? 'عنوان التوصيل وبياناتي' : 'Delivery Address & Details'}</span>
          </button>
        </div>

        {/* محتوى تبويب سجل الطلبات */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E1713] rounded-3xl border border-[#D2C4B7] dark:border-[#382A20]">
                <div className="w-8 h-8 border-3 border-[#8A9684] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#55453B] dark:text-[#D6C9BD]">
                  {language === 'ar' ? 'جاري تحميل سجل طلباتك...' : 'Loading your orders...'}
                </p>
              </div>
            ) : orders.length === 0 ? (
              /* حالة عدم وجود طلبات سابقة */
              <div className="text-center py-16 px-6 bg-white dark:bg-[#1E1713] rounded-3xl border border-[#D2C4B7] dark:border-[#382A20] space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#8A9684]/15 text-[#8A9684] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#1F1713] dark:text-white">
                  {language === 'ar' ? 'لا توجد طلبات سابقة حتى الآن' : 'No previous orders yet'}
                </h3>
                <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] max-w-md mx-auto leading-relaxed">
                  {language === 'ar' 
                    ? 'سفرة لقمة في انتظارك! استكشف تشكيلة الطواجن الفلاحي وصواني الفرن والوجبات الصحية المطهوة بسمن بلدي صافي.'
                    : 'Explore authentic Egyptian dishes, slow-cooked clay tags, and healthy options made with 100% pure ghee.'
                  }
                </p>
                <div className="pt-2">
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-white px-6 py-3 rounded-full text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <span>{language === 'ar' ? 'تصفح قائمة الطعام الآن' : 'Browse Food Menu'}</span>
                    {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </Link>
                </div>
              </div>
            ) : (
              /* قائمة كروت الطلبات السابقة */
              orders.map((order) => {
                const isExpanded = expandedOrderId === order.orderNumber;
                const formattedDate = new Date(order.createdAt).toLocaleDateString(
                  language === 'ar' ? 'ar-EG' : 'en-US',
                  {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                );

                return (
                  <div
                    key={order.orderNumber}
                    className="bg-white dark:bg-[#1E1713] rounded-3xl border border-[#D2C4B7] dark:border-[#382A20] shadow-sm overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* شريط معلومات الطلب الرئيسي */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D2C4B7]/40 dark:border-[#382A20]">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-black text-sm text-[#1F1713] dark:text-white bg-[#FAF7F2] dark:bg-[#261D17] px-3 py-1 rounded-xl border border-[#D2C4B7]/60 dark:border-[#382A20] flex items-center gap-1.5">
                            <span>#{order.orderNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyOrderNumber(order.orderNumber)}
                              className="text-[#8A9684] hover:text-[#26472A] p-0.5"
                              title="نسخ رقم الطلب"
                            >
                              {copiedOrder === order.orderNumber ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </span>

                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{order.paymentStatus || (language === 'ar' ? 'مؤكد' : 'Confirmed')}</span>
                          </span>

                          <span className="text-[11px] font-semibold text-[#6E5D53] dark:text-[#A09383] flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-[#8A9684]" />
                            <span>{order.paymentMethod}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#6E5D53] dark:text-[#A09383]">
                          <Clock className="w-3.5 h-3.5 text-[#8A9684]" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      {/* إجمالي السعر وزر إعادة الطلب */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#D2C4B7]/30">
                        <div className="text-right sm:text-left">
                          <span className="text-[10px] text-[#6E5D53] dark:text-[#A09383] block">
                            {language === 'ar' ? 'إجمالي الطلب' : 'Total'}
                          </span>
                          <span className="text-base sm:text-lg font-black text-[#26472A] dark:text-[#A3D4A8]">
                            {order.totalPrice} {t('currency')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="bg-[#8A9684] hover:bg-[#6F7B6A] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer transform active:scale-95"
                          title={language === 'ar' ? 'إضافة جميع أصناف هذا الطلب للسلة فوراً' : 'Reorder items to cart'}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'إعادة الطلب ↺' : 'Reorder ↺'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.orderNumber)}
                          className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#261D17] border border-[#D2C4B7]/60 text-[#3D312A] dark:text-[#D6C9BD] hover:bg-[#EAE3D9] transition-colors"
                          title={isExpanded ? 'طي التفاصيل' : 'عرض الأصناف'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* قائمة الأصناف (تظهر موسعة أو قابلة للطي) */}
                    <div className={`p-5 sm:p-6 bg-[#FAF7F2]/50 dark:bg-[#241A14]/40 space-y-3 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
                      <div className="text-xs font-bold text-[#1F1713] dark:text-white mb-2 flex items-center justify-between">
                        <span>{language === 'ar' ? 'الأصناف والوجبات المطلوبة:' : 'Ordered Items:'}</span>
                        <span className="text-[#6E5D53] dark:text-[#A09383] text-[11px]">
                          {order.items?.length || 0} {language === 'ar' ? 'صنف' : 'items'}
                        </span>
                      </div>

                      <div className="divide-y divide-[#D2C4B7]/30 dark:divide-[#382A20]">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-[#D2C4B7]/50"
                                />
                              )}
                              <div>
                                <span className="font-bold text-[#1F1713] dark:text-white block">
                                  {item.name}
                                </span>
                                {item.size && (
                                  <span className="text-[10px] text-[#6E5D53] dark:text-[#A09383]">
                                    {language === 'ar' ? `الحجم: ${item.size}` : `Size: ${item.size}`}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-left">
                              <span className="text-[#6E5D53] dark:text-[#A09383] font-mono">
                                × {item.quantity}
                              </span>
                              <span className="font-bold text-[#1F1713] dark:text-white">
                                {item.total || item.price * item.quantity} {t('currency')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* عنوان وملاحظات التوصيل الخاصة بالطلب */}
                      <div className="pt-3 border-t border-[#D2C4B7]/30 dark:border-[#382A20] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#55453B] dark:text-[#D6C9BD]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#8A9684]" />
                          <span>{order.customerAddress}</span>
                        </span>
                        {order.notes && (
                          <span className="italic bg-[#FAF5EE] dark:bg-[#1E1713] px-2 py-0.5 rounded-md border border-[#D2C4B7]/40">
                            "{order.notes}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* محتوى تبويب تفاصيل العنوان والعميل */}
        {activeTab === 'details' && (
          <div className="bg-white dark:bg-[#1E1713] rounded-3xl p-6 sm:p-8 border border-[#D2C4B7] dark:border-[#382A20] shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-base font-bold text-[#1F1713] dark:text-white">
              <FileText className="w-5 h-5 text-[#8A9684]" />
              <h3>{language === 'ar' ? 'بيانات التوصيل والتواصل المحفوظة' : 'Saved Delivery & Contact Information'}</h3>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mb-1.5">
                  {language === 'ar' ? 'اسم العميل الكريم' : 'Full Name'}
                </label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || (language === 'ar' ? 'دينا عبد الباسط' : 'Guest')}
                  className="w-full bg-[#FAF7F2] dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-4 py-2.5 text-xs text-[#55453B] dark:text-white outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mb-1.5">
                  {language === 'ar' ? 'رقم الهاتف للتوصيل والتأكيد' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={savedPhone}
                  onChange={(e) => setSavedPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full bg-white dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-4 py-2.5 text-xs text-[#1F1713] dark:text-white focus:border-[#8A9684] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#55453B] dark:text-[#D6C9BD] mb-1.5">
                  {language === 'ar' ? 'عنوان التوصيل الدائم (المنزل / العمل)' : 'Delivery Address'}
                </label>
                <textarea
                  rows={3}
                  value={savedAddress}
                  onChange={(e) => setSavedAddress(e.target.value)}
                  placeholder={language === 'ar' ? 'اسم المنطقة، الشارع، رقم العمارة، الشقة...' : 'Street, building, apartment...'}
                  className="w-full bg-white dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl p-3 text-xs text-[#1F1713] dark:text-white focus:border-[#8A9684] outline-none"
                />
              </div>

              {addressSavedToast && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ar' ? 'تم حفظ وتحديث بيانات التوصيل بنجاح!' : 'Delivery details saved successfully!'}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#3D312A] dark:bg-amber-600 hover:bg-[#2B221D] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {language === 'ar' ? 'حفظ البيانات للاستخدام في السلة' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
