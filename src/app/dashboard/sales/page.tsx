'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CurrencyInput from '@/components/ui/CurrencyInput';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { sales as initialSales, cars, customers as initialCustomers, expenses, users } from '@/data/dummy';
import {
  formatCurrency,
  formatDate,
  generateId,
  generateDocNumber,
  getStatusDisplayName,
  getPaymentMethodDisplayName,
  calculateFinancialMetrics,
} from '@/lib/utils';
import { Sale, Customer, CustomerSource } from '@/types';
import {
  Plus,
  Eye,
  Trash2,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Printer,
} from 'lucide-react';

function SalesContent() {
  const { hasPermission, user } = useAuth();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{url: string, file?: File}>>([]);

  // Handle highlight from notification
  useEffect(() => {
    if (highlightId) {
      const sale = sales.find(s => s.id === highlightId);
      if (sale) {
        // Use setTimeout to avoid setState in effect body
        setTimeout(() => {
          setHighlightedId(highlightId);
          setSelectedSale(sale);
          setIsViewModalOpen(true);
        }, 0);
        
        // Remove highlight after 3 seconds
        const timer = setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [highlightId, sales]);

  // Form state
  const [formData, setFormData] = useState({
    carId: '',
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customerSource: '' as CustomerSource | '',
    soldBy: '',
    sellingPrice: '',
    paymentMethod: 'cash',
    downPayment: '',
    saleDate: new Date().toISOString().split('T')[0],
    photos: '',
    notes: '',
  });

  // Filtered customers for dropdown
  const filteredCustomersList = customers.filter(c => 
    c.isActive && 
    (c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
     c.phone.includes(customerSearchQuery))
  );

  // Available cars for sale
  const availableCars = cars.filter((c) => c.status === 'available' || c.status === 'reserved');

  // Filter sales
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const car = cars.find((c) => c.id === sale.carId);
      const matchesSearch =
        sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car?.specs.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car?.specs.model.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [sales, searchQuery, statusFilter]);

  // Stats using centralized calculation
  const { totalRevenue, netProfit } = calculateFinancialMetrics(cars, sales, expenses);
  const completedSales = sales.filter((s) => s.status === 'completed');
  const pendingSales = sales.filter((s) => s.status === 'pending');
  const totalPending = pendingSales.reduce((sum, s) => sum + s.sellingPrice, 0);
  
  // Use netProfit as totalProfit for consistency
  const totalProfit = netProfit;

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      completed: 'success',
      pending: 'warning',
      cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsViewModalOpen(true);
  };

  const handleDeleteSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSale) {
      setSales(sales.filter((s) => s.id !== selectedSale.id));
      setIsDeleteModalOpen(false);
      setSelectedSale(null);
    }
  };

  const handleUpdateStatus = (sale: Sale, newStatus: 'completed' | 'cancelled') => {
    setSales(
      sales.map((s) =>
        s.id === sale.id ? { ...s, status: newStatus } : s
      )
    );
  };

  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    const sellingPrice = parseInt(formData.sellingPrice);
    
    // Process photos array from uploaded files
    const photosArray = uploadedPhotos.map(p => p.url);
    
    const newSale: Sale = {
      id: generateId('sale'),
      saleNumber: generateDocNumber('INV', new Date(), sales.length + 1),
      carId: formData.carId,
      customerId: formData.customerId || undefined,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      customerAddress: formData.customerAddress,
      customerSource: formData.customerSource as CustomerSource,
      customerType: formData.customerId ? 'returning' : 'new',
      saleDate: formData.saleDate,
      sellingPrice: sellingPrice,
      paymentMethod: formData.paymentMethod as Sale['paymentMethod'],
      downPayment: formData.downPayment ? parseInt(formData.downPayment) : undefined,
      status: 'completed',
      soldBy: formData.soldBy,
      photos: photosArray.length > 0 ? photosArray : undefined,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };
    
    setSales([newSale, ...sales]);
    
    // Update customer stats if existing customer selected
    if (formData.customerId) {
      setCustomers(customers.map(c => 
        c.id === formData.customerId 
          ? {
              ...c,
              totalPurchases: c.totalPurchases + 1,
              totalSpent: c.totalSpent + sellingPrice,
              lastPurchaseDate: formData.saleDate,
            }
          : c
      ));
    }
    
    setIsAddModalOpen(false);
    setSelectedCustomerId('');
    setCustomerSearchQuery('');
    setUploadedPhotos([]);
    setFormData({
      carId: '',
      customerId: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      customerSource: '' as CustomerSource | '',
      soldBy: '',
      sellingPrice: '',
      paymentMethod: 'cash',
      downPayment: '',
      saleDate: new Date().toISOString().split('T')[0],
      photos: '',
      notes: '',
    });
  };

  // Handle photo file upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedPhotos(prev => [...prev, {
            url: reader.result as string,
            file: file
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
    // Reset input
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Handle customer selection from dropdown
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearchQuery(customer.name);
    setFormData({
      ...formData,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email || '',
      customerAddress: customer.address || '',
    });
    setShowCustomerDropdown(false);
  };

  // Handle new customer (clear selection)
  const handleNewCustomer = () => {
    setSelectedCustomerId('');
    setFormData({
      ...formData,
      customerId: '',
      customerName: customerSearchQuery,
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
    });
    setShowCustomerDropdown(false);
  };

  const handleCarSelect = (carId: string) => {
    const car = cars.find((c) => c.id === carId);
    setFormData({
      ...formData,
      carId,
      sellingPrice: car?.sellingPrice.toString() || '',
    });
  };

  // Print Invoice Function
  const handlePrintInvoice = (sale: Sale) => {
    const car = cars.find((c) => c.id === sale.carId);
    const profit = car ? sale.sellingPrice - car.hpp : 0;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${sale.saleNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f5f5f5; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6; }
          .company-info h1 { color: #3b82f6; font-size: 28px; margin-bottom: 5px; }
          .company-info p { color: #666; font-size: 14px; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { color: #333; font-size: 24px; margin-bottom: 10px; }
          .invoice-details p { color: #666; margin: 3px 0; }
          .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .status-completed { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-cancelled { background: #fee2e2; color: #dc2626; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
          .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; }
          .info-box h3 { font-size: 14px; color: #6b7280; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .info-row .label { color: #6b7280; }
          .info-row .value { font-weight: 500; color: #111; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .items-table th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; }
          .items-table td { padding: 15px 12px; border-bottom: 1px solid #e5e7eb; }
          .totals { margin-top: 30px; display: flex; justify-content: flex-end; }
          .totals-box { width: 300px; background: #f9fafb; padding: 20px; border-radius: 8px; }
          .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .total-row.grand { border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 15px; font-size: 18px; font-weight: 700; }
          .total-row.grand .value { color: #3b82f6; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #9ca3af; font-size: 12px; }
          .notes { background: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px; }
          .notes p { color: #92400e; font-size: 14px; }
          @media print {
            body { padding: 0; background: white; }
            .invoice-container { box-shadow: none; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-info">
              <h1>🚗 ERP Showroom</h1>
              <p>Showroom Mobil Bekas Berkualitas</p>
              <p>Jl. Otomotif No. 123, Jakarta</p>
              <p>Telp: (021) 1234-5678</p>
            </div>
            <div class="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>${sale.saleNumber}</strong></p>
              <p>Tanggal: ${formatDate(sale.saleDate)}</p>
              <p style="margin-top: 10px;">
                <span class="status status-${sale.status}">${getStatusDisplayName(sale.status)}</span>
              </p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <h3>Informasi Customer</h3>
              <div class="info-row"><span class="label">Nama</span><span class="value">${sale.customerName}</span></div>
              <div class="info-row"><span class="label">Telepon</span><span class="value">${sale.customerPhone}</span></div>
              ${sale.customerEmail ? `<div class="info-row"><span class="label">Email</span><span class="value">${sale.customerEmail}</span></div>` : ''}
              ${sale.customerAddress ? `<div class="info-row"><span class="label">Alamat</span><span class="value">${sale.customerAddress}</span></div>` : ''}
            </div>
            <div class="info-box">
              <h3>Informasi Pembayaran</h3>
              <div class="info-row"><span class="label">Metode</span><span class="value">${getPaymentMethodDisplayName(sale.paymentMethod)}</span></div>
              ${sale.downPayment ? `<div class="info-row"><span class="label">Uang Muka (DP)</span><span class="value">${formatCurrency(sale.downPayment)}</span></div>` : ''}
              <div class="info-row"><span class="label">Sales</span><span class="value">${sale.soldBy}</span></div>
            </div>
          </div>

          <div class="section" style="margin-top: 30px;">
            <div class="section-title">Detail Kendaraan</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Deskripsi</th>
                  <th>Tahun</th>
                  <th>Plat Nomor</th>
                  <th style="text-align: right;">Harga</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${car?.specs.brand} ${car?.specs.model}</strong><br>
                    <span style="color: #6b7280; font-size: 13px;">${car?.specs.transmission} • ${car?.specs.fuelType} • ${car?.specs.color}</span>
                  </td>
                  <td>${car?.specs.year}</td>
                  <td>${car?.specs.plateNumber}</td>
                  <td style="text-align: right; font-weight: 600;">${formatCurrency(sale.sellingPrice)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="totals">
            <div class="totals-box">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${formatCurrency(sale.sellingPrice)}</span>
              </div>
              ${sale.downPayment ? `
              <div class="total-row">
                <span>Uang Muka (DP)</span>
                <span>- ${formatCurrency(sale.downPayment)}</span>
              </div>
              <div class="total-row grand">
                <span>Sisa Pembayaran</span>
                <span class="value">${formatCurrency(sale.sellingPrice - sale.downPayment)}</span>
              </div>
              ` : `
              <div class="total-row grand">
                <span>Total</span>
                <span class="value">${formatCurrency(sale.sellingPrice)}</span>
              </div>
              `}
            </div>
          </div>

          ${sale.notes ? `
          <div class="notes">
            <strong>Catatan:</strong>
            <p>${sale.notes}</p>
          </div>
          ` : ''}

          <div class="footer">
            <p>Terima kasih atas kepercayaan Anda!</p>
            <p style="margin-top: 5px;">Invoice ini dicetak pada ${new Date().toLocaleString('id-ID')}</p>
            <p style="margin-top: 10px;">ERP Showroom - Sistem Manajemen Showroom Mobil</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <ProtectedRoute requiredModule="sales">
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Penjualan</h1>
                <p className="text-gray-600 mt-2">Kelola transaksi penjualan mobil</p>
              </div>
              {user?.role === 'owner' && hasPermission('sales', 'create') && (
                <Button
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Buat Penjualan
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Transaksi</p>
                  <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pendapatan</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Profit</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(totalProfit)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingSales.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari nomor invoice, customer, atau mobil..."
                className="sm:w-80"
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua Status' },
                  { value: 'completed', label: 'Selesai' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'cancelled', label: 'Dibatalkan' },
                ]}
                className="sm:w-48"
              />
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      No. Invoice
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Mobil
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Harga Jual
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSales.map((sale) => {
                    const car = cars.find((c) => c.id === sale.carId);
                    const profit = car ? sale.sellingPrice - car.hpp : 0;
                    const isHighlighted = highlightedId === sale.id;
                    return (
                      <tr 
                        key={sale.id} 
                        className={`hover:bg-gray-50 transition-all ${
                          isHighlighted ? 'bg-blue-100 animate-pulse' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-blue-600">{sale.saleNumber}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {formatDate(sale.saleDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-gray-900">
                              {car?.specs.brand} {car?.specs.model}
                            </p>
                            <p className="text-sm text-gray-500">{car?.specs.plateNumber}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-gray-900">{sale.customerName}</p>
                            <p className="text-sm text-gray-500">{sale.customerPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                          {formatCurrency(sale.sellingPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(profit)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(sale.status)}>
                            {getStatusDisplayName(sale.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSale(sale)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintInvoice(sale)}
                              title="Cetak Invoice"
                            >
                              <Printer className="h-4 w-4 text-blue-500" />
                            </Button>
                            {hasPermission('sales', 'delete') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSale(sale)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredSales.length === 0 && (
              <div className="text-center py-16">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada data penjualan
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Tidak ada penjualan yang sesuai dengan filter Anda'
                    : 'Belum ada transaksi penjualan. Mulai dengan membuat penjualan baru.'}
                </p>
                {hasPermission('sales', 'create') && !searchQuery && statusFilter === 'all' && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Buat Penjualan Pertama
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Detail Penjualan"
          size="lg"
        >
          {selectedSale && (
            <div className="space-y-6">
              {(() => {
                const car = cars.find((c) => c.id === selectedSale.carId);
                const profit = car ? selectedSale.sellingPrice - car.hpp : 0;
                return (
                  <>
                    {/* Invoice Header */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-green-600">Nomor Invoice</p>
                          <p className="text-xl font-bold text-green-900">
                            {selectedSale.saleNumber}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(selectedSale.status)} size="md">
                          {getStatusDisplayName(selectedSale.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Car Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Informasi Mobil
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Merk/Model</span>
                            <span className="font-medium">
                              {car?.specs.brand} {car?.specs.model}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tahun</span>
                            <span className="font-medium">{car?.specs.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Plat Nomor</span>
                            <span className="font-medium">{car?.specs.plateNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Informasi Customer
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nama</span>
                            <span className="font-medium">{selectedSale.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Telepon</span>
                            <span className="font-medium">{selectedSale.customerPhone}</span>
                          </div>
                          {selectedSale.customerEmail && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Email</span>
                              <span className="font-medium">{selectedSale.customerEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Informasi Pembayaran
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Metode Pembayaran</span>
                            <span className="font-medium">
                              {getPaymentMethodDisplayName(selectedSale.paymentMethod)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tanggal Penjualan</span>
                            <span className="font-medium">{formatDate(selectedSale.saleDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Dijual Oleh</span>
                            <span className="font-medium">{selectedSale.soldBy}</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Harga Jual</span>
                            <span className="font-bold text-lg">
                              {formatCurrency(selectedSale.sellingPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">HPP</span>
                            <span className="font-medium">{formatCurrency(car?.hpp || 0)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-700 font-medium">Profit</span>
                            <span className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(profit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedSale.notes && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Catatan</p>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {selectedSale.notes}
                        </p>
                      </div>
                    )}

                    {/* Print Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        variant="secondary"
                        onClick={() => setIsViewModalOpen(false)}
                      >
                        Tutup
                      </Button>
                      <Button
                        leftIcon={<Printer className="h-4 w-4" />}
                        onClick={() => handlePrintInvoice(selectedSale)}
                      >
                        Cetak Invoice
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </Modal>

        {/* Add Sale Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Buat Penjualan Baru"
          size="lg"
        >
          <form onSubmit={handleSubmitSale} className="space-y-6">
            {/* Select Car */}
            <div>
              <Select
                label="Pilih Mobil"
                value={formData.carId}
                onChange={(e) => handleCarSelect(e.target.value)}
                options={[
                  { value: '', label: 'Pilih mobil...' },
                  ...availableCars.map((car) => ({
                    value: car.id,
                    label: `${car.specs.brand} ${car.specs.model} (${car.specs.plateNumber}) - ${formatCurrency(car.sellingPrice)}`,
                  })),
                ]}
                required
              />
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Customer</h3>
              
              {/* Customer Search/Select */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cari atau Pilih Customer
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value);
                      setShowCustomerDropdown(true);
                      if (!e.target.value) {
                        setSelectedCustomerId('');
                        setFormData({
                          ...formData,
                          customerId: '',
                          customerName: '',
                          customerPhone: '',
                          customerEmail: '',
                          customerAddress: '',
                        });
                      }
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Ketik nama atau telepon customer..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {selectedCustomerId && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Customer Terdaftar
                    </span>
                  )}
                </div>
                
                {/* Customer Dropdown */}
                {showCustomerDropdown && customerSearchQuery && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomersList.length > 0 ? (
                      <>
                        {filteredCustomersList.slice(0, 5).map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.phone}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-400">{customer.totalPurchases} pembelian</div>
                                <div className="text-xs text-green-600">{formatCurrency(customer.totalSpent)}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : null}
                    
                    {/* Option to add new customer */}
                    <button
                      type="button"
                      onClick={handleNewCustomer}
                      className="w-full px-4 py-3 text-left hover:bg-green-50 bg-gray-50 border-t border-gray-200"
                    >
                      <div className="flex items-center text-green-600">
                        <Plus className="w-4 h-4 mr-2" />
                        <span>Tambah customer baru: <strong>{customerSearchQuery}</strong></span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nama Customer"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Masukkan nama lengkap customer"
                  required
                  disabled={!!selectedCustomerId}
                />
                <Input
                  label="No. Telepon"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  required
                  disabled={!!selectedCustomerId}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="contoh@email.com"
                  disabled={!!selectedCustomerId}
                />
                <Input
                  label="Alamat"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  placeholder="Alamat lengkap customer"
                  disabled={!!selectedCustomerId}
                />
              </div>
              
              {selectedCustomerId && (
                <p className="text-sm text-gray-500 mt-2">
                  * Data customer otomatis terisi. <button type="button" onClick={() => {
                    setSelectedCustomerId('');
                    setCustomerSearchQuery('');
                    setFormData({
                      ...formData,
                      customerId: '',
                      customerName: '',
                      customerPhone: '',
                      customerEmail: '',
                      customerAddress: '',
                    });
                  }} className="text-blue-600 hover:underline">Ganti customer</button>
                </p>
              )}

              {/* Customer Source Field */}
              <div className="mt-4">
                <Select
                  label="Sumber Informasi"
                  value={formData.customerSource}
                  onChange={(e) => setFormData({ ...formData, customerSource: e.target.value as CustomerSource })}
                  options={[
                    { value: '', label: 'Pilih sumber informasi...' },
                    { value: 'olx', label: 'OLX' },
                    { value: 'instagram', label: 'Instagram' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'tiktok', label: 'TikTok' },
                    { value: 'recommendation', label: 'Rekomendasi' },
                    { value: 'walkin', label: 'Walk In' },
                    { value: 'marketing', label: 'Marketing' },
                    { value: 'other', label: 'Lainnya' },
                  ]}
                  required
                />
              </div>

              {/* Sales Person Selection */}
              <div className="mt-4">
                <Select
                  label="Dijual Oleh (Sales)"
                  value={formData.soldBy}
                  onChange={(e) => setFormData({ ...formData, soldBy: e.target.value })}
                  options={[
                    { value: '', label: 'Pilih sales person...' },
                    ...users
                      .filter(u => u.isSalesPerson && u.isActive)
                      .map(u => ({
                        value: u.name,
                        label: u.name,
                      })),
                  ]}
                  required
                />
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pembayaran</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Tanggal Penjualan"
                  type="date"
                  value={formData.saleDate}
                  onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                  required
                />
                <CurrencyInput
                  label="Harga Jual"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="Masukkan harga jual"
                  required
                />
                <Select
                  label="Metode Pembayaran"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  options={[
                    { value: 'cash', label: 'Tunai' },
                    { value: 'transfer', label: 'Transfer Bank' },
                    { value: 'credit', label: 'Kredit' },
                    { value: 'leasing', label: 'Leasing' },
                  ]}
                />
                {(formData.paymentMethod === 'credit' || formData.paymentMethod === 'leasing') && (
                  <CurrencyInput
                    label="Uang Muka (DP)"
                    value={formData.downPayment}
                    onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                    placeholder="Masukkan jumlah uang muka"
                  />
                )}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Dokumentasi
                </label>
                
                {/* Upload Area */}
                <input
                  type="file"
                  id="photo-upload-sales"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload-sales"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-3xl text-gray-400 mb-1">📷</div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">Klik untuk upload</span> atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                </label>

                {/* Photo Counter */}
                {uploadedPhotos.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {uploadedPhotos.length} foto dipilih
                  </p>
                )}

                {/* Photo Previews */}
                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          Foto {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Textarea
                  label="Catatan"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tambahkan catatan atau informasi tambahan (opsional)"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
                Batal
              </Button>
              <Button type="submit">Simpan Penjualan</Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Hapus Penjualan"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus penjualan{' '}
              <span className="font-semibold">{selectedSale?.saleNumber}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Batal
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Hapus
              </Button>
            </div>
          </div>
        </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <SalesContent />
    </Suspense>
  );
}
