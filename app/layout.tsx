import './globals.css';
import 'leaflet/dist/leaflet.css';
import './styles/leaflet-draw.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Weather Warning System',
  description: 'Custom severe weather warning system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css"
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        
        {/* Load Leaflet scripts */}
        <Script 
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          strategy="beforeInteractive"
        />
        <Script 
          src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
