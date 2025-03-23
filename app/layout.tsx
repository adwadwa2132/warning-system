import './globals.css';
import 'leaflet/dist/leaflet.css';
import './styles/leaflet-draw.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Load Leaflet Draw directly with a script tag to ensure it's available
export function LeafletDrawScript() {
  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <script 
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
      ></script>
      <script 
        src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"
        crossOrigin=""
      ></script>
    </>
  );
}

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
        <LeafletDrawScript />
      </head>
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
