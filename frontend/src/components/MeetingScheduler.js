import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, MessageCircle, CheckCircle, XCircle, AlertCircle, Send, X } from 'lucide-react';
import notificationService from '../services/notificationService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const MeetingScheduler = ({ 
  isOpen, 
  onClose, 
  requesterId, 
  requesterType, 
  recipientId, 
  recipientType, 
  recipientName,
  onMeetingCreated 
}) => {
  const [step, setStep] = useState(1);
  const [preferredSlots, setPreferredSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get API URL from environment variables
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPreferredSlots([]);
      setMessage('');
      setDuration(30);
      setError('');
    }
  }, [isOpen]);

  const addTimeSlot = useCallback(() => {
    if (preferredSlots.length >= 3) return;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const newSlot = {
      id: Date.now(),
      startTime: tomorrow.toISOString().slice(0, 16),
      endTime: new Date(tomorrow.getTime() + duration * 60000).toISOString().slice(0, 16)
    };
    
    setPreferredSlots(prev => [...prev, newSlot]);
  }, [preferredSlots.length, duration]);

  const updateTimeSlot = useCallback((id, field, value) => {
    setPreferredSlots(prev => prev.map(slot => {
      if (slot.id === id) {
        const updated = { ...slot, [field]: value };
        
        // Auto-update end time when start time changes
        if (field === 'startTime') {
          const startTime = new Date(value);
          const endTime = new Date(startTime.getTime() + duration * 60000);
          updated.endTime = endTime.toISOString().slice(0, 16);
        }
        
        return updated;
      }
      return slot;
    }));
  }, [duration]);

  const removeTimeSlot = useCallback((id) => {
    setPreferredSlots(prev => prev.filter(slot => slot.id !== id));
  }, []);

  const handleSubmit = async () => {
    if (preferredSlots.length === 0) {
      setError('Please add at least one time slot');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const meetingRequest = {
        requester_id: requesterId,
        requester_type: requesterType,
        recipient_id: recipientId,
        recipient_type: recipientType,
        meeting_type: requesterType === 'startup' ? 'startup_to_investor' : 'investor_to_startup',
        preferred_time_slots: preferredSlots.map(slot => ({
          start_time: slot.startTime,
          end_time: slot.endTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })),
        message: message.trim() || null,
        meeting_duration: duration
      };

      const response = await fetch(`${API_BASE_URL}/api/meetings/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting request');
      }

      const result = await response.json();
      
      // Create notification for the recipient
      try {
        await notificationService.createMeetingRequestNotification(
          requesterId,
          requesterType === 'startup' ? 'Startup' : 'Investor', // You might want to get actual names
          requesterType,
          recipientId,
          recipientName,
          result.id || result.meeting_id
        );
      } catch (notificationError) {
        console.warn('Failed to create notification:', notificationError);
        // Don't fail the meeting request if notification fails
      }
      
      if (onMeetingCreated) {
        onMeetingCreated(result);
      }
      
      onClose();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && preferredSlots.length === 0) {
      setError('Please add at least one time slot');
      return;
    }
    setStep(step + 1);
    setError('');
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule a Meeting</h2>
              <p className="text-sm text-gray-600">with {recipientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step > stepNum ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Time Slots</span>
            <span>Message</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Your Preferred Time Slots</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select up to 3 time slots that work for you. The other person will choose one of these options.
                </p>
                
                {/* Duration Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                {/* Time Slots */}
                <div className="space-y-4">
                  {preferredSlots.map((slot, index) => (
                    <div key={slot.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="datetime-local"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          <input
                            type="datetime-local"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeTimeSlot(slot.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  {preferredSlots.length < 3 && (
                    <button
                      onClick={addTimeSlot}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
                    >
                      + Add Time Slot ({preferredSlots.length}/3)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add a Message (Optional)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Let them know what you'd like to discuss or any specific topics you want to cover.
                </p>
                
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! I'd like to discuss our startup and explore potential investment opportunities..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {message.length}/500 characters
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Meeting Request</h3>
                
                {/* Meeting Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Meeting with {recipientName}</p>
                      <p className="text-sm text-gray-600">
                        {requesterType === 'startup' ? 'Startup to Investor' : 'Investor to Startup'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{duration} minutes</p>
                      <p className="text-sm text-gray-600">Meeting duration</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Preferred Time Slots:</p>
                    <div className="space-y-2">
                      {preferredSlots.map((slot, index) => (
                        <div key={slot.id} className="text-sm text-gray-600 bg-white p-2 rounded border">
                          {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {message && (
                    <div className="flex items-start space-x-3">
                      <MessageCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Message:</p>
                        <p className="text-sm text-gray-600">{message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              onClick={step === 1 ? onClose : prevStep}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <div className="flex space-x-3">
              {step < 3 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduler;
