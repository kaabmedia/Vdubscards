// components/auth/register-form.tsx
"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const emailOk = React.useMemo(() => /.+@.+\..+/.test(email.trim()), [email]);
  const pwOk = React.useMemo(() => password.length >= 8, [password]);
  const formOk = emailOk && pwOk;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formOk) {
      setError(!emailOk ? "Voer een geldig e‑mailadres in" : "Wachtwoord moet minimaal 8 tekens zijn");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Registratie mislukt");
      // Try automatic login
      try {
        const login = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password }),
        });
        if (login.ok) {
          window.location.href = "/";
          return;
        }
      } catch {}
      // Fallback if auto-login fails
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Registratie mislukt");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <div className="text-sm">Account aangemaakt. Je kunt nu <a className="underline" href="/login">inloggen</a>.</div>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2">
        <label className="text-sm font-medium">E‑mail</label>
        <Input
          className="!rounded-none"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!emailOk}
        />
        {!emailOk && email.length > 0 ? (
          <p className="text-xs text-red-600">Voer een geldig e‑mailadres in.</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Wachtwoord</label>
        <div className="relative">
          <Input
            className="!rounded-none pr-10"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!pwOk}
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {!pwOk && password.length > 0 ? (
          <p className="text-xs text-red-600">Minimaal 8 tekens.</p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Voornaam</label>
          <Input className="!rounded-none" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Achternaam</label>
          <Input className="!rounded-none" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button disabled={loading || !formOk} className="rounded-none bg-black text-white hover:bg-black/90">
        {loading ? "Aanmaken…" : "Account aanmaken"}
      </Button>
    </form>
  );
}
