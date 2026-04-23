export type Trek = {
  slug: string;
  name: string;
  region: string;
  difficulty: "Easy" | "Moderate" | "Hard" | "Very Hard";
  duration: number; // days
  maxAltitude: number; // metres
  price: number; // INR
  shortDesc: string;
  description: string;
  highlights: string[];
  bestSeason: string;
  image: string;
  featured: boolean;
};

export const treks: Trek[] = [
  {
    slug: "kang-yatse-2",
    name: "Kang Yatse 2 Expedition",
    region: "Ladakh",
    difficulty: "Very Hard",
    duration: 14,
    maxAltitude: 6250,
    price: 45000,
    shortDesc: "Lead your team to 6,250m in the Markha Valley — Ladakh's most rewarding high-altitude summit.",
    description: "Kang Yatse 2 is one of the most accessible 6,000m peaks in the Indian Himalayas, approached via the iconic Markha Valley. Technically demanding on the summit block but manageable for fit, motivated climbers with proper preparation. A full expedition experience — acclimatisation walks, Camp I at 5,600m, alpine start, and a summit ridge with views deep into Zanskar.",
    highlights: [
      "6,250m summit — highest accessible peak in Markha Valley",
      "Classic Markha Valley approach through remote Ladakhi villages",
      "Fixed rope summit block with experienced expedition leaders",
      "Small groups — maximum 8 per expedition",
      "Full acclimatisation protocol built into the itinerary",
    ],
    bestSeason: "July – September",
    image: "/images/kang-yatse-hero.jpg",
    featured: true,
  },
  {
    slug: "yunam-peak",
    name: "Yunam Peak",
    region: "Lahaul, Himachal Pradesh",
    difficulty: "Hard",
    duration: 9,
    maxAltitude: 6150,
    price: 32000,
    shortDesc: "A non-technical 6,000m peak above the Manali–Leh highway — ideal for your first high-altitude summit.",
    description: "Yunam Peak offers one of the cleanest introductions to 6,000m mountaineering in India. Non-technical on the standard route, but genuinely high — base camp sits above 4,900m and every step to the summit demands serious acclimatisation. The Lahaul landscape is raw and spectacular. A peak for those ready to commit to the preparation but not yet ready for roped technical ground.",
    highlights: [
      "6,150m summit — non-technical, pure altitude challenge",
      "Road-accessible base camp in dramatic Lahaul landscape",
      "Ideal first 6,000m peak with experienced leadership",
      "Flexible join-dates across the season",
      "Strong post-expedition debrief and altitude education",
    ],
    bestSeason: "July – October",
    image: "/images/yunam-hero.jpg",
    featured: true,
  },
  {
    slug: "friendship-peak",
    name: "Friendship Peak",
    region: "Kullu, Himachal Pradesh",
    difficulty: "Hard",
    duration: 10,
    maxAltitude: 5289,
    price: 28000,
    shortDesc: "Beas Kund glacier, fixed ropes, and a summit at 5,289m above Solang Valley — a proper mountaineering introduction.",
    description: "Friendship Peak is the classic entry point to technical Himalayan climbing — glaciated approach, crampon terrain, fixed ropes on the upper section, and a summit that earns its views. Starting from Solang Nala above Manali, the route climbs through the Beas Kund basin to a high camp before the final push. Suitable for trekkers making the step to mountaineering.",
    highlights: [
      "First proper glacier crossing and crampon terrain",
      "Fixed rope summit section — technical introduction",
      "Views of Hanuman Tibba and Deo Tibba from summit",
      "Solang Nala – Beas Kund – High Camp – Summit sequence",
      "Ideal step-up from moderate trekking to mountaineering",
    ],
    bestSeason: "May – June, September – October",
    image: "/images/friendship-hero.jpg",
    featured: true,
  },
  {
    slug: "rupin-pass",
    name: "Rupin Pass Trek",
    region: "Uttarakhand / Himachal Pradesh",
    difficulty: "Moderate",
    duration: 8,
    maxAltitude: 4650,
    price: 16000,
    shortDesc: "India's most iconic moderate crossing — river, forest, meadow, waterfall, and the legendary snow wall.",
    description: "Rupin Pass is the benchmark for what a great moderate Himalayan trek should be: variety of terrain, a clear narrative arc from valley floor to high pass, and one genuinely memorable technical moment — the snow wall at 4,400m. The route connects Dhaula in Uttarakhand to Sangla in Himachal Pradesh across eight days of progressively higher and more dramatic landscape.",
    highlights: [
      "Iconic snow wall at 4,400m — the definitive Rupin moment",
      "Rupin river crossings, waterfalls and birch forest",
      "Sangla Valley descent — one of the most scenic in the Himalayas",
      "Clear acclimatisation profile — ideal for gaining altitude experience",
      "Well-established campsites with full crew support",
    ],
    bestSeason: "May – June, September – October",
    image: "/images/rupin-hero.jpg",
    featured: false,
  },
  {
    slug: "hampta-pass",
    name: "Hampta Pass Trek",
    region: "Kullu / Lahaul, Himachal Pradesh",
    difficulty: "Moderate",
    duration: 6,
    maxAltitude: 4270,
    price: 12000,
    shortDesc: "One of the great landscape contrasts in the Indian Himalayas — lush Kullu on one side, stark Lahaul on the other.",
    description: "Hampta Pass delivers one of the most dramatic landscape transitions in Indian trekking. You begin in the green, forested Kullu valley above Manali and cross at 4,270m into the barren, high-altitude moonscape of Lahaul. The pass itself is straightforward in season, and the optional Chandratal lake day makes this a genuine highlight of the western Himalayan circuit.",
    highlights: [
      "Dramatic green-to-desert landscape transition at the pass",
      "Optional Chandratal lake day (4,300m) — one of India's most beautiful lakes",
      "Short enough for first-time Himalayan trekkers with good fitness",
      "River crossings and high meadow camping above Manali",
      "Year-round accessibility in shoulder seasons",
    ],
    bestSeason: "June – October",
    image: "/images/hampta-hero.jpg",
    featured: false,
  },
  {
    slug: "pin-parvati-pass",
    name: "Pin Parvati Pass",
    region: "Kullu / Spiti, Himachal Pradesh",
    difficulty: "Very Hard",
    duration: 12,
    maxAltitude: 5319,
    price: 38000,
    shortDesc: "The demanding crossing from Parvati Valley into Spiti — glacier navigation, crevasse fields, and total remoteness.",
    description: "Pin Parvati Pass is for serious trekkers only. At 5,319m, the pass involves glacier travel, navigation through crevassed terrain, and extended days at altitude in some of the most remote country in Himachal Pradesh. The Parvati Valley approach is stunningly beautiful; the Spiti descent is otherworldly. This is the route that separates experienced Himalayan trekkers from those who have been tested and found wanting.",
    highlights: [
      "5,319m glaciated high pass — technical and committing",
      "Glacier navigation with rope and ice axe skills required",
      "Parvati Valley — Pin Valley contrast: green to arid moonscape",
      "Maximum 6 participants — full technical guide team",
      "One of the most remote and rewarding crossings in Himachal",
    ],
    bestSeason: "August – September",
    image: "/images/pin-parvati-hero.jpg",
    featured: false,
  },
];

export function getFeaturedTreks(): Trek[] {
  return treks.filter((t) => t.featured);
}

export function getTrekBySlug(slug: string): Trek | undefined {
  return treks.find((t) => t.slug === slug);
}

export function getDifficultyBadgeClass(difficulty: Trek["difficulty"]): string {
  const map: Record<Trek["difficulty"], string> = {
    Easy: "badge-easy",
    Moderate: "badge-moderate",
    Hard: "badge-hard",
    "Very Hard": "badge-vhard",
  };
  return map[difficulty];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
