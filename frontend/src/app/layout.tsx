import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { tenantHeaders } from '@/lib/tenant';
import PWARegister from '@/components/PWARegister';
import PWAInstallButton from '@/components/PWAInstallButton';
import PWAInstallBanner from '@/components/PWAInstallBanner';

export const dynamic = 'force-dynamic';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const getImageMimeType = (url: string) => {
  const lower = url.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/png';
};

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

const getMetadataBase = async () => {
  const envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  if (envUrl) {
    return new URL(envUrl);
  }

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host');
  const proto = headerList.get('x-forwarded-proto') || 'https';
  if (host) {
    return new URL(`${proto}://${host}`);
  }

  return new URL('http://localhost:3001');
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
  const metadataBase = await getMetadataBase();
  const themeColor = settings?.themeColor || '#111827';
  const appIconUrl = settings?.appIconUrl ? `${baseUrl}${settings.appIconUrl}` : null;
  const appIconType = appIconUrl ? getImageMimeType(appIconUrl) : 'image/png';
  const description =
    'BrewPoint unifies POS, QR ordering, and real-time ops in one cafe platform.';
  const canonicalUrl = 'https://cms.edgepoint.co.nz/';
  const openGraphTitle = 'BrewPoint | POS & QR Ordering Café Management System';
  const openGraphSiteName = 'BrewPoint';
  const ogImageUrl = settings?.ogImageUrl ? `${baseUrl}${settings.ogImageUrl}` : null;

  const metadata: Metadata = {
    title: settings?.businessName || 'BrewPoint',
    description,
    metadataBase,
    manifest: '/manifest.webmanifest',
    themeColor,
    icons: appIconUrl
      ? {
          icon: [
            { url: appIconUrl, sizes: '192x192', type: appIconType },
            { url: appIconUrl, sizes: '512x512', type: appIconType },
          ],
          apple: [{ url: appIconUrl, sizes: '512x512', type: appIconType }],
        }
      : {
          icon: [
            { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
          apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
        },
  };

  metadata.openGraph = {
    type: 'website',
    url: canonicalUrl,
    title: openGraphTitle,
    description,
    siteName: openGraphSiteName,
    ...(ogImageUrl
      ? {
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: openGraphSiteName,
            },
          ],
        }
      : {}),
  };

  metadata.twitter = {
    card: ogImageUrl ? 'summary_large_image' : 'summary',
    title: openGraphTitle,
    description,
    ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
  };

  return metadata;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${manrope.className} home-apple antialiased bg-white text-[color:var(--ink)]`}>
        <LanguageProvider>
          <AuthProvider>
            <SocketProvider>
              {children}
              <PWARegister />
              <PWAInstallButton />
              <PWAInstallBanner />
            </SocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
