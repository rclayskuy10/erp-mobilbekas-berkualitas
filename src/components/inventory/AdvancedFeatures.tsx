'use client';

import { useMemo } from 'react';
import { carDocuments, serviceRecords, grns, cars } from '@/data/dummy';
import { formatCurrency } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Calendar,
  Car,
} from 'lucide-react';

interface StockAgingCardProps {
  className?: string;
}

export function StockAgingCard({ className = '' }: StockAgingCardProps) {
  const stockAgingData = useMemo(() => {
    const availableCars = cars.filter(c => c.status === 'available');
    const aging: { range: string; count: number; value: number; color: string }[] = [];
    
    const categories = [
      { range: '0-30 hari', min: 0, max: 30, color: 'bg-green-500' },
      { range: '31-60 hari', min: 31, max: 60, color: 'bg-yellow-500' },
      { range: '61-90 hari', min: 61, max: 90, color: 'bg-orange-500' },
      { range: '>90 hari', min: 91, max: Infinity, color: 'bg-red-500' },
    ];

    categories.forEach(cat => {
      const carsInRange = availableCars.filter(car => {
        const grn = grns.find(g => g.carId === car.id);
        if (!grn) return false;
        const purchaseDate = new Date(grn.purchaseDate);
        const today = new Date();
        const days = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
        return days >= cat.min && days <= cat.max;
      });
      
      const totalValue = carsInRange.reduce((sum, car) => sum + car.purchasePrice, 0);
      aging.push({
        range: cat.range,
        count: carsInRange.length,
        value: totalValue,
        color: cat.color,
      });
    });

    return aging;
  }, []);

  const totalStock = stockAgingData.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Stock Aging Report</h3>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-3">
        {stockAgingData.map((item) => (
          <div key={item.range} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.range}</span>
                <span className="font-semibold text-gray-900">{item.count} unit</span>
              </div>
              <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color}`} 
                  style={{ width: `${totalStock > 0 ? (item.count / totalStock) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(item.value)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DocumentStatusCardProps {
  className?: string;
}

export function DocumentStatusCard({ className = '' }: DocumentStatusCardProps) {
  const documentStats = useMemo(() => {
    const stats = {
      valid: carDocuments.filter(d => d.status === 'valid').length,
      expired: carDocuments.filter(d => d.status === 'expired').length,
      pending: carDocuments.filter(d => d.status === 'pending').length,
      missing: carDocuments.filter(d => d.status === 'missing').length,
    };
    return stats;
  }, []);

  const expiringDocs = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return carDocuments.filter(doc => {
      if (!doc.expiryDate) return false;
      const expiry = new Date(doc.expiryDate);
      return expiry <= thirtyDaysFromNow && expiry > new Date();
    });
  }, []);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Dokumen Kendaraan</h3>
        <FileText className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-600">{documentStats.valid}</p>
          <p className="text-xs text-gray-500">Valid</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-600">{documentStats.expired}</p>
          <p className="text-xs text-gray-500">Expired</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-yellow-600">{documentStats.pending}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <FileText className="h-5 w-5 text-gray-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-600">{documentStats.missing}</p>
          <p className="text-xs text-gray-500">Missing</p>
        </div>
      </div>

      {expiringDocs.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Akan Expired (30 hari)</h4>
          <div className="space-y-2">
            {expiringDocs.slice(0, 3).map((doc) => {
              const car = cars.find(c => c.id === doc.carId);
              return (
                <div key={doc.id} className="flex items-center justify-between text-sm bg-yellow-50 rounded-lg p-2">
                  <div>
                    <span className="font-medium">{doc.type.toUpperCase()}</span>
                    <span className="text-gray-500"> - {car?.specs.brand} {car?.specs.model}</span>
                  </div>
                  <Badge variant="warning">
                    {new Date(doc.expiryDate!).toLocaleDateString('id-ID')}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ServiceHistoryCardProps {
  className?: string;
  carId?: string;
}

export function ServiceHistoryCard({ className = '', carId }: ServiceHistoryCardProps) {
  const records = useMemo(() => {
    let filtered = serviceRecords;
    if (carId) {
      filtered = serviceRecords.filter(r => r.carId === carId);
    }
    return filtered.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  }, [carId]);

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      routine: 'Rutin',
      repair: 'Perbaikan',
      bodywork: 'Body',
      inspection: 'Inspeksi',
    };
    return labels[type] || type;
  };

  const getServiceTypeBadge = (type: string) => {
    const variants: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      routine: 'info',
      repair: 'warning',
      bodywork: 'danger',
      inspection: 'success',
    };
    return variants[type] || 'info';
  };

  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Riwayat Service</h3>
        <Wrench className="h-5 w-5 text-gray-400" />
      </div>
      
      {records.length === 0 ? (
        <div className="text-center py-8">
          <Wrench className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Belum ada riwayat service</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {records.slice(0, 5).map((record) => {
              const car = cars.find(c => c.id === record.carId);
              return (
                <div key={record.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    <Wrench className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-gray-900 truncate">{record.description}</h4>
                      <Badge variant={getServiceTypeBadge(record.serviceType)}>
                        {getServiceTypeLabel(record.serviceType)}
                      </Badge>
                    </div>
                    {!carId && car && (
                      <p className="text-sm text-gray-500">{car.specs.brand} {car.specs.model}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.serviceDate).toLocaleDateString('id-ID')}
                      </span>
                      <span className="text-sm font-medium text-blue-600">{formatCurrency(record.cost)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">{records.length} records</span>
            <span className="font-semibold text-gray-900">Total: {formatCurrency(totalCost)}</span>
          </div>
        </>
      )}
    </div>
  );
}
