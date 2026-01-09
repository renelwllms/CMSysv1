'use client';

import Link from 'next/link';
import { useState } from 'react';
import MarketingNav from '@/components/MarketingNav';
import { useLanguage } from '@/contexts/LanguageContext';

const content = {
  en: {
    hero: {
      label: 'Contact us',
      title: 'Get in Touch',
      subtitle: "Have questions? We're here to help you get started with BrewPoint and the services showcased on our homepage.",
      primaryCta: 'Book a demo',
      secondaryCta: 'Review product features',
    },
    form: {
      title: 'Send us a message',
      success: "Thank you for your message! We'll get back to you soon.",
      fields: {
        name: { label: 'Full Name *', placeholder: 'John Doe' },
        email: { label: 'Email Address *', placeholder: 'john@example.com' },
        phone: { label: 'Phone Number', placeholder: '+64 21 123 4567' },
        company: { label: 'Cafe/Business Name', placeholder: 'My Cafe' },
        message: { label: 'Message *', placeholder: 'Tell us about your cafe and how we can help...' },
      },
      submit: 'Send Message',
    },
    info: {
      title: 'Contact Information',
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      hoursLabel: 'Business Hours',
      hoursLine1: 'Monday - Sunday',
      hoursLine2: '9:00 AM - 5:00 PM (NZST)',
      locationLabel: 'Location',
      locationLine1: 'Auckland & Palmerston North',
      locationLine2: 'New Zealand',
    },
    extra: {
      title: 'Quick Response Time',
      body1: 'We typically respond to all inquiries within 24 hours during business days.',
      body2: 'For urgent technical support, existing customers can contact us directly via phone.',
    },
    footer: {
      tagline: 'Modern cafe management system designed for efficiency and simplicity.',
      productLabel: 'Product',
      companyLabel: 'Company',
      developerLabel: 'Developer',
      productLinks: {
        features: 'Features',
        login: 'Login',
      },
      companyLinks: {
        about: 'About Us',
        services: 'Services',
        contact: 'Contact',
      },
      developerLine: 'Developed by',
      rights: 'All rights reserved.',
    },
  },
  id: {
    hero: {
      label: 'Kontak',
      title: 'Hubungi Kami',
      subtitle: 'Punya pertanyaan? Kami siap membantu Anda memulai dengan BrewPoint dan layanan yang ditampilkan di halaman utama.',
      primaryCta: 'Jadwalkan demo',
      secondaryCta: 'Lihat fitur produk',
    },
    form: {
      title: 'Kirim pesan kepada kami',
      success: 'Terima kasih atas pesan Anda! Kami akan menghubungi Anda segera.',
      fields: {
        name: { label: 'Nama Lengkap *', placeholder: 'John Doe' },
        email: { label: 'Alamat Email *', placeholder: 'nama@contoh.com' },
        phone: { label: 'Nomor Telepon', placeholder: '+62 812 3456 7890' },
        company: { label: 'Nama Kafe/Bisnis', placeholder: 'Kafe Saya' },
        message: { label: 'Pesan *', placeholder: 'Ceritakan tentang kafe Anda dan bagaimana kami bisa membantu...' },
      },
      submit: 'Kirim Pesan',
    },
    info: {
      title: 'Informasi Kontak',
      emailLabel: 'Email',
      phoneLabel: 'Telepon',
      hoursLabel: 'Jam Operasional',
      hoursLine1: 'Senin - Minggu',
      hoursLine2: '09:00 - 17:00 (NZST)',
      locationLabel: 'Lokasi',
      locationLine1: 'Auckland & Palmerston North',
      locationLine2: 'Selandia Baru',
    },
    extra: {
      title: 'Respon Cepat',
      body1: 'Kami biasanya merespons semua pertanyaan dalam 24 jam pada hari kerja.',
      body2: 'Untuk dukungan teknis mendesak, pelanggan yang sudah ada dapat menghubungi kami langsung melalui telepon.',
    },
    footer: {
      tagline: 'Sistem manajemen kafe modern untuk efisiensi dan kesederhanaan.',
      productLabel: 'Produk',
      companyLabel: 'Perusahaan',
      developerLabel: 'Pengembang',
      productLinks: {
        features: 'Fitur',
        login: 'Masuk',
      },
      companyLinks: {
        about: 'Tentang Kami',
        services: 'Layanan',
        contact: 'Kontak',
      },
      developerLine: 'Dikembangkan oleh',
      rights: 'Semua hak dilindungi.',
    },
  },
} as const;

export default function ContactPage() {
  const { language } = useLanguage();
  const t = content[language] ?? content.en;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', phone: '', company: '', message: '' });
  };

  return (
    <div className="home-apple min-h-screen bg-white text-[color:var(--ink)]">
      <MarketingNav />

      <section className="bg-gradient-to-br from-indigo-50 via-white to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{t.hero.label}</p>
            <h1 className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              {t.hero.title}
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
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
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
                {t.form.title}
              </h2>
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    {t.form.success}
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.form.fields.name.label}
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t.form.fields.name.placeholder}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.form.fields.email.label}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t.form.fields.email.placeholder}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.form.fields.phone.label}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t.form.fields.phone.placeholder}
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.form.fields.company.label}
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t.form.fields.company.placeholder}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.form.fields.message.label}
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={t.form.fields.message.placeholder}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t.form.submit}
                </button>
              </form>
            </div>

            <div className="mt-12 lg:mt-0">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
                {t.info.title}
              </h2>

              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{t.info.emailLabel}</h3>
                    <p className="mt-1 text-gray-600">support@edgepoint.co.nz</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{t.info.phoneLabel}</h3>
                    <p className="mt-1 text-gray-600">0800 334 376</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{t.info.hoursLabel}</h3>
                    <p className="mt-1 text-gray-600">{t.info.hoursLine1}</p>
                    <p className="text-gray-600">{t.info.hoursLine2}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{t.info.locationLabel}</h3>
                    <p className="mt-1 text-gray-600">{t.info.locationLine1}</p>
                    <p className="text-gray-600">{t.info.locationLine2}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t.extra.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t.extra.body1}
                </p>
                <p className="text-gray-600">
                  {t.extra.body2}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">BrewPoint</h3>
              <p className="text-gray-500 text-sm">
                {t.footer.tagline}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">{t.footer.productLabel}</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-500 text-sm hover:text-indigo-600">{t.footer.productLinks.features}</Link></li>
                <li><Link href="/login" className="text-gray-500 text-sm hover:text-indigo-600">{t.footer.productLinks.login}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">{t.footer.companyLabel}</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-500 text-sm hover:text-indigo-600">{t.footer.companyLinks.about}</Link></li>
                <li><Link href="/services" className="text-gray-500 text-sm hover:text-indigo-600">{t.footer.companyLinks.services}</Link></li>
                <li><Link href="/contact" className="text-gray-500 text-sm hover:text-indigo-600">{t.footer.companyLinks.contact}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">{t.footer.developerLabel}</h3>
              <p className="text-gray-500 text-sm mb-2">
                {t.footer.developerLine}{' '}
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
                © {new Date().getFullYear()} Edgepoint. {t.footer.rights}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
