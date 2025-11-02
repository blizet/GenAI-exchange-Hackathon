/**
 * Notification service for managing meeting requests and other notifications
 * Provides real-time notifications with Firebase integration
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../providers/firebase';

class NotificationService {
  constructor() {
    this.listeners = new Map();
  }

  // Create a new notification
  async createNotification(notificationData) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, {
        ...notificationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        read: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for a specific user
  async getNotifications(userId, limitCount = 50) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const notifications = [];
      
      querySnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          read: true,
          updatedAt: serverTimestamp()
        })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Listen to real-time notifications for a user
  subscribeToNotifications(userId, callback) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notifications = [];
        querySnapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(notifications);
      });
      
      // Store the unsubscribe function
      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return null;
    }
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(userId) {
    const unsubscribe = this.listeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(userId);
    }
  }

  // Create meeting request notification
  async createMeetingRequestNotification(requesterId, requesterName, requesterType, recipientId, recipientName, meetingId) {
    try {
      const notificationData = {
        userId: recipientId,
        type: 'meeting_request',
        title: 'New Meeting Request',
        message: `${requesterName} (${requesterType}) has requested a meeting with you`,
        data: {
          meetingId,
          requesterId,
          requesterName,
          requesterType,
          recipientId,
          recipientName
        },
        actionUrl: `/meetings/${meetingId}`,
        priority: 'high'
      };
      
      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error creating meeting request notification:', error);
      throw error;
    }
  }

  // Create meeting accepted notification
  async createMeetingAcceptedNotification(meetingId, acceptorId, acceptorName, requesterId, requesterName) {
    try {
      const notificationData = {
        userId: requesterId,
        type: 'meeting_accepted',
        title: 'Meeting Request Accepted',
        message: `${acceptorName} has accepted your meeting request`,
        data: {
          meetingId,
          acceptorId,
          acceptorName,
          requesterId,
          requesterName
        },
        actionUrl: `/meetings/${meetingId}`,
        priority: 'high'
      };
      
      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error creating meeting accepted notification:', error);
      throw error;
    }
  }

  // Create meeting declined notification
  async createMeetingDeclinedNotification(meetingId, declinerId, declinerName, requesterId, requesterName) {
    try {
      const notificationData = {
        userId: requesterId,
        type: 'meeting_declined',
        title: 'Meeting Request Declined',
        message: `${declinerName} has declined your meeting request`,
        data: {
          meetingId,
          declinerId,
          declinerName,
          requesterId,
          requesterName
        },
        actionUrl: `/meetings`,
        priority: 'medium'
      };
      
      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error creating meeting declined notification:', error);
      throw error;
    }
  }

  // Create meeting reminder notification
  async createMeetingReminderNotification(meetingId, userId, meetingTitle, meetingTime) {
    try {
      const notificationData = {
        userId,
        type: 'meeting_reminder',
        title: 'Meeting Reminder',
        message: `You have a meeting "${meetingTitle}" scheduled for ${meetingTime}`,
        data: {
          meetingId,
          meetingTitle,
          meetingTime
        },
        actionUrl: `/meetings/${meetingId}`,
        priority: 'high'
      };
      
      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error creating meeting reminder notification:', error);
      throw error;
    }
  }

  // Create general notification
  async createGeneralNotification(userId, title, message, type = 'info', data = {}) {
    try {
      const notificationData = {
        userId,
        type,
        title,
        message,
        data,
        priority: 'medium'
      };
      
      return await this.createNotification(notificationData);
    } catch (error) {
      console.error('Error creating general notification:', error);
      throw error;
    }
  }

  // Show browser notification (if permission granted)
  async showBrowserNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, options);
      }
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
