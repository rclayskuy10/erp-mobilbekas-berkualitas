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
import ImageGallery from '@/components/ui/ImageGallery';
import { useAuth } from '@/contexts/AuthContext';
import { cars as initialCars, maintenanceCosts } from '@/data/dummy';
import {
  formatCurrency,
  formatNumber,
  getStatusDisplayName,
  getConditionDisplayName,
  getFuelTypeDisplayName,
  getTransmissionDisplayName,
  calculateHPP,
  calculateProfit,
} from '@/lib/utils';
import { Car, MaintenanceCost } from '@/types';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Wrench,
  Filter,
  ChevronDown,
} from 'lucide-react';

export default function InventoryPage() {
  const { hasPermission } = useAuth();
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filter cars
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesSearch =
        car.specs.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.specs.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.specs.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [cars, searchQuery, statusFilter]);

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      available: 'success',
      sold: 'info',
      reserved: 'warning',
      maintenance: 'danger',
    };
    return variants[status] || 'default';
  };

  const handleViewCar = (car: Car) => {
    setSelectedCar(car);
    setIsViewModalOpen(true);
  };

  const handleEditCar = (car: Car) => {
    setSelectedCar(car);
    setIsEditModalOpen(true);
  };

  const handleMaintenanceCar = (car: Car) => {
    setSelectedCar(car);
    setIsMaintenanceModalOpen(true);
  };

  const handleDeleteCar = (car: Car) => {
    setSelectedCar(car);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCar) {
      setCars(cars.filter((c) => c.id !== selectedCar.id));
      setIsDeleteModalOpen(false);
      setSelectedCar(null);
    }
  };

  return (
    <ProtectedRoute requiredModule="inventory">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Mobil</h1>
              <p className="text-gray-600">Kelola stok mobil bekas</p>
            </div>
            {hasPermission('inventory', 'create') && (
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Tambah Mobil
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari merk, model, atau plat nomor..."
              className="sm:w-80"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'available', label: 'Tersedia' },
                { value: 'sold', label: 'Terjual' },
                { value: 'reserved', label: 'Dipesan' },
                { value: 'maintenance', label: 'Perawatan' },
              ]}
              className="sm:w-48"
            />
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Total Mobil</p>
              <p className="text-2xl font-bold text-gray-900">{cars.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Tersedia</p>
              <p className="text-2xl font-bold text-green-600">
                {cars.filter((c) => c.status === 'available').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Terjual</p>
              <p className="text-2xl font-bold text-blue-600">
                {cars.filter((c) => c.status === 'sold').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Total Nilai Stok</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(
                  cars
                    .filter((c) => c.status !== 'sold')
                    .reduce((sum, c) => sum + c.sellingPrice, 0)
                )}
              </p>
            </div>
          </div>

          {/* Cars Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Car Image */}
                <div className="relative h-48">
                  {car.photos.length > 0 ? (
                    <img
                      src={car.photos[0]}
                      alt={`${car.specs.brand} ${car.specs.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">Tidak ada foto</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={getStatusBadgeVariant(car.status)}>
                      {getStatusDisplayName(car.status)}
                    </Badge>
                  </div>
                </div>

                {/* Car Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {car.specs.brand} {car.specs.model}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {car.specs.year} • {car.specs.plateNumber}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">KM:</span>
                      <span className="ml-1 font-medium">{formatNumber(car.specs.mileage)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Transmisi:</span>
                      <span className="ml-1 font-medium">
                        {getTransmissionDisplayName(car.specs.transmission)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">BBM:</span>
                      <span className="ml-1 font-medium">
                        {getFuelTypeDisplayName(car.specs.fuelType)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Kondisi:</span>
                      <span className="ml-1 font-medium">
                        {getConditionDisplayName(car.condition)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Harga Jual</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(car.sellingPrice)}
                        </p>
                      </div>
                      {car.status === 'sold' && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Profit</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(calculateProfit(car.sellingPrice, car.hpp))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewCar(car)}
                      leftIcon={<Eye className="h-4 w-4" />}
                    >
                      Detail
                    </Button>
                    {hasPermission('inventory', 'edit') && car.status !== 'sold' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCar(car)}
                          leftIcon={<Edit className="h-4 w-4" />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMaintenanceCar(car)}
                          leftIcon={<Wrench className="h-4 w-4" />}
                        >
                          Biaya
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCars.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">Tidak ada mobil ditemukan</p>
            </div>
          )}
        </div>

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Detail Mobil"
          size="xl"
        >
          {selectedCar && (
            <div className="space-y-6">
              {/* Image Gallery */}
              <ImageGallery
                images={selectedCar.photos}
                alt={`${selectedCar.specs.brand} ${selectedCar.specs.model}`}
              />

              {/* Car Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Spesifikasi</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Merk</dt>
                      <dd className="font-medium">{selectedCar.specs.brand}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Model</dt>
                      <dd className="font-medium">{selectedCar.specs.model}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Tahun</dt>
                      <dd className="font-medium">{selectedCar.specs.year}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Warna</dt>
                      <dd className="font-medium">{selectedCar.specs.color}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Plat Nomor</dt>
                      <dd className="font-medium">{selectedCar.specs.plateNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Kilometer</dt>
                      <dd className="font-medium">{formatNumber(selectedCar.specs.mileage)} km</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Mesin</dt>
                      <dd className="font-medium">{selectedCar.specs.engineCapacity}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">BBM</dt>
                      <dd className="font-medium">{getFuelTypeDisplayName(selectedCar.specs.fuelType)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Transmisi</dt>
                      <dd className="font-medium">{getTransmissionDisplayName(selectedCar.specs.transmission)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">VIN</dt>
                      <dd className="font-medium text-sm">{selectedCar.specs.vin}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Harga & Biaya</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Harga Beli</dt>
                      <dd className="font-medium">{formatCurrency(selectedCar.purchasePrice)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Biaya Perawatan</dt>
                      <dd className="font-medium">
                        {formatCurrency(
                          selectedCar.maintenanceCosts.reduce((sum, m) => sum + m.cost, 0)
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <dt className="text-gray-700 font-medium">HPP</dt>
                      <dd className="font-bold text-gray-900">{formatCurrency(selectedCar.hpp)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Harga Jual</dt>
                      <dd className="font-bold text-blue-600">{formatCurrency(selectedCar.sellingPrice)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Potensi Profit</dt>
                      <dd className="font-bold text-green-600">
                        {formatCurrency(selectedCar.sellingPrice - selectedCar.hpp)}
                      </dd>
                    </div>
                  </dl>

                  {/* Maintenance History */}
                  {selectedCar.maintenanceCosts.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-2">Riwayat Perawatan</h4>
                      <div className="space-y-2">
                        {selectedCar.maintenanceCosts.map((m) => (
                          <div key={m.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <div>
                              <p className="font-medium">{m.description}</p>
                              <p className="text-gray-500">{m.date}</p>
                            </div>
                            <p className="font-medium">{formatCurrency(m.cost)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedCar.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Deskripsi</h3>
                  <p className="text-gray-600">{selectedCar.description}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Hapus Mobil"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus{' '}
              <span className="font-semibold">
                {selectedCar?.specs.brand} {selectedCar?.specs.model}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
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
