import { Translation } from './en';

export const id: Translation = {
  // Common
  common: {
    welcome: 'Selamat Datang',
    loading: 'Memuat...',
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Ubah',
    add: 'Tambah',
    search: 'Cari',
    filter: 'Saring',
    submit: 'Kirim',
    back: 'Kembali',
    next: 'Selanjutnya',
    previous: 'Sebelumnya',
    confirm: 'Konfirmasi',
    close: 'Tutup',
    yes: 'Ya',
    no: 'Tidak',
  },

  // Navigation
  nav: {
    dashboard: 'Dasbor',
    menu: 'Menu',
    orders: 'Pesanan',
    tables: 'Meja',
    kitchen: 'Dapur',
    settings: 'Pengaturan',
    logout: 'Keluar',
  },

  // Order Page
  order: {
    title: 'Buat Pesanan',
    selectLanguage: 'Pilih Bahasa',
    browseMenu: 'Lihat Menu',
    allCategories: 'Semua Kategori',
    cart: 'Keranjang Anda',
    cartEmpty: 'Keranjang Anda kosong',
    addToCart: 'Tambah ke Keranjang',
    removeFromCart: 'Hapus',
    quantity: 'Jumlah',
    notes: 'Catatan',
    addNotes: 'Tambahkan catatan khusus...',
    customerInfo: 'Informasi Pelanggan',
    customerName: 'Nama Anda',
    customerPhone: 'Nomor Telepon',
    orderNotes: 'Catatan Pesanan',
    orderNotesPlaceholder: 'Ada permintaan khusus untuk pesanan Anda?',
    totalAmount: 'Total Pembayaran',
    placeOrder: 'Buat Pesanan',
    orderSuccess: 'Pesanan Berhasil Dibuat!',
    orderNumber: 'Nomor Pesanan',
    thankYou: 'Terima kasih atas pesanan Anda!',
    trackOrder: 'Kami akan segera menyiapkan pesanan Anda.',
    placeAnother: 'Buat Pesanan Lain',
    itemNotes: 'Catatan item',
    available: 'Tersedia',
    unavailable: 'Tidak Tersedia',
    outOfStock: 'Habis',
  },

  // Menu Categories
  categories: {
    COFFEE: 'Kopi',
    TEA: 'Teh',
    COLD_DRINKS: 'Minuman Dingin',
    HOT_DRINKS: 'Minuman Panas',
    CABINET_FOOD: 'Makanan Display',
    KITCHEN_FOOD: 'Makanan Dapur',
    CAKES: 'Kue',
  },

  // Order Status
  orderStatus: {
    PENDING: 'Menunggu',
    PAID: 'Dibayar',
    WAITING: 'Menunggu',
    COOKING: 'Memasak',
    READY: 'Siap',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  },

  // Payment Status
  paymentStatus: {
    PENDING: 'Menunggu',
    PAID: 'Dibayar',
    PARTIAL: 'Sebagian',
    REFUNDED: 'Dikembalikan',
  },

  // Kitchen Display
  kitchen: {
    title: 'Tampilan Dapur',
    activeOrders: 'Pesanan Aktif',
    liveUpdates: 'Update Langsung',
    disconnected: 'Terputus',
    refreshNow: 'Muat Ulang',
    noOrders: 'Tidak ada pesanan aktif',
    allCompleted: 'Semua pesanan telah selesai!',
    cooking: 'MEMASAK',
    waitingToCook: 'MENUNGGU DIMASAK',
    startCooking: 'Mulai Memasak',
    markCompleted: 'Tandai Selesai',
    specialNotes: 'Catatan Khusus',
    justNow: 'Baru saja',
    minAgo: 'menit lalu',
    hoursAgo: 'jam lalu',
  },

  // Validation Messages
  validation: {
    required: 'Kolom ini wajib diisi',
    invalidEmail: 'Alamat email tidak valid',
    invalidPhone: 'Nomor telepon tidak valid',
    minLength: 'Panjang minimum adalah {length} karakter',
    maxLength: 'Panjang maksimum adalah {length} karakter',
    minValue: 'Nilai minimum adalah {value}',
    maxValue: 'Nilai maksimum adalah {value}',
  },

  // Error Messages
  error: {
    generic: 'Terjadi kesalahan',
    networkError: 'Kesalahan jaringan. Silakan periksa koneksi Anda.',
    notFound: 'Tidak ditemukan',
    unauthorized: 'Akses tidak diizinkan',
    serverError: 'Kesalahan server. Silakan coba lagi nanti.',
  },

  // Success Messages
  success: {
    orderPlaced: 'Pesanan berhasil dibuat!',
    orderUpdated: 'Pesanan berhasil diperbarui!',
    settingsSaved: 'Pengaturan berhasil disimpan!',
    itemAdded: 'Item ditambahkan ke keranjang',
    itemRemoved: 'Item dihapus dari keranjang',
  },
};
