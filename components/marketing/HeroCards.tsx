"use client";

// components/marketing/HeroCards.tsx
import * as React from "react";

/**
 * Floating trading cards in the hero background,
 * with a subtle parallax effect following the mouse.
 */
export function HeroCards() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    function handleMove(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      const maxShift = 18; // px
      setOffset({
        x: relX * maxShift,
        y: relY * maxShift,
      });
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      ref={ref}
      className="hero-cards pointer-events-none absolute inset-0 -z-10"
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: "transform 120ms ease-out",
      }}
      aria-hidden="true"
    >
      <div className="hero-card hero-card-1" />
      <div className="hero-card hero-card-3" />
      <div className="hero-card hero-card-4" />
      <div className="hero-card hero-card-5" />
    </div>
  );
}
