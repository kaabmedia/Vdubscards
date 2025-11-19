// app/shipping/page.tsx
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Truck, Clock, Package, MapPin, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: `Shipping & Delivery — ${siteConfig.brand}`,
  description:
    "Learn about shipping locations, delivery times, methods, pricing, tracking, customs, and handling of lost or damaged packages.",
};

export default function ShippingPage() {
  return (
    <div className="space-y-10 pt-0 pb-16">
      {/* Header + free shipping banner */}
      <div className="space-y-3">
        <h1>Shipping & Delivery</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          We are committed to providing you with the best shipping experience possible. Please read our shipping policy carefully
          to understand our processes, timelines, and fees.
        </p>
        <div className="bg-primary text-black px-4 py-3 font-medium rounded-none shadow-soft inline-flex items-center gap-2">
          <Truck className="h-4 w-4" /> Free Standard Shipping on orders over €150.00
        </div>
      </div>

      {/* Locations blurb */}
      <section className="space-y-2">
        <h2>Shipping Locations</h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          We ship products within the European Union (EU) and worldwide. Costs, delivery times and customs may vary by region.
        </p>
      </section>

      {/* Methods grid */}
      <section className="space-y-4">
        <h2>Methods & Prices</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border bg-card p-6 shadow-card rounded-none">
            <div className="mb-3 flex items-center gap-2 text-base font-semibold">
              <MapPin className="h-4 w-4" /> Netherlands — DHL
            </div>
            <ul className="text-sm space-y-3">
              <li>
                <div className="font-medium">Standard Shipping</div>
                <div className="text-muted-foreground">2–3 business days · €5.00 per order</div>
              </li>
              <li>
                <div className="font-medium">Express Shipping</div>
                <div className="text-muted-foreground">1–2 business days · €10.00 per order</div>
              </li>
            </ul>
          </div>

          <div className="border bg-card p-6 shadow-card rounded-none">
            <div className="mb-3 flex items-center gap-2 text-base font-semibold">
              <Globe className="h-4 w-4" /> Within the EU — DHL
            </div>
            <ul className="text-sm space-y-3">
              <li>
                <div className="font-medium">Standard Shipping</div>
                <div className="text-muted-foreground">5–7 business days · €7.00 per order</div>
              </li>
              <li>
                <div className="font-medium">Express Shipping</div>
                <div className="text-muted-foreground">2–4 business days · €15.00 per order</div>
              </li>
            </ul>
          </div>

          <div className="border bg-card p-6 shadow-card rounded-none">
            <div className="mb-3 flex items-center gap-2 text-base font-semibold">
              <Globe className="h-4 w-4" /> International (Outside EU) — DHL
            </div>
            <ul className="text-sm space-y-3">
              <li>
                <div className="font-medium">Standard Shipping</div>
                <div className="text-muted-foreground">7–14 business days · €15.00 per order</div>
              </li>
              <li>
                <div className="font-medium">Express Shipping</div>
                <div className="text-muted-foreground">3–7 business days · €25.00 per order</div>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Delivery times are estimates and may vary due to external factors such as weather, holidays, and carrier delays.</p>
      </section>

      {/* Summarized table */}
      <section className="space-y-3">
        <h2>Overview Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-none">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">Region</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Delivery Time</th>
                <th className="p-3 text-left">Carrier</th>
                <th className="p-3 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3">Netherlands</td>
                <td className="p-3">Standard</td>
                <td className="p-3">2–3 business days</td>
                <td className="p-3">DHL</td>
                <td className="p-3">€5.00</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">Netherlands</td>
                <td className="p-3">Express</td>
                <td className="p-3">1–2 business days</td>
                <td className="p-3">DHL</td>
                <td className="p-3">€10.00</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">Within EU</td>
                <td className="p-3">Standard</td>
                <td className="p-3">5–7 business days</td>
                <td className="p-3">DHL</td>
                <td className="p-3">€7.00</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">Within EU</td>
                <td className="p-3">Express</td>
                <td className="p-3">2–4 business days</td>
                <td className="p-3">DHL</td>
                <td className="p-3">€15.00</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">International (Outside EU)</td>
                <td className="p-3">Standard</td>
                <td className="p-3">7–14 business days</td>
                <td className="p-3">DHL</td>
                <td className="p-3">€15.00</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">International (Outside EU)</td>
                <td className="p-3">Express</td>
                <td className="p-3">3–7 business days</td>
                <td className="p-3">DHL</td>
                <td className="p-3">€25.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Process, Tracking, Packaging, Address */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Clock className="h-4 w-4" /> Order Processing</div>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Orders are processed within 1–2 business days after receiving payment.</li>
            <li>Orders placed on weekends or holidays are processed on the next business day.</li>
          </ul>
        </div>
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Truck className="h-4 w-4" /> Tracking Your Order</div>
          <p className="text-sm text-muted-foreground">After shipping you receive a confirmation email with a DHL tracking number to follow your parcel.</p>
        </div>
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Package className="h-4 w-4" /> Packaging</div>
          <p className="text-sm text-muted-foreground">All products are carefully packaged to ensure they arrive in perfect condition.</p>
        </div>
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4" /> Shipping Address</div>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Please ensure your shipping address is correct at checkout.</li>
            <li>We are not responsible for orders shipped to an incorrect address provided by the customer.</li>
          </ul>
        </div>
      </section>

      {/* Customs & policies */}
      <section className="space-y-6">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Globe className="h-4 w-4" /> Customs and Import Duties</div>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Orders within the EU generally do not incur customs fees or import duties.</li>
            <li>International orders (outside the EU) may be subject to customs duties, taxes and other fees charged by the destination country.</li>
            <li>Any additional charges for customs clearance must be borne by the customer.</li>
          </ul>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold">Lost or Damaged Packages</div>
          <p className="text-sm text-muted-foreground">If your package is lost or arrives damaged, contact us within 7 days of delivery. We will work with DHL to resolve the issue and offer a replacement or refund as appropriate.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">Contact</div>
          <p className="text-sm text-muted-foreground">Questions about our shipping policy? Email <a href="mailto:Vdubscards@hotmail.com" className="underline">Vdubscards@hotmail.com</a>.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">Policy Updates</div>
          <p className="text-sm text-muted-foreground">Vdub's Cards may update or modify this shipping policy at any time without prior notice. Changes take effect immediately upon posting.</p>
        </div>
      </section>
    </div>
  );
}
