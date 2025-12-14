import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { tenantHeaders } from '@/lib/tenant';

const inter = Inter({ subsets: ['latin'] });

async function getSettings() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${apiUrl}/settings`, {
      method: 'GET',
      cache: 'no-store', // Don't cache settings
      headers: tenantHeaders(),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch settings for metadata:', error);
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';

  const metadata: Metadata = {
    title: settings?.businessName || 'BrewPoint',
    description: 'Complete cafe management solution with QR ordering',
    metadataBase: new URL(frontendUrl),
  };

  if (settings?.ogImageUrl) {
    metadata.openGraph = {
      type: 'website',
      url: frontendUrl,
      title: settings.businessName || 'BrewPoint',
      description: 'Complete cafe management solution with QR ordering',
      siteName: settings.businessName || 'BrewPoint',
      images: [
        {
          url: `${baseUrl}${settings.ogImageUrl}`,
          width: 1200,
          height: 630,
          alt: settings.businessName || 'BrewPoint',
        },
      ],
    };

    metadata.twitter = {
      card: 'summary_large_image',
      title: settings.businessName || 'BrewPoint',
      description: 'Complete cafe management solution with QR ordering',
      images: [`${baseUrl}${settings.ogImageUrl}`],
    };
  }

  return metadata;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
