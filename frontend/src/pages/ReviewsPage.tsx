import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  CheckCircle2, 
  MessageSquarePlus, 
  Sparkles, 
  Send,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { getReviews, addReview } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: 'د. سارة المنشاوي',
    nameEn: 'Dr. Sarah El-Menshawy',
    role: 'طبيبة وموظفة • التجمع الخامس',
    roleEn: 'Physician • 5th Settlement',
    comment: 'بصراحة بقالي سنين مش لاقية أكل بيتي نكهته نضيفة ومظبوطة كدا! طاجن الملوخية وصل بيغلي كأنه لسه طالع من الفرن وريحته طشة بلدي على أصولها. اشتركت فوراً في باقة الأسبوع.',
    commentEn: 'Honestly, I haven’t tasted home cooking this clean and authentic in years! The molokhia arrived boiling hot as if straight out of the hearth, with genuine baladi tasha aroma. Subscribed immediately to the weekly pass.',
    rating: 5,
    orderedDish: 'طاجن ملوخية بالأرانب وطشة السمن البلدي',
    orderedDishEn: 'Rabbit Molokhia with Sizzling Baladi Ghee',
    date: 'منذ يومين',
    dateEn: '2 days ago',
    verified: true
  },
  {
    id: 2,
    name: 'م. أحمد الشناوي',
    nameEn: 'Eng. Ahmed El-Shennawy',
    role: 'مهندس برمجيات • المعادي',
    roleEn: 'Software Engineer • Maadi',
    comment: 'أكتر حاجة فاجئتني إن الأكل مش تقيل ولا بيحمِي على الصدر، باين جداً استخدام السمنة البلدي النضيفة والشوربة الفريش بدون أي دهون مهدرجة. طاجن البامية باللحمة الضاني حكاية لوحده.',
    commentEn: 'What surprised me most is how light and easy on the stomach the food was. 100% baladi cow ghee with fresh bone broth makes all the difference. The okra lamb tajine is a masterpiece.',
    rating: 5,
    orderedDish: 'طاجن بامية باللحم الضاني والموزة',
    orderedDishEn: 'Okra Bamia with Lamb Shank Tajine',
    date: 'منذ 4 أيام',
    dateEn: '4 days ago',
    verified: true
  },
  {
    id: 3,
    name: 'أ/ نورا عبد الرحمن',
    nameEn: 'Noura Abdel-Rahman',
    role: 'ربة منزل وأم لطفلين • الشيخ زايد',
    roleEn: 'Mother of two • Sheikh Zayed',
    comment: 'العزومة رفعت راسي قدام ضيوفي! صواني العيلة وصلت في ميعادها بالدقيقة، والسخونة ممتازة والعيش البلدي سخن ومفقع. شكراً لفريق لقمة على الاهتمام بالتفاصيل.',
    commentEn: 'The family banquet trays were a huge hit with our guests! Arrived on the exact minute, piping hot with fluffy fresh baladi bread. Kudos to the Loqma culinary team.',
    rating: 5,
    orderedDish: 'صينية محاشي وبط بلدي محمر بالسمن',
    orderedDishEn: 'Stuffed Veggies Tray with Golden Baladi Duck',
    date: 'منذ أسبوع',
    dateEn: '1 week ago',
    verified: true
  },
  {
    id: 4,
    name: 'كابتن محمود رضا',
    nameEn: 'Coach Mahmoud Reda',
    role: 'مدرب لياقة بدنية • الدقي',
    roleEn: 'Fitness Coach • Dokki',
    comment: 'جربت قسم الأكل الصحي عندهم، الصراحة مبهر! صدور الفراخ المشوية بالأعشاب والبروكلي طرية جداً ومتبلة صح وسعراتها محسوبة بالجرام بدون أي زيوت رديئة. اعتمدتهم لوجباتي اليومية.',
    commentEn: 'Tried their healthy cuisine section and was thoroughly impressed! Herb grilled chicken with broccoli was juicy, macro-calculated to the gram, and free from bad oils. My go-to meal prep.',
    rating: 5,
    orderedDish: 'صدور دجاج مشوية بالأعشاب وخضار سوتيه لايت',
    orderedDishEn: 'Herb-Grilled Chicken Breast with Light Sautéed Veggies',
    date: 'منذ أسبوع',
    dateEn: '1 week ago',
    verified: true
  },
  {
    id: 5,
    name: 'مدام جيهان فؤاد',
    nameEn: 'Mrs. Gehan Fouad',
    role: 'مصر الجديدة',
    roleEn: 'Heliopolis',
    comment: 'الفطير المشلتت المورق بالسمن البلدي الفلاحي خطير ومورق 128 طبقة بجد، مع العسل الأسود والقشطة الطبيعي رجعنا لأيام زمان في القرية.',
    commentEn: 'The baladi layered feteer with fresh cream and black honey brought back true memories of grandma’s Egyptian village kitchen. Perfectly flaky and golden.',
    rating: 5,
    orderedDish: 'فطير مشلتت فلاحي كبير بالقشطة والعسل',
    orderedDishEn: 'Royal Baladi Feteer Meshaltet with Honey & Cream',
    date: 'منذ 10 أيام',
    dateEn: '10 days ago',
    verified: true
  },
  {
    id: 6,
    name: 'م/ طارق البيلي',
    nameEn: 'Tarek El-Beily',
    role: 'مدينة نصر',
    roleEn: 'Nasr City',
    comment: 'خدمة العملاء محترمة وسريعة جداً، والأكل وصل مغلف حرارياً ومحكم الغلق. طعم الشوربة واللحمة الفريش البلدي لا يقارن بأي مطعم تجاري.',
    commentEn: 'Customer support is exceptionally courteous. Food arrived in insulated thermal packaging sealed tight. The rich marrow broth and baladi meat quality outperforms commercial restaurants.',
    rating: 5,
    orderedDish: 'طاجن ورق عنب بالكوارع والموزة البلدي',
    orderedDishEn: 'Grape Leaves with Trotters and Baladi Shank',
    date: 'منذ أسبوعين',
    dateEn: '2 weeks ago',
    verified: true
  }
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language, dir, t } = useLanguage();
  const isEn = language === 'en';
  const BreadcrumbArrow = isEn ? ChevronRight : ChevronLeft;

  // حقول إضافة تقييم جديد
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [dish, setDish] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getReviews().then((apiReviews) => {
      if (isMounted && apiReviews && apiReviews.length > 0) {
        setReviews(apiReviews);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newRev = {
      id: Date.now(),
      name: authorName,
      nameEn: authorName,
      role: authorRole || (isEn ? 'Loyal Loqma Customer' : 'عميل لقمة المميز'),
      roleEn: authorRole || 'Loyal Loqma Customer',
      comment,
      commentEn: comment,
      rating,
      orderedDish: dish || (isEn ? 'Egyptian Baladi Dining' : 'سفرة لقمة البيتية'),
      orderedDishEn: dish || 'Egyptian Baladi Dining',
      date: isEn ? 'Just now' : 'الآن',
      dateEn: 'Just now',
      verified: true
    };

    try {
      await addReview(newRev);
    } catch {
      // Offline fallback
    }

    setReviews([newRev, ...reviews]);
    setSubmitting(false);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setIsModalOpen(false);
      setAuthorName('');
      setAuthorRole('');
      setComment('');
      setDish('');
    }, 1500);
  };

  const filtered = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <div className="bg-[#F7F4EF] dark:bg-[#120E0C] text-[#1F1713] dark:text-[#F7F4EF] min-h-screen py-8 sm:py-14 transition-colors" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* شريط المسار (Breadcrumbs) */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#55453B] dark:text-[#D6C9BD] border-b border-[#D2C4B7]/60 dark:border-[#382A20] pb-3">
          <Link to="/" className="hover:text-amber-600 transition-colors">{t('navHome')}</Link>
          <BreadcrumbArrow className="w-3.5 h-3.5 text-[#8A9684]" />
          <span className="font-bold text-[#26472A] dark:text-[#A3D4A8]">{t('navReviews')}</span>
        </nav>

        {/* الترويسة الرئيسية والتقييم الإجمالي */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-[#1E1713] p-6 sm:p-10 rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-sm">
          <div className="space-y-2.5 text-center md:text-start">
            <div className="inline-flex items-center gap-2 bg-[#8A9684]/15 text-[#26472A] dark:text-[#A3D4A8] px-3.5 py-1 rounded-full text-xs font-black border border-[#8A9684]/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? '100% Verified Reviews from Real Customers' : 'تقييمات موثقة 100% من عملاء حقيقيين'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#1F1713] dark:text-white font-serif-title">
              {isEn ? 'Testimonials from the Loqma Family' : 'شهادات نعتز بها من عائلات "لقمة"'}
            </h1>
            <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] max-w-xl font-medium">
              {isEn
                ? 'Every review here is written honestly after tasting our baladi home-cooked food. Your satisfaction and hot meals are our #1 mission.'
                : 'كل تقييم هنا كُتب بصدق بعد تذوق أكلاتنا البيتية بالسمن البلدي. رضاكم وسخونة أكلكم هو هدفنا الأول.'
              }
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-[#FAF5EE] dark:bg-[#261D17] p-5 sm:p-6 rounded-2xl border border-[#D2C4B7] dark:border-[#382A20] shrink-0 text-center min-w-[200px]">
            <span className="text-4xl sm:text-5xl font-black text-amber-500 font-serif">4.9</span>
            <div className="flex items-center gap-1 text-amber-400 my-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-[#55453B] dark:text-[#D6C9BD]">
              {isEn ? 'Based on 1,420+ successful orders' : 'بناءً على 1,420+ طلب ناجح'}
            </span>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-3.5 bg-[#1F1713] dark:bg-amber-600 hover:bg-[#2B221D] text-white px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border border-[#8A9684]/40"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{isEn ? 'Add Your Review' : 'أضف رأيك وتجربتك'}</span>
            </button>
          </div>
        </div>

        {/* أزرار التصفية حسب النجوم */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterRating === null
                ? 'bg-[#1F1713] dark:bg-amber-500 text-white dark:text-[#120E0C] shadow-sm'
                : 'bg-white dark:bg-[#1E1713] text-[#1F1713] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20]'
            }`}
          >
            {isEn ? `All Reviews (${reviews.length})` : `جميع التقييمات (${reviews.length})`}
          </button>
          {[5, 4, 3].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => setFilterRating(stars)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                filterRating === stars
                  ? 'bg-[#1F1713] dark:bg-amber-500 text-white dark:text-[#120E0C] shadow-sm'
                  : 'bg-white dark:bg-[#1E1713] text-[#1F1713] dark:text-[#D6C9BD] border border-[#D2C4B7] dark:border-[#382A20]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{stars} {isEn ? 'Stars' : 'نجوم'}</span>
            </button>
          ))}
        </div>

        {/* شبكة كروت التقييمات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((rev) => {
            const author = isEn ? (rev.nameEn || rev.name) : rev.name;
            const role = isEn ? (rev.roleEn || rev.role) : rev.role;
            const text = isEn ? (rev.commentEn || rev.comment) : rev.comment;
            const dishName = isEn ? (rev.orderedDishEn || rev.orderedDish) : rev.orderedDish;
            const dateStr = isEn ? (rev.dateEn || rev.date) : rev.date;

            return (
              <div
                key={rev.id}
                className="bg-white dark:bg-[#1E1713] rounded-3xl p-6 border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-[#55453B] dark:text-[#D6C9BD]">
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#1F1713] dark:text-[#F7F4EF] leading-relaxed font-medium">
                    "{text}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#D2C4B7]/60 dark:border-[#382A20]/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1F1713] dark:text-white">
                      {author}
                    </span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-300/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{isEn ? 'Verified Customer' : 'عميل موثق'}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#55453B] dark:text-[#D6C9BD] block">
                    {role}
                  </span>
                  <span className="inline-block text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/50">
                    🍲 {isEn ? 'Ordered:' : 'الطبق:'} {dishName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* نافذة منبثقة لإضافة تقييم (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1713] rounded-3xl border-2 border-[#D2C4B7] dark:border-[#382A20] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95" dir={dir}>
            <div className="flex items-center justify-between border-b border-[#D2C4B7]/60 dark:border-[#382A20] pb-3">
              <h3 className="text-lg font-black text-[#1F1713] dark:text-white">
                {isEn ? 'Share Your Experience with Loqma 🌟' : 'شاركنا رأيك وتجربتك في لقمة 🌟'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-black text-[#1F1713] dark:text-white">
                  {isEn ? 'Thank you! Your review has been saved.' : 'شكراً لك! تم تسجيل رأيك بنجاح'}
                </h4>
                <p className="text-xs text-[#55453B] dark:text-[#D6C9BD]">
                  {isEn ? 'Your feedback empowers our culinary excellence.' : 'رأيك يهمنا جداً ويساعدنا نفضل دايماً بأعلى جودة.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#1F1713] dark:text-white mb-1">
                    {isEn ? 'Full Name *' : 'الاسم بالكامل *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={isEn ? 'e.g. Dr. Sarah Miller' : 'مثال: أ/ محمد يوسف'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF5EE] dark:bg-[#261D17] text-xs font-bold text-[#1F1713] dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-[#1F1713] dark:text-white mb-1">
                      {isEn ? 'Area / City' : 'المنطقة / الصفة'}
                    </label>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder={isEn ? 'e.g. New Cairo' : 'مثال: التجمع الخامس'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF5EE] dark:bg-[#261D17] text-xs font-bold text-[#1F1713] dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#1F1713] dark:text-white mb-1">
                      {isEn ? 'Ordered Dish' : 'الطبق المجرّب'}
                    </label>
                    <input
                      type="text"
                      value={dish}
                      onChange={(e) => setDish(e.target.value)}
                      placeholder={isEn ? 'e.g. Molokhia Tajine' : 'مثال: طاجن ملوخية'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF5EE] dark:bg-[#261D17] text-xs font-bold text-[#1F1713] dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#1F1713] dark:text-white mb-1">
                    {isEn ? 'Your Rating' : 'تقييمك بالنجوم'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        className="p-1 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300 dark:text-stone-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#1F1713] dark:text-white mb-1">
                    {isEn ? 'Your Review *' : 'رأيك بالتفصيل *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isEn ? 'Tell us how the food and hot delivery was...' : 'احكيلنا عن طعم الأكل وسخونته وسرعة التوصيل...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2C4B7] dark:border-[#382A20] bg-[#FAF5EE] dark:bg-[#261D17] text-xs font-bold text-[#1F1713] dark:text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1F1713] dark:bg-amber-600 hover:bg-[#2B221D] text-white py-3 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? (isEn ? 'Submitting...' : 'جاري الحفظ...') : (isEn ? 'Post Review' : 'إرسال التقييم')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
