"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

const STEPS = [
  {
    num: "01",
    title: "Upload Your Label",
    desc: "Drag & drop a photo of your pet food or animal feed label. Our AI reads every element — ingredients, claims, guaranteed analysis.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "AI Analyzes Against Regulations",
    desc: "Your label is evaluated against FDA 21 CFR Part 501, AAFCO Model Regulations, and GRAS substance databases using RAG retrieval.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V18a2.25 2.25 0 01-2.25 2.25H7.25A2.25 2.25 0 015 18v-3.5" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Get Your Compliance Report",
    desc: "Receive a detailed report with compliance score, violations, unsubstantiated claims, and prioritized recommendations to fix.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "For small producers testing the waters",
    features: ["3 label scans per month", "FDA 21 CFR Part 501 checks", "Basic compliance score", "Email report"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/mo",
    desc: "For serious manufacturers",
    features: [
      "Unlimited label scans",
      "Full FDA + AAFCO analysis",
      "GRAS substance validation",
      "Marketing claims audit",
      "Priority processing",
      "Dashboard & report history",
    ],
    cta: "Start 14-Day Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "/mo",
    desc: "For large operations & consultants",
    features: [
      "Everything in Professional",
      "Custom regulation sets",
      "Batch label processing",
      "API access",
      "Dedicated support",
      "Team collaboration",
      "Audit trail & exports",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "We caught 4 labeling violations on our new puppy formula before it went to print. LabelGuard paid for itself on day one.",
    name: "Sarah Chen",
    title: "QA Director, NutraPet Foods",
  },
  {
    quote: "Our regulatory affairs team used to spend 3 days reviewing each label. Now we get an initial compliance check in under 2 minutes.",
    name: "Marcus Williams",
    title: "VP Regulatory, Allied Feed Corp",
  },
  {
    quote: "The marketing claims analysis alone is worth the subscription. It flagged 'clinically proven' claims we had no studies to back up.",
    name: "Dr. Jennifer Park",
    title: "Formulation Scientist, PetWell Labs",
  },
];

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-night-700/50 bg-night-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <ShieldIcon className="w-6 h-6 text-emit-500" />
            <span className="font-[family-name:var(--font-display)] text-lg tracking-tight">LabelGuard</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-night-300">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-emit-400 transition-colors">{l.label}</a>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="h-9 px-5 flex items-center rounded-full bg-emit-500 text-night-950 text-sm font-semibold hover:bg-emit-400 transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-emit-500/8 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Social proof badge — Bandwagon Effect */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-night-600 bg-night-800/60 text-sm text-night-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-emit-500 animate-pulse" />
            <span className="font-[family-name:var(--font-mono)] text-emit-400 text-xs">12,847</span>
            labels analyzed this month
          </div>

          {/* Headline — Loss Aversion */}
          <h1 className="animate-fade-up delay-1 font-[family-name:var(--font-display)] text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
            Catch label violations
            <br />
            <span className="text-emit-400">before the FDA does</span>
          </h1>

          <p className="animate-fade-up delay-2 text-lg md:text-xl text-night-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered compliance analysis for pet food & animal feed labels.
            Upload a label image, get an instant regulatory report against FDA 21 CFR and AAFCO standards.
          </p>

          {/* CTA — Activation Energy (low friction) */}
          <div className="animate-fade-up delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/dashboard"
              className="group h-14 px-8 flex items-center gap-3 rounded-full bg-emit-500 text-night-950 font-semibold text-lg hover:bg-emit-400 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload a Label — It&apos;s Free
            </Link>
            <a href="#how-it-works" className="h-14 px-8 flex items-center text-night-300 hover:text-emit-400 transition-colors font-medium">
              See how it works →
            </a>
          </div>

          {/* Trust badges — Authority Bias */}
          <div className="animate-fade-up delay-4 flex flex-wrap items-center justify-center gap-6 text-xs text-night-400 uppercase tracking-widest font-medium">
            <div className="flex items-center gap-2 px-4 py-2 rounded border border-night-700 bg-night-800/40">
              <ShieldIcon className="w-4 h-4 text-emit-500" />
              FDA 21 CFR Compliant
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded border border-night-700 bg-night-800/40">
              <ShieldIcon className="w-4 h-4 text-emit-500" />
              AAFCO Standards
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded border border-night-700 bg-night-800/40">
              <ShieldIcon className="w-4 h-4 text-emit-500" />
              GRAS Database
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-night-700/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-emit-500 font-semibold mb-3">How It Works</p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-16">
            From label to compliance report<br />in under two minutes
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className={`animate-fade-up delay-${i + 2} group relative p-8 rounded-2xl border border-night-700/50 bg-night-800/30 hover:border-emit-500/30 transition-all`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-[family-name:var(--font-mono)] text-xs text-emit-500">{step.num}</span>
                  <div className="h-px flex-1 bg-night-700" />
                  <div className="text-emit-500">{step.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-night-300 leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — Anchoring + Decoy Effect */}
      <section id="pricing" className="py-24 px-6 border-t border-night-700/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-emit-500 font-semibold mb-3">Pricing</p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-4">
            Less than the cost of one FDA warning letter
          </h2>
          <p className="text-night-300 mb-16 max-w-xl">
            The average FDA warning letter costs companies $50,000+ in corrections. Catch issues before they escalate.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border transition-all ${
                  plan.highlighted
                    ? "border-emit-500/50 bg-emit-500/5 shadow-[0_0_40px_rgba(16,185,129,0.08)]"
                    : "border-night-700/50 bg-night-800/30 hover:border-night-600"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-8 px-3 py-0.5 rounded-full bg-emit-500 text-night-950 text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-night-400 text-sm mb-5">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-[family-name:var(--font-display)] text-4xl">{plan.price}</span>
                  {plan.period && <span className="text-night-400 text-sm">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-night-300">
                      <svg className="w-4 h-4 text-emit-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full h-11 rounded-full text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-emit-500 text-night-950 hover:bg-emit-400"
                      : "border border-night-600 text-night-300 hover:border-emit-500 hover:text-emit-400"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — Social Proof */}
      <section id="testimonials" className="py-24 px-6 border-t border-night-700/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-emit-500 font-semibold mb-3">Testimonials</p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-16">
            Trusted by regulatory teams nationwide
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-8 rounded-2xl border border-night-700/50 bg-night-800/30">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-warn-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-night-300 leading-relaxed mb-6 text-sm italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-night-400 text-xs">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — Commitment & Consistency */}
      <section className="py-24 px-6 border-t border-night-700/50">
        <div className="max-w-2xl mx-auto text-center">
          <ShieldIcon className="w-12 h-12 text-emit-500 mx-auto mb-6" />
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl mb-4">
            Don&apos;t ship a non-compliant label
          </h2>
          <p className="text-night-300 mb-10 leading-relaxed">
            Every label that goes to market without compliance review is a risk.
            Start with a free scan — no account required.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-14 px-10 items-center gap-3 rounded-full bg-emit-500 text-night-950 font-semibold text-lg hover:bg-emit-400 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            Scan Your First Label Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-night-700/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-night-400">
          <div className="flex items-center gap-2">
            <ShieldIcon className="w-4 h-4 text-emit-500" />
            <span className="font-[family-name:var(--font-display)] text-sm text-night-300">LabelGuard AI</span>
          </div>
          <p>&copy; 2026 LabelGuard AI. For educational and compliance assistance only. Not legal advice.</p>
        </div>
      </footer>
    </div>
  );
}
