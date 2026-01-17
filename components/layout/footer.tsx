// components/layout/footer.tsx
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";
import { PaymentBadges } from "@/components/layout/PaymentBadges";

export function Footer() {
  // Always show payment badges in the bottom-right

  return (
    <footer className="mt-0 bg-[#FFF7D1] text-black">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 text-sm">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="text-base font-semibold font-heading">{siteConfig.brand}</div>
            <p className="mt-3 max-w-sm leading-relaxed">
              Premium cards, comics & collectibles. Curated with care for fans and collectors.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="https://www.instagram.com/vdubs.sportscards/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.facebook.com/vdubs.sportscards/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:opacity-80">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="md:col-span-2">
            <div className="text-base font-bold font-heading">Shop</div>
            <ul className="mt-3 space-y-2">
              <li><Link href="/products" className="hover:opacity-80">All Products</Link></li>
              <li><Link href="/collections" className="hover:opacity-80">Collections</Link></li>
              <li><Link href="/products?on_sale=1" className="hover:opacity-80">On Sale</Link></li>
            </ul>
          </div>

          {/* Service */}
          <div className="md:col-span-3">
            <div className="text-base font-bold font-heading">Customer Service</div>
            <ul className="mt-3 space-y-2">
              <li><Link href="/shipping" className="hover:opacity-80">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="hover:opacity-80">Returns</Link></li>
              <li><Link href="/faq" className="hover:opacity-80">FAQ</Link></li>
              <li><Link href="/contact" className="hover:opacity-80">Contact us</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-3">
            <div className="text-base font-bold font-heading">Company</div>
            <ul className="mt-3 space-y-2">
              <li><Link href="/about" className="hover:opacity-80">About</Link></li>
              <li><Link href="/privacy" className="hover:opacity-80">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:opacity-80">Terms &amp; Conditions</Link></li>
            </ul>
            <div className="mt-4 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:Vdubscards@hotmail.com" className="hover:opacity-80">Vdubscards@hotmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+31654386100" className="hover:opacity-80">+31 6 54 38 61 00</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div>© {new Date().getFullYear()} V-dubscards. All rights reserved.</div>
          <PaymentBadges initial={(process.env.NEXT_PUBLIC_PAYMENT_METHODS || "card,ideal,bancontact,paypal,apple_pay").split(",").map((s) => s.trim()) as any} />
        </div>
      </div>
    </footer>
  );
}
