import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FloatingWhatsApp() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const phoneNumber = '201065272373';
  const defaultMessage = isEn
    ? 'Hello Loqma Kitchen, I would like to inquire about today’s dishes and place an order.'
    : 'مرحباً مطبخ لقمة، أود الاستفسار عن أكلات اليوم وطلب أوردر ساخن.';

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label={isEn ? 'WhatsApp Customer Service' : 'خدمة عملاء واتساب'}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1F1713] dark:bg-[#2A1E17] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20 group cursor-pointer"
        title={isEn ? 'Chat with Loqma on WhatsApp (01065272373)' : 'تواصل مع مطبخ لقمة عبر واتساب (01065272373)'}
        aria-label="WhatsApp"
      >
        {/* أيقونة المحادثة المطابقة تماماً للفيديو والصورة */}
        <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white group-hover:scale-105 transition-transform" />

        {/* الشارة الحمراء رقم 1 */}
        <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-md border-2 border-white animate-pulse">
          1
        </span>

        {/* حلقة التوهج الخفيفة */}
        <span className="absolute inset-0 rounded-full bg-[#1F1713]/20 animate-ping -z-10" />
      </a>
    </aside>
  );
}
