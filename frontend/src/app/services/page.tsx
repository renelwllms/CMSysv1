'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ServicesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <Link href="/features" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                Features
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                About
              </Link>
              <Link href="/services" className="text-sm font-medium text-indigo-600">
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
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
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
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 bg-indigo-50"
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
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
              Our Services
            </h1>
            <p className="mt-6 text-xl text-indigo-200 max-w-3xl mx-auto">
              Comprehensive IT solutions and custom software development by Edgepoint
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Smart. Flexible. Beautiful Solutions.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Edgepoint provides a full range of IT services to businesses across New Zealand and beyond.
            </p>
          </div>

          {/* Service 1: BrewPoint Cafe Management */}
          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <div className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
                  FLAGSHIP PRODUCT
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                  BrewPoint - Cafe Management System
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Our flagship hospitality solution designed specifically for cafés, restaurants, and food service businesses. BrewPoint combines modern technology with user-friendly design to streamline your entire operation.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Complete order management and kitchen display</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">QR code ordering for contactless service</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Real-time analytics and business insights</span>
                  </li>
                </ul>
                <Link
                  href="/features"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Explore BrewPoint Features
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                  <div className="text-6xl mb-6">☕</div>
                  <h3 className="text-2xl font-bold mb-4">Perfect for Cafés</h3>
                  <div className="space-y-3">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="font-semibold mb-1">Quick Setup</div>
                      <div className="text-sm opacity-90">Get started in minutes, not days</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="font-semibold mb-1">Affordable Pricing</div>
                      <div className="text-sm opacity-90">No hidden fees or long-term contracts</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="font-semibold mb-1">Local Support</div>
                      <div className="text-sm opacity-90">NZ-based team ready to help</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service 2: Managed IT Services */}
          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1 mt-10 lg:mt-0">
                <div className="bg-gray-900 rounded-2xl p-8 text-white">
                  <div className="text-6xl mb-6">🖥️</div>
                  <h3 className="text-2xl font-bold mb-4">IT Support Services</h3>
                  <div className="space-y-4 text-gray-300">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>24/7 Monitoring & Support</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Network Management</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Security & Backup Solutions</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Hardware & Software Procurement</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                  Managed IT Services
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Keep your business running smoothly with our comprehensive managed IT services. We handle all aspects of your IT infrastructure so you can focus on growing your business.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  From proactive monitoring to rapid issue resolution, our team ensures your systems are always performing at their best. We provide enterprise-grade solutions tailored to businesses of all sizes.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Proactive system monitoring and maintenance</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Dedicated support team available when you need them</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Strategic IT planning and consulting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Service 3: Custom Software Development */}
          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                  Custom Software Development
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Turn your unique business ideas into reality with custom software solutions. Our experienced development team builds web applications, mobile apps, and integrated systems tailored to your specific needs.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Using modern technologies and agile methodologies, we deliver high-quality software that scales with your business. BrewPoint itself is a testament to our expertise in creating industry-specific solutions.
                </p>
                <div className="bg-indigo-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Our Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Next.js', 'Node.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'Prisma', 'TailwindCSS'].map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-indigo-600 border border-indigo-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
                  <div className="text-6xl mb-6">💻</div>
                  <h3 className="text-2xl font-bold mb-6">Development Process</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold">Discovery</div>
                        <div className="text-sm opacity-90">Understanding your requirements</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold">Design</div>
                        <div className="text-sm opacity-90">Creating user-friendly interfaces</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold">Development</div>
                        <div className="text-sm opacity-90">Building with best practices</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                        4
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold">Deployment</div>
                        <div className="text-sm opacity-90">Launch and ongoing support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service 4: Cloud Solutions */}
          <div className="mb-16">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1 mt-10 lg:mt-0">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
                  <div className="text-6xl mb-6">☁️</div>
                  <h3 className="text-2xl font-bold mb-4">Cloud Services</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold mb-1">99.9%</div>
                      <div className="text-sm opacity-90">Uptime SLA</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold mb-1">24/7</div>
                      <div className="text-sm opacity-90">Monitoring</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                  Cloud Solutions & Hosting
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Migrate to the cloud with confidence. We provide secure, scalable cloud infrastructure and hosting solutions that grow with your business needs.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Cloud migration and deployment</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Secure web and application hosting</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Automated backups and disaster recovery</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">Performance optimization and monitoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to discuss your project?
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Let's talk about how Edgepoint can help your business thrive
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
            >
              Contact Us
            </Link>
            <a
              href="https://edgepoint.co.nz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-indigo-600"
            >
              Visit Edgepoint.co.nz
            </a>
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
