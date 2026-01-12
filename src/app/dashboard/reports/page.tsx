'use client';

import { useState, useMemo } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CurrencyInput from '@/components/ui/CurrencyInput';
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
    setExpenses([newExpense, ...expenses]);
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

  // SVG Icons for PDF (Lucide-style)
  const pdfIcons = {
    dollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    trendingDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>`,
    fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    barChart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>`,
    car: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>`,
    receipt: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 17.5v-11"></path></svg>`,
    pieChart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
    clipboard: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>`,
    target: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
    package: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>`,
  };

  // PDF Styles (shared)
  const getPDFStyles = () => `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      padding: 40px;
      color: #1f2937;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 3px solid #2563eb;
    }
    .header h1 {
      font-size: 32px;
      color: #1e3a8a;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .header .subtitle {
      color: #6b7280;
      font-size: 14px;
    }
    .header .company {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 8px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary.single { grid-template-columns: 1fr; }
    .summary.triple { grid-template-columns: repeat(3, 1fr); }
    .summary.quad { grid-template-columns: repeat(4, 1fr); }
    .summary-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
    }
    .summary-card .icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .summary-card .icon svg {
      width: 24px;
      height: 24px;
    }
    .summary-card.blue .icon svg { stroke: #2563eb; }
    .summary-card.green .icon svg { stroke: #059669; }
    .summary-card.red .icon svg { stroke: #dc2626; }
    .summary-card.yellow .icon svg { stroke: #d97706; }
    .summary-card.purple .icon svg { stroke: #7c3aed; }
    .section h2 svg {
      width: 20px;
      height: 20px;
      stroke: #2563eb;
    }
    .summary-card .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .summary-card .value {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .summary-card .sub {
      font-size: 12px;
      color: #6b7280;
    }
    .summary-card.positive .value { color: #059669; }
    .summary-card.negative .value { color: #dc2626; }
    .summary-card.neutral .value { color: #1f2937; }
    .summary-card.blue .value { color: #2563eb; }
    .summary-card.blue .icon { background: #dbeafe; }
    .summary-card.green .icon { background: #dcfce7; }
    .summary-card.red .icon { background: #fee2e2; }
    .summary-card.yellow .icon { background: #fef3c7; }
    .summary-card.purple .icon { background: #ede9fe; }
    
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section h2 {
      font-size: 20px;
      margin-bottom: 16px;
      color: #1e3a8a;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
      padding: 14px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }
    tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }
    tbody tr:hover {
      background-color: #f3f4f6;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-row {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
      font-weight: 700;
    }
    .positive { color: #059669; }
    .negative { color: #dc2626; }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
    }
    .footer p { margin-bottom: 4px; }
    .watermark {
      position: fixed;
      bottom: 20px;
      right: 20px;
      font-size: 10px;
      color: #d1d5db;
    }
    .highlight-box {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #a7f3d0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .highlight-box.warning {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-color: #fcd34d;
    }
    .highlight-box.danger {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border-color: #fca5a5;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-item {
      padding: 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .stat-item .stat-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-item .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-top: 4px;
    }
    @media print {
      body { padding: 20px; }
      .summary { page-break-inside: avoid; }
      .section { page-break-inside: avoid; }
    }
  `;

  const currentDate = new Date().toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // 1. Laporan Keuangan Lengkap
  const handleExportFullReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Keuangan Lengkap - ${currentDate}</title>
        <style>${getPDFStyles()}</style>
      </head>
      <body>
        <div class="header">
          <h1>${pdfIcons.barChart} Laporan Keuangan Lengkap</h1>
          <p class="subtitle">Periode: ${currentDate}</p>
          <p class="company">ERP Mobil Second - Showroom Management System</p>
        </div>

        <div class="summary quad">
          <div class="summary-card blue">
            <div class="icon blue">${pdfIcons.dollarSign}</div>
            <div class="label">Total Pendapatan</div>
            <div class="value">${formatCurrency(totalRevenue)}</div>
            <div class="sub">${completedSales.length} unit terjual</div>
          </div>
          <div class="summary-card positive green">
            <div class="icon green">${pdfIcons.trendingUp}</div>
            <div class="label">Gross Profit</div>
            <div class="value">${formatCurrency(grossProfit)}</div>
            <div class="sub">Margin: ${profitMargin}%</div>
          </div>
          <div class="summary-card negative red">
            <div class="icon red">${pdfIcons.trendingDown}</div>
            <div class="label">Total Biaya</div>
            <div class="value">${formatCurrency(totalExpenses)}</div>
            <div class="sub">${expenses.length} transaksi</div>
          </div>
          <div class="summary-card ${netProfit >= 0 ? 'positive green' : 'negative red'}">
            <div class="icon ${netProfit >= 0 ? 'green' : 'red'}">${pdfIcons.wallet}</div>
            <div class="label">Net Profit</div>
            <div class="value">${formatCurrency(netProfit)}</div>
            <div class="sub">Margin: ${netMargin}%</div>
          </div>
        </div>

        <div class="section">
          <h2>${pdfIcons.clipboard} Detail Profit per Unit</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Mobil</th>
                <th>Plat Nomor</th>
                <th class="text-right">HPP</th>
                <th class="text-right">Harga Jual</th>
                <th class="text-right">Profit</th>
                <th class="text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              ${soldCars.map((car, idx) => {
                const sale = completedSales.find(s => s.carId === car.id);
                const profit = sale ? sale.sellingPrice - car.hpp : 0;
                const margin = sale ? ((profit / sale.sellingPrice) * 100).toFixed(1) : '0';
                return `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td><strong>${car.specs.brand} ${car.specs.model}</strong><br/><small style="color:#6b7280">${car.specs.year}</small></td>
                    <td>${car.specs.plateNumber}</td>
                    <td class="text-right">${formatCurrency(car.hpp)}</td>
                    <td class="text-right">${formatCurrency(sale?.sellingPrice || 0)}</td>
                    <td class="text-right ${profit >= 0 ? 'positive' : 'negative'}"><strong>${formatCurrency(profit)}</strong></td>
                    <td class="text-right">${margin}%</td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>TOTAL</strong></td>
                <td class="text-right"><strong>${formatCurrency(totalHPP)}</strong></td>
                <td class="text-right"><strong>${formatCurrency(totalRevenue)}</strong></td>
                <td class="text-right positive"><strong>${formatCurrency(grossProfit)}</strong></td>
                <td class="text-right"><strong>${profitMargin}%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>${pdfIcons.receipt} Detail Biaya Operasional</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th class="text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map((expense, idx) => `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td>${new Date(expense.date).toLocaleDateString('id-ID')}</td>
                  <td><span style="background:#e5e7eb;padding:4px 8px;border-radius:4px;font-size:11px;">${expense.category}</span></td>
                  <td>${expense.description}</td>
                  <td class="text-right negative"><strong>${formatCurrency(expense.amount)}</strong></td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4"><strong>TOTAL BIAYA OPERASIONAL</strong></td>
                <td class="text-right negative"><strong>${formatCurrency(totalExpenses)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>${pdfIcons.pieChart} Ringkasan Laba Rugi</h2>
          <div class="highlight-box ${netProfit >= 0 ? '' : 'danger'}">
            <table style="box-shadow:none;margin:0;">
              <tbody>
                <tr><td style="border:none;">Pendapatan Penjualan</td><td class="text-right" style="border:none;"><strong>${formatCurrency(totalRevenue)}</strong></td></tr>
                <tr><td style="border:none;">Harga Pokok Penjualan (HPP)</td><td class="text-right" style="border:none;">- ${formatCurrency(totalHPP)}</td></tr>
                <tr style="border-top:2px solid #a7f3d0;"><td style="border:none;font-weight:700;">Laba Kotor</td><td class="text-right positive" style="border:none;"><strong>${formatCurrency(grossProfit)}</strong></td></tr>
                <tr><td style="border:none;">Biaya Operasional</td><td class="text-right" style="border:none;">- ${formatCurrency(totalExpenses)}</td></tr>
                <tr style="border-top:2px solid ${netProfit >= 0 ? '#a7f3d0' : '#fca5a5'};background:${netProfit >= 0 ? '#d1fae5' : '#fecaca'};"><td style="border:none;font-weight:700;font-size:16px;">LABA BERSIH</td><td class="text-right ${netProfit >= 0 ? 'positive' : 'negative'}" style="border:none;font-size:20px;"><strong>${formatCurrency(netProfit)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="footer">
          <p><strong>Dokumen Resmi</strong> - Dibuat otomatis oleh ERP Mobil Second</p>
          <p>Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</p>
        </div>
        <div class="watermark">ERP Mobil Second v1.0</div>

        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setIsExportMenuOpen(false);
  };

  // 2. Laporan Profit per Unit
  const handleExportProfitReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Sort by profit
    const sortedCars = [...soldCars].sort((a, b) => {
      const saleA = completedSales.find(s => s.carId === a.id);
      const saleB = completedSales.find(s => s.carId === b.id);
      const profitA = saleA ? saleA.sellingPrice - a.hpp : 0;
      const profitB = saleB ? saleB.sellingPrice - b.hpp : 0;
      return profitB - profitA;
    });

    const topProfit = sortedCars[0] ? (() => {
      const sale = completedSales.find(s => s.carId === sortedCars[0].id);
      return sale ? sale.sellingPrice - sortedCars[0].hpp : 0;
    })() : 0;

    const lowProfit = sortedCars[sortedCars.length - 1] ? (() => {
      const sale = completedSales.find(s => s.carId === sortedCars[sortedCars.length - 1].id);
      return sale ? sale.sellingPrice - sortedCars[sortedCars.length - 1].hpp : 0;
    })() : 0;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Profit per Unit - ${currentDate}</title>
        <style>${getPDFStyles()}</style>
      </head>
      <body>
        <div class="header">
          <h1>${pdfIcons.car} Laporan Profit per Unit</h1>
          <p class="subtitle">Analisis Profitabilitas Penjualan Kendaraan</p>
          <p class="company">Periode: ${currentDate}</p>
        </div>

        <div class="summary triple">
          <div class="summary-card positive green">
            <div class="icon green">${pdfIcons.trendingUp}</div>
            <div class="label">Profit Tertinggi</div>
            <div class="value">${formatCurrency(topProfit)}</div>
            <div class="sub">${sortedCars[0] ? `${sortedCars[0].specs.brand} ${sortedCars[0].specs.model}` : '-'}</div>
          </div>
          <div class="summary-card blue">
            <div class="icon blue">${pdfIcons.barChart}</div>
            <div class="label">Rata-rata Profit</div>
            <div class="value">${formatCurrency(avgProfit)}</div>
            <div class="sub">per unit kendaraan</div>
          </div>
          <div class="summary-card ${lowProfit >= 0 ? 'positive green' : 'negative red'}">
            <div class="icon ${lowProfit >= 0 ? 'green' : 'red'}">${pdfIcons.trendingDown}</div>
            <div class="label">Profit Terendah</div>
            <div class="value">${formatCurrency(lowProfit)}</div>
            <div class="sub">${sortedCars[sortedCars.length - 1] ? `${sortedCars[sortedCars.length - 1].specs.brand} ${sortedCars[sortedCars.length - 1].specs.model}` : '-'}</div>
          </div>
        </div>

        <div class="section">
          <h2>${pdfIcons.clipboard} Ranking Profit per Unit (Tertinggi ke Terendah)</h2>
          <table>
            <thead>
              <tr>
                <th class="text-center">Rank</th>
                <th>Kendaraan</th>
                <th>Spesifikasi</th>
                <th class="text-right">Modal (HPP)</th>
                <th class="text-right">Harga Jual</th>
                <th class="text-right">Profit</th>
                <th class="text-center">Margin</th>
              </tr>
            </thead>
            <tbody>
              ${sortedCars.map((car, idx) => {
                const sale = completedSales.find(s => s.carId === car.id);
                const profit = sale ? sale.sellingPrice - car.hpp : 0;
                const margin = sale ? ((profit / sale.sellingPrice) * 100).toFixed(1) : '0';
                const rankBadge = idx === 0 ? '<span style="background:linear-gradient(135deg,#ffd700,#ffb700);color:#7c2d12;padding:4px 10px;border-radius:20px;font-weight:700;">1st</span>' : idx === 1 ? '<span style="background:linear-gradient(135deg,#c0c0c0,#a0a0a0);color:#374151;padding:4px 10px;border-radius:20px;font-weight:700;">2nd</span>' : idx === 2 ? '<span style="background:linear-gradient(135deg,#cd7f32,#b87333);color:#fff;padding:4px 10px;border-radius:20px;font-weight:700;">3rd</span>' : `<span style="background:#f3f4f6;padding:4px 10px;border-radius:20px;font-weight:600;">#${idx + 1}</span>`;
                return `
                  <tr>
                    <td class="text-center">${rankBadge}</td>
                    <td><strong>${car.specs.brand} ${car.specs.model}</strong></td>
                    <td><small>${car.specs.year} • ${car.specs.plateNumber} • ${car.specs.transmission}</small></td>
                    <td class="text-right">${formatCurrency(car.hpp)}</td>
                    <td class="text-right">${formatCurrency(sale?.sellingPrice || 0)}</td>
                    <td class="text-right ${profit >= 0 ? 'positive' : 'negative'}"><strong>${formatCurrency(profit)}</strong></td>
                    <td class="text-center"><span style="background:${parseFloat(margin) >= 10 ? '#dcfce7' : parseFloat(margin) >= 5 ? '#fef3c7' : '#fee2e2'};padding:4px 8px;border-radius:12px;font-size:11px;font-weight:600;">${margin}%</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>${pdfIcons.target} Insight & Rekomendasi</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Total Unit Terjual</div>
              <div class="stat-value">${soldCars.length} Unit</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Gross Profit</div>
              <div class="stat-value positive">${formatCurrency(grossProfit)}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Rata-rata Margin</div>
              <div class="stat-value">${profitMargin}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Modal</div>
              <div class="stat-value">${formatCurrency(totalHPP)}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Laporan Analisis Profit</strong> - ERP Mobil Second</p>
          <p>Generated: ${new Date().toLocaleString('id-ID')}</p>
        </div>

        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setIsExportMenuOpen(false);
  };

  // 3. Laporan Biaya Operasional
  const handleExportExpenseReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Biaya Operasional - ${currentDate}</title>
        <style>${getPDFStyles()}</style>
      </head>
      <body>
        <div class="header">
          <h1>${pdfIcons.receipt} Laporan Biaya Operasional</h1>
          <p class="subtitle">Analisis Pengeluaran & Efisiensi Biaya</p>
          <p class="company">Periode: ${currentDate}</p>
        </div>

        <div class="summary">
          <div class="summary-card negative red">
            <div class="icon red">${pdfIcons.trendingDown}</div>
            <div class="label">Total Pengeluaran</div>
            <div class="value">${formatCurrency(totalExpenses)}</div>
            <div class="sub">${expenses.length} transaksi tercatat</div>
          </div>
          <div class="summary-card blue">
            <div class="icon blue">${pdfIcons.pieChart}</div>
            <div class="label">Rasio Biaya/Pendapatan</div>
            <div class="value">${totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%</div>
            <div class="sub">dari total pendapatan</div>
          </div>
        </div>

        <div class="section">
          <h2>${pdfIcons.pieChart} Breakdown per Kategori</h2>
          <table>
            <thead>
              <tr>
                <th>Kategori</th>
                <th class="text-right">Jumlah Transaksi</th>
                <th class="text-right">Total Biaya</th>
                <th class="text-right">Persentase</th>
              </tr>
            </thead>
            <tbody>
              ${expensesByCategory.map(cat => `
                <tr>
                  <td><strong>${cat.name}</strong></td>
                  <td class="text-right">${expenses.filter(e => e.category === cat.name).length}x</td>
                  <td class="text-right negative"><strong>${formatCurrency(cat.value)}</strong></td>
                  <td class="text-right">
                    <span style="background:#fee2e2;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;">
                      ${((cat.value / totalExpenses) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td><strong>TOTAL</strong></td>
                <td class="text-right"><strong>${expenses.length}x</strong></td>
                <td class="text-right negative"><strong>${formatCurrency(totalExpenses)}</strong></td>
                <td class="text-right"><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>${pdfIcons.fileText} Detail Transaksi</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th>Dibuat Oleh</th>
                <th class="text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense, idx) => `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td>${new Date(expense.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td><span style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:11px;">${expense.category}</span></td>
                  <td>${expense.description}</td>
                  <td><small>${expense.createdBy}</small></td>
                  <td class="text-right negative"><strong>${formatCurrency(expense.amount)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p><strong>Laporan Biaya Operasional</strong> - ERP Mobil Second</p>
          <p>Generated: ${new Date().toLocaleString('id-ID')}</p>
        </div>

        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setIsExportMenuOpen(false);
  };

  // 4. Laporan Laba Rugi (Income Statement)
  const handleExportIncomeStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Laba Rugi - ${currentDate}</title>
        <style>${getPDFStyles()}</style>
      </head>
      <body>
        <div class="header">
          <h1>${pdfIcons.trendingUp} Laporan Laba Rugi</h1>
          <p class="subtitle">Income Statement / Profit & Loss Report</p>
          <p class="company">Periode: ${currentDate}</p>
        </div>

        <div class="section">
          <table>
            <thead>
              <tr>
                <th colspan="2">LAPORAN LABA RUGI</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background:#f0f9ff;">
                <td colspan="2" style="font-weight:700;color:#1e40af;">PENDAPATAN</td>
              </tr>
              <tr>
                <td style="padding-left:32px;">Pendapatan Penjualan Kendaraan</td>
                <td class="text-right"><strong>${formatCurrency(totalRevenue)}</strong></td>
              </tr>
              <tr class="total-row">
                <td style="font-weight:700;">Total Pendapatan</td>
                <td class="text-right" style="font-weight:700;">${formatCurrency(totalRevenue)}</td>
              </tr>
              
              <tr style="background:#fef3c7;">
                <td colspan="2" style="font-weight:700;color:#92400e;">HARGA POKOK PENJUALAN</td>
              </tr>
              <tr>
                <td style="padding-left:32px;">HPP Kendaraan Terjual</td>
                <td class="text-right">${formatCurrency(totalHPP)}</td>
              </tr>
              <tr class="total-row">
                <td style="font-weight:700;">Total HPP</td>
                <td class="text-right" style="font-weight:700;">(${formatCurrency(totalHPP)})</td>
              </tr>

              <tr style="background:#dcfce7;">
                <td style="font-weight:700;font-size:16px;">LABA KOTOR (Gross Profit)</td>
                <td class="text-right positive" style="font-weight:700;font-size:16px;">${formatCurrency(grossProfit)}</td>
              </tr>

              <tr style="background:#fee2e2;">
                <td colspan="2" style="font-weight:700;color:#991b1b;">BIAYA OPERASIONAL</td>
              </tr>
              ${expensesByCategory.map(cat => `
                <tr>
                  <td style="padding-left:32px;">${cat.name}</td>
                  <td class="text-right">${formatCurrency(cat.value)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td style="font-weight:700;">Total Biaya Operasional</td>
                <td class="text-right" style="font-weight:700;">(${formatCurrency(totalExpenses)})</td>
              </tr>

              <tr style="background:${netProfit >= 0 ? '#bbf7d0' : '#fecaca'};border-top:3px solid ${netProfit >= 0 ? '#16a34a' : '#dc2626'};">
                <td style="font-weight:700;font-size:18px;">LABA BERSIH (Net Profit)</td>
                <td class="text-right ${netProfit >= 0 ? 'positive' : 'negative'}" style="font-weight:700;font-size:18px;">${formatCurrency(netProfit)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>${pdfIcons.pieChart} Rasio Keuangan</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Gross Profit Margin</div>
              <div class="stat-value">${profitMargin}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Net Profit Margin</div>
              <div class="stat-value">${netMargin}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Operating Expense Ratio</div>
              <div class="stat-value">${totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">ROI (Return on Investment)</div>
              <div class="stat-value">${totalHPP > 0 ? ((grossProfit / totalHPP) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Laporan Laba Rugi Resmi</strong> - ERP Mobil Second</p>
          <p>Generated: ${new Date().toLocaleString('id-ID')}</p>
        </div>

        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setIsExportMenuOpen(false);
  };

  // 5. Laporan Ringkasan Eksekutif
  const handleExportExecutiveSummary = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const performanceStatus = netProfit > 0 ? 'PROFIT' : 'LOSS';
    const performanceColor = netProfit > 0 ? '#059669' : '#dc2626';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Executive Summary - ${currentDate}</title>
        <style>${getPDFStyles()}</style>
      </head>
      <body>
        <div class="header">
          <h1>${pdfIcons.clipboard} Executive Summary</h1>
          <p class="subtitle">Ringkasan Kinerja Bisnis</p>
          <p class="company">Periode: ${currentDate}</p>
        </div>

        <div class="highlight-box ${netProfit >= 0 ? '' : 'danger'}" style="text-align:center;margin-bottom:40px;">
          <p style="font-size:14px;color:#6b7280;margin-bottom:8px;">Status Kinerja</p>
          <p style="font-size:48px;font-weight:800;color:${performanceColor};margin-bottom:8px;">${performanceStatus}</p>
          <p style="font-size:32px;font-weight:700;color:${performanceColor};">${formatCurrency(netProfit)}</p>
        </div>

        <div class="summary quad">
          <div class="summary-card blue">
            <div class="label">Revenue</div>
            <div class="value">${formatCurrency(totalRevenue)}</div>
          </div>
          <div class="summary-card positive green">
            <div class="label">Gross Profit</div>
            <div class="value">${formatCurrency(grossProfit)}</div>
          </div>
          <div class="summary-card negative red">
            <div class="label">Expenses</div>
            <div class="value">${formatCurrency(totalExpenses)}</div>
          </div>
          <div class="summary-card ${netProfit >= 0 ? 'positive green' : 'negative red'}">
            <div class="label">Net Profit</div>
            <div class="value">${formatCurrency(netProfit)}</div>
          </div>
        </div>

        <div class="section">
          <h2>${pdfIcons.trendingUp} Key Performance Indicators</h2>
          <table>
            <thead>
              <tr>
                <th>Indikator</th>
                <th class="text-center">Nilai</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gross Profit Margin</td>
                <td class="text-center"><strong>${profitMargin}%</strong></td>
                <td class="text-center"><span style="background:${parseFloat(profitMargin) >= 15 ? '#dcfce7' : parseFloat(profitMargin) >= 10 ? '#fef3c7' : '#fee2e2'};padding:6px 12px;border-radius:20px;font-weight:600;font-size:11px;">${parseFloat(profitMargin) >= 15 ? 'EXCELLENT' : parseFloat(profitMargin) >= 10 ? 'GOOD' : 'NEEDS IMPROVEMENT'}</span></td>
              </tr>
              <tr>
                <td>Net Profit Margin</td>
                <td class="text-center"><strong>${netMargin}%</strong></td>
                <td class="text-center"><span style="background:${parseFloat(netMargin) >= 10 ? '#dcfce7' : parseFloat(netMargin) >= 5 ? '#fef3c7' : '#fee2e2'};padding:6px 12px;border-radius:20px;font-weight:600;font-size:11px;">${parseFloat(netMargin) >= 10 ? 'EXCELLENT' : parseFloat(netMargin) >= 5 ? 'GOOD' : 'NEEDS IMPROVEMENT'}</span></td>
              </tr>
              <tr>
                <td>Unit Terjual</td>
                <td class="text-center"><strong>${completedSales.length} Unit</strong></td>
                <td class="text-center"><span style="background:#dbeafe;padding:6px 12px;border-radius:20px;font-weight:600;font-size:11px;">DATA</span></td>
              </tr>
              <tr>
                <td>Rata-rata Profit/Unit</td>
                <td class="text-center"><strong>${formatCurrency(avgProfit)}</strong></td>
                <td class="text-center"><span style="background:${avgProfit >= 15000000 ? '#dcfce7' : avgProfit >= 10000000 ? '#fef3c7' : '#fee2e2'};padding:6px 12px;border-radius:20px;font-weight:600;font-size:11px;">${avgProfit >= 15000000 ? 'HIGH' : avgProfit >= 10000000 ? 'MEDIUM' : 'LOW'}</span></td>
              </tr>
              <tr>
                <td>Operating Expense Ratio</td>
                <td class="text-center"><strong>${totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%</strong></td>
                <td class="text-center"><span style="background:${totalRevenue > 0 && (totalExpenses / totalRevenue) * 100 <= 10 ? '#dcfce7' : '#fef3c7'};padding:6px 12px;border-radius:20px;font-weight:600;font-size:11px;">${totalRevenue > 0 && (totalExpenses / totalRevenue) * 100 <= 10 ? 'EFFICIENT' : 'NORMAL'}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>${pdfIcons.target} Rekomendasi</h2>
          <div style="background:#f8fafc;padding:24px;border-radius:12px;border-left:4px solid #2563eb;">
            <ul style="margin:0;padding-left:20px;line-height:2;">
              <li>Fokus pada unit dengan margin tinggi untuk meningkatkan profitabilitas</li>
              <li>Review biaya operasional untuk efisiensi lebih baik</li>
              <li>Tingkatkan volume penjualan dengan tetap menjaga margin</li>
              <li>Monitor cash flow secara regular</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p><strong>Executive Summary Report</strong> - Confidential</p>
          <p>ERP Mobil Second | Generated: ${new Date().toLocaleString('id-ID')}</p>
        </div>

        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setIsExportMenuOpen(false);
  };

  // 6. Laporan Inventory Valuation
  const handleExportInventoryValuation = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const availableCars = cars.filter(c => c.status === 'available' || c.status === 'maintenance');
    const totalInventoryValue = availableCars.reduce((sum, car) => sum + car.hpp, 0);
    const totalSellingValue = availableCars.reduce((sum, car) => sum + car.sellingPrice, 0);
    const potentialProfit = totalSellingValue - totalInventoryValue;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inventory Valuation - ${currentDate}</title>
        <style>${getPDFStyles()}</style>
      </head>
      <body>
        <div class="header">
          <h1>${pdfIcons.car} Laporan Valuasi Inventory</h1>
          <p class="subtitle">Stock Valuation & Potential Revenue</p>
          <p class="company">Per Tanggal: ${currentDate}</p>
        </div>

        <div class="summary triple">
          <div class="summary-card blue">
            <div class="icon blue">${pdfIcons.package}</div>
            <div class="label">Total Unit</div>
            <div class="value">${availableCars.length}</div>
            <div class="sub">unit tersedia</div>
          </div>
          <div class="summary-card neutral">
            <div class="icon yellow">${pdfIcons.dollarSign}</div>
            <div class="label">Nilai Inventory (HPP)</div>
            <div class="value">${formatCurrency(totalInventoryValue)}</div>
            <div class="sub">modal tertanam</div>
          </div>
          <div class="summary-card positive green">
            <div class="icon green">${pdfIcons.trendingUp}</div>
            <div class="label">Potensi Profit</div>
            <div class="value">${formatCurrency(potentialProfit)}</div>
            <div class="sub">jika semua terjual</div>
          </div>
        </div>

        <div class="section">
          <h2>${pdfIcons.fileText} Detail Inventory</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Kendaraan</th>
                <th>Plat Nomor</th>
                <th class="text-center">Status</th>
                <th class="text-right">HPP</th>
                <th class="text-right">Harga Jual</th>
                <th class="text-right">Potensi Profit</th>
              </tr>
            </thead>
            <tbody>
              ${availableCars.map((car, idx) => {
                const profit = car.sellingPrice - car.hpp;
                const margin = ((profit / car.sellingPrice) * 100).toFixed(1);
                return `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td><strong>${car.specs.brand} ${car.specs.model}</strong><br/><small style="color:#6b7280;">${car.specs.year} • ${car.specs.transmission}</small></td>
                    <td>${car.specs.plateNumber}</td>
                    <td class="text-center"><span style="background:${car.status === 'available' ? '#dcfce7' : '#fef3c7'};color:${car.status === 'available' ? '#166534' : '#92400e'};padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;">${car.status === 'available' ? 'READY' : 'SERVICE'}</span></td>
                    <td class="text-right">${formatCurrency(car.hpp)}</td>
                    <td class="text-right">${formatCurrency(car.sellingPrice)}</td>
                    <td class="text-right positive"><strong>${formatCurrency(profit)}</strong><br/><small>${margin}%</small></td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td colspan="4"><strong>TOTAL</strong></td>
                <td class="text-right"><strong>${formatCurrency(totalInventoryValue)}</strong></td>
                <td class="text-right"><strong>${formatCurrency(totalSellingValue)}</strong></td>
                <td class="text-right positive"><strong>${formatCurrency(potentialProfit)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p><strong>Inventory Valuation Report</strong> - ERP Mobil Second</p>
          <p>Generated: ${new Date().toLocaleString('id-ID')}</p>
        </div>

        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
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
                      className="fixed inset-0 z-10"
                      onClick={() => setIsExportMenuOpen(false)}
                    />
                    <div className="fixed left-1/2 -translate-x-1/2 top-20 sm:absolute sm:left-auto sm:right-0 sm:translate-x-0 sm:top-full mt-2 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 z-20 max-h-[70vh] sm:max-h-[85vh] overflow-y-auto">
                      <div className="p-5">
                        <div className="mb-5 pb-4 border-b border-gray-100">
                          <h3 className="text-base font-bold text-gray-900 mb-1">Pilih Laporan</h3>
                          <p className="text-xs text-gray-500">Download laporan PDF profesional</p>
                        </div>
                        
                        <div className="space-y-2.5">
                          {/* 1. Laporan Keuangan Lengkap */}
                          <button
                            onClick={handleExportFullReport}
                            className="flex w-full items-start rounded-xl px-3.5 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all border border-transparent hover:border-blue-200 hover:shadow-sm group relative"
                          >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-3.5 text-left flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-semibold text-gray-900 text-sm leading-tight">Laporan Keuangan Lengkap</p>
                                <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide">RECOMMENDED</span>
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed">Semua data keuangan dalam 1 dokumen</p>
                            </div>
                          </button>

                          {/* 2. Laporan Laba Rugi */}
                          <button
                            onClick={handleExportIncomeStatement}
                            className="flex w-full items-start rounded-xl px-3.5 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all border border-transparent hover:border-green-200 hover:shadow-sm group"
                          >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-3.5 text-left flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">Laporan Laba Rugi</p>
                              <p className="text-xs text-gray-500 leading-relaxed">Income Statement & Profit/Loss</p>
                            </div>
                          </button>

                          {/* 3. Executive Summary */}
                          <button
                            onClick={handleExportExecutiveSummary}
                            className="flex w-full items-start rounded-xl px-3.5 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all border border-transparent hover:border-purple-200 hover:shadow-sm group"
                          >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                              <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-3.5 text-left flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-semibold text-gray-900 text-sm leading-tight">Executive Summary</p>
                                <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide">EXECUTIVE</span>
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed">Ringkasan KPI & Performa Bisnis</p>
                            </div>
                          </button>

                          <div className="border-t border-gray-100 my-3.5"></div>

                          {/* 4. Profit per Unit */}
                          <button
                            onClick={handleExportProfitReport}
                            className="flex w-full items-start rounded-xl px-3.5 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 transition-all border border-transparent hover:border-amber-200 hover:shadow-sm group"
                          >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                              <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-3.5 text-left flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">Analisis Profit per Unit</p>
                              <p className="text-xs text-gray-500 leading-relaxed">Ranking & detail profit kendaraan</p>
                            </div>
                          </button>

                          {/* 5. Biaya Operasional */}
                          <button
                            onClick={handleExportExpenseReport}
                            className="flex w-full items-start rounded-xl px-3.5 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all border border-transparent hover:border-red-200 hover:shadow-sm group"
                          >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                              <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-3.5 text-left flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">Laporan Biaya Operasional</p>
                              <p className="text-xs text-gray-500 leading-relaxed">Detail pengeluaran & kategori</p>
                            </div>
                          </button>

                          {/* 6. Inventory Valuation */}
                          <button
                            onClick={handleExportInventoryValuation}
                            className="flex w-full items-start rounded-xl px-3.5 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 transition-all border border-transparent hover:border-cyan-200 hover:shadow-sm group"
                          >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                              <Sheet className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-3.5 text-left flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">Valuasi Inventory</p>
                              <p className="text-xs text-gray-500 leading-relaxed">Nilai stok & potensi pendapatan</p>
                            </div>
                          </button>
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-100">
                          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                            Semua laporan dalam format PDF siap cetak
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Total Pendapatan</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {completedSales.length} mobil terjual
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg shrink-0 ml-3">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Gross Profit</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(grossProfit)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Margin: {profitMargin}%</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg shrink-0 ml-3">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Biaya Operasional</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(totalExpenses)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {expenses.length} transaksi
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-red-100 rounded-lg shrink-0 ml-3">
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Net Profit</p>
                  <p
                    className={`text-xl sm:text-2xl font-bold mt-1 ${
                      netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(netProfit)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Margin: {netMargin}%</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg shrink-0 ml-3 ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <FileText className={`h-5 w-5 sm:h-6 sm:w-6 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Professional Profit Trend Chart */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                      Trend Profitabilitas Bulanan
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Periode: Juni - Desember 2025
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                      <span className="text-gray-600">Gross Profit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                      <span className="text-gray-600">Net Profit</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="px-6 py-5">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grossProfitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.02}/>
                        </linearGradient>
                        <linearGradient id="netProfitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02}/>
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
                        dy={8}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                        tickLine={false}
                        axisLine={{ stroke: '#d1d5db', strokeWidth: 1.5 }}
                        tickFormatter={(value) => `${value >= 0 ? '' : '-'}Rp ${Math.abs(value / 1000000)}jt`}
                        width={70}
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
                        formatter={(value: any) => [formatCurrency(Number(value)), '']}
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
                      <Area
                        type="monotone"
                        dataKey="grossProfit"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#grossProfitGradient)"
                        name="Gross Profit"
                        dot={{ fill: '#10b981', r: 3, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="netProfit"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="url(#netProfitGradient)"
                        name="Net Profit"
                        dot={{ fill: '#3b82f6', r: 3, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Professional Summary Cards */}
              <div className="px-6 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Gross Profit Card */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-100 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                        Gross Profit YTD
                      </p>
                      <p className="text-sm sm:text-lg font-bold text-emerald-900 tracking-tight break-words">
                        {formatCurrency(grossProfit)}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1 font-medium">
                        Margin: {profitMargin}%
                      </p>
                    </div>
                  </div>

                  {/* Net Profit Card */}
                  <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-blue-50 to-indigo-50 border-blue-100' : 'from-red-50 to-rose-50 border-red-100'} rounded-lg p-4 border shadow-sm`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {netProfit >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${netProfit >= 0 ? 'text-blue-700' : 'text-red-700'} uppercase tracking-wide mb-1`}>
                        Net Profit YTD
                      </p>
                      <p className={`text-sm sm:text-lg font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-red-900'} tracking-tight break-words`}>
                        {formatCurrency(netProfit)}
                      </p>
                      <p className={`text-xs ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'} mt-1 font-medium`}>
                        Margin: {netMargin}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Expense Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Breakdown Biaya Operasional
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
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
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {expensesByCategory.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Professional Revenue vs Cost Analysis */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    Analisis Pendapatan vs Biaya Bulanan
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Perbandingan pendapatan, HPP, dan biaya operasional
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span className="text-gray-600">Pendapatan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-rose-500"></div>
                    <span className="text-gray-600">HPP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-orange-500"></div>
                    <span className="text-gray-600">Biaya Operasional</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="px-6 py-5">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                    <defs>
                      <linearGradient id="pendapatanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.85}/>
                      </linearGradient>
                      <linearGradient id="hppGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#e11d48" stopOpacity={0.85}/>
                      </linearGradient>
                      <linearGradient id="biayaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fb923c" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.85}/>
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
                      tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}jt`}
                      width={70}
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
                      formatter={(value: any) => [formatCurrency(Number(value)), '']}
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
                      dataKey="pendapatan" 
                      fill="url(#pendapatanGrad)" 
                      name="Pendapatan"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                    <Bar 
                      dataKey="hpp" 
                      fill="url(#hppGrad)" 
                      name="HPP"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                    <Bar 
                      dataKey="biaya" 
                      fill="url(#biayaGrad)" 
                      name="Biaya Operasional"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Professional KPI Cards */}
            <div className="px-6 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Rata-rata Pendapatan Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-white rounded-lg shadow-sm">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">
                      Rata-rata Pendapatan
                    </p>
                    <p className="text-xl font-bold text-blue-900 tracking-tight">
                      {formatCurrency(monthlyData.reduce((sum, d) => sum + d.pendapatan, 0) / monthlyData.filter(d => d.pendapatan > 0).length || 0)}
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Per bulan aktif
                    </p>
                  </div>
                </div>

                {/* Rata-rata HPP Card */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-white rounded-lg shadow-sm">
                      <TrendingDown className="h-5 w-5 text-rose-600" />
                    </div>
                    <div className="w-3 h-3 rounded bg-rose-500"></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide mb-1.5">
                      Rata-rata HPP
                    </p>
                    <p className="text-xl font-bold text-rose-900 tracking-tight">
                      {formatCurrency(monthlyData.reduce((sum, d) => sum + d.hpp, 0) / monthlyData.filter(d => d.hpp > 0).length || 0)}
                    </p>
                    <p className="text-xs text-rose-600 mt-2 font-medium">
                      Harga pokok penjualan
                    </p>
                  </div>
                </div>

                {/* Rata-rata Biaya Card */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-white rounded-lg shadow-sm">
                      <Wallet className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="w-3 h-3 rounded bg-orange-500"></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1.5">
                      Rata-rata Biaya
                    </p>
                    <p className="text-xl font-bold text-orange-900 tracking-tight">
                      {formatCurrency(monthlyData.reduce((sum, d) => sum + d.biaya, 0) / monthlyData.length)}
                    </p>
                    <p className="text-xs text-orange-600 mt-2 font-medium">
                      Biaya operasional bulanan
                    </p>
                  </div>
                </div>
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
                  {[...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
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
                      {[...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <p className="text-blue-200 text-xs sm:text-sm">Total Pendapatan</p>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold break-words">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-200 text-xs sm:text-sm">Total HPP</p>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold break-words">{formatCurrency(totalHPP)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-200 text-xs sm:text-sm">Gross Profit</p>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold break-words">{formatCurrency(grossProfit)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-200 text-xs sm:text-sm">Biaya Operasional</p>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold break-words">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="col-span-2 md:col-span-1 bg-white/10 rounded-lg p-3 sm:p-4 space-y-1">
                <p className="text-blue-200 text-xs sm:text-sm">Net Profit</p>
                <p className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words ${netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
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
            <CurrencyInput
              label="Jumlah"
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
