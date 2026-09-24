import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./global.css";
import { Toaster } from "sonner"
import PathnameWrapper from "./components/PathNameWrapper";
import FetchDataStore from "./components/FetchDataStore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Replace with your real domain once deployed.
const siteUrl = "https://www.kayzeeglobal.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kayzee Global Computer Networks | Laptop Sales & Repairs in Nigeria",
    template: "%s | Kayzee Global Computer Networks",
  },
  description:
    "Buy quality laptops and get professional laptop repair services in Nigeria. Screen replacement, upgrades, virus removal, and hardware repair with warranty.",
  keywords: [
    "laptop sales Nigeria",
    "laptop repair Nigeria",
    "buy laptops Lagos",
    "laptop screen replacement",
    "refurbished laptops Nigeria",
    "computer repair Lagos",
  ],
  authors: [{ name: "Kayzee Global Computer Networks" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "Kayzee Global Computer Networks",
    title: "Kayzee Global Computer Networks | Laptop Sales & Repairs in Nigeria",
    description:
      "Buy quality laptops and get professional laptop repair services in Nigeria. Screen replacement, upgrades, virus removal, and hardware repair with warranty.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kayzee Global Computer Networks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kayzee Global Computer Networks | Laptop Sales & Repairs in Nigeria",
    description:
      "Buy quality laptops and get professional laptop repair services in Nigeria.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
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
        <Toaster richColors position="top-center" />
        <FetchDataStore />
        <PathnameWrapper>
          {children}
        </PathnameWrapper>
      </body>
    </html>
  );
}