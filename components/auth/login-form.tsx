// components/auth/login-form.tsx
"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pwOk = React.useMemo(() => password.length >= 8, [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pwOk) {
      setError("Wachtwoord moet minimaal 8 tekens zijn");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      if (!res.ok) {
        const d: any = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Login failed");
      }
      window.location.href = "/";
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2">
        <label className="text-sm font-medium">E‑mail of gebruikersnaam</label>
        <Input className="!rounded-none" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Wachtwoord</label>
        <div className="relative">
          <Input
            className="!rounded-none pr-10"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            aria-invalid={!pwOk}
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
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button disabled={loading || !pwOk} className="rounded-none bg-black text-white hover:bg-black/90">{loading ? "Inloggen…" : "Inloggen"}</Button>
    </form>
  );
}
