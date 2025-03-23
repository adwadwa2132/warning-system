import './globals.css';
import { Inter } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
// We'll handle Leaflet Draw CSS directly in Map.tsx component to avoid build issues

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
        {/* Leaflet CSS is imported directly in the components that need it */}
      </head>
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
