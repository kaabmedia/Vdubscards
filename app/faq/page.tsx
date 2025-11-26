// app/faq/page.tsx
import type { ComponentType } from "react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Truck, Globe, RotateCcw, ShieldCheck, CreditCard, HelpCircle, Mail, Phone } from "lucide-react";

type FaqItem = {
  icon: ComponentType<{ className?: string }>;
  question: string;
  answer: string;
  link?: { href: Route; label: string };
};

const faqs: FaqItem[] = [
  {
    icon: Truck,
    question: "When will my order ship?",
    answer: "Orders are processed within 1–2 business days. As soon as your parcel leaves our warehouse you will receive a DHL tracking link.",
  },
  {
    icon: Globe,
    question: "Do you ship internationally?",
    answer: "Yes. We ship within the EU and worldwide. Delivery times and any customs duties depend on your region and carrier processing.",
  },
  {
    icon: RotateCcw,
    question: "How do returns work?",
    answer: "You can return items that are in original condition. Start by emailing us with your order number; once received we inspect returns within 1–2 business days.",
    link: { href: "/returns", label: "Read our full returns policy" },
  },
  {
    icon: ShieldCheck,
    question: "Are your products authentic?",
    answer: `${siteConfig.brand} only sells authentic, sealed and properly stored products sourced from trusted distributors.`,
  },
  {
    icon: CreditCard,
    question: "Which payment methods are accepted?",
    answer: "Major cards, iDEAL, Bancontact, PayPal and Apple Pay are supported. Klarna and other regional methods are available where supported.",
  },
  {
    icon: HelpCircle,
    question: "Can I reserve items or pre-order?",
    answer: "For hard-to-find items or pre-orders, reach out via email. We will confirm availability and expected timelines before you pay.",
  },
];

export const metadata: Metadata = {
  title: `FAQ — ${siteConfig.brand}`,
  description: "Answers to common questions about shipping, returns, authenticity, payments and how to contact the V-dubscards team.",
};

export default function FaqPage() {
  return (
    <div className="space-y-10 pt-0 pb-16">
      <div className="space-y-3">
        <h1>Frequently Asked Questions</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Quick answers to the most common questions we hear from collectors. If you still need help, contact us and we will respond quickly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((item) => (
          <div key={item.question} className="border bg-card p-6 shadow-card rounded-none space-y-2">
            <div className="flex items-center gap-2 text-base font-semibold">
              <item.icon className="h-4 w-4" /> {item.question}
            </div>
            <p className="text-sm text-muted-foreground">{item.answer}</p>
            {item.link ? (
              <Link href={item.link.href} className="text-sm font-medium text-black underline underline-offset-4 hover:opacity-80">
                {item.link.label}
              </Link>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border bg-card p-6 shadow-card rounded-none space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <Mail className="h-4 w-4" /> Email us
          </div>
          <p className="text-sm text-muted-foreground">
            For product questions, order updates or return requests, email{" "}
            <a href="mailto:Vdubscards@hotmail.com" className="underline">
              Vdubscards@hotmail.com
            </a>.
          </p>
        </div>
        <div className="border bg-card p-6 shadow-card rounded-none space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <Phone className="h-4 w-4" /> Call us
          </div>
          <p className="text-sm text-muted-foreground">
            Prefer to talk to a person? Call <a href="tel:+31654386100" className="underline">+31 6 54 38 61 00</a> and we will help you right away.
          </p>
        </div>
      </div>
    </div>
  );
}
