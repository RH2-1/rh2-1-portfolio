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
  title: "RH2-1 — Bug Hunter & Security Researcher",
  description:
    "RH2-1 is an independent bug hunter and security researcher focused on API security, source code review, web application security, and responsible vulnerability reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `data-scroll-behavior="smooth"` is required in Next 16: the framework
    // stopped overriding a global `scroll-behavior: smooth` during navigation,
    // so the attribute is how you opt back in. See nextjs16-conventions.md.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#03050a] text-white">{children}</body>
    </html>
  );
}
