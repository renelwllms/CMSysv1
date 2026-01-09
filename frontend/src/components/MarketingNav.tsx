'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const navCopy = {
  en: {
    home: 'Home',
    whatIs: 'What is BrewPoint',
    features: 'Features',
    pricing: 'Pricing',
    about: 'About',
    services: 'Services',
    contact: 'Contact',
    login: 'Login',
  },
  id: {
    home: 'Beranda',
    whatIs: 'Apa itu BrewPoint',
    features: 'Fitur',
    pricing: 'Harga',
    about: 'Tentang',
    services: 'Layanan',
    contact: 'Kontak',
    login: 'Masuk',
  },
} as const;

const navItems = [
  { href: '/', key: 'home' as const },
  { href: '/what-is-brewpoint', key: 'whatIs' as const },
  { href: '/features', key: 'features' as const },
  { href: '/pricing', key: 'pricing' as const },
  { href: '/about', key: 'about' as const },
  { href: '/services', key: 'services' as const },
  { href: '/contact', key: 'contact' as const },
];

type MarketingNavProps = {
  variant?: 'default' | 'apple';
};

export default function MarketingNav({ variant = 'apple' }: MarketingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const isApple = variant === 'apple';

  const labels = navCopy[language] ?? navCopy.en;

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  const linkBase = 'text-sm font-medium';
  const linkActive = isApple ? 'text-[color:var(--accent)]' : 'text-indigo-600';
  const linkInactive = isApple
    ? 'text-[color:var(--muted)] hover:text-[color:var(--accent)]'
    : 'text-gray-700 hover:text-indigo-600';
  const loginButton = isApple
    ? 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-[color:var(--accent)] hover:bg-[color:var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--accent)]'
    : 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';
  const mobileActive = isApple
    ? 'text-[color:var(--accent)] bg-[color:var(--accent-soft)]'
    : 'text-indigo-600 bg-indigo-50';
  const mobileInactive = isApple
    ? 'text-[color:var(--muted)] hover:text-[color:var(--accent)] hover:bg-[color:var(--surface)]'
    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50';
  const mobileLogin = isApple
    ? 'block px-3 py-2 rounded-md text-base font-medium text-white bg-[color:var(--accent)] hover:bg-[color:var(--accent-strong)]'
    : 'block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700';

  return (
    <nav className={isApple ? 'border-b border-[color:var(--line)] bg-white/80 backdrop-blur' : 'border-b border-gray-200'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">BrewPoint</h1>
            </Link>
            <span className={isApple ? 'ml-2 text-sm text-[color:var(--muted)]' : 'ml-2 text-sm text-gray-500'}>
              by Edgepoint
            </span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`${linkBase} ${isActive(item.href) ? linkActive : linkInactive}`}
              >
                {labels[item.key]}
              </Link>
            ))}
            <div className="flex items-center bg-gray-100 rounded-lg px-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  language === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  language === 'id' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ID
              </button>
            </div>
            <Link
              href="/login"
              className={loginButton}
            >
              {labels.login}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={isApple
                ? 'inline-flex items-center justify-center p-2 rounded-md text-[color:var(--muted)] hover:text-[color:var(--accent)] hover:bg-[color:var(--surface)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[color:var(--accent)]'
                : 'inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
              }
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
        <div className={isApple ? 'md:hidden border-t border-[color:var(--line)] bg-white' : 'md:hidden border-t border-gray-100 bg-white'}>
          <div className="px-2 pt-3 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href) ? mobileActive : mobileInactive
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {labels[item.key]}
              </Link>
            ))}
            <div className="flex items-center space-x-2 px-3 py-2">
              <button
                onClick={() => {
                  setLanguage('en');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  language === 'en' ? 'bg-gray-900 text-white' : 'text-gray-700 bg-gray-100'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  setLanguage('id');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  language === 'id' ? 'bg-gray-900 text-white' : 'text-gray-700 bg-gray-100'
                }`}
              >
                ID
              </button>
            </div>
            <Link
              href="/login"
              className={mobileLogin}
              onClick={() => setMobileMenuOpen(false)}
            >
              {labels.login}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
