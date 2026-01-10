'use client';

import { useState, useMemo } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import { cars, sales, expenses as initialExpenses } from '@/data/dummy';
import { formatCurrency, getMonthName, exportToCSV, exportToExcel } from '@/lib/utils';
import { Expense, Sale } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Download,
  Plus,
  Calendar,
  Sheet,
  BarChart3,
  Wallet,
} from 'lucide-react';
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
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ReportsPage() {
  const { hasPermission } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Calculate financial data
  const completedSales = sales.filter((s) => s.status === 'completed');
  const soldCars = cars.filter((c) => c.status === 'sold');

  // Total Revenue (from completed sales)
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.sellingPrice, 0);

  // Total HPP (Harga Pokok Penjualan)
  const totalHPP = soldCars.reduce((sum, car) => sum + car.hpp, 0);

  // Gross Profit
  const grossProfit = totalRevenue - totalHPP;

  // Total Expenses (operational)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Profit
  const netProfit = grossProfit - totalExpenses;

  // Profit Margin
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Average profit per car
  const avgProfit = completedSales.length > 0 ? grossProfit / completedSales.length : 0;

  // Monthly data for charts
  const monthlyData = [
    { month: 'Jun', pendapatan: 195000000, hpp: 176500000, biaya: 29500000 },
    { month: 'Jul', pendapatan: 215000000, hpp: 196200000, biaya: 30000000 },
    { month: 'Agu', pendapatan: 0, hpp: 0, biaya: 15000000 },
    { month: 'Sep', pendapatan: 0, hpp: 0, biaya: 12000000 },
    { month: 'Okt', pendapatan: 0, hpp: 0, biaya: 12000000 },
    { month: 'Nov', pendapatan: 0, hpp: 0, biaya: 12000000 },
    { month: 'Des', pendapatan: 0, hpp: 0, biaya: 84500000 },
  ].map((d) => ({
    ...d,
    grossProfit: d.pendapatan - d.hpp,
    netProfit: d.pendapatan - d.hpp - d.biaya,
  }));

  // Expense breakdown by category
  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#f97316'];

  // Car profit breakdown
  const carProfits = soldCars.map((car) => {
    const sale = completedSales.find((s) => s.carId === car.id);
    return {
      name: `${car.specs.brand} ${car.specs.model}`,
      profit: sale ? sale.sellingPrice - car.hpp : 0,
    };
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      category: expenseForm.category,
      description: expenseForm.description,
      amount: parseInt(expenseForm.amount),
      date: expenseForm.date,
      createdBy: 'System',
    };
    setExpenses([...expenses, newExpense]);
    setIsAddExpenseModalOpen(false);
    setExpenseForm({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Export handlers
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleExportCSV = () => {
    // Prepare profit per car data
    const profitData = soldCars.map((car) => {
      const sale = completedSales.find((s) => s.carId === car.id);
      return {
        'Mobil': `${car.specs.brand} ${car.specs.model}`,
        'Plat Nomor': car.specs.plateNumber,
        'HPP': car.hpp,
        'Harga Jual': sale?.sellingPrice || 0,
        'Profit': sale ? sale.sellingPrice - car.hpp : 0,
      };
    });
    exportToCSV(profitData, `laporan-profit-mobil-${new Date().toISOString().split('T')[0]}`);
    setIsExportMenuOpen(false);
  };

  const handleExportExpensesCSV = () => {
    const expenseData = expenses.map((e) => ({
      'Tanggal': e.date,
      'Kategori': e.category,
      'Deskripsi': e.description,
      'Jumlah': e.amount,
    }));
    exportToCSV(expenseData, `laporan-biaya-${new Date().toISOString().split('T')[0]}`);
    setIsExportMenuOpen(false);
  };

  const handleExportFullExcel = () => {
    // Prepare all data sheets
    const profitSheet = soldCars.map((car) => {
      const sale = completedSales.find((s) => s.carId === car.id);
      return {
        mobil: `${car.specs.brand} ${car.specs.model}`,
        platNomor: car.specs.plateNumber,
        hpp: car.hpp,
        hargaJual: sale?.sellingPrice || 0,
        profit: sale ? sale.sellingPrice - car.hpp : 0,
      };
    });

    const expenseSheet = expenses.map((e) => ({
      tanggal: e.date,
      kategori: e.category,
      deskripsi: e.description,
      jumlah: e.amount,
    }));

    const summarySheet = [
      { item: 'Total Pendapatan', nilai: totalRevenue },
      { item: 'Total HPP', nilai: totalHPP },
      { item: 'Gross Profit', nilai: grossProfit },
      { item: 'Total Biaya Operasional', nilai: totalExpenses },
      { item: 'Net Profit', nilai: netProfit },
      { item: 'Profit Margin (%)', nilai: parseFloat(profitMargin) },
      { item: 'Net Margin (%)', nilai: parseFloat(netMargin) },
    ];

    exportToExcel([
      { 
        name: 'Ringkasan', 
        data: summarySheet,
        headers: { item: 'Item', nilai: 'Nilai (Rp)' }
      },
      { 
        name: 'Profit per Mobil', 
        data: profitSheet,
        headers: { mobil: 'Mobil', platNomor: 'Plat Nomor', hpp: 'HPP', hargaJual: 'Harga Jual', profit: 'Profit' }
      },
      { 
        name: 'Biaya Operasional', 
        data: expenseSheet,
        headers: { tanggal: 'Tanggal', kategori: 'Kategori', deskripsi: 'Deskripsi', jumlah: 'Jumlah' }
      },
    ], `laporan-keuangan-${new Date().toISOString().split('T')[0]}`);
    setIsExportMenuOpen(false);
  };

  return (
    <ProtectedRoute requiredModule="reports">
      <DashboardLayout>
        <div className="space-y-6 overflow-hidden">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
              <p className="text-sm sm:text-base text-gray-600">Analisis profit dan pengeluaran bisnis</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="text-sm"
              >
                <span className="hidden sm:inline">Tambah</span> Biaya
              </Button>
              <div className="relative">
                <Button 
                  variant="secondary" 
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="text-sm"
                >
                  Export
                </Button>
                {isExportMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsExportMenuOpen(false)}
                    />
                    <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-auto sm:top-full mt-2 sm:w-72 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50">
                      <div className="p-2">
                        <button
                          onClick={handleExportFullExcel}
                          className="flex w-full items-center rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#217346] flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 32 32" className="w-6 h-6">
                              <path fill="#fff" d="M19.5 6H12v20h7.5c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
                              <path fill="#185C37" d="M19.5 6H12v20h7.5c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" opacity=".2"/>
                              <path fill="#fff" d="M2.5 8C2.5 6.9 3.4 6 4.5 6H12v20H4.5c-1.1 0-2-.9-2-2V8z"/>
                              <path fill="#217346" d="M2.5 8C2.5 6.9 3.4 6 4.5 6H12v20H4.5c-1.1 0-2-.9-2-2V8z" opacity=".6"/>
                              <path fill="#fff" d="M12 6h9.5c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H12V6z"/>
                              <text x="14" y="19" fill="#217346" fontSize="8" fontWeight="bold" fontFamily="Arial">X</text>
                            </svg>
                          </div>
                          <div className="ml-3 text-left flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">Export Excel (Lengkap)</p>
                            <p className="text-xs text-gray-500 truncate">Semua data dalam 1 file</p>
                          </div>
                        </button>
                        <button
                          onClick={handleExportCSV}
                          className="flex w-full items-center rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#0078D4] flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 32 32" className="w-6 h-6">
                              <rect x="4" y="6" width="24" height="20" rx="2" fill="#fff"/>
                              <rect x="6" y="10" width="8" height="3" fill="#0078D4"/>
                              <rect x="6" y="15" width="8" height="3" fill="#0078D4"/>
                              <rect x="6" y="20" width="8" height="3" fill="#0078D4"/>
                              <rect x="16" y="10" width="10" height="3" fill="#50E6FF"/>
                              <rect x="16" y="15" width="10" height="3" fill="#50E6FF"/>
                              <rect x="16" y="20" width="10" height="3" fill="#50E6FF"/>
                            </svg>
                          </div>
                          <div className="ml-3 text-left flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">Profit per Mobil (CSV)</p>
                            <p className="text-xs text-gray-500 truncate">Data profit penjualan</p>
                          </div>
                        </button>
                        <button
                          onClick={handleExportExpensesCSV}
                          className="flex w-full items-center rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#E74C3C] flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 32 32" className="w-6 h-6">
                              <rect x="4" y="6" width="24" height="20" rx="2" fill="#fff"/>
                              <rect x="6" y="10" width="8" height="3" fill="#E74C3C"/>
                              <rect x="6" y="15" width="8" height="3" fill="#E74C3C"/>
                              <rect x="6" y="20" width="8" height="3" fill="#E74C3C"/>
                              <rect x="16" y="10" width="10" height="3" fill="#FADBD8"/>
                              <rect x="16" y="15" width="10" height="3" fill="#FADBD8"/>
                              <rect x="16" y="20" width="10" height="3" fill="#FADBD8"/>
                            </svg>
                          </div>
                          <div className="ml-3 text-left flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">Biaya Operasional (CSV)</p>
                            <p className="text-xs text-gray-500 truncate">Data pengeluaran</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-start sm:items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Total Pendapatan</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {completedSales.length} mobil terjual
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg shrink-0 ml-2">
                  <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-start sm:items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Gross Profit</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 mt-1 truncate">
                    {formatCurrency(grossProfit)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Margin: {profitMargin}%</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg shrink-0 ml-2">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-start sm:items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Biaya Operasional</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600 mt-1 truncate">
                    {formatCurrency(totalExpenses)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {expenses.length} transaksi
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-red-100 rounded-lg shrink-0 ml-2">
                  <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-start sm:items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Net Profit</p>
                  <p
                    className={`text-lg sm:text-2xl font-bold mt-1 truncate ${
                      netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(netProfit)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Margin: {netMargin}%</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg shrink-0 ml-2 ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <FileText className={`h-4 w-4 sm:h-6 sm:w-6 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Enhanced Monthly Profit Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Analisis Profit & Tren Bulanan
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="grossProfitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="netProfitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(0)}jt`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px'
                      }}
                      formatter={(value) => formatCurrency(Number(value))}
                      labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area
                      type="monotone"
                      dataKey="grossProfit"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fill="url(#grossProfitGradient)"
                      name="Gross Profit"
                      dot={{ fill: '#22c55e', r: 4 }}
                      activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="netProfit"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#netProfitGradient)"
                      name="Net Profit"
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Trend indicators */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Gross Profit YTD</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(grossProfit)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Net Profit YTD</p>
                  <p className={`text-lg font-semibold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Breakdown Biaya Operasional
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                      }
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {expensesByCategory.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Revenue vs Cost Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Analisis Pendapatan vs Biaya Bulanan
            </h2>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="pendapatanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="hppGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="biayaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.6}/>
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
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value) => formatCurrency(Number(value))} 
                    labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="rect"
                    layout="horizontal"
                    align="center"
                    formatter={(value) => <span style={{ color: '#374151', fontSize: '12px', marginRight: '16px' }}>{value}</span>}
                  />
                  <Bar 
                    dataKey="biaya" 
                    fill="url(#biayaGrad)" 
                    name="Biaya Operasional"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Bar 
                    dataKey="hpp" 
                    fill="url(#hppGrad)" 
                    name="HPP"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Bar 
                    dataKey="pendapatan" 
                    fill="url(#pendapatanGrad)" 
                    name="Pendapatan"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Financial metrics summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Rata-rata Pendapatan</p>
                </div>
                <p className="text-sm sm:text-lg font-bold text-blue-600 break-all">
                  {formatCurrency(monthlyData.reduce((sum, d) => sum + d.pendapatan, 0) / monthlyData.filter(d => d.pendapatan > 0).length || 0)}
                </p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Rata-rata HPP</p>
                </div>
                <p className="text-sm sm:text-lg font-bold text-red-600 break-all">
                  {formatCurrency(monthlyData.reduce((sum, d) => sum + d.hpp, 0) / monthlyData.filter(d => d.hpp > 0).length || 0)}
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Rata-rata Biaya</p>
                </div>
                <p className="text-sm sm:text-lg font-bold text-orange-600 break-all">
                  {formatCurrency(monthlyData.reduce((sum, d) => sum + d.biaya, 0) / monthlyData.length)}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Tables */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Profit per Car */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Profit per Mobil Terjual
              </h2>
              
              {/* Mobile Card Layout */}
              <div className="block sm:hidden space-y-3">
                {soldCars.map((car) => {
                  const sale = completedSales.find((s) => s.carId === car.id);
                  const profit = sale ? sale.sellingPrice - car.hpp : 0;
                  return (
                    <div key={car.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="font-medium text-gray-900 text-sm">
                        {car.specs.brand} {car.specs.model}
                      </div>
                      <div className="text-xs text-gray-500">{car.specs.plateNumber}</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">HPP:</span>
                          <div className="font-medium">{formatCurrency(car.hpp)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Jual:</span>
                          <div className="font-medium">{formatCurrency(sale?.sellingPrice || 0)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Profit:</span>
                          <div className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(profit)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                    <div>
                      <span className="text-gray-700">Total HPP:</span>
                      <div className="text-gray-900">{formatCurrency(totalHPP)}</div>
                    </div>
                    <div>
                      <span className="text-gray-700">Total Jual:</span>
                      <div className="text-gray-900">{formatCurrency(totalRevenue)}</div>
                    </div>
                    <div>
                      <span className="text-gray-700">Total Profit:</span>
                      <div className={`${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(grossProfit)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                          Mobil
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                          HPP
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                          Harga Jual
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                          Profit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {soldCars.map((car) => {
                        const sale = completedSales.find((s) => s.carId === car.id);
                        const profit = sale ? sale.sellingPrice - car.hpp : 0;
                        return (
                          <tr key={car.id} className="border-b border-gray-50">
                            <td className="py-3 px-2">
                              <p className="font-medium text-gray-900">
                                {car.specs.brand} {car.specs.model}
                              </p>
                              <p className="text-sm text-gray-500">{car.specs.plateNumber}</p>
                            </td>
                            <td className="py-3 px-2 text-right text-gray-600">
                              {formatCurrency(car.hpp)}
                            </td>
                            <td className="py-3 px-2 text-right text-gray-600">
                              {formatCurrency(sale?.sellingPrice || 0)}
                            </td>
                            <td
                              className={`py-3 px-2 text-right font-semibold ${
                                profit >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {formatCurrency(profit)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td className="py-3 px-2 font-semibold text-gray-900">Total</td>
                        <td className="py-3 px-2 text-right font-semibold text-gray-900">
                          {formatCurrency(totalHPP)}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-gray-900">
                          {formatCurrency(totalRevenue)}
                        </td>
                        <td
                          className={`py-3 px-2 text-right font-bold ${
                            grossProfit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(grossProfit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Expense List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Daftar Biaya Operasional
              </h2>
              
              {/* Mobile Card Layout */}
              <div className="block sm:hidden">
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            {expense.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {expense.date}
                          </div>
                        </div>
                        <div className="text-right ml-2 shrink-0">
                          <div className="font-medium text-red-600 text-sm">
                            {formatCurrency(expense.amount)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {expense.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-red-50 rounded-lg p-3 mt-3 border border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 text-sm">Total</span>
                    <span className="font-bold text-red-600 text-sm">{formatCurrency(totalExpenses)}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                          Tanggal
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                          Kategori
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                          Deskripsi
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                          Jumlah
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-gray-50">
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {expense.date}
                          </td>
                          <td className="py-3 px-2">
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-900">
                            {expense.description}
                          </td>
                          <td className="py-3 px-2 text-right font-medium text-red-600">
                            {formatCurrency(expense.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="py-3 px-2 font-semibold text-gray-900">
                          Total
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-red-600">
                          {formatCurrency(totalExpenses)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 sm:p-6 text-white">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Ringkasan Keuangan</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
              <div>
                <p className="text-blue-200 text-xs sm:text-sm">Total Pendapatan</p>
                <p className="text-base sm:text-xl lg:text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs sm:text-sm">Total HPP</p>
                <p className="text-base sm:text-xl lg:text-2xl font-bold">{formatCurrency(totalHPP)}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs sm:text-sm">Gross Profit</p>
                <p className="text-base sm:text-xl lg:text-2xl font-bold">{formatCurrency(grossProfit)}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs sm:text-sm">Biaya Operasional</p>
                <p className="text-base sm:text-xl lg:text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-white/10 rounded-lg p-3 sm:p-4">
                <p className="text-blue-200 text-xs sm:text-sm">Net Profit</p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Expense Modal */}
        <Modal
          isOpen={isAddExpenseModalOpen}
          onClose={() => setIsAddExpenseModalOpen(false)}
          title="Tambah Biaya Operasional"
          size="md"
        >
          <form onSubmit={handleAddExpense} className="space-y-4">
            <Select
              label="Kategori"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              options={[
                { value: '', label: 'Pilih kategori...' },
                { value: 'Sewa Tempat', label: 'Sewa Tempat' },
                { value: 'Gaji Karyawan', label: 'Gaji Karyawan' },
                { value: 'Listrik & Air', label: 'Listrik & Air' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Transportasi', label: 'Transportasi' },
                { value: 'Lain-lain', label: 'Lain-lain' },
              ]}
              required
            />
            <Input
              label="Deskripsi"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              required
            />
            <Input
              label="Jumlah (Rp)"
              type="number"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              required
            />
            <Input
              label="Tanggal"
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              required
            />
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsAddExpenseModalOpen(false)} type="button">
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
