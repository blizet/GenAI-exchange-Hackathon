import axios from 'axios';
import firebaseService from './firebaseService';

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for large document processing
});

// Analysis service with retry and waiting logic
class AnalysisService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
    this.maxWaitTime = 300000; // 5 minutes
  }

  // Fetch pitch deck content for analysis
  async fetchPitchDeckContent(startupId) {
    try {
      console.log(`📄 Fetching pitch deck for startup: ${startupId}`);
      
      // First test Storage access
      const hasAccess = await firebaseService.testStorageAccess(startupId);
      if (!hasAccess) {
        console.error('❌ No Storage access - skipping pitch deck fetch');
        return { hasPitchDeck: false, error: 'No Storage access' };
      }
      
      const pitchDeck = await firebaseService.getPitchDeck(startupId);
      
      if (pitchDeck && pitchDeck.downloadURL) {
        console.log(`📄 Pitch deck found: ${pitchDeck.fileName}`);
        // For now, we'll use the file name and basic info
        // In a real implementation, you'd fetch and process the actual file content
        return {
          fileName: pitchDeck.fileName,
          fileType: pitchDeck.fileType,
          fileSize: pitchDeck.fileSize,
          downloadURL: pitchDeck.downloadURL,
          hasPitchDeck: true
        };
      } else {
        console.log(`📄 No pitch deck found for startup: ${startupId}`);
        return { hasPitchDeck: false };
      }
    } catch (error) {
      console.error(`❌ Error fetching pitch deck:`, error);
      return { hasPitchDeck: false, error: error.message };
    }
  }

  // Generic analysis function with retry logic
  async performAnalysis(endpoint, data, analysisName) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 ${analysisName} - Attempt ${attempt}/${this.maxRetries}`);
        console.log(`📡 Calling backend endpoint: ${endpoint}`);
        
        const response = await api.post(endpoint, data, {
          timeout: this.maxWaitTime,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log(`✅ ${analysisName} completed successfully`);
        return response.data;
        
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${analysisName} attempt ${attempt} failed:`, error.message);
        
        // If it's the last attempt, throw the error
        if (attempt === this.maxRetries) {
          break;
        }
        
        // Wait before retrying
        await this.delay(this.retryDelay * attempt);
      }
    }
    
    // If all retries failed, return a fallback response
    console.error(`❌ ${analysisName} failed after ${this.maxRetries} attempts`);
    return this.createFallbackResponse(analysisName, lastError);
  }

  // Create fallback response when API is unavailable
  createFallbackResponse(analysisName, error) {
    const errorMessage = error?.message || 'Unknown error';
    const isApiKeyError = errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID');
    
    let fallbackText;
    if (isApiKeyError) {
      fallbackText = `This is a fallback analysis for ${analysisName}. The backend service is running but requires a valid Google API key to perform AI analysis. Please configure the GOOGLE_API_KEY environment variable in the backend.`;
    } else {
      fallbackText = `This is a fallback analysis for ${analysisName}. The analysis service is currently unavailable (${errorMessage}). Please try again later or contact support if the issue persists.`;
    }
    
    return {
      data: {
        summary: `Fallback analysis for ${analysisName}`,
        analysis: fallbackText,
        fullText: fallbackText,
        status: 'fallback',
        confidence: 'low',
        error: errorMessage,
        backendStatus: isApiKeyError ? 'running_but_no_api_key' : 'unavailable'
      }
    };
  }

  // Delay function for retries
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Wait for analysis with progress updates
  async waitForAnalysis(analysisFn, progressCallback) {
    const startTime = Date.now();
    let progress = 0;
    
    // Start progress updates
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const maxTime = this.maxWaitTime;
      progress = Math.min((elapsed / maxTime) * 100, 95); // Cap at 95% until completion
      if (progressCallback) {
        progressCallback(progress);
      }
    }, 1000);

    try {
      const result = await analysisFn();
      clearInterval(progressInterval);
      if (progressCallback) {
        progressCallback(100);
      }
      return result;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  }
}

const analysisService = new AnalysisService();

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || 
                     error.response.data?.message || 
                     error.response.data?.error ||
                     `Server error: ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Document analysis API
export const analyzeDocument = async (formData) => {
  try {
    const response = await api.post('/api/analysis/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Save to Firebase if analysis was successful
    if (response.data.ready_for_firebase) {
      try {
        const { startupId, documentId, analysisId } = await firebaseService.saveAnalysisResults(
          response.data,
          response.data.filename?.replace(/\.(pdf|pptx|ppt)$/i, ''),
          response.data.filename
        );
        response.data.firebaseData = { startupId, documentId, analysisId };
      } catch (firebaseError) {
        console.warn('Firebase save failed:', firebaseError);
        response.data.firebaseError = firebaseError.message;
      }
    }
    
    return response.data;
  } catch (error) {
    throw new Error(`Document analysis failed: ${error.message}`);
  }
};

// Email analysis API
export const analyzeEmail = async (emailText) => {
  try {
    const response = await api.post('/api/analysis/email', {
      email_text: emailText
    });
    
    // Save to Firebase if analysis was successful
    if (response.data.ready_for_firebase) {
      try {
        const { startupId, analysisId } = await firebaseService.saveAnalysisResults(
          response.data,
          "Email Analysis"
        );
        response.data.firebaseData = { startupId, analysisId };
      } catch (firebaseError) {
        console.warn('Firebase save failed:', firebaseError);
        response.data.firebaseError = firebaseError.message;
      }
    }
    
    return response.data;
  } catch (error) {
    throw new Error(`Email analysis failed: ${error.message}`);
  }
};

// Call transcript analysis API
export const analyzeCall = async (callText) => {
  try {
    const response = await api.post('/api/analysis/call', {
      call_text: callText
    });
    
    // Save to Firebase if analysis was successful
    if (response.data.ready_for_firebase) {
      try {
        const { startupId, analysisId } = await firebaseService.saveAnalysisResults(
          response.data,
          "Call Analysis"
        );
        response.data.firebaseData = { startupId, analysisId };
      } catch (firebaseError) {
        console.warn('Firebase save failed:', firebaseError);
        response.data.firebaseError = firebaseError.message;
      }
    }
    
    return response.data;
  } catch (error) {
    throw new Error(`Call analysis failed: ${error.message}`);
  }
};

// Fact-checking API
export const factCheckContent = async (content, analysisType = 'general') => {
  return await analysisService.performAnalysis(
    '/api/analysis/fact-check',
    { text: content, context: analysisType },
    'Fact Check Analysis'
  );
};

// Business Model Analysis API
export const analyzeBusinessModel = async (content) => {
  return await analysisService.performAnalysis(
    '/api/analysis/business-model',
    { text: content, analysis_type: 'business_model' },
    'Business Model Analysis'
  );
};

// Market Intelligence Analysis API
export const analyzeMarketIntelligence = async (content) => {
  return await analysisService.performAnalysis(
    '/api/analysis/text',
    { text: content, analysis_type: 'market_intelligence' },
    'Market Intelligence Analysis'
  );
};

// Risk Assessment Analysis API
export const analyzeRiskAssessment = async (content) => {
  return await analysisService.performAnalysis(
    '/api/analysis/text',
    { text: content, analysis_type: 'risk_assessment' },
    'Risk Assessment Analysis'
  );
};

// Comprehensive Analysis API
export const comprehensiveAnalysis = async (content, analysisType = 'document', options = {}) => {
  try {
    const response = await api.post('/api/analysis/comprehensive', {
      content: content,
      analysis_type: analysisType,
      include_business_model: options.includeBusinessModel !== false,
      include_market_intelligence: options.includeMarketIntelligence !== false,
      include_risk_assessment: options.includeRiskAssessment !== false,
      include_fact_check: options.includeFactCheck !== false
    });
    return response.data;
  } catch (error) {
    throw new Error(`Comprehensive analysis failed: ${error.message}`);
  }
};

// Health check API
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }
};

// =============================================================================
// NEW API ENDPOINTS FOR FRONTEND INTEGRATION
// =============================================================================

// User Profile Management
export const createStartupProfile = async (profileData) => {
  try {
    const response = await api.post('/api/profiles/startup', profileData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create startup profile: ${error.message}`);
  }
};

export const createInvestorProfile = async (profileData) => {
  try {
    const response = await api.post('/api/profiles/investor', profileData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create investor profile: ${error.message}`);
  }
};

// Document Management (placeholder - not implemented in backend yet)
export const uploadDocument = async (file, startupId, category) => {
  try {
    // For now, return a mock response since this endpoint doesn't exist in backend
    console.warn('Document upload endpoint not implemented in backend yet');
    return {
      success: true,
      message: 'Document upload endpoint not implemented yet',
      document_id: `doc_${Date.now()}`,
      filename: file.name,
      startup_id: startupId,
      category: category
    };
  } catch (error) {
    throw new Error(`Document upload failed: ${error.message}`);
  }
};

export const getStartupDocuments = async (startupId) => {
  try {
    // For now, return a mock response since this endpoint doesn't exist in backend
    console.warn('Get documents endpoint not implemented in backend yet');
    return {
      success: true,
      documents: [],
      message: 'Get documents endpoint not implemented yet'
    };
  } catch (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }
};

// Meeting Management
export const scheduleMeeting = async (meetingData) => {
  try {
    const response = await api.post('/api/meetings/request', meetingData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to schedule meeting: ${error.message}`);
  }
};

export const getUserMeetings = async (userId, status = null) => {
  try {
    const url = status ? `/api/meetings/user/${userId}?status=${status}` : `/api/meetings/user/${userId}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch meetings: ${error.message}`);
  }
};

// RAG-based Chatbot
export const queryChatbot = async (query, startupId, context = null) => {
  try {
    const response = await api.post('/api/chatbot/chat', {
      startup_id: startupId,
      question: query,
      startup_data: context
    });
    return response.data;
  } catch (error) {
    throw new Error(`Chatbot query failed: ${error.message}`);
  }
};

// Analytics (placeholder - not implemented in backend yet)
export const getStartupAnalytics = async (startupId) => {
  try {
    // For now, return a mock response since this endpoint doesn't exist in backend
    console.warn('Startup analytics endpoint not implemented in backend yet');
    return {
      success: true,
      analytics: {
        total_views: 0,
        total_meetings: 0,
        profile_completeness: 0,
        last_updated: new Date().toISOString()
      },
      message: 'Analytics endpoint not implemented yet'
    };
  } catch (error) {
    throw new Error(`Failed to fetch startup analytics: ${error.message}`);
  }
};

export const getInvestorAnalytics = async (investorId) => {
  try {
    // For now, return a mock response since this endpoint doesn't exist in backend
    console.warn('Investor analytics endpoint not implemented in backend yet');
    return {
      success: true,
      analytics: {
        total_views: 0,
        total_meetings: 0,
        profile_completeness: 0,
        last_updated: new Date().toISOString()
      },
      message: 'Analytics endpoint not implemented yet'
    };
  } catch (error) {
    throw new Error(`Failed to fetch investor analytics: ${error.message}`);
  }
};

// Startup Discovery
export const discoverStartups = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/api/profiles/startups/discover?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to discover startups: ${error.message}`);
  }
};

// AI Matching (placeholder - not implemented in backend yet)
export const getMatchedStartups = async (investorId, filters = {}, limit = 10) => {
  try {
    // For now, return a mock response since this endpoint doesn't exist in backend
    console.warn('AI matching endpoint not implemented in backend yet');
    return {
      success: true,
      matched_startups: [],
      total_matches: 0,
      message: 'AI matching endpoint not implemented yet'
    };
  } catch (error) {
    throw new Error(`Failed to get matched startups: ${error.message}`);
  }
};

// New AI Analysis Endpoints
export const analyzeCompetition = async (content) => {
  return await analysisService.performAnalysis(
    '/api/analysis/text',
    { text: content, analysis_type: 'competition' },
    'Competition Analysis'
  );
};

export const analyzeFounders = async (content) => {
  return await analysisService.performAnalysis(
    '/api/analysis/text',
    { text: content, analysis_type: 'founders' },
    'Founders Analysis'
  );
};

export const analyzeMarketSize = async (content) => {
  return await analysisService.performAnalysis(
    '/api/analysis/text',
    { text: content, analysis_type: 'market_size' },
    'Market Size Analysis'
  );
};

export const analyzeProductInfo = async (content) => {
  return await analysisService.performAnalysis(
    '/api/analysis/text',
    { text: content, analysis_type: 'product_info' },
    'Product Info Analysis'
  );
};

// Investment Recommendation Analysis API
export const analyzeInvestmentRecommendation = async (content) => {
  return await analysisService.performAnalysis(
    '/api/analysis/investment-recommendation',
    { text: content, analysis_type: 'investment_recommendation' },
    'Investment Recommendation Analysis'
  );
};

// =============================================================================
// FINAL AI INTERVIEWER ENDPOINTS (TTS/STT via FastAPI)
// =============================================================================

export const startInterviewSession = async (startupId, startupData, investorContext) => {
try {
const response = await api.post('/api/interviewer/sessions/start', {
startup_id: startupId,
startup_context: JSON.stringify(startupData, null, 2),
investor_context: JSON.stringify(investorContext, null, 2)
});
return response.data;
} catch (error) {
throw new Error(`Failed to start interview session: ${error.message}`);
}
};

export const processInterviewResponse = async (sessionId, userResponse) => {
  try {
    const response = await api.post(`/api/interviewer/sessions/${sessionId}/respond`, {
      user_response: userResponse
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to process interview response: ${error.message}`);
  }
};

export const getInterviewStatus = async (sessionId) => {
  try {
    const response = await api.get(`/api/interviewer/sessions/${sessionId}/status`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch interview status: ${error.message}`);
  }
};

// Generates voice audio using the new backend service (TTS)
export const generateVoice = async (text) => {
  try {
    console.log("🤖 Calling backend voice service for TTS...");
    
const response = await api.post('/api/voice/generate', {
text: text,
// Pass the preferred Wavenet voice name for high-quality audio
voice_name: "en-US-Wavenet-F"
});
    
    return response.data;
  } catch (error) {
    console.error("TTS backend error:", error);
    return {
      success: false,
      error: `Failed to generate voice audio from backend: ${error.message}`
    };
  }
};

// Recognizes speech from uploaded audio file using the new backend service (STT)
export const recognizeSpeech = async (audioBlob) => {
    try {
        console.log("🎤 Calling backend speech service for STT...");
        
        const formData = new FormData();
        // Append the audio Blob as a file named 'audio_file' (matching FastAPI endpoint)
        // Google Cloud STT relies on the file extension/MIME type for encoding
        formData.append('audio_file', audioBlob, `audio.${audioBlob.type.split('/')[1].split(';')[0]}`); 
        
const response = await api.post('/api/speech/recognize', formData, {
headers: {
'Content-Type': 'multipart/form-data',
}
});
        
        return response.data; // { success: bool, transcript: str, confidence: float }
    } catch (error) {
        console.error("STT backend error:", error);
        return {
            success: false,
            transcript: "",
            error: `Failed to recognize speech: ${error.message}`
        };
    }
}

export { analysisService };
export default api;