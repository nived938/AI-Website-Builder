import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VEYRA Studio — Your idea, built for the web.",
  description:
    "An elite AI-powered SaaS website builder engineered with local Ollama inference, persistent 4,000-token memory, credit billing, and sandboxed live preview.",
  keywords: [
    "AI website builder",
    "Ollama",
    "persistent memory",
    "web development",
    "SaaS",
    "local AI",
    "Next.js",
  ],
  authors: [{ name: "VEYRA Studio" }],
  openGraph: {
    title: "VEYRA Studio — Your idea, built for the web.",
    description:
      "Build production-grade full-stack websites with local Ollama inference and persistent 4,000-token memory.",
    url: "https://veyra.studio",
    siteName: "VEYRA Studio",
    images: [
      {
        url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "VEYRA Studio Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans selection:bg-mint/20 selection:text-mint">
        {children}
      </body>
    </html>
  );
}
