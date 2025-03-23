import './globals.css';
import LeafletDrawStyles from './components/LeafletDrawStyles';

export const metadata = {
  title: 'Warning System',
  description: 'A system for managing and displaying weather warnings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" rel="stylesheet" />
        <link href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" rel="stylesheet" />
      </head>
      <body className="bg-gray-100">
        <LeafletDrawStyles />
        {children}
      </body>
    </html>
  );
}
