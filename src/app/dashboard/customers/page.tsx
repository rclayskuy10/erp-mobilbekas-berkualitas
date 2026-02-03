'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Phone, Mail, MapPin, Calendar, Briefcase, CreditCard, ShoppingBag, TrendingUp, Plus, Edit2, Trash2, Search, Filter, Download } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Customer } from '@/types';
import { customers as initialCustomers } from '@/data/dummy';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function CustomerContent() {
  const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    idCard: '',
    dateOfBirth: '',
    occupation: '',
    notes: '',
    isActive: true,
  });

  const handleAddCustomer = () => {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email,
      address: formData.address,
      idCard: formData.idCard,
      dateOfBirth: formData.dateOfBirth,
      occupation: formData.occupation,
      totalPurchases: 0,
      totalSpent: 0,
      notes: formData.notes,
      isActive: formData.isActive ?? true,
      createdAt: new Date().toISOString(),
    };

    setCustomers([newCustomer, ...customers]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer) return;

    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id 
        ? { ...c, ...formData }
        : c
    ));
    setShowEditModal(false);
    setSelectedCustomer(null);
    resetForm();
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus customer ini?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      idCard: '',
      dateOfBirth: '',
      occupation: '',
      notes: '',
      isActive: true,
    });
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setShowEditModal(true);
  };

  const openDetailModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && customer.isActive) ||
      (filterStatus === 'inactive' && !customer.isActive);

    return matchesSearch && matchesFilter;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const totalPurchases = customers.reduce((sum, c) => sum + c.totalPurchases, 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF('portrait');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header Background
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Company Logo (white circle with text)
    doc.setFillColor(255, 255, 255);
    doc.circle(22, 20, 10, 'F');
    doc.setFontSize(9);
    doc.setTextColor(59, 130, 246);
    doc.text('ERP', 16, 22);
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('LAPORAN DATA CUSTOMER', 40, 18);
    
    // Subtitle
    doc.setFontSize(9);
    doc.text('ERP Mobil Second - Showroom Management System', 40, 26);
    doc.text('Tanggal: ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 40, 33);
    
    // Summary Cards Section
    const cardY = 50;
    const cardWidth = 44;
    const cardHeight = 22;
    const startX = 14;
    const gap = 3;
    
    // Card 1 - Total Customer (Blue)
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(startX, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.roundedRect(startX, cardY, cardWidth, cardHeight, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Customer', startX + 4, cardY + 8);
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text(String(totalCustomers), startX + 4, cardY + 17);
    
    // Card 2 - Customer Aktif (Green)
    const card2X = startX + cardWidth + gap;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Customer Aktif', card2X + 4, cardY + 8);
    doc.setFontSize(16);
    doc.setTextColor(34, 197, 94);
    doc.text(String(activeCustomers), card2X + 4, cardY + 17);
    
    // Card 3 - Total Transaksi (Purple)
    const card3X = card2X + cardWidth + gap;
    doc.setFillColor(250, 245, 255);
    doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(168, 85, 247);
    doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Transaksi', card3X + 4, cardY + 8);
    doc.setFontSize(16);
    doc.setTextColor(168, 85, 247);
    doc.text(totalPurchases + ' unit', card3X + 4, cardY + 17);
    
    // Card 4 - Revenue (Orange)
    const card4X = card3X + cardWidth + gap;
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(card4X, cardY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(249, 115, 22);
    doc.roundedRect(card4X, cardY, cardWidth, cardHeight, 2, 2, 'S');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Revenue', card4X + 4, cardY + 8);
    doc.setFontSize(11);
    doc.setTextColor(249, 115, 22);
    const revenueInBillion = (totalRevenue / 1000000000).toFixed(2);
    doc.text('Rp ' + revenueInBillion + ' M', card4X + 4, cardY + 17);

    // Table Section Title
    const tableHeaderY = cardY + cardHeight + 8;
    doc.setFillColor(248, 250, 252);
    doc.rect(startX, tableHeaderY, pageWidth - 28, 8, 'F');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('Daftar Customer (' + filteredCustomers.length + ' data)', startX + 3, tableHeaderY + 5.5);

    // Prepare table data
    const tableData = filteredCustomers.map((customer, index) => [
      String(index + 1),
      customer.name,
      customer.phone,
      customer.email || '-',
      customer.occupation || '-',
      customer.totalPurchases + ' unit',
      formatCurrency(customer.totalSpent),
      customer.isActive ? 'Aktif' : 'Tidak Aktif'
    ]);

    // Generate table
    autoTable(doc, {
      startY: tableHeaderY + 10,
      head: [['No', 'Nama Customer', 'Telepon', 'Email', 'Pekerjaan', 'Beli', 'Total Nilai', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [59, 130, 246],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 3
      },
      bodyStyles: { 
        fontSize: 7,
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 32 },
        2: { cellWidth: 24 },
        3: { cellWidth: 32 },
        4: { cellWidth: 22 },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 28, halign: 'right' },
        7: { cellWidth: 18, halign: 'center' }
      },
      margin: { left: startX, right: startX },
      didParseCell: function(data) {
        if (data.column.index === 7 && data.section === 'body') {
          const cellValue = String(data.cell.raw);
          if (cellValue === 'Aktif') {
            data.cell.styles.textColor = [34, 197, 94];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [234, 179, 8];
          }
        }
      }
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(startX, pageHeight - 12, pageWidth - startX, pageHeight - 12);
      
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text('ERP Mobil Second - Laporan digenerate otomatis', startX, pageHeight - 6);
      doc.text('Halaman ' + i + ' / ' + pageCount, pageWidth - 35, pageHeight - 6);
    }

    // Save PDF
    doc.save('customer_report_' + new Date().toISOString().split('T')[0] + '.pdf');
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola data customer dan riwayat pembelian</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg w-fit mb-2 sm:mb-0">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalCustomers}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Customer</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg w-fit mb-2 sm:mb-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{activeCustomers}</div>
            <div className="text-xs sm:text-sm text-gray-600">Customer Aktif</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg w-fit mb-2 sm:mb-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{totalPurchases}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Transaksi</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg w-fit mb-2 sm:mb-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Cari customer (nama, telepon, email)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex-1 sm:flex-none sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>

              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={handleExportToPDF}
                  className="flex-1 sm:flex-none text-sm sm:text-base px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  <Download className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>

                {hasPermission('customers', 'create') && (
                  <Button 
                    onClick={() => setShowAddModal(true)}
                    className="flex-1 sm:flex-none text-sm sm:text-base px-3 sm:px-4 py-2.5 sm:py-3"
                  >
                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Tambah Customer</span>
                    <span className="sm:hidden">Tambah</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Mobile Cards View */}
          <div className="block lg:hidden">
            {filteredCustomers.map((customer) => (
              <div 
                key={customer.id} 
                onClick={() => openDetailModal(customer)}
                className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-base">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.id}</div>
                  </div>
                  <Badge variant={customer.isActive ? 'success' : 'warning'} size="sm">
                    {customer.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Kontak</div>
                    <div className="flex items-center text-sm text-gray-900 mb-1">
                      <Phone className="w-3 h-3 mr-1 text-gray-400" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Mail className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Transaksi</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {customer.totalPurchases} unit
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </div>
                  </div>
                </div>
                
                {customer.occupation && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Pekerjaan</div>
                    <div className="text-sm text-gray-900">{customer.occupation}</div>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Last: {formatDate(customer.lastPurchaseDate)}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(customer);
                      }}
                      className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition-colors"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomer(customer.id);
                      }}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Hapus Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">Tidak ada customer ditemukan</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pekerjaan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Pembelian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Nilai
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Purchase
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => openDetailModal(customer)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.occupation || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {customer.totalPurchases} unit
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(customer.lastPurchaseDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={customer.isActive ? 'success' : 'warning'}>
                        {customer.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(customer);
                          }}
                          className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomer(customer.id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Tidak ada customer ditemukan</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Customer Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          title="Tambah Customer Baru"
        >
          <div className="space-y-4">
            <Input
              label="Nama Customer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="No. Telepon"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <Input
              label="Alamat"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat lengkap"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="No. KTP"
                value={formData.idCard || ''}
                onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                placeholder="16 digit"
              />

              <Input
                label="Tanggal Lahir"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <Input
              label="Pekerjaan"
              value={formData.occupation || ''}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="Pekerjaan"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Catatan tambahan..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Customer Aktif
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button onClick={handleAddCustomer}>
                Simpan Customer
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Customer Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCustomer(null);
            resetForm();
          }}
          title="Edit Customer"
        >
          <div className="space-y-4">
            <Input
              label="Nama Customer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="No. Telepon"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <Input
              label="Alamat"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat lengkap"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="No. KTP"
                value={formData.idCard || ''}
                onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                placeholder="16 digit"
              />

              <Input
                label="Tanggal Lahir"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <Input
              label="Pekerjaan"
              value={formData.occupation || ''}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="Pekerjaan"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Catatan tambahan..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActiveEdit"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActiveEdit" className="ml-2 text-sm text-gray-700">
                Customer Aktif
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCustomer(null);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button onClick={handleEditCustomer}>
                Update Customer
              </Button>
            </div>
          </div>
        </Modal>

        {/* Detail Customer Modal */}
        {selectedCustomer && (
          <Modal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedCustomer(null);
            }}
            title="Detail Customer"
          >
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {selectedCustomer.name}
                </h3>
                <p className="text-sm text-gray-600">{selectedCustomer.id}</p>
                <div className="mt-3">
                  <Badge variant={selectedCustomer.isActive ? 'success' : 'warning'}>
                    {selectedCustomer.isActive ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Informasi Kontak</h4>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Telepon</div>
                      <div className="text-gray-900">{selectedCustomer.phone}</div>
                    </div>
                  </div>
                  {selectedCustomer.email && (
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="text-gray-900">{selectedCustomer.email}</div>
                      </div>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-600">Alamat</div>
                        <div className="text-gray-900">{selectedCustomer.address}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Informasi Pribadi</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedCustomer.idCard && (
                    <div>
                      <div className="text-sm text-gray-600">No. KTP</div>
                      <div className="text-gray-900">{selectedCustomer.idCard}</div>
                    </div>
                  )}
                  {selectedCustomer.dateOfBirth && (
                    <div>
                      <div className="text-sm text-gray-600">Tanggal Lahir</div>
                      <div className="text-gray-900">{formatDate(selectedCustomer.dateOfBirth)}</div>
                    </div>
                  )}
                  {selectedCustomer.occupation && (
                    <div>
                      <div className="text-sm text-gray-600">Pekerjaan</div>
                      <div className="text-gray-900">{selectedCustomer.occupation}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase History */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Riwayat Pembelian</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Pembelian</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedCustomer.totalPurchases} unit
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Nilai</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </div>
                  </div>
                </div>
                {selectedCustomer.lastPurchaseDate && (
                  <div className="text-sm text-gray-600">
                    Pembelian Terakhir: {formatDate(selectedCustomer.lastPurchaseDate)}
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Catatan</h4>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}

              {/* Registration Date */}
              <div className="text-sm text-gray-500 pt-4 border-t">
                Terdaftar sejak: {formatDate(selectedCustomer.createdAt)}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    }>
      <CustomerContent />
    </Suspense>
  );
}
