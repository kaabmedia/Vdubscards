// app/about/page.tsx
import { SectionBand } from "@/components/layout/SectionBand";
import { Heart, Users, ImageIcon, Shield, Star, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About | V-dubscards",
  description:
    "Learn about V-dubscards - a family business built on passion for sports and collecting.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section with Gradient */}
      <SectionBand bgClass="bg-gradient-to-br from-primary/10 via-primary/5 to-background" className="py-16 md:py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Est. Family Business</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Welcome to{" "}
              <span className="text-primary font-extrabold">
                Vdubs
              </span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
              At Vdubs, everything revolves around our passion for sports and
              the thrill of collecting. What started as a hobby quickly grew
              into a true family business. With a deep love for sports and an
              eye for quality, we offer a carefully curated selection of sports
              cards.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button asChild size="lg">
                <Link href="/products">Shop Collection</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border/50 group">
            <Image
              src="/foto-1.webp"
              alt="Vdubs Collection"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>
      </SectionBand>

      {/* Stats Section */}
      <SectionBand bgClass="bg-white border-y border-border/50" className="py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Star, label: "Premium Cards", value: "1000+" },
            { icon: Users, label: "Happy Customers", value: "500+" },
            { icon: Shield, label: "Authenticity", value: "100%" },
            { icon: Trophy, label: "Rare Finds", value: "Daily" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-2">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-foreground/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </SectionBand>

      {/* Family Section */}
      <SectionBand bgClass="bg-muted/30" className="py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="order-2 md:order-1 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border/50 group">
            <Image
              src="/foto-1.webp"
              alt="Vdubs Family Business"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              <Heart className="h-4 w-4" />
              <span className="uppercase tracking-wide">Our Story</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              A Family United by Passion
            </h2>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
              Vdubs was founded by a family who shares a love for sports and
              collecting. What began at the kitchen table, trading cards and
              sharing memories, has grown into a webshop where we connect with
              fellow collectors every day.
            </p>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed">
              As a family business, we value personal service, trust, and building
              lasting relationships with our customers. Every order is handled with
              care—just as if it were part of our own collection.
            </p>
            <div className="pt-4">
              <Link href="/products" className="inline-flex items-center text-primary font-medium hover:underline">
                Explore our collection
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </SectionBand>

      {/* Values Section */}
      <SectionBand bgClass="bg-white" className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Our Values
          </h2>
          <p className="text-lg text-foreground/80">
            What makes Vdubs different
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Authenticity",
              description: "Every card is carefully verified to ensure you receive genuine, high-quality collectibles.",
            },
            {
              icon: Heart,
              title: "Personal Service",
              description: "We treat every customer like family and every order with the utmost care and attention.",
            },
            {
              icon: Users,
              title: "Community",
              description: "We're building a community of passionate collectors who share the love for the hobby.",
            },
          ].map((value, idx) => (
            <div
              key={idx}
              className="relative p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground group-hover:bg-primary/90 group-hover:text-primary-foreground transition-colors duration-300">
                  <value.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                <p className="text-foreground/80 leading-relaxed">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionBand>

      {/* Community Section */}
      <SectionBand bgClass="bg-gradient-to-br from-primary/10 via-primary/5 to-background" className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            <Users className="h-4 w-4" />
            <span className="uppercase tracking-wide">Community</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            For Collectors, by Collectors
          </h2>
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto">
            Whether you're just starting your collection or you're a seasoned
            hobbyist, Vdubs is your trusted destination. We stay up to date with
            the latest releases and proudly offer rare finds from the past.
            We're always happy to offer guidance, track down a specific card, or
            simply talk shop.
          </p>
          <div className="pt-6">
            <p className="text-xl font-semibold text-foreground mb-6">
              Vdubs is more than a store—it's a community built on shared passion.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/products">Start Collecting</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/events">Join Us at Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </SectionBand>
    </div>
  );
}
