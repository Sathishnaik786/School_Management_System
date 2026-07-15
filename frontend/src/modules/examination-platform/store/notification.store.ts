import { create } from 'zustand';
import { NotificationItem } from '../types/notification';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (item: NotificationItem) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (item) =>
    set((state) => {
      const updated = [item, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
  markAllRead: () =>
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      return {
        notifications: updated,
        unreadCount: 0,
      };
    }),
  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));
