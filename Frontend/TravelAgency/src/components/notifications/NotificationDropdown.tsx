
import React, { useState } from 'react';
import { Bell, Clock, CheckCheck, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const { t } = useTranslation();
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();

  const groupedNotifications = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      today: notifications.filter(n => n.timestamp >= today),
      yesterday: notifications.filter(n => n.timestamp >= yesterday && n.timestamp < today),
      thisWeek: notifications.filter(n => n.timestamp >= thisWeek && n.timestamp < yesterday)
    };
  }, [notifications]);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const renderNotificationGroup = (title: string, notificationList: typeof notifications) => {
    if (notificationList.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 mb-2 px-3">{title}</h4>
        {notificationList.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
              !notification.read ? 'bg-blue-50' : ''
            }`}
            onClick={() => handleNotificationClick(notification.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 mb-1">
                  {notification.type === 'trip_started' 
                    ? t('notifications.tripStarted', {
                        travelId: notification.travelId,
                        origin: notification.origin,
                        destination: notification.destination
                      })
                    : t('notifications.tripCompleted', {
                        travelId: notification.travelId,
                        origin: notification.origin,
                        destination: notification.destination
                      })
                  }
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={notification.type === 'trip_started' ? 'default' : 'secondary'} className="text-xs">
                    {notification.type === 'trip_started' ? t('notifications.started') : t('notifications.completed')}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-gray-900">{t('notifications.title')}</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount}</Badge>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          <>
            <div className="max-h-64 overflow-y-auto">
              {renderNotificationGroup(t('notifications.today'), groupedNotifications.today)}
              {renderNotificationGroup(t('notifications.yesterday'), groupedNotifications.yesterday)}
              {renderNotificationGroup(t('notifications.thisWeek'), groupedNotifications.thisWeek)}
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="p-2 flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                {t('notifications.markAllRead')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-red-600 hover:text-red-700"
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t('notifications.clearAll')}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
