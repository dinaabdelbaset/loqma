import { useState, useEffect } from 'react';
import { Star, CheckCircle2, MessageSquarePlus, X, Send } from 'lucide-react';
import { getReviews, addReview } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_REVIEWS = [
  {
    id: 1,
    name: 'د. سارة المنشاوي',
    nameEn: 'Dr. Sarah El-Menshawy',
    role: 'طبيبة وموظفة • التجمع الخامس',
    roleEn: 'Physician • New Cairo',
    comment: 'بصراحة بقالي سنين مش لاقية أكل بيتي نكهته نضيفة ومظبوطة كدا! طاجن الملوخية وصل بيغلي كأنه لسه طالع من الفرن وريحته طشة بلدي على أصولها. اشتركت فوراً في باقة الأسبوع.',
    commentEn: 'Finally found real homemade food with clean flavors! The Molokhia arrived bubbling hot as if just pulled from the oven with authentic garlic tasha. Subscribed immediately to the weekly pass.',
    rating: 5,
    orderedDish: 'طاجن ملوخية بالفراخ البلدي',
    orderedDishEn: 'Molokhia Tajine with Baladi Chicken',
    date: 'منذ يومين',
    dateEn: '2 days ago',
  },
  {
    id: 2,
    name: 'م. أحمد الشناوي',
    nameEn: 'Eng. Ahmed El-Shennawy',
    role: 'مهندس برمجيات • المعادي',
    roleEn: 'Software Engineer • Maadi',
    comment: 'أكتر حاجة فاجئتني إن الأكل مش تقيل ولا بيحمِي على الصدر، باين جداً استخدام السمنة البلدي النضيفة والشوربة الفريش بدون أي دهون مهدرجة. طاجن البامية باللحمة الضاني حكاية لوحده.',
    commentEn: 'What surprised me most is how light the food feels. You can instantly tell pure ghee and fresh broth are used without grease. The lamb okra tajine is exceptional.',
    rating: 5,
    orderedDish: 'طاجن بامية باللحم الضاني',
    orderedDishEn: 'Lamb Okra Claypot Tajine',
    date: 'منذ 4 أيام',
    dateEn: '4 days ago',
  },
  {
    id: 3,
    name: 'أ/ نورا عبد الرحمن',
    nameEn: 'Ms. Noura Abdel-Rahman',
    role: 'ربة منزل وأم لطفلين • الشيخ زايد',
    roleEn: 'Mother of Two • Sheikh Zayed',
    comment: 'العزومة رفعت راسي قدام حماتي وضيوفي! صواني العيلة وصلت في ميعادها بالدقيقة، والسخونة ممتازة والعيش البلدي سخن ومفقع. شكراً لفريق لقمة على الاهتمام بالتفاصيل.',
    commentEn: 'The family tray arrived right on time, hot and delicious with puffed warm bread. Thank you Loqma for the superb attention to detail!',
    rating: 5,
    orderedDish: 'صينية محاشي وعزومات العيلة',
    orderedDishEn: 'Family Gathering Mahshi Tray',
    date: 'منذ أسبوع',
    dateEn: '1 week ago',
  },
];

export default function CustomerReviews() {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [dish, setDish] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getReviews().then((data) => {
      if (isMounted && data && Array.isArray(data) && data.length > 0) {
        setReviews(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const json = await addReview({
        name: authorName,
        role: authorRole.trim() || (isEn ? 'Loqma Diner' : 'عميل لقمة'),
        comment,
        rating,
        ordered_dish: dish.trim() || (isEn ? 'Loqma Special Feast' : 'سفرة لقمة المشكلة'),
      });

      const newR = {
        id: json?.data?.id || Date.now(),
        name: authorName,
        nameEn: authorName,
        role: authorRole.trim() || (isEn ? 'Loqma Diner' : 'عميل لقمة'),
        roleEn: authorRole.trim() || 'Loqma Diner',
        comment,
        commentEn: comment,
        rating,
        orderedDish: dish.trim() || (isEn ? 'Loqma Special Feast' : 'سفرة لقمة المشكلة'),
        orderedDishEn: dish.trim() || 'Loqma Special Feast',
        date: isEn ? 'Just now' : 'الآن',
        dateEn: 'Just now',
      };
      setReviews([newR, ...reviews]);
      setIsModalOpen(false);
      setAuthorName('');
      setAuthorRole('');
      setComment('');
      alert(isEn ? 'Thank you! Your review has been published.' : 'شكراً لك! تم إضافة تقييمك بنجاح.');
    } catch {
      alert(isEn ? 'Thank you! Review received.' : 'تم استلام تقييمك بنجاح! شكراً لك.');
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="px-5 sm:px-10 py-12 bg-[#F7F4EF] dark:bg-[#120E0C] border-t border-[#D2C4B7] dark:border-[#382A20]">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-[#26472A] dark:text-[#A3D4A8] bg-[#8A9684]/15 px-3 py-1 rounded-full text-xs font-bold border border-[#8A9684]/30 mb-2">
          <Star className="w-3.5 h-3.5 fill-[#8A9684] text-[#8A9684]" />
          <span>{t('reviewsBadge')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1F1713] dark:text-white font-serif-title mb-2">
          {t('reviewsTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-[#55453B] dark:text-[#D6C9BD] max-w-xl mx-auto mb-4">
          {t('reviewsSubtitle')}
        </p>
        
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-[#8A9684] hover:bg-[#768270] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{t('reviewsAddBtn')}</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r: any) => (
          <div
            key={r.id}
            className="bg-white dark:bg-[#1E1713] rounded-3xl p-6 border-2 border-[#D2C4B7] dark:border-[#382A20] shadow-md flex flex-col justify-between hover:shadow-xl hover:border-[#8A9684] transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-0.5 text-[#8A9684]">
                  {[...Array(r.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#8A9684] text-[#8A9684]" />
                  ))}
                </div>
                <span className="text-[10px] text-[#55453B] dark:text-[#A09383] font-medium">
                  {isEn ? (r.dateEn || r.date) : r.date}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#1F1713] dark:text-white leading-relaxed mb-4 italic">
                "{isEn ? (r.commentEn || r.comment) : r.comment}"
              </p>
            </div>

            <div className="pt-3 border-t border-[#D2C4B7]/40 dark:border-[#382A20]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1F1713] dark:text-white flex items-center gap-1">
                    <span>{isEn ? (r.nameEn || r.name) : r.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8A9684]" />
                  </h4>
                  <span className="text-[11px] text-[#55453B] dark:text-[#A09383] block">
                    {isEn ? (r.roleEn || r.role) : r.role}
                  </span>
                </div>
              </div>

              {(r.orderedDish || r.orderedDishEn) && (
                <div className="mt-2 inline-block bg-[#FAF7F2] dark:bg-[#261D17] px-2.5 py-0.5 rounded-md text-[10px] font-bold text-[#8A9684] border border-[#D2C4B7]/60 dark:border-[#382A20]">
                  {isEn ? `Order: ${r.orderedDishEn || r.orderedDish}` : `الطلب: ${r.orderedDish}`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* نافذة إضافة تقييم جديد */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#F7F4EF] dark:bg-[#1E1713] border-2 border-[#D2C4B7] dark:border-[#382A20] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 p-1 rounded-full hover:bg-[#D2C4B7]/40 text-[#55453B]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#1F1713] dark:text-white font-serif-title mb-1">
              {isEn ? 'Share Your Dining Experience' : 'شاركنا رأيك في طعم وجودة أكلنا'}
            </h3>
            <p className="text-xs text-[#55453B] dark:text-[#D6C9BD] mb-4">
              {isEn ? 'Your feedback helps us continuously perfect our homemade recipes.' : 'رأيك أمانة يساعدنا على تطوير سفرة لقمة باستمرار.'}
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1F1713] dark:text-white mb-1">
                  {isEn ? 'Your Name *' : 'اسمك الكريم *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? 'e.g. John Doe' : 'مثال: م. مصطفى كمال'}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-white dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-3 py-2 text-xs text-[#1F1713] dark:text-white focus:outline-none focus:border-[#8A9684]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1713] dark:text-white mb-1">
                  {isEn ? 'Role or Area' : 'صفتك أو منطقتك'}
                </label>
                <input
                  type="text"
                  placeholder={isEn ? 'e.g. New Cairo • Architect' : 'مثال: المعادي • مهندس مدني'}
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full bg-white dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-3 py-2 text-xs text-[#1F1713] dark:text-white focus:outline-none focus:border-[#8A9684]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1713] dark:text-white mb-1">
                  {isEn ? 'Dish Ordered' : 'الطبق الذي جربته'}
                </label>
                <input
                  type="text"
                  placeholder={isEn ? 'e.g. Molokhia Tajine' : 'مثال: طاجن عكاوي بالبصل'}
                  value={dish}
                  onChange={(e) => setDish(e.target.value)}
                  className="w-full bg-white dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-3 py-2 text-xs text-[#1F1713] dark:text-white focus:outline-none focus:border-[#8A9684]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1713] dark:text-white mb-1">
                  {isEn ? 'Rating (1 to 5)' : 'تقييمك (من 1 إلى 5)'}
                </label>
                <div className="flex items-center gap-1 text-[#8A9684]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= rating ? 'fill-[#8A9684] text-[#8A9684]' : 'text-[#D2C4B7]'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F1713] dark:text-white mb-1">
                  {isEn ? 'Detailed Review *' : 'رأيك بالتفصيل *'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={isEn ? 'Write your thoughts on warmth, taste, and freshness...' : 'اكتب انطباعك عن السخونة، النظافة، النكهة...'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] rounded-xl px-3 py-2 text-xs text-[#1F1713] dark:text-white focus:outline-none focus:border-[#8A9684]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 bg-white dark:bg-[#241A14] border border-[#D2C4B7] dark:border-[#382A20] py-2.5 rounded-xl text-xs font-bold text-[#1F1713] dark:text-white"
                >
                  {isEn ? 'Cancel' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-[#8A9684] hover:bg-[#768270] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? (isEn ? 'Submitting...' : 'جاري الإرسال...') : (isEn ? 'Submit Review' : 'نشر التقييم')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
