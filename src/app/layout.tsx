import type { Metadata } from "next";
import { IBM_Plex_Mono, Spectral } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Restrained net-literate signal: mono for structure, labels, links.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Dominant, trustworthy reading voice: serif for headlines and legal body text.
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://deepfake-recourse.vercel.app"),
  title: "Deepfake Recourse",
  description:
    "Recourse for a voice or likeness cloned without consent. Deepfake Recourse assembles and drafts. A human files.",
  openGraph: {
    title: "Deepfake Recourse",
    description:
      "Recourse for a voice or likeness cloned without consent. The tool assembles and drafts. A human files.",
    url: "https://deepfake-recourse.vercel.app",
    siteName: "Deepfake Recourse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deepfake Recourse",
    description:
      "Recourse for a voice or likeness cloned without consent. The tool assembles and drafts. A human files.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexMono.variable} ${spectral.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
