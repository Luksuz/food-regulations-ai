import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LabelGuard AI — Pet Food Label Compliance",
  description: "AI-powered label compliance evaluator for pet food and animal feed. Catch FDA & AAFCO violations before they catch you.",
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
