// Data-driven map config (CLAUDE.md §4.2). Phase 2 = add regions/pins here, no component rewrite.
// Coordinates are real WGS84 lng/lat used by the MapLibre 3D terrain hero.

export interface RegionConfig {
  id: string;
  name: string;
  color: string;
  center: [number, number]; // lng, lat
  zoom: number;
  bearing: number;
  pitch: number;
  description: string;
  trekCount: number;
  guideCount: number;
  path?: string; // Optional path for 2D map component
}

export interface TrekPinConfig {
  slug: string;
  name: string;
  regionId: string;
  lngLat: [number, number];
  difficulty: "Easy" | "Moderate" | "Hard" | "Very Hard";
  duration: number; // days
  maxAltitude: number; // metres
  x?: number; // Optional 2D coordinate x
  y?: number; // Optional 2D coordinate y
}

// Default camera: wide view of the whole Himalayan arc, pitched so the range reads as mountains
export const MAP_HOME = {
  center: [80.7, 30.0] as [number, number],
  zoom: 5.1,
  pitch: 48,
  bearing: -8,
};

export const REGIONS: RegionConfig[] = [
  {
    id: "kashmir",
    name: "Kashmir",
    color: "#38bdf8",
    center: [75.15, 34.15],
    zoom: 8.6,
    bearing: -15,
    pitch: 62,
    description:
      "Alpine lakes, meadows lined with pine, and pristine valleys of the valley of gods.",
    trekCount: 2,
    guideCount: 12,
  },
  {
    id: "himachal",
    name: "Himachal Pradesh",
    color: "#f59e0b",
    center: [77.25, 32.1],
    zoom: 8.3,
    bearing: 10,
    pitch: 62,
    description:
      "From lush deodar forests of Kullu to the stark high-altitude deserts of Lahaul & Spiti.",
    trekCount: 3,
    guideCount: 28,
  },
  {
    id: "uttarakhand",
    name: "Uttarakhand",
    color: "#10b981",
    center: [78.9, 30.7],
    zoom: 8.2,
    bearing: -10,
    pitch: 62,
    description:
      "Sacred rivers, vast bugyals (meadows), and high cols connecting majestic Garhwal valleys.",
    trekCount: 5,
    guideCount: 19,
  },
  {
    id: "nepal",
    name: "Nepal",
    color: "#ec4899",
    center: [85.0, 28.15],
    zoom: 7.2,
    bearing: 0,
    pitch: 60,
    description:
      "The giant massifs of the Annapurna and Everest regions — the ultimate high-altitude test.",
    trekCount: 3,
    guideCount: 15,
  },
];

export const TREK_PINS: TrekPinConfig[] = [
  // ── Kashmir ──
  {
    slug: "kashmir-great-lakes",
    name: "Kashmir Great Lakes",
    regionId: "kashmir",
    lngLat: [75.117, 34.394], // Vishansar Lake
    difficulty: "Hard",
    duration: 7,
    maxAltitude: 4191,
  },
  {
    slug: "tarsar-marsar",
    name: "Tarsar Marsar",
    regionId: "kashmir",
    lngLat: [75.083, 34.13], // Tarsar Lake
    difficulty: "Moderate",
    duration: 7,
    maxAltitude: 4115,
  },
  // ── Himachal ──
  {
    slug: "hampta-pass",
    name: "Hampta Pass",
    regionId: "himachal",
    lngLat: [77.357, 32.246],
    difficulty: "Moderate",
    duration: 6,
    maxAltitude: 4270,
  },
  {
    slug: "triund",
    name: "Triund Trek",
    regionId: "himachal",
    lngLat: [76.345, 32.265],
    difficulty: "Easy",
    duration: 2,
    maxAltitude: 2875,
  },
  {
    slug: "pin-parvati-pass",
    name: "Pin Parvati Pass",
    regionId: "himachal",
    lngLat: [77.795, 31.875],
    difficulty: "Very Hard",
    duration: 12,
    maxAltitude: 5319,
  },
  // ── Uttarakhand ──
  {
    slug: "kedarkantha",
    name: "Kedarkantha",
    regionId: "uttarakhand",
    lngLat: [78.183, 31.025],
    difficulty: "Easy",
    duration: 6,
    maxAltitude: 3810,
  },
  {
    slug: "brahmatal",
    name: "Brahmatal",
    regionId: "uttarakhand",
    lngLat: [79.598, 30.117],
    difficulty: "Moderate",
    duration: 6,
    maxAltitude: 3734,
  },
  {
    slug: "har-ki-dun",
    name: "Har Ki Dun",
    regionId: "uttarakhand",
    lngLat: [78.421, 31.133],
    difficulty: "Moderate",
    duration: 7,
    maxAltitude: 3566,
  },
  {
    slug: "roopkund",
    name: "Roopkund",
    regionId: "uttarakhand",
    lngLat: [79.731, 30.262],
    difficulty: "Hard",
    duration: 8,
    maxAltitude: 4800,
  },
  {
    slug: "rupin-pass",
    name: "Rupin Pass",
    regionId: "uttarakhand",
    lngLat: [78.06, 31.12],
    difficulty: "Moderate",
    duration: 8,
    maxAltitude: 4650,
  },
  // ── Nepal ──
  {
    slug: "everest-base-camp",
    name: "Everest Base Camp",
    regionId: "nepal",
    lngLat: [86.853, 28.003],
    difficulty: "Hard",
    duration: 14,
    maxAltitude: 5364,
  },
  {
    slug: "annapurna-circuit",
    name: "Annapurna Circuit",
    regionId: "nepal",
    lngLat: [83.939, 28.794], // Thorong La
    difficulty: "Hard",
    duration: 12,
    maxAltitude: 5416,
  },
  {
    slug: "langtang-valley",
    name: "Langtang Valley",
    regionId: "nepal",
    lngLat: [85.566, 28.211], // Kyanjin Gompa
    difficulty: "Moderate",
    duration: 8,
    maxAltitude: 3800,
  },
];
