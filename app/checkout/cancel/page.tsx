// app/checkout/cancel/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  return (
    <div className="space-y-4 pb-16">
      <h1>Betaling geannuleerd</h1>
      <p className="text-sm text-muted-foreground">Je bent teruggestuurd vanuit de betaalpagina. Je kunt het opnieuw proberen of terug naar de winkel.</p>
      <div className="flex gap-3">
        <Link href="/checkout">
          <Button variant="outline" className="rounded-none">Opnieuw proberen</Button>
        </Link>
        <Link href="/">
          <Button className="rounded-none bg-black text-white hover:bg-black/90">Verder winkelen</Button>
        </Link>
      </div>
    </div>
  );
}
