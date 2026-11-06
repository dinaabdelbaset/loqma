export interface DishLayer {
  id: string;
  nameAr: string;
  filename: string;
  zIndex: number;
  widthPercent: number;
  bottomOffsetPercent: number;
  explodedOffset: number;
  initialRotation: number;
  finalRotation: number;
}

export interface AssemblyDish {
  id: string;
  nameAr: string;
  tag: string;
  price: number;
  icon: string;
  description: string;
  glowColor: string;
  layers: DishLayer[];
}

export const ASSEMBLY_DISHES: AssemblyDish[] = [
  {
    id: 'burger',
    nameAr: 'برجر لوقما الفاخر',
    tag: 'مكونات طازجة 100%',
    price: 180,
    icon: '🍔',
    description: 'شريحة لحم صافي مشوية على الجريل مع جبنة شيدر وخضار طازج في خبز البريوش الذهبي بالسمسم',
    glowColor: 'bg-[#8A9684]/15',
    layers: [
      {
        id: 'b-bottom',
        nameAr: 'خبز البرجر السفلي (Base Bun)',
        filename: '/images/burger/burger-bottom.png',
        zIndex: 10,
        widthPercent: 82,
        bottomOffsetPercent: 6,
        explodedOffset: 130,
        initialRotation: 3,
        finalRotation: 0,
      },
      {
        id: 'b-patty',
        nameAr: 'شريحة لحم بقري مشوية على الجريل',
        filename: '/images/burger/burger-patty.png',
        zIndex: 20,
        widthPercent: 78,
        bottomOffsetPercent: 16,
        explodedOffset: 75,
        initialRotation: -5,
        finalRotation: 0,
      },
      {
        id: 'b-cheese',
        nameAr: 'شريحة جبن شيدر ذائبة',
        filename: '/images/burger/cheese.png',
        zIndex: 30,
        widthPercent: 72,
        bottomOffsetPercent: 23,
        explodedOffset: 25,
        initialRotation: 7,
        finalRotation: 0,
      },
      {
        id: 'b-tomato',
        nameAr: 'شريحة طماطم طازجة',
        filename: '/images/burger/tomato.png',
        zIndex: 40,
        widthPercent: 68,
        bottomOffsetPercent: 29,
        explodedOffset: -30,
        initialRotation: -4,
        finalRotation: 0,
      },
      {
        id: 'b-lettuce',
        nameAr: 'خس كريسبي مقرمش',
        filename: '/images/burger/lettuce.png',
        zIndex: 50,
        widthPercent: 86,
        bottomOffsetPercent: 35,
        explodedOffset: -85,
        initialRotation: 5,
        finalRotation: 0,
      },
      {
        id: 'b-top',
        nameAr: 'خبز البرجر الذهبي بالسمسم',
        filename: '/images/burger/burger-top.png',
        zIndex: 60,
        widthPercent: 84,
        bottomOffsetPercent: 41,
        explodedOffset: -145,
        initialRotation: -3,
        finalRotation: 0,
      },
    ],
  },
  {
    id: 'tagine',
    nameAr: 'طاجن عكاوي فلاحي بالأورما',
    tag: 'طبيخ زمان 6 ساعات',
    price: 400,
    icon: '🍲',
    description: 'طاجن فخار أسواني أصيل بلحم العكاوي البلدي المكرمل مع البصل الأورما والمرق الدسم',
    glowColor: 'bg-[#8A9684]/15',
    layers: [
      {
        id: 't-pot',
        nameAr: 'طاجن الفخار الأسواني وبصل الأورما المكرمل',
        filename: '/images/assembly/tagine/tagine-pot.png',
        zIndex: 10,
        widthPercent: 88,
        bottomOffsetPercent: 12,
        explodedOffset: 100,
        initialRotation: 2,
        finalRotation: 0,
      },
      {
        id: 't-meat',
        nameAr: 'لحم عكاوي بلدي مطهو على نار هادية 6 ساعات',
        filename: '/images/assembly/tagine/tagine-meat.png',
        zIndex: 20,
        widthPercent: 88,
        bottomOffsetPercent: 16,
        explodedOffset: 20,
        initialRotation: -3,
        finalRotation: 0,
      },
      {
        id: 't-garnish',
        nameAr: 'فلفل مشوي ورشة كزبرة وطشة توم فلاحي',
        filename: '/images/assembly/tagine/tagine-garnish.png',
        zIndex: 30,
        widthPercent: 80,
        bottomOffsetPercent: 22,
        explodedOffset: -70,
        initialRotation: 3,
        finalRotation: 0,
      },
    ],
  },
  {
    id: 'pigeon',
    nameAr: 'الحمام المحشي الملكي',
    tag: 'سمنة بلدي ومكسرات',
    price: 245,
    icon: '🕊️',
    description: 'جوز حمام بلدي محشي أرز بالخلطة والمستكة والمزاليكا، محمر بالسمن البلدي مع المكسرات',
    glowColor: 'bg-[#8A9684]/15',
    layers: [
      {
        id: 'p-dish',
        nameAr: 'سرفيس الفخار الفلاحي الأصيل وأرز الخلطة',
        filename: '/images/assembly/pigeon/pigeon-dish.png',
        zIndex: 10,
        widthPercent: 88,
        bottomOffsetPercent: 10,
        explodedOffset: 100,
        initialRotation: 2,
        finalRotation: 0,
      },
      {
        id: 'p-birds',
        nameAr: 'جوز حمام بلدي محمر بالسمن البلدي',
        filename: '/images/assembly/pigeon/pigeon-birds.png',
        zIndex: 20,
        widthPercent: 88,
        bottomOffsetPercent: 14,
        explodedOffset: 15,
        initialRotation: -3,
        finalRotation: 0,
      },
      {
        id: 'p-nuts',
        nameAr: 'صنوبر ولوز محمص ورشة بقدونس فريش',
        filename: '/images/assembly/pigeon/pigeon-nuts.png',
        zIndex: 30,
        widthPercent: 78,
        bottomOffsetPercent: 20,
        explodedOffset: -75,
        initialRotation: 3,
        finalRotation: 0,
      },
    ],
  },
  {
    id: 'grills',
    nameAr: 'مشويات مشكلة على الفحم',
    tag: 'كباب وكفتة وريش',
    price: 480,
    icon: '🥩',
    description: 'تشكيلة مشويات فاخرة من الكفتة البلدي والريش الضاني والطرب على الفحم مع الخضار المشوي',
    glowColor: 'bg-red-600/15',
    layers: [
      {
        id: 'g-bread',
        nameAr: 'صينية التقديم والعيش البلدي على الفحم',
        filename: '/images/assembly/grills/grills-bread.png',
        zIndex: 10,
        widthPercent: 96,
        bottomOffsetPercent: 10,
        explodedOffset: 110,
        initialRotation: 1,
        finalRotation: 0,
      },
      {
        id: 'g-meats',
        nameAr: 'كفتة وكباب وريش ضاني مشوية على الفحم',
        filename: '/images/assembly/grills/grills-meats.png',
        zIndex: 20,
        widthPercent: 92,
        bottomOffsetPercent: 15,
        explodedOffset: 20,
        initialRotation: -2,
        finalRotation: 0,
      },
      {
        id: 'g-veg',
        nameAr: 'طماطم وبصل وفلفل مشويين على الحطب',
        filename: '/images/assembly/grills/grills-veg.png',
        zIndex: 30,
        widthPercent: 80,
        bottomOffsetPercent: 20,
        explodedOffset: -70,
        initialRotation: 3,
        finalRotation: 0,
      },
    ],
  },
];

