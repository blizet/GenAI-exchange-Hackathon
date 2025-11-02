import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, Trash2, Calendar, Users, MessageCircle, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import notificationService from '../services/notificationService';
import { useApp } from '../contexts/AppContext';
import MeetingManager from './MeetingManager';

const NotificationCenter = ({ isOpen, onClose }) => {
  const { state } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMeetingManager, setShowMeetingManager] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!state.user?.uid) return;
    
    try {
      setLoading(true);
      const userNotifications = await notificationService.getNotifications(state.user.uid);
      setNotifications(userNotifications);
      
      const unread = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [state.user?.uid]);

  useEffect(() => {
    if (isOpen && state.user?.uid) {
      loadNotifications();
    }
  }, [isOpen, state.user?.uid, loadNotifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!state.user?.uid) return;

    const unsubscribe = notificationService.subscribeToNotifications(
      state.user.uid,
      (realTimeNotifications) => {
        setNotifications(realTimeNotifications);
        const unread = realTimeNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [state.user?.uid]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(state.user.uid);
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // Handle different notification types
    if (notification.type === 'meeting_request') {
      // For meeting requests, show the meeting manager
      setSelectedMeeting(notification.data);
      setShowMeetingManager(true);
    } else if (notification.actionUrl) {
      // For other notifications with action URLs, navigate to them
      window.location.href = notification.actionUrl;
    }
  };

  const handleMeetingUpdated = (updatedMeeting) => {
    // Update the notification or remove it
    setNotifications(prev => 
      prev.filter(n => n.data?.meetingId !== updatedMeeting.id)
    );
    setShowMeetingManager(false);
    setSelectedMeeting(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'meeting_request':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'meeting_accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'meeting_declined':
        return <X className="h-5 w-5 text-red-500" />;
      case 'meeting_reminder':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const notificationTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return notificationTime.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6" />
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-purple-100">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-3 py-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationPriorityColor(notification.priority)} ${
                    !notification.read ? 'bg-blue-50' : ''
                  } cursor-pointer`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="inline-flex items-center text-xs text-purple-600 hover:text-purple-800 mt-2"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View details
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meeting Manager Modal */}
      {showMeetingManager && selectedMeeting && (
        <MeetingManager
          meeting={selectedMeeting}
          onMeetingUpdated={handleMeetingUpdated}
          onClose={() => {
            setShowMeetingManager(false);
            setSelectedMeeting(null);
          }}
        />
      )}
    </div>
  );
};

export default NotificationCenter;
