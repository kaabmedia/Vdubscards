V-dubscards — Next.js E‑commerce Frontend

Premium, minimal storefront for cards, comics & collectibles. Built with Next.js App Router, Tailwind CSS, shadcn/ui, TanStack Query, react-hook-form + zod, framer-motion. WooCommerce powers the catalog via server-only API routes.

Tech Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS + shadcn/ui (Radix UI)
- lucide-react icons
- TanStack Query
- react-hook-form + zod
- framer-motion
- WooCommerce REST API (server-only via /api routes)

Getting Started
1) Install dependencies
   npm install

2) Configure environment
   - Copy .env.local.example to .env.local and fill values:
     WOOCOMMERCE_URL=https://yourstore.example.com
     WOOCOMMERCE_CONSUMER_KEY=ck_...
     WOOCOMMERCE_CONSUMER_SECRET=cs_...
     NEXT_PUBLIC_SITE_URL=http://localhost:3000

   Notes:
   - Keys are used server-side only through API routes; they are never sent to the client.
   - NEXT_PUBLIC_SITE_URL is used by server components to call internal API endpoints with an absolute URL.

3) Run the dev server
   npm run dev

Project Structure
- app/
  - api/products/route.ts — Proxy to WooCommerce products list
  - api/products/[id]/route.ts — Proxy to WooCommerce single product
  - layout.tsx — Global layout with Header/Footer + React Query provider
  - page.tsx — Hero + Featured grid
  - products/ — Products listing + product detail
- components/ui/ — Minimal shadcn-style primitives (button, card, input, ...)
- components/providers/query-provider.tsx — TanStack Query provider
- lib/
  - woocommerce.ts — Server-only WC client
  - types.ts — Minimal WC types
  - currency.ts — EUR formatting
  - utils.ts — cn helper

Design Principles
- Premium, minimal, collector-friendly
- Soft shadows, rounded corners, generous whitespace
- Base currency: EUR (formatEUR util)

WooCommerce Integration
- Server-only fetches through app/api to avoid exposing keys
- Supports query params: page, per_page, search, category, slug, orderby, on_sale
- Add more routes (e.g. categories) as needed following the same pattern

Images
- Product components use <img> for compatibility without configuring external image domains yet.
- Swap to next/image after adding your store domain in next.config.

Checkout (Headless)
- Default provider is a headless flow that creates a WooCommerce order with COD (no payment redirect). Set:
  - CHECKOUT_PROVIDER=cod
- Stripe Checkout (optional): install `stripe` (`npm i stripe`), then set env:
  - CHECKOUT_PROVIDER=stripe
  - NEXT_PUBLIC_CHECKOUT_PROVIDER=stripe
  - STRIPE_SECRET_KEY=sk_live_or_test
  - CHECKOUT_CURRENCY=eur
  - CHECKOUT_ALLOWED_COUNTRIES=NL,BE,DE (optional; controls Stripe shipping collection)
  - NEXT_PUBLIC_DEFAULT_COUNTRY=NL (default for form)
  - NEXT_PUBLIC_ALLOWED_COUNTRIES=NL,BE,DE (country select)
  - NEXT_PUBLIC_VAT_RATE=21 (estimate shown on checkout)
  - NEXT_PUBLIC_SHIPPING_FLAT=0 (flat shipping estimate; or omit to show "calculated")
  - Success/Cancel URLs are derived from request origin.
  - On success, the app posts to `/api/checkout/complete` to create a paid WooCommerce order.

Next Steps / Ideas
- Add categories and filters UI
- Implement SEO metadata per product
- Add dark mode via next-themes and color tokens
- Add categories and filters UI
- Implement SEO metadata per product
- Add dark mode via next-themes and color tokens
