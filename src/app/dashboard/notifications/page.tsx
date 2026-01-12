'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import { notifications as initialNotifications } from '@/data/dummy';
import { Notification } from '@/types';
import {
  Bell,
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
  Settings,
  CheckCircle,
  Trash2,
  ExternalLink,
  Filter,
} from 'lucide-react';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'payment': return Clock;
    case 'stock': return AlertTriangle;
    case 'document': return FileText;
    case 'sales': return TrendingUp;
    case 'system': return Settings;
    default: return Bell;
  }
};

const getPriorityBadge = (priority: string) => {
  const badges: Record<string, { variant: 'danger' | 'warning' | 'info' | 'success'; label: string }> = {
    high: { variant: 'danger', label: 'Tinggi' },
    medium: { variant: 'warning', label: 'Sedang' },
    low: { variant: 'info', label: 'Rendah' },
  };
  return badges[priority] || { variant: 'info', label: priority };
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');

  const getNotificationLink = (notification: Notification): string => {
    if (notification.relatedId) {
      switch (notification.type) {
        case 'payment':
        case 'sales':
          return `/dashboard/sales?highlight=${notification.relatedId}`;
        case 'stock':
        case 'document':
          return `/dashboard/inventory?highlight=${notification.relatedId}`;
        default:
          break;
      }
    }
    
    if (notification.link) {
      return notification.link;
    }

    switch (notification.type) {
      case 'payment':
      case 'sales':
        return '/dashboard/sales';
      case 'stock':
      case 'document':
        return '/dashboard/inventory';
      case 'system':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'unread' && !notification.isRead) ||
        (statusFilter === 'read' && notification.isRead);
      
      return matchesSearch && matchesType && matchesPriority && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, searchQuery, typeFilter, priorityFilter, statusFilter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    const link = getNotificationLink(notification);
    router.push(link);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleDeleteAll = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua notifikasi?')) {
      setNotifications([]);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      payment: 'Pembayaran',
      stock: 'Stok',
      document: 'Dokumen',
      sales: 'Penjualan',
      system: 'Sistem',
    };
    return labels[type] || type;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-7 w-7" />
                Notifikasi
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola semua notifikasi dan pemberitahuan sistem
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleMarkAllAsRead}
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                >
                  Tandai Semua Dibaca
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="danger"
                  onClick={handleDeleteAll}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Hapus Semua
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Total Notifikasi</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Belum Dibaca</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Prioritas Tinggi</p>
              <p className="text-2xl font-bold text-orange-600">
                {notifications.filter(n => n.priority === 'high').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Sudah Dibaca</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.isRead).length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Filter</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari notifikasi..."
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="unread">Belum Dibaca</option>
                <option value="read">Sudah Dibaca</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Tipe</option>
                <option value="payment">Pembayaran</option>
                <option value="stock">Stok</option>
                <option value="document">Dokumen</option>
                <option value="sales">Penjualan</option>
                <option value="system">Sistem</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Prioritas</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada notifikasi
                </h3>
                <p className="text-gray-500">
                  {notifications.length === 0 
                    ? 'Belum ada notifikasi masuk.' 
                    : 'Tidak ada notifikasi yang sesuai dengan filter Anda.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const priorityBadge = getPriorityBadge(notification.priority);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-lg shrink-0 h-fit ${
                          notification.priority === 'high' ? 'bg-red-100' :
                          notification.priority === 'medium' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            notification.priority === 'high' ? 'text-red-600' :
                            notification.priority === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className={`text-base ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-3">
                                <Badge variant={priorityBadge.variant} size="sm">
                                  {priorityBadge.label}
                                </Badge>
                                <Badge variant="default" size="sm">
                                  {getTypeLabel(notification.type)}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Unread Indicator */}
                            {!notification.isRead && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => handleNotificationClick(notification)}
                              leftIcon={<ExternalLink className="h-4 w-4" />}
                            >
                              Lihat Detail
                            </Button>
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleMarkAsRead(notification.id)}
                                leftIcon={<CheckCircle className="h-4 w-4" />}
                              >
                                Tandai Dibaca
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(notification.id)}
                              leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
