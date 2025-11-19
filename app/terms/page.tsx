// app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { FileText, Store, Link as LinkIcon, Shield, DollarSign, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: `Terms & Conditions — ${siteConfig.brand}`,
  description: "Terms that govern use of the site and services.",
};

export default function TermsPage() {
  return (
    <div className="space-y-10 pt-0 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <h1>Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the
          site, you agree to be bound by these Terms of Service.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><FileText className="h-4 w-4" /> OVERVIEW</div>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              This website is operated by Vdubs. Throughout the site, the terms “we”, “us” and “our” refer to Vdubs. Vdubs offers
              this website, including all information, tools and Services available from this site to you, the user, conditioned
              upon your acceptance of all terms, conditions, policies and notices stated here.
            </p>
            <p>
              By visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the
              following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and
              policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site,
              including without limitation users who are browsers, vendors, customers, merchants, and/ or contributors of content.
            </p>
            <p>
              Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of
              the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this
              agreement, then you may not access the website or use any Services. If these Terms of Service are considered an offer,
              acceptance is expressly limited to these Terms of Service.
            </p>
            <p>
              Any new features or tools which are added to the current store shall also be subject to the Terms of Service. You can
              review the most current version of the Terms of Service at any time on this page. We reserve the right to update,
              change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your
              responsibility to check this page periodically for changes. Your continued use of or access to the website following
              the posting of any changes constitutes acceptance of those changes.
            </p>
            <p className="flex items-center gap-2"><Store className="h-4 w-4" /> Our store is hosted on Shopify Inc. They provide the e‑commerce platform that allows us to sell our products and Services to you.</p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-3">
        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 1 - ONLINE STORE TERMS</div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.</p>
            <p>You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).</p>
            <p>You must not transmit any worms or viruses or any code of a destructive nature.</p>
            <p>A breach or violation of any of the Terms will result in an immediate termination of your Services.</p>
          </div>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 2 - GENERAL CONDITIONS</div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>We reserve the right to refuse Service to anyone for any reason at any time.</p>
            <p>You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.</p>
            <p>You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the Service is provided, without express written permission by us.</p>
            <p>The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.</p>
          </div>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 3 - ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION</div>
          <p className="text-sm text-muted-foreground">We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this site is at your own risk. We may modify contents at any time without obligation to update information.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 4 - MODIFICATIONS TO THE SERVICE AND PRICES</div>
          <p className="text-sm text-muted-foreground">Prices for our products are subject to change without notice. We may modify or discontinue the Service (or any part or content thereof) without notice. We are not liable to you or any third‑party for any modification, price change, suspension or discontinuance of the Service.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 5 - PRODUCTS OR SERVICES (if applicable)</div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Certain products or Services may be available exclusively online and may have limited quantities. Returns or exchanges are handled according to our <Link href="/returns" className="underline">Refund Policy</Link>.</p>
            <p>We try to display product colors/images accurately, but cannot guarantee your monitor displays colors exactly.</p>
            <p>We may limit sales of products or Services to any person/region/jurisdiction, and limit quantities. Descriptions or pricing may change at any time without notice. We may discontinue products at any time. Any offer is void where prohibited.</p>
            <p>We do not warrant that the quality of any products, Services, information, or other material will meet your expectations, or that any errors in the Service will be corrected.</p>
          </div>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 6 - ACCURACY OF BILLING AND ACCOUNT INFORMATION</div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>We may refuse any order, and limit or cancel quantities per person/household/order, including orders under the same account, credit card, and/or billing/shipping address. If we change/cancel an order, we may notify you via the contact details provided at checkout. We may also limit or prohibit orders that, in our judgment, appear to be placed by dealers, resellers or distributors.</p>
            <p>You agree to provide current, complete and accurate purchase and account information and promptly update details so we can complete transactions and contact you as needed.</p>
            <p>For more details, please review our <Link href="/returns" className="underline">Refund Policy</Link>.</p>
          </div>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 7 - OPTIONAL TOOLS</div>
          <p className="text-sm text-muted-foreground">We may provide access to third‑party tools “as is” and “as available” without warranties. We are not liable for your use of optional tools. Your use is entirely at your own risk and discretion, and you should ensure you approve the terms provided by the relevant third‑party provider(s). New features/tools are also subject to these Terms.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 8 - THIRD‑PARTY LINKS</div>
          <p className="text-sm text-muted-foreground">Third‑party links may direct you to websites not affiliated with us. We are not responsible for examining/evaluating the content or accuracy and will not be liable for any third‑party materials or websites. Review third‑party policies and practices carefully before transactions. Complaints or questions regarding third‑party products should be directed to the third‑party.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 9 - USER COMMENTS, FEEDBACK AND OTHER SUBMISSIONS</div>
          <p className="text-sm text-muted-foreground">If you submit creative ideas, suggestions, proposals, plans, or other materials (collectively, 'comments'), you agree we may use them without restriction. We have no obligation to maintain comments in confidence, pay compensation, or respond. We may monitor, edit or remove content deemed unlawful, offensive or violating intellectual property or these Terms. You are solely responsible for comments you make and their accuracy.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Shield className="h-4 w-4" /> SECTION 10 - PERSONAL INFORMATION</div>
          <p className="text-sm text-muted-foreground">Your submission of personal information through the store is governed by our <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 11 - ERRORS, INACCURACIES AND OMISSIONS</div>
          <p className="text-sm text-muted-foreground">Occasionally there may be information that contains typographical errors, inaccuracies or omissions (e.g., descriptions, pricing, promotions, offers, shipping charges, transit times and availability). We may correct or update information or cancel orders if any information is inaccurate, without prior notice. We undertake no obligation to update, except as required by law.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 12 - PROHIBITED USES</div>
          <p className="text-sm text-muted-foreground">You are prohibited from using the site or its content for unlawful, infringing, harmful or abusive purposes, submitting false information, uploading malicious code, collecting personal information, spamming, scraping, obscene or immoral purposes, or to interfere with security features. We may terminate your use for violations.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 13 - DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY</div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>We do not guarantee that use of the Service will be uninterrupted, timely, secure or error‑free or that results will be reliable. The Service and all products are provided 'as is' and 'as available' without warranties of any kind unless expressly stated by us.</p>
            <p>In no case shall Vdubs or our teams be liable for indirect, incidental, punitive, special or consequential damages. In certain jurisdictions, limitations may not apply; where so, liability is limited to the maximum extent permitted by law.</p>
          </div>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 14 - INDEMNIFICATION</div>
          <p className="text-sm text-muted-foreground">You agree to indemnify, defend and hold harmless Vdubs and our affiliates, partners and personnel from any claim or demand, including reasonable attorneys’ fees, arising out of your breach of these Terms or violation of any law or third‑party rights.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 15 - SEVERABILITY</div>
          <p className="text-sm text-muted-foreground">If any provision of these Terms is determined to be unlawful, void or unenforceable, such provision shall be enforced to the fullest extent permitted and the unenforceable portion deemed severed without affecting remaining provisions.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 16 - TERMINATION</div>
          <p className="text-sm text-muted-foreground">These Terms are effective unless and until terminated by either party. You may terminate by notifying us you no longer wish to use the Services. If we believe you failed to comply with any term, we may terminate without notice and you remain liable for all amounts due up to termination and may be denied access to the Services.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Scale className="h-4 w-4" /> SECTION 17 - ENTIRE AGREEMENT</div>
          <p className="text-sm text-muted-foreground">These Terms and any policies posted on this site constitute the entire agreement and supersede prior agreements or communications. Any ambiguities shall not be construed against the drafting party.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><Scale className="h-4 w-4" /> SECTION 18 - GOVERNING LAW</div>
          <p className="text-sm text-muted-foreground">These Terms and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of Netherlands.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 font-semibold">SECTION 19 - CHANGES TO TERMS OF SERVICE</div>
          <p className="text-sm text-muted-foreground">You can review the most current version of the Terms of Service at any time at this page. We reserve the right to update, change or replace any part of these Terms by posting updates and changes to our website. Your continued use or access after posting constitutes acceptance of those changes.</p>
        </div>

        <div className="border bg-card p-6 rounded-none shadow-card">
          <div className="mb-2 flex items-center gap-2 font-semibold"><LinkIcon className="h-4 w-4" /> SECTION 20 - CONTACT INFORMATION</div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Questions about the Terms of Service? Email us at <Link href="mailto:Vdubscards@hotmail.com" className="underline">Vdubscards@hotmail.com</Link>.</p>
            <address className="not-italic">
              V-dubscards<br />
              Vdubscards@hotmail.com<br />
              Sperwerhorst 10, 2675WT, Honselersdk.<br />
              Chamber of commerce number: 92762751
            </address>
          </div>
        </div>
      </section>
    </div>
  );
}
