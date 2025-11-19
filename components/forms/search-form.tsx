// components/forms/search-form.tsx
"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const SearchSchema = z.object({ q: z.string().min(0).max(100) });

export function SearchForm({
  className,
  hideOnMobile = true,
  variant = "inline",
  inputClassName,
  onSubmitComplete,
  showButton = false,
  buttonText = "Zoek",
  buttonClassName,
  buttonIcon,
  buttonAriaLabel,
}: {
  className?: string;
  hideOnMobile?: boolean;
  variant?: "inline" | "bar";
  inputClassName?: string;
  onSubmitComplete?: () => void;
  showButton?: boolean;
  buttonText?: string;
  buttonClassName?: string;
  buttonIcon?: ReactNode;
  buttonAriaLabel?: string;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof SearchSchema>>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { q: "" },
  });

  function onSubmit(values: z.infer<typeof SearchSchema>) {
    const q = values.q?.trim();
    if (q) {
      router.push(`/products?search=${encodeURIComponent(q)}`);
      try { onSubmitComplete?.(); } catch {}
    }
  }

  const baseClass = cn(hideOnMobile ? "hidden md:flex" : "flex", className);

  if (variant === "bar") {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn(baseClass, "items-center gap-2 w-full")}> 
        <Label htmlFor="q" className="sr-only">
          Search products
        </Label>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="q"
            placeholder="Search products..."
            {...form.register("q")}
            className={cn("h-11 w-full pl-9 rounded-none", inputClassName)}
          />
        </div>
        {showButton ? (
          <Button
            type="submit"
            className={cn("h-11 rounded-none", buttonClassName)}
            aria-label={buttonAriaLabel || (typeof buttonText === "string" ? buttonText : "Search")}
          >
            {buttonIcon ?? buttonText}
          </Button>
        ) : null}
      </form>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn(baseClass, "items-center gap-2")}
    >
      <Label htmlFor="q" className="sr-only">
        Search
      </Label>
      <div className="relative w-64">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input id="q" placeholder="Search products" {...form.register("q")} className="pl-8" />
      </div>
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
}
