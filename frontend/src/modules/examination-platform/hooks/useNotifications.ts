import { useNotificationStore } from '../store/notification.store';

export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllRead,
    clearNotifications,
  } = useNotificationStore();

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllRead,
    clearNotifications,
  };
};
