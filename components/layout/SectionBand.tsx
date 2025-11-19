// components/layout/SectionBand.tsx
import React from "react";
import { cn } from "@/lib/utils";

type SectionBandProps = {
  children: React.ReactNode;
  bgClass?: string; // e.g. "bg-muted/40"
  className?: string;
};

export function SectionBand({ children, bgClass = "bg-muted/30", className }: SectionBandProps) {
  return (
    <section
      className={cn(
        "relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw]",
        "py-10 md:py-12",
        bgClass,
        className
      )}
    >
      <div className="container space-y-6">{children}</div>
    </section>
  );
}

