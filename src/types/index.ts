// User & Authentication Types
export type UserRole = 'owner' | 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
  // Sales-specific fields
  isSalesPerson?: boolean;
  salesTarget?: number; // Monthly target in IDR
  commissionRate?: number; // Percentage (e.g., 2.5 for 2.5%)
  phone?: string;
  joinDate?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Car / Inventory Types
export type CarStatus = 'available' | 'sold' | 'reserved' | 'maintenance';
export type CarCondition = 'excellent' | 'good' | 'fair';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type TransmissionType = 'manual' | 'automatic' | 'cvt';

export interface CarSpecs {
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  engineCapacity: string;
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  doors: number;
  vin: string;
  plateNumber: string;
}

export interface Car {
  id: string;
  specs: CarSpecs;
  photos: string[];
  status: CarStatus;
  condition: CarCondition;
  purchasePrice: number;
  maintenanceCosts: MaintenanceCost[];
  sellingPrice: number;
  hpp: number; // Harga Pokok Penjualan
  description: string;
  createdAt: string;
  updatedAt: string;
  grnId?: string;
  saleId?: string;
  stnkNumber?: string;
  stnkExpiredDate?: string;
}

// Maintenance / Repair Types
export interface MaintenanceCost {
  id: string;
  carId: string;
  description: string;
  cost: number;
  date: string;
  vendor?: string;
}

// GRN (Goods Receipt Note) Types
export interface GRN {
  id: string;
  grnNumber: string;
  carId: string;
  purchaseDate: string;
  vendorId?: string; // Link to Vendor
  supplierName: string; // Kept for backward compatibility
  supplierContact?: string;
  purchasePrice: number;
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

// Sales Types
export type PaymentMethod = 'cash' | 'transfer' | 'credit' | 'leasing';
export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export interface Sale {
  id: string;
  saleNumber: string;
  carId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  saleDate: string;
  sellingPrice: number;
  paymentMethod: PaymentMethod;
  downPayment?: number;
  status: SaleStatus;
  soldBy: string;
  notes?: string;
  createdAt: string;
}

// Financial Types
export interface FinancialSummary {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  operationalExpenses: number;
  netProfit: number;
  totalCarsSold: number;
  averageProfit: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  carsSold: number;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdBy: string;
}

// Dashboard Types
export interface DashboardStats {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  totalRevenue: number;
  totalProfit: number;
  pendingSales: number;
}

// Permission Types
export interface Permission {
  module: string;
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  type: 'individual' | 'showroom' | 'leasing' | 'auction';
  rating: number; // 1-5
  totalTransactions: number;
  totalValue: number;
  paymentTerms: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

// Document Management Types
export type DocumentType = 'bpkb' | 'stnk' | 'faktur' | 'ktp' | 'kwitansi' | 'other';
export type DocumentStatus = 'valid' | 'expired' | 'pending' | 'missing';

export interface CarDocument {
  id: string;
  carId: string;
  type: DocumentType;
  name: string;
  fileUrl?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  status: DocumentStatus;
  notes?: string;
  uploadedBy: string;
  createdAt: string;
}

// Service History Types
export interface ServiceRecord {
  id: string;
  carId: string;
  serviceDate: string;
  serviceType: 'routine' | 'repair' | 'inspection' | 'bodywork' | 'other';
  description: string;
  vendor: string;
  cost: number;
  partsReplaced?: string[];
  mileageAtService: number;
  nextServiceMileage?: number;
  beforeCondition?: string;
  afterCondition?: string;
  photos?: string[];
  performedBy: string;
  createdAt: string;
}

// Notification Types
export type NotificationType = 'payment' | 'stock' | 'document' | 'sales' | 'system';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  relatedId?: string; // ID of related entity (carId, saleId, etc)
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// Stock Aging Types
export interface StockAgingData {
  carId: string;
  daysInStock: number;
  category: '0-30' | '31-60' | '61-90' | '90+';
  purchasePrice: number;
  currentValue: number;
  depreciation: number;
}

// Sales Performance Types
export interface SalesPerformance {
  userId: string;
  userName: string;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  conversionRate: number;
  avgDealSize: number;
  target: number;
  achievement: number;
}

// Inventory Analytics Types
export interface BrandAnalytics {
  brand: string;
  totalUnits: number;
  soldUnits: number;
  availableUnits: number;
  totalRevenue: number;
  totalProfit: number;
  avgDaysToSell: number;
  turnoverRate: number;
}
