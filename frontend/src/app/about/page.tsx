'use client';

import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { useLanguage } from '@/contexts/LanguageContext';

const content = {
  en: {
    hero: {
      label: 'Edgepoint team',
      title: 'The team behind BrewPoint',
      subtitle: 'Empowering cafes with the same obsessive focus on operations you see on our homepage.',
      primaryCta: 'Explore our services',
      secondaryCta: 'Talk to the team',
    },
    stats: [
      { label: 'Cafes supported', value: '25+' },
      { label: 'Orders per day', value: '200+' },
      { label: 'Avg. go-live time', value: '48 hrs' },
      { label: 'Team members', value: '12' },
    ],
    mission: {
      title: 'Our Mission',
      body1: 'BrewPoint was created to solve the everyday challenges faced by cafe owners and managers. We believe that running a successful cafe should not require complex systems or expensive solutions.',
      body2: 'Our mission is to provide an all-in-one platform that is simple, powerful, and affordable - helping cafes of all sizes streamline their operations, delight their customers, and grow their business.',
      highlights: [
        { title: 'Simple', body: 'Easy to use, no training required' },
        { title: 'Powerful', body: 'Enterprise features for everyone' },
        { title: 'Affordable', body: 'Pricing that makes sense' },
      ],
    },
    values: {
      title: 'Our Values',
      subtitle: 'The principles that guide everything we do',
      items: [
        {
          title: 'Innovation',
          body: 'We constantly improve and add new features based on real cafe needs, staying ahead of industry trends.',
        },
        {
          title: 'Partnership',
          body: 'Your success is our success. We work alongside you to ensure BrewPoint fits your unique workflow.',
        },
        {
          title: 'Simplicity',
          body: 'Technology should make life easier, not harder. We focus on intuitive design and seamless experiences.',
        },
      ],
    },
    team: {
      title: 'Developed by Edgepoint',
      subtitle: 'Smart. Flexible. Beautiful Solutions.',
      aboutTitle: 'About Edgepoint',
      aboutBody1: 'Edgepoint is a leading IT services provider based in New Zealand, specializing in managed IT services and custom software development.',
      aboutBody2: 'With years of experience in delivering enterprise-grade solutions to businesses of all sizes, we bring that same expertise to the hospitality industry with BrewPoint.',
      visitCta: 'Visit Edgepoint.co.nz',
      services: ['Managed IT Services', 'Custom Software Development', 'Cloud Solutions', 'IT Support & Consulting'],
    },
    cta: {
      title: 'Ready to get started?',
      subtitle: 'Join cafes already using BrewPoint to streamline their operations',
      primaryCta: 'Get Started',
      secondaryCta: 'Contact Us',
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
      label: 'Tim Edgepoint',
      title: 'Tim di balik BrewPoint',
      subtitle: 'Memberdayakan kafe dengan fokus operasional yang sama seperti di halaman utama.',
      primaryCta: 'Jelajahi layanan kami',
      secondaryCta: 'Bicara dengan tim',
    },
    stats: [
      { label: 'Kafe yang didukung', value: '25+' },
      { label: 'Pesanan per hari', value: '200+' },
      { label: 'Rata-rata waktu go-live', value: '48 jam' },
      { label: 'Anggota tim', value: '12' },
    ],
    mission: {
      title: 'Misi Kami',
      body1: 'BrewPoint dibuat untuk menjawab tantangan harian yang dihadapi pemilik dan manajer kafe. Kami percaya menjalankan kafe yang sukses tidak perlu sistem rumit atau solusi mahal.',
      body2: 'Misi kami adalah menyediakan platform all-in-one yang sederhana, bertenaga, dan terjangkau - membantu kafe dari berbagai ukuran mengefisienkan operasional, menyenangkan pelanggan, dan bertumbuh.',
      highlights: [
        { title: 'Sederhana', body: 'Mudah digunakan, tanpa pelatihan panjang' },
        { title: 'Bertenaga', body: 'Fitur setara enterprise untuk semua' },
        { title: 'Terjangkau', body: 'Harga yang masuk akal' },
      ],
    },
    values: {
      title: 'Nilai Kami',
      subtitle: 'Prinsip yang memandu semua yang kami lakukan',
      items: [
        {
          title: 'Inovasi',
          body: 'Kami terus meningkatkan dan menambah fitur berdasarkan kebutuhan kafe nyata, tetap selangkah di depan tren industri.',
        },
        {
          title: 'Kemitraan',
          body: 'Kesuksesan Anda adalah kesuksesan kami. Kami bekerja bersama Anda agar BrewPoint sesuai dengan alur kerja Anda.',
        },
        {
          title: 'Kesederhanaan',
          body: 'Teknologi harus mempermudah hidup, bukan mempersulit. Kami fokus pada desain intuitif dan pengalaman yang mulus.',
        },
      ],
    },
    team: {
      title: 'Dikembangkan oleh Edgepoint',
      subtitle: 'Cerdas. Fleksibel. Solusi yang indah.',
      aboutTitle: 'Tentang Edgepoint',
      aboutBody1: 'Edgepoint adalah penyedia layanan TI terkemuka berbasis di Selandia Baru, spesialis dalam layanan TI terkelola dan pengembangan perangkat lunak kustom.',
      aboutBody2: 'Dengan pengalaman bertahun-tahun menghadirkan solusi kelas enterprise untuk bisnis berbagai ukuran, kami membawa keahlian yang sama ke industri hospitality melalui BrewPoint.',
      visitCta: 'Kunjungi Edgepoint.co.nz',
      services: ['Layanan TI Terkelola', 'Pengembangan Perangkat Lunak Kustom', 'Solusi Cloud', 'Dukungan dan Konsultasi TI'],
    },
    cta: {
      title: 'Siap untuk memulai?',
      subtitle: 'Bergabung dengan kafe yang sudah menggunakan BrewPoint untuk mengefisienkan operasional',
      primaryCta: 'Mulai Sekarang',
      secondaryCta: 'Hubungi Kami',
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

export default function AboutPage() {
  const { language } = useLanguage();
  const t = content[language] ?? content.en;

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
                href="/services"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow hover:bg-indigo-700"
              >
                {t.hero.primaryCta}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-3 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-50"
              >
                {t.hero.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {t.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="mt-2 text-sm uppercase tracking-wide text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                {t.mission.title}
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {t.mission.body1}
              </p>
              <p className="text-lg text-gray-600 mb-4">
                {t.mission.body2}
              </p>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  {t.mission.highlights.map((item, index) => (
                    <div key={item.title} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-2xl">
                          {index === 0 ? '✨' : index === 1 ? '💪' : '🎯'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-orange-100">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">{t.values.title}</h2>
            <p className="mt-4 text-xl text-gray-600">
              {t.values.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.values.items.map((item, index) => (
              <div key={item.title} className="bg-white rounded-lg p-8 shadow-sm">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl mb-4">
                  {index === 0 ? '🚀' : index === 1 ? '🤝' : '💡'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">{t.team.title}</h2>
            <p className="mt-4 text-xl text-gray-600">
              {t.team.subtitle}
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-12">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t.team.aboutTitle}
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  {t.team.aboutBody1}
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  {t.team.aboutBody2}
                </p>
                <a
                  href="https://edgepoint.co.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  {t.team.visitCta}
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-indigo-100">
                  <div className="space-y-4">
                    {t.team.services.map((service) => (
                      <div key={service} className="flex items-center">
                        <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            {t.cta.title}
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            {t.cta.subtitle}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
            >
              {t.cta.primaryCta}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-indigo-600"
            >
              {t.cta.secondaryCta}
            </Link>
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
