'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MarketingNav from '@/components/MarketingNav';
import { useLanguage } from '@/contexts/LanguageContext';

const content = {
  en: {
    hero: {
      label: 'BrewPoint features',
      title: 'Everything a cafe needs to run orders, menus, and service in one system.',
      subtitle: 'BrewPoint combines POS and QR ordering with real-time visibility so cafe owners can move faster and stay in control.',
      primaryCta: 'Book a demo',
      secondaryCta: 'View pricing',
    },
    summaryLabel: 'Quick feature summary',
    summary: [
      'Integrated POS for in-store orders',
      'QR code ordering for dine-in customers',
      'Centralized menu management',
      'Real-time order tracking',
      'Sales visibility dashboard',
      'Designed for small to mid-size cafes',
    ],
    modules: {
      label: 'Core product modules',
      title: 'POS, QR ordering, menu control, and visibility in one place.',
      subtitle: 'Each module is designed for cafe workflows and connects into a single order flow.',
      items: [
        {
          title: 'Menu Management',
          body: 'Manage menu items, pricing, and availability from one dashboard with updates synced to POS and QR ordering.',
          bullets: ['Bulk updates across categories', 'Instant sync to POS and QR menus', 'Availability toggles in one click'],
          image: '/features/menus.jpg',
          imageAlt: 'Menu management screen with item cards and pricing',
        },
        {
          title: 'Table Views & QR Ordering',
          body: 'Use the POS table view to track seating while QR ordering routes orders to the right table.',
          bullets: ['Live table status at a glance', 'QR ordering linked to table numbers', 'Fast table handoff for staff'],
          image: '/features/table-views.jpg',
          imageAlt: 'Table views dashboard showing table statuses',
        },
        {
          title: 'Kitchen Display',
          body: 'Route orders from POS and QR ordering to a clear kitchen display for faster prep.',
          bullets: ['Instant order routing', 'Stage-based order status', 'Busy-hour visibility'],
          image: '/features/kitchen-display.jpg',
          imageAlt: 'Kitchen display with live order queue',
        },
        {
          title: 'Roster Calendar',
          body: 'Plan shifts with a visual roster calendar so staffing matches demand.',
          bullets: ['Weekly and daily scheduling', 'Staff availability tracking', 'Quick shift adjustments'],
          image: '/features/roster-calendar.jpg',
          imageAlt: 'Roster calendar with staff shifts',
        },
      ],
    },
    cta: {
      title: 'See BrewPoint in action',
      body: 'Get a tailored walkthrough of POS, QR ordering, and menu control for your cafe.',
      primaryCta: 'Book a demo',
      secondaryCta: 'What is BrewPoint?',
    },
  },
  id: {
    hero: {
      label: 'Fitur BrewPoint',
      title: 'Semua yang dibutuhkan kafe untuk mengelola pesanan, menu, dan layanan dalam satu sistem.',
      subtitle: 'BrewPoint menggabungkan POS dan pemesanan QR dengan visibilitas real-time agar pemilik kafe bergerak lebih cepat dan tetap terkendali.',
      primaryCta: 'Jadwalkan demo',
      secondaryCta: 'Lihat harga',
    },
    summaryLabel: 'Ringkasan fitur utama',
    summary: [
      'POS terintegrasi untuk pesanan di tempat',
      'Pemesanan QR code untuk pelanggan dine-in',
      'Manajemen menu terpusat',
      'Pelacakan pesanan real-time',
      'Dashboard visibilitas penjualan',
      'Dirancang untuk kafe kecil hingga menengah',
    ],
    modules: {
      label: 'Modul produk inti',
      title: 'POS, pemesanan QR, kontrol menu, dan visibilitas dalam satu tempat.',
      subtitle: 'Setiap modul dirancang untuk alur kerja kafe dan terhubung dalam satu alur pesanan.',
      items: [
        {
          title: 'Manajemen Menu',
          body: 'Kelola item menu, harga, dan ketersediaan dari satu dashboard dengan pembaruan yang tersinkron ke POS dan pemesanan QR.',
          bullets: ['Update massal antar kategori', 'Sinkron instan ke POS dan menu QR', 'Ubah ketersediaan dengan satu klik'],
          image: '/features/menus.jpg',
          imageAlt: 'Layar manajemen menu dengan kartu item dan harga',
        },
        {
          title: 'Tampilan Meja & QR Ordering',
          body: 'Gunakan tampilan meja POS untuk memantau tempat duduk, sementara QR ordering mengarahkan pesanan ke meja yang tepat.',
          bullets: ['Status meja langsung terlihat', 'QR ordering terhubung ke nomor meja', 'Handoff meja cepat untuk staf'],
          image: '/features/table-views.jpg',
          imageAlt: 'Dashboard tampilan meja dengan status meja',
        },
        {
          title: 'Tampilan Dapur',
          body: 'Kirim pesanan dari POS dan QR ordering ke layar dapur yang jelas untuk persiapan lebih cepat.',
          bullets: ['Routing pesanan instan', 'Status pesanan bertahap', 'Visibilitas saat jam sibuk'],
          image: '/features/kitchen-display.jpg',
          imageAlt: 'Tampilan dapur dengan antrian pesanan',
        },
        {
          title: 'Kalender Roster',
          body: 'Rencanakan shift dengan kalender roster visual agar jumlah staf sesuai kebutuhan.',
          bullets: ['Penjadwalan harian dan mingguan', 'Pelacakan ketersediaan staf', 'Perubahan shift cepat'],
          image: '/features/roster-calendar.jpg',
          imageAlt: 'Kalender roster dengan jadwal shift staf',
        },
      ],
    },
    cta: {
      title: 'Lihat BrewPoint beraksi',
      body: 'Dapatkan walkthrough khusus POS, pemesanan QR, dan kontrol menu untuk kafe Anda.',
      primaryCta: 'Jadwalkan demo',
      secondaryCta: 'Apa itu BrewPoint?',
    },
  },
} as const;

export default function FeaturesContent() {
  const { language } = useLanguage();
  const t = content[language] ?? content.en;
  const [activeImage, setActiveImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (!activeImage) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImage]);

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
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
            >
              {t.hero.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{t.summaryLabel}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
              {t.summary.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 text-indigo-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{t.modules.label}</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">{t.modules.title}</h2>
            <p className="mt-4 text-gray-600">
              {t.modules.subtitle}
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {t.modules.items.map((module) => (
              <div key={module.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveImage({ src: module.image, alt: module.imageAlt })}
                  className="group relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] text-left focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                  aria-label={`Open ${module.title} image`}
                >
                  <Image
                    src={module.image}
                    alt={module.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 520px"
                    className="object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                  <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink)] shadow">
                    Click to zoom
                  </span>
                </button>
                <h2 className="text-xl font-semibold text-gray-900">{module.title}</h2>
                <p className="mt-3 text-sm text-gray-600">{module.body}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  {module.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 text-indigo-600">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900">{t.cta.title}</h2>
            <p className="mt-4 text-gray-600">
              {t.cta.body}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/contact?type=demo"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow hover:bg-indigo-700"
              >
                {t.cta.primaryCta}
              </Link>
              <Link
                href="/what-is-brewpoint"
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
              >
                {t.cta.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Feature image preview"
          onClick={() => setActiveImage(null)}
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute right-6 top-6 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink)] shadow"
          >
            Close
          </button>
          <div
            className="relative max-h-[85vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              width={1600}
              height={1000}
              sizes="100vw"
              className="h-auto w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
