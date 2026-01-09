'use client';

import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { useLanguage } from '@/contexts/LanguageContext';

const content = {
  en: {
    hero: {
      label: 'Pricing',
      title: 'Simple pricing that fits your cafe',
      subtitle: 'BrewPoint pricing is flexible and based on cafe size, ordering volume, and required modules.',
      primaryCta: 'Request pricing',
      secondaryCta: 'Book a demo',
      micro: 'No pressure. Clear answers. Quick setup.',
    },
    includesTitle: 'What pricing includes',
    includes: [
      'POS and QR code ordering in one system',
      'Menu management with real-time updates',
      'Live order and sales visibility',
      'Setup guidance for your team',
      'Ongoing support from the BrewPoint team',
    ],
    stepsTitle: 'How pricing works',
    steps: [
      'Tell us about your cafe size and workflow.',
      'We recommend the best setup for your needs.',
      'Go live with fast onboarding and training.',
    ],
    cta: {
      title: 'Get a pricing plan built for your cafe',
      body: 'We will recommend the right setup after a short call.',
      primaryCta: 'Request pricing',
      secondaryCta: 'Review features',
    },
  },
  id: {
    hero: {
      label: 'Harga',
      title: 'Harga sederhana yang sesuai untuk kafe Anda',
      subtitle: 'Harga BrewPoint fleksibel dan disesuaikan dengan ukuran kafe, volume pesanan, dan modul yang dibutuhkan.',
      primaryCta: 'Minta harga',
      secondaryCta: 'Jadwalkan demo',
      micro: 'Tanpa tekanan. Jawaban jelas. Setup cepat.',
    },
    includesTitle: 'Apa yang termasuk dalam harga',
    includes: [
      'POS dan pemesanan QR code dalam satu sistem',
      'Manajemen menu dengan pembaruan real-time',
      'Visibilitas pesanan dan penjualan secara langsung',
      'Panduan setup untuk tim Anda',
      'Dukungan berkelanjutan dari tim BrewPoint',
    ],
    stepsTitle: 'Bagaimana penetapan harga bekerja',
    steps: [
      'Ceritakan ukuran kafe dan alur kerja Anda.',
      'Kami rekomendasikan setup terbaik untuk kebutuhan Anda.',
      'Mulai operasional dengan onboarding dan pelatihan cepat.',
    ],
    cta: {
      title: 'Dapatkan paket harga untuk kafe Anda',
      body: 'Kami akan merekomendasikan setup yang tepat setelah panggilan singkat.',
      primaryCta: 'Minta harga',
      secondaryCta: 'Tinjau fitur',
    },
  },
} as const;

export default function PricingContent() {
  const { language } = useLanguage();
  const t = content[language] ?? content.en;

  return (
    <div className="home-apple min-h-screen bg-white text-[color:var(--ink)]">
      <MarketingNav />

      <section className="bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-300">{t.hero.label}</p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{t.hero.title}</h1>
          <p className="mt-6 text-lg text-indigo-100 max-w-3xl mx-auto">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contact?type=pricing"
              className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-base font-medium text-gray-900 shadow"
            >
              {t.hero.primaryCta}
            </Link>
            <Link
              href="/contact?type=demo"
              className="inline-flex items-center justify-center rounded-md border border-white/40 px-8 py-3 text-base font-medium text-white"
            >
              {t.hero.secondaryCta}
            </Link>
          </div>
          <p className="mt-4 text-xs uppercase tracking-widest text-indigo-200">{t.hero.micro}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">{t.includesTitle}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
              {t.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <span className="mt-1 text-indigo-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">{t.stepsTitle}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3 text-sm text-gray-700">
            {t.steps.map((step, index) => (
              <li key={step} className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Step {index + 1}</p>
                <p className="mt-2 font-medium text-gray-900">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{t.cta.title}</h2>
          <p className="mt-4 text-gray-600">{t.cta.body}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contact?type=pricing"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow hover:bg-indigo-700"
            >
              {t.cta.primaryCta}
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              {t.cta.secondaryCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
