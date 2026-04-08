import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://entrelivros.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Entre Livros - Tatiana Felício",
    template: "%s | Entre Livros",
  },
  description:
    "Blog de resenhas e recomendacoes literarias por Tatiana Felicio. Descobre novas leituras, opinioes honestas e o amor pelos livros.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Entre Livros - Tatiana Felicio",
    description:
      "Blog de resenhas e recomendacoes literarias por Tatiana Felicio.",
    url: siteUrl,
    siteName: "Entre Livros",
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Entre Livros - Tatiana Felicio",
    description:
      "Blog de resenhas e recomendacoes literarias por Tatiana Felicio.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground"
        >
          Saltar para o conteúdo principal
        </a>
        <Analytics/>
        <SpeedInsights/>
        <Providers>{children}</Providers>
      </body>
    </html>
  );}
