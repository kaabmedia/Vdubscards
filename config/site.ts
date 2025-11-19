// config/site.ts
export const siteConfig = {
  name: "V-dubscards — Premium Cards, Comics & Collectibles",
  description:
    "Family-owned shop for premium cards, comics & collectibles. Curated selection, minimal design.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // Short brand label used in UI (header/footer)
  brand: process.env.NEXT_PUBLIC_SITE_BRAND || "V-dubscards",
  // Optional path under /public (e.g. "/logo.svg" or "/logo.png").
  // Leave empty to render brand text instead of an image.
  logoSrc: process.env.NEXT_PUBLIC_LOGO_SRC || "",
  heroImage:
    process.env.NEXT_PUBLIC_HERO_IMAGE ||
    "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=2000&q=80",
};
