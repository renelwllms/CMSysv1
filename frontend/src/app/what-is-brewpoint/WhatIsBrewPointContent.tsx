'use client';

import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { useLanguage } from '@/contexts/LanguageContext';

const content = {
  en: {
    hero: {
      label: 'What is BrewPoint?',
      title: 'BrewPoint is an all-in-one cafe management platform built for point-of-sale (POS), QR ordering, and daily operations.',
      subtitle: 'BrewPoint helps cafe owners manage orders, payments, menus, and operations efficiently using POS and QR code technology.',
      primaryCta: 'Book a demo',
      secondaryCta: 'Explore features',
    },
    sections: {
      whatIsTitle: 'What is BrewPoint?',
      whatIsBody: 'BrewPoint is an all-in-one cafe management platform designed to help cafe owners manage orders, payments, menus, and operations efficiently using point-of-sale (POS) and QR code technology.',
      whoTitle: 'Who is BrewPoint for?',
      whoBody: 'BrewPoint is built for cafes that want a modern, easy-to-run system without enterprise complexity.',
      problemsTitle: 'What problems does BrewPoint solve?',
      howTitle: 'How does BrewPoint work?',
    },
    whoFor: [
      'Independent cafe owners',
      'Coffee shops and small restaurants',
      'Takeaway cafes',
      'Cafes that want QR ordering without enterprise POS costs',
    ],
    problemsSolved: [
      'Reduces queue congestion at the counter',
      'Eliminates manual order errors',
      'Simplifies menu updates',
      'Improves the customer ordering experience',
      'Gives owners real-time visibility into sales',
    ],
    howItWorks: [
      'Cafe sets up their menu in BrewPoint.',
      'QR codes are placed on tables or counters.',
      'Customers scan and place orders.',
      'Orders appear instantly in the system.',
      'Staff prepare and complete orders.',
      'Owners monitor sales and operations in real time.',
    ],
    cta: {
      title: 'Ready to see BrewPoint live?',
      body: 'We will walk you through POS, QR ordering, and menu control in a quick demo.',
      primaryCta: 'Book a demo',
      secondaryCta: 'View pricing',
    },
  },
  id: {
    hero: {
      label: 'Apa itu BrewPoint?',
      title: 'BrewPoint adalah platform manajemen kafe all-in-one yang dibuat untuk point-of-sale (POS), pemesanan QR, dan operasional harian.',
      subtitle: 'BrewPoint membantu pemilik kafe mengelola pesanan, pembayaran, menu, dan operasional secara efisien menggunakan teknologi POS dan QR code.',
      primaryCta: 'Jadwalkan demo',
      secondaryCta: 'Lihat fitur',
    },
    sections: {
      whatIsTitle: 'Apa itu BrewPoint?',
      whatIsBody: 'BrewPoint adalah platform manajemen kafe all-in-one yang dirancang untuk membantu pemilik kafe mengelola pesanan, pembayaran, menu, dan operasional secara efisien menggunakan teknologi point-of-sale (POS) dan QR code.',
      whoTitle: 'Siapa BrewPoint untuk?',
      whoBody: 'BrewPoint dibuat untuk kafe yang menginginkan sistem modern yang mudah dijalankan tanpa kompleksitas enterprise.',
      problemsTitle: 'Masalah apa yang diselesaikan BrewPoint?',
      howTitle: 'Bagaimana BrewPoint bekerja?',
    },
    whoFor: [
      'Pemilik kafe independen',
      'Kedai kopi dan restoran kecil',
      'Kafe takeaway',
      'Kafe yang ingin pemesanan QR tanpa biaya POS enterprise',
    ],
    problemsSolved: [
      'Mengurangi antrean di kasir',
      'Menghilangkan kesalahan pesanan manual',
      'Menyederhanakan pembaruan menu',
      'Meningkatkan pengalaman pelanggan saat memesan',
      'Memberi pemilik visibilitas penjualan secara real-time',
    ],
    howItWorks: [
      'Kafe menyiapkan menu di BrewPoint.',
      'QR code ditempatkan di meja atau counter.',
      'Pelanggan memindai dan memesan.',
      'Pesanan langsung muncul di sistem.',
      'Staf menyiapkan dan menyelesaikan pesanan.',
      'Pemilik memantau penjualan dan operasional secara real-time.',
    ],
    cta: {
      title: 'Siap melihat BrewPoint secara langsung?',
      body: 'Kami akan menunjukkan POS, pemesanan QR, dan kontrol menu dalam demo singkat.',
      primaryCta: 'Jadwalkan demo',
      secondaryCta: 'Lihat harga',
    },
  },
} as const;

export default function WhatIsBrewPointContent() {
  const { language } = useLanguage();
  const t = content[language] ?? content.en;

  return (
    <div className="home-apple min-h-screen bg-white text-[color:var(--ink)]">
      <MarketingNav />

      <section className="bg-gradient-to-br from-indigo-50 via-white to-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{t.hero.label}</p>
          <h1 className="mt-3 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contact?type=demo"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow hover:bg-indigo-700"
            >
              {t.hero.primaryCta}
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              {t.hero.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">{t.sections.whatIsTitle}</h2>
            <p className="mt-4 text-gray-600">
              {t.sections.whatIsBody}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">{t.sections.whoTitle}</h2>
          <p className="mt-4 text-gray-600">
            {t.sections.whoBody}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
            {t.whoFor.map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white p-4">
                <span className="mt-1 text-indigo-600">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">{t.sections.problemsTitle}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
            {t.problemsSolved.map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <span className="mt-1 text-indigo-600">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">{t.sections.howTitle}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 text-sm text-gray-700">
            {t.howItWorks.map((step, index) => (
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
              href="/contact?type=demo"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow hover:bg-indigo-700"
            >
              {t.cta.primaryCta}
            </Link>
            <Link
              href="/pricing"
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
