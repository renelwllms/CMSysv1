import Script from 'next/script';
import HomeContent from './HomeContent';
import { faqSchema, softwareSchema } from './home-schema';

export const metadata = {
  title: 'BrewPoint | POS & QR Ordering Café Management System',
  description: 'BrewPoint is a modern cafe management platform with POS and QR ordering. Streamline cafe operations, reduce errors, and serve customers faster. Book a demo.',
  alternates: {
    canonical: 'https://cms.edgepoint.co.nz/',
  },
};

export default function HomePage() {
  return (
    <>
      <Script
        id="brewpoint-software-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <Script
        id="brewpoint-faq-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeContent />
    </>
  );
}
