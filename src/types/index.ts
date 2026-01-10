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
  supplierName: string;
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
