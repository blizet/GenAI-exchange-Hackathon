import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import notificationService from '../services/notificationService';
import { useApp } from '../contexts/AppContext';

const NotificationBell = ({ onOpenNotifications }) => {
  const { state } = useApp();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!state.user?.uid) return;

    // Request notification permission
    notificationService.requestPermission().then(setHasPermission);

    // Load initial unread count
    const loadUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount(state.user.uid);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToNotifications(
      state.user.uid,
      (notifications) => {
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [state.user?.uid]);

  // Show browser notification for new notifications
  useEffect(() => {
    if (hasPermission && unreadCount > 0) {
      notificationService.showBrowserNotification(
        'New Notification',
        {
          body: `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        }
      );
    }
  }, [unreadCount, hasPermission]);

  if (!state.user?.uid) return null;

  return (
    <button
      onClick={onOpenNotifications}
      className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
      title="Notifications"
    >
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
