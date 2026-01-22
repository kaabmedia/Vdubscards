// components/layout/Navbar.tsx
"use client";
import Link from "next/link";
import { Menu, X, Search, Truck, ShieldCheck, RefreshCcw, Gift, Package } from "lucide-react";
import * as React from "react";
import { CartButton } from "@/components/cart/cart-button";
import { SearchForm } from "@/components/forms/search-form";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Logo } from "@/components/layout/Logo";
import { WishlistControl } from "@/components/wishlist/wishlist-control";
import { WPMenuDesktop, WPMenuMobile } from "@/components/layout/WPMenu";

type NavItem = { id: number; label: string; path: string; children?: NavItem[] };

export function Navbar({ initialMenu }: { initialMenu?: NavItem[] }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const headerRef = React.useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const marqueeRef = React.useRef<HTMLDivElement | null>(null);
  const [announcementHeight, setAnnouncementHeight] = React.useState(0);
  const [uspVisible, setUspVisible] = React.useState(true);
  const [uspIndex, setUspIndex] = React.useState(0);
  const slideRef = React.useRef<HTMLDivElement | null>(null);
  const [slideH, setSlideH] = React.useState(28);
  
  React.useEffect(() => {
    const measure = () => {
      const el = headerRef.current;
      if (el) setHeaderHeight(el.getBoundingClientRect().height);
      const m = marqueeRef.current;
      if (m) setAnnouncementHeight(m.getBoundingClientRect().height);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  React.useEffect(() => {
    // Recalculate announcement/USP height when visibility toggles
    const m = marqueeRef.current;
    if (m) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        setAnnouncementHeight(m.getBoundingClientRect().height);
      });
    }
  }, [uspVisible]);

  // Measure slide height for precise translateY on mobile carousel
  React.useEffect(() => {
    const measure = () => {
      const el = slideRef.current;
      if (el) {
        const height = el.getBoundingClientRect().height;
        // Ensure minimum height and valid measurement
        if (height > 0) {
          setSlideH(height);
        } else {
          // Fallback to default if measurement fails
          setSlideH(28);
        }
      }
    };
    // Measure after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(measure, 50);
    measure();
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", measure);
    };
  }, [uspVisible]);

  // Auto-advance USP carousel on mobile every 3 seconds
  // Only advance if USP is visible and slideH is valid
  React.useEffect(() => {
    if (!uspVisible || slideH <= 0) return;
    const id = setInterval(() => {
      setUspIndex((i) => (i + 1) % 4);
    }, 3000);
    return () => clearInterval(id);
  }, [uspVisible, slideH]);

  // Lock scroll if either panel is open
  React.useEffect(() => {
    const anyOpen = mobileOpen || searchOpen;
    if (anyOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev || ""; };
    }
  }, [mobileOpen, searchOpen]);

  // Hide USP bar after scrolling down a bit so it doesn't flicker
  // when the user makes very small scroll movements at the top.
  React.useEffect(() => {
    const onScroll = () => {
      try {
        const hideThreshold = 200; // px
        setUspVisible(window.scrollY < hideThreshold);
      } catch {}
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true } as any);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full bg-white shadow-soft">
      {/* USP bar (replaces marquee); hides on scroll */}
      <div
        ref={marqueeRef}
        className={`overflow-hidden bg-primary text-black transition-all duration-300 ${uspVisible ? "max-h-14 opacity-100" : "max-h-0 opacity-0"}`}
        aria-hidden={!uspVisible}
      >
        {/* Mobile: single USP carousel with slide effect */}
        <div className="container px-4 py-1 text-xs md:hidden">
          <div className="overflow-hidden" style={{ height: Math.max(slideH, 28) }}>
            <div
              className="flex flex-col will-change-transform"
              style={{ 
                transform: `translateY(-${uspIndex * Math.max(slideH, 28)}px)`, 
                transition: slideH > 0 ? "transform 500ms ease" : "none"
              }}
            >
              <div ref={slideRef} className="h-7 flex items-center justify-center"><span className="inline-flex items-center gap-2"><Gift className="h-4 w-4" /> Surprise in every order</span></div>
              <div className="h-7 flex items-center justify-center"><span className="inline-flex items-center gap-2"><Truck className="h-4 w-4" /> Free shipping from €125</span></div>
              <div className="h-7 flex items-center justify-center"><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Secure payments</span></div>
              <div className="h-7 flex items-center justify-center"><span className="inline-flex items-center gap-2"><Package className="h-4 w-4" /> Carefully packed</span></div>
            </div>
          </div>
        </div>
        {/* Desktop: 4 columns */}
        <div className="container px-4 py-2 text-xs md:text-sm hidden md:grid grid-cols-4 items-center">
          <div className="inline-flex items-center gap-2 justify-self-start"><Gift className="h-4 w-4" /> Surprise in every order</div>
          <div className="inline-flex items-center gap-2 justify-self-center"><Truck className="h-4 w-4" /> Free shipping from €125</div>
          <div className="inline-flex items-center gap-2 justify-self-center"><ShieldCheck className="h-4 w-4" /> Secure payments</div>
          <div className="inline-flex items-center gap-2 justify-self-end"><Package className="h-4 w-4" /> Carefully packed</div>
        </div>
      </div>
      {/* Top navigation row */}
      <div className="border-b">
        <div className="container px-4 h-20 grid grid-cols-2 md:grid-cols-3 items-center gap-4">
          {/* Left: Logo */}
          <div className="flex items-center">
            {/* The provided V-Dub's logo has an approx 366x127 ratio (~2.88). */}
            <Logo priority height={52} width={150} />
          </div>

          {/* Center: Nav links (desktop) */}
          <div className="hidden md:flex items-center justify-center">
            <WPMenuDesktop initial={initialMenu} />
          </div>

          {/* Right: Icons + Mobile menu trigger */}
          <div className="ml-auto flex items-center gap-1 justify-end justify-self-end">
            {/* Compact search input (desktop), aligned left of icons */}
            <div className="hidden md:flex mr-2 w-56">
              <SearchForm hideOnMobile={true} variant="bar" className="w-full" inputClassName="h-9 bg-white" />
            </div>
            <div className="hidden md:inline-flex">
              <WishlistControl />
            </div>
            {/* Cart Sheet trigger (desktop) */}
            <div className="hidden md:inline-flex">
              <CartSheet trigger={<CartButton plain />} />
            </div>
            {/* Search icon (mobile) */}
            <button
              type="button"
              className="md:hidden p-2 text-foreground/70 hover:text-foreground"
              aria-label="Search"
              onClick={() => { setSearchOpen((v) => !v); setMobileOpen(false); }}
            >
              <Search className="h-5 w-5" />
            </button>
            {/* Cart Sheet trigger (mobile) */}
            <div className="md:hidden">
              <CartSheet trigger={<CartButton plain />} />
            </div>
            <button
              type="button"
              className="md:hidden relative p-2 text-foreground/70 hover:text-foreground"
              aria-label={mobileOpen ? "Sluit menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu-panel"
              onClick={() => { setMobileOpen((v) => !v); setSearchOpen(false); }}
            >
              <Menu
                className={`h-5 w-5 transition-all duration-200 ${
                  mobileOpen ? "opacity-0 scale-75 rotate-90" : "opacity-100 scale-100 rotate-0"
                }`}
              />
              <X
                className={`h-5 w-5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  mobileOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-90"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
      {/* (marquee replaced above; no second USP bar) */}
      {/* Mobile slide-down panel under the nav: MENU */}
      <div
        id="mobile-menu-panel"
        className={`fixed left-0 right-0 bottom-0 z-[60] md:hidden transform transition-transform duration-300 ease-out ${mobileOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-4 opacity-0 pointer-events-none"}`}
        style={{ top: "116px", background: "#ffffff" }}
        aria-hidden={!mobileOpen}
      >
        {/* Removed in-panel search; triggered via header search icon */}
        {/* Menu list */}
        <div className="border-t border-black/10">
          <div className="px-4 py-3 pb-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <WPMenuMobile onNavigate={() => setMobileOpen(false)} initial={initialMenu} />
          </div>
        </div>
      </div>

      {/* Mobile slide-down panel under the announcement: SEARCH */}
      <div
        id="mobile-search-panel"
        className={`fixed left-0 right-0 z-[60] md:hidden transform transition-transform duration-250 ease-out ${searchOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-full opacity-0 pointer-events-none"}`}
        style={{ top: announcementHeight, background: "var(--primary)" }}
        aria-hidden={!searchOpen}
      >
        <div className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 border-b border-black/10 min-h-20">
          <SearchForm
            hideOnMobile={false}
            variant="bar"
            className="w-full"
            inputClassName="h-11 rounded-none bg-white"
            onSubmitComplete={() => setSearchOpen(false)}
          />
          <button
            type="button"
            aria-label="Sluit zoeken"
            className="p-2 text-foreground/70 hover:text-foreground"
            onClick={() => setSearchOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Background overlay under the search bar */}
      {searchOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 md:hidden z-[50] bg-black/40"
          style={{ top: (announcementHeight || 0) + 80 }}
          onClick={() => setSearchOpen(false)}
          aria-hidden
        />
      ) : null}
      {/* Removed separate search bar row; search is now in the top row */}
    </header>
  );
}
