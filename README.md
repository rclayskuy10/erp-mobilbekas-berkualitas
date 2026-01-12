# ERP Showroom - Sistem ERP Showroom Mobil

Sistem ERP internal untuk pengelolaan bisnis jual beli mobil bekas dengan fitur multi user, RBAC, inventory, pembelian, penjualan, dan laporan laba rugi.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

## 🚗 Fitur Utama

### 1. Authentication & RBAC (Role Based Access Control)
- **Owner**: Akses penuh ke seluruh data dan laporan
- **Admin**: Input dan pengelolaan data inventory, pembelian, dan penjualan
- **Staff**: Input data sesuai hak akses yang diberikan

### 2. Dashboard
- Statistik overview bisnis
- Chart penjualan bulanan
- Status inventory (pie chart)
- Ringkasan keuangan real-time
- Aktivitas terbaru (GRN & Penjualan)

### 3. Manajemen Inventory Mobil
- Data lengkap spesifikasi mobil
- Galeri foto mobil
- Status mobil (Tersedia, Terjual, Dipesan, Perawatan)
- Kondisi mobil (Sangat Baik, Baik, Cukup)
- Pencatatan biaya perawatan/perbaikan
- Perhitungan HPP otomatis

### 4. GRN (Goods Receipt Note)
- Pencatatan pembelian mobil masuk
- Data supplier (nama, kontak)
- Informasi lengkap mobil yang dibeli
- Tracking siapa yang menerima

### 5. Penjualan
- Pencatatan transaksi penjualan
- Data customer lengkap
- Multiple metode pembayaran (Tunai, Transfer, Kredit, Leasing)
- Status penjualan (Pending, Selesai, Dibatalkan)
- Perhitungan profit per transaksi

### 6. Laporan Keuangan
- **Total Pendapatan**: Revenue dari penjualan
- **HPP (Harga Pokok Penjualan)**: Harga beli + biaya perawatan
- **Gross Profit**: Pendapatan - HPP
- **Biaya Operasional**: Sewa, gaji, listrik, marketing, dll
- **Net Profit**: Gross Profit - Biaya Operasional
- Chart tren profit bulanan
- Breakdown biaya operasional
- Daftar profit per mobil terjual

### 7. Manajemen User
- CRUD user
- Assign role ke user
- Aktivasi/Nonaktifasi user
- Tabel hak akses per role

## 🔐 Demo Login

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@mobilbekas.com | owner123 |
| Admin | admin@mobilbekas.com | admin123 |
| Staff | staff@mobilbekas.com | staff123 |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm atau yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd erp-mobilsecond

# Install dependencies
npm install

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build untuk Production

```bash
npm run build
npm start
```

## 🌐 Deploy ke Vercel

1. Push code ke GitHub repository
2. Buka [vercel.com](https://vercel.com) dan login
3. Klik "New Project"
4. Import repository GitHub Anda
5. Klik "Deploy"

Atau menggunakan Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📁 Struktur Project

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard pages
│   │   ├── grn/           # GRN management
│   │   ├── inventory/     # Inventory management
│   │   ├── reports/       # Financial reports
│   │   ├── sales/         # Sales management
│   │   └── users/         # User management
│   ├── login/             # Login page
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── auth/              # Auth components
│   ├── dashboard/         # Dashboard components
│   ├── layouts/           # Layout components
│   └── ui/                # UI components
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── data/                  # Dummy data
│   └── dummy.ts           # All dummy data
├── lib/                   # Utility functions
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript types
    └── index.ts           # All type definitions
```

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date**: date-fns

## 📝 Catatan

- Ini adalah sistem **demo** dengan data dummy
- Untuk production, perlu integrasi database dan API backend
- Autentikasi menggunakan localStorage (untuk demo)
- RBAC diimplementasikan di frontend

## 📄 License

MIT License
