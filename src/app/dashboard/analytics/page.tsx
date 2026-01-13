'use client';

import { useState, useMemo, Suspense } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { 
  cars, 
  grns,
  sales,
} from '@/data/dummy';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Car,
  DollarSign,
  Target,
  Award,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

function AnalyticsContent() {
  // Set default date range to current year (Jan 1 to today)
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const [startDate, setStartDate] = useState(startOfYear.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(now.toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'brand'>('sales');

  // Helper to get car data for a sale
  const getSaleWithCarData = (sale: typeof sales[0]) => {
    const car = cars.find(c => c.id === sale.carId);
    return {
      ...sale,
      purchasePrice: car?.purchasePrice || 0,
      profit: sale.sellingPrice - (car?.purchasePrice || 0),
    };
  };

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the end date fully

    return sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= start && saleDate <= end;
    });
  }, [startDate, endDate]);

  // Filter cars by date range (based on purchase date)
  const filteredCars = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return cars.filter(car => {
      const grn = grns.find(g => g.carId === car.id);
      if (!grn) return false;
      
      const purchaseDate = new Date(grn.purchaseDate);
      return purchaseDate >= start && purchaseDate <= end;
    });
  }, [startDate, endDate]);

  // Sales Performance by Salesperson
  const salesPerformance = useMemo(() => {
    // Get unique salespeople from filtered sales data
    const uniqueSalespeople = [...new Set(filteredSales.map(s => s.soldBy))];
    return uniqueSalespeople.map(spName => {
      const spSales = filteredSales.filter(s => s.soldBy === spName);
      const totalSales = spSales.length;
      const totalRevenue = spSales.reduce((sum, s) => sum + s.sellingPrice, 0);
      const avgDealSize = totalSales > 0 ? totalRevenue / totalSales : 0;
      const target = 500000000; // 500jt per month target
      const achievement = (totalRevenue / target) * 100;

      return {
        name: spName,
        sales: totalSales,
        revenue: totalRevenue,
        avgDeal: avgDealSize,
        target,
        achievement: Math.min(achievement, 150),
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // Monthly Sales Trend
  const monthlySalesTrend = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Generate months between start and end date
    const months: { date: Date; label: string }[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    
    while (current <= endMonth) {
      months.push({
        date: new Date(current),
        label: current.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months.map(({ date, label }) => {
      const monthSales = filteredSales.filter(s => {
        const saleDate = new Date(s.saleDate);
        return saleDate.getMonth() === date.getMonth() && 
               saleDate.getFullYear() === date.getFullYear();
      });
      const salesWithData = monthSales.map(getSaleWithCarData);
      const revenue = salesWithData.reduce((sum, s) => sum + s.sellingPrice, 0);
      const cost = salesWithData.reduce((sum, s) => sum + s.purchasePrice, 0);
      const profit = salesWithData.reduce((sum, s) => sum + s.profit, 0);
      return {
        month: label,
        revenue,
        cost,
        profit,
        count: monthSales.length,
      };
    });
  }, [filteredSales, startDate, endDate]);

  // Inventory Turnover / Stock Aging
  const stockAgingData = useMemo(() => {
    const availableCars = filteredCars.filter(c => c.status === 'available');
    const aging = {
      '0-30 hari': 0,
      '31-60 hari': 0,
      '61-90 hari': 0,
      '>90 hari': 0,
    };

    availableCars.forEach(car => {
      const grn = grns.find(g => g.carId === car.id);
      if (grn) {
        const purchaseDate = new Date(grn.purchaseDate);
        const today = new Date();
        const days = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (days <= 30) aging['0-30 hari']++;
        else if (days <= 60) aging['31-60 hari']++;
        else if (days <= 90) aging['61-90 hari']++;
        else aging['>90 hari']++;
      }
    });

    return Object.entries(aging).map(([name, value]) => ({ name, value }));
  }, [filteredCars]);

  // Brand Analytics
  const brandAnalytics = useMemo(() => {
    const brands: Record<string, { count: number; revenue: number; profit: number }> = {};
    
    filteredCars.forEach(car => {
      const brand = car.specs.brand;
      if (!brands[brand]) {
        brands[brand] = { count: 0, revenue: 0, profit: 0 };
      }
      brands[brand].count++;

      const sale = filteredSales.find(s => s.carId === car.id);
      if (sale) {
        const profit = sale.sellingPrice - car.purchasePrice;
        brands[brand].revenue += sale.sellingPrice;
        brands[brand].profit += profit;
      }
    });

    return Object.entries(brands)
      .map(([brand, data]) => ({
        brand,
        ...data,
        avgProfit: data.count > 0 ? data.profit / data.count : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredCars, filteredSales]);

  // Category Distribution
  const categoryDistribution = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredCars.forEach(car => {
      const category = car.condition; // Use condition as category since there's no category field
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [filteredCars]);

  // KPI Cards
  const kpis = useMemo(() => {
    const salesWithData = filteredSales.map(getSaleWithCarData);
    const totalRevenue = salesWithData.reduce((sum, s) => sum + s.sellingPrice, 0);
    const totalProfit = salesWithData.reduce((sum, s) => sum + s.profit, 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const totalStock = filteredCars.filter(c => c.status === 'available').length;
    
    // Calculate average turnover based on filtered cars
    let totalTurnoverDays = 0;
    let soldCarsCount = 0;
    filteredCars.forEach(car => {
      const grn = grns.find(g => g.carId === car.id);
      const sale = filteredSales.find(s => s.carId === car.id);
      if (grn && sale) {
        const purchaseDate = new Date(grn.purchaseDate);
        const saleDate = new Date(sale.saleDate);
        const days = Math.floor((saleDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
        totalTurnoverDays += days;
        soldCarsCount++;
      }
    });
    const avgTurnover = soldCarsCount > 0 ? Math.round(totalTurnoverDays / soldCarsCount) : 0;
    
    return {
      totalRevenue,
      totalProfit,
      avgMargin,
      totalStock,
      avgTurnover,
      totalSales: filteredSales.length,
    };
  }, [filteredSales, filteredCars]);

  const tabs = [
    { id: 'sales', label: 'Sales Analytics', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory Analytics', icon: Layers },
    { id: 'brand', label: 'Brand Analytics', icon: Award },
  ];

  return (
    <ProtectedRoute requiredModule="reports" requiredAction="view">
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">Analisis mendalam performa bisnis</p>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Dari:</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Sampai:</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="mb-6 sm:mb-8">
            <div className="space-y-4 sm:space-y-6">
            {/* Revenue & Profit - Full width on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Total Revenue */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(kpis.totalRevenue)}</p>
                </div>
              </div>

              {/* Total Profit */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Profit</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(kpis.totalProfit)}</p>
                </div>
              </div>
            </div>

            {/* Other KPIs - 2 cols on mobile, 4 cols on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Avg Margin */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Avg Margin</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-600">{kpis.avgMargin.toFixed(1)}%</p>
                </div>
              </div>

              {/* Total Stock */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Car className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Stock</p>
                  <p className="text-lg sm:text-xl font-bold text-orange-600">{kpis.totalStock} Unit</p>
                </div>
              </div>

              {/* Avg Turnover */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-pink-50 rounded-lg">
                    <Clock className="h-5 w-5 text-pink-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Avg Turnover</p>
                  <p className="text-lg sm:text-xl font-bold text-pink-600">{kpis.avgTurnover} Hari</p>
                </div>
              </div>

              {/* Total Penjualan */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Penjualan</p>
                  <p className="text-lg sm:text-xl font-bold text-indigo-600">{kpis.totalSales} Unit</p>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <div className="grid grid-cols-3 gap-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
            </div>
          </div>

          {/* Sales Analytics Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Monthly Trend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Trend Penjualan Bulanan</h3>
                <div className="h-64 sm:h-80 -mx-2 sm:mx-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySalesTrend}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(v) => `${(v/1000000000).toFixed(0)}M`} width={40} />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value) || 0)}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" fill="url(#colorRevenue)" strokeWidth={2} />
                      <Area type="monotone" dataKey="profit" name="Profit" stroke="#10B981" fill="url(#colorProfit)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sales Performance by Person */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Performa Sales Person</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {salesPerformance.map((sp, idx) => (
                    <div key={sp.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      {/* Header with Rank Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-gray-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <Badge variant={sp.achievement >= 100 ? 'success' : sp.achievement >= 70 ? 'warning' : 'danger'}>
                          {sp.achievement.toFixed(0)}% Target
                        </Badge>
                      </div>

                      {/* Name */}
                      <h4 className="font-bold text-gray-900 text-base mb-4">{sp.name}</h4>

                      {/* Stats */}
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Penjualan</span>
                          <span className="text-sm font-semibold text-gray-900">{sp.sales} unit</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Revenue</span>
                          <span className="text-sm font-semibold text-blue-600">{formatCurrency(sp.revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Avg Deal</span>
                          <span className="text-sm font-semibold text-purple-600">{formatCurrency(sp.avgDeal)}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress</span>
                          <span>{sp.achievement.toFixed(0)}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              sp.achievement >= 100 ? 'bg-green-500' : sp.achievement >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(sp.achievement, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Inventory Analytics Tab */}
          {activeTab === 'inventory' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Stock Aging */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Aging Analysis</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockAgingData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="value" name="Unit" radius={[0, 4, 4, 0]}>
                        {stockAgingData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {stockAgingData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-gray-600">{item.name}:</span>
                      <span className="font-semibold">{item.value} unit</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Kategori</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {categoryDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory Value */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Metrics</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{cars.filter(c => c.status === 'available').length}</p>
                    <p className="text-sm text-gray-600">Stok Tersedia</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Car className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{sales.length}</p>
                    <p className="text-sm text-gray-600">Terjual</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">45</p>
                    <p className="text-sm text-gray-600">Avg Days in Stock</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">2.4x</p>
                    <p className="text-sm text-gray-600">Inventory Turnover</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Brand Analytics Tab */}
          {activeTab === 'brand' && (
            <div className="space-y-6">
              {/* Brand Performance Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performa per Brand</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={brandAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="brand" tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${(v/1000000000).toFixed(0)}M`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Brand Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {brandAnalytics.slice(0, 4).map((brand, idx) => (
                  <div key={brand.brand} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{brand.brand}</h4>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-blue-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Unit</span>
                        <span className="font-semibold">{brand.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Revenue</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(brand.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Profit</span>
                        <span className="font-semibold text-green-600">{formatCurrency(brand.profit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Avg Profit</span>
                        <span className="font-semibold text-purple-600">{formatCurrency(brand.avgProfit)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}
