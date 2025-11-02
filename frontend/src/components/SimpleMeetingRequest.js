/**
 * Simple Meeting Request Component
 * Handles basic meeting requests between investors and startups
 */

import React, { useState } from 'react';
import { Mail, MessageCircle, Calendar, Clock, User, Send, CheckCircle, XCircle } from 'lucide-react';

const SimpleMeetingRequest = ({ 
  isOpen, 
  onClose, 
  targetStartup = null, 
  currentUser = null,
  onRequestSent = null 
}) => {
  const [formData, setFormData] = useState({
    investorName: currentUser?.name || '',
    investorEmail: currentUser?.email || '',
    message: '',
    preferredDate: '',
    preferredTime: '',
    meetingType: 'video_call'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!formData.investorName.trim()) {
        setError('Your name is required');
        return;
      }
      if (!formData.investorEmail.trim()) {
        setError('Your email is required');
        return;
      }
      if (!formData.message.trim()) {
        setError('Message is required');
        return;
      }

      // Create meeting request
      const requestData = {
        investor_name: formData.investorName,
        investor_email: formData.investorEmail,
        startup_id: targetStartup?.id,
        message: formData.message,
        preferred_date: formData.preferredDate || null,
        preferred_time: formData.preferredTime || null,
        meeting_type: formData.meetingType
      };

      // TODO: Replace with actual API call
      console.log('Meeting request data:', requestData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Meeting request sent successfully!');
      
      if (onRequestSent) {
        onRequestSent(requestData);
      }
      
      // Reset form after success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setError('Failed to send meeting request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Request Meeting</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Startup Info */}
        {targetStartup && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {targetStartup.companyName?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{targetStartup.companyName}</h3>
                <p className="text-sm text-gray-600">{targetStartup.sector}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Your Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Your Information</span>
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.investorName}
                onChange={(e) => handleInputChange('investorName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Your Email *
              </label>
              <input
                type="email"
                value={formData.investorEmail}
                onChange={(e) => handleInputChange('investorEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Meeting Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Meeting Details</span>
            </h3>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Tell them why you'd like to meet..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Meeting Type
              </label>
              <select
                value={formData.meetingType}
                onChange={(e) => handleInputChange('meetingType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="video_call">Video Call</option>
                <option value="phone_call">Phone Call</option>
                <option value="in_person">In-Person Meeting</option>
              </select>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleMeetingRequest;
