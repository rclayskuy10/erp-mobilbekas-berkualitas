'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Car, Shield, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">MobilERP</span>
            </div>
            <Link
              href="/login"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Sistem ERP
              <span className="text-blue-400"> Mobil Bekas</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Kelola bisnis jual beli mobil bekas Anda dengan lebih efisien. 
              Inventory, pembelian, penjualan, dan laporan keuangan dalam satu platform.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 transition-colors"
            >
              Mulai Sekarang
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Car className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Manajemen Inventory</h3>
              <p className="text-gray-400">
                Kelola stok mobil lengkap dengan spesifikasi, foto, dan status dalam satu tempat.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Role Based Access</h3>
              <p className="text-gray-400">
                Kontrol akses berdasarkan peran: Owner, Admin, dan Staff dengan izin yang berbeda.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-7 w-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Laporan Keuangan</h3>
              <p className="text-gray-400">
                Pantau gross profit, biaya operasional, dan net profit bisnis Anda secara real-time.
              </p>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-20 max-w-lg mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Demo Login</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="font-medium">Owner:</span>
                <code className="text-blue-400">owner@mobilbekas.com / owner123</code>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="font-medium">Admin:</span>
                <code className="text-blue-400">admin@mobilbekas.com / admin123</code>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Staff:</span>
                <code className="text-blue-400">staff@mobilbekas.com / staff123</code>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} MobilERP. Sistem Internal - Tidak untuk publik.</p>
        </div>
      </footer>
    </div>
  );
}
