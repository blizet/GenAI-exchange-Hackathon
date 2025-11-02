/**
 * Simple Meeting Service
 * Handles basic meeting requests between investors and startups
 */

class SimpleMeetingService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  /**
   * Create a meeting request from investor to startup
   */
  async createMeetingRequest(meetingData) {
    try {
      const response = await fetch(`${this.baseURL}/api/simple-meetings/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating meeting request:', error);
      throw error;
    }
  }

  /**
   * Get meeting requests for a startup
   */
  async getStartupMeetingRequests(startupId) {
    try {
      const response = await fetch(`${this.baseURL}/api/simple-meetings/startup/${startupId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting startup meeting requests:', error);
      throw error;
    }
  }

  /**
   * Get meeting requests from an investor
   */
  async getInvestorMeetingRequests(investorEmail) {
    try {
      const response = await fetch(`${this.baseURL}/api/simple-meetings/investor/${investorEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting investor meeting requests:', error);
      throw error;
    }
  }

  /**
   * Accept a meeting request
   */
  async acceptMeetingRequest(meetingId) {
    try {
      const response = await fetch(`${this.baseURL}/api/simple-meetings/${meetingId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error accepting meeting request:', error);
      throw error;
    }
  }

  /**
   * Decline a meeting request
   */
  async declineMeetingRequest(meetingId, reason = null) {
    try {
      const response = await fetch(`${this.baseURL}/api/simple-meetings/${meetingId}/decline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error declining meeting request:', error);
      throw error;
    }
  }

  /**
   * Get details of a specific meeting request
   */
  async getMeetingRequest(meetingId) {
    try {
      const response = await fetch(`${this.baseURL}/api/simple-meetings/${meetingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting meeting request:', error);
      throw error;
    }
  }

  /**
   * Format meeting request data for API
   */
  formatMeetingRequestData({
    investorName,
    investorEmail,
    startupId,
    message,
    preferredDate = null,
    preferredTime = null,
    meetingType = 'video_call'
  }) {
    return {
      investor_name: investorName,
      investor_email: investorEmail,
      startup_id: startupId,
      message,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      meeting_type: meetingType
    };
  }

  /**
   * Validate meeting request data
   */
  validateMeetingRequestData(meetingData) {
    const errors = [];

    if (!meetingData.investorName || meetingData.investorName.trim() === '') {
      errors.push('Investor name is required');
    }

    if (!meetingData.investorEmail || meetingData.investorEmail.trim() === '') {
      errors.push('Investor email is required');
    }

    if (!meetingData.startupId || meetingData.startupId.trim() === '') {
      errors.push('Startup ID is required');
    }

    if (!meetingData.message || meetingData.message.trim() === '') {
      errors.push('Message is required');
    }

    if (meetingData.investorEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(meetingData.investorEmail)) {
        errors.push('Invalid investor email address');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get meeting status badge info
   */
  getMeetingStatusInfo(status) {
    const statusMap = {
      'pending': {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⏳'
      },
      'accepted': {
        label: 'Accepted',
        color: 'bg-green-100 text-green-800',
        icon: '✅'
      },
      'declined': {
        label: 'Declined',
        color: 'bg-red-100 text-red-800',
        icon: '❌'
      }
    };

    return statusMap[status] || statusMap['pending'];
  }

  /**
   * Get meeting type display info
   */
  getMeetingTypeInfo(meetingType) {
    const typeMap = {
      'video_call': {
        label: 'Video Call',
        icon: '📹'
      },
      'phone_call': {
        label: 'Phone Call',
        icon: '📞'
      },
      'in_person': {
        label: 'In-Person',
        icon: '🤝'
      }
    };

    return typeMap[meetingType] || typeMap['video_call'];
  }
}

// Export singleton instance
const simpleMeetingService = new SimpleMeetingService();
export default simpleMeetingService;
