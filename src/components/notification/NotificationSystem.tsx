'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notifications as initialNotifications } from '@/data/dummy';
import { Notification } from '@/types';
import Badge from '@/components/ui/Badge';
import {
  Bell,
  X,
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
} from 'lucide-react';

interface NotificationSystemProps {
  onNotificationClick?: (notification: Notification) => void;
}

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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-blue-500';
    default: return 'bg-gray-500';
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

export default function NotificationSystem({ onNotificationClick }: NotificationSystemProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const getNotificationLink = (notification: Notification): string => {
    // Build specific link based on type and relatedId
    if (notification.relatedId) {
      switch (notification.type) {
        case 'payment':
        case 'sales':
          // Link to specific sale
          return `/dashboard/sales?highlight=${notification.relatedId}`;
        case 'stock':
        case 'document':
          // Link to specific car in inventory
          return `/dashboard/inventory?highlight=${notification.relatedId}`;
        default:
          break;
      }
    }
    
    // If notification has explicit link, use it
    if (notification.link) {
      return notification.link;
    }

    // Fallback to general pages
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

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    handleMarkAsRead(notification.id);
    
    // Call custom handler if provided
    onNotificationClick?.(notification);
    
    // Navigate to link
    const link = getNotificationLink(notification);
    setIsOpen(false);
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

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID');
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5 md:h-6 md:w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 md:min-w-[18px] md:h-[18px] bg-red-500 text-white text-[9px] md:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 md:bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel - Mobile: Bottom Sheet, Desktop: Dropdown */}
          <div className="fixed md:absolute inset-x-0 bottom-0 md:bottom-auto md:right-0 md:left-auto md:top-full md:mt-2 md:w-80 bg-white md:rounded-xl rounded-t-xl shadow-2xl md:shadow-xl border-t md:border border-gray-200 z-50 overflow-hidden max-h-[80vh] md:max-h-[420px] flex flex-col safe-top">
            {/* Mobile Handle Bar */}
            <div className="md:hidden flex justify-center pt-1.5 pb-0.5">
              <div className="w-8 h-0.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="px-3 py-2.5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-gray-700" />
                  <h3 className="font-semibold text-gray-900 text-sm">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    filter === 'all' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                    filter === 'unread' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>Belum Dibaca</span>
                  {unreadCount > 0 && (
                    <span className={`min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      filter === 'unread' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="w-full mt-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium text-center py-0.5"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {filteredNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-900 mb-0.5">Tidak ada notifikasi</p>
                  <p className="text-[10px] text-gray-500">Notifikasi baru akan muncul di sini</p>
                </div>
              ) : (
                <div>
                  {filteredNotifications.map((notification, index) => {
                    const Icon = getNotificationIcon(notification.type);
                    const priorityBadge = getPriorityBadge(notification.priority);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`px-3 py-2 border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50/40' : 'bg-white'
                        } ${index === 0 ? 'border-t-0' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-2">
                          {/* Icon */}
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            notification.priority === 'high' ? 'bg-red-100' :
                            notification.priority === 'medium' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              notification.priority === 'high' ? 'text-red-600' :
                              notification.priority === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1.5 mb-0.5">
                              <h4 className={`text-xs leading-snug ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 leading-snug line-clamp-2 mb-1.5">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant={priorityBadge.variant} className="text-[10px]">
                                {priorityBadge.label}
                              </Badge>
                              <span className="text-[10px] text-gray-400">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismiss(notification.id);
                            }}
                            className="p-0.5 hover:bg-gray-200 rounded transition-colors shrink-0"
                          >
                            <X className="h-3.5 w-3.5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-2 border-t border-gray-100 bg-gray-50 shrink-0">
                <button 
                  onClick={() => {
                    router.push('/dashboard/notifications');
                    setTimeout(() => setIsOpen(false), 100);
                  }}
                  className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all py-0.5"
                >
                  Lihat Semua Notifikasi
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
