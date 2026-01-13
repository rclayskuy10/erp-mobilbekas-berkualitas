'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, getRoleDisplayName, getRoleBadgeColor } from '@/contexts/AuthContext';
import NotificationSystem from '@/components/notification/NotificationSystem';
import {
  LayoutDashboard,
  Car,
  FileInput,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Building2,
  LineChart,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { name: 'Inventory Mobil', href: '/dashboard/inventory', icon: Car, module: 'inventory' },
  { name: 'Pembelian', href: '/dashboard/grn', icon: FileInput, module: 'grn' },
  { name: 'Penjualan', href: '/dashboard/sales', icon: ShoppingCart, module: 'sales' },
  { name: 'Customer', href: '/dashboard/customers', icon: User, module: 'sales' },
  { name: 'Vendor', href: '/dashboard/vendors', icon: Building2, module: 'inventory' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart, module: 'reports' },
  { name: 'Laporan', href: '/dashboard/reports', icon: BarChart3, module: 'reports' },
  { name: 'Manajemen User', href: '/dashboard/users', icon: Users, module: 'users' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.module, 'view'));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 sm:h-16 items-center justify-between px-4 border-b border-slate-700">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Car className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <span className="text-lg sm:text-xl font-bold text-white">ERP Showroom</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 sm:py-4 px-3">
            <ul className="space-y-1">
              {filteredMenuItems.map((item) => {
                // For Dashboard, only active when exactly at /dashboard
                // For other items, active when path matches or starts with href + '/'
                const isActive = item.href === '/dashboard' 
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info at bottom */}
          <div className="border-t border-slate-700 p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-sm sm:text-base">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b bg-white px-3 sm:px-4 lg:px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900 p-2 -ml-2"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="lg:block">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">
              <span className="hidden sm:inline">Sistem ERP Showroom Mobil</span>
              <span className="sm:hidden">ERP Showroom</span>
            </h1>
          </div>

          {/* Notification and User dropdown */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notification System */}
            <NotificationSystem />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm hover:bg-gray-100 min-w-0"
              >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{user?.name}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user?.role || 'staff')}`}>
                  {getRoleDisplayName(user?.role || 'staff')}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="pb-16">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="text-center text-xs sm:text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} ERP Showroom. Sistem Internal - Tidak untuk publik.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
