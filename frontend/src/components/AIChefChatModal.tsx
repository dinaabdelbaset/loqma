import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  X, 
  Bot, 
  User, 
  ShoppingBag, 
  Check, 
  Mic, 
  MicOff, 
  Flame, 
  RotateCcw
} from 'lucide-react';
import { askAIChef, type RecommendedDish } from '../services/aiApi';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'chef';
  text: string;
  dishes?: RecommendedDish[];
  totalPrice?: number;
  time: string;
}

interface AIChefChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export default function AIChefChatModal({ isOpen, onClose, initialPrompt }: AIChefChatModalProps) {
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const { addToCart } = useCart();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [addedDishIds, setAddedDishIds] = useState<{ [id: number]: boolean }>({});
  const [dynamicChips, setDynamicChips] = useState<Array<{ label: string; text: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // الكبسولات السريعة الجاهزة للضغط
  const quickChips = isEn ? [
    { label: '💵 Budget: 280 EGP for two', text: 'I have 280 EGP and want a satisfying lunch for two who love clay tajines' },
    { label: '🥛 Dairy/Lactose-free meals', text: 'My child has a lactose allergy, what dishes are cooked with olive oil and zero dairy or ghee?' },
    { label: '👑 Family feast for 10', text: 'I have a family gathering of 10 people, suggest a royal tray feast' },
    { label: '🥗 Macro-calculated healthy', text: 'I want a high protein, low carb meal prep for fitness' },
    { label: '🍲 Best seller tajines', text: 'What is the chef\'s top signature tajine today?' }
  ] : [
    { label: '💵 معايا 280 جنيه لغداء شخصين', text: 'معايا 280 جنيه وعاوز غداء مشبع لشخصين بيحبوا الطواجن' },
    { label: '🥛 أكلات بدون سمنة أو لاكتوز', text: 'ابني عنده حساسية لاكتوز، إيه الأطباق اللي مطبوخة بزيت زيتون بدون سمنة أو ألبان؟' },
    { label: '👑 عزومة 10 أفراد لمة عيلة', text: 'عندي عزومة 10 أفراد لمة عيلة، اقترح لي صواني وسفرة تشرف' },
    { label: '🥗 أكل صحي محسوب الماكروز', text: 'عاوز وجبة دايت بروتين عالي وقليلة الكارب' },
    { label: '🍲 أشهر طاجن اليوم', text: 'إيه أشهر وأطعم طاجن فخار مسوى في بيت النار اليوم؟' }
  ];

  // رسالة الترحيب الأولى عند فتح الشات
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome: ChatMessage = {
        id: 'welcome',
        sender: 'chef',
        text: isEn
          ? 'Welcome! I am your AI Baladi Chef. Ask me anything: your budget, dietary allergies (lactose, gluten), party size, or cravings, and I will tailor the perfect countryside feast for you!'
          : 'يا هلا بيك في مطبخ لقمة! 🍲 أنا شيف لقمة الذكي خبير الطبخ البيتي المصري الفلاحي بالسمن البلدي 100%. اطلب مني أي حاجة: ميزانيتك، عدد أفرادك، حساسيات غذائية (زي اللاكتوز أو الجلوتين)، أو عزومتك، وأنا هظبطلك سفرة تفتح النفس فوراً!',
        time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcome]);

      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen, initialPrompt, isEn]);

  // التمرير التلقائي لأسفل المحادثة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    // تجهيز سياق المحادثة كـ Multi-turn memory زي ChatGPT
    const historyPayload = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    try {
      const data = await askAIChef(text.trim(), historyPayload, undefined, language);
      const chefMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'chef',
        text: isEn && data.reply_en ? data.reply_en : data.reply,
        dishes: data.recommended_dishes,
        totalPrice: data.total_estimated_price,
        time: new Date().toLocaleTimeString(isEn ? 'en-US' : 'ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, chefMsg]);

      if (data.quick_actions && data.quick_actions.length > 0) {
        setDynamicChips(
          data.quick_actions.map((qa) => ({
            label: isEn && qa.label_en ? qa.label_en : qa.label,
            text: isEn && qa.label_en ? qa.label_en : qa.label
          }))
        );
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAddDish = (dish: RecommendedDish) => {
    addToCart({
      id: dish.id,
      name: dish.name,
      description: dish.description,
      price: dish.price,
      categoryId: dish.categoryId || 'clay-tagines',
      image: dish.image,
      tag: dish.tag
    }, 1);

    setAddedDishIds((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setAddedDishIds((prev) => ({ ...prev, [dish.id]: false }));
    }, 1500);
  };

  const handleAddAllDishes = (dishes: RecommendedDish[]) => {
    dishes.forEach((d) => {
      addToCart({
        id: d.id,
        name: d.name,
        description: d.description,
        price: d.price,
        categoryId: d.categoryId || 'clay-tagines',
        image: d.image,
        tag: d.tag
      }, 1);
    });
  };

  // تفعيل الإدخال الصوتي (Voice Input)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isEn ? 'Speech recognition is not supported in this browser.' : 'خاصية التحدث الصوتي غير مدعومة في هذا المتصفح، جرب استخدام متصفح كروم.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isEn ? 'en-US' : 'ar-EG';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#18110D] rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] w-full max-w-2xl h-[88vh] max-h-[720px] flex flex-col shadow-2xl overflow-hidden transition-colors"
        dir={dir}
      >
        {/* ترويسة الشات */}
        <div className="p-4 sm:p-5 bg-[#FAF5EE] dark:bg-[#20150E] border-b border-[#D2C4B7] dark:border-[#382A20] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-[#2D4F35] text-white flex items-center justify-center shadow-md border border-white/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#18110D] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-[#1F1713] dark:text-white flex items-center gap-1.5 font-serif-title">
                  <span>{isEn ? 'AI Baladi Chef' : 'شيف لقمة الذكي (AI)'}</span>
                  <span className="text-amber-500 text-xs">✨</span>
                </h3>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-300/40">
                  {isEn ? 'Baladi Sommelier' : 'نَفَس فلاحي 100%'}
                </span>
              </div>
              <p className="text-[11px] text-[#55453B] dark:text-[#D6C9BD] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>{isEn ? 'Ready to customize your meal & budget' : 'متصل وجاهز لحساب ميزانيتك وترشيح وجبتك'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setInputMessage('');
                setDynamicChips([]);
              }}
              title={isEn ? 'Reset chat' : 'بدء محادثة جديدة'}
              className="p-2 text-stone-500 hover:text-[#1F1713] dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-[#1F1713] dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* الكبسولات السريعة الجاهزة (Quick Chips) */}
        <div className="px-4 py-2.5 bg-[#F7F4EF] dark:bg-[#1A120D] border-b border-[#D2C4B7]/60 dark:border-[#382A20] overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1.5 min-w-max">
            {(dynamicChips.length > 0 ? dynamicChips : quickChips).map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip.text)}
                disabled={loading}
                className="text-[11px] font-bold bg-white dark:bg-[#241A14] hover:bg-[#FAF5EE] dark:hover:bg-[#2E2018] text-[#1F1713] dark:text-[#F7F4EF] px-3 py-1.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1"
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* قائمة الرسائل في المحادثة */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white dark:bg-[#150F0B]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* أيقونة المرسل */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs text-xs ${
                msg.sender === 'user' 
                  ? 'bg-[#1F1713] dark:bg-amber-600 text-white' 
                  : 'bg-[#2D4F35] text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* فقاعة الرسالة */}
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#1F1713] dark:bg-amber-600 text-white rounded-tr-xs'
                  : 'bg-[#FAF5EE] dark:bg-[#20150E] text-[#1F1713] dark:text-[#F7F4EF] border border-[#D2C4B7] dark:border-[#382A20] rounded-tl-xs'
              }`}>
                <p className="font-medium whitespace-pre-wrap">{msg.text}</p>

                {/* كروت الأطباق المقترحة بداخل الرد */}
                {msg.dishes && msg.dishes.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-[#D2C4B7]/60 dark:border-white/10 space-y-2.5">
                    <span className="text-[11px] font-black text-[#26472A] dark:text-[#A3D4A8] flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Recommended Feast Selection:' : 'تشكيلة السفرة المقترحة لك:'}</span>
                    </span>

                    <div className="grid grid-cols-1 gap-2">
                      {msg.dishes.map((dish) => (
                        <div
                          key={dish.id}
                          className="bg-white dark:bg-[#18110D] rounded-xl p-2.5 border border-[#D2C4B7] dark:border-[#382A20] flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {dish.image && (
                              <img
                                src={dish.image}
                                alt={dish.name}
                                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#D2C4B7] dark:border-[#382A20]"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/images/categories/clay-tagines.jpg';
                                }}
                              />
                            )}
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-[#1F1713] dark:text-white truncate">
                                {dish.name}
                              </h4>
                              <p className="text-[10px] text-[#55453B] dark:text-[#D6C9BD] truncate">
                                {dish.description}
                              </p>
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                                {dish.price} {t('egp')}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddDish(dish)}
                            className={`p-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 flex items-center gap-1 ${
                              addedDishIds[dish.id]
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#1F1713] dark:bg-amber-600 text-white hover:bg-[#2B221D]'
                            }`}
                          >
                            {addedDishIds[dish.id] ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t('bestSellersAddedSuccess')}</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{isEn ? 'Add' : 'أضف'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* زر إضافة الوجبة بالكامل دفعة واحدة */}
                    <div className="pt-2 flex items-center justify-between">
                      {msg.totalPrice && msg.totalPrice > 0 && (
                        <span className="text-xs font-bold text-[#1F1713] dark:text-white">
                          {isEn ? 'Total: ' : 'الإجمالي: '}
                          <strong className="text-amber-600 dark:text-amber-400 font-serif text-sm">
                            {msg.totalPrice} {t('egp')}
                          </strong>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAddAllDishes(msg.dishes!)}
                        className="bg-[#2D4F35] hover:bg-[#243F2A] text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Add Whole Meal to Cart' : '🛒 أضف الوجبة بالكامل للسلة'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <span className="block text-[9px] text-stone-400 dark:text-stone-500 text-end mt-1">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {/* مؤشر تفكير الشيف والطهي */}
          {loading && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2D4F35] text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#FAF5EE] dark:bg-[#20150E] rounded-2xl p-3.5 border border-[#D2C4B7] dark:border-[#382A20] shadow-xs flex items-center gap-2 text-xs font-bold text-[#26472A] dark:text-[#A3D4A8]">
                <span className="w-2 h-2 rounded-full bg-[#8A9684] animate-ping" />
                <span>{isEn ? 'Chef is cooking your recommendation... 🍲' : 'الشيف بيفكر في أحسن أكلة وميزانية تناسبك... 🍲'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* مربع الإدخال وزر الصوت والإرسال */}
        <div className="p-3 sm:p-4 bg-[#FAF5EE] dark:bg-[#1E140F] border-t border-[#D2C4B7] dark:border-[#382A20]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* زر المايكروفون للإدخال الصوتي */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse border-red-500'
                  : 'bg-white dark:bg-[#261A14] text-[#1F1713] dark:text-[#F7F4EF] border-[#D2C4B7] dark:border-[#382A20] hover:text-amber-600'
              }`}
              title={isEn ? 'Voice Ordering' : 'تحدث صوتياً للشيف بالعامية'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* حقل الكتابة */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening 
                ? (isEn ? 'Listening... speak now' : 'الشيف سامعك.. اتكلم الآن...') 
                : (isEn ? 'Ask Chef: e.g. "I have 300 EGP for two"...' : 'اسأل الشيف: مثلاً "معايا 300 جنيه وعاوز غداء شخصين"...')
              }
              className="flex-1 bg-white dark:bg-[#261A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl py-2.5 px-4 text-xs sm:text-sm text-[#1F1713] dark:text-white placeholder-[#8C7A6B] focus:outline-none focus:border-amber-500 shadow-2xs"
            />

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-[#1F1713] dark:bg-amber-600 hover:bg-[#2B221D] disabled:opacity-40 text-white p-2.5 sm:px-4 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{isEn ? 'Send' : 'إرسال'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
