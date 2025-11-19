// components/layout/header.tsx
import Link from "next/link";
import { CartButton } from "@/components/cart/cart-button";
import { SearchForm } from "@/components/forms/search-form";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            V-dubscards
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {/* Client search form */}
          <SearchForm />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
