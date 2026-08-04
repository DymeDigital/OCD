// Real client photography, `public/images/`. Captions describe what's actually visible (theme,
// occasion) — none of these are tagged to a specific Product Guide flavour, so none are captioned
// with a flavour name. See CLAUDE.md §11 ("Client photos only") and the earlier site audit, which
// flagged fabricated-looking flavour/photo pairings on the previous build as a real problem.

export type Photo = {
  id: string;
  file: string;
  alt: string;
  category: "cake" | "cupcakes" | "wedding";
};

export const photos: Photo[] = [
  { id: "birthday-albums", file: "cake-birthday-albums.jpg", alt: "Two-tier birthday cake decorated with a record/album theme", category: "cake" },
  { id: "gamer-ps5", file: "cake-gamer-ps5.jpg", alt: "Gaming-themed birthday cake with a PS5 console and controller topper", category: "cake" },
  { id: "gamer-switch", file: "cake-gamer-switch.jpg", alt: "Gaming-themed birthday cake with a handheld console topper", category: "cake" },
  { id: "half-birthday", file: "cake-half-birthday.jpg", alt: "Half-birthday cake with pastel decoration", category: "cake" },
  { id: "mermaid", file: "cake-mermaid.jpg", alt: "Mermaid-themed birthday cake with scale piping and shell details", category: "cake" },
  { id: "rs4-40th", file: "cake-rs4-40th.jpg", alt: "40th birthday cake decorated with a racing livery design", category: "cake" },
  { id: "skyline-30th", file: "cake-skyline-30th.jpg", alt: "30th birthday cake with a city skyline design", category: "cake" },
  { id: "strawberry", file: "cake-strawberry.jpg", alt: "Cake finished with fresh strawberries", category: "cake" },
  { id: "sweet18-white", file: "cake-sweet18-white.jpg", alt: "Sweet 18th cake in white with elegant piped detail", category: "cake" },
  { id: "wedding-palm-1", file: "cake-wedding-palm-1.jpg", alt: "Wedding cake with tropical palm-leaf decoration", category: "wedding" },
  { id: "wedding-palm-2", file: "cake-wedding-palm-2.jpg", alt: "Wedding cake with tropical palm-leaf decoration, alternate angle", category: "wedding" },
  { id: "worldcup", file: "cake-worldcup.jpg", alt: "Football World Cup-themed celebration cake", category: "cake" },
  { id: "fathers-day", file: "cakes-fathers-day.jpg", alt: "Father's Day themed cakes", category: "cake" },
  { id: "60th-rosegold", file: "cupcakes-60th-rosegold.jpg", alt: "Rose gold cupcakes for a 60th birthday", category: "cupcakes" },
  { id: "hotwheels-1", file: "cupcakes-hotwheels-1.jpg", alt: "Hot Wheels-themed cupcakes", category: "cupcakes" },
  { id: "hotwheels-2", file: "cupcakes-hotwheels-2.jpg", alt: "Hot Wheels-themed cupcakes, alternate set", category: "cupcakes" },
  { id: "man-utd", file: "cupcakes-man-utd.jpg", alt: "Manchester United themed cupcakes", category: "cupcakes" },
  { id: "pastel-clouds", file: "cupcakes-pastel-clouds.jpg", alt: "Pastel cloud-themed cupcakes", category: "cupcakes" },
];

export const heroPhoto = {
  file: "hero-cupcakes.png",
  alt: "OCD branded cupcakes with white Swiss meringue buttercream and OCD roundel toppers, falling against a light background",
};
