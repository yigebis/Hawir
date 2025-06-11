
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Trash2, Clock } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
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
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </h3>
        <div className="space-y-4">
          {notificationList.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${
                !notification.read 
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <Badge 
                      variant={notification.type === 'trip_started' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {notification.type === 'trip_started' ? t('notifications.started') : t('notifications.completed')}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-gray-900 mb-2">
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
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{t('notifications.tripId')}: </span>
                    {notification.travelId}
                    <span className="mx-2">•</span>
                    <span className="font-medium">{t('common.route')}: </span>
                    {notification.origin} → {notification.destination}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNotificationClick(notification.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {t('notifications.markAsRead')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Handle delete */}}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout showHeader={true}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('notifications.title')}
            </h1>
            <p className="text-gray-600">
              {t('notifications.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                {unreadCount} {t('notifications.unread')}
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              {t('notifications.markAllRead')}
            </Button>
            <Button
              variant="outline"
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
              {t('notifications.clearAll')}
            </Button>
          </div>
        </div>

        {/* Notifications Content */}
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {t('notifications.noNotifications')}
            </h3>
            <p className="text-gray-500">
              {t('notifications.noNotificationsDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {renderNotificationGroup(t('notifications.today'), groupedNotifications.today)}
            {renderNotificationGroup(t('notifications.yesterday'), groupedNotifications.yesterday)}
            {renderNotificationGroup(t('notifications.thisWeek'), groupedNotifications.thisWeek)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
