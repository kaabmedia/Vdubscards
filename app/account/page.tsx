// app/account/page.tsx
"use client";
import * as React from "react";

export default function AccountPage() {
  const [me, setMe] = React.useState<any>(null);
  React.useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMe(d))
      .catch(() => setMe({ authenticated: false }));
  }, []);

  const authed = Boolean(me && me.authenticated);

  return (
    <div className="max-w-2xl space-y-4 py-8">
      <h1>Mijn account</h1>
      {!authed ? (
        <p className="text-sm text-muted-foreground">
          Je bent niet ingelogd. <a className="underline" href="/login">Inloggen</a>.
        </p>
      ) : (
        <div className="border bg-card p-6 shadow-card rounded-none space-y-2">
          <div className="text-sm text-muted-foreground">Ingelogd</div>
          {me?.user ? (
            <pre className="text-xs bg-muted p-2 overflow-auto">{JSON.stringify(me.user, null, 2)}</pre>
          ) : null}
          <p className="text-sm text-muted-foreground">Besteloverzicht en profielbeheer volgen nog.</p>
        </div>
      )}
    </div>
  );
}

