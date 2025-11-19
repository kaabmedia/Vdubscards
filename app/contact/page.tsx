// app/contact/page.tsx
export default function ContactPage() {
  return (
    <div className="space-y-4 py-8">
      <h1>Contact</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Questions about products or orders? Reach us at
        {" "}
        <a href="mailto:Vdubscards@hotmail.com" className="underline">Vdubscards@hotmail.com</a>
        {" "}
        or call
        {" "}
        <a href="tel:+31654386100" className="underline">+31 6 54 38 61 00</a>.
      </p>
    </div>
  );
}
