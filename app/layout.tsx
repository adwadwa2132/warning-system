import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/leaflet-draw.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather Warning System",
  description: "A real-time warning system for severe weather events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} bg-gray-100`}>{children}</body>
    </html>
  );
}
