'use client';

import { useState, useMemo } from 'react';
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
import { grns as initialGrns, cars } from '@/data/dummy';
import { formatCurrency, formatDate, generateId, generateDocNumber } from '@/lib/utils';
import { GRN } from '@/types';
import { Plus, Eye, Edit, Trash2, Package, FileText } from 'lucide-react';

export default function PembelianPage() {
  const { hasPermission, user } = useAuth();
  const [grns, setGrns] = useState<GRN[]>(initialGrns);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrn, setSelectedGrn] = useState<GRN | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state for new GRN
  const [formData, setFormData] = useState({
    supplierName: '',
    supplierContact: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    color: '',
    plateNumber: '',
    mileage: '',
    engineCapacity: '',
    fuelType: 'petrol',
    transmission: 'automatic',
    vin: '',
  });

  // Filter GRNs
  const filteredGrns = useMemo(() => {
    return grns.filter((grn) => {
      const car = cars.find((c) => c.id === grn.carId);
      const matchesSearch =
        grn.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grn.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car?.specs.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car?.specs.model.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [grns, searchQuery]);

  // Stats
  const totalPurchases = grns.reduce((sum, g) => sum + g.purchasePrice, 0);
  const thisMonthGrns = grns.filter((g) => {
    const grnDate = new Date(g.purchaseDate);
    const now = new Date();
    return grnDate.getMonth() === now.getMonth() && grnDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthGrns.reduce((sum, g) => sum + g.purchasePrice, 0);

  const handleViewGrn = (grn: GRN) => {
    setSelectedGrn(grn);
    setIsViewModalOpen(true);
  };

  const handleDeleteGrn = (grn: GRN) => {
    setSelectedGrn(grn);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedGrn) {
      setGrns(grns.filter((g) => g.id !== selectedGrn.id));
      setIsDeleteModalOpen(false);
      setSelectedGrn(null);
    }
  };

  const handleSubmitGrn = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would create both car and GRN
    const newGrn: GRN = {
      id: generateId('grn'),
      grnNumber: generateDocNumber('GRN', new Date(), grns.length + 1),
      carId: generateId('car'),
      purchaseDate: formData.purchaseDate,
      supplierName: formData.supplierName,
      supplierContact: formData.supplierContact,
      purchasePrice: parseInt(formData.purchasePrice),
      notes: formData.notes,
      receivedBy: user?.name || '',
      createdAt: new Date().toISOString(),
    };
    setGrns([newGrn, ...grns]);
    setIsAddModalOpen(false);
    // Reset form
    setFormData({
      supplierName: '',
      supplierContact: '',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
      brand: '',
      model: '',
      year: new Date().getFullYear().toString(),
      color: '',
      plateNumber: '',
      mileage: '',
      engineCapacity: '',
      fuelType: 'petrol',
      transmission: 'automatic',
      vin: '',
    });
  };

  return (
    <ProtectedRoute requiredModule="grn">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pembelian Mobil</h1>
              <p className="text-gray-600">Pencatatan pembelian mobil masuk</p>
            </div>
            {hasPermission('grn', 'create') && (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Buat Pembelian Baru
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pembelian</p>
                  <p className="text-2xl font-bold text-gray-900">{grns.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pembelian</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPurchases)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bulan Ini</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(thisMonthTotal)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari nomor pembelian, penjual, atau mobil..."
              className="max-w-md"
            />
          </div>

          {/* GRN Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      No. GRN
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Mobil
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Beli Dari
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Harga Beli
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Diterima Oleh
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGrns.map((grn) => {
                    const car = cars.find((c) => c.id === grn.carId);
                    return (
                      <tr key={grn.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-blue-600">{grn.grnNumber}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {formatDate(grn.purchaseDate)}
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
                            <p className="font-medium text-gray-900">{grn.supplierName}</p>
                            {grn.supplierContact && (
                              <p className="text-sm text-gray-500">{grn.supplierContact}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                          {formatCurrency(grn.purchasePrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {grn.receivedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewGrn(grn)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {hasPermission('grn', 'delete') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteGrn(grn)}
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

            {filteredGrns.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Tidak ada GRN ditemukan</p>
              </div>
            )}
          </div>
        </div>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Detail GRN"
          size="lg"
        >
          {selectedGrn && (
            <div className="space-y-6">
              {(() => {
                const car = cars.find((c) => c.id === selectedGrn.carId);
                return (
                  <>
                    {/* GRN Info */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-blue-600">Nomor GRN</p>
                          <p className="text-xl font-bold text-blue-900">
                            {selectedGrn.grnNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-blue-600">Tanggal</p>
                          <p className="font-medium text-blue-900">
                            {formatDate(selectedGrn.purchaseDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Car Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Informasi Mobil
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Merk/Model</p>
                          <p className="font-medium">
                            {car?.specs.brand} {car?.specs.model}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tahun</p>
                          <p className="font-medium">{car?.specs.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Plat Nomor</p>
                          <p className="font-medium">{car?.specs.plateNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Warna</p>
                          <p className="font-medium">{car?.specs.color}</p>
                        </div>
                      </div>
                    </div>

                    {/* Info Beli Dari */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Informasi Beli Dari
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Nama</p>
                          <p className="font-medium">{selectedGrn.supplierName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Kontak</p>
                          <p className="font-medium">
                            {selectedGrn.supplierContact || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price & Notes */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Harga Beli</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(selectedGrn.purchasePrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Diterima Oleh</p>
                        <p className="font-medium">{selectedGrn.receivedBy}</p>
                      </div>
                    </div>

                    {selectedGrn.notes && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Catatan</p>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {selectedGrn.notes}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </Modal>

        {/* Add GRN Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Buat GRN Baru"
          size="xl"
        >
          <form onSubmit={handleSubmitGrn} className="space-y-6">
            {/* Info Beli Dari Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Beli Dari</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nama"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="Nama supplier/penjual"
                  required
                />
                <Input
                  label="Kontak"
                  value={formData.supplierContact}
                  onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                  placeholder="Nomor telepon/email"
                />
              </div>
            </div>

            {/* Car Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Mobil</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Merk"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="cth: Toyota, Honda"
                  required
                />
                <Input
                  label="Model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="cth: Avanza, Jazz"
                  required
                />
                <Input
                  label="Tahun"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="cth: 2024"
                  required
                />
                <Input
                  label="Warna"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="cth: Hitam, Putih"
                  required
                />
                <Input
                  label="Plat Nomor"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                  placeholder="cth: B 1234 ABC"
                  required
                />
                <Input
                  label="Kilometer"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  placeholder="cth: 50000"
                  required
                />
                <Input
                  label="Kapasitas Mesin"
                  value={formData.engineCapacity}
                  onChange={(e) => setFormData({ ...formData, engineCapacity: e.target.value })}
                  placeholder="cth: 1500cc"
                />
                <Select
                  label="BBM"
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  options={[
                    { value: 'petrol', label: 'Bensin' },
                    { value: 'diesel', label: 'Diesel' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'electric', label: 'Listrik' },
                  ]}
                />
                <Select
                  label="Transmisi"
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                  options={[
                    { value: 'automatic', label: 'Otomatis' },
                    { value: 'manual', label: 'Manual' },
                    { value: 'cvt', label: 'CVT' },
                  ]}
                />
              </div>
            </div>

            {/* Purchase Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pembelian</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Tanggal Pembelian"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  required
                />
                <CurrencyInput
                  label="Harga Beli"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  placeholder="Masukkan harga beli"
                  required
                />
              </div>
              <div className="mt-4">
                <Textarea
                  label="Catatan"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tambahkan catatan khusus, kondisi mobil, dll"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
                Batal
              </Button>
              <Button type="submit">Simpan GRN</Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Hapus GRN"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus GRN{' '}
              <span className="font-semibold">{selectedGrn?.grnNumber}</span>?
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
