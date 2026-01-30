// components/layout/footer.tsx
import Link from "next/link";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import { PaymentBadges } from "@/components/layout/PaymentBadges";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  // Always show payment badges in the bottom-right

  return (
    <footer className="mt-0 bg-primary/20 text-foreground">
      <div className="container px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 text-sm">
          {/* Brand */}
          <div className="md:col-span-4">
            <Logo height={40} width={115} />
            <p className="mt-4 max-w-sm leading-relaxed">
              Premium cards, comics & collectibles. Curated with care for fans and collectors.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="https://www.instagram.com/vdubs.sportscards/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/vdubs.sportscards/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="md:col-span-2">
            <div className="text-base font-bold font-heading">Shop</div>
            <ul className="mt-3 space-y-2">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link href="/collections" className="text-muted-foreground hover:text-foreground transition-colors">Collections</Link></li>
              <li><Link href="/products?on_sale=1" className="text-muted-foreground hover:text-foreground transition-colors">On Sale</Link></li>
            </ul>
          </div>

          {/* Service */}
          <div className="md:col-span-3">
            <div className="text-base font-bold font-heading">Customer Service</div>
            <ul className="mt-3 space-y-2">
              <li><Link href="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="text-muted-foreground hover:text-foreground transition-colors">Returns</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact us</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-3">
            <div className="text-base font-bold font-heading">Company</div>
            <ul className="mt-3 space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms &amp; Conditions</Link></li>
            </ul>
            <div className="mt-4 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:Vdubscards@hotmail.com" className="text-muted-foreground hover:text-foreground transition-colors">Vdubscards@hotmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+31654386100" className="text-muted-foreground hover:text-foreground transition-colors">+31 6 54 38 61 00</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="container px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div>© {new Date().getFullYear()} V-dubscards. All rights reserved.</div>
          <PaymentBadges initial={(process.env.NEXT_PUBLIC_PAYMENT_METHODS || "card,ideal,bancontact,paypal,apple_pay").split(",").map((s) => s.trim()) as any} />
        </div>
      </div>
    </footer>
  );
}
