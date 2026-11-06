export interface RecommendedDish {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId?: string;
  calories?: number;
  tag?: string;
}

export interface AIChatResponse {
  status: string;
  reply: string;
  reply_en?: string;
  recommended_dishes: RecommendedDish[];
  total_estimated_price: number;
  quick_actions: {
    label: string;
    label_en: string;
    action: string;
  }[];
}

export interface FeastPlannerResponse {
  status: string;
  guests: number;
  tier: string;
  bread_loaves_included: number;
  summary: {
    original_price: number;
    discount_amount: number;
    discount_percentage: number;
    bundle_price: number;
    price_per_guest: number;
    mains_count: number;
    sides_count: number;
    soups_count: number;
    salads_count: number;
  };
  categorized_feast: {
    mains: RecommendedDish[];
    side_trays: RecommendedDish[];
    soups: RecommendedDish[];
    salads: RecommendedDish[];
  };
  all_dishes: RecommendedDish[];
}

export interface CrossSellItem {
  id: number;
  name: string;
  description: string;
  price: number;
  discounted_price: number;
  image?: string;
  categoryId?: string;
  pairing_reason: string;
  pairing_reason_en?: string;
}

export interface CrossSellResponse {
  status: string;
  recommendations: CrossSellItem[];
}

export interface MealPlanDay {
  day: string;
  day_ar: string;
  theme_ar: string;
  theme_en?: string;
  main_dish: RecommendedDish;
  sides_included: string[];
  servings: string;
  daily_cost: number;
  chef_note: string;
}

export interface MealPlanResponse {
  status: string;
  family_members: number;
  dietary_style: string;
  days: MealPlanDay[];
  summary: {
    original_total: number;
    weekly_discount_amount: number;
    discount_percentage: number;
    final_weekly_price: number;
    daily_average: number;
    cost_per_person_per_day: number;
  };
}

/**
 * 1. محادثة شيف لقمة الذكي
 */
export async function askAIChef(
  message: string,
  history?: { role: string; content: string }[],
  budget?: number,
  language: string = 'ar'
): Promise<AIChatResponse> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message, history, budget, language })
    });
    if (!res.ok) throw new Error('AI Chat request failed');
    return await res.json();
  } catch (err) {
    console.warn('Fallback local AI chat:', err);
    return {
      status: 'success',
      reply: 'يا أهلاً وسهلاً بيك في مطبخ لقمة! 🍲 الشيف في خدمتك ومعاك خطوة بخطوة.. قولي بتفكر في إيه النهاردة ونفسك تشتهي إيه؟',
      reply_en: 'Welcome to Loqma Kitchen! I am at your service. What are you craving today?',
      recommended_dishes: [],
      total_estimated_price: 0,
      quick_actions: []
    };
  }
}

/**
 * 2. حاسبة ومخطط العزومات التفاعلي
 */
export async function planFeast(
  guests: number = 8,
  budgetTier: string = 'classic',
  preference: string = 'all',
  language: string = 'ar'
): Promise<FeastPlannerResponse> {
  try {
    const res = await fetch('/api/ai/feast-planner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ guests, budget_tier: budgetTier, preference, language })
    });
    if (!res.ok) throw new Error('Feast Planner failed');
    return await res.json();
  } catch (err) {
    console.warn('Fallback feast planner:', err);
    const mockMains: RecommendedDish[] = [
      { id: 101, name: 'صينية بط بلدي محمر بالسمن', description: 'بطة كاملة محشية فريك صعيدي', price: 580, image: '/images/categories/family-trays.jpg' },
      { id: 102, name: 'صينية موزة بتلو بالأرز البسمتي', description: 'موزة بتلو بلدي دايبة كالملبن', price: 620, image: '/images/categories/clay-tagines.jpg' }
    ];
    return {
      status: 'success',
      guests,
      tier: budgetTier,
      bread_loaves_included: guests * 3,
      summary: {
        original_price: 1580,
        discount_amount: 190,
        discount_percentage: 12,
        bundle_price: 1390,
        price_per_guest: Math.round(1390 / guests),
        mains_count: 2,
        sides_count: 2,
        soups_count: 2,
        salads_count: 2
      },
      categorized_feast: {
        mains: mockMains,
        side_trays: [{ id: 103, name: 'صينية محشي ورق عنب', description: 'ورق عنب بناتي', price: 190 }],
        soups: [{ id: 104, name: 'طاجن ملوخية بالطشة', description: 'ملوخية خضراء فريش', price: 95 }],
        salads: [{ id: 105, name: 'سلطة بلدي وطحينة سمسم', description: 'سلطات مشكلة', price: 95 }]
      },
      all_dishes: mockMains
    };
  }
}

/**
 * 3. محرك الترشيحات الذكية اللحظية (Smart Cross-Sell)
 */
export async function getSmartCrossSell(
  dishIds: number[],
  language: string = 'ar'
): Promise<CrossSellResponse> {
  try {
    const res = await fetch('/api/ai/cross-sell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ dish_ids: dishIds, language })
    });
    if (!res.ok) throw new Error('Cross-sell fetch failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'success',
      recommendations: [
        {
          id: 501,
          name: 'أرز بلدي بالشعرية والسمن الفلاحي',
          description: 'مفلفل بالسمن البلدي والمرقة الغنية',
          price: 45,
          discounted_price: 40,
          image: '/images/categories/clay-tagines.jpg',
          pairing_reason: 'أساسي لتغميس الصوص والطشة 🍲',
          pairing_reason_en: 'Essential for dipping rich sauces 🍲'
        },
        {
          id: 502,
          name: 'سلطة طحينة سمسم بلدي بالخل والليمون',
          description: 'طحينة خام دسمة متبلة على أصولها',
          price: 35,
          discounted_price: 30,
          image: '/images/categories/salads.jpg',
          pairing_reason: 'تكسر الدسامة وتفتح النفس 🥗',
          pairing_reason_en: 'Pairs perfectly with meats 🥗'
        }
      ]
    };
  }
}

/**
 * 4. منشئ جدول الأسبوع المخصص بالذكاء الاصطناعي
 */
export async function generateCustomMealPlan(
  familyMembers: number = 4,
  dietaryStyle: string = 'balanced',
  dislikes: string[] = [],
  budgetTier: string = 'standard',
  language: string = 'ar'
): Promise<MealPlanResponse> {
  try {
    const res = await fetch('/api/ai/meal-planner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        family_members: familyMembers,
        dietary_style: dietaryStyle,
        dislikes,
        budget_tier: budgetTier,
        language
      })
    });
    if (!res.ok) throw new Error('Meal planner failed');
    return await res.json();
  } catch (err) {
    const mockDays: MealPlanDay[] = [
      {
        day: 'Sunday',
        day_ar: 'الأحد',
        theme_ar: 'فراخ بلدي وطاجن لسان عصفور',
        main_dish: { id: 601, name: 'دجاجة بلدي محمرة بالسمن', description: 'دجاج بلدي فلاحي', price: 230 },
        sides_included: ['أرز بالشعرية', 'شوربة لسان عصفور', 'سلطة خضراء', 'عيش بلدي'],
        servings: `تكفي ${familyMembers} أفراد`,
        daily_cost: 320,
        chef_note: 'طهي صباحي طازج وتوصيل ساخن 1:00 ظهراً'
      },
      {
        day: 'Tuesday',
        day_ar: 'الثلاثاء',
        theme_ar: 'طاجن ملوخية بالأرانب الصعيدي',
        main_dish: { id: 602, name: 'طاجن ملوخية وأرانب فلاحي', description: 'ملوخية خضراء بطشة الثوم', price: 260 },
        sides_included: ['أرز بالشعرية', 'شوربة أرانب', 'طماطم متبلة', 'عيش سخن'],
        servings: `تكفي ${familyMembers} أفراد`,
        daily_cost: 340,
        chef_note: 'الملوخية لا تُغطى بعد الطشة للحفاظ على لونها'
      }
    ];
    return {
      status: 'success',
      family_members: familyMembers,
      dietary_style: dietaryStyle,
      days: mockDays,
      summary: {
        original_total: 2100,
        weekly_discount_amount: 315,
        discount_percentage: 15,
        final_weekly_price: 1785,
        daily_average: Math.round(1785 / 6),
        cost_per_person_per_day: Math.round((1785 / 6) / familyMembers)
      }
    };
  }
}

