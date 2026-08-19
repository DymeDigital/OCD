import { socialLinks } from "@/content/data/socialLinks";

// First icon component in the repo — plain inline SVGs, single `currentColor` stroke/fill so
// they inherit --ink/--ink-soft on hover rather than introducing brand colours (CLAUDE.md §5:
// --red-ink is the only accent, rationed deliberately).

const icons = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M15 8.5h-2c-.8 0-1.5.7-1.5 1.5v2h3.3l-.5 3h-2.8v7.5h-3V15h-2.2v-3H9v-2.3C9 6.9 10.6 5 13.4 5H15v3.5Z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M14 4v10.8a3.3 3.3 0 1 1-2.6-3.23" strokeLinecap="round" />
      <path d="M14 4c.4 2.2 2 3.9 4.2 4.3" strokeLinecap="round" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M7 17.5 4.5 20 5.7 16A8 8 0 1 1 12 20a8 8 0 0 1-4-1.1L7 17.5Z" />
      <path
        d="M9 9.3c0-.5.4-1 1-1h.5c.3 0 .5.2.6.4l.6 1.6c.1.3 0 .6-.2.8l-.5.5c.4 1 1.2 1.8 2.2 2.2l.5-.5c.2-.2.5-.3.8-.2l1.6.6c.2.1.4.3.4.6v.5c0 .6-.5 1-1 1-3.3 0-6-2.7-6-6Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  ),
};

export function SocialIcons({ className = "" }: { className?: string }) {
  const links = [
    { key: "whatsapp", label: "WhatsApp", href: socialLinks.whatsappUrl },
    { key: "instagram", label: "Instagram", href: socialLinks.instagram },
    { key: "facebook", label: "Facebook", href: socialLinks.facebook },
    { key: "tiktok", label: "TikTok", href: socialLinks.tiktok },
  ] as const;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {links.map(({ key, label, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-ink-soft transition-colors hover:text-ink"
        >
          <span className="block h-5 w-5">{icons[key]}</span>
        </a>
      ))}
    </div>
  );
}

export { icons as socialIconMarks };
