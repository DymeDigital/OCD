// Real contact/social values, supplied directly by the client (Darrel) in chat on 2026-08-15.
// This is now the single source of truth for these — content/data/terms.ts's `openQuestions`
// no longer carries `whatsappNumber`/`instagramHandle` placeholders now that these are answered.

const WHATSAPP_NUMBER = "+27 84 973 5638";

export const socialLinks = {
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, "")}`,
  email: "darrelrhyce@gmail.com",
  instagram: "https://www.instagram.com/obsessivecupcakedisorder_/",
  facebook: "https://www.facebook.com/obsessivecupcakedisorder/",
  tiktok: "https://www.tiktok.com/@obsessivecupcakedisorder",
  // Real Google Business Profile place URL (not the share.google short link), confirmed with
  // the client 2026-08-15.
  googleReviewsUrl:
    "https://www.google.com/maps/place/(OCD)+Obsessive+Cupcake+Disorder/@-29.880203,30.8950115,17z/data=!3m1!4b1!4m6!3m5!1s0x1ef7ab6d965fa6f1:0xea838f480beed8d9!8m2!3d-29.880203!4d30.8975864!16s%2Fg%2F11h3bjqcfk",
  googleRating: 4.9,
  googleReviewCount: 213,
};
