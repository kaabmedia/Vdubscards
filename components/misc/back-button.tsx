// components/misc/back-button.tsx
"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={className || "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"}
      aria-label="Ga terug"
    >
      <ArrowLeft className="h-4 w-4" /> Terug
    </button>
  );
}

