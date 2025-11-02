import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, MessageCircle, AlertCircle } from 'lucide-react';
import notificationService from '../services/notificationService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const MeetingManager = ({ meeting, onMeetingUpdated, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleAccept = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meeting.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: responseMessage.trim() || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to accept meeting request');
      }

      const result = await response.json();

      // Create notification for the requester
      try {
        await notificationService.createMeetingAcceptedNotification(
          meeting.id,
          meeting.recipient_id,
          meeting.recipient_name || 'You',
          meeting.requester_id,
          meeting.requester_name || 'Requester'
        );
      } catch (notificationError) {
        console.warn('Failed to create acceptance notification:', notificationError);
      }

      if (onMeetingUpdated) {
        onMeetingUpdated({ ...meeting, status: 'accepted', ...result });
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meeting.id}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: responseMessage.trim() || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to decline meeting request');
      }

      const result = await response.json();

      // Create notification for the requester
      try {
        await notificationService.createMeetingDeclinedNotification(
          meeting.id,
          meeting.recipient_id,
          meeting.recipient_name || 'You',
          meeting.requester_id,
          meeting.requester_name || 'Requester'
        );
      } catch (notificationError) {
        console.warn('Failed to create decline notification:', notificationError);
      }

      if (onMeetingUpdated) {
        onMeetingUpdated({ ...meeting, status: 'declined', ...result });
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (slot) => {
    const startTime = new Date(slot.start_time);
    const endTime = new Date(slot.end_time);
    return `${startTime.toLocaleString()} - ${endTime.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6" />
            <div>
              <h2 className="text-2xl font-bold">Meeting Request</h2>
              <p className="text-blue-100">
                {meeting.requester_name} wants to schedule a meeting
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meeting Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">
                  {meeting.requester_name} ({meeting.requester_type})
                </p>
                <p className="text-sm text-gray-600">Meeting with you</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">{meeting.meeting_duration} minutes</p>
                <p className="text-sm text-gray-600">Meeting duration</p>
              </div>
            </div>
            
            <div>
              <p className="font-medium text-gray-900 mb-2">Preferred Time Slots:</p>
              <div className="space-y-2">
                {meeting.preferred_time_slots?.map((slot, index) => (
                  <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded border">
                    {formatTimeSlot(slot)}
                  </div>
                ))}
              </div>
            </div>
            
            {meeting.message && (
              <div className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">Message:</p>
                  <p className="text-sm text-gray-600">{meeting.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Response Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Message (Optional)
            </label>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Add a message to your response..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDecline}
              disabled={loading}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <XCircle className="h-4 w-4" />
              <span>Decline</span>
            </button>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingManager;