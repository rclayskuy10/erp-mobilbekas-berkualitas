'use client';

import { useState, useMemo, Suspense } from 'react';
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
import { grns as initialGrns, cars, vendors } from '@/data/dummy';
import { formatCurrency, formatDate, generateId, generateDocNumber } from '@/lib/utils';
import { GRN } from '@/types';
import { Plus, Eye, Edit, Trash2, Package, FileText } from 'lucide-react';

function PembelianContent() {
  const { hasPermission, user } = useAuth();
  const [grns, setGrns] = useState<GRN[]>(initialGrns);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrn, setSelectedGrn] = useState<GRN | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form state for new GRN
  const [formData, setFormData] = useState({
    vendorId: '',
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
    photos: [] as string[],
  });

  const [isNewVendor, setIsNewVendor] = useState(false);
  const [customBrand, setCustomBrand] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{url: string, file?: File}>>([]);
  const [carBrands, setCarBrands] = useState([
    'Toyota',
    'Honda',
    'Mitsubishi',
    'Suzuki',
    'Daihatsu',
    'Nissan',
    'Mazda',
    'BMW',
    'Mercedes-Benz',
  ]);

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

  const handleSubmitGrn = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle new brand
    if (formData.brand === '__new__') {
      if (!newBrandName.trim()) {
        alert('Nama merk baru harus diisi');
        return;
      }
      // Add new brand to the list
      if (!carBrands.includes(newBrandName.trim())) {
        setCarBrands([...carBrands, newBrandName.trim()].sort());
      }
    }
    
    // In real app, this would create both car and GRN
    const photosArray = uploadedPhotos.map(p => p.url);
    
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
      vendorId: formData.vendorId || undefined,
      photos: photosArray.length > 0 ? photosArray : undefined,
    };
    setGrns([newGrn, ...grns]);
    setIsAddModalOpen(false);
    // Reset form
    setFormData({
      vendorId: '',
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
      photos: [],
    });
    setIsNewVendor(false);
    setCustomBrand('');
    setNewBrandName('');
    setUploadedPhotos([]);
  };

  return (
    <ProtectedRoute requiredModule="grn">
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pembelian Mobil</h1>
                <p className="text-gray-600 mt-2">Pencatatan pembelian mobil masuk</p>
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
          </div>

          {/* Stats */}
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
          </div>

          {/* Search */}
          <div className="mb-6 sm:mb-8">
            <div className="flex gap-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari nomor pembelian, penjual, atau mobil..."
                className="w-full sm:max-w-md"
              />
            </div>
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
              <div className="space-y-4">
                <Select
                  label="Pilih Vendor"
                  value={isNewVendor ? 'new' : formData.vendorId}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'new') {
                      setIsNewVendor(true);
                      setFormData({ ...formData, vendorId: '', supplierName: '', supplierContact: '' });
                    } else {
                      setIsNewVendor(false);
                      const vendor = vendors.find(v => v.id === value);
                      if (vendor) {
                        setFormData({
                          ...formData,
                          vendorId: vendor.id,
                          supplierName: vendor.name,
                          supplierContact: vendor.phone,
                        });
                      }
                    }
                  }}
                  options={[
                    ...vendors.filter(v => v.isActive).map(v => ({
                      value: v.id,
                      label: `${v.name} - ${v.phone}`
                    })),
                    { value: 'new', label: '+ Tambah Vendor Baru' }
                  ]}
                  required
                />
                {isNewVendor && (
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Input
                      label="Nama Vendor"
                      value={formData.supplierName}
                      onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                      placeholder="Nama supplier/penjual"
                      required
                    />
                    <Input
                      label="Kontak Vendor"
                      value={formData.supplierContact}
                      onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                      placeholder="Nomor telepon/email"
                      required
                    />
                  </div>
                )}
                {!isNewVendor && formData.vendorId && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Vendor: <span className="font-medium text-gray-900">{formData.supplierName}</span></p>
                    <p className="text-sm text-gray-600">Kontak: <span className="font-medium text-gray-900">{formData.supplierContact}</span></p>
                  </div>
                )}
              </div>
            </div>

            {/* Car Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Mobil</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <Select
                    label="Merk"
                    value={formData.brand}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, brand: value });
                      if (value !== '__new__') {
                        setCustomBrand('');
                        setNewBrandName('');
                      }
                    }}
                    options={[
                      ...carBrands.map(brand => ({ value: brand, label: brand })),
                      { value: '__new__', label: '+ Tambah Merk Baru' },
                    ]}
                    required
                  />
                </div>
                {formData.brand === '__new__' && (
                  <div className="md:col-span-3">
                    <Input
                      label="Nama Merk Baru"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="Masukkan nama merk baru"
                      helperText="Merk ini akan ditambahkan ke daftar merk permanen"
                      required
                    />
                  </div>
                )}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Mobil
                </label>
                
                {/* Upload Area */}
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
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

export default function PembelianPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <PembelianContent />
    </Suspense>
  );
}
