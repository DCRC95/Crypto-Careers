import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Providers } from "../providers/web3-providers";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChainTalent - Decentralized Talent Hub for Irish Tech",
  description: "A decentralized talent platform that puts you in control of your career data. Connect your wallet and discover transparent opportunities in the Irish tech sector.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Web3Providers>
      </body>
    </html>
  );
}
