// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/footer";
import { QueryProvider } from "@/components/providers/query-provider";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { SignupBanner } from "@/components/marketing/SignupBanner";
import { siteConfig } from "@/config/site";
import { Main } from "@/components/layout/Main";
import { Poppins } from "next/font/google";
import { getPrimaryMenu } from "@/lib/wp-menu";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

const headingFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Preload WP menu on the server to avoid any client-side flash
  let initialMenu = [] as Awaited<ReturnType<typeof getPrimaryMenu>>;
  try {
    initialMenu = await getPrimaryMenu();
  } catch {}
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${headingFont.variable} font-sans`}>
        <QueryProvider>
          <WishlistProvider>
            <Navbar initialMenu={initialMenu} />
            <Main>{children}</Main>
            <SignupBanner />
            <Footer />
          </WishlistProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
