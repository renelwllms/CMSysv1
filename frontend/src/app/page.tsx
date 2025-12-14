'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [showContent, setShowContent] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const copy = {
    en: {
      nav: {
        features: 'Features',
        about: 'About',
        services: 'Services',
        contact: 'Contact',
        login: 'Login',
      },
      hero: {
        title1: 'Modern Cafe Management',
        title2: 'Made Simple',
        subtitle: 'Complete solution for managing your cafe operations. From QR code ordering to kitchen display systems, analytics, and more.',
        cta: 'Get Started',
        learnMore: 'Learn More',
      },
      sections: {
        features: 'Features',
        featuresHeadline: 'Everything you need to run your cafe',
        featuresSub: 'Powerful features designed specifically for the fast-paced cafe environment',
      },
    },
    id: {
      nav: {
        features: 'Fitur',
        about: 'Tentang',
        services: 'Layanan',
        contact: 'Kontak',
        login: 'Masuk',
      },
      hero: {
        title1: 'Manajemen Kafe Modern',
        title2: 'Jadi Sederhana',
        subtitle: 'Solusi lengkap untuk mengelola operasional kafe Anda. Dari pemesanan QR, layar dapur, analitik, dan lainnya.',
        cta: 'Mulai Sekarang',
        learnMore: 'Pelajari Lebih Lanjut',
      },
      sections: {
        features: 'Fitur',
        featuresHeadline: 'Semua yang Anda butuhkan untuk kafe Anda',
        featuresSub: 'Fitur kuat yang dirancang khusus untuk lingkungan kafe yang cepat',
      },
    },
  } as const;

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        setShowContent(true);
      }
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

  if (isLoading || !showContent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">BrewPoint</h1>
              <span className="ml-2 text-sm text-gray-500">by Edgepoint</span>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/features" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                {copy[language].nav.features}
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                {copy[language].nav.about}
              </Link>
              <Link href="/services" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                {copy[language].nav.services}
              </Link>
              <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                {copy[language].nav.contact}
              </Link>
              <div className="flex items-center bg-gray-100 rounded-lg px-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${language === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${language === 'id' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  ID
                </button>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {copy[language].nav.login}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {!mobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/features"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                {copy[language].nav.features}
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                {copy[language].nav.about}
              </Link>
              <Link
                href="/services"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                {copy[language].nav.services}
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                {copy[language].nav.contact}
              </Link>
              <div className="flex items-center space-x-2 px-3 py-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${language === 'en' ? 'bg-gray-900 text-white' : 'text-gray-700 bg-gray-100'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${language === 'id' ? 'bg-gray-900 text-white' : 'text-gray-700 bg-gray-100'}`}
                >
                  ID
                </button>
              </div>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {copy[language].nav.login}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">{copy[language].hero.title1}</span>
              <span className="block text-indigo-600">{copy[language].hero.title2}</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              {copy[language].hero.subtitle}
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  {copy[language].hero.cta}
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a
                  href="https://edgepoint.co.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  {copy[language].hero.learnMore}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">{copy[language].sections.features}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {copy[language].sections.featuresHeadline}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              {copy[language].sections.featuresSub}
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* NEW Feature 1 - Real-Time Order Tracking */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border-2 border-indigo-500 shadow-lg">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    ⏱️
                  </div>
                  <div className="mb-2 inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">NEW</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Real-Time Order Tracking</h3>
                  <p className="text-gray-500">
                    Keep track of every order from creation to completion with built-in timers showing exactly how long each order takes.
                  </p>
                </div>
              </div>

              {/* NEW Feature 2 - Kitchen Dashboard */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border-2 border-indigo-500 shadow-lg">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    👨‍🍳
                  </div>
                  <div className="mb-2 inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">NEW</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Kitchen Dashboard</h3>
                  <p className="text-gray-500">
                    Monitor all orders in one place. View active orders, completed orders, average cooking times, and wait times at a glance.
                  </p>
                </div>
              </div>

              {/* NEW Feature 3 - Powerful Analytics */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border-2 border-indigo-500 shadow-lg">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    📊
                  </div>
                  <div className="mb-2 inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">NEW</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Powerful Analytics</h3>
                  <p className="text-gray-500">
                    Understand your café's busiest times and table usage. Optimize staff assignments with data-driven insights.
                  </p>
                </div>
              </div>

              {/* NEW Feature 4 - Image Uploads */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border-2 border-indigo-500 shadow-lg">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    🖼️
                  </div>
                  <div className="mb-2 inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">NEW</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Menu Image Uploads</h3>
                  <p className="text-gray-500">
                    Easily upload images for each menu item. Showcase your dishes beautifully without relying on external links.
                  </p>
                </div>
              </div>

              {/* NEW Feature 5 - Flexible Settings */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border-2 border-indigo-500 shadow-lg">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    ⚙️
                  </div>
                  <div className="mb-2 inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">NEW</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Flexible Customization</h3>
                  <p className="text-gray-500">
                    Enable or disable features like cabinet foods with simple toggles. Customize menu categories to fit your needs.
                  </p>
                </div>
              </div>

              {/* NEW Feature 6 - Accurate Revenue */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border-2 border-indigo-500 shadow-lg">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    💰
                  </div>
                  <div className="mb-2 inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded">NEW</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Accurate Revenue Insights</h3>
                  <p className="text-gray-500">
                    Track total revenue and average order value with precision. Dashboard ensures figures are always accurate and neatly displayed.
                  </p>
                </div>
              </div>

              {/* Existing Feature 1 */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    📱
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code Ordering</h3>
                  <p className="text-gray-500">
                    Customers scan QR codes at tables to browse menu and place orders directly from their phones.
                  </p>
                </div>
              </div>

              {/* Existing Feature 2 */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    🪑
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Table Management</h3>
                  <p className="text-gray-500">
                    Manage tables, generate QR codes, and track table status. Streamline your seating and ordering workflow.
                  </p>
                </div>
              </div>

              {/* Existing Feature 3 */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    ⚡
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Real-Time Updates</h3>
                  <p className="text-gray-500">
                    WebSocket-powered real-time synchronization. Orders and updates appear instantly across all devices.
                  </p>
                </div>
              </div>

              {/* Existing Feature 4 */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    🔐
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Role-Based Access</h3>
                  <p className="text-gray-500">
                    Secure authentication with role-based permissions. Control what staff members can access and modify.
                  </p>
                </div>
              </div>

              {/* Existing Feature 5 */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    🌐
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Language Support</h3>
                  <p className="text-gray-500">
                    Built-in support for multiple languages including English and Indonesian.
                  </p>
                </div>
              </div>

              {/* Existing Feature 6 */}
              <div className="relative group">
                <div className="relative p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 rounded-md bg-indigo-500 text-white flex items-center justify-center text-2xl mb-4">
                    🎂
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Cake Orders Management</h3>
                  <p className="text-gray-500">
                    Special handling for cake orders with down payment tracking and pickup date scheduling.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/features"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
              >
                View All Features
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to transform your café's operations?</span>
            <span className="block text-indigo-200">Try BrewPoint today and see the difference!</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">BrewPoint</h3>
              <p className="text-gray-500 text-sm">
                Modern cafe management system designed for efficiency and simplicity.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-500 text-sm hover:text-indigo-600">Features</Link></li>
                <li><Link href="/login" className="text-gray-500 text-sm hover:text-indigo-600">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-500 text-sm hover:text-indigo-600">About Us</Link></li>
                <li><Link href="/services" className="text-gray-500 text-sm hover:text-indigo-600">Services</Link></li>
                <li><Link href="/contact" className="text-gray-500 text-sm hover:text-indigo-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Developer</h3>
              <p className="text-gray-500 text-sm mb-2">
                Developed by{' '}
                <a
                  href="https://edgepoint.co.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Edgepoint.co.nz
                </a>
              </p>
              <p className="text-gray-400 text-xs mt-4">
                © {new Date().getFullYear()} Edgepoint. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
