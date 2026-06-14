export type Trek = {
  slug: string;
  name: string;
  region: "kashmir" | "himachal" | "uttarakhand" | "nepal";
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
  // ── Kashmir ──────────────────────────────────────────────────────────
  {
    slug: "kashmir-great-lakes",
    name: "Kashmir Great Lakes Trek",
    region: "kashmir",
    difficulty: "Hard",
    duration: 7,
    maxAltitude: 4191,
    price: 15500,
    shortDesc: "Walk past seven alpine lakes nestled in the pristine valleys of Kashmir.",
    description: "The Kashmir Great Lakes trek is the crown jewel of Indian trekking. Every day is a postcard of turquoise lakes, wild flower meadows, and rugged mountain passes. Navigating over three high-altitude passes, it offers close-up views of the rugged peaks of Vishansar, Kishansar, and Gadsar lakes. A trek for fit mountain lovers seeking raw wilderness.",
    highlights: [
      "Visit 7 pristine alpine lakes including Vishansar, Gadsar, and Satsar",
      "Cross three high altitude passes above 4,000m",
      "Stunning meadows lined with pine and maple forests",
      "Camp under starry skies in remote valleys",
      "Experience warm local Kashmiri culture and cuisine",
    ],
    bestSeason: "July – September",
    image: "/images/kashmir-great-lakes.jpg",
    featured: true,
  },
  {
    slug: "tarsar-marsar",
    name: "Tarsar Marsar Trek",
    region: "kashmir",
    difficulty: "Moderate",
    duration: 7,
    maxAltitude: 4115,
    price: 14000,
    shortDesc: "A trek into the twin caldera lakes surrounded by towering peaks.",
    description: "Tarsar Marsar is widely considered the most beautiful moderate trek in India. Unlike treks where you view lakes from a distance, here you camp right next to the turquoise waters of Tarsar Lake. Walk through pristine grasslands, pine-shaded clearings, and witness the changing hues of twin lakes nested under towering snow peaks.",
    highlights: [
      "Camp on the shores of the glorious Tarsar lake",
      "Witness twin alpine lakes: Tarsar and Marsar",
      "Walk through the beautiful meadows of Lidderwat and Shekwas",
      "Gentler gradients suitable for moderately fit beginners",
      "Incredible birdwatching and alpine flora",
    ],
    bestSeason: "July – September",
    image: "/images/tarsar-marsar.jpg",
    featured: false,
  },
  // ── Himachal ─────────────────────────────────────────────────────────
  {
    slug: "hampta-pass",
    name: "Hampta Pass Trek",
    region: "himachal",
    difficulty: "Moderate",
    duration: 6,
    maxAltitude: 4270,
    price: 12000,
    shortDesc: "Lush green Kullu valley on one side, stark desert of Lahaul on the other.",
    description: "Hampta Pass offers the ultimate landscape contrast. Starting in the fertile, green forests of Kullu, you ascend to cross a steep pass at 4,270m, entering the barren, high-altitude desert of Lahaul. An optional drive to the crescent-shaped Chandratal Lake at 4,300m completes this classic western Himalayan experience.",
    highlights: [
      "Dramatic landscape change from green valleys to arid mountains",
      "Camp at Shea Goru, a beautiful cold-desert valley floor",
      "Visit the high-altitude moon-lake Chandratal",
      "Exciting river crossings and moraine walking",
      "Convenient start and end from Manali",
    ],
    bestSeason: "June – October",
    image: "/images/hampta-pass.jpg",
    featured: true,
  },
  {
    slug: "triund",
    name: "Triund Trek",
    region: "himachal",
    difficulty: "Easy",
    duration: 2,
    maxAltitude: 2875,
    price: 3000,
    shortDesc: "A quick ridge walk above Dharamshala with close-up views of the Dhauladhars.",
    description: "Triund is the perfect weekend getaway and introduction to Himalayan trekking. A well-defined trail climbs through dense rhododendron and oak forests to a grassy ridge overlooking the Kangra Valley on one side and the towering granite walls of the Dhauladhar range on the other. Sleep under the stars and wake up to a colossal mountain wall.",
    highlights: [
      "Close-up views of the snow-clad Dhauladhar range",
      "Beautiful hike through oak and rhododendron forests",
      "Perfect weekend trek with an easy-to-moderate gradient",
      "Sunset and sunrise views over the Kangra Valley",
      "Highly accessible start from McLeod Ganj",
    ],
    bestSeason: "March – June, September – December",
    image: "/images/triund.jpg",
    featured: false,
  },
  {
    slug: "pin-parvati-pass",
    name: "Pin Parvati Pass",
    region: "himachal",
    difficulty: "Very Hard",
    duration: 12,
    maxAltitude: 5319,
    price: 38000,
    shortDesc: "The ultimate crossing from Parvati Valley into Spiti — glacier travel and remoteness.",
    description: "Pin Parvati is a demanding high-altitude crossing that tests even seasoned trekkers. At 5,319m, it involves navigating active glaciers, crevassed fields, and cold river crossings. The trek transitions from the hot springs and dense forests of the Parvati valley to the high-altitude Buddhist culture and dry mountains of Spiti.",
    highlights: [
      "Cross the challenging glaciated pass at 5,319m",
      "Camp at the hot springs of Kheerganga and high alpine pastures of Mantalai",
      "Stark contrast between lush Kullu and desert-like Spiti valley",
      "Navigate technical crevassed ice fields with ropes",
      "Incredibly remote and pristine high-wilderness experience",
    ],
    bestSeason: "August – September",
    image: "/images/pin-parvati-pass.jpg",
    featured: false,
  },
  // ── Uttarakhand ──────────────────────────────────────────────────────
  {
    slug: "kedarkantha",
    name: "Kedarkantha Trek",
    region: "uttarakhand",
    difficulty: "Easy",
    duration: 6,
    maxAltitude: 3810,
    price: 8500,
    shortDesc: "India's most popular winter trek, famous for its perfect pine-clearing campsites.",
    description: "Kedarkantha is the ultimate winter snow trek. Starting from the scenic village of Sankri, the trail winds through dense pine forests to open clearings that offer clear views of the peak. The final summit climb at 3,810m rewards you with a 360-degree panorama of Himalayan giants including Swargarohini, Black Peak, and Bandarpoonch.",
    highlights: [
      "Stunning snow trails and pine forest campsites",
      "360-degree summit views of Garhwal giants",
      "Beautiful frozen lakes of Juda-ka-Talab",
      "Excellent first-time snow trek for beginners",
      "Traditional homestay culture in Sankri village",
    ],
    bestSeason: "December – April, October – November",
    image: "/images/kedarkantha.jpg",
    featured: true,
  },
  {
    slug: "brahmatal",
    name: "Brahmatal Trek",
    region: "uttarakhand",
    difficulty: "Moderate",
    duration: 6,
    maxAltitude: 3734,
    price: 9500,
    shortDesc: "A classic winter trek to a secluded frozen lake under Mt Trishul's shadow.",
    description: "Brahmatal is a rare winter trek that leads you directly to a high-altitude frozen lake. The route goes through thick forests of oak and rhododendron, opening up to majestic views of Mt Trishul and Mt Nanda Ghunti. Sleeping on snow ridge camps makes this a spectacular adventure.",
    highlights: [
      "Walk on the snow-covered shores of the frozen Brahmatal lake",
      "Spectacular views of high peaks: Mt Trishul and Mt Nanda Ghunti",
      "Camp on open snowy ridges with panoramic sunset views",
      "Stunning walks through dense winter forests",
      "High probability of seeing fresh snow",
    ],
    bestSeason: "December – March",
    image: "/images/brahmatal.jpg",
    featured: false,
  },
  {
    slug: "har-ki-dun",
    name: "Har Ki Dun Trek",
    region: "uttarakhand",
    difficulty: "Moderate",
    duration: 7,
    maxAltitude: 3566,
    price: 10500,
    shortDesc: "A cultural trek through ancient wooden villages in the valley of gods.",
    description: "Har Ki Dun is a cradle-shaped valley in the Garhwal Himalayas, rich in both scenery and mythology. The trail follows the Supin River through ancient wooden villages where culture has remained unchanged for centuries. The final valley floor sits directly under the colossal Jaundhar Glacier and Swargarohini peaks.",
    highlights: [
      "Walk through 2000-year-old wooden villages like Osla and Gangad",
      "Fabulous views of Swargarohini and Jaundhar Glacier",
      "Rich flora and fauna inside Govind National Park",
      "Perfect blend of natural beauty and cultural heritage",
      "Gentle ascent suitable for families and beginners",
    ],
    bestSeason: "April – June, September – December",
    image: "/images/har-ki-dun.jpg",
    featured: false,
  },
  {
    slug: "roopkund",
    name: "Roopkund Trek",
    region: "uttarakhand",
    difficulty: "Hard",
    duration: 8,
    maxAltitude: 4800,
    price: 18000,
    shortDesc: "A high-altitude trek to the mysterious skeleton lake of Uttarakhand.",
    description: "Roopkund is a legendary trek famous for the hundreds of ancient skeletons visible at the bottom of the high-altitude lake. Beyond the mystery, the trek features two of India's largest and most gorgeous high-altitude meadows (Ali and Bedni Bugyal) and a steep, challenging climb to Junargali pass.",
    highlights: [
      "See the mysterious high-altitude Skeleton Lake at 4,800m",
      "Cross the massive, rolling green alpine meadows of Ali and Bedni Bugyal",
      "Spectacular views of Mt Trishul rising directly from the valley floor",
      "Challenging climb to Junargali Pass at 5,150m",
      "Diverse terrain from oak forests to barren snow cols",
    ],
    bestSeason: "May – June, September – October",
    image: "/images/roopkund.jpg",
    featured: false,
  },
  {
    slug: "rupin-pass",
    name: "Rupin Pass Trek",
    region: "uttarakhand",
    difficulty: "Moderate",
    duration: 8,
    maxAltitude: 4650,
    price: 16000,
    shortDesc: "A thrilling cross-over trek through a massive hanging-valley waterfall.",
    description: "Rupin Pass is a classic crossover trek starting in Uttarakhand and ending in Himachal. The trail follows the Rupin river, climbing through dense forests, three-tiered waterfalls, and a narrow gully (the snow wall) to cross the pass at 4,650m before descending into the apple orchards of Sangla Valley.",
    highlights: [
      "Climb through the iconic three-tiered Rupin waterfall",
      "Cross the steep, narrow Rupin Gully (snow wall)",
      "Crossover from Uttarakhand to the spectacular Sangla Valley in Himachal",
      "Camp in hanging meadows surrounded by waterfalls",
      "Witness changing cultures between the two states",
    ],
    bestSeason: "May – June, September – October",
    image: "/images/rupin-pass.jpg",
    featured: false,
  },
  // ── Nepal ────────────────────────────────────────────────────────────
  {
    slug: "everest-base-camp",
    name: "Everest Base Camp Trek",
    region: "nepal",
    difficulty: "Hard",
    duration: 14,
    maxAltitude: 5364,
    price: 55000,
    shortDesc: "The ultimate pilgrimage to the foot of the world's highest peak.",
    description: "The Everest Base Camp (EBC) trek is a lifetime adventure. Walk in the footsteps of legendary mountaineers through Sherpa villages, historic monasteries, and high suspension bridges. The trail climbs along the Dudh Koshi river, hits the Namche Bazar hub, and approaches the Khumbu Glacier before the final climb up Kala Patthar for a view of Mt. Everest.",
    highlights: [
      "Stand at the foot of Mt. Everest (8,848m) at Base Camp",
      "Climb Kala Patthar (5,545m) for the ultimate Everest sunrise photo",
      "Visit Tengboche Monastery and experience Sherpa culture",
      "Explore the high-altitude sherpa capital Namche Bazaar",
      "Stunning flight into the adventurous Lukla airport",
    ],
    bestSeason: "March – May, October – November",
    image: "/images/everest-base-camp.jpg",
    featured: true,
  },
  {
    slug: "annapurna-circuit",
    name: "Annapurna Circuit Trek",
    region: "nepal",
    difficulty: "Hard",
    duration: 12,
    maxAltitude: 5416,
    price: 48000,
    shortDesc: "One of the world's most famous loop treks, crossing Thorong La Pass.",
    description: "The Annapurna Circuit is a legendary journey around the Annapurna Massif. Starting in sub-tropical valleys, the trail gains altitude through pine forests, high-altitude villages like Manang, and culminates in crossing the Thorong La Pass at 5,416m. The descent drops into the desert-like Mustang region.",
    highlights: [
      "Cross the legendary Thorong La Pass at 5,416m",
      "360-degree views of the Annapurna Massif, Dhaulagiri, and Nilgiri",
      "Visit Muktinath, a sacred pilgrimage site in the Mustang valley",
      "Walk from green rice paddies to wind-swept high deserts",
      "Stay in comfortable tea houses with local warm hospitality",
    ],
    bestSeason: "March – May, October – November",
    image: "/images/annapurna-circuit.jpg",
    featured: false,
  },
  {
    slug: "langtang-valley",
    name: "Langtang Valley Trek",
    region: "nepal",
    difficulty: "Moderate",
    duration: 8,
    maxAltitude: 3800,
    price: 28000,
    shortDesc: "A scenic valley walk under towering glaciers, close to the Tibet border.",
    description: "Langtang Valley is one of Nepal's best-kept secrets, offering spectacular glacier views with less crowds. The trail runs through the Langtang National Park under the shadow of Langtang Lirung (7,227m). It offers close encounters with Tamang culture and the option to climb Kyanjin Ri (4,773m) for views.",
    highlights: [
      "Walk under the spectacular glaciers of Langtang Lirung",
      "Visit Kyanjin Gompa and taste authentic local yak cheese",
      "Climb Kyanjin Ri (4,773m) for 360-degree views of 20+ snow peaks",
      "Wander through rhododendron and bamboo forests (look for Red Pandas)",
      "Deeply immersive experience in Tamang heritage and villages",
    ],
    bestSeason: "March – May, October – November",
    image: "/images/langtang-valley.jpg",
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
    Easy: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    Moderate: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    Hard: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    "Very Hard": "bg-rose-500/10 text-rose-400 border border-rose-500/20",
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
