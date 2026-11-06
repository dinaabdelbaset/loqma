<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Dish;
use App\Models\Category;

class AIController extends Controller
{
    /**
     * 1. شيف لقمة الذكي (AI Baladi Sommelier / Smart Chef Chatbot)
     * محادثة تفاعلية حقيقية بالذكاء الاصطناعي زي ChatGPT تماماً
     */
    public function chat(Request $request)
    {
        $message = trim($request->input('message', ''));
        $history = $request->input('history', []);
        $budget = $request->input('budget');
        $lang = $request->input('language', 'ar');
        $isEn = $lang === 'en';

        if (empty($message)) {
            return response()->json([
                'status' => 'error',
                'message' => $isEn ? 'Message is required' : 'الرسالة مطلوبة'
            ], 422);
        }

        $allDishes = Dish::where('is_available', true)->get();

        // استخراج الميزانية إذا ذُكرت في النص ولم تُرسل كـ parameter
        if (!$budget) {
            if (preg_match('/(\d+)\s*(جنيه|ج|ج\.م|egp|le)/iu', $message, $m)) {
                $budget = (float) $m[1];
            } elseif (preg_match('/(?:معايا|ميزانيتي|بـ|بـحوالي|في حدود)\s*(\d+)/iu', $message, $m)) {
                $budget = (float) $m[1];
            } elseif (preg_match('/\b(\d{2,4})\b/', $message, $m)) {
                $candidateNum = (float) $m[1];
                if ($candidateNum >= 80 && $candidateNum <= 5000) {
                    $budget = $candidateNum;
                }
            }
        }

        // 1. محاولة استخدام Google Gemini API إذا كان المفتاح متاحاً
        $geminiKey = env('GEMINI_API_KEY');
        if (!empty($geminiKey)) {
            $geminiResponse = $this->queryGemini($message, $history, $allDishes, $lang);
            if (!empty($geminiResponse['reply'])) {
                return response()->json([
                    'status' => 'success',
                    'reply' => $geminiResponse['reply'],
                    'reply_en' => $geminiResponse['reply_en'] ?? $geminiResponse['reply'],
                    'recommended_dishes' => $geminiResponse['dishes'],
                    'total_estimated_price' => array_sum(array_column($geminiResponse['dishes'], 'price')),
                    'quick_actions' => $this->getDefaultQuickActions($isEn)
                ]);
            }
        }

        // 2. المحرك الحواري الذكي المصري الأصيل (Egyptian Baladi Conversational Engine)
        $hasPhrase = function(...$phrases) use ($message) {
            foreach ($phrases as $phrase) {
                if (mb_stripos($message, $phrase) !== false) return true;
            }
            return false;
        };

        $hasWord = function(...$words) use ($message) {
            foreach ($words as $w) {
                if (preg_match('/(?:\b|[\s\p{P}]|^)' . preg_quote($w, '/') . '(?:\b|[\s\p{P}]|$)/iu', $message)) {
                    return true;
                }
            }
            return false;
        };

        // فحص ما إذا كانت الرسالة تطلب أو تذكر أطعمة بعينها
        $mentionsFood = $hasPhrase(
            'طاجن', 'طواجن', 'عكاوي', 'كباب', 'كفتة', 'كفته', 'طرب', 'مشوي', 'مشاوي', 
            'مشويات', 'ملوخية', 'ملوخيه', 'محشي', 'محاشي', 'ورق عنب', 'حمام', 'بط', 
            'ممبار', 'فطير', 'رقاق', 'سلطة', 'شوربة', 'لحمة', 'فراخ', 'أرز', 'رز', 'سمنة', 'سمن بلدي'
        );

        $replyAr = '';
        $replyEn = '';
        $recommended = [];
        $quickActions = $this->getDefaultQuickActions($isEn);

        // --- أولاً: الأسئلة الحوارية العامة (بدون ذكر أكلات محددة) ---

        // 1. السؤال عن هوية الشيف أو مقارنته بـ ChatGPT
        if ($hasPhrase('انت مين', 'عرفني بنفسك', 'اسمك ايه', 'مين انت', 'مين اللي بيكلمني', 'انت روبوت', 'انت انسان', 'شات جي بي تي', 'chatgpt', 'ذكاء اصطناعي', 'ai')) {
            $replyAr = "أنا 'شيف لقمة الذكي' (Loqma Smart Chef) 👨‍🍳 الشيف الافتراضي لمطبخ لقمة! مبرمج بالذكاء الاصطناعي عشان أكون رفيقك وسندك في الأكل البيتي المصري الأصيل بالسمن الفلاحي 100%. تقدر تدردش معايا زي ChatGPT بالظبط: تسألني عن أي وصفة، تطلب وجبة على قد ميزانيتك، تظبط معايا مقادير وأطباق عزوماتك، أو حتى تسألني عن سر طشة الملوخية ونَفَس الأكل البلدي! تحب نبدأ بإيه؟";
            $replyEn = "I am 'Loqma Smart Chef' 👨‍🍳 your AI Baladi culinary companion! Just like ChatGPT, you can chat with me naturally: ask about authentic Egyptian recipes, budget recommendations, feast calculations, or secrets of our 100% pure cow ghee cooking!";
            $recommended = [];
        }

        // 2. التحية والسلام والاستفسار عن الحال
        elseif (!$mentionsFood && $hasPhrase('ازيك', 'عامل ايه', 'اخبارك', 'صباح الخير', 'مساء الخير', 'سلام عليكم', 'السلام عليكم', 'مرحبا', 'أهلاً', 'اهلا', 'هاي', 'هلو', 'منور', 'ازي الصحه')) {
            $replyAr = "يا هلا والله وميت مرحب بيك يا غالي! 🌿 أنا بألف خير ونعمة طول ما ريحة السمن البلدي الفلاحي وطشة الثوم معمرة المطبخ.. منورنا ومونسنا في لقمة! قولي، نفسك تاكل إيه حلو النهاردة؟ محتار في غداء النهاردة ولا بتجهز لعزومة تشرف العيلة؟";
            $replyEn = "Welcome and hello dear friend! 🌿 I am doing wonderful with the aroma of pure baladi cow ghee and sizzling garlic filling our kitchen! Tell me, what delicious meal are you thinking of today?";
            $recommended = [];
        }

        // 3. الشكر والامتنان والوداع
        elseif (!$mentionsFood && $hasPhrase('شكرا', 'شكراً', 'تسلم', 'الله يخليك', 'حبيبي', 'ربنا يحفظك', 'تسلم ايدك', 'تمام كدا', 'حلو اوي', 'عاش', 'ألف شكر', 'thanks')) {
            $replyAr = "الشكر لله يا غالي، تسلم وتعيش يا رب! ده واجبي ويسعدني دائماً أكون في خدمتك.. مطرح ما يسري يمري وبالهنا والشفا مقدماً على قلبك! لو احتجت أي حاجة في أي وقت، الشيف دايماً في ضهرك وجاهز يظبطلك السفرة 🌿✨";
            $replyEn = "You are most welcome! It's always my greatest pleasure to serve you. Bon appétit in advance! Whenever you need culinary advice or an authentic feast, I'm always right here for you 🌿✨";
            $recommended = [];
        }

        // 4. الافتتاحيات الودية والدردشة العامة (مثل: "بص انا عاوزه حاجه"، "بقولك ايه يا شيف"، "محتارة"...)
        elseif (!$mentionsFood && ($hasPhrase('عاوزه حاجه', 'عاوز حاجه', 'عاوزة حاجة', 'عاوز حاجة', 'عاوزه اطلب', 'عاوز اطلب', 'بقولك ايه', 'بقولك إيه', 'ممكن طلب', 'محتار', 'محتاره', 'عاوز اسالك', 'عاوزه اسالك') || $hasWord('بص', 'بصي', 'اسمع', 'شيف', 'يا شيف'))) {
            $replyAr = "يا ميت أهلاً وسهلاً بيكي/بيك في مطبخ لقمة! 🍲 عيوني ليك تؤمرني أمر.. قولي بس بتفكر في إيه ومشتهي إيه النهاردة؟ عايز طاجن فخار مسوى على مهله في بيت النار، ولا مشويات بلدي على الفحم تدفي القلب، ولا أكله خفيفة صحية محسوبة السعرات؟ احكيلي وأنا أظبطلك أحلى سفرة تفتح النفس على ذوقك!";
            $replyEn = "Welcome to Loqma Kitchen! I'm completely at your service. Tell me, what are you craving today? A simmering clay tajine from the traditional oven, fresh charcoal grills, or a wholesome healthy meal? Tell me what's on your mind and I'll curate the perfect feast!";
            $quickActions = [
                ['label' => '🍲 طواجن فخار سخنة', 'label_en' => 'Hot Clay Tajines', 'action' => 'tajines'],
                ['label' => '🥩 مشويات على الفحم', 'label_en' => 'Charcoal Grills', 'action' => 'grills'],
                ['label' => '🍗 حمام ومحاشي بلدي', 'label_en' => 'Pigeon & Mahshi', 'action' => 'mahshi'],
                ['label' => '🥗 أكل صحي ودايت', 'label_en' => 'Healthy Diet', 'action' => 'healthy']
            ];
            $recommended = [];
        }

        // 5. الاستفسار عن التوصيل، المواعيد، الفروع، وطرق الدفع
        elseif ($hasPhrase('بتوصلوا', 'التوصيل', 'مكانكم', 'العنوان', 'فروعكم', 'مواعيد', 'بتفتحوا', 'شغالين لحد', 'طرق الدفع', 'كاش', 'فيزا', 'انستاباي', 'instapay', 'فودافون كاش')) {
            $replyAr = "أهلاً بيك! إحنا في لقمة بنوصل لكافة أنحاء القاهرة الكبرى والجيزة (المعادي، التجمع والقاهرة الجديدة، الشيخ زايد وأكتوبر، مصر الجديدة، ومدينة نصر). بنستقبل الطلبات يومياً من 9:00 صباحاً وحتى 11:00 مساءً، والأكل بيوصلك في حافظات حرارية سخن ملهلب كأنه لسه طالع من الفرن حالاً! وبندعم كل طرق الدفع: كاش عند الاستلام، فيزا وماستركارد، فودافون كاش، وInstaPay الفوري.";
            $replyEn = "We deliver across Greater Cairo and Giza (Maadi, New Cairo, Zayed, Heliopolis, Nasr City). We accept orders daily 9:00 AM - 11:00 PM. Hot thermal packaging keeps your food fresh and piping hot. Payment methods include Cash on Delivery, Visa/Mastercard, Vodafone Cash, and InstaPay.";
            $recommended = [];
        }

        // 6. الاستفسار عن السمن البلدي والزيوت وجودة المكونات
        elseif ($hasPhrase('نوع السمنة', 'بتطبخوا بسمنة', 'سمنة ايه', 'سمن بلدي', 'السمن الفلاحي', 'دهون مهدرجة', 'زيوت مخلوطة')) {
            $replyAr = "سؤال في الجون! إحنا في لقمة معندناش أي فصال أو تهاون في صحتك ونظافة الأكل: سمنتنا بلدي جاموسي وبقري صافية 100% بنجيبها مخصوص من مزارع وأرياف مصر بدون أي خلط أو زيوت مهدرجة. بنطبخ بيها طواجن الفخار ورز البرام المعمر والفطير المشلتت عشان تحس بنَفَس أمهاتنا وجدودنا في كل لقمة! وحتى في الأكل الصحي بنستخدم زيت زيتون بكر معصور على البارد 🌿";
            $replyEn = "Quality is our highest promise! In Loqma, we use 100% pure Egyptian Baladi cow & buffalo ghee sourced directly from local countryside farms—zero hydrogenated fats or blended oils. And for our healthy menu, we exclusively cook with cold-pressed extra virgin olive oil 🌿";
            $recommended = [];
        }

        // --- ثانياً: استفسارات الطبخ والوصفات والأطعمة المحددة ---

        // 7. سر طشة الملوخية أو وصفة الملوخية
        elseif ($hasPhrase('طريقة الملوخية', 'سر الملوخية', 'طشة الملوخية', 'شهقة الملوخية', 'ازاي بتعملوا الملوخية')) {
            $molo = $allDishes->filter(function ($d) {
                return str_contains($d->name, 'ملوخية') || str_contains($d->name, 'أرز');
            })->take(2)->values()->all();

            $replyAr = "سر ملوخية لقمة الخضرا في 3 أسرار بلدنا: أولاً ملوخية فريش بنقطفها ونخرطها ع الصبح بالمخرطة اليدوية مش مجمدة. ثانياً بتتسوى في مرقة طيور بلدي دسمة ومعتقة بالمستكة والحبهان. وثالثاً الطشة وسرها: معلقة سمنة فلاحي محترمة وثوم بلدي مفروم مع رشة كزبرة ناشفة مطحونة في وقتها، ونطشها بالشهقة المصرية على الفخار فوراً! تحب أرشحلك طاجن الملوخية بالطشة مع رز بلدي سخن وعيش؟";
            $replyEn = "The secret to Loqma's legendary fresh green Molokhia: Hand-harvested fresh leaves chopped daily, simmered in rich heritage poultry broth, and crowned with our sizzling garlic, coriander and pure cow ghee tasha! Would you like me to add it to your table?";
            $recommended = $molo;
        }

        // 8. طريقة طاجن العكاوي وسر تسويته
        elseif ($hasPhrase('طريقة طاجن العكاوي', 'طريقة العكاوي', 'سر العكاوي', 'بتسووا العكاوي')) {
            $akawi = $allDishes->filter(function ($d) {
                return str_contains($d->name, 'عكاوي') || str_contains($d->name, 'أرز');
            })->take(2)->values()->all();

            $replyAr = "طاجن العكاوي ده عمدة السفرة وفخر مطبخ لقمة! بنجيب العكوة البقري البلدي تتشوح في حتة سمنة فلاحي ومستكة، وبعدين ننزل عليها بكيلو بصل قاورمة مكرمل مع بهارات لقمة السبع ريفية، وتتحط في طاجن فخار أسواني أصيل مكمور بالفويل ويدخل بيت النار 3 ساعات على نار هادية لحد ما تفصص واللحمة تدوب زي الملبن! جربته ولا لسه؟";
            $replyEn = "Our Clay Oxtail Tajine is the king of the table! Sautéed in pure ghee and mastic, layered with caramelized shallots and 7 secret Egyptian herbs, then slow-braised inside our thermal clay oven for 3 hours until meltingly tender!";
            $recommended = $akawi;
        }

        // 9. حساسية اللاكتوز أو الألبان
        elseif ($hasPhrase('لاكتوز', 'حساسية', 'ألبان', 'البان', 'حليب', 'lactose', 'dairy')) {
            $healthyDishes = $allDishes->filter(function ($d) {
                return $d->category_id === 'healthy' || str_contains($d->name, 'مشوي') || str_contains($d->name, 'سلطة');
            })->take(3);

            $recommended = $healthyDishes->values()->all();
            $replyAr = "ألف سلامة على الغاليين! في مطبخ لقمة صحة عيلتك هي الأولى دائماً. أطباقنا في قسم (الأكل الصحي) والمشويات على الفحم بنحضرها بزيت زيتون بكر ممتاز وتتبيلات ريفية طازة 100% بدون أي نقطة سمنة أو ألبان أو لاكتوز. رشحتلك أطباق مشوية طازجة وسلطات غنية بالألياف تضمن لك وجبة آمنة ولذيذة جداً:";
            $replyEn = "Health and safety come first in Loqma Kitchen! Our Healthy section and charcoal grills are prepared using pure extra virgin olive oil and herbs with zero dairy or lactose. Here are safe and delicious recommendations:";
        }

        // 10. ميزانية محددة (مثل 280 جنيه، 200 جنيه، إلخ)
        elseif ($budget && $budget > 0) {
            $target = $budget;
            $pool = $allDishes->shuffle();
            $currSum = 0;
            $selected = [];

            $isTajine = $hasPhrase('طاجن', 'طواجن', 'فخار');
            $isGrills = $hasPhrase('مشاوي', 'مشاوى', 'مشوي', 'كباب', 'كفتة');
            $isTwoPersons = $hasPhrase('شخصين', 'فردين', '2 فرد', 'two');

            // رئيسي
            $main = $pool->first(function ($d) use ($target, $isTajine, $isGrills) {
                if ($isTajine) return $d->category_id === 'clay-tagines' && $d->price <= ($target * 0.75);
                if ($isGrills) return $d->category_id === 'grills' && $d->price <= ($target * 0.75);
                return $d->price >= 90 && $d->price <= ($target * 0.75);
            });

            if ($main) {
                $selected[] = $main;
                $currSum += $main->price;
            }

            // جانبي أو شوربة
            $remaining = $target - $currSum;
            $side = $pool->first(function ($d) use ($remaining, $selected) {
                return !in_array($d->id, array_column($selected, 'id')) && $d->price <= $remaining && ($d->category_id === 'soups' || $d->category_id === 'salads' || str_contains($d->name, 'أرز') || str_contains($d->name, 'شوربة'));
            });

            if ($side) {
                $selected[] = $side;
                $currSum += $side->price;
            }

            // مقبلات إذا أمكن
            $remaining = $target - $currSum;
            if ($remaining >= 35) {
                $extra = $pool->first(function ($d) use ($remaining, $selected) {
                    return !in_array($d->id, array_column($selected, 'id')) && $d->price <= $remaining;
                });
                if ($extra) {
                    $selected[] = $extra;
                    $currSum += $extra->price;
                }
            }

            $recommended = $selected;
            $replyAr = "يا هلا بيك يا سيدي! حسبتلك حسبة المطبخ بالظبط على ميزانيتك ({$budget} ج.م).. جمعتلك سفرة بيتي مصرية أصيلة بسمن بلدي فلاحي تشبع " . ($isTwoPersons ? 'فردين براحة' : 'حضرتك ويفيض') . " بإجمالي (" . round($currSum) . " ج.م): تبدأ بالرئيسي المظبوط ومعاه الشوربة أو الإضافات السخنة. تحب أضيفلك السفرة دي للسلة فوراً؟";
            $replyEn = "Welcome! I have curated an authentic Egyptian meal tailored to your budget of ({$budget} EGP), totaling (" . round($currSum) . " EGP). Would you like me to add it directly to your cart?";
        }

        // 11. دايت وأكل صحي محسوب السعرات
        elseif ($hasPhrase('صحي', 'دايت', 'سعرات', 'رجيم', 'بروتين', 'healthy', 'diet', 'fit', 'كيتو')) {
            $healthy = $allDishes->filter(function ($d) {
                return $d->category_id === 'healthy' || ($d->calories && $d->calories <= 420);
            })->take(3);

            $recommended = $healthy->values()->all();
            $replyAr = "الدايت مع لقمة مش حرمان أبداً! بنطبخ الأكل الصحي بنَفَس بيتي مصري، بدون أي دهون مهدرجة ومحسوب الماكروز بالجرام (بروتين صافي، كارب معقد، ودهون صحية بزيت زيتون بكر). دي أفضل اختياراتي ليك اليوم:";
            $replyEn = "Healthy eating at Loqma is pure pleasure without deprivation! Macro-calculated, cooked with EVOO and lean fresh baladi cuts. Here are my chef recommendations for you:";
        }

        // 12. طلب مشويات على الفحم
        elseif ($hasPhrase('مشاوي', 'مشاوى', 'مشوي', 'مشوى', 'كباب', 'كفتة', 'كفته', 'طرب', 'ريش', 'grill', 'bbq')) {
            $grills = $allDishes->filter(function ($d) {
                return $d->category_id === 'grills' || str_contains($d->name, 'كباب') || str_contains($d->name, 'طرب') || str_contains($d->name, 'مشوي');
            })->take(3);

            $recommended = $grills->values()->all();
            $replyAr = "ريحة شواية الفحم البلدي تكفي لفتح النفس! كباب وكفتة ولحمة بلدي طازة بتتبيلة بصل وتوابل فلاحية مشوية على مهلها مع العيش وسلطة الطحينة وسلطة خضرا بلدي. دي التشكيلة الملكية المشوية:";
            $replyEn = "Nothing matches fresh Egyptian charcoal grills! Our meats are seasoned with fresh onion marinade and mountain herbs. Here are our top grilled specialties:";
        }

        // 13. طلب طواجن فخار أو لحمة بالبصل أو عكاوي
        elseif ($hasPhrase('طاجن', 'طواجن', 'فخار', 'عكاوي', 'عكاوى', 'لحمة بالبصل', 'لحمه بالبصل', 'ورقة لحم', 'ورقه لحم', 'tajine')) {
            $tajines = $allDishes->filter(function ($d) {
                return $d->category_id === 'clay-tagines' || str_contains($d->name, 'طاجن') || str_contains($d->name, 'ورقة لحم');
            })->take(3);

            $recommended = $tajines->values()->all();
            $replyAr = "الطواجن الفخار هي أصل مطبخ لقمة وسر صنعتنا! بتدخل بيت النار وتتكمر في فخار قنا الأصيل بالسمن الفلاحي 100%. دي أشهى طواجن مسواة اليوم:";
            $replyEn = "Clay Tajines are the cornerstone of Loqma! Slow-cooked inside thermal clay with pure cow ghee. Here are today's top simmering tajines:";
        }

        // 14. طلب محاشي أو حمام أو بط فلاحي
        elseif ($hasPhrase('محشي', 'محاشي', 'ورق عنب', 'حمام', 'بط', 'ممبار', 'فريك')) {
            $mahshi = $allDishes->filter(function ($d) {
                return str_contains($d->name, 'محشي') || str_contains($d->name, 'حمام') || str_contains($d->name, 'بط') || str_contains($d->name, 'ممبار');
            })->take(3);

            $recommended = $mahshi->values()->all();
            $replyAr = "الله على الحمام المحشي فريك ومحشي ورق العنب بالليمون! البط الفلاحي المحمر بالسمنة الفلاحي وروايح خلطة الرز المعمرة.. دي أكلات العز والدفا المصري الأصيل:";
            $replyEn = "Authentic Egyptian stuffed pigeons, rich roasted duck, and handcrafted vine leaves! Here are our finest heritage classics:";
        }

        // 15. عزومة ولمة عيلة وصواني كبيرة
        elseif ($hasPhrase('عزومة', 'عزومه', 'عيلة', 'صواني', 'صوانى', 'ضيوف', 'feast', 'gathering', 'catering')) {
            $feast = $allDishes->filter(function ($d) {
                return $d->category_id === 'family-trays' || $d->category_id === 'feteer-meshaltet' || str_contains($d->name, 'صينية') || str_contains($d->name, 'بط');
            })->take(3);

            $recommended = $feast->values()->all();
            $replyAr = "العزومات دي لعبتنا وسر صنعتنا يا غالي! صواني لقمة العائلية بتوصل سخنة ملهلبة في فخار حراري تشرفك قدام ضيوفك مع الرز والمحاشي والعيش البلدي المفقع. دي الصواني الأكثر طلباً للعزومات:";
            $replyEn = "Family gatherings and royal feasts are our greatest pride! Our large family trays arrive piping hot in thermal insulated packaging to impress your guests:";
        }

        // 16. العميل جائع أو يطلب اقتراح طعام عام
        elseif ($hasPhrase('جعان', 'جعانة', 'عاوز اكل', 'عاوزه اكل', 'عايز اكل', 'اقترحلي', 'اقترحي', 'ايه احلى حاجه', 'ايه احلى حاجة', 'ايه التوب', 'ايه المميز')) {
            $best = $allDishes->where('is_best_seller', true)->take(3);
            if ($best->isEmpty()) {
                $best = $allDishes->take(3);
            }
            $recommended = $best->values()->all();
            $replyAr = "ولا تشيل هم الجوع أبداً وأنت مع لقمة! لو محتار، أنصحك تبدأ بأكتر أطباق بتطلب كل يوم وبيشكر فيها حبايبنا زباين لقمة: طواجن فخار دايبة ومشويات على الفحم بالسمن البلدي الفلاحي 100%. دي أطباقنا التوب دلوقتي:";
            $replyEn = "Never worry about hunger with Loqma! Here are our top customer favorites today—slow-cooked clay tajines and charcoal grills:";
        }

        // 17. الرد الحواري الطبيعي لأي استفسار آخر (مثل شات جي بي تي - محادثة خالصة بدون أطباق مفروضة!)
        else {
            $replyAr = "يا هلا بيك يا غالي! أنا هنا معاك في مطبخ لقمة خطوة بخطوة. قولي بتفكر في إيه بالتحديد ومشتهي إيه النهاردة؟ نفسك في أكلة مصرية بلدي دسمة تدفي، ولا مشويات خفيفة على الفحم، ولا عندك مناسبة أو بتسأل عن طريقة أكلة معينة؟ احكيلي وأنا أرد عليك فوراً بكل اللي تحبه!";
            $replyEn = "Welcome! I am here with you in Loqma Kitchen. What exactly are you craving or thinking about today? An authentic rich Egyptian meal, charcoal grills, or do you have a specific culinary question? Chat with me and I'll assist you immediately!";
            $recommended = [];
        }

        // تنسيق بطاقات الأطباق للفرونت إند (إن وجدت)
        $formattedDishes = array_map(function ($d) {
            return [
                'id' => $d->id,
                'name' => $d->name,
                'description' => $d->description,
                'price' => (float) $d->price,
                'image' => $d->image,
                'categoryId' => $d->category_id,
                'calories' => $d->calories,
                'tag' => $d->tag ?: 'سر الصنعة 🌟'
            ];
        }, $recommended);

        $totalEstimated = array_sum(array_column($formattedDishes, 'price'));

        return response()->json([
            'status' => 'success',
            'reply' => $replyAr,
            'reply_en' => $replyEn,
            'recommended_dishes' => $formattedDishes,
            'total_estimated_price' => $totalEstimated,
            'quick_actions' => $quickActions
        ]);
    }

    /**
     * الاستعلام من Google Gemini API إذا كان المفتاح متاحاً في env
     */
    private function queryGemini(string $message, array $history, $allDishes, string $lang): array
    {
        $geminiKey = env('GEMINI_API_KEY');
        if (empty($geminiKey)) {
            return [];
        }

        try {
            $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$geminiKey}";

            $menuSummary = $allDishes->map(function ($d) {
                return "- {$d->name} ({$d->category_id}): {$d->price} EGP. {$d->description}";
            })->take(25)->implode("\n");

            $systemInstruction = "أنت 'شيف لقمة الذكي' (Loqma Smart Chef) في مطبخ لقمة للأكل البيتي المصري الأصيل بالسمن البلدي الفلاحي 100%. تتحدث بأسلوب شات جي بي تي (ChatGPT) باللهجة المصرية الودودة المحترمة جداً. جاوب على أسئلة العميل ودردش معاه، جاوب على الوصفات، واستمع لطلباته واقترح عليه من المنيو التالي فقط عندما يكون مناسباً:\n" . $menuSummary;

            $contents = [];
            foreach (array_slice($history, -4) as $h) {
                $contents[] = [
                    'role' => ($h['role'] === 'user') ? 'user' : 'model',
                    'parts' => [['text' => $h['content'] ?? '']]
                ];
            }
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $message]]
            ];

            $payload = [
                'contents' => $contents,
                'systemInstruction' => [
                    'parts' => [['text' => $systemInstruction]]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 450
                ]
            ];

            $ch = curl_init($endpoint);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_TIMEOUT, 7);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $res = curl_exec($ch);
            curl_close($ch);

            if ($res) {
                $json = json_decode($res, true);
                $replyText = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
                if (!empty($replyText)) {
                    // فحص إذا ذكرت أطباق معينة في الرد لإرفاق كروتها
                    $matchedDishes = [];
                    foreach ($allDishes as $dish) {
                        if (mb_stripos($replyText, $dish->name) !== false) {
                            $matchedDishes[] = $dish;
                            if (count($matchedDishes) >= 3) break;
                        }
                    }

                    return [
                        'reply' => $replyText,
                        'reply_en' => $replyText,
                        'dishes' => array_map(function ($d) {
                            return [
                                'id' => $d->id,
                                'name' => $d->name,
                                'description' => $d->description,
                                'price' => (float) $d->price,
                                'image' => $d->image,
                                'categoryId' => $d->category_id,
                                'calories' => $d->calories,
                                'tag' => $d->tag ?: 'ترشيح الشيف ✨'
                            ];
                        }, $matchedDishes)
                    ];
                }
            }
        } catch (\Throwable $e) {
            // صامت، يرجع للمحرك المحلي
        }

        return [];
    }

    private function getDefaultQuickActions(bool $isEn): array
    {
        return $isEn ? [
            ['label' => '💵 Budget: 280 EGP for two', 'label_en' => 'Budget: 280 EGP for two', 'action' => 'budget_280'],
            ['label' => '🥛 Dairy/Lactose-free meals', 'label_en' => 'Dairy/Lactose-free', 'action' => 'dairy_free'],
            ['label' => '👑 Family feast for 10', 'label_en' => 'Feast for 10', 'action' => 'feast_10'],
            ['label' => '🥗 Macro-calculated healthy', 'label_en' => 'Healthy Diet', 'action' => 'healthy'],
            ['label' => '🍲 Signature clay tajine', 'label_en' => 'Signature Tajine', 'action' => 'tajine']
        ] : [
            ['label' => '💵 معايا 280 جنيه لغداء شخصين', 'label_en' => 'Budget: 280 EGP for two', 'action' => 'budget_280'],
            ['label' => '🥛 أكلات بدون سمنة أو لاكتوز', 'label_en' => 'Dairy/Lactose-free', 'action' => 'dairy_free'],
            ['label' => '👑 عزومة 10 أفراد لمة عيلة', 'label_en' => 'Feast for 10', 'action' => 'feast_10'],
            ['label' => '🥗 أكل صحي محسوب الماكروز', 'label_en' => 'Healthy Diet', 'action' => 'healthy'],
            ['label' => '🍲 أشهر طاجن اليوم', 'label_en' => 'Signature Tajine', 'action' => 'tajine']
        ];
    }

    /**
     * 2. حاسبة ومخطط العزومات التفاعلي (Interactive Feast Calculator)
     */
    public function feastPlanner(Request $request)
    {
        $guests = max(2, min(100, (int) $request->input('guests', 8)));
        $tier = $request->input('budget_tier', 'classic'); // budget | classic | royal
        $preference = $request->input('preference', 'all'); // all | grills | tajines | mahshi
        $lang = $request->input('language', 'ar');
        $isEn = $lang === 'en';

        $allDishes = Dish::where('is_available', true)->get();

        // 1. حساب الأطباق الرئيسية المناسبة لعدد الضيوف
        $mainCount = ceil($guests / 4); // كل صينية تكفي 4 أفراد
        $mains = $allDishes->filter(function ($d) use ($tier, $preference) {
            if ($preference === 'grills') return $d->category_id === 'grills';
            if ($preference === 'tajines') return $d->category_id === 'clay-tagines';
            if ($preference === 'mahshi') return str_contains($d->name, 'محشي') || $d->category_id === 'family-trays';
            return $d->category_id === 'family-trays' || $d->category_id === 'grills' || $d->category_id === 'clay-tagines';
        })->shuffle()->take($mainCount)->values();

        if ($mains->isEmpty()) {
            $mains = $allDishes->where('is_best_seller', true)->take($mainCount)->values();
        }

        // 2. صواني المحاشي والرقاق
        $sidesTraysCount = ceil($guests / 5);
        $sideTrays = $allDishes->filter(function ($d) {
            return str_contains($d->name, 'محاشي') || str_contains($d->name, 'رقاق') || str_contains($d->name, 'ورق عنب') || str_contains($d->name, 'أرز');
        })->shuffle()->take($sidesTraysCount)->values();

        // 3. الشوربات الساخنة
        $soupsCount = ceil($guests / 3);
        $soups = $allDishes->filter(function ($d) {
            return $d->category_id === 'soups' || str_contains($d->name, 'شوربة') || str_contains($d->name, 'ملوخية');
        })->shuffle()->take($soupsCount)->values();

        // 4. السلطات والمقبلات والعيش
        $saladsCount = ceil($guests / 3);
        $salads = $allDishes->filter(function ($d) {
            return $d->category_id === 'salads' || str_contains($d->name, 'سلطة') || str_contains($d->name, 'مقبلات');
        })->shuffle()->take($saladsCount)->values();

        // تجميع كل الأصناف
        $allItems = $mains->concat($sideTrays)->concat($soups)->concat($salads);
        
        $originalTotal = $allItems->sum('price');
        // خصم باقة العزومة 12%
        $discountPercentage = 12;
        if ($tier === 'royal' || $guests >= 15) {
            $discountPercentage = 15;
        }

        $discountAmount = round(($originalTotal * $discountPercentage) / 100);
        $bundlePrice = round($originalTotal - $discountAmount);
        $pricePerGuest = round($bundlePrice / $guests);

        // حساب العيش البلدي الطازج المجاني (3 أرغفة لكل فرد)
        $breadLoaves = $guests * 3;

        $formatDish = function ($d) {
            return [
                'id' => $d->id,
                'name' => $d->name,
                'description' => $d->description,
                'price' => (float) $d->price,
                'image' => $d->image,
                'categoryId' => $d->category_id,
                'tag' => $d->tag ?: 'عزومة لقمة'
            ];
        };

        return response()->json([
            'status' => 'success',
            'guests' => $guests,
            'tier' => $tier,
            'bread_loaves_included' => $breadLoaves,
            'summary' => [
                'original_price' => $originalTotal,
                'discount_amount' => $discountAmount,
                'discount_percentage' => $discountPercentage,
                'bundle_price' => $bundlePrice,
                'price_per_guest' => $pricePerGuest,
                'mains_count' => $mains->count(),
                'sides_count' => $sideTrays->count(),
                'soups_count' => $soups->count(),
                'salads_count' => $salads->count(),
            ],
            'categorized_feast' => [
                'mains' => $mains->map($formatDish)->values(),
                'side_trays' => $sideTrays->map($formatDish)->values(),
                'soups' => $soups->map($formatDish)->values(),
                'salads' => $salads->map($formatDish)->values(),
            ],
            'all_dishes' => $allItems->map($formatDish)->values()
        ]);
    }

    /**
     * 3. محرك الترشيحات الذكية اللحظية (Smart AI Cross-Sell Engine)
     */
    public function smartCrossSell(Request $request)
    {
        $cartDishIds = $request->input('cart_dish_ids', []);
        $lang = $request->input('language', 'ar');
        $isEn = $lang === 'en';

        $allDishes = Dish::where('is_available', true)->get();
        $cartDishes = $allDishes->whereIn('id', $cartDishIds);

        $hasMolokhia = $cartDishes->contains(function ($d) {
            return str_contains($d->name, 'ملوخية') || str_contains($d->name, 'طشة');
        });

        $hasGrills = $cartDishes->contains(function ($d) {
            return $d->category_id === 'grills' || str_contains($d->name, 'مشوي') || str_contains($d->name, 'كباب') || str_contains($d->name, 'طرب');
        });

        $hasTajine = $cartDishes->contains(function ($d) {
            return $d->category_id === 'clay-tagines' || str_contains($d->name, 'طاجن');
        });

        $hasFeteer = $cartDishes->contains(function ($d) {
            return $d->category_id === 'feteer-meshaltet' || str_contains($d->name, 'فطير');
        });

        $recommendations = collect();

        // سيناريو الملوخية: يقترح رز بالشعرية وعيش بلدي وطماطم متبلة
        if ($hasMolokhia) {
            $pairing = $allDishes->filter(function ($d) {
                return str_contains($d->name, 'أرز') || str_contains($d->name, 'طماطم') || str_contains($d->name, 'شوربة') || $d->category_id === 'salads';
            })->take(3);
            foreach ($pairing as $p) {
                $p->pairing_reason = 'يكمل طشة الملوخية الفلاحي بالسمن البلدي 🍲';
                $p->pairing_reason_en = 'Authentic complement for fresh Molokhia & sizzling ghee 🍲';
                $recommendations->push($p);
            }
        }

        // سيناريو المشويات: يقترح طحينة سمسم وسلطة بلدي وشوربة لسان عصفور
        if ($hasGrills) {
            $pairing = $allDishes->filter(function ($d) {
                return str_contains($d->name, 'طحينة') || str_contains($d->name, 'سلطة بلدي') || str_contains($d->name, 'لسان عصفور');
            })->take(3);
            foreach ($pairing as $p) {
                $p->pairing_reason = 'لوازم المشويات على الفحم: طحينة وشوربة وسلطة خضرا 🥩';
                $p->pairing_reason_en = 'Essential BBQ pairings: Sesame tahini & baladi soup 🥩';
                $recommendations->push($p);
            }
        }

        // سيناريو الطواجن: يقترح أرز معمر بالقشطة ومخلل بلدي
        if ($hasTajine) {
            $pairing = $allDishes->filter(function ($d) {
                return str_contains($d->name, 'معمر') || str_contains($d->name, 'أرز') || $d->category_id === 'salads';
            })->take(2);
            foreach ($pairing as $p) {
                $p->pairing_reason = 'يا سلام مع الطاجن السخن: أرز معمر وسلطة فريش 🏺';
                $p->pairing_reason_en = 'Simmering tajine classic pairing 🏺';
                $recommendations->push($p);
            }
        }

        // سيناريو الفطير المشلتت: يقترح عسل أبيض وقشطة بلدي وجبنة قديمة
        if ($hasFeteer) {
            $pairing = $allDishes->filter(function ($d) {
                return str_contains($d->name, 'عسل') || str_contains($d->name, 'قشطة') || str_contains($d->name, 'جبنة');
            })->take(2);
            foreach ($pairing as $p) {
                $p->pairing_reason = 'تغميسات الفطير المشلتت الفلاحي بالسمن البلدي 🥞';
                $p->pairing_reason_en = 'Traditional dips for layered Baladi Feteer 🥞';
                $recommendations->push($p);
            }
        }

        // ترشيحات عامة إذا كانت السلة فارغة أو لم تطابق
        if ($recommendations->isEmpty()) {
            $popular = $allDishes->whereNotIn('id', $cartDishIds)->where('is_best_seller', true)->take(4);
            foreach ($popular as $pop) {
                $pop->pairing_reason = 'مكمل فلاحي يضبط سفرتك 🌿';
                $pop->pairing_reason_en = 'Perfect authentic pairing 🌿';
                $recommendations->push($pop);
            }
        }

        // إزالة التكرار والأصناف الموجودة بالفعل في السلة
        $final = $recommendations->unique('id')->whereNotIn('id', $cartDishIds)->take(3)->values();

        $formatted = $final->map(function ($d) {
            // خصم مكمل ذكي 10%
            $discounted = round($d->price * 0.90);
            return [
                'id' => $d->id,
                'name' => $d->name,
                'description' => $d->description,
                'price' => (float) $d->price,
                'discounted_price' => (float) $discounted,
                'image' => $d->image,
                'categoryId' => $d->category_id,
                'pairing_reason' => $d->pairing_reason ?? 'ترشيح الشيف لتكملة سفرتك',
                'pairing_reason_en' => $d->pairing_reason_en ?? 'Chef pairing recommendation'
            ];
        });

        return response()->json([
            'status' => 'success',
            'recommendations' => $formatted
        ]);
    }

    /**
     * 4. منشئ جدول الأسبوع المخصص بالذكاء الاصطناعي (AI Weekly Meal Planner)
     */
    public function weeklyMealPlanner(Request $request)
    {
        $familySize = max(1, min(12, (int) $request->input('family_size', 4)));
        $style = $request->input('dietary_style', 'baladi'); // baladi | healthy | feast | balanced
        $exclusions = $request->input('exclusions', []); // ['fish', 'okra', 'liver']
        $lang = $request->input('language', 'ar');
        $isEn = $lang === 'en';

        $allDishes = Dish::where('is_available', true)->get();

        // مصفوفة أيام الأسبوع الستة (من الأحد إلى الجمعة)
        $daysConfig = [
            [
                'day' => 'Sunday',
                'day_ar' => 'الأحد',
                'theme_ar' => 'بداية أسبوع مباركة وطواجن دافية',
                'theme_en' => 'Comforting Clay Tajine Sunday',
                'category' => 'clay-tagines'
            ],
            [
                'day' => 'Monday',
                'day_ar' => 'الإثنين',
                'theme_ar' => 'طشة ملوخية خضرا وفراخ محمرة',
                'theme_en' => 'Fresh Molokhia & Roasted Chicken',
                'category' => 'clay-tagines'
            ],
            [
                'day' => 'Tuesday',
                'day_ar' => 'الثلاثاء',
                'theme_ar' => 'صواني ومحاشي مشكلة تشبع العيلة',
                'theme_en' => 'Stuffed Vegetables & Family Trays',
                'category' => 'family-trays'
            ],
            [
                'day' => 'Wednesday',
                'day_ar' => 'الأربعاء',
                'theme_ar' => 'غداء صحي بروتينات وخضار سوتيه',
                'theme_en' => 'Clean Protein & Steamed Veggies',
                'category' => 'healthy'
            ],
            [
                'day' => 'Thursday',
                'day_ar' => 'الخميس',
                'theme_ar' => 'مشويات على الفحم وريش وكباب',
                'theme_en' => 'Charcoal BBQ & Kebab Thursday',
                'category' => 'grills'
            ],
            [
                'day' => 'Friday',
                'day_ar' => 'الجمعة',
                'theme_ar' => 'لمة الجمعة وفطير مشلتت وحمام محشي',
                'theme_en' => 'Friday Gathering: Pigeons & Feteer',
                'category' => 'feteer-meshaltet'
            ]
        ];

        $plan = [];
        $totalOriginal = 0;

        foreach ($daysConfig as $config) {
            // اختيار طبق رئيسي
            $eligible = $allDishes->filter(function ($d) use ($config, $style, $exclusions) {
                foreach ($exclusions as $ex) {
                    if (mb_stripos($d->name, $ex) !== false || mb_stripos($d->description, $ex) !== false) {
                        return false;
                    }
                }
                if ($style === 'healthy') {
                    return $d->category_id === 'healthy' || str_contains($d->name, 'مشوي');
                }
                return $d->category_id === $config['category'] || $d->is_best_seller;
            });

            if ($eligible->isEmpty()) {
                $eligible = $allDishes;
            }

            $main = $eligible->shuffle()->first();
            
            $servingsMultiplier = max(1, $familySize / 2);
            $dailyCost = round($main->price * $servingsMultiplier);
            $totalOriginal += $dailyCost;

            $plan[] = [
                'day' => $config['day'],
                'day_ar' => $config['day_ar'],
                'theme_ar' => $config['theme_ar'],
                'theme_en' => $config['theme_en'],
                'main_dish' => [
                    'id' => $main->id,
                    'name' => $main->name,
                    'description' => $main->description,
                    'price' => (float) $main->price,
                    'image' => $main->image,
                    'categoryId' => $main->category_id,
                ],
                'sides_included' => [
                    $isEn ? 'Fresh Baladi Bread (4 loaves)' : 'عيش بلدي طازة (4 أرغفة)',
                    $isEn ? 'Green Farm Salad' : 'سلطة خضراء بلدية',
                    $isEn ? 'Pickled farm vegetables' : 'طرشي بلدي فلاحي'
                ],
                'servings' => "تكفي {$familySize} أفراد",
                'daily_cost' => $dailyCost,
                'chef_note' => $isEn ? 'Cooked fresh on the day with 100% baladi ghee.' : 'تطهى طازجة يومياً صباحاً وتصل ساخنة قبل ميعاد الغداء.'
            ];
        }

        // خصم الاشتراك الأسبوعي 15%
        $weeklyDiscountPercentage = 15;
        $discountAmount = round(($totalOriginal * $weeklyDiscountPercentage) / 100);
        $finalWeeklyPrice = $totalOriginal - $discountAmount;
        $dailyAvg = round($finalWeeklyPrice / 6);
        $costPerPersonPerDay = round($dailyAvg / $familySize);

        return response()->json([
            'status' => 'success',
            'family_members' => $familySize,
            'dietary_style' => $style,
            'days' => $plan,
            'summary' => [
                'original_total' => $totalOriginal,
                'weekly_discount_amount' => $discountAmount,
                'discount_percentage' => $weeklyDiscountPercentage,
                'final_weekly_price' => $finalWeeklyPrice,
                'daily_average' => $dailyAvg,
                'cost_per_person_per_day' => $costPerPersonPerDay
            ]
        ]);
    }
}
