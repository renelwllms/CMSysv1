'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Manrope } from 'next/font/google';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import MarketingNav from '@/components/MarketingNav';
import { faqItems } from './home-schema';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function HomeContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  const copy = {
    en: {
      hero: {
        title: 'BrewPoint is a café management system with POS and QR ordering.',
        subtitle: 'Run faster service, reduce order mistakes, and manage your café in real time from one simple platform.',
        primaryCta: 'Book a Demo',
        secondaryCta: 'See How QR Ordering Works',
        trustLine: 'Built for small to mid-size cafes. Fast setup. Simple training.',
      },
      sectionLabels: {
        summary: 'Quick feature summary',
        outcomes: 'Everything you need to run a cafe without the complexity.',
        modules: 'Product modules',
        how: 'How BrewPoint works',
        useCases: 'Built for cafes like yours',
        why: 'Why choose BrewPoint?',
        pricing: 'BrewPoint pricing',
        faq: 'Frequently asked questions',
        cta: 'Ready to run a smoother cafe?',
      },
    },
    id: {
      hero: {
        title: 'BrewPoint adalah sistem manajemen kafe dengan POS dan pemesanan QR.',
        subtitle: 'Jalankan layanan lebih cepat, kurangi kesalahan pesanan, dan kelola kafe secara real-time dari satu platform sederhana.',
        primaryCta: 'Jadwalkan Demo',
        secondaryCta: 'Lihat Cara Kerja QR Order',
        trustLine: 'Dirancang untuk kafe kecil hingga menengah. Setup cepat. Training singkat.',
      },
      sectionLabels: {
        summary: 'Ringkasan fitur utama',
        outcomes: 'Semua yang dibutuhkan kafe tanpa kompleksitas.',
        modules: 'Modul produk',
        how: 'Cara kerja BrewPoint',
        useCases: 'Cocok untuk kafe seperti Anda',
        why: 'Kenapa memilih BrewPoint?',
        pricing: 'Harga BrewPoint',
        faq: 'Pertanyaan yang sering ditanyakan',
        cta: 'Siap menjalankan kafe lebih rapi?',
      },
    },
  } as const;

  const t = copy[language] ?? copy.en;

  const heroHighlights = [
    {
      title: 'POS + QR ordering',
      body: 'One flow for counter and table service.',
    },
    {
      title: 'Real-time operations',
      body: 'Live orders and sales visibility while you work.',
    },
    {
      title: 'Menu control',
      body: 'Update items once, everywhere, instantly.',
    },
  ];

  const quickFeatures = [
    'Integrated POS system for in-store orders',
    'QR code ordering for dine-in customers',
    'Centralized menu management',
    'Real-time order tracking',
    'Sales and order visibility dashboard',
    'Designed for small to mid-size cafes',
  ];

  const outcomeTiles = [
    {
      title: 'Faster Service',
      body: 'QR ordering reduces queues and speeds up table ordering.',
    },
    {
      title: 'Fewer Mistakes',
      body: 'Orders flow clearly from customer to kitchen to completion.',
    },
    {
      title: 'Real-Time Visibility',
      body: 'See orders and sales as they happen.',
    },
    {
      title: 'Menu Control',
      body: 'Update items and pricing instantly.',
    },
    {
      title: 'One System',
      body: 'POS, QR ordering, and operations in one platform.',
    },
  ];

  const modules = [
    {
      id: 'pos',
      title: 'POS that stays out of the way.',
      body: 'BrewPoint includes an in-store POS designed for speed, accuracy, and easy staff training.',
      bullets: ['In-store order processing', 'Clear order flow for staff', 'Simple day-to-day operation'],
    },
    {
      id: 'qr-ordering',
      title: 'Customers order from the table, no app needed.',
      body: 'Guests scan a QR code, place an order, and your staff receives it instantly.',
      bullets: ['Browser-based ordering', 'Reduced counter congestion', 'Better table turnover'],
    },
    {
      id: 'menu',
      title: 'Update your menu in seconds.',
      body: 'Make changes once and updates apply across POS and QR ordering immediately.',
      bullets: ['Centralized menu control', 'Real-time price and availability updates', 'No reprints required'],
    },
    {
      id: 'visibility',
      title: 'Real-time clarity during busy hours.',
      body: 'Track incoming orders, manage status, and keep the team aligned.',
      bullets: ['Live order visibility', 'Clear status handling', 'Operational transparency'],
    },
  ];

  const howSteps = [
    'Set up your menu in BrewPoint.',
    'Place BrewPoint QR codes on tables or at the counter.',
    'Customers scan and order from their phone.',
    'Orders appear instantly for staff.',
    'Staff prepare and complete orders.',
    'Owners track sales and performance in real time.',
  ];

  const useCases = [
    'Small cafes that want an affordable, simple POS plus QR ordering system.',
    'Busy coffee shops that need faster ordering without extra staff.',
    'Takeaway and dine-in cafes that want one consistent workflow.',
    'Modern cafes that want contactless ordering without building an app.',
  ];

  const whyChoose = [
    'Designed specifically for cafes.',
    'POS and QR ordering in one system.',
    'No unnecessary enterprise complexity.',
    'Built with real cafe workflows in mind.',
  ];

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Light geo/browser-based detection; respects any previously chosen language in localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) return;

    const chooseId = () => setLanguage('id');
    const chooseEn = () => setLanguage('en');

    const browserLang = navigator.language?.toLowerCase() || '';
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.toLowerCase() || '';
    if (browserLang.startsWith('id') || timeZone.includes('jakarta') || timeZone.includes('makassar') || timeZone.includes('pontianak')) {
      chooseId();
      return;
    }

    // IP-based fallback
    const controller = new AbortController();
    const geoUrl = process.env.NEXT_PUBLIC_GEOLOOKUP_URL || 'https://ipapi.co/json/';
    fetch(geoUrl, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data) {
          chooseEn();
          return;
        }
        const country = (data.country || data.country_code || '').toString().toLowerCase();
        if (country === 'id' || country === 'indo' || country === 'idn') {
          chooseId();
        } else {
          chooseEn();
        }
      })
      .catch(() => {
        chooseEn();
      });

    return () => controller.abort();
  }, [setLanguage]);

  return (
    <div className={`home-apple min-h-screen bg-white text-[color:var(--ink)] ${manrope.className}`}>
      <MarketingNav variant="apple" />

      <section className="relative overflow-hidden bg-[color:var(--surface)]">
        <div className="absolute inset-0">
          <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.25),transparent_70%)] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.15),transparent_70%)] blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="space-y-6">
              <p className="reveal text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">BrewPoint</p>
              <h1 className="reveal reveal-delay-1 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[color:var(--ink)]">
                {t.hero.title}
              </h1>
              <p className="reveal reveal-delay-2 text-lg text-[color:var(--muted)] max-w-xl">
                {t.hero.subtitle}
              </p>
              <div className="reveal reveal-delay-3 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact?type=demo"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,118,110,0.35)] transition hover:bg-[color:var(--accent-strong)]"
                >
                  {t.hero.primaryCta}
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white/80 px-7 py-3 text-sm font-semibold text-[color:var(--ink)] shadow-sm transition hover:bg-white"
                >
                  {t.hero.secondaryCta}
                </Link>
              </div>
              <p className="reveal reveal-delay-3 text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
                {t.hero.trustLine}
              </p>
            </div>
            <div className="relative">
              <div className="reveal reveal-delay-2 relative aspect-[4/5] overflow-hidden rounded-[32px] border border-white/70 shadow-[0_35px_80px_rgba(15,23,42,0.18)]">
                <Image
                  src="/home/cafe-interior.jpg"
                  alt="Bright modern cafe interior"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              </div>
              <div className="reveal reveal-delay-3 float-soft absolute bottom-0 left-0 w-[78%] rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.2)] backdrop-blur sm:-bottom-10 sm:-left-6 sm:w-[72%] lg:-left-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[color:var(--muted)]">POS Console</p>
                <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl border border-[color:var(--line)]">
                  <Image
                    src="/home/pos-screen.jpg"
                    alt="BrewPoint POS console"
                    fill
                    sizes="(max-width: 1024px) 80vw, 360px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {heroHighlights.map((item) => (
              <div
                key={item.title}
                className="reveal reveal-delay-2 rounded-2xl border border-[color:var(--line)] bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-[color:var(--ink)]">{item.title}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-[28px] border border-[color:var(--line)]">
              <Image
                src="/home/espresso-bar.jpg"
                alt="Cafe espresso bar with POS station"
                width={960}
                height={720}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em]">Counter flow</p>
                <h3 className="mt-2 text-2xl font-semibold">Speed that matches the bar.</h3>
                <p className="mt-2 text-sm text-white/80">Fast ordering, clear handoff, and minimal taps for staff.</p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[28px] border border-[color:var(--line)]">
              <Image
                src="/home/cafe-table.jpg"
                alt="Cafe table setup with QR ordering"
                width={960}
                height={720}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em]">Dining room</p>
                <h3 className="mt-2 text-2xl font-semibold">Table-side ordering that feels natural.</h3>
                <p className="mt-2 text-sm text-white/80">Guests scan, order, and relax while your team stays focused.</p>
              </div>
            </div>
          </div>
          <div className="mt-10 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface)] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--muted)]">{t.sectionLabels.summary}</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 text-sm text-[color:var(--muted)]">
              {quickFeatures.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[color:var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div>
              <h2 className="text-3xl font-semibold text-[color:var(--ink)]">{t.sectionLabels.outcomes}</h2>
              <p className="mt-4 text-sm text-[color:var(--muted)]">
                Track orders, customer history, and performance while staying calm through the rush.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {outcomeTiles.map((tile) => (
                  <div key={tile.title} className="rounded-2xl border border-[color:var(--line)] bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-[color:var(--ink)]">{tile.title}</h3>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">{tile.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-10 -right-6 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.2),transparent_70%)] blur-2xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.16)]">
                <Image
                  src="/home/dashboard.jpg"
                  alt="BrewPoint dashboard overview"
                  width={1200}
                  height={760}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--muted)]">{t.sectionLabels.modules}</p>
            <h2 className="mt-3 text-3xl font-semibold text-[color:var(--ink)]">POS, QR ordering, menu control, and visibility in one place.</h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {modules.map((module) => (
              <div key={module.id} className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface)] p-7 shadow-sm">
                <h3 className="text-xl font-semibold text-[color:var(--ink)]">{module.title}</h3>
                <p className="mt-3 text-sm text-[color:var(--muted)]">{module.body}</p>
                <ul className="mt-5 space-y-2 text-sm text-[color:var(--muted)]">
                  {module.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--accent)]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-[color:var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-[color:var(--ink)]">{t.sectionLabels.how}</h2>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm text-[color:var(--muted)]">
            {howSteps.map((step, index) => (
              <li key={step} className="rounded-[24px] border border-[color:var(--line)] bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-xs font-semibold text-[color:var(--accent-strong)]">
                  {index + 1}
                </div>
                <p className="mt-3 font-medium text-[color:var(--ink)]">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-[color:var(--ink)]">{t.sectionLabels.useCases}</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {useCases.map((item) => (
              <div key={item} className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 text-sm text-[color:var(--muted)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[color:var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-[color:var(--ink)]">{t.sectionLabels.why}</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm text-[color:var(--muted)]">
            {whyChoose.map((item) => (
              <div key={item} className="rounded-[20px] border border-[color:var(--line)] bg-white p-4">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-[#0b0b0d]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">{t.sectionLabels.pricing}</h2>
            <p className="mt-4 text-white/70">
              Pricing depends on cafe size and requirements. We will recommend the best setup after a quick call.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0b0b0d]"
              >
                Request Pricing
              </Link>
              <Link
                href="/contact?type=demo"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white"
              >
                Book a Demo
              </Link>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/50">No pressure. Clear answers. Quick setup.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-[color:var(--ink)]">{t.sectionLabels.faq}</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {faqItems.map((item) => (
              <div key={item.question} className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
                <p className="text-sm font-semibold text-[color:var(--ink)]">{item.question}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.22),transparent_60%)]">
        <div className="max-w-6xl mx-auto py-14 px-4 sm:px-6 lg:py-20 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--ink)] sm:text-4xl">
              {t.sectionLabels.cta}
            </h2>
            <p className="mt-3 text-base text-[color:var(--muted)]">
              See BrewPoint in action and get a setup plan tailored to your cafe.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-shrink-0">
            <Link
              href="/contact?type=demo"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,118,110,0.25)]"
            >
              Book a Demo
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--ink)]"
            >
              Request Pricing
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-[color:var(--line)]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[color:var(--ink)] mb-4">BrewPoint</h3>
              <p className="text-[color:var(--muted)] text-sm">
                BrewPoint is a modern cafe management system that combines POS and QR code ordering to help cafe owners operate efficiently, serve customers faster, and manage their business in real time.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[color:var(--ink)] tracking-[0.3em] uppercase mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/what-is-brewpoint" className="text-[color:var(--muted)] text-sm hover:text-[color:var(--accent)]">What is BrewPoint</Link></li>
                <li><Link href="/features" className="text-[color:var(--muted)] text-sm hover:text-[color:var(--accent)]">Features</Link></li>
                <li><Link href="/pricing" className="text-[color:var(--muted)] text-sm hover:text-[color:var(--accent)]">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[color:var(--ink)] tracking-[0.3em] uppercase mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-[color:var(--muted)] text-sm hover:text-[color:var(--accent)]">About Us</Link></li>
                <li><Link href="/services" className="text-[color:var(--muted)] text-sm hover:text-[color:var(--accent)]">Services</Link></li>
                <li><Link href="/contact" className="text-[color:var(--muted)] text-sm hover:text-[color:var(--accent)]">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[color:var(--ink)] tracking-[0.3em] uppercase mb-4">Developer</h3>
              <p className="text-[color:var(--muted)] text-sm mb-2">
                Developed by{' '}
                <a
                  href="https://edgepoint.co.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--accent)] hover:text-[color:var(--accent-strong)] font-medium"
                >
                  Edgepoint.co.nz
                </a>
              </p>
              <p className="text-[color:var(--muted)] text-xs mt-4">
                © {new Date().getFullYear()} Edgepoint. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
