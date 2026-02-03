// Format currency to Indonesian Rupiah
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date to Indonesian format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

// Format date short
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// Format number with thousand separator
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

// Calculate HPP (Harga Pokok Penjualan)
export function calculateHPP(purchasePrice: number, maintenanceCosts: { cost: number }[]): number {
  const totalMaintenance = maintenanceCosts.reduce((sum, m) => sum + m.cost, 0);
  return purchasePrice + totalMaintenance;
}

// Calculate profit
export function calculateProfit(sellingPrice: number, hpp: number): number {
  return sellingPrice - hpp;
}

// Calculate profit margin percentage
export function calculateProfitMargin(sellingPrice: number, hpp: number): number {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - hpp) / sellingPrice) * 100;
}

// Calculate financial metrics (centralized calculation)
export function calculateFinancialMetrics(
  cars: { id: string; status: string; hpp: number }[],
  sales: { carId: string; status: string; sellingPrice: number }[],
  expenses: { amount: number }[]
) {
  // Get completed sales
  const completedSales = sales.filter((s) => s.status === 'completed');
  
  // Total Revenue from completed sales
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.sellingPrice, 0);
  
  // Get sold cars that have completed sales
  const soldCars = cars.filter((c) => 
    c.status === 'sold' && completedSales.some(s => s.carId === c.id)
  );
  
  // Total HPP (Harga Pokok Penjualan) from sold cars
  const totalHPP = soldCars.reduce((sum, c) => sum + c.hpp, 0);
  
  // Gross Profit (Revenue - HPP)
  const grossProfit = totalRevenue - totalHPP;
  
  // Total Expenses (operational costs)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Net Profit (Gross Profit - Expenses)
  const netProfit = grossProfit - totalExpenses;
  
  return {
    totalRevenue,
    totalHPP,
    grossProfit,
    totalExpenses,
    netProfit,
  };
}

// Generate unique ID
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}${randomPart}`;
}

// Generate document number
export function generateDocNumber(prefix: string, date: Date, sequence: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const seq = String(sequence).padStart(3, '0');
  return `${prefix}/${year}/${month}/${seq}`;
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    sold: 'bg-blue-100 text-blue-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    maintenance: 'bg-orange-100 text-orange-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Get status display name
export function getStatusDisplayName(status: string): string {
  const names: Record<string, string> = {
    available: 'Tersedia',
    sold: 'Terjual',
    reserved: 'Dipesan',
    maintenance: 'Perawatan',
    pending: 'Pending',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return names[status] || status;
}

// Get condition display name
export function getConditionDisplayName(condition: string): string {
  const names: Record<string, string> = {
    excellent: 'Sangat Baik',
    good: 'Baik',
    fair: 'Cukup',
  };
  return names[condition] || condition;
}

// Get fuel type display name
export function getFuelTypeDisplayName(fuelType: string): string {
  const names: Record<string, string> = {
    petrol: 'Bensin',
    diesel: 'Diesel',
    hybrid: 'Hybrid',
    electric: 'Listrik',
  };
  return names[fuelType] || fuelType;
}

// Get transmission display name
export function getTransmissionDisplayName(transmission: string): string {
  const names: Record<string, string> = {
    manual: 'Manual',
    automatic: 'Otomatis',
    cvt: 'CVT',
  };
  return names[transmission] || transmission;
}

// Get payment method display name
export function getPaymentMethodDisplayName(method: string): string {
  const names: Record<string, string> = {
    cash: 'Tunai',
    transfer: 'Transfer Bank',
    credit: 'Kredit',
    leasing: 'Leasing',
  };
  return names[method] || method;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Get month name in Indonesian
export function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month] || '';
}

// Export data to CSV and download
export function exportToCSV(data: Record<string, unknown>[], filename: string, headers?: string[]): void {
  if (data.length === 0) return;
  
  const keys = headers || Object.keys(data[0]);
  const csvContent = [
    keys.join(','),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export multiple sheets to Excel (using HTML table format)
export function exportToExcel(sheets: { name: string; data: Record<string, unknown>[]; headers?: Record<string, string> }[], filename: string): void {
  let htmlContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  htmlContent += '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>';
  
  sheets.forEach((sheet, index) => {
    htmlContent += `<x:ExcelWorksheet><x:Name>${sheet.name}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>`;
  });
  
  htmlContent += '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>';
  
  sheets.forEach((sheet) => {
    if (sheet.data.length === 0) return;
    
    const keys = Object.keys(sheet.data[0]);
    const headerLabels = sheet.headers || {};
    
    htmlContent += `<table border="1"><thead><tr>`;
    keys.forEach(key => {
      htmlContent += `<th style="background-color:#4472C4;color:white;font-weight:bold;padding:8px;">${headerLabels[key] || key}</th>`;
    });
    htmlContent += '</tr></thead><tbody>';
    
    sheet.data.forEach(row => {
      htmlContent += '<tr>';
      keys.forEach(key => {
        const value = row[key];
        htmlContent += `<td style="padding:6px;">${value ?? ''}</td>`;
      });
      htmlContent += '</tr>';
    });
    
    htmlContent += '</tbody></table><br/>';
  });
  
  htmlContent += '</body></html>';
  
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
