import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LabelGuard AI — Pet Food Label Compliance",
  description: "AI-powered label compliance evaluator for pet food and animal feed. Catch FDA & AAFCO violations before they catch you.",
  openGraph: {
    title: "LabelGuard AI — Catch Label Violations Before the FDA Does",
    description: "Upload a pet food or animal feed label and get an instant compliance report against FDA 21 CFR and AAFCO standards.",
    type: "website",
    siteName: "LabelGuard AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "LabelGuard AI — Pet Food Label Compliance",
    description: "AI-powered compliance analysis for pet food & animal feed labels.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="noise-bg">
        {children}
      </body>
    </html>
  );
}
