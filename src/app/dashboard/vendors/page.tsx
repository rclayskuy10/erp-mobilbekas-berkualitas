'use client';

import { useState, useMemo } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import { vendors as initialVendors } from '@/data/dummy';
import { formatCurrency, generateId } from '@/lib/utils';
import { Vendor } from '@/types';
import {
  Plus,
  Eye,
  Edit,
  Star,
  Building2,
  User,
  Gavel,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Package,
} from 'lucide-react';

const vendorTypeOptions = [
  { value: 'individual', label: 'Perorangan' },
  { value: 'showroom', label: 'Showroom' },
  { value: 'leasing', label: 'Leasing' },
  { value: 'auction', label: 'Lelang' },
];

const getVendorTypeIcon = (type: string) => {
  switch (type) {
    case 'individual': return User;
    case 'showroom': return Building2;
    case 'leasing': return CreditCard;
    case 'auction': return Gavel;
    default: return Building2;
  }
};

const getVendorTypeBadge = (type: string) => {
  const badges: Record<string, { variant: 'success' | 'info' | 'warning' | 'danger'; label: string }> = {
    individual: { variant: 'info', label: 'Perorangan' },
    showroom: { variant: 'success', label: 'Showroom' },
    leasing: { variant: 'warning', label: 'Leasing' },
    auction: { variant: 'danger', label: 'Lelang' },
  };
  return badges[type] || { variant: 'info', label: type };
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    type: 'individual',
    paymentTerms: '',
    notes: '',
  });

  // Filter vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch =
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.phone.includes(searchQuery);
      const matchesType = typeFilter === 'all' || vendor.type === typeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => b.totalValue - a.totalValue);
  }, [vendors, searchQuery, typeFilter]);

  // Stats
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.isActive).length;
  const totalTransactionValue = vendors.reduce((sum, v) => sum + v.totalValue, 0);
  const avgRating = vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length;

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsViewModalOpen(true);
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const newVendor: Vendor = {
      id: generateId('vendor'),
      name: formData.name,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      type: formData.type as Vendor['type'],
      rating: 0,
      totalTransactions: 0,
      totalValue: 0,
      paymentTerms: formData.paymentTerms,
      notes: formData.notes,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setVendors([newVendor, ...vendors]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      type: 'individual',
      paymentTerms: '',
      notes: '',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : star - 0.5 <= rating
                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <ProtectedRoute requiredModule="inventory" requiredAction="view">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Vendor</h1>
              <p className="text-gray-500 mt-1">Kelola data vendor dan performa</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Vendor
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Vendor</p>
                  <p className="text-lg font-bold text-gray-900">{totalVendors}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vendor Aktif</p>
                  <p className="text-lg font-bold text-gray-900">{activeVendors}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Transaksi</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(totalTransactionValue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rating Rata-rata</p>
                  <p className="text-lg font-bold text-gray-900">{avgRating.toFixed(1)} / 5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Cari vendor..."
                />
              </div>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua Tipe' },
                  ...vendorTypeOptions,
                ]}
              />
            </div>
          </div>

          {/* Vendor Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => {
              const TypeIcon = getVendorTypeIcon(vendor.type);
              const typeBadge = getVendorTypeBadge(vendor.type);
              return (
                <div
                  key={vendor.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <TypeIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                        <p className="text-sm text-gray-500">{vendor.contactPerson}</p>
                      </div>
                    </div>
                    <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {vendor.phone}
                    </div>
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {vendor.email}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    {renderStars(vendor.rating)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Transaksi</p>
                      <p className="font-semibold text-gray-900">{vendor.totalTransactions}x</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Nilai</p>
                      <p className="font-semibold text-blue-600 text-sm">{formatCurrency(vendor.totalValue)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewVendor(vendor)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredVendors.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada vendor</h3>
              <p className="text-gray-500">Belum ada vendor yang sesuai dengan filter</p>
            </div>
          )}
        </div>

        {/* View Vendor Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Detail Vendor"
          size="lg"
        >
          {selectedVendor && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {(() => {
                    const TypeIcon = getVendorTypeIcon(selectedVendor.type);
                    return <TypeIcon className="h-8 w-8 text-gray-600" />;
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedVendor.name}</h3>
                  <p className="text-gray-500">{selectedVendor.contactPerson}</p>
                  <div className="mt-2">
                    <Badge variant={getVendorTypeBadge(selectedVendor.type).variant}>
                      {getVendorTypeBadge(selectedVendor.type).label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Informasi Kontak</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{selectedVendor.phone}</span>
                  </div>
                  {selectedVendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{selectedVendor.email}</span>
                    </div>
                  )}
                  <div className="col-span-2 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{selectedVendor.address}</span>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-3">Performa Vendor</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedVendor.rating.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Rating</p>
                    <div className="mt-1">{renderStars(selectedVendor.rating)}</div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedVendor.totalTransactions}</p>
                    <p className="text-xs text-gray-500">Total Transaksi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{formatCurrency(selectedVendor.totalValue)}</p>
                    <p className="text-xs text-gray-500">Total Nilai</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment Terms</p>
                  <p className="font-medium text-gray-900">{selectedVendor.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={selectedVendor.isActive ? 'success' : 'danger'}>
                    {selectedVendor.isActive ? 'Aktif' : 'Non-aktif'}
                  </Badge>
                </div>
              </div>

              {selectedVendor.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Catatan</p>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{selectedVendor.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Add Vendor Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Tambah Vendor Baru"
          size="lg"
        >
          <form onSubmit={handleAddVendor} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Nama Vendor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="cth: PT Mobil Sejahtera"
                required
              />
              <Input
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Nama pic/contact person"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Telepon"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="cth: 0812-3456-7890"
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cth: vendor@email.com"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Tipe Vendor"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={vendorTypeOptions}
                required
              />
              <Input
                label="Payment Terms"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                placeholder="e.g. Cash on Delivery"
              />
            </div>
            <Textarea
              label="Alamat"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Alamat lengkap vendor"
              rows={2}
              required
            />
            <Textarea
              label="Catatan"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tambahkan catatan khusus tentang vendor ini"
              rows={2}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Simpan Vendor
              </Button>
            </div>
          </form>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
