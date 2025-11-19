// app/login/page.tsx
import { LoginForm } from "@/components/auth/login-form";
import { BackButton } from "@/components/misc/back-button";

export default function LoginPage() {
  return (
    <div className="h-[100svh] overflow-hidden flex items-center justify-center">
      {/* Hide header/footer and remove main padding; lock scroll */}
      <style dangerouslySetInnerHTML={{ __html: `header, footer { display: none !important; } main.container{padding-top:0!important;} html, body{height:100%; overflow:hidden;}` }} />
      <div className="w-full max-w-md space-y-4">
        <BackButton className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground" />
        <div className="border bg-card p-6 shadow-card rounded-none">
          <h1>Inloggen</h1>
          <div className="mt-4">
            <LoginForm />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Nog geen account? <a className="underline" href="/register">Maak een account aan</a>.</p>
        </div>
      </div>
    </div>
  );
}
