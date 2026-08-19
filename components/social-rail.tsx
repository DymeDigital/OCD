import { SocialIcons } from "@/components/social-icons";

// Persistent corner presence (client-requested 2026-08-15) — visible on every page without
// scrolling to the footer, unlike the footer's own social row.

export function SocialRail() {
  return (
    <div className="fixed bottom-6 left-6 z-30 hidden sm:block">
      <SocialIcons className="flex-col gap-3" />
    </div>
  );
}
