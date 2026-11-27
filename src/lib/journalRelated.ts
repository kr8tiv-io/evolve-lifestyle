// Honest product mentions and sibling Journal links, used at the end of
// each guide. Only products that actually fit the trip or the conditions
// in the article. Visible titles must stay the article's own title.

export interface RelatedProduct {
  slug: string;
  why: string;
}

export const RELATED_PRODUCTS: Record<string, RelatedProduct[]> = {
  "banff-in-december": [
    { slug: "wanderlust-cuff-beanie", why: "A dark grey ribbed cuff beanie that holds heat without the itch, and stays put for a timed market slot and a night outside." },
    { slug: "coldfront-long-sleeve", why: "A clean white long sleeve with the crest at the chest, the first layer under a shell on a cold morning at the rink or on the lift." },
  ],
  "romantic-winter-getaways-alberta": [
    { slug: "woodsmoke-crewneck", why: "A black crewneck with a brushed-soft inside, for the hour after the tub when a fleece is too much and the air is not." },
    { slug: "wanderlust-cuff-beanie", why: "A dark grey ribbed cuff that holds heat without the itch, for the deck, the sleigh, and the walk back in the dark." },
  ],
  "backcountry-lodges-huts-winter": [
    { slug: "deepwoods-heavyweight-hoodie", why: "A 10 oz army green pullover for the hour the stove is catching and the shell is still wet." },
    { slug: "wanderlust-cuff-beanie", why: "A dark grey ribbed cuff beanie that holds heat without the itch, for the lot and the long skin out." },
  ],
  "powder-highway-bc": [
    { slug: "coldfront-long-sleeve", why: "A Champion long-sleeve in clean white with the crest at the chest, the first layer when the truck is still cold and the hill is not open yet." },
    { slug: "summit-full-zip", why: "A heavyweight full-zip in charcoal heather with a structured hood, for the walk from the day lodge to the car when the wind is up." },
  ],
  "western-canada-winter-adventures": [
    { slug: "hearth-fleece-zip", why: "A zip layer you can open on the walk in and close to your chin at the bobsled finish line." },
    { slug: "wanderlust-cuff-beanie", why: "A snug toque for a long night of skating, sculptures, and standing around a fire." },
  ],
  "ice-fishing-alberta": [
    { slug: "deepwoods-heavyweight-hoodie", why: "A heavy pullover you can push the hood back from while you drill, then pull up when the wind comes." },
    { slug: "hearth-fleece-zip", why: "A zip layer for dumping heat without taking anything off once the hole is in." },
  ],
  "best-places-western-canada-winter": [
    { slug: "stormcheck-packable-anorak", why: "A packable shell for icewalks, skating lakes, and a Tofino storm forecast that changes its mind." },
    { slug: "coldfront-long-sleeve", why: "A mid layer that earns its keep between the parking lot and the viewpoint." },
  ],
  "bear-country-manners-grizzly-black-bear-canada": [
    { slug: "trapline-heavyweight-hoodie", why: "A heavy layer for mornings on trails where you want your hands free and your torso warm." },
    { slug: "anvil-heavyweight-tee", why: "A simple heavy tee under a shell when the day starts cold and turns into a climb." },
  ],
  "the-long-haul-canada-road-trips": [
    { slug: "longhaul-hoodie", why: "Built for the hours between fuel stops, when the truck is warm and the ditch is not." },
    { slug: "wanderlust-cuff-beanie", why: "A cuff beanie for the pump, the viewpoint, and the 2 a.m. stretch." },
  ],
  "northern-lights-alberta-western-canada": [
    { slug: "blackout-hoodie", why: "A dark, warm layer for standing still at minus thirty while you wait for the sky to move." },
    { slug: "wanderlust-cuff-beanie", why: "Your ears will quit before your eyes do. A real cuff helps." },
  ],
  "best-hot-springs-western-canada": [
    { slug: "driftwood-hooded-long-sleeve", why: "A hooded long sleeve for the walk from the car to the pool, and the colder walk back." },
    { slug: "woodsmoke-crewneck", why: "A crewneck that goes over a damp shirt without making a fuss." },
  ],
  "best-hikes-near-edmonton": [
    { slug: "wildmark-organic-tee", why: "A light, honest tee for river-valley and parkland days when a heavy layer would be too much." },
    { slug: "trailhead-tank", why: "For the midsummer loops when the river valley holds the heat." },
  ],
  "vancouver-island-places": [
    { slug: "stormcheck-packable-anorak", why: "The Island can be sun at the trailhead and a wall of weather on the west coast. Pack a shell." },
    { slug: "whiteout-organic-cap", why: "A cap for ferries, boardwalks, and the long walk back to the lot." },
  ],
  "learn-to-mountaineer-canada": [
    { slug: "summit-full-zip", why: "A full zip you can vent on the approach and close on the windy ridge." },
    { slug: "stormcheck-packable-anorak", why: "A packable shell for the day the forecast was wrong." },
  ],
  "lightweight-hike-packing-kit": [
    { slug: "trailhead-tank", why: "The shirt you actually want once the climb starts, if the weather agrees." },
    { slug: "longhaul-hoodie", why: "The layer you put back on at the summit and on the ride home." },
  ],
  "first-canadians-survival-skills": [
    { slug: "trapline-heavyweight-hoodie", why: "A heavy layer for the kind of cold this guide is talking about." },
    { slug: "heritage-classic-tee", why: "A simple tee for the work underneath a heavier layer." },
  ],
  "best-nature-resorts-canada": [
    { slug: "hearth-fleece-zip", why: "A fleece zip for the path from the cabin to dinner, and the one back in the dark." },
    { slug: "woodsmoke-crewneck", why: "A crewneck that looks fine in a lodge and still works on the dock." },
  ],
  "canadian-extreme-sports": [
    { slug: "summit-full-zip", why: "A full zip for the lift, the approach, and the wait." },
    { slug: "stormcheck-packable-anorak", why: "A packable shell for days that start clear and do not stay that way." },
  ],
  "off-grid-cabin-canada": [
    { slug: "hearth-fleece-zip", why: "The layer you live in when the wood stove is still catching." },
    { slug: "deepwoods-heavyweight-hoodie", why: "A heavy pullover for mornings when the cabin is colder than the plan." },
  ],
  "best-views-canada": [
    { slug: "summit-full-zip", why: "A zip layer for the last push to a viewpoint, when you want to vent without stopping." },
    { slug: "ridgeline-snapback", why: "A cap for the long walk in, and the photo you actually came for." },
  ],
  "best-ski-resorts-alberta": [
    { slug: "coldfront-long-sleeve", why: "A mid layer under a shell for the Big Three, when the parking lot and the ridge are two different seasons." },
    { slug: "wanderlust-cuff-beanie", why: "For the lot, the lodge deck, and the chair when you take the helmet off." },
  ],
  "best-hikes-alberta-bc": [
    { slug: "wildmark-organic-tee", why: "A light tee for the climb, under a layer you can take off." },
    { slug: "summit-full-zip", why: "A full zip for the wind at the high point." },
  ],
  "boutique-cabins-canada": [
    { slug: "woodsmoke-crewneck", why: "A crewneck that belongs in a small cabin as much as it does on the trail to it." },
    { slug: "hearth-fleece-zip", why: "A fleece zip for cool evenings and the walk to the soak." },
  ],
  "best-national-parks-canada": [
    { slug: "believer-heavyweight-tee", why: "A heavy tee for park days that start in a lot and end on a lookout." },
    { slug: "backcountry-trucker", why: "A trucker for the days you spend more time under a brim than under trees." },
  ],
  "best-places-to-stay-western-canada-views": [
    { slug: "hearth-fleece-zip", why: "A fleece zip for the porch, the lookout, and the walk back in after dark." },
    { slug: "nightfall-snapback", why: "A cap for travel days between lodges." },
  ],
};
