// app/checkout/success/page.tsx
import { Suspense } from "react";
import CheckoutSuccessClient from "./SuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pb-16">
          <h1>Bedankt voor je bestelling</h1>
          <p className="text-sm text-muted-foreground">
            We verwerken je betaling. Dit duurt een paar seconden…
          </p>
        </div>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}

