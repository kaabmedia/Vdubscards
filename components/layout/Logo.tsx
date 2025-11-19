// components/layout/Logo.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { useState } from "react";

type LogoProps = {
  href?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function Logo({
  href = "/",
  className,
  width = 120,
  height = 28,
  priority = false,
}: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(siteConfig.logoSrc) && !imgError;

  return (
    <Link href={href as any} className={"inline-flex items-center " + (className ?? "")}
      aria-label={siteConfig.brand}>
      {showImage ? (
        <Image
          src={siteConfig.logoSrc}
          alt={`${siteConfig.brand} logo`}
          width={width}
          height={height}
          priority={priority}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-lg font-semibold tracking-tight">{siteConfig.brand}</span>
      )}
    </Link>
  );
}
