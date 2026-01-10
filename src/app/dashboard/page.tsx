'use client';

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

export default function DashboardPage() {
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
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600">Selamat datang di sistem ERP Mobil Bekas</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Enhanced Monthly Sales Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Analisis Penjualan & Pendapatan</h2>
              <div className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySalesData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorBar1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(value) => `${value === 0 ? '0' : (value / 1000000).toFixed(0) + 'jt'}`}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        fontSize: '14px'
                      }}
                      formatter={(value, name) => {
                        if (name === 'pendapatan') return formatCurrency(Number(value));
                        return value + ' unit';
                      }}
                      labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                    />
                    <Bar 
                      dataKey="penjualan" 
                      fill="url(#colorBar1)" 
                      name="Jumlah Terjual"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Additional metrics below chart */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Rata-rata per Bulan</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(monthlySalesData.reduce((sum, d) => sum + d.pendapatan, 0) / monthlySalesData.filter(d => d.pendapatan > 0).length || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Unit Terlaris</p>
                  <p className="text-lg font-semibold text-green-600">
                    {Math.max(...monthlySalesData.map(d => d.penjualan))} unit
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Status Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Distribusi Inventory</h2>
              <div className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      label={({value, percent}) => `${value}`}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke={entry.color}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 truncate">{item.name}</span>
                        <span className="text-sm font-semibold text-gray-900 ml-1">{item.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
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
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent GRN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">GRN Terbaru</h2>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Penjualan Terbaru</h2>
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
