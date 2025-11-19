// components/auth/account-control.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { User, LogOut, X } from "lucide-react";

type Me = { authenticated: boolean; user?: { username?: string; name?: string } };

export function AccountControl() {
  const [me, setMe] = React.useState<Me | null>(null);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setMe(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = me === null;
  const authed = Boolean(me && me.authenticated);

  if (!authed) {
    return (
      <Link
        href="/login"
        aria-label="Inloggen"
        title="Inloggen"
        className="relative hidden md:inline-flex items-center p-2 text-foreground/70 hover:text-foreground"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.reload();
    }
  }

  // Dropdown menu for authenticated users
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-account-root]")) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative hidden md:block" data-account-root>
      <button
        onClick={() => setOpen((s) => !s)}
        className="relative inline-flex items-center p-2 text-foreground/70 hover:text-foreground"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Mijn account"
      >
        <User className="h-5 w-5" />
        {/* status: black cross when logged in */}
        <X className="absolute -top-0.5 -right-0.5 h-3 w-3 text-black" aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-48 border bg-white shadow-card z-50">
          <Link
            href="/account"
            className="block px-3 py-2 text-sm hover:bg-muted/50 text-foreground"
            onClick={() => setOpen(false)}
          >
            Mijn account
          </Link>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50 text-foreground"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" /> Uitloggen
          </button>
        </div>
      ) : null}
    </div>
  );
}
