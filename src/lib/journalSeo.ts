// Per-article SEO fields (short <title>, meta description, hero dimensions for
// the ImageObject / og:image, and word count) — mirrors what is live on
// evolveapparel.shop so a rebuild never regresses published SEO.
export interface ArticleSeo {
  seoTitle: string;
  metaDescription: string;
  heroWidth: number;
  heroHeight: number;
  wordCount: number;
}

export const JOURNAL_SEO: Record<string, ArticleSeo> = {
  "best-hikes-alberta-bc": {
    "seoTitle": "Best Hikes in Alberta and BC: 10 Trails Worth It",
    "metaDescription": "The best hikes in Alberta and BC, with real distances, elevation gain and permit rules for standout day hikes and bigger summer trips.",
    "heroWidth": 1600,
    "heroHeight": 1060,
    "wordCount": 1573
  },
  "best-hikes-near-edmonton": {
    "seoTitle": "Best Hikes Within Two Hours of Edmonton",
    "metaDescription": "The best hikes near Edmonton: river valley, parkland and boreal trails close to the city, plus Elk Island and day trips within two hours.",
    "heroWidth": 1500,
    "heroHeight": 1001,
    "wordCount": 1055
  },
  "best-hot-springs-western-canada": {
    "seoTitle": "Best Natural Hot Springs in Western Canada",
    "metaDescription": "The best hot springs in Western Canada, ranked from the Alaska Highway to Kootenay Lake, with fees, seasons and rules before you soak.",
    "heroWidth": 1600,
    "heroHeight": 840,
    "wordCount": 1630
  },
  "best-national-parks-canada": {
    "seoTitle": "The 10 Best National Parks in Canada, Ranked",
    "metaDescription": "The 10 best national parks in Canada, ranked, with the one thing worth going for in each park and a practical tip for your visit.",
    "heroWidth": 1500,
    "heroHeight": 1000,
    "wordCount": 1502
  },
  "best-nature-resorts-canada": {
    "seoTitle": "5 Best Nature Resorts in Canada",
    "metaDescription": "The best nature resorts in Canada: wilderness lodges with full comfort, from a fly-in BC archipelago to a Quebec lake in moose country.",
    "heroWidth": 1500,
    "heroHeight": 1000,
    "wordCount": 856
  },
  "best-places-to-stay-western-canada-views": {
    "seoTitle": "10 Best Places to Stay in Western Canada With a View",
    "metaDescription": "The 10 best places to stay in Western Canada with a view from your room: Rockies lakes, Pacific storms and aurora, with prices and how to get there.",
    "heroWidth": 1600,
    "heroHeight": 840,
    "wordCount": 2941
  },
  "best-ski-resorts-alberta": {
    "seoTitle": "Best Ski Resorts in Alberta: The Big Three Guide",
    "metaDescription": "The best ski resorts in Alberta: how to ski and ride Sunshine Village, Lake Louise and Marmot Basin, with terrain tips for each mountain.",
    "heroWidth": 1600,
    "heroHeight": 1067,
    "wordCount": 1277
  },
  "best-views-canada": {
    "seoTitle": "The 10 Most Breathtaking Views in Canada",
    "metaDescription": "The 10 most breathtaking views in Canada and how to reach them, from Moraine Lake in Banff to Virginia Falls, twice the height of Niagara.",
    "heroWidth": 1500,
    "heroHeight": 1000,
    "wordCount": 926
  },
  "boutique-cabins-canada": {
    "seoTitle": "10 Boutique Cabins and Lodges in Canada",
    "metaDescription": "Ten boutique cabins and lodges in Canada, from a hanging sphere on Vancouver Island to a glass-roofed aurora chalet in the Yukon.",
    "heroWidth": 1600,
    "heroHeight": 1067,
    "wordCount": 1308
  },
  "canadian-extreme-sports": {
    "seoTitle": "5 Canadian Extreme Sports Worth the Adrenaline",
    "metaDescription": "Canadian adventure sports the world copies, from heli-skiing where it was invented to year-round Pacific surfing, and how beginners can start.",
    "heroWidth": 1500,
    "heroHeight": 1000,
    "wordCount": 895
  },
  "first-canadians-survival-skills": {
    "seoTitle": "10 Backcountry Survival Skills From Canada's First Peoples",
    "metaDescription": "Survival skills of Canada's first peoples: how Indigenous knowledge made life at minus forty possible, and how settlers survived by learning it.",
    "heroWidth": 1500,
    "heroHeight": 1125,
    "wordCount": 1156
  },
  "learn-to-mountaineer-canada": {
    "seoTitle": "How to Start Mountaineering in Canada",
    "metaDescription": "How to learn mountaineering in Canada: courses, guides and the right order to go from your first scramble to a glaciated summit.",
    "heroWidth": 1500,
    "heroHeight": 994,
    "wordCount": 975
  },
  "lightweight-hike-packing-kit": {
    "seoTitle": "Beginner's Lightweight Hike-Packing Kit",
    "metaDescription": "A lightweight hiking packing list: the Ten Essentials, trail food math and the small items people forget, for day hikes and multi-day trips.",
    "heroWidth": 1500,
    "heroHeight": 1001,
    "wordCount": 969
  },
  "northern-lights-alberta-western-canada": {
    "seoTitle": "Northern Lights in Alberta: Where, When and How",
    "metaDescription": "Where to see the northern lights in Alberta and Western Canada: KP index and aurora forecasts, best months, dark-sky parks, camera settings and cold tips.",
    "heroWidth": 1600,
    "heroHeight": 840,
    "wordCount": 2462
  },
  "off-grid-cabin-canada": {
    "seoTitle": "Build an Off-Grid Cabin in Canada: Land, Solar, Soak",
    "metaDescription": "How to build an off-grid cabin in Canada: affordable land near great parks, the permit rules nobody warns you about, and the off-grid tech.",
    "heroWidth": 1500,
    "heroHeight": 1000,
    "wordCount": 1030
  },
  "the-long-haul-canada-road-trips": {
    "seoTitle": "Canada's Greatest Road Trips: The Long Haul Guide",
    "metaDescription": "Six iconic Canadian road trips—Icefields Parkway, Alaska Highway, Stewart-Cassiar, Dempster, Cowboy Trail, and Trans-Labrador—plus every fuel gap.",
    "heroWidth": 1600,
    "heroHeight": 840,
    "wordCount": 5259
  },
  "vancouver-island-places": {
    "seoTitle": "Vancouver Island: 10 Places Worth the Ferry",
    "metaDescription": "The best places on Vancouver Island beyond Tofino, from old-growth giants and Victoria to an orca strait and the wild north tip.",
    "heroWidth": 1500,
    "heroHeight": 999,
    "wordCount": 852
  }
};
