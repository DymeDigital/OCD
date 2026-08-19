// Real client photography, `public/images/`. Captions describe what's actually visible (theme,
// occasion) — none of these are tagged to a specific Product Guide flavour, so none are captioned
// with a flavour name. See CLAUDE.md §11 ("Client photos only") and the earlier site audit, which
// flagged fabricated-looking flavour/photo pairings on the previous build as a real problem.
//
// The `gallery/` batch (61 files) and the wedding batch were catalogued and deduplicated from a
// larger client drop on 2026-08-15 — near-identical repeat shots of the same cake were dropped,
// keeping the sharpest/best-composed frame (or, where two shots show a genuinely different
// moment — e.g. the cake alone vs. the couple cutting it — both were kept since they serve
// different sections). `hero: true` marks the standout shots worth a larger tile in the gallery
// grid.

export type Photo = {
  id: string;
  file: string;
  alt: string;
  category: "cake" | "cupcakes" | "wedding";
  occasion?: string;
  hero?: boolean;
};

export const photos: Photo[] = [
  // Original batch
  { id: "birthday-albums", file: "cake-birthday-albums.jpg", alt: "Two-tier birthday cake decorated with a record/album theme", category: "cake", occasion: "birthday" },
  { id: "gamer-ps5", file: "cake-gamer-ps5.jpg", alt: "Gaming-themed birthday cake with a PS5 console and controller topper", category: "cake", occasion: "birthday" },
  { id: "half-birthday", file: "cake-half-birthday.jpg", alt: "Half-birthday cake with pastel decoration", category: "cake", occasion: "birthday" },
  { id: "mermaid", file: "cake-mermaid.jpg", alt: "Mermaid-themed birthday cake with scale piping and shell details", category: "cake", occasion: "birthday" },
  { id: "rs4-40th", file: "cake-rs4-40th.jpg", alt: "40th birthday cake decorated with a racing livery design", category: "cake", occasion: "birthday" },
  { id: "skyline-30th", file: "cake-skyline-30th.jpg", alt: "30th birthday cake with a city skyline design", category: "cake", occasion: "birthday" },
  { id: "strawberry", file: "cake-strawberry.jpg", alt: "Cake finished with strawberry decoration", category: "cake", occasion: "celebration" },
  { id: "sweet18-white", file: "cake-sweet18-white.jpg", alt: "Sweet 18th cake in white with elegant piped detail", category: "cake", occasion: "birthday" },
  { id: "wedding-monogram-dogs", file: "wedding.jpg", alt: "Four-tier white wedding cake with a monogram, sugar orchids, and dog toppers", category: "wedding" },
  { id: "wedding-rose-gold-leaf", file: "wedding2.jpg", alt: "Tall white wedding cake with cascading roses and gold leaf detail", category: "wedding" },
  { id: "worldcup", file: "cake-worldcup.jpg", alt: "Football World Cup-themed celebration cake", category: "cake", occasion: "celebration" },
  { id: "fathers-day", file: "cakes-fathers-day.jpg", alt: "Father's Day themed cakes", category: "cake", occasion: "celebration" },
  { id: "60th-rosegold", file: "cupcakes-60th-rosegold.jpg", alt: "Rose gold cupcakes for a 60th birthday", category: "cupcakes", occasion: "birthday" },
  { id: "wedding-palm", file: "cupcakes-hotwheels-1.jpg", alt: "Wedding cake with tropical palm-leaf decoration and a couple's monogram topper", category: "wedding" },
  { id: "hotwheels-1", file: "cupcakes-hotwheels-2.jpg", alt: "Hot Wheels-themed cupcakes with racing and monster-truck toppers", category: "cupcakes", occasion: "birthday" },
  { id: "hotwheels-2", file: "cake-gamer-switch.jpg", alt: "Hot Wheels-themed cupcakes with flame and checkered-flag toppers, personalised for a 25th birthday", category: "cupcakes", occasion: "birthday" },
  { id: "man-utd", file: "cupcakes-man-utd.jpg", alt: "Manchester United themed cupcakes", category: "cupcakes", occasion: "just because" },
  { id: "pastel-clouds", file: "cupcakes-pastel-clouds.jpg", alt: "Pastel cloud-themed cupcakes", category: "cupcakes", occasion: "baby shower" },

  // 2026-08-15 gallery drop — cakes
  { id: "baby-bee-shower", file: "gallery/07c79557-741b-491a-a869-0b2c91d928a0.webp", alt: "Single-tier baby shower cake with daisy and bee decorations and a “what will baby bee?” message", category: "cake", occasion: "baby shower", hero: true },
  { id: "firefighter-twins-birthday", file: "gallery/29566186-A6D0-4FA6-A824-068F622B02BD.webp", alt: "Two matching fire-truck themed birthday cakes with fireman-helmet toppers reading “Kai” and “Ketan” and piped water-splash icing", category: "cake", occasion: "birthday" },
  { id: "bridal-shower-clouds-wide", file: "gallery/6552274d-f48b-4a7a-b777-d1d480e3a4ae.webp", alt: "Wide shot of a cloud and gold-sphere “Baby Mrs” cake on a white fluted pedestal with candles in foreground", category: "cake", occasion: "bridal shower" },
  { id: "strawberry-topped-cake", file: "gallery/5A31F67D-34BA-4711-A32E-6780BB1F3BD3.webp", alt: "Round cake topped edge-to-edge with fresh strawberries, piped white border", category: "cake", occasion: "celebration" },
  { id: "icecream-2nd-birthday", file: "gallery/6e6ba2dc-37ec-42fa-8a48-0e34cc4d0fe5.webp", alt: "Two-tier drip cake with ice cream, pizza and sprinkle cookie toppers for a 2nd birthday", category: "cake", occasion: "birthday" },
  { id: "chanel-bow-birthday", file: "gallery/7bb94d8c-3b33-4d64-bcff-2bae880492c6.webp", alt: "Cream cylinder cake with a black-and-white fondant bow, designer-style plaque and sugar roses", category: "cake", occasion: "birthday", hero: true },
  { id: "fruit-characters-cake", file: "gallery/9c5183ff-683c-4b8e-8e60-3fddb4512d92.webp", alt: "Black two-tier cake decorated with cute cartoon-style fruit characters", category: "cake", occasion: "birthday", hero: true },
  { id: "baby-shower-balloon-teddy", file: "gallery/E43DFD79-5D9D-49AC-83B7-9F59A06F9091.webp", alt: "Pink four-tier baby shower cake with teddy bear figures, hot air balloon topper and piped clouds", category: "cake", occasion: "baby shower", hero: true },
  { id: "bride-to-be-hand-painted", file: "gallery/E8A74428-7E22-4AB9-881B-9AAAA8FB6F1B.webp", alt: "Two-tier cream cake with hand-painted floral detail and gold leaf accents, “Bride to Be” topper", category: "cake", occasion: "bridal shower" },
  { id: "60th-birthday-marble-black", file: "gallery/IMG_0564.webp", alt: "Black and grey marble two-tier cake with gold leaf and a glass-shard topper", category: "cake", occasion: "birthday" },
  { id: "teal-drip-two-names", file: "gallery/IMG_0638.webp", alt: "Cream cake with teal drip icing, macarons and meringue kisses, two names piped on acrylic toppers", category: "cake", occasion: "birthday" },
  { id: "minnie-1st-birthday", file: "gallery/IMG_1338.webp", alt: "Pink two-tier Minnie Mouse first birthday cake with photo topper against a balloon garland", category: "cake", occasion: "birthday" },
  { id: "fairycore-mushroom-cherub", file: "gallery/IMG_1995.webp", alt: "Pink cake decorated with fondant toadstools, cherub figures and piped flowers in a fairy-garden style", category: "cake", occasion: "birthday", hero: true },
  { id: "sweet16-beach-disco", file: "gallery/IMG_5838.webp", alt: "White two-tier cake with silver disco-ball clusters and a “16” topper, set under a beachside marquee", category: "cake", occasion: "birthday" },
  { id: "luxury-brand-29th-birthday", file: "gallery/IMG_6602.webp", alt: "Cream cake wrapped in a designer-inspired striped and monogram pattern with gold spheres", category: "cake", occasion: "birthday" },
  { id: "raspberry-gold-leaf-cake", file: "gallery/IMG_8530.webp", alt: "Round cake topped edge-to-edge with fresh raspberries and flecks of gold leaf", category: "cake", occasion: "celebration" },
  { id: "wildflower-lit-branch-cake", file: "gallery/b241da06-8dcd-446c-9b4b-64eb80a079f8.webp", alt: "White cake with painted wildflowers under a lit branch installation", category: "cake", occasion: "celebration" },
  { id: "pink-drip-dessert-table", file: "gallery/b1e489de-0a9a-44ba-9308-14b47d450b05.webp", alt: "Pink drip cake with an ice cream cone topper and macarons, next to a stand of sprinkle cake pops", category: "cake", occasion: "birthday" },
  { id: "pink-drip-cake-pops", file: "gallery/f1471766-ffc3-461d-a46e-4e1275171b94.webp", alt: "Sprinkle-coated cake pops on sticks from a pink-themed dessert table", category: "cake", occasion: "birthday" },
  { id: "blush-thirty-birthday", file: "gallery/c37a1c1f-ee6f-42ff-b441-718374c622a0.webp", alt: "Blush pink textured cake with a white chocolate shard crown and gold accents, “Thirty” script topper", category: "cake", occasion: "birthday" },

  // 2026-08-15 gallery drop — cupcakes
  { id: "pink-rosette-cupcakes-flatlay", file: "gallery/IMG_1332.webp", alt: "Overhead flatlay of pink and cream rosette-piped cupcakes with a Minnie Mouse silhouette plaque", category: "cupcakes", occasion: "birthday", hero: true },
  { id: "kawaii-fruit-cupcakes", file: "gallery/IMG_3424.webp", alt: "Cupcakes topped with cute cartoon-style fondant fruit — banana, watermelon, avocado, peas, cherries, orange, strawberry, kiwi", category: "cupcakes", occasion: "birthday", hero: true },
  { id: "anniversary-rose-cupcakes", file: "gallery/IMG_7074.webp", alt: "Cupcakes with burgundy and cream rosette piping and pearl detail, “Happy Anniversary” message plaques", category: "cupcakes", occasion: "anniversary" },
  { id: "bee-cupcake-tower", file: "gallery/b224bcee-0838-4ee5-b3ed-fdced414f205.webp", alt: "Three-tier lace-edged stand of chocolate cupcakes topped with cream swirls and fondant bees", category: "cupcakes", occasion: "baby shower" },

  // 2026-08-15 gallery drop — wedding
  { id: "wedding-marble-gold-tall", file: "gallery/04F0B3BD-3992-408E-A464-5841EAEB0E37.webp", alt: "Tall two-tier wedding cake with marble icing, gold leaf detailing and white sugar flowers", category: "wedding", hero: true },
  { id: "wedding-marble-gold-cutting", file: "gallery/A154BDD8-C41B-4EC1-B9CF-AC507EC66D15.webp", alt: "Bride and groom cutting a marble and gold-leaf tiered wedding cake at an indoor reception", category: "wedding" },
  { id: "wedding-baroque-gold-monogram", file: "gallery/09e07a41-d9a6-4871-8376-3b2cf68c0e29.webp", alt: "Tall white wedding cake with ornate gold piping, swags and a gold monogram medallion", category: "wedding", hero: true },
  { id: "wedding-pearl-two-tier", file: "gallery/12C93F0D-161F-4347-8F41-6FC9D9A559F3.webp", alt: "Two-tier white wedding cake finished with pearl clusters and a “Mr & Mrs” script topper", category: "wedding", hero: true },
  { id: "wedding-marble-sc-monogram", file: "gallery/1456D4F6-21B5-489B-A5E5-56619B0AC82C.webp", alt: "Tall marble-effect wedding cake with a gold circular “S&C”-style monogram topper, white florals and gold-leaf accents, at a reception with string lights", category: "wedding" },
  { id: "wedding-monogram-rings-detail", file: "gallery/2722F1AF-C4ED-439A-ADAA-DB993DEEFB4C.webp", alt: "Close-up detail of a large gold monogram cake topper and a pair of wedding rings resting against a white iced tier, with white roses in the background", category: "wedding" },
  { id: "wedding-feather-heart-monogram", file: "gallery/2F7F2204-40FF-4F0D-AF2D-A0FE41CA59E5.webp", alt: "Tall white tiered wedding cake with a sculpted feather-texture cascade down one side and a heart-monogram topper, photographed at a string-lit reception", category: "wedding", hero: true },
  { id: "wedding-torn-paper-ck-close", file: "gallery/IMG_1689.webp", alt: "Tall white wedding cake with a sculpted torn-paper texture on the lower tiers and a monogram topper, photographed with candles against a sheer drapery backdrop", category: "wedding" },
  { id: "wedding-ombre-red-roses", file: "gallery/505d9b7e-184e-48d7-a9be-ae4f2c00204b.webp", alt: "Two-tier wedding cake with a gold-to-white-to-red ombre finish, fresh red and white roses", category: "wedding", hero: true },
  { id: "wedding-couple-celebrating-strawberry", file: "gallery/841FFF56-D3AA-4850-9E31-C69312F7D08F.webp", alt: "Bride and groom raising their arms in celebration beside a strawberry-topped cake on an outdoor dance floor, under a hanging greenery-and-disco-ball installation", category: "wedding" },
  { id: "wedding-acrylic-cube-florals", file: "gallery/IMG_2310.webp", alt: "White and gold acrylic-cube tiered wedding cake with fresh white roses, greenery and fairy lights in the cube tiers, and a gold monogram topper", category: "wedding", hero: true },
  { id: "wedding-couple-sword-cube-cake", file: "gallery/IMG_2312.webp", alt: "Bride and groom on stage, groom raising a ceremonial sword, beside a white and gold acrylic-cube tiered wedding cake with fresh white roses", category: "wedding" },
  { id: "wedding-peony-gold-monogram", file: "gallery/IMG_3925.webp", alt: "White wedding cake with fresh peonies and a gold script monogram topper against a floral wall", category: "wedding", hero: true },
  { id: "wedding-protea-copper", file: "gallery/IMG_4525.webp", alt: "Two-tier wedding cake with a copper-foil top tier and fresh king protea, rustic outdoor table setting", category: "wedding", hero: true },
  { id: "wedding-protea-copper-detail", file: "gallery/IMG_4526.webp", alt: "Detail of a copper-foil protea wedding cake showing gold fleur-de-lis piping and fresh florals", category: "wedding" },
  { id: "wedding-floating-cage-cake", file: "gallery/IMG_4953.webp", alt: "Bride and groom beside a four-tier wedding cake displayed in a hanging gold frame with floating bubbles", category: "wedding" },
  { id: "wedding-monogram-tall-ruffled", file: "gallery/IMG_6287.webp", alt: "Tall wedding cake with a ruffled fondant base tier, white roses and a gold circular monogram", category: "wedding", hero: true },
  { id: "wedding-monogram-detail", file: "gallery/e7111d25-2607-446c-b5d5-137d2b5da683.webp", alt: "Detail of a gold circular monogram and white roses on a ruffled-base wedding cake", category: "wedding" },
  { id: "wedding-acrylic-cube-kh", file: "gallery/IMG_6824.webp", alt: "Wedding cake with square fondant tiers and acrylic cubes of fresh roses and fairy lights, gold “Mr & Mrs” topper", category: "wedding", hero: true },
  { id: "wedding-couple-feeding-cube-cake", file: "gallery/IMG_7127.webp", alt: "Bride and groom feeding each other cake beside an acrylic-cube floral wedding cake, confetti falling", category: "wedding" },
  { id: "wedding-watercolor-blue", file: "gallery/IMG_8318.webp", alt: "Three-tier wedding cake with a blue watercolour marble finish, white roses and a gold “Mr & Mrs” topper", category: "wedding", hero: true },
  { id: "wedding-textured-white-close", file: "gallery/IMG_1651.webp", alt: "Tall white wedding cake with a sculpted torn-paper texture on the lower tiers and a monogram topper", category: "wedding" },
  { id: "wedding-marble-peony-ivory", file: "gallery/ae6a849b-375e-42de-81bb-11274acb6505.webp", alt: "Tall ivory marble wedding cake with cracked gold-leaf detailing and white peonies", category: "wedding" },
  { id: "wedding-marble-blue-peony", file: "gallery/c964ea37-b1aa-422d-b210-1208731f7258.webp", alt: "Three-tier wedding cake alternating blue-grey marble and gold-edged ivory tiers, with pink peonies", category: "wedding" },
];

export const heroPhoto = {
  file: "hero-cupcakes.png",
  alt: "OCD branded cupcakes with white Swiss meringue buttercream and OCD roundel toppers, falling against a light background",
};

// About page photography — personal, not product shots. Kept separate from `photos` since these
// don't belong to the cake/cupcake/wedding category taxonomy above.
export const aboutPhotos = [
  { id: "about-confetti-exit", file: "about-us/confetti-exit.jpeg", alt: "A couple laughing arm in arm as confetti falls, walking away from a stone chapel entrance" },
  { id: "about-champagne-styling", file: "about-us/champagne-styling.jpeg", alt: "A small styled tray with white roses, a bottle of sparkling wine on ice and strawberry-decorated champagne flutes" },
  { id: "about-chapel-dog", file: "about-us/chapel-dog.jpeg", alt: "A couple outside a stone chapel with a small dog, one of them kneeling in a full tulle skirt" },
];
