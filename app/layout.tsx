import './globals.css';
import { Inter } from 'next/font/google';
import Head from 'next/head';

// Leaflet and Leaflet Draw
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Warning System',
  description: 'A system to display weather warnings on a map',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Ensure Leaflet Draw loads properly */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" defer async />
        <script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js" defer async />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
