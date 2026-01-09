export const faqItems = [
  {
    question: 'What is BrewPoint used for?',
    answer: 'BrewPoint is used by cafe owners to manage POS, QR ordering, menu control, and operations in one system.',
  },
  {
    question: 'Does BrewPoint include a POS system?',
    answer: 'Yes. BrewPoint includes a built-in POS for in-store order processing.',
  },
  {
    question: 'Do customers need to install an app?',
    answer: 'No. Customers scan a QR code and order directly from their phone browser.',
  },
  {
    question: 'Is BrewPoint suitable for small cafes?',
    answer: 'Yes. BrewPoint is designed for small to mid-size cafes that want a modern system without enterprise complexity.',
  },
  {
    question: 'Can I update menu prices and availability anytime?',
    answer: 'Yes. Menu changes update instantly across POS and QR ordering.',
  },
] as const;

export const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BrewPoint',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'BrewPoint is a cafe management system combining POS and QR ordering in one platform for cafe owners.',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'NZD',
    price: 'Contact for pricing',
  },
} as const;

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
} as const;
