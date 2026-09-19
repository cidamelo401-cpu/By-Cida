import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Pijamas Digital — Painel de Gestão",
  description: "Gestão de estoque, vendas e leads — Pijamas Digital",
  openGraph: {
    title: "Pijamas Digital — Painel de Gestão",
    description: "Gestão de estoque, vendas e leads — Pijamas Digital",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pijamas Digital — Painel de Gestão",
    description: "Gestão de estoque, vendas e leads — Pijamas Digital",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
