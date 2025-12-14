'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/currency';
import { tenantHeaders } from '@/lib/tenant';

export default function FeaturesPage() {
  const [currency, setCurrency] = useState<string>('IDR');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/settings`, { headers: tenantHeaders() });
      if (response.ok) {
        const data = await response.json();
        setCurrency(data.currency || 'IDR');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">BrewPoint</h1>
              </Link>
              <span className="ml-2 text-sm text-gray-500">by Edgepoint</span>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/features" className="text-sm font-medium text-indigo-600">
                Features
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                About
              </Link>
              <Link href="/services" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                Services
              </Link>
              <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                Contact
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Login
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
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 bg-indigo-50"
              >
                Features
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                About
              </Link>
              <Link
                href="/services"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                Services
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Powerful Features for Modern Cafés
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to streamline operations, delight customers, and grow your business.
            </p>
          </div>
        </div>
      </section>

      {/* Features Detail Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Feature 1: Real-Time Order Tracking */}
          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              <div>
                <div className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
                  NEW FEATURE
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                  Real-Time Order Tracking
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Keep track of every order from creation to completion. Our built-in timer shows exactly how long each order takes and helps your kitchen stay on top of timing.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Live countdown timers on each order</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Track preparation and cooking durations separately</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Historical data stored for performance analysis</span>
                  </li>
                </ul>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
                  <div className="text-6xl mb-4">⏱️</div>
                  <div className="text-2xl font-bold mb-2">Average Order Time</div>
                  <div className="text-5xl font-extrabold">12:45</div>
                  <div className="mt-6 space-y-2 text-sm opacity-90">
                    <div className="flex justify-between">
                      <span>Preparation:</span>
                      <span className="font-semibold">4:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cooking:</span>
                      <span className="font-semibold">8:15</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Detailed Kitchen Dashboard */}
          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              <div className="order-2 lg:order-1 mt-10 lg:mt-0">
                <div className="bg-gray-900 rounded-lg p-8 text-white">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800 rounded p-4">
                      <div className="text-xs text-gray-400 uppercase mb-1">Today</div>
                      <div className="text-2xl font-bold">45</div>
                      <div className="text-xs text-gray-400">Orders</div>
                    </div>
                    <div className="bg-gray-800 rounded p-4">
                      <div className="text-xs text-gray-400 uppercase mb-1">This Month</div>
                      <div className="text-2xl font-bold">1,234</div>
                      <div className="text-xs text-gray-400">Orders</div>
                    </div>
                    <div className="bg-gray-800 rounded p-4">
                      <div className="text-xs text-green-400 uppercase mb-1">Avg Cook</div>
                      <div className="text-2xl font-bold text-green-400">15m</div>
                      <div className="text-xs text-gray-400">Time</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">Active Orders: 8</div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
                  NEW FEATURE
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                  Detailed Kitchen Dashboard
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Monitor all your orders in one place. View active orders, completed orders for today, this month, and last month. See average cooking times and wait times at a glance.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Real-time order status updates</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Performance metrics visible to kitchen staff</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Historical completion tracking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3: Powerful Analytics */}
          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              <div>
                <div className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
                  NEW FEATURE
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                  Powerful Analytics
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Understand your café's busiest times and table usage with our in-depth analytics. Find out which hours are peak periods and which tables are the most popular, so you can make efficient staff assignments.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Busiest time of day analysis</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Table usage statistics</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Revenue trends and insights</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Popular menu items tracking</span>
                  </li>
                </ul>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Busiest Hours</h3>
                  <div className="space-y-3">
                    {[
                      { time: '12:00 PM', orders: 45, percent: 100 },
                      { time: '1:00 PM', orders: 38, percent: 84 },
                      { time: '6:00 PM', orders: 32, percent: 71 },
                      { time: '7:00 PM', orders: 28, percent: 62 },
                    ].map((hour, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{hour.time}</span>
                          <span className="text-gray-600">{hour.orders} orders</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${hour.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Menu Image Uploads */}
          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              <div className="order-2 lg:order-1 mt-10 lg:mt-0">
                <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg p-8 text-white shadow-xl">
                  <div className="mb-6">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold mb-6">Upload & Showcase</div>
                  <div className="bg-white/30 backdrop-blur rounded-lg p-5 border border-white/40 space-y-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Drag and drop interface</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">5MB file size limit</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Auto-optimization</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
                  NEW FEATURE
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                  Menu Management with Image Uploads
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Easily upload images for each menu item. No more relying on links—just drag, drop, and showcase your dishes beautifully.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Direct image uploads from your device</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Secure file storage on server</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Image validation and format checking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 5: Flexible Settings */}
          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              <div>
                <div className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
                  NEW FEATURE
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                  Flexible Settings and Customization
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Enable or disable features like cabinet foods with a simple toggle. Customize your menu categories and let customers order exactly how they want.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Toggle cabinet foods on/off</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Configure auto-clearing for unpaid orders</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Set down payment percentages for cake orders</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Customize tax and service charge rates</span>
                  </li>
                </ul>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                      <div>
                        <div className="font-semibold text-gray-900">Enable Cabinet Foods</div>
                        <div className="text-sm text-gray-500">Allow customers to order cabinet items</div>
                      </div>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                      <div>
                        <div className="font-semibold text-gray-900">Multi-Language</div>
                        <div className="text-sm text-gray-500">English & Indonesian support</div>
                      </div>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                      <div>
                        <div className="font-semibold text-gray-900">Auto-Clear Orders</div>
                        <div className="text-sm text-gray-500">Clear unpaid orders automatically</div>
                      </div>
                      <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 6: Accurate Revenue */}
          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              <div className="order-2 lg:order-1 mt-10 lg:mt-0">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg p-8 text-white shadow-xl">
                  <div className="mb-6">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold mb-6">Revenue Insights</div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/30 backdrop-blur rounded-lg p-4 border border-white/40">
                      <div className="text-sm font-medium mb-2">Total Revenue</div>
                      <div className="text-2xl font-bold">{formatCurrency(12500000, currency)}</div>
                    </div>
                    <div className="bg-white/30 backdrop-blur rounded-lg p-4 border border-white/40">
                      <div className="text-sm font-medium mb-2">Average Order Value</div>
                      <div className="text-2xl font-bold">{formatCurrency(85000, currency)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
                  NEW FEATURE
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                  Accurate Revenue and Order Insights
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Track your total revenue and average order value with precision. Our improved dashboard ensures figures are always accurate and neatly displayed.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Real-time revenue calculations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Fixed overflow issues for large numbers</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Period-based revenue tracking (today, week, month)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Existing Features Grid */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 mt-20">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
              Core Platform Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">QR Code Ordering</h3>
                <p className="text-gray-600">
                  Customers scan table QR codes to browse your menu and place orders directly from their phones.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">🪑</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Table Management</h3>
                <p className="text-gray-600">
                  Manage tables, generate QR codes, track status, and streamline your seating workflow.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Updates</h3>
                <p className="text-gray-600">
                  WebSocket-powered synchronization means orders and updates appear instantly on all devices.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Role-Based Access</h3>
                <p className="text-gray-600">
                  Secure authentication with role-based permissions for admins, staff, and kitchen users.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Language</h3>
                <p className="text-gray-600">
                  Built-in support for English and Indonesian with easy language switching.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">🎂</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cake Orders</h3>
                <p className="text-gray-600">
                  Special handling for cake orders with down payment tracking and pickup scheduling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to transform your café's operations?
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Try BrewPoint today and see the difference!
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
            >
              Get Started
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-indigo-600"
            >
              Contact Us
            </Link>
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
