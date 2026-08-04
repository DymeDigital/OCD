// CLAUDE.md §6 "Other hero effects" — the entire motion vocabulary for the page-load sequence.
// Total under 1.2s. Below the fold: single scroll-triggered fade-up per section, 24px travel, once.
export const HERO_EASE = [0.16, 1, 0.3, 1] as const;

export const heroLogo = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: HERO_EASE } },
};

export const heroHeadlineContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

export const heroHeadlineLine = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: HERO_EASE } },
};

export const heroSubCta = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: HERO_EASE, delay: 0.65 } },
};

export const heroImage = {
  hidden: { opacity: 0, scale: 1.02 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: HERO_EASE, delay: 0.15 } },
};

// Below-the-fold scroll reveal — one signature moment, applied once per section, never stacked.
export const fadeUpOnce = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: HERO_EASE } },
};
