import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";

// Display — CLAUDE.md §5: "Use the SOFT and WONK axes lightly — warmth without whimsy."
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK"],
  display: "swap",
});

// Body — all prose, labels, buttons.
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

// Ledger (Register B only) — prices, quantities, order numbers, servings, dates.
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const fontVariables = `${fraunces.variable} ${instrumentSans.variable} ${plexMono.variable}`;
