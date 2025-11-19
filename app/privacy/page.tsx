// app/privacy/page.tsx
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Shield, Cookie, Users, Globe, FileText, AlertCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: `Privacy Policy — ${siteConfig.brand}`,
  description: "How we collect, use and disclose personal information, your rights, cookies, security and contact details.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-10 pt-0 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <h1>Privacy Policy</h1>
        <div className="text-xs text-muted-foreground">Last updated: 27 March 2024</div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          This Privacy Policy describes how Vdubs (the "Site", "we", "us", or "our") collects, uses, and discloses your personal
          information when you visit, use our services, or make a purchase from 8f8a56-e3.myshopify.com (the "Site") or otherwise
          communicate with us (collectively, the "Services"). For purposes of this Privacy Policy, "you" and "your" means you as the
          user of the Services, whether you are a customer, website visitor, or another individual whose information we have
          collected pursuant to this Privacy Policy.
        </p>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Please read this Privacy Policy carefully. By using and accessing any of the Services, you agree to the collection, use,
          and disclosure of your information as described in this Privacy Policy. If you do not agree to this Privacy Policy,
          please do not use or access any of the Services.
        </p>
      </div>

      {/* Changes */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><FileText className="h-4 w-4" /> Changes to This Privacy Policy</div>
          <p className="text-sm text-muted-foreground">
            We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other
            operational, legal, or regulatory reasons. We will post the revised Privacy Policy on the Site, update the "Last
            updated" date and take any other steps required by applicable law.
          </p>
        </div>
      </section>

      {/* How we collect and use */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Shield className="h-4 w-4" /> How We Collect and Use Your Personal Information</div>
          <p className="text-sm text-muted-foreground">
            To provide the Services, we collect and have collected over the past 12 months personal information about you from a
            variety of sources, as set out below. The information that we collect and use varies depending on how you interact with
            us. In addition to the specific uses set out below, we may use information we collect about you to communicate with you,
            provide the Services, comply with any applicable legal obligations, enforce any applicable terms of service, and to
            protect or defend the Services, our rights, and the rights of our users or others.
          </p>
        </div>
      </section>

      {/* What personal info we collect */}
      <section className="space-y-4">
        <h2>What Personal Information We Collect</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border bg-card p-6 rounded-none shadow-card">
            <div className="mb-2 font-semibold">Information We Collect Directly from You</div>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Basic contact details including your name, address, phone number, email.</li>
              <li>Order information including billing/shipping address, payment confirmation, email, phone number.</li>
              <li>Account information including your username, password, security questions.</li>
              <li>Shopping information including items you view, cart, or wishlist.</li>
              <li>Customer support information you include in communications with us.</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">Some features may require certain information. Not providing it may limit access to features.</p>
          </div>
          <div className="border bg-card p-6 rounded-none shadow-card">
            <div className="mb-2 flex items-center gap-2 font-semibold"><Cookie className="h-4 w-4" /> Information We Collect through Cookies</div>
            <p className="text-sm text-muted-foreground">
              We automatically collect certain information about your interaction with the Services ("Usage Data") using cookies,
              pixels and similar technologies. Usage Data may include device info, browser, network connection, IP address and other
              information regarding your interaction with the Services.
            </p>
          </div>
          <div className="border bg-card p-6 rounded-none shadow-card">
            <div className="mb-2 flex items-center gap-2 font-semibold"><Users className="h-4 w-4" /> Information We Obtain from Third Parties</div>
            <p className="text-sm text-muted-foreground">
              We may obtain information from vendors and service providers (e.g., Shopify), payment processors, and when you
              interact with our emails, ads or Services using tracking technologies (pixels, web beacons, SDKs, libraries, cookies).
              Any information we obtain from third parties will be treated in accordance with this Privacy Policy.
            </p>
            <p className="text-xs text-muted-foreground">We are not responsible for third parties' policies or practices.</p>
          </div>
        </div>
      </section>

      {/* How we use */}
      <section className="space-y-4">
        <h2>How We Use Your Personal Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border bg-card p-6 rounded-none shadow-card">
            <div className="mb-2 font-semibold">Providing Products and Services</div>
            <p className="text-sm text-muted-foreground">Process payments and orders, account management, notifications, shipping, and returns/exchanges, and enable reviews.</p>
          </div>
          <div className="border bg-card p-6 rounded-none shadow-card">
            <div className="mb-2 font-semibold">Marketing and Advertising</div>
            <p className="text-sm text-muted-foreground">Send marketing communications and tailor ads on our Site and other websites.</p>
          </div>
          <div className="border bg-card p-6 rounded-none shadow-card">
            <div className="mb-2 font-semibold">Security and Fraud Prevention</div>
            <p className="text-sm text-muted-foreground">Detect, investigate and act on possible fraudulent, illegal or malicious activity.</p>
          </div>
          <div className="border bg-card p-6 rounded-none shadow-card">
            <div className="mb-2 font-semibold">Communicating with you</div>
            <p className="text-sm text-muted-foreground">Provide support, improve Services, and maintain our relationship with you.</p>
          </div>
        </div>
      </section>

      {/* Cookies section */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Cookie className="h-4 w-4" /> Cookies</div>
          <p className="text-sm text-muted-foreground">
            Like many websites, we use Cookies on our Site. For specific information about the Cookies that we use related to
            powering our store with Shopify, see <a className="underline" href="https://www.shopify.com/legal/cookies" target="_blank" rel="noopener noreferrer">https://www.shopify.com/legal/cookies</a>.
            We use Cookies to power and improve our Site and Services, run analytics, and better understand user interaction. You
            can manage Cookies in your browser settings; blocking Cookies may impact functionality.
          </p>
        </div>
      </section>

      {/* Disclosure */}
      <section className="space-y-4">
        <h2>How We Disclose Personal Information</h2>
        <p className="text-sm text-muted-foreground max-w-4xl">
          In certain circumstances, we may disclose your personal information to third parties for legitimate purposes subject to
          this Privacy Policy (e.g., vendors, payment processors, business partners, with consent, affiliates, during transactions,
          to comply with law, enforce terms, and protect rights).
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border bg-card p-6 rounded-none shadow-card">
            <div className="mb-2 font-semibold">Categories of Personal Information</div>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Identifiers such as basic contact details and certain order and account information</li>
              <li>Commercial information such as order information, shopping information and customer support information</li>
              <li>Internet or other similar network activity, such as Usage Data</li>
            </ul>
          </div>
          <div className="border bg-card p-6 rounded-none shadow-card">
            <div className="mb-2 font-semibold">Categories of Recipients</div>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Vendors and service providers (ISPs, payment processors, fulfillment, support, analytics, cloud)</li>
              <li>Business and marketing partners (including Shopify)</li>
              <li>Affiliates/within our corporate group</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">We do not use or disclose sensitive personal information for the purposes of inferring characteristics about you.</p>
      </section>

      {/* UGC and third parties */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">User Generated Content</div>
          <p className="text-sm text-muted-foreground">Content you submit to public areas (e.g., reviews) will be public and accessible by anyone. We are not responsible for how others use public information.</p>
        </div>
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">Third Party Websites and Links</div>
          <p className="text-sm text-muted-foreground">Our Site may link to third‑party websites. Review their privacy and security policies. We are not responsible for their practices or content.</p>
        </div>
      </section>

      {/* Children, Security, Retention */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">Children’s Data</div>
          <p className="text-sm text-muted-foreground">The Services are not intended for children and we do not knowingly collect information about children.</p>
        </div>
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">Security and Retention of Your Information</div>
          <p className="text-sm text-muted-foreground">No security measures are perfect. Do not use unsecure channels for sensitive information. Retention depends on account needs, Services provision, legal obligations, and dispute resolution.</p>
        </div>
      </section>

      {/* Rights & choices */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Users className="h-4 w-4" /> Your Rights and Choices</div>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Right to Access / Know</li>
            <li>Right to Delete</li>
            <li>Right to Correct</li>
            <li>Right of Portability</li>
            <li>Restriction of Processing</li>
            <li>Withdrawal of Consent</li>
            <li>Appeal</li>
            <li>Managing Communication Preferences</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            You may exercise rights on our Site or by contacting us. We will not discriminate against you for exercising any rights.
            We may verify your identity before responding and may accept authorized agent requests with proof of authorization.
          </p>
        </div>
      </section>

      {/* Complaints, International, Contact */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4" /> Complaints</div>
          <p className="text-sm text-muted-foreground">If you have complaints about how we process your personal information, contact us. You may also have the right to appeal or lodge a complaint with your local authority.</p>
        </div>
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Globe className="h-4 w-4" /> International Users</div>
          <p className="text-sm text-muted-foreground">We may transfer, store and process information outside your country, including the United States, using recognized transfer mechanisms such as Standard Contractual Clauses where required.</p>
        </div>
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Mail className="h-4 w-4" /> Contact</div>
          <p className="text-sm text-muted-foreground">Questions or requests? Email <a href="mailto:Vdubscards@hotmail.com" className="underline">Vdubscards@hotmail.com</a>.</p>
        </div>
      </section>
    </div>
  );
}
