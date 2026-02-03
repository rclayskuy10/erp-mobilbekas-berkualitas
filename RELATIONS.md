# DATA RELATIONSHIP DOCUMENTATION
## ERP Showroom Mobil - Database Schema & Relations

### **Entity Relationship Diagram (ERD)**

```
┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐
│  Vendor  │──────▶│   GRN    │──────▶│   Car    │──────▶│   Sale   │
└──────────┘ 1:N   └──────────┘ 1:1   └──────────┘ 1:1   └──────────┘
                                          │   │
                                          │   └─────────────┐
                                          ▼                 ▼
                                    ┌──────────────┐  ┌──────────────┐
                                    │ CarDocument  │  │ServiceRecord │
                                    └──────────────┘  └──────────────┘
                                          1:N              1:N
                                          
┌──────────────┐                    ┌──────────────┐
│ Notification │                    │MaintenanceCost│
└──────────────┘                    └──────────────┘
       │                                    │
       └─────────────────┬──────────────────┘
                         ▼
                   relatedId/carId
```

---

## **1. CORE ENTITIES**

### **1.1 User**
```typescript
- id: string (PK)
- name: string
- email: string
- password: string
- role: 'owner' | 'admin' | 'staff'
- avatar?: string
- createdAt: string
- isActive: boolean
```
**Relasi:** None (standalone auth entity)

---

### **1.2 Vendor**
```typescript
- id: string (PK)
- name: string
- type: 'individual' | 'showroom' | 'leasing' | 'auction'
- contactPerson: string
- phone: string
- email?: string
- address: string
- rating: number (0-5)
- totalTransactions: number
- totalValue: number
- paymentTerms: string
- notes?: string
- isActive: boolean
- createdAt: string
```
**Relasi:**
- ✅ `1:N` dengan **GRN** (One vendor can have many purchases)
- Field relasi: `GRN.vendorId → Vendor.id`

---

### **1.3 GRN (Goods Receipt Note / Pembelian)**
```typescript
- id: string (PK)
- grnNumber: string
- carId: string (FK → Car.id) ✅
- vendorId?: string (FK → Vendor.id) ✅ NEW!
- supplierName: string (kept for backward compatibility)
- supplierContact?: string
- purchaseDate: string
- purchasePrice: number
- notes?: string
- receivedBy: string
- createdAt: string
```
**Relasi:**
- ✅ `N:1` dengan **Vendor** (Many GRNs can reference one vendor)
- ✅ `1:1` dengan **Car** (One GRN creates one car entry)
- Field relasi: 
  - `GRN.vendorId → Vendor.id`
  - `GRN.carId → Car.id`
  - `Car.grnId → GRN.id` (reverse reference)

---

### **1.4 Car (Inventory)**
```typescript
- id: string (PK)
- specs: CarSpecs
- photos: string[]
- status: 'available' | 'sold' | 'reserved' | 'maintenance'
- condition: 'excellent' | 'good' | 'fair'
- purchasePrice: number
- maintenanceCosts: MaintenanceCost[]
- sellingPrice: number
- hpp: number (calculated)
- description: string
- createdAt: string
- updatedAt: string
- grnId?: string (FK → GRN.id) ✅
- saleId?: string (FK → Sale.id) ✅
```
**Relasi:**
- ✅ `1:1` dengan **GRN** (Car created from one GRN)
- ✅ `1:1` dengan **Sale** (Car can be sold once)
- ✅ `1:N` dengan **CarDocument** (One car can have multiple documents)
- ✅ `1:N` dengan **ServiceRecord** (One car can have multiple service records)
- ✅ `1:N` dengan **MaintenanceCost** (One car can have multiple maintenance entries)
- Field relasi:
  - `Car.grnId → GRN.id`
  - `Car.saleId → Sale.id`
  - `CarDocument.carId → Car.id`
  - `ServiceRecord.carId → Car.id`
  - `MaintenanceCost.carId → Car.id`

---

### **1.5 Sale (Penjualan)**
```typescript
- id: string (PK)
- saleNumber: string
- carId: string (FK → Car.id) ✅
- customerName: string
- customerPhone: string
- customerEmail?: string
- customerAddress?: string
- saleDate: string
- sellingPrice: number
- paymentMethod: 'cash' | 'transfer' | 'credit' | 'leasing'
- downPayment?: number
- status: 'pending' | 'completed' | 'cancelled'
- soldBy: string
- notes?: string
- createdAt: string
```
**Relasi:**
- ✅ `N:1` dengan **Car** (Many sales theoretically, but business rule: 1:1)
- Field relasi:
  - `Sale.carId → Car.id`
  - `Car.saleId → Sale.id` (reverse reference)

**Profit Calculation:**
```typescript
// To get sale profit:
const sale = sales.find(s => s.id === saleId);
const car = cars.find(c => c.id === sale.carId);
const profit = sale.sellingPrice - car.purchasePrice - car.maintenanceCosts.reduce(...);
```

---

## **2. SUPPORTING ENTITIES**

### **2.1 CarDocument**
```typescript
- id: string (PK)
- carId: string (FK → Car.id) ✅
- type: 'bpkb' | 'stnk' | 'faktur' | 'kir' | 'other'
- name: string
- documentNumber?: string
- issueDate?: string
- expiryDate?: string
- status: 'valid' | 'expired' | 'pending' | 'missing'
- notes?: string
- uploadedBy: string
- createdAt: string
```
**Relasi:**
- ✅ `N:1` dengan **Car**
- Field relasi: `CarDocument.carId → Car.id`

---

### **2.2 ServiceRecord**
```typescript
- id: string (PK)
- carId: string (FK → Car.id) ✅
- serviceDate: string
- serviceType: 'routine' | 'repair' | 'inspection' | 'bodywork' | 'other'
- description: string
- vendor: string
- cost: number
- partsReplaced?: string[]
- mileageAtService: number
- nextServiceMileage?: number
- beforeCondition?: string
- afterCondition?: string
- photos?: string[]
- performedBy: string
- createdAt: string
```
**Relasi:**
- ✅ `N:1` dengan **Car**
- Field relasi: `ServiceRecord.carId → Car.id`

**Note:** ServiceRecord adalah versi lengkap dari MaintenanceCost dengan detail lebih banyak.

---

### **2.3 MaintenanceCost**
```typescript
- id: string (PK)
- carId: string (FK → Car.id) ✅
- description: string
- cost: number
- date: string
- vendor?: string
```
**Relasi:**
- ✅ `N:1` dengan **Car**
- Field relasi: `MaintenanceCost.carId → Car.id`
- Also embedded in: `Car.maintenanceCosts[]` array

---

### **2.4 Notification**
```typescript
- id: string (PK)
- type: 'payment' | 'stock' | 'document' | 'sales' | 'system'
- priority: 'high' | 'medium' | 'low'
- title: string
- message: string
- relatedId?: string ✅ NEW! (FK → Car.id / Sale.id / etc)
- link?: string
- isRead: boolean
- createdAt: string
```
**Relasi:**
- ✅ `N:1` dengan **Car**, **Sale**, atau entity lain (via relatedId)
- Field relasi: `Notification.relatedId` (polymorphic, tergantung type)

**Usage Examples:**
```typescript
// Stock notification
{
  type: 'stock',
  relatedId: 'car-003', // car yang aging
  link: '/dashboard/inventory'
}

// Payment notification
{
  type: 'payment',
  relatedId: 'sale-003', // sale dengan cicilan
  link: '/dashboard/sales'
}

// Document notification
{
  type: 'document',
  relatedId: 'car-005', // car dengan dokumen bermasalah
  link: '/dashboard/inventory'
}
```

---

## **3. RELATIONSHIP MAPPING**

### **Forward References (FK)**
| Entity | Foreign Key | Points To | Type |
|--------|------------|-----------|------|
| GRN | `vendorId` | Vendor.id | N:1 |
| GRN | `carId` | Car.id | 1:1 |
| Car | `grnId` | GRN.id | 1:1 |
| Car | `saleId` | Sale.id | 1:1 |
| Sale | `carId` | Car.id | N:1 |
| CarDocument | `carId` | Car.id | N:1 |
| ServiceRecord | `carId` | Car.id | N:1 |
| MaintenanceCost | `carId` | Car.id | N:1 |
| Notification | `relatedId` | Polymorphic | N:1 |

### **Data Flow**
```
1. Vendor supplies → 2. GRN created → 3. Car added to inventory
4. Car maintained → ServiceRecord/MaintenanceCost added
5. Documents uploaded → CarDocument linked
6. Car sold → Sale created, Car.status = 'sold'
7. Notifications triggered → relatedId links to Car/Sale
```

---

## **4. QUERY PATTERNS**

### **4.1 Get Complete Car Details with All Relations**
```typescript
const carId = 'car-001';

// Get car
const car = cars.find(c => c.id === carId);

// Get purchase info (GRN)
const grn = grns.find(g => g.id === car.grnId);

// Get vendor who supplied
const vendor = vendors.find(v => v.id === grn.vendorId);

// Get sale info (if sold)
const sale = sales.find(s => s.id === car.saleId);

// Get documents
const documents = carDocuments.filter(d => d.carId === carId);

// Get service history
const services = serviceRecords.filter(s => s.carId === carId);

// Get maintenance costs
const maintenances = maintenanceCosts.filter(m => m.carId === carId);

// Get related notifications
const notifications = notifications.filter(n => n.relatedId === carId);
```

### **4.2 Calculate Car Profit**
```typescript
const calculateCarProfit = (carId: string) => {
  const car = cars.find(c => c.id === carId);
  const sale = sales.find(s => s.carId === carId);
  
  if (!car || !sale) return null;
  
  const purchaseCost = car.purchasePrice;
  const maintenanceCost = car.maintenanceCosts.reduce((sum, m) => sum + m.cost, 0);
  const sellingPrice = sale.sellingPrice;
  
  return {
    revenue: sellingPrice,
    cost: purchaseCost + maintenanceCost,
    profit: sellingPrice - purchaseCost - maintenanceCost,
    margin: ((sellingPrice - purchaseCost - maintenanceCost) / sellingPrice) * 100
  };
};
```

### **4.3 Get Vendor Performance**
```typescript
const getVendorPerformance = (vendorId: string) => {
  const vendor = vendors.find(v => v.id === vendorId);
  
  // Get all GRNs from this vendor
  const vendorGRNs = grns.filter(g => g.vendorId === vendorId);
  
  // Get all cars from this vendor
  const vendorCars = cars.filter(c => 
    vendorGRNs.some(g => g.id === c.grnId)
  );
  
  // Calculate stats
  const totalPurchases = vendorGRNs.length;
  const totalValue = vendorGRNs.reduce((sum, g) => sum + g.purchasePrice, 0);
  const soldCars = vendorCars.filter(c => c.status === 'sold').length;
  
  return {
    vendor,
    totalPurchases,
    totalValue,
    soldCars,
    sellThroughRate: (soldCars / totalPurchases) * 100
  };
};
```

---

## **5. DATA INTEGRITY RULES**

### **5.1 Required Relations**
- ✅ **Every Car MUST have a GRN** (car.grnId cannot be null)
- ✅ **Every GRN MUST create exactly one Car** (1:1 relationship)
- ✅ **Every Sale MUST reference a Car** (sale.carId cannot be null)
- ✅ **CarDocument, ServiceRecord, MaintenanceCost MUST reference valid Car**

### **5.2 Business Rules**
- Car status changes: `available → reserved → sold` or `available → maintenance → available`
- GRN.purchasePrice should match Car.purchasePrice
- Vendor.totalTransactions should match count of GRNs with that vendorId
- Notification.relatedId must point to valid entity based on type

### **5.3 Orphan Prevention**
- Cannot delete Vendor if has active GRNs
- Cannot delete Car if has Sale (status = 'sold')
- Cannot delete Car if has pending CarDocuments
- Deleting Car should cascade delete: CarDocuments, ServiceRecords, MaintenanceCosts

---

## **6. MISSING RELATIONS (Future Enhancement)**

These relations don't exist yet but might be useful:

1. **User ↔ Sale** (sales person tracking)
   - Current: `Sale.soldBy` is just a string
   - Enhancement: Add `Sale.userId` to link to User entity

2. **User ↔ Notification** (user-specific notifications)
   - Current: Notifications are global
   - Enhancement: Add `Notification.userId` for targeted notifications

3. **Vendor ↔ ServiceRecord** (vendor performance tracking)
   - Current: `ServiceRecord.vendor` is just a string
   - Enhancement: Add `ServiceRecord.vendorId` to link service vendors

4. **Customer Entity** (repeat customer tracking)
   - Current: Customer data embedded in Sale
   - Enhancement: Create Customer entity, link `Sale.customerId`

---

## **SUMMARY**

### **Current Relations:**
✅ Vendor → GRN (N:1) via `vendorId`  
✅ GRN → Car (1:1) via `carId` / `grnId`  
✅ Car → Sale (1:1) via `saleId` / `carId`  
✅ Car → CarDocument (1:N) via `carId`  
✅ Car → ServiceRecord (1:N) via `carId`  
✅ Car → MaintenanceCost (1:N) via `carId`  
✅ Notification → Any Entity (N:1) via `relatedId` (polymorphic)

### **Data Count:**
- Users: 5
- Vendors: 6
- Cars: 15
- GRNs: 15
- Sales: 6
- CarDocuments: 7
- ServiceRecords: 5
- MaintenanceCosts: 15+
- Notifications: 8

**All core business relations are properly implemented! 🎉**
