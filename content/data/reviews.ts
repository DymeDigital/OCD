// Real Google reviews, pulled from the OCD Google Business Profile and supplied verbatim by the
// client in chat on 2026-08-15. Do not paraphrase or invent additional ones — see
// content/data/socialLinks.ts for the aggregate rating/count and the profile link.

export type Review = {
  name: string;
  quote: string;
};

export const reviews: Review[] = [
  {
    name: "Esay Chetty",
    quote:
      "Every cake I've ordered has been absolutely flawless! You nail every inspiration cake I send, and the results are always beyond my expectations. Beautiful, delicious, and made with so much talent. I always recommend you without hesitation. Thank you for always making my special occasions unforgettable!",
  },
  {
    name: "Gcinokuhle Ntuli",
    quote:
      "I ordered the Belgian chocolate and it was absolutely delicious, the chocolate fudge guyssssss! Delicious filling with moist cake and they were very generous with the filling, even the service was top tier, also the attention to detail was insane, beautiful handwork — you get exactly what you order.",
  },
  {
    name: "Preshni Pillay",
    quote:
      "Thank you, Obsessive Cupcakes! My mum's birthday cake was absolutely stunning. Everything was perfect — from the delicious taste and beautiful design to the incredible attention to detail. Thank you for the excellent service and for helping make her special day even more memorable. I highly recommend you and will definitely be ordering from you again!",
  },
];
