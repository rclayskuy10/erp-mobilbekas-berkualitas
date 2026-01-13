'use client';

import { Suspense } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { cars, sales, expenses, grns } from '@/data/dummy';
import { formatCurrency, getMonthName } from '@/lib/utils';
import {
  Car,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function DashboardContent() {
  // Calculate dashboard stats
  const totalCars = cars.length;
  const availableCars = cars.filter((c) => c.status === 'available').length;
  const soldCars = cars.filter((c) => c.status === 'sold').length;
  const reservedCars = cars.filter((c) => c.status === 'reserved').length;
  const maintenanceCars = cars.filter((c) => c.status === 'maintenance').length;

  // Calculate financial stats
  const completedSales = sales.filter((s) => s.status === 'completed');
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.sellingPrice, 0);

  const soldCarsData = cars.filter((c) => c.status === 'sold');
  const totalHPP = soldCarsData.reduce((sum, c) => sum + c.hpp, 0);
  const grossProfit = totalRevenue - totalHPP;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const pendingSales = sales.filter((s) => s.status === 'pending').length;

  // Chart data - Monthly sales
  const monthlySalesData = [
    { month: 'Jun', penjualan: 1, pendapatan: 195000000 },
    { month: 'Jul', penjualan: 1, pendapatan: 215000000 },
    { month: 'Agu', penjualan: 0, pendapatan: 0 },
    { month: 'Sep', penjualan: 0, pendapatan: 0 },
    { month: 'Okt', penjualan: 0, pendapatan: 0 },
    { month: 'Nov', penjualan: 0, pendapatan: 0 },
  ];

  // Pie chart data - Car status
  const statusData = [
    { name: 'Tersedia', value: availableCars, color: '#22c55e' },
    { name: 'Terjual', value: soldCars, color: '#3b82f6' },
    { name: 'Dipesan', value: reservedCars, color: '#eab308' },
    { name: 'Perawatan', value: maintenanceCars, color: '#f97316' },
  ];

  // Recent activities
  const recentGRNs = grns.slice(-3).reverse();
  const recentSales = sales.slice(-3).reverse();

  return (
    <ProtectedRoute requiredModule="dashboard">
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600">Selamat datang di sistem ERP Showroom Mobil</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Mobil"
              value={totalCars}
              subtitle={`${availableCars} tersedia`}
              icon={Car}
              color="blue"
            />
            <StatCard
              title="Mobil Terjual"
              value={soldCars}
              subtitle="Total terjual"
              icon={ShoppingCart}
              color="green"
            />
            <StatCard
              title="Total Pendapatan"
              value={formatCurrency(totalRevenue)}
              icon={DollarSign}
              color="purple"
            />
            <StatCard
              title="Net Profit"
              value={formatCurrency(netProfit)}
              icon={TrendingUp}
              color={netProfit >= 0 ? 'green' : 'red'}
            />
          </div>

          {/* Enhanced Charts Row */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Professional Sales & Revenue Analytics */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                      Analisis Penjualan & Pendapatan
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Total unit terjual per bulan
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-xs font-medium text-gray-600">Unit Terjual</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="px-4 sm:px-6 py-5">
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySalesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBar1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95}/>
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0.85}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#e5e7eb" 
                        vertical={false}
                        strokeOpacity={0.5}
                      />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                        tickLine={false}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1.5 }}
                        interval={0}
                        dy={8}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                        tickLine={false}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1.5 }}
                        tickFormatter={(value) => `${value === 0 ? '0' : value + ' unit'}`}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          padding: '12px 16px',
                          fontSize: '13px'
                        }}
                        formatter={(value: number | string | undefined, name: string | undefined) => {
                          if (!value) return ['0', ''];
                          if (name === 'Jumlah Terjual') return [value + ' unit', ''];
                          return [formatCurrency(Number(value)), ''];
                        }}
                        labelStyle={{ 
                          color: '#111827', 
                          fontWeight: 600,
                          fontSize: '13px',
                          marginBottom: '4px'
                        }}
                        itemStyle={{ 
                          color: '#6b7280',
                          padding: '2px 0',
                          fontWeight: 500
                        }}
                      />
                      <Bar 
                        dataKey="penjualan" 
                        fill="url(#colorBar1)" 
                        name="Jumlah Terjual"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Professional KPI Cards */}
              <div className="px-6 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Average Revenue Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                        Rata-rata per Bulan
                      </p>
                      <p className="text-lg font-bold text-blue-900 tracking-tight">
                        {formatCurrency(monthlySalesData.reduce((sum, d) => sum + d.pendapatan, 0) / monthlySalesData.filter(d => d.pendapatan > 0).length || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Best Month Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                        Unit Terlaris
                      </p>
                      <p className="text-lg font-bold text-green-900 tracking-tight">
                        {Math.max(...monthlySalesData.map(d => d.penjualan))} unit
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Inventory Distribution */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                  Distribusi Inventory
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Status unit mobil
                </p>
              </div>

              {/* Donut Chart */}
              <div className="px-4 sm:px-6 py-5">
                <div className="h-44 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                        label={({value}) => value > 0 ? value : ''}
                        labelLine={false}
                        style={{ outline: 'none' }}
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={3}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          padding: '12px 16px',
                          fontSize: '13px'
                        }}
                        formatter={(value: number | string | undefined) => {
                          if (!value) return ['0 unit', ''];
                          return [value + ' unit', ''];
                        }}
                        labelStyle={{ 
                          color: '#111827', 
                          fontWeight: 600,
                          fontSize: '13px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Professional Legend Cards */}
              <div className="px-4 sm:px-6 pb-5">
                <div className="grid grid-cols-2 gap-3">
                  {statusData.map((item) => (
                    <div 
                      key={item.name} 
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ 
                        backgroundColor: item.color + '10',
                        borderColor: item.color + '30'
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-medium text-gray-700 truncate">
                          {item.name}
                        </span>
                      </div>
                      <span 
                        className="text-base font-bold ml-2 flex-shrink-0"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg shrink-0">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Total Pendapatan</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg shrink-0">
                  <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Total HPP</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{formatCurrency(totalHPP)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg shrink-0">
                  <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Gross Profit</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{formatCurrency(grossProfit)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Net Profit</p>
                  <p className={`text-sm sm:text-lg font-semibold truncate ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Recent GRN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Pembelian Terbaru</h2>
                <Link
                  href="/dashboard/grn"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Lihat semua
                </Link>
              </div>
              <div className="space-y-4">
                {recentGRNs.map((grn) => {
                  const car = cars.find((c) => c.id === grn.carId);
                  return (
                    <div
                      key={grn.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{grn.grnNumber}</p>
                          <p className="text-sm text-gray-500">
                            {car?.specs.brand} {car?.specs.model}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(grn.purchasePrice)}
                        </p>
                        <p className="text-sm text-gray-500">{grn.purchaseDate}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Penjualan Terbaru</h2>
                <Link
                  href="/dashboard/sales"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Lihat semua
                </Link>
              </div>
              <div className="space-y-4">
                {recentSales.map((sale) => {
                  const car = cars.find((c) => c.id === sale.carId);
                  return (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <ShoppingCart className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{sale.saleNumber}</p>
                          <p className="text-sm text-gray-500">
                            {car?.specs.brand} {car?.specs.model}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(sale.sellingPrice)}
                        </p>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            sale.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : sale.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sale.status === 'completed'
                            ? 'Selesai'
                            : sale.status === 'pending'
                            ? 'Pending'
                            : 'Dibatalkan'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pending Items */}
          {pendingSales > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-yellow-800">
                    {pendingSales} penjualan menunggu konfirmasi
                  </p>
                  <Link
                    href="/dashboard/sales"
                    className="text-sm text-yellow-600 hover:text-yellow-700"
                  >
                    Lihat detail →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
