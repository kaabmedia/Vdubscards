// app/checkout/page.tsx
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { Lock, Truck } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1>Checkout</h1>
        <p className="text-sm text-muted-foreground">Betaal veilig. Vul je gegevens in en rond af.</p>
      </div>
      <div className="grid lg:grid-cols-5 gap-y-10 lg:gap-x-[30px]">
        <div className="lg:col-span-3">
          <div className="border p-6 rounded-none bg-card">
            <CheckoutForm />
          </div>
        </div>
        <div className="lg:col-span-2">
          <CheckoutSummary />
          {/* USPs under order summary (no border/background) */}
          <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-2 whitespace-nowrap w-44">
              <Lock className="h-4 w-4 text-foreground/70" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center justify-center gap-2 whitespace-nowrap w-44">
              <Truck className="h-4 w-4 text-foreground/70" />
              <span>Ships within 48 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
