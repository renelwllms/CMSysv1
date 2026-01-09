import type { MetadataRoute } from 'next';
import { tenantHeaders } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

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
      cache: 'no-store',
      headers: tenantHeaders(),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch settings for manifest:', error);
  }
  return null;
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const baseUrl = apiUrl.replace('/api', '');
  const themeColor = settings?.themeColor || '#111827';
  const appIconUrl = settings?.appIconUrl ? `${baseUrl}${settings.appIconUrl}` : null;
  const appIconType = appIconUrl ? getImageMimeType(appIconUrl) : 'image/png';

  const icons: NonNullable<MetadataRoute.Manifest['icons']> = appIconUrl
    ? [
        { src: appIconUrl, sizes: '192x192', type: appIconType },
        { src: appIconUrl, sizes: '512x512', type: appIconType, purpose: 'maskable' },
      ]
    : [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ];

  return {
    name: settings?.businessName || 'BrewPoint Cafe Management',
    short_name: settings?.businessName || 'BrewPoint',
    description: 'Complete cafe management solution with QR ordering',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: themeColor,
    theme_color: themeColor,
    icons,
  };
}
