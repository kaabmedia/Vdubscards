// components/layout/Main.tsx
"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";

type MainProps = {
  children: React.ReactNode;
  className?: string;
};

export function Main({ children, className }: MainProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const noTopPaddingRoutes = new Set(["/cart"]);
  const startsWithNoTop = (p?: string | null) => {
    if (!p) return false;
    return p.startsWith("/collections/");
  };
  const noTop = isHome || noTopPaddingRoutes.has(pathname || "") || startsWithNoTop(pathname);

  return (
    <main
      className={cn(
        "container",
        isHome ? "py-0" : "py-10 md:py-12",
        !isHome && noTop && "pt-0",
        className
      )}
    >
      {children}
    </main>
  );
}
