// app/returns/page.tsx
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Truck, RotateCcw, AlertCircle, Repeat, Gift, MapPin, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: `Returns & Refunds — ${siteConfig.brand}`,
  description: "Learn how refunds, exchanges and gifts are handled, including timelines, eligibility and how to contact us.",
};

export default function ReturnsPage() {
  return (
    <div className="space-y-10 pt-0 pb-16">
      {/* Header */}
      <div className="space-y-3">
        <h1>Returns & Refunds</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Clear and simple. Read how we process refunds, exchanges and gifts, and what to do if a refund is late or missing.
        </p>
        <div className="bg-primary text-black px-4 py-3 font-medium rounded-none shadow-soft inline-flex items-center gap-2">
          <RotateCcw className="h-4 w-4" /> Returns are inspected within 1–2 business days after receipt
        </div>
      </div>

      {/* Refunds */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><RotateCcw className="h-4 w-4" /> Refunds (if applicable)</div>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Once your return is received and inspected, we will send you an email to notify you that we have received your returned
              item. We will also notify you of the approval or rejection of your refund.
            </p>
            <p>
              If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit
              card or original method of payment, within a certain amount of days.
            </p>
          </div>
        </div>
      </section>

      {/* Late or missing refunds */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4" /> Late or missing refunds (if applicable)</div>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>If you haven’t received a refund yet, first check your bank account again.</li>
            <li>Then contact your credit card company; it may take some time before your refund is officially posted.</li>
            <li>Next contact your bank. There is often some processing time before a refund is posted.</li>
            <li>
              If you’ve done all of this and you still have not received your refund yet, please contact us at
              {" "}
              <a href="mailto:Vdubscards@hotmail.com" className="underline">Vdubscards@hotmail.com</a>.
            </li>
          </ul>
        </div>
      </section>

      {/* Sale items */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Truck className="h-4 w-4" /> Sale items (if applicable)</div>
          <p className="text-sm text-muted-foreground">
            Only regular priced items may be refunded, unfortunately sale items cannot be refunded.
          </p>
        </div>
      </section>

      {/* Exchanges */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Repeat className="h-4 w-4" /> Exchanges (if applicable)</div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an
              email at <a href="mailto:Vdubscards@hotmail.com" className="underline">Vdubscards@hotmail.com</a> and send your item to the address below.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="bg-secondary p-4 rounded-none">
                <div className="mb-1 flex items-center gap-2 font-medium"><Mail className="h-4 w-4" /> Email</div>
                <div>Vdubscards@hotmail.com</div>
              </div>
              <div className="bg-secondary p-4 rounded-none">
                <div className="mb-1 flex items-center gap-2 font-medium"><MapPin className="h-4 w-4" /> Return Address</div>
                <address className="not-italic">
                  Sperwerhorst 10<br />
                  2675WT, Honselersdijk
                </address>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gifts */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Gift className="h-4 w-4" /> Gifts</div>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              If the item was marked as a gift when purchased and shipped directly to you, you’ll receive a gift credit for the value
              of your return. Once the returned item is received, a gift certificate will be mailed to you.
            </p>
            <p>
              If the item wasn’t marked as a gift when purchased, or the gift giver had the order shipped to themselves to give to
              you later, we will send a refund to the gift giver and they will find out about your return.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
