'use client';

import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { useLanguage } from '@/contexts/LanguageContext';

const content = {
  en: {
    hero: {
      label: 'What we deliver',
      title: 'Services that mirror the new BrewPoint experience',
      subtitle: 'From QR deployments to custom software, Edgepoint applies the same polish to every engagement.',
      primaryCta: 'Start a project',
      secondaryCta: 'Review BrewPoint features',
      badge: 'Microsoft partner - New Zealand',
      badgeNote: 'Certified to deploy and manage modern workplace, Azure, and data solutions for Kiwi businesses.',
    },
    partners: [
      {
        title: 'Hospitality rollout',
        body: 'Menu digitisation, QR deployment, and on-site training in as little as 48 hours.',
      },
      {
        title: 'Custom software',
        body: 'Web and mobile experiences, line-of-business systems, and integrations tailored to your stack.',
      },
      {
        title: 'Managed ops',
        body: 'Observability, uptime monitoring, and automation scripts that keep hospitality tech humming.',
      },
    ],
    overview: {
      title: 'Smart. Flexible. Beautiful Solutions.',
      subtitle: 'Edgepoint provides a full range of IT services to businesses across New Zealand and beyond.',
    },
    brewpoint: {
      tag: 'FLAGSHIP PRODUCT',
      title: 'BrewPoint - Cafe Management System',
      body: 'Our flagship hospitality solution designed specifically for cafes, restaurants, and food service businesses. BrewPoint combines modern technology with user-friendly design to streamline your entire operation.',
      bullets: [
        'Complete order management and kitchen display',
        'QR code ordering for contactless service',
        'Real-time analytics and business insights',
      ],
      linkLabel: 'Explore BrewPoint Features',
      card: {
        label: 'BrewPoint dashboard',
        dayLabel: 'Today',
        stats: {
          ordersLabel: 'Orders',
          revenueLabel: 'Revenue',
          ordersDelta: '+18% vs yesterday',
          kitchenAvg: 'Kitchen avg 11m',
        },
        queueLabel: 'Kitchen queue',
        states: ['Waiting', 'Cooking', 'Ready'],
      },
    },
    managed: {
      cardTitle: 'IT Support Services',
      cardItems: [
        '24/7 Monitoring & Support',
        'Network Management',
        'Security & Backup Solutions',
        'Hardware & Software Procurement',
      ],
      title: 'Managed IT Services',
      body1: 'Keep your business running smoothly with our comprehensive managed IT services. We handle all aspects of your IT infrastructure so you can focus on growing your business.',
      body2: 'From proactive monitoring to rapid issue resolution, our team ensures your systems are always performing at their best. We provide enterprise-grade solutions tailored to businesses of all sizes.',
      bullets: [
        'Proactive system monitoring and maintenance',
        'Dedicated support team available when you need them',
        'Strategic IT planning and consulting',
      ],
    },
    custom: {
      title: 'Custom Software Development',
      body1: 'Turn your unique business ideas into reality with custom software solutions. Our experienced development team builds web applications, mobile apps, and integrated systems tailored to your specific needs.',
      body2: 'Using modern technologies and agile methodologies, we deliver high-quality software that scales with your business. BrewPoint itself is a testament to our expertise in creating industry-specific solutions.',
      techTitle: 'Our Tech Stack',
      techStack: ['React', 'Next.js', 'Node.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'Prisma', 'TailwindCSS'],
      processTitle: 'Development Process',
      processSteps: [
        { title: 'Discovery', body: 'Understanding your requirements' },
        { title: 'Design', body: 'Creating user-friendly interfaces' },
        { title: 'Development', body: 'Building with best practices' },
        { title: 'Deployment', body: 'Launch and ongoing support' },
      ],
    },
    cloud: {
      cardTitle: 'Cloud observability',
      cardStatus: 'Live',
      regionLabel: 'Region',
      uptimeLabel: 'Uptime',
      title: 'Cloud Solutions & Hosting',
      body: 'Migrate to the cloud with confidence. We provide secure, scalable cloud infrastructure and hosting solutions that grow with your business needs.',
      bullets: [
        'Cloud migration and deployment',
        'Secure web and application hosting',
        'Automated backups and disaster recovery',
        'Performance optimization and monitoring',
      ],
    },
    additional: {
      label: 'More ways we help',
      title: 'Automation, web, and retail solutions',
      subtitle: 'Inspired by our work on automation, website development, and retail POS solutions at Edgepoint.co.nz.',
      cards: [
        {
          tag: 'Automation',
          title: 'Workflow automation & integrations',
          body: 'RPA and integration services that eliminate repetitive tasks, connect APIs, and keep your systems reconciled automatically.',
          bullets: ['Webhook-driven order routing', 'Scheduled financial exports', 'ERP & CRM integrations'],
        },
        {
          tag: 'Web & commerce',
          title: 'Website & digital experiences',
          body: 'Bespoke marketing sites, ecommerce builds, and booking flows that pair perfectly with BrewPoint or your standalone campaigns.',
          bullets: ['Next.js storefronts & landing pages', 'Accessibility-first design systems', 'Ongoing optimisation retainers'],
        },
        {
          tag: 'Retail POS',
          title: 'Retail & POS solutions',
          body: 'Omnichannel POS setups for hospitality and retail, integrating hardware, payment gateways, and custom dashboards.',
          bullets: ['Device procurement & staging', 'Inventory + loyalty integrations', 'Training & nationwide rollouts'],
        },
      ],
    },
    cta: {
      title: 'Ready to discuss your project?',
      subtitle: 'Let\'s talk about how Edgepoint can help your business thrive',
      primaryCta: 'Contact Us',
      secondaryCta: 'Visit Edgepoint.co.nz',
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
      label: 'Apa yang kami berikan',
      title: 'Layanan yang mencerminkan pengalaman BrewPoint terbaru',
      subtitle: 'Dari penerapan QR hingga software kustom, Edgepoint menghadirkan kualitas yang sama di setiap proyek.',
      primaryCta: 'Mulai proyek',
      secondaryCta: 'Tinjau fitur BrewPoint',
      badge: 'Mitra Microsoft - Selandia Baru',
      badgeNote: 'Tersertifikasi untuk menerapkan dan mengelola solusi modern workplace, Azure, dan data untuk bisnis di Selandia Baru.',
    },
    partners: [
      {
        title: 'Peluncuran hospitality',
        body: 'Digitalisasi menu, penerapan QR, dan pelatihan di lokasi dalam waktu 48 jam.',
      },
      {
        title: 'Software kustom',
        body: 'Pengalaman web dan mobile, sistem line-of-business, dan integrasi sesuai stack Anda.',
      },
      {
        title: 'Operasional terkelola',
        body: 'Observability, pemantauan uptime, dan skrip otomatisasi agar teknologi hospitality tetap stabil.',
      },
    ],
    overview: {
      title: 'Cerdas. Fleksibel. Solusi yang indah.',
      subtitle: 'Edgepoint menyediakan layanan TI lengkap untuk bisnis di Selandia Baru dan sekitarnya.',
    },
    brewpoint: {
      tag: 'PRODUK UTAMA',
      title: 'BrewPoint - Sistem Manajemen Kafe',
      body: 'Solusi hospitality unggulan kami yang dirancang khusus untuk kafe, restoran, dan bisnis layanan makanan. BrewPoint menggabungkan teknologi modern dengan desain yang mudah digunakan untuk merapikan seluruh operasional.',
      bullets: [
        'Manajemen pesanan lengkap dan layar dapur',
        'Pemesanan QR untuk layanan tanpa kontak',
        'Analitik real-time dan insight bisnis',
      ],
      linkLabel: 'Lihat fitur BrewPoint',
      card: {
        label: 'Dashboard BrewPoint',
        dayLabel: 'Hari ini',
        stats: {
          ordersLabel: 'Pesanan',
          revenueLabel: 'Pendapatan',
          ordersDelta: '+18% dibanding kemarin',
          kitchenAvg: 'Rata-rata dapur 11m',
        },
        queueLabel: 'Antrian dapur',
        states: ['Menunggu', 'Memasak', 'Siap'],
      },
    },
    managed: {
      cardTitle: 'Layanan Dukungan TI',
      cardItems: [
        'Pemantauan dan dukungan 24/7',
        'Manajemen jaringan',
        'Solusi keamanan dan backup',
        'Pengadaan hardware dan software',
      ],
      title: 'Layanan TI Terkelola',
      body1: 'Jaga bisnis Anda berjalan mulus dengan layanan TI terkelola kami yang menyeluruh. Kami menangani seluruh infrastruktur TI Anda agar Anda bisa fokus bertumbuh.',
      body2: 'Mulai dari pemantauan proaktif hingga penanganan masalah cepat, tim kami memastikan sistem Anda selalu bekerja optimal. Kami menyediakan solusi kelas enterprise yang disesuaikan untuk bisnis berbagai ukuran.',
      bullets: [
        'Pemantauan dan perawatan sistem proaktif',
        'Tim support khusus siap saat dibutuhkan',
        'Perencanaan dan konsultasi TI strategis',
      ],
    },
    custom: {
      title: 'Pengembangan Perangkat Lunak Kustom',
      body1: 'Ubah ide bisnis unik Anda menjadi kenyataan dengan solusi perangkat lunak kustom. Tim pengembangan kami membangun aplikasi web, aplikasi mobile, dan sistem terintegrasi sesuai kebutuhan Anda.',
      body2: 'Dengan teknologi modern dan metode agile, kami menghadirkan software berkualitas yang skalanya mengikuti bisnis Anda. BrewPoint sendiri adalah bukti keahlian kami dalam solusi khusus industri.',
      techTitle: 'Tech stack kami',
      techStack: ['React', 'Next.js', 'Node.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'Prisma', 'TailwindCSS'],
      processTitle: 'Proses pengembangan',
      processSteps: [
        { title: 'Discovery', body: 'Memahami kebutuhan Anda' },
        { title: 'Desain', body: 'Membuat antarmuka yang mudah digunakan' },
        { title: 'Pengembangan', body: 'Membangun dengan praktik terbaik' },
        { title: 'Deployment', body: 'Peluncuran dan dukungan berkelanjutan' },
      ],
    },
    cloud: {
      cardTitle: 'Observabilitas cloud',
      cardStatus: 'Live',
      regionLabel: 'Region',
      uptimeLabel: 'Uptime',
      title: 'Solusi Cloud dan Hosting',
      body: 'Pindah ke cloud dengan percaya diri. Kami menyediakan infrastruktur cloud yang aman dan skalabel serta solusi hosting yang tumbuh bersama kebutuhan bisnis Anda.',
      bullets: [
        'Migrasi dan deployment cloud',
        'Hosting web dan aplikasi yang aman',
        'Backup otomatis dan pemulihan bencana',
        'Optimasi performa dan monitoring',
      ],
    },
    additional: {
      label: 'Cara lain kami membantu',
      title: 'Solusi otomasi, web, dan retail',
      subtitle: 'Terinspirasi dari pekerjaan kami di automasi, pengembangan website, dan solusi POS retail di Edgepoint.co.nz.',
      cards: [
        {
          tag: 'Otomasi',
          title: 'Otomasi alur kerja dan integrasi',
          body: 'Layanan RPA dan integrasi yang menghapus tugas berulang, menghubungkan API, dan menjaga sistem tetap sinkron secara otomatis.',
          bullets: ['Routing pesanan berbasis webhook', 'Ekspor keuangan terjadwal', 'Integrasi ERP dan CRM'],
        },
        {
          tag: 'Web dan commerce',
          title: 'Website dan pengalaman digital',
          body: 'Situs pemasaran kustom, ecommerce, dan alur pemesanan yang cocok untuk BrewPoint atau kampanye mandiri Anda.',
          bullets: ['Storefront Next.js dan landing page', 'Sistem desain berfokus aksesibilitas', 'Retainer optimasi berkelanjutan'],
        },
        {
          tag: 'POS retail',
          title: 'Solusi retail dan POS',
          body: 'Setup POS omnichannel untuk hospitality dan retail, mengintegrasikan hardware, payment gateway, dan dashboard kustom.',
          bullets: ['Pengadaan dan staging perangkat', 'Integrasi inventori dan loyalty', 'Pelatihan dan rollout nasional'],
        },
      ],
    },
    cta: {
      title: 'Siap membahas proyek Anda?',
      subtitle: 'Mari bicarakan bagaimana Edgepoint dapat membantu bisnis Anda berkembang.',
      primaryCta: 'Hubungi Kami',
      secondaryCta: 'Kunjungi Edgepoint.co.nz',
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

export default function ServicesPage() {
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
                href="/contact?type=project"
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
            <div className="mt-8 flex flex-col items-center space-y-3">
              <div className="inline-flex items-center justify-center rounded-full border border-indigo-200 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
                {t.hero.badge}
              </div>
              <p className="text-sm text-gray-500">
                {t.hero.badgeNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {t.partners.map((offering) => (
              <div key={offering.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{offering.title}</h3>
                <p className="mt-3 text-sm text-gray-500">{offering.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              {t.overview.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.overview.subtitle}
            </p>
          </div>

          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <div className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4">
                  {t.brewpoint.tag}
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                  {t.brewpoint.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {t.brewpoint.body}
                </p>
                <ul className="space-y-3 mb-6">
                  {t.brewpoint.bullets.map((item) => (
                    <li key={item} className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/features"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  {t.brewpoint.linkLabel}
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">{t.brewpoint.card.label}</p>
                      <p className="text-lg font-semibold text-gray-900">{t.brewpoint.card.dayLabel}</p>
                    </div>
                    <div className="flex space-x-1">
                      <span className="h-2 w-2 rounded-full bg-red-400"></span>
                      <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                      <span className="h-2 w-2 rounded-full bg-green-400"></span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.brewpoint.card.stats.ordersLabel}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">84</p>
                      <p className="text-xs text-green-500">{t.brewpoint.card.stats.ordersDelta}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.brewpoint.card.stats.revenueLabel}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">IDR 14.2M</p>
                      <p className="text-xs text-indigo-500">{t.brewpoint.card.stats.kitchenAvg}</p>
                    </div>
                    <div className="col-span-2 rounded-xl border border-gray-100 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">{t.brewpoint.card.queueLabel}</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {t.brewpoint.card.states.map((state) => (
                          <div key={state} className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-semibold text-gray-500">{state}</p>
                            <p className="text-2xl font-bold text-gray-900">{state === t.brewpoint.card.states[1] ? 5 : state === t.brewpoint.card.states[0] ? 3 : 7}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1 mt-10 lg:mt-0">
                <div className="bg-gray-900 rounded-2xl p-8 text-white">
                  <div className="text-6xl mb-6">🖥️</div>
                  <h3 className="text-2xl font-bold mb-4">{t.managed.cardTitle}</h3>
                  <div className="space-y-4 text-gray-300">
                    {t.managed.cardItems.map((item) => (
                      <div key={item} className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                  {t.managed.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {t.managed.body1}
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  {t.managed.body2}
                </p>
                <ul className="space-y-3">
                  {t.managed.bullets.map((item) => (
                    <li key={item} className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-24">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                  {t.custom.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {t.custom.body1}
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  {t.custom.body2}
                </p>
                <div className="bg-indigo-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">{t.custom.techTitle}</h4>
                  <div className="flex flex-wrap gap-2">
                    {t.custom.techStack.map((tech) => (
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
                  <h3 className="text-2xl font-bold mb-6">{t.custom.processTitle}</h3>
                  <div className="space-y-4">
                    {t.custom.processSteps.map((step, index) => (
                      <div key={step.title} className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold">{step.title}</div>
                          <div className="text-sm opacity-90">{step.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1 mt-10 lg:mt-0">
                <div className="bg-gray-900 rounded-2xl p-8 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{t.cloud.cardTitle}</h3>
                    <span className="text-sm text-emerald-300">{t.cloud.cardStatus}</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {[99.98, 100, 99.92].map((uptime, idx) => (
                      <div key={idx} className="rounded-xl bg-gray-800 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-400">{t.cloud.regionLabel} {idx + 1}</p>
                          <p className="text-sm text-indigo-300">{t.cloud.uptimeLabel}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-3xl font-semibold">{uptime}%</p>
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-700">
                            <div className="h-full bg-indigo-400" style={{ width: `${uptime}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                  {t.cloud.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {t.cloud.body}
                </p>
                <ul className="space-y-3">
                  {t.cloud.bullets.map((item) => (
                    <li key={item} className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{t.additional.label}</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">{t.additional.title}</h2>
            <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
              {t.additional.subtitle}
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {t.additional.cards.map((card) => (
              <div key={card.title} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{card.tag}</p>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-3 text-sm text-gray-600">
                  {card.body}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-500">
                  {card.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
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
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
            >
              {t.cta.primaryCta}
            </Link>
            <a
              href="https://edgepoint.co.nz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-indigo-600"
            >
              {t.cta.secondaryCta}
            </a>
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
