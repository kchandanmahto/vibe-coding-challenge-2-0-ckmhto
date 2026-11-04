import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://academy-desk.example.com"),
  applicationName: "Academy Desk",
  title: {
    default: "Academy Desk | Sports Management Platform",
    template: "%s | Academy Desk",
  },
  description: "Academy Desk is a sports academy management platform for managing players, coaches, sports sessions, attendance, matches, performance, and player readiness.",
  keywords: ["Academy Desk", "sports academy", "player management", "coach management", "attendance", "matches", "player readiness"],
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    title: "Academy Desk | Sports Management Platform",
    description: "Academy Desk is a sports academy management platform for players, coaches, sessions, attendance, matches, performance, and readiness.",
    siteName: "Academy Desk",
    images: [{ url: "/logos/academy-desk-logo.png", width: 1536, height: 1024, alt: "Academy Desk" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academy Desk | Sports Management Platform",
    description: "Academy Desk is a sports academy management platform for players, coaches, sessions, attendance, matches, performance, and readiness.",
    images: ["/logos/academy-desk-logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
