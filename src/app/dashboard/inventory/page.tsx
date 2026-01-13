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
import ImageGallery from '@/components/ui/ImageGallery';
import { useAuth } from '@/contexts/AuthContext';
import { cars as initialCars, vendors } from '@/data/dummy';
import {
  formatCurrency,
  formatNumber,
  getStatusDisplayName,
  getConditionDisplayName,
  getFuelTypeDisplayName,
  getTransmissionDisplayName,
  calculateProfit,
} from '@/lib/utils';
import { Car } from '@/types';
import {
  Plus,
  Edit,
  Wrench,
} from 'lucide-react';

function InventoryContent() {
  const { hasPermission } = useAuth();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Handle highlight from notification
  useEffect(() => {
    if (highlightId) {
      const car = cars.find(c => c.id === highlightId);
      if (car) {
        // Use setTimeout to avoid setState in effect body
        setTimeout(() => {
          setHighlightedId(highlightId);
          setSelectedCar(car);
          setIsViewModalOpen(true);
        }, 0);
        
        // Remove highlight after 3 seconds
        const timer = setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [highlightId, cars]);
  
  // Form state for adding new car
  const [carForm, setCarForm] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    color: '',
    plateNumber: '',
    mileage: '',
    engineCapacity: '',
    fuelType: '',
    transmission: '',
    seats: '5',
    doors: '4',
    vin: '',
    purchasePrice: '',
    sellingPrice: '',
    condition: '',
    description: '',
    photos: [] as string[],
    stnkNumber: '',
    stnkExpiredDate: '',
  });

  // Form state for editing car
  const [editForm, setEditForm] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
    plateNumber: '',
    mileage: '',
    engineCapacity: '',
    fuelType: '',
    transmission: '',
    seats: '',
    doors: '',
    vin: '',
    purchasePrice: '',
    sellingPrice: '',
    condition: '',
    description: '',
    photos: [] as string[],
    stnkNumber: '',
    stnkExpiredDate: '',
  });

  // Form state for maintenance
  const [maintenanceForm, setMaintenanceForm] = useState({
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
  });

  // Filter cars
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesSearch =
        car.specs.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.specs.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.specs.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    // Populate edit form with car data
    setEditForm({
      brand: car.specs.brand,
      model: car.specs.model,
      year: car.specs.year.toString(),
      color: car.specs.color,
      plateNumber: car.specs.plateNumber,
      mileage: car.specs.mileage.toString(),
      engineCapacity: car.specs.engineCapacity,
      fuelType: car.specs.fuelType,
      transmission: car.specs.transmission,
      seats: car.specs.seats.toString(),
      doors: car.specs.doors.toString(),
      vin: car.specs.vin,
      purchasePrice: car.purchasePrice.toString(),
      sellingPrice: car.sellingPrice.toString(),
      condition: car.condition,
      description: car.description,
      photos: [...car.photos],
      stnkNumber: car.stnkNumber || '',
      stnkExpiredDate: car.stnkExpiredDate || '',
    });
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

  const handleAddCar = () => {
    setIsAddModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Convert files to base64 URLs
    Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      })
    ).then((base64Files) => {
      const currentPhotos = carForm.photos || [];
      const newPhotos = [...currentPhotos, ...base64Files].slice(0, 5); // Max 5 photos
      setCarForm({ ...carForm, photos: newPhotos });
    });
  };

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Convert files to base64 URLs
    Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      })
    ).then((base64Files) => {
      const currentPhotos = editForm.photos || [];
      const newPhotos = [...currentPhotos, ...base64Files].slice(0, 5); // Max 5 photos
      setEditForm({ ...editForm, photos: newPhotos });
    });
  };

  const removePhoto = (index: number, isEdit = false) => {
    if (isEdit) {
      const newPhotos = editForm.photos.filter((_, i) => i !== index);
      setEditForm({ ...editForm, photos: newPhotos });
    } else {
      const newPhotos = carForm.photos.filter((_, i) => i !== index);
      setCarForm({ ...carForm, photos: newPhotos });
    }
  };

  const handleSubmitCar = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCar: Car = {
      id: `car-${Date.now()}`,
      specs: {
        brand: carForm.brand,
        model: carForm.model,
        year: Number(carForm.year) || 0,
        color: carForm.color,
        plateNumber: carForm.plateNumber,
        mileage: Number(carForm.mileage) || 0,
        engineCapacity: carForm.engineCapacity,
        fuelType: carForm.fuelType as 'petrol' | 'diesel' | 'hybrid' | 'electric',
        transmission: carForm.transmission as 'manual' | 'automatic' | 'cvt',
        seats: Number(carForm.seats) || 0,
        doors: Number(carForm.doors) || 0,
        vin: carForm.vin,
      },
      purchasePrice: Number(carForm.purchasePrice) || 0,
      sellingPrice: Number(carForm.sellingPrice) || 0,
      condition: carForm.condition as 'excellent' | 'good' | 'fair',
      status: 'available',
      photos: carForm.photos,
      description: carForm.description,
      maintenanceCosts: [],
      hpp: Number(carForm.purchasePrice) || 0, // Initial HPP = purchase price
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stnkNumber: carForm.stnkNumber || undefined,
      stnkExpiredDate: carForm.stnkExpiredDate || undefined,
    };

    setCars([newCar, ...cars]);
    setIsAddModalOpen(false);
    
    // Reset form
    setCarForm({
      brand: '',
      model: '',
      year: new Date().getFullYear().toString(),
      color: '',
      plateNumber: '',
      mileage: '',
      engineCapacity: '',
      fuelType: '',
      transmission: '',
      seats: '5',
      doors: '4',
      vin: '',
      purchasePrice: '',
      sellingPrice: '',
      condition: '',
      description: '',
      photos: [],
      stnkNumber: '',
      stnkExpiredDate: '',
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCar) return;

    const updatedCar: Car = {
      ...selectedCar,
      specs: {
        brand: editForm.brand,
        model: editForm.model,
        year: Number(editForm.year) || 0,
        color: editForm.color,
        plateNumber: editForm.plateNumber,
        mileage: Number(editForm.mileage) || 0,
        engineCapacity: editForm.engineCapacity,
        fuelType: editForm.fuelType as 'petrol' | 'diesel' | 'hybrid' | 'electric',
        transmission: editForm.transmission as 'manual' | 'automatic' | 'cvt',
        seats: Number(editForm.seats) || 0,
        doors: Number(editForm.doors) || 0,
        vin: editForm.vin,
      },
      purchasePrice: Number(editForm.purchasePrice) || 0,
      sellingPrice: Number(editForm.sellingPrice) || 0,
      condition: editForm.condition as 'excellent' | 'good' | 'fair',
      photos: editForm.photos,
      description: editForm.description,
      updatedAt: new Date().toISOString(),
      stnkNumber: editForm.stnkNumber || undefined,
      stnkExpiredDate: editForm.stnkExpiredDate || undefined,
    };

    // Recalculate HPP with current maintenance costs
    updatedCar.hpp = updatedCar.purchasePrice + updatedCar.maintenanceCosts.reduce((sum, m) => sum + m.cost, 0);

    setCars(cars.map(car => car.id === selectedCar.id ? updatedCar : car));
    setIsEditModalOpen(false);
    setSelectedCar(null);
  };

  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCar) return;

    const newMaintenance = {
      id: `maint-${Date.now()}`,
      carId: selectedCar.id,
      description: maintenanceForm.description,
      cost: parseInt(maintenanceForm.cost),
      date: maintenanceForm.date,
      vendor: maintenanceForm.vendor,
    };

    const updatedCar = {
      ...selectedCar,
      maintenanceCosts: [...selectedCar.maintenanceCosts, newMaintenance],
      updatedAt: new Date().toISOString(),
    };

    // Recalculate HPP
    updatedCar.hpp = updatedCar.purchasePrice + updatedCar.maintenanceCosts.reduce((sum, m) => sum + m.cost, 0);

    setCars(cars.map(car => car.id === selectedCar.id ? updatedCar : car));
    setIsMaintenanceModalOpen(false);
    setSelectedCar(null);
    
    // Reset form
    setMaintenanceForm({
      description: '',
      cost: '',
      date: new Date().toISOString().split('T')[0],
      vendor: '',
    });
  };

  return (
    <ProtectedRoute requiredModule="inventory">
      <DashboardLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Mobil</h1>
                <p className="text-gray-600 mt-2">Kelola stok mobil bekas</p>
              </div>
              {hasPermission('inventory', 'create') && (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleAddCar}>
                  Tambah Mobil
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 sm:mb-8">
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
          </div>

          {/* Stats Summary */}
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
          </div>

          {/* Cars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredCars.map((car) => {
              const isHighlighted = highlightedId === car.id;
              return (
              <div
                key={car.id}
                onClick={() => handleViewCar(car)}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                  isHighlighted 
                    ? 'border-blue-500 border-2 ring-4 ring-blue-200 animate-pulse' 
                    : 'border-gray-100'
                }`}
              >
                {/* Car Image */}
                <div className="relative h-32 md:h-48">
                  {car.photos.length > 0 ? (
                    <img
                      src={car.photos[0]}
                      alt={`${car.specs.brand} ${car.specs.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs md:text-sm">Tidak ada foto</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={getStatusBadgeVariant(car.status)}>
                      {getStatusDisplayName(car.status)}
                    </Badge>
                  </div>
                </div>

                {/* Car Info */}
                <div className="p-3 md:p-4">
                  <h3 className="text-sm md:text-lg font-semibold text-gray-900 truncate">
                    {car.specs.brand} {car.specs.model}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                    {car.specs.year} • {car.specs.plateNumber}
                  </p>

                  <div className="grid grid-cols-2 gap-1 md:gap-2 mt-3 md:mt-4 text-xs md:text-sm">
                    <div className="truncate">
                      <span className="text-gray-500">KM:</span>
                      <span className="ml-1 font-medium">{formatNumber(car.specs.mileage)}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-gray-500">Transmisi:</span>
                      <span className="ml-1 font-medium">
                        {getTransmissionDisplayName(car.specs.transmission)}
                      </span>
                    </div>
                    <div className="truncate">
                      <span className="text-gray-500">BBM:</span>
                      <span className="ml-1 font-medium">
                        {getFuelTypeDisplayName(car.specs.fuelType)}
                      </span>
                    </div>
                    <div className="truncate">
                      <span className="text-gray-500">Kondisi:</span>
                      <span className="ml-1 font-medium">
                        {getConditionDisplayName(car.condition)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm text-gray-500">Harga Jual</p>
                        <p className="text-sm md:text-lg font-bold text-blue-600 truncate">
                          {formatCurrency(car.sellingPrice)}
                        </p>
                      </div>
                      {car.status === 'sold' && (
                        <div className="text-right min-w-0 flex-1">
                          <p className="text-xs md:text-sm text-gray-500">Profit</p>
                          <p className="text-sm md:text-lg font-bold text-green-600 truncate">
                            {formatCurrency(calculateProfit(car.sellingPrice, car.hpp))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 md:gap-2 mt-3 md:mt-4">
                    {hasPermission('inventory', 'edit') && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCar(car);
                          }}
                          leftIcon={<Edit className="h-3 md:h-4 w-3 md:w-4" />}
                          className="flex-1 text-xs md:text-sm"
                        >
                          <span className="hidden md:inline">Edit</span>
                          <span className="md:hidden">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMaintenanceCar(car);
                          }}
                          leftIcon={<Wrench className="h-3 md:h-4 w-3 md:w-4" />}
                          className="flex-1 text-xs md:text-sm"
                        >
                          <span className="hidden md:inline">Biaya</span>
                          <span className="md:hidden">Biaya</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
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
                    {selectedCar.stnkNumber && (
                      <>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <dt className="text-gray-500">Nomor STNK</dt>
                          <dd className="font-medium">{selectedCar.stnkNumber}</dd>
                        </div>
                        {selectedCar.stnkExpiredDate && (
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Expired STNK</dt>
                            <dd className="font-medium">{new Date(selectedCar.stnkExpiredDate).toLocaleDateString('id-ID')}</dd>
                          </div>
                        )}
                      </>
                    )}
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

        {/* Add Car Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Tambah Mobil Baru"
          size="xl"
        >
          <form onSubmit={handleSubmitCar} className="space-y-6">
            {/* Car Specifications */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spesifikasi Mobil</h3>
                <div className="space-y-4">
                  <Input
                    label="Merk"
                    value={carForm.brand}
                    onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })}
                    placeholder="Contoh: Toyota, Honda, Mitsubishi"
                    required
                  />
                  <Input
                    label="Model"
                    value={carForm.model}
                    onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                    placeholder="Contoh: Avanza, CR-V, Pajero"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Tahun"
                      type="number"
                      value={carForm.year}
                      onChange={(e) => setCarForm({ ...carForm, year: e.target.value })}
                      placeholder="2020"
                      min="1990"
                      max={new Date().getFullYear()}
                      required
                    />
                    <Input
                      label="Warna"
                      value={carForm.color}
                      onChange={(e) => setCarForm({ ...carForm, color: e.target.value })}
                      placeholder="Contoh: Putih, Hitam, Silver"
                      required
                    />
                  </div>
                  <Input
                    label="Plat Nomor"
                    value={carForm.plateNumber}
                    onChange={(e) => setCarForm({ ...carForm, plateNumber: e.target.value })}
                    placeholder="Contoh: B 1234 ABC"
                    required
                  />
                  <Input
                    label="Kilometer"
                    type="number"
                    value={carForm.mileage}
                    onChange={(e) => setCarForm({ ...carForm, mileage: e.target.value })}
                    placeholder="Masukkan kilometer saat ini"
                    required
                  />
                  <Input
                    label="Kapasitas Mesin"
                    value={carForm.engineCapacity}
                    onChange={(e) => setCarForm({ ...carForm, engineCapacity: e.target.value })}
                    placeholder="Contoh: 1.3L, 1.5L, 2.0L"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Jumlah Kursi"
                      type="number"
                      value={carForm.seats}
                      onChange={(e) => setCarForm({ ...carForm, seats: e.target.value })}
                      placeholder="5"
                      min="2"
                      max="8"
                      required
                    />
                    <Input
                      label="Jumlah Pintu"
                      type="number"
                      value={carForm.doors}
                      onChange={(e) => setCarForm({ ...carForm, doors: e.target.value })}
                      placeholder="4"
                      min="2"
                      max="5"
                      required
                    />
                  </div>
                  <Select
                    label="Jenis BBM"
                    value={carForm.fuelType}
                    onChange={(e) => setCarForm({ ...carForm, fuelType: e.target.value })}
                    options={[
                      { value: '', label: 'Pilih jenis BBM...' },
                      { value: 'petrol', label: 'Bensin' },
                      { value: 'diesel', label: 'Diesel' },
                      { value: 'hybrid', label: 'Hybrid' },
                      { value: 'electric', label: 'Listrik' },
                    ]}
                    required
                  />
                  <Select
                    label="Transmisi"
                    value={carForm.transmission}
                    onChange={(e) => setCarForm({ ...carForm, transmission: e.target.value })}
                    options={[
                      { value: '', label: 'Pilih transmisi...' },
                      { value: 'manual', label: 'Manual' },
                      { value: 'automatic', label: 'Otomatis' },
                      { value: 'cvt', label: 'CVT' },
                    ]}
                    required
                  />
                  <Input
                    label="VIN Number"
                    value={carForm.vin}
                    onChange={(e) => setCarForm({ ...carForm, vin: e.target.value })}
                    placeholder="Masukkan nomor VIN kendaraan"
                    required
                  />
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Data STNK</h4>
                    <div className="space-y-3">
                      <Input
                        label="Nomor STNK"
                        value={carForm.stnkNumber}
                        onChange={(e) => setCarForm({ ...carForm, stnkNumber: e.target.value })}
                        placeholder="Masukkan nomor STNK"
                      />
                      <Input
                        label="Tanggal Expired STNK"
                        type="date"
                        value={carForm.stnkExpiredDate}
                        onChange={(e) => setCarForm({ ...carForm, stnkExpiredDate: e.target.value })}
                        placeholder="Pilih tanggal expired"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Harga & Kondisi</h3>
                <div className="space-y-4">
                  <CurrencyInput
                    label="Harga Beli"
                    value={carForm.purchasePrice}
                    onChange={(e) => setCarForm({ ...carForm, purchasePrice: e.target.value })}
                    placeholder="Masukkan harga beli mobil"
                    required
                  />
                  <CurrencyInput
                    label="Harga Jual"
                    value={carForm.sellingPrice}
                    onChange={(e) => setCarForm({ ...carForm, sellingPrice: e.target.value })}
                    placeholder="Masukkan harga jual yang diinginkan"
                    required
                  />
                  <Select
                    label="Kondisi"
                    value={carForm.condition}
                    onChange={(e) => setCarForm({ ...carForm, condition: e.target.value })}
                    options={[
                      { value: '', label: 'Pilih kondisi...' },
                      { value: 'excellent', label: 'Sangat Baik' },
                      { value: 'good', label: 'Baik' },
                      { value: 'fair', label: 'Cukup' },
                    ]}
                    required
                  />
                  <Textarea
                    label="Deskripsi"
                    value={carForm.description}
                    onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                    placeholder="Tuliskan kondisi mobil, riwayat perawatan, fitur unggulan, dan informasi penting lainnya..."
                    rows={4}
                  />
                  
                  {/* File Upload for Photos */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Foto Mobil (maksimal 5)
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      
                      {/* Photo Preview Grid */}
                      {carForm.photos.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {carForm.photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={photo}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600 font-medium">Belum ada foto yang dipilih</p>
                          <p className="mt-1 text-xs text-gray-500">Klik tombol &quot;Choose Files&quot; di atas untuk mengunggah foto</p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Pilih gambar dari galeri atau kamera. Maksimal 5 foto.
                      </p>
                    </div>
                  </div>
                  
                  {/* Profit calculation preview */}
                  {carForm.purchasePrice && carForm.sellingPrice && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Estimasi Profit:</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(parseInt(carForm.sellingPrice) - parseInt(carForm.purchasePrice))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
                Batal
              </Button>
              <Button type="submit">
                Simpan Mobil
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Car Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Mobil"
          size="xl"
        >
          <form onSubmit={handleSubmitEdit} className="space-y-6">
            {/* Similar structure to Add Car Modal but with editForm */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spesifikasi Mobil</h3>
                <div className="space-y-4">
                  <Input
                    label="Merk"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    placeholder="Contoh: Toyota, Honda, Mitsubishi"
                    required
                  />
                  <Input
                    label="Model"
                    value={editForm.model}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    placeholder="Contoh: Avanza, CR-V, Pajero"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Tahun"
                      type="number"
                      value={editForm.year}
                      onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                      placeholder="2020"
                      min="1990"
                      max={new Date().getFullYear()}
                      required
                    />
                    <Input
                      label="Warna"
                      value={editForm.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      placeholder="Contoh: Putih, Hitam, Silver"
                      required
                    />
                  </div>
                  <Input
                    label="Plat Nomor"
                    value={editForm.plateNumber}
                    onChange={(e) => setEditForm({ ...editForm, plateNumber: e.target.value })}
                    placeholder="Contoh: B 1234 ABC"
                    required
                  />
                  <Input
                    label="Kilometer"
                    type="number"
                    value={editForm.mileage}
                    onChange={(e) => setEditForm({ ...editForm, mileage: e.target.value })}
                    placeholder="Masukkan kilometer saat ini"
                    required
                  />
                  <Input
                    label="Kapasitas Mesin"
                    value={editForm.engineCapacity}
                    onChange={(e) => setEditForm({ ...editForm, engineCapacity: e.target.value })}
                    placeholder="Contoh: 1.3L, 1.5L, 2.0L"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Jumlah Kursi"
                      type="number"
                      value={editForm.seats}
                      onChange={(e) => setEditForm({ ...editForm, seats: e.target.value })}
                      placeholder="5"
                      min="2"
                      max="8"
                      required
                    />
                    <Input
                      label="Jumlah Pintu"
                      type="number"
                      value={editForm.doors}
                      onChange={(e) => setEditForm({ ...editForm, doors: e.target.value })}
                      placeholder="4"
                      min="2"
                      max="5"
                      required
                    />
                  </div>
                  <Select
                    label="Jenis BBM"
                    value={editForm.fuelType}
                    onChange={(e) => setEditForm({ ...editForm, fuelType: e.target.value })}
                    options={[
                      { value: 'petrol', label: 'Bensin' },
                      { value: 'diesel', label: 'Diesel' },
                      { value: 'hybrid', label: 'Hybrid' },
                      { value: 'electric', label: 'Listrik' },
                    ]}
                    required
                  />
                  <Select
                    label="Transmisi"
                    value={editForm.transmission}
                    onChange={(e) => setEditForm({ ...editForm, transmission: e.target.value })}
                    options={[
                      { value: 'manual', label: 'Manual' },
                      { value: 'automatic', label: 'Otomatis' },
                      { value: 'cvt', label: 'CVT' },
                    ]}
                    required
                  />
                  <Input
                    label="VIN Number"
                    value={editForm.vin}
                    onChange={(e) => setEditForm({ ...editForm, vin: e.target.value })}
                    placeholder="Masukkan nomor VIN kendaraan"
                    required
                  />
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Data STNK</h4>
                    <div className="space-y-3">
                      <Input
                        label="Nomor STNK"
                        value={editForm.stnkNumber}
                        onChange={(e) => setEditForm({ ...editForm, stnkNumber: e.target.value })}
                        placeholder="Masukkan nomor STNK"
                      />
                      <Input
                        label="Tanggal Expired STNK"
                        type="date"
                        value={editForm.stnkExpiredDate}
                        onChange={(e) => setEditForm({ ...editForm, stnkExpiredDate: e.target.value })}
                        placeholder="Pilih tanggal expired"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Harga & Kondisi</h3>
                <div className="space-y-4">
                  <CurrencyInput
                    label="Harga Beli"
                    value={editForm.purchasePrice}
                    onChange={(e) => setEditForm({ ...editForm, purchasePrice: e.target.value })}
                    placeholder="Masukkan harga beli mobil"
                    required
                  />
                  <CurrencyInput
                    label="Harga Jual"
                    value={editForm.sellingPrice}
                    onChange={(e) => setEditForm({ ...editForm, sellingPrice: e.target.value })}
                    placeholder="Masukkan harga jual yang diinginkan"
                    required
                  />
                  <Select
                    label="Kondisi"
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    options={[
                      { value: 'excellent', label: 'Sangat Baik' },
                      { value: 'good', label: 'Baik' },
                      { value: 'fair', label: 'Cukup' },
                    ]}
                    required
                  />
                  <Textarea
                    label="Deskripsi"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Tuliskan kondisi mobil, riwayat perawatan, fitur unggulan, dan informasi penting lainnya..."
                    rows={4}
                  />
                  
                  {/* File Upload for Photos */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Foto Mobil (maksimal 5)
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleEditFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      
                      {/* Photo Preview Grid */}
                      {editForm.photos.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {editForm.photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={photo}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index, true)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600 font-medium">Belum ada foto yang dipilih</p>
                          <p className="mt-1 text-xs text-gray-500">Klik tombol &quot;Choose Files&quot; di atas untuk mengunggah foto</p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Pilih gambar dari galeri atau kamera. Maksimal 5 foto.
                      </p>
                    </div>
                  </div>
                  
                  {/* Profit calculation preview */}
                  {editForm.purchasePrice && editForm.sellingPrice && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Estimasi Profit:</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(parseInt(editForm.sellingPrice) - parseInt(editForm.purchasePrice))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} type="button">
                Batal
              </Button>
              <Button type="submit">
                Update Mobil
              </Button>
            </div>
          </form>
        </Modal>

        {/* Maintenance Modal */}
        <Modal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          title="Tambah Biaya Perawatan"
          size="md"
        >
          <form onSubmit={handleSubmitMaintenance} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900">
                {selectedCar?.specs.brand} {selectedCar?.specs.model}
              </h4>
              <p className="text-sm text-gray-600">{selectedCar?.specs.plateNumber}</p>
            </div>
            
            <Input
              label="Deskripsi Perawatan"
              value={maintenanceForm.description}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
              placeholder="Contoh: Ganti oli, service berkala, perbaikan rem, ganti ban"
              required
            />
            
            <CurrencyInput
              label="Biaya"
              value={maintenanceForm.cost}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
              placeholder="Masukkan total biaya perawatan"
              required
            />
            
            <Input
              label="Tanggal"
              type="date"
              value={maintenanceForm.date}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, date: e.target.value })}
              placeholder="Pilih tanggal perawatan"
              required
            />
            
            <Select
              label="Bengkel/Workshop"
              value={maintenanceForm.vendor}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vendor: e.target.value })}
              options={[
                { value: '', label: 'Pilih bengkel (opsional)' },
                ...vendors.filter(v => v.category === 'workshop').map(v => ({ value: v.name, label: v.name }))
              ]}
            />
            
            {/* Current maintenance history */}
            {selectedCar && selectedCar.maintenanceCosts.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Riwayat Perawatan</h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedCar.maintenanceCosts.map((m) => (
                    <div key={m.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{m.description}</p>
                        <p className="text-gray-600">{m.date}</p>
                      </div>
                      <p className="font-medium text-red-600">{formatCurrency(m.cost)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <p className="text-sm font-medium">
                    Total Biaya Perawatan: {formatCurrency(selectedCar.maintenanceCosts.reduce((sum, m) => sum + m.cost, 0))}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsMaintenanceModalOpen(false)} type="button">
                Batal
              </Button>
              <Button type="submit">
                Tambah Biaya
              </Button>
            </div>
          </form>
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

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <InventoryContent />
    </Suspense>
  );
}
