import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DMS Sports — Painel de Gestão",
  description: "Gestão de estoque, vendas e leads — DMS Sports",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DMS Gestão",
  },
  openGraph: {
    title: "DMS Sports — Painel de Gestão",
    description: "Gestão de estoque, vendas e leads — DMS Sports",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DMS Sports — Painel de Gestão",
    description: "Gestão de estoque, vendas e leads — DMS Sports",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/logo-dms-sports.jpg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
