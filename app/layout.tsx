import type { Metadata, Viewport } from "next";
import { Finger_Paint, Figtree } from "next/font/google";
import "./globals.css";

const fingerPaint = Finger_Paint({
  variable: "--font-brand",
  weight: "400",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Palettory",
  description: "Turn your feelings into your palette",
};

export const viewport: Viewport = {
  themeColor: "#f1f1f0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fingerPaint.variable} ${figtree.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
