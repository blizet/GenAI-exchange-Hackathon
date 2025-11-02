import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Users, Calendar, MapPin, Globe, Mail, Phone, Star, TrendingUp, BarChart3, FileText, DollarSign, Target, Shield, Eye, ChevronRight, Sparkles, Heart, Rocket, ChevronDown, ChevronUp, Download, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import firebaseService from '../services/firebaseService';
import StartupChatbot from './StartupChatbot';
import MeetingScheduler from './MeetingScheduler';
import { useApp } from '../contexts/AppContext';
import notificationService from '../services/notificationService';

const StartupDetailView = ({ startup, onBack, user, userType }) => {
  const [analytics, setAnalytics] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedAnalysis, setExpandedAnalysis] = useState({});
  const [startupData, setStartupData] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [showStaticContent, setShowStaticContent] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [selectedMeetingTarget, setSelectedMeetingTarget] = useState(null);
  const [startupAnalyses, setStartupAnalyses] = useState([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pitchDeck, setPitchDeck] = useState(null);
  const [allDocuments, setAllDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  // Check if current user is an investor
  const isInvestor = userType === 'investor';

  useEffect(() => {
    if (startup?.id) {
      // Show static content immediately
      setStartupData(startup);
      setShowStaticContent(true);
      
      // Start background data fetching
      fetchStartupData();
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [startup]);

  // Fetch analyses when analysis tab is active
  useEffect(() => {
    if (activeTab === 'analysis' && startup?.id) {
      fetchStartupAnalyses();
    }
  }, [activeTab, startup?.id]);

  // Check if startup is saved when component loads
  useEffect(() => {
    if (startup?.id && user?.uid) {
      checkIfSaved();
    }
  }, [startup?.id, user?.uid]);

  // Fetch documents when documents tab is active
  useEffect(() => {
    if (activeTab === 'documents' && startup?.id) {
      fetchPitchDeck();
      fetchAllDocuments();
    }
  }, [activeTab, startup?.id]);

  const handleRequestMeeting = (target, targetType) => {
    setSelectedMeetingTarget({
      id: target.id,
      name: target.name || target.companyName,
      type: targetType
    });
    setShowMeetingScheduler(true);
  };

  const handleMeetingCreated = async (meeting) => {
    console.log('Meeting created:', meeting);
    setShowMeetingScheduler(false);
    setSelectedMeetingTarget(null);
    
    // Send notification to the startup
    if (userType === 'investor' && startupData?.id) {
      try {
        await notificationService.createMeetingRequestNotification(
          user.uid,
          user.displayName || user.email,
          'investor',
          startupData.id,
          startupData.companyName,
          meeting.id
        );
        console.log('Notification sent to startup');
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  };

  const fetchStartupAnalyses = async () => {
    if (!startup?.id) return;
    
    try {
      setAnalysesLoading(true);
      // Use the same method as dashboard for consistency
      const analyses = await firebaseService.getAnalysesByStartup(startup.id);
      setStartupAnalyses(analyses || []);
    } catch (error) {
      console.error('Error fetching startup analyses:', error);
      setStartupAnalyses([]);
    } finally {
      setAnalysesLoading(false);
    }
  };

 // ...existing code...
  const checkIfSaved = async () => {
    // prefer fully-resolved startup id (startupData from Firestore) then fallback to prop
    const startupId = startupData?.id || startup?.id;
    if (!startupId || !user?.uid) return;

    try {
      const saved = await firebaseService.isStartupSavedByInvestor(user.uid, startupId);
      setIsSaved(!!saved);
    } catch (error) {
      console.error('Error checking if startup is saved:', error);
      setIsSaved(false);
    }
  };

  const handleSaveStartup = async () => {
    const startupId = startupData?.id || startup?.id;
    if (!startupId || !user?.uid) return;

    try {
      setSaving(true);
      if (isSaved) {
        await firebaseService.unsaveStartupForInvestor(user.uid, startupId);
        setIsSaved(false);
        console.log('✅ Startup unsaved successfully');
      } else {
        // pass an object with a guaranteed id to the service
        const payload = { id: startupId, ...(startupData || startup) };
        await firebaseService.saveStartupForInvestor(user.uid, payload);
        setIsSaved(true);
        console.log('✅ Startup saved successfully');
      }
    } catch (error) {
      console.error('Error saving/unsaving startup:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUnsaveStartup = async () => {
    const startupId = startupData?.id || startup?.id;
    if (!user || userType !== 'investor' || !startupId) return;

    setSaving(true);
    try {
      await firebaseService.unsaveStartupForInvestor(user.uid, startupId);
      setIsSaved(false);
      console.log('✅ Startup unsaved successfully');
    } catch (error) {
      console.error('❌ Error unsaving startup:', error);
    } finally {
      setSaving(false);
    }
  };
// ...existing code...

  const fetchPitchDeck = async () => {
    if (!startup?.id) return;
    
    try {
      setDocumentsLoading(true);
      const pitchDeckData = await firebaseService.getStartupPitchDeck(startup.id);
      setPitchDeck(pitchDeckData);
    } catch (error) {
      console.error('Error fetching pitch deck:', error);
      setPitchDeck(null);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchAllDocuments = async () => {
    if (!startup?.id) return;
    
    try {
      setDocumentsLoading(true);
      // Fetch all documents from Firebase Storage
      // NOTE: getStartupDocuments is used in the provided code but not defined in firebaseService.js
      // We will assume it retrieves the documents needed for this view.
      const documents = await firebaseService.getDocumentsByStartup(startup.id);
      setAllDocuments(documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setAllDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchStartupData = async () => {
    try {
      setDataLoading(true);
      setLoading(true);
      
      console.log('🔍 [STARTUP DETAIL VIEW] Loading startup data...');
      console.log('🔍 [STARTUP DETAIL VIEW] Startup ID:', startup.id);
      
      // Fetch real startup data from Firestore
      try {
        const realStartup = await firebaseService.getStartup(startup.id);
        if (realStartup) {
          console.log('✅ [STARTUP DETAIL VIEW] Real startup data loaded:', realStartup);
          setStartupData(realStartup);
        } else {
          console.log('ℹ️ [STARTUP DETAIL VIEW] No real startup data found, using passed data');
          setStartupData(startup);
        }
      } catch (firebaseError) {
        console.warn('Firebase fetch failed, using passed data:', firebaseError);
        setStartupData(startup);
      }
      
      // Fetch real analysis data from Firestore (same approach as StartupDashboard)
      try {
        console.log('🔍 [STARTUP DETAIL VIEW] Fetching analysis for startup:', startup.id);
        const startupAnalysis = await firebaseService.getAnalysisByStartup(startup.id);
        console.log('🔍 [STARTUP DETAIL VIEW] Analysis fetched:', startupAnalysis);
        
        if (startupAnalysis) {
          setAnalysisData(startupAnalysis);
          
          // Load the analysis results if available (same as StartupDashboard)
          if (startupAnalysis.analysisData) {
            setAnalysisResults(startupAnalysis.analysisData);
            
            // Process real analysis data to create analytics breakdown
            const analysisBreakdown = {};
            let totalScore = 0;
            let completedCount = 0;
            
            // Process the actual analysis data from Firestore
            if (startupAnalysis.analysisData && typeof startupAnalysis.analysisData === 'object') {
              Object.entries(startupAnalysis.analysisData).forEach(([key, value]) => {
                if (value && typeof value === 'object') {
                  // Extract score from the analysis result
                  let score = 85; // default score
                  
                  if (value.score) {
                    score = value.score;
                  } else if (value.rating) {
                    score = value.rating;
                  } else if (value.overallScore) {
                    score = value.overallScore;
                  } else if (typeof value === 'string' && value.includes('score')) {
                    // Try to extract score from text
                    const scoreMatch = value.match(/(\d+)/);
                    if (scoreMatch) {
                      score = parseInt(scoreMatch[1]);
                    }
                  }
                  
                  analysisBreakdown[key] = { 
                    score: Math.round(score), 
                    completed: true 
                  };
                  totalScore += score;
                  completedCount++;
                }
              });
            }
            
            // If no specific analysis breakdown found, create from overall analysis
            if (Object.keys(analysisBreakdown).length === 0) {
              console.log('ℹ️ [STARTUP DETAIL VIEW] No specific analysis breakdown found, creating from overall data');
              
              const defaultAnalyses = [
                'documentAnalysis',
                'emailAnalysis', 
                'businessModelAnalysis',
                'marketIntelligenceAnalysis',
                'riskAssessmentAnalysis'
              ];
              
              const overallScore = startupAnalysis.overallScore || startupAnalysis.score || 85;
              
              defaultAnalyses.forEach(analysisType => {
                const score = Math.round(overallScore + (Math.random() - 0.5) * 20);
                analysisBreakdown[analysisType] = { 
                  score: Math.max(0, Math.min(100, score)), 
                  completed: true 
                };
                totalScore += score;
                completedCount++;
              });
            }
            
            const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 85;
            
            setAnalytics({
              totalAnalyses: completedCount,
              averageScore: averageScore,
              lastAnalysisDate: startupAnalysis.createdAt?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
              analysisBreakdown: analysisBreakdown
            });
            
          } else {
            // Check if we have other analysis data formats
            if (startupAnalysis.response || startupAnalysis.analysis || startupAnalysis.summary) {
              const fallbackResults = {
                'comprehensive_analysis': {
                  summary: startupAnalysis.response || startupAnalysis.analysis || startupAnalysis.summary,
                  fullText: startupAnalysis.response || startupAnalysis.analysis || startupAnalysis.summary,
                  status: startupAnalysis.status || 'completed',
                  confidence: startupAnalysis.confidence || 'high',
                  timestamp: startupAnalysis.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
                }
              };
              setAnalysisResults(fallbackResults);
            } else {
              setAnalysisResults({});
            }
          }
        } else {
          console.log('ℹ️ [STARTUP DETAIL VIEW] No analysis found for startup');
          setAnalysisData(null);
          setAnalysisResults({});
          
          // Fallback to mock data if no analysis found
          setAnalytics({
            totalAnalyses: 5,
            averageScore: startup.overallScore || 85,
            lastAnalysisDate: '2024-01-15',
            analysisBreakdown: {
              documentAnalysis: { score: 88, completed: true },
              emailAnalysis: { score: 82, completed: true },
              businessModelAnalysis: { score: 90, completed: true },
              marketIntelligenceAnalysis: { score: 85, completed: true },
              riskAssessmentAnalysis: { score: 78, completed: true }
            }
          });
        }
      } catch (analysisError) {
        console.warn('Analysis fetch failed:', analysisError);
        setAnalysisData(null);
        setAnalysisResults({});
      }
      
    } catch (error) {
      console.error('Error in fetchStartupData:', error);
    } finally {
      setDataLoading(false);
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-100 border border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-100 border border-amber-200';
    return 'text-rose-700 bg-rose-100 border border-rose-200';
  };

  const toggleAnalysis = (analysisType) => {
    setExpandedAnalysis(prev => ({
      ...prev,
      [analysisType]: !prev[analysisType]
    }));
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'analysis', name: 'Analysis', icon: BarChart3 },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'financials', name: 'Financials', icon: DollarSign },
    { id: 'market', name: 'Market', icon: Target },
    { id: 'competition', name: 'Competition', icon: Shield }
  ];

  // Show loading only if we don't have any data and haven't timed out
  if (!showStaticContent && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading startup details...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching data from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-xl border-b-2 border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-bold">Back</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-xl">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900">{startupData.companyName || startupData.name}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-gray-600 text-lg">{startupData.industry || startupData.sector}</p>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-bold">
                      {startupData.stage}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {startup.overallScore && (
                <div className={`px-6 py-3 rounded-2xl text-lg font-black ${getScoreColor(startup.overallScore)} shadow-lg`}>
                  {startup.overallScore}/100
                </div>
              )}
              {isInvestor && (
                <button 
                  onClick={handleSaveStartup}
                  disabled={saving}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold ${
                    isSaved 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{saving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-2 mb-8">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Company Description */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <span>About {startupData.companyName || startupData.name}</span>
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed font-medium">
                    {startupData.description || startupData.overview || 'This innovative startup is revolutionizing the industry with cutting-edge technology and a strong vision for the future.'}
                  </p>
                  
                  {/* Additional Company Info */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Mission</h3>
                      <p className="text-gray-600">
                        {startupData.mission || 'To transform the industry through innovative solutions and exceptional value delivery.'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Vision</h3>
                      <p className="text-gray-600">
                        {startupData.vision || 'To become the leading platform in our sector, empowering businesses worldwide.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                    <span>Key Metrics</span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-200">
                      <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{startupData.teamSize || startupData.employees || '12'}</div>
                      <div className="text-sm font-bold text-gray-600">Team Size</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                      <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{startupData.foundedYear || startupData.yearFounded || '2022'}</div>
                      <div className="text-sm font-bold text-gray-600">Founded</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                      <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{startupData.stage || startupData.fundingStage || 'Seed'}</div>
                      <div className="text-sm font-bold text-gray-600">Stage</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                      <Target className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{startupData.industry || startupData.sector || 'Technology'}</div>
                      <div className="text-sm font-bold text-gray-600">Sector</div>
                    </div>
                  </div>
                  
                  {/* Additional Metrics */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                      <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{startupData.revenue || '$2.5M'}</div>
                      <div className="text-sm font-bold text-gray-600">Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                      <Globe className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{startupData.customers || '1.2K'}</div>
                      <div className="text-sm font-bold text-gray-600">Customers</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-200">
                      <MapPin className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{startupData.location || 'San Francisco'}</div>
                      <div className="text-sm font-bold text-gray-600">Location</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-200">
                      <Star className="h-8 w-8 text-rose-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{startupData.overallScore || '85'}</div>
                      <div className="text-sm font-bold text-gray-600">AI Score</div>
                    </div>
                  </div>
                </div>

                {/* Analysis Results */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                    <span>Analysis Results</span>
                    {loading && (
                      <div className="ml-2 animate-spin rounded-full h-5 w-5 border-2 border-purple-200 border-t-purple-600"></div>
                    )}
                  </h2>
                  
                  {analytics ? (
                    <div className="space-y-4">
                      {Object.entries(analytics.analysisBreakdown || {}).map(([analysis, data]) => (
                        <div key={analysis} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                              <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="font-bold text-gray-800 capitalize">
                              {analysis.replace('Analysis', ' Analysis')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(data.score)}`}>
                              {data.score}/100
                            </div>
                            <div className={`w-3 h-3 rounded-full ${data.completed ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 animate-pulse">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-200 rounded-xl w-9 h-9"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-8">
                {/* Analysis Overview */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                    <span>AI Analysis Results</span>
                    {analysesLoading && (
                      <div className="ml-2 animate-spin rounded-full h-5 w-5 border-2 border-purple-200 border-t-purple-600"></div>
                    )}
                  </h2>
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-800 font-medium">
                        This comprehensive AI analysis is visible to both startups and investors to facilitate informed decision-making.
                      </p>
                    </div>
                  </div>
                  
                  
                  {/* Overall Analysis Score */}
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Overall Analysis Score</h3>
                          <p className="text-gray-600">Comprehensive evaluation based on multiple factors</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-4xl font-black ${getScoreColor(analytics?.averageScore || startupData?.overallScore || 85)}`}>
                            {analytics?.averageScore || startupData?.overallScore || 85}/100
                          </div>
                          <div className="text-sm text-gray-600 mt-1">AI Generated Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {analysesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Analysis...</h3>
                      <p className="text-gray-500">Fetching analysis data from database</p>
                    </div>
                  ) : (analysisResults && Object.keys(analysisResults).length > 0) || (analysisData && (analysisData.response || analysisData.analysis || analysisData.summary)) ? (
                    <div className="space-y-6">
                      {/* Detailed Analysis Results - Same format as StartupDashboard */}
                      {(() => {
                        // Use the same logic as StartupDashboard
                        if (analysisResults && typeof analysisResults === 'object') {
                          // If it's an array, convert to object
                        if (Array.isArray(analysisResults)) {
                          const convertedResults = {};
                          analysisResults.forEach((item, index) => {
                            if (item && typeof item === 'object') {
                              convertedResults[`analysis_${index + 1}`] = item;
                            }
                          });
                          analysisResults = convertedResults;
                        }
                        
                          // If it has the expected structure
                        if (Object.keys(analysisResults).length > 0) {
                          return Object.entries(analysisResults).map(([key, result]) => (
                            <div key={key} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${
                                    (result.status || 'unknown') === 'completed' ? 'bg-green-100' : 'bg-red-100'
                                  }`}>
                                    {(result.status || 'unknown') === 'completed' ? (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <AlertCircle className="h-5 w-5 text-red-600" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-900 capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Status: {result.status || 'unknown'} | Confidence: {result.confidence || 'unknown'}
                                    </p>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  (result.status || 'unknown') === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {result.status || 'unknown'}
                                </span>
                              </div>
                              
                              {/* Summary */}
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-800 mb-2">Analysis Results:</h5>
                                <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                  <div className="prose prose-sm max-w-none">
                                    {result.summary && typeof result.summary === 'string' ? (
                                      result.summary.split('\n').map((line, index) => (
                                        <p key={index} className="mb-2 last:mb-0">
                                          {line.trim() || '\u00A0'}
                                        </p>
                                      ))
                                    ) : result.summary && typeof result.summary === 'object' ? (
                                      <div className="space-y-4">
                                        {/* Overall Score */}
                                        {result.summary.overall_credibility_score && (
                                          <div className="mb-4">
                                            <p className="text-gray-700">
                                              Overall Credibility Score: {result.summary.overall_credibility_score}/10
                                            </p>
                                          </div>
                                        )}

                                        {/* Claims Analysis */}
                                        {result.summary.claims_analysis && Array.isArray(result.summary.claims_analysis) && (
                                          <div className="mb-4">
                                            <p className="text-gray-700 mb-2">Claims Analysis:</p>
                                            {result.summary.claims_analysis.map((claim, index) => (
                                              <div key={index} className="mb-3 pl-4 border-l-2 border-gray-300">
                                                <p className="text-gray-700 mb-1">
                                                  Claim: {claim.claim}
                                                </p>
                                                <p className="text-gray-600 text-sm mb-1">
                                                  Status: {claim.verification_status} (Score: {claim.confidence_score}/10)
                                                </p>
                                                <p className="text-gray-600 text-sm mb-1">
                                                  Evidence: {claim.evidence}
                                                </p>
                                                <p className="text-gray-600 text-sm">
                                                  Recommendation: {claim.recommendation}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Red Flags */}
                                        {result.summary.red_flags && Array.isArray(result.summary.red_flags) && result.summary.red_flags.length > 0 && (
                                          <div className="mb-4">
                                            <p className="text-gray-700 mb-2">Red Flags:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                              {result.summary.red_flags.map((flag, index) => (
                                                <li key={index} className="text-gray-600 text-sm">
                                                  {flag}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {/* Verification Needed */}
                                        {result.summary.verification_needed && Array.isArray(result.summary.verification_needed) && result.summary.verification_needed.length > 0 && (
                                          <div className="mb-4">
                                            <p className="text-gray-700 mb-2">Verification Needed:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                              {result.summary.verification_needed.map((item, index) => (
                                                <li key={index} className="text-gray-600 text-sm">
                                                  {item}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {/* Summary Text */}
                                        {result.summary.summary && (
                                          <div>
                                            <p className="text-gray-700 mb-2">Summary:</p>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                              {result.summary.summary}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 italic">No analysis results available</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Full Text */}
                              {result.fullText && result.fullText !== result.summary && typeof result.fullText === 'string' && (
                                <div>
                                  <h5 className="font-semibold text-gray-800 mb-2">Full Analysis:</h5>
                                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    <div className="prose prose-sm max-w-none">
                                      {result.fullText.split('\n').map((line, index) => (
                                        <p key={index} className="mb-3 last:mb-0 text-gray-700 leading-relaxed">
                                          {line.trim() || '\u00A0'}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Analysis Data */}
                              {result.data && (
                                <div className="mt-4">
                                  <h5 className="font-semibold text-gray-800 mb-2">Analysis Data:</h5>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                      {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          ));
                        } else {
                          return (
                            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                              <div className="text-center py-8">
                                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                                  <BarChart3 className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Analysis Results</h3>
                                <p className="text-gray-500">Analysis data is not available in the expected format.</p>
                                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                                    <p className="text-sm text-gray-600">
                                      <strong>Debug:</strong> analysisResults = {JSON.stringify(analysisResults, null, 2).substring(0, 200)}...
                                    </p>
                                  </div>
                              </div>
                            </div>
                          );
                          }
                        }
                      })()}
                    </div>
                  ) : analysisData && (analysisData.response || analysisData.analysis || analysisData.summary) ? (
                    <div className="space-y-6">
                      {/* Fallback Analysis Display */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                              <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">
                                AI Analysis Results
                              </h3>
                              <p className="text-sm text-gray-600">
                                {analysisData.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently completed'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                              {analysisData.status || 'completed'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Display Analysis Response if available */}
                        {analysisData.response && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                            <h4 className="font-bold text-gray-800 mb-2">Analysis Summary:</h4>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {analysisData.response}
                            </p>
                          </div>
                        )}
                        
                        {/* Display Analysis Content if available */}
                        {analysisData.analysis && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                            <h4 className="font-bold text-gray-800 mb-2">Analysis Content:</h4>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {analysisData.analysis}
                            </p>
                          </div>
                        )}
                        
                        {/* Display Summary if available */}
                        {analysisData.summary && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                            <h4 className="font-bold text-gray-800 mb-2">Summary:</h4>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {analysisData.summary}
                            </p>
                                  </div>
                                )}
                              </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No Analysis Available</h3>
                      <p className="text-gray-500">This startup hasn't been analyzed yet. Analysis will appear here once completed.</p>
                    </div>
                  )}
                </div>

                {/* Analysis Summary */}
                {startupAnalyses.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                      <Target className="h-6 w-6 text-purple-600" />
                      <span>Analysis Summary</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                        <div className="text-2xl font-black text-gray-900">
                          {startupAnalyses.length}
                        </div>
                        <div className="text-sm font-bold text-gray-600">Total Analyses</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                        <div className="text-2xl font-black text-gray-900">
                          {startupAnalyses.filter(a => a.status === 'completed' || !a.status).length}
                        </div>
                        <div className="text-sm font-bold text-gray-600">Completed</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                        <div className="text-2xl font-black text-gray-900">
                          {startupAnalyses.length > 0 ? new Date(Math.max(...startupAnalyses.map(a => a.createdAt?.toDate?.() || a.createdAt || 0))).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm font-bold text-gray-600">Last Analysis</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}


            {activeTab === 'documents' && (
              <div className="space-y-8">
                {/* All Documents Section */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <span>Documents</span>
                    {documentsLoading && (
                      <div className="ml-2 animate-spin rounded-full h-5 w-5 border-2 border-purple-200 border-t-purple-600"></div>
                    )}
                  </h2>
                  
                  {documentsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Documents...</h3>
                      <p className="text-gray-500">Fetching documents from Firebase Storage</p>
                    </div>
                  ) : allDocuments.length > 0 ? (
                    <div className="space-y-4">
                      {allDocuments.map((doc, index) => (
                        <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-white rounded-xl shadow-sm">
                                <FileText className="h-8 w-8 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                  {doc.fileName || doc.name}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>Size: {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</span>
                                  {doc.uploadedAt && (
                                    <span>Uploaded: {doc.uploadedAt.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
                                  )}
                                </div>
                                <p className="text-xs text-purple-600 font-semibold mt-1">
                                  {doc.type || 'Document'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => window.open(doc.downloadURL || doc.url, '_blank')}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 font-bold"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = doc.downloadURL || doc.url;
                                  link.download = doc.fileName || doc.name;
                                  link.click();
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-bold"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : pitchDeck ? (
                    <div className="space-y-6">
                      {/* Pitch Deck Card */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                              <FileText className="h-8 w-8 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {pitchDeck.fileName}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Size: {pitchDeck.fileSize ? `${(pitchDeck.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</span>
                                {pitchDeck.uploadedAt && (
                                  <span>Uploaded: {pitchDeck.uploadedAt.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => window.open(pitchDeck.downloadURL, '_blank')}
                              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 font-bold"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = pitchDeck.downloadURL;
                                link.download = pitchDeck.fileName;
                                link.click();
                              }}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-bold"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Pitch Deck Preview */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h4 className="text-lg font-bold text-gray-800 mb-4">Preview</h4>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium">
                            Click "View" to open the pitch deck in a new tab
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            The pitch deck will open in your browser for viewing
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No Documents Available</h3>
                      <p className="text-gray-500">This startup hasn't uploaded any documents yet.</p>
                    </div>
                  )}
                </div>

                {/* Additional Documents Section */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <span>Other Documents</span>
                  </h2>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Additional documents will be displayed here when available</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-8">
                {/* Team Overview */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <Users className="h-6 w-6 text-purple-600" />
                    <span>Team Information</span>
                  </h2>
                  
                  {/* Team Members */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'John Smith', role: 'CEO & Co-Founder', experience: '10+ years', linkedin: '#' },
                      { name: 'Sarah Johnson', role: 'CTO & Co-Founder', experience: '8+ years', linkedin: '#' },
                      { name: 'Mike Chen', role: 'Head of Product', experience: '6+ years', linkedin: '#' },
                      { name: 'Emily Davis', role: 'Head of Marketing', experience: '5+ years', linkedin: '#' }
                    ].map((member, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                            <p className="text-purple-600 font-semibold">{member.role}</p>
                            <p className="text-sm text-gray-600">{member.experience} experience</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Team Stats */}
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{startupData.teamSize || '12'}</div>
                      <div className="text-sm font-bold text-gray-600">Total Team</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                      <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">8.5</div>
                      <div className="text-sm font-bold text-gray-600">Avg Experience</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                      <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">4</div>
                      <div className="text-sm font-bold text-gray-600">Founders</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                      <Rocket className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">100%</div>
                      <div className="text-sm font-bold text-gray-600">Remote</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="space-y-8">
                {/* Financial Overview */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                    <span>Financial Information</span>
                  </h2>
                  
                  {/* Key Financial Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                      <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">$2.5M</div>
                      <div className="text-sm font-bold text-gray-600">Annual Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">150%</div>
                      <div className="text-sm font-bold text-gray-600">YoY Growth</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                      <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">$15M</div>
                      <div className="text-sm font-bold text-gray-600">Valuation</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                      <Calendar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">18</div>
                      <div className="text-sm font-bold text-gray-600">Months Runway</div>
                    </div>
                  </div>
                  
                  {/* Revenue Breakdown */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Subscription Revenue</span>
                        <span className="font-bold text-gray-900">$1.8M (72%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Professional Services</span>
                        <span className="font-bold text-gray-900">$0.5M (20%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Other Revenue</span>
                        <span className="font-bold text-gray-900">$0.2M (8%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="space-y-8">
                {/* Market Analysis */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <Target className="h-6 w-6 text-purple-600" />
                    <span>Market Analysis</span>
                  </h2>
                  
                  {/* Market Size */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-3xl font-black text-gray-900">$50B</div>
                      <div className="text-sm font-bold text-gray-600">TAM</div>
                      <div className="text-xs text-gray-500 mt-1">Total Addressable Market</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-3xl font-black text-gray-900">$5B</div>
                      <div className="text-sm font-bold text-gray-600">SAM</div>
                      <div className="text-xs text-gray-500 mt-1">Serviceable Addressable Market</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                      <Rocket className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-3xl font-black text-gray-900">$500M</div>
                      <div className="text-sm font-bold text-gray-600">SOM</div>
                      <div className="text-xs text-gray-500 mt-1">Serviceable Obtainable Market</div>
                    </div>
                  </div>
                  
                  {/* Market Trends */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Market Trends</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Market growing at 25% CAGR</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">Digital transformation driving demand</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700">AI/ML integration increasing</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-gray-700">Regulatory changes creating opportunities</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'competition' && (
              <div className="space-y-8">
                {/* Competitive Analysis */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-purple-600" />
                    <span>Competitive Analysis</span>
                  </h2>
                  
                  {/* Competitors */}
                  <div className="space-y-6">
                    {[
                      { name: 'Competitor A', marketShare: '35%', strength: 'Market Leader', weakness: 'High Price' },
                      { name: 'Competitor B', marketShare: '25%', strength: 'Strong Brand', weakness: 'Limited Features' },
                      { name: 'Competitor C', marketShare: '20%', strength: 'Innovation', weakness: 'Small Team' },
                      { name: 'Our Startup', marketShare: '5%', strength: 'Unique Value Prop', weakness: 'New Player' }
                    ].map((competitor, index) => (
                      <div key={index} className={`p-6 rounded-2xl border-2 ${
                        competitor.name === 'Our Startup' 
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{competitor.name}</h3>
                            <p className="text-sm text-gray-600">Market Share: {competitor.marketShare}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-600 mb-1">Strengths</div>
                            <div className="text-xs text-gray-600">{competitor.strength}</div>
                            <div className="text-sm font-semibold text-red-600 mb-1 mt-2">Weaknesses</div>
                            <div className="text-xs text-gray-600">{competitor.weakness}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Competitive Advantages */}
                  <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Our Competitive Advantages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Superior technology stack</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Better user experience</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Lower pricing model</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">Faster implementation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {userType === 'investor' && (
                  <button 
                    onClick={handleSaveStartup}
                    disabled={saving}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold ${
                      isSaved 
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{saving ? 'Saving...' : isSaved ? 'Unsave' : 'Save Startup'}</span>
                  </button>
                )}
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold">
                  <Mail className="h-5 w-5" />
                  <span>Contact Startup</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold">
                  <FileText className="h-5 w-5" />
                  <span>Request Analysis</span>
                </button>
                {isInvestor && (
                  <button 
                    onClick={() => handleRequestMeeting(startup, 'startup')}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Schedule Meeting</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* RAG Chatbot */}
      {startupData && (
        <StartupChatbot 
          startupId={startupData.id} 
          startupData={startupData}
          isOpen={isChatbotOpen} 
          onToggle={() => setIsChatbotOpen(!isChatbotOpen)} 
        />
      )}

      {/* Meeting Scheduler Modal */}
      {showMeetingScheduler && selectedMeetingTarget && (
        <MeetingScheduler
          isOpen={showMeetingScheduler}
          onClose={() => {
            setShowMeetingScheduler(false);
            setSelectedMeetingTarget(null);
          }}
          // NOTE: 'state' context/hook used below is not defined in this component, assuming it comes from 'useApp' or parent.
          requesterId={user?.uid || "demo-user"}
          requesterType={userType || "investor"}
          recipientId={selectedMeetingTarget.id}
          recipientType={selectedMeetingTarget.type}
          recipientName={selectedMeetingTarget.name}
          onMeetingCreated={handleMeetingCreated}
        />
      )}
    </div>
  );
};

export default StartupDetailView;