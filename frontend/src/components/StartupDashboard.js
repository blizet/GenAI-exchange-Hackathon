import React, { useState, useEffect, Suspense, lazy, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FileText, Mail, Phone, Shield, AlertTriangle, Target, 
  LogOut, User, Plus, CheckCircle, AlertCircle, Sparkles, Heart, Rocket,
  Database, BarChart3, Search, Users, Calendar, Globe, Zap, Brain,
  ArrowRight, Save, Eye, RefreshCw, Download, Share2, TrendingUp, Building2, X, Mic 
} from 'lucide-react';
import FileUpload from './FileUpload';
import PitchDeckUpload from './PitchDeckUpload';
import TextInput from './TextInput';
import AnalysisResults from './AnalysisResults';
import LoadingSpinner from './LoadingSpinner';
import SkeletonLoader from './SkeletonLoader';
import LazyWrapper from './LazyWrapper';
import useLoading from '../hooks/useLoading';
import MeetingManager from './MeetingManager';
import AIInterviewer from './AIInterviewer'; 
import { 
  analyzeDocument, analyzeEmail, analyzeCall, factCheckContent, analyzeBusinessModel, 
  analyzeMarketIntelligence, analyzeRiskAssessment, comprehensiveAnalysis,
  analyzeCompetition, analyzeFounders, analyzeMarketSize, analyzeProductInfo,
  analyzeInvestmentRecommendation, createStartupProfile, uploadDocument
} from '../services/api';
import { analysisService } from '../services/api';
import firebaseService from '../services/firebaseService';

const StartupDashboard = memo(({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('submit'); 
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [startupData, setStartupData] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('');
  const [isInterviewing, setIsInterviewing] = useState(false); 
  
  // Use loading hook for better state management
  const { 
    loading: isLoading, 
    startLoading, 
    stopLoading, 
    isLoading: checkLoading,
    withLoading 
  } = useLoading();

  // Mock Investor Profile (Persona for the AI Interviewer to use)
  const mockInvestorProfile = useMemo(() => {
    // This profile defines the persona the AI will take when interviewing the startup
    return {
      id: 'ai-interviewer-persona',
      firmName: 'VentureMind AI',
      investmentThesis: 'We are a data-driven fund focusing on execution risk, financial modeling consistency, and market defensibility. Questions will be highly strategic.',
      isComplete: true 
    };
  }, []);

  // Helper function to format AI response text
  const formatAnalysisText = (text) => {
    if (!text) return '';
    
    // Split by common sentence endings and add line breaks
    let formatted = text
      .replace(/([.!?])\s+/g, '$1\n\n')
      .replace(/(\d+\.)\s+/g, '\n$1 ')
      .replace(/([A-Z][a-z]+:)\s+/g, '\n\n$1 ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return formatted;
  };

  // Startup data form state
  const [formData, setFormData] = useState({
    documents: [],
    emailTranscript: '',
    callTranscript: ''
  });

  const sections = [
    { id: 'submit', label: 'Submit Data', icon: Database, color: 'from-blue-500 to-cyan-600' },
    { id: 'analysis', label: 'View Analysis', icon: BarChart3, color: 'from-purple-500 to-pink-600' },
    { id: 'meetings', label: 'Meetings', icon: Calendar, color: 'from-green-500 to-teal-600' }
  ];

  useEffect(() => {
    loadStartupData();
  }, []);

  const loadStartupData = async () => {
    try {
      console.log('🔍 [STARTUP DASHBOARD] Loading startup data...');
      
      if (!user?.uid) {
        console.log('❌ [STARTUP DASHBOARD] No user ID available');
        setError('Please log in to access your startup dashboard.');
        return;
      }

      // Load startup data and analyses from Firebase
      const userStartup = await firebaseService.findStartupByUserId(user.uid);
      
      if (userStartup) {
        console.log('✅ [STARTUP DASHBOARD] Startup data loaded:', userStartup);
        setStartupData(userStartup);
        setSubmittedData(userStartup);
        setFormData({ ...formData, ...userStartup });
        // Load the single analysis for this startup
        console.log('🔍 Fetching analysis for startup:', userStartup.id);
        const startupAnalysis = await firebaseService.getAnalysisByStartup(userStartup.id);
        console.log('🔍 Analysis fetched:', startupAnalysis);
        
        if (startupAnalysis) {
          setAnalyses([startupAnalysis]); 
          
          if (startupAnalysis.analysisData) {
            console.log('🔍 Setting analysis results:', startupAnalysis.analysisData);
            setAnalysisResults(startupAnalysis.analysisData);
          } else {
            console.log('⚠️ No analysisData found in startupAnalysis');
            setAnalysisResults({});
          }
        } else {
          console.log('ℹ️ No analysis found for startup');
          setAnalyses([]); 
          setAnalysisResults({});
        }
      } else {
        console.log('ℹ️ [STARTUP DASHBOARD] No startup data found for user, redirecting to profile setup');
        
        setResults({
          type: 'info',
          message: 'Welcome! Please complete your startup profile to get started.',
          data: null
        });
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
        
        return; 
      }
    } catch (error) {
      console.error('Error loading startup data:', error);
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check your Firebase rules and make sure you are logged in.');
      } else {
        setError('Failed to load startup data: ' + error.message);
      }
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'emailTranscript' || field === 'callTranscript') {
      setSubmittedData(prev => ({
        ...prev,
        [field]: value
      }));
      
      console.log(`📝 ${field} updated and marked as ready for analysis`);
    }
  };

  const handleDocumentUpload = async (pitchDeckData) => {
    try {
      console.log('📁 Received pitch deck data:', pitchDeckData);
      
      if (!pitchDeckData) {
        setFormData(prev => ({
          ...prev,
          documents: prev.documents.filter(doc => doc.category !== 'pitch_deck')
        }));
        
        setSubmittedData(prev => ({
          ...prev,
          documents: (prev?.documents || []).filter(doc => doc.category !== 'pitch_deck')
        }));
        
        setResults({
          type: 'info',
          message: 'Pitch deck removed successfully.'
        });
        return;
      }
      
      const documentData = {
        id: pitchDeckData.id || Date.now().toString(),
        name: pitchDeckData.fileName,
        size: pitchDeckData.fileSize,
        type: pitchDeckData.fileType,
        url: pitchDeckData.downloadURL,
        path: pitchDeckData.storagePath,
        category: 'pitch_deck',
        uploadedAt: pitchDeckData.createdAt?.toDate?.() || pitchDeckData.uploadedAt?.toDate?.() || pitchDeckData.uploadedAt || new Date().toISOString()
      };
      
      console.log('💾 Document data to store:', documentData);
      
      if (!documentData.url || !documentData.path) {
        throw new Error('Document not properly stored in Firebase Storage');
      }
      
      console.log('✅ Pitch deck stored in Firebase Storage:', {
        name: documentData.name,
        size: documentData.size,
        url: documentData.url,
        path: documentData.path
      });
      
      setFormData(prev => ({
        ...prev,
        documents: [
          ...prev.documents.filter(doc => doc.category !== 'pitch_deck'),
          documentData
        ]
      }));
      
      setSubmittedData(prev => ({
        ...prev,
        documents: [
          ...(prev?.documents || []).filter(doc => doc.category !== 'pitch_deck'),
          documentData
        ]
      }));
      
      console.log('📋 Pitch deck added to form data and marked as ready for analysis');
      
      setResults({
        type: 'success',
        message: '✅ Pitch deck uploaded and stored in Firebase Storage! Ready for analysis.',
        data: documentData
      });
      
      return documentData;
    } catch (error) {
      console.error('❌ Error processing pitch deck upload:', error);
      setError('Failed to process uploaded pitch deck: ' + error.message);
      throw error;
    }
  };

  const handleSubmitData = async () => {
    startLoading('submit');
    setError(null);

    try {
      console.log('💾 Submitting startup data to Firebase...');
      
      const startupProfile = {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        dataSources: {
          hasDocuments: !!(formData.documents && formData.documents.length > 0),
          hasEmailTranscript: !!(formData.emailTranscript && formData.emailTranscript.trim()),
          hasCallTranscript: !!(formData.callTranscript && formData.callTranscript.trim())
        }
      };

      console.log('📊 Data sources available:', startupProfile.dataSources);

      await firebaseService.saveStartup(startupProfile);
      
      await createStartupProfile(startupProfile);
      
      setSubmittedData(startupProfile);
      setStartupData(startupProfile);
      
      console.log('✅ Startup data saved to Firebase successfully');
      
      const transcriptAnalyses = [];
      
      if (formData.emailTranscript.trim()) {
        console.log('📧 Analyzing email transcript...');
        try {
          const emailAnalysis = await analyzeEmail(formData.emailTranscript);
          transcriptAnalyses.push({
            type: 'email',
            content: formData.emailTranscript,
            analysis: emailAnalysis
          });
          console.log('✅ Email transcript analysis completed');
        } catch (error) {
          console.error('❌ Email analysis failed:', error);
        }
      }
      
      if (formData.callTranscript.trim()) {
        console.log('📞 Analyzing call transcript...');
        try {
          const callAnalysis = await analyzeCall(formData.callTranscript);
          transcriptAnalyses.push({
            type: 'call',
            content: formData.callTranscript,
            analysis: callAnalysis
          });
          console.log('✅ Call transcript analysis completed');
        } catch (error) {
          console.error('❌ Call analysis failed:', error);
        }
      }
      
      if (transcriptAnalyses.length > 0) {
        console.log('💾 Saving transcript analyses to Firebase...');
        for (const transcriptAnalysis of transcriptAnalyses) {
          await firebaseService.saveAnalysis({
            startupId: startupData.id,
            analysisType: transcriptAnalysis.type,
            analysisData: transcriptAnalysis.analysis,
            content: transcriptAnalysis.content,
            status: 'success'
          });
        }
        console.log('✅ Transcript analyses saved to Firebase');
      }
      
      setResults({
        type: 'success',
        message: '✅ All data submitted and stored in Firebase! Ready for comprehensive analysis.',
        data: startupProfile
      });
      
      console.log('🎉 Data submission completed successfully');
      
    } catch (error) {
      setError(error.message);
    } finally {
      stopLoading('submit');
    }
  };

  const handleRunAnalysis = async () => {
    if (!submittedData) {
      setError('Please submit your startup data first before running analysis.');
      return;
    }

    startLoading('analysis');
    setAnalysisInProgress(true);
    setAnalysisError(null);
    setAnalysisResults(null);
    setAnalysisProgress(0);

    try {
      console.log('🚀 Starting comprehensive analysis...');

      let contextData = '';
      if (submittedData.companyName) contextData += `COMPANY: ${submittedData.companyName}\n`;
      if (submittedData.description) contextData += `DESCRIPTION: ${submittedData.description}\n`;
      if (submittedData.industry) contextData += `INDUSTRY: ${submittedData.industry}\n`;
      if (submittedData.stage) contextData += `STAGE: ${submittedData.stage}\n`;
      if (submittedData.businessModel) contextData += `BUSINESS MODEL: ${submittedData.businessModel}\n`;
      if (submittedData.targetMarket) contextData += `TARGET MARKET: ${submittedData.targetMarket}\n`;
      if (submittedData.coreProducts) contextData += `CORE PRODUCTS: ${submittedData.coreProducts}\n`;
      if (submittedData.teamSize) contextData += `TEAM SIZE: ${submittedData.teamSize}\n`;
      if (submittedData.founderBackground) contextData += `FOUNDER BACKGROUND: ${submittedData.founderBackground}\n`;
      if (submittedData.emailTranscript) contextData += `\nEMAIL TRANSCRIPT:\n${submittedData.emailTranscript}\n`;
      if (submittedData.callTranscript) contextData += `\nCALL TRANSCRIPT:\n${submittedData.callTranscript}\n`;
      if (submittedData.documents?.length > 0) {
        contextData += `\nUPLOADED DOCUMENTS: ${submittedData.documents.map(doc => doc.name).join(', ')}\n`;
      }

      console.log('📄 Fetching pitch deck content for analysis...');
      const pitchDeckInfo = await analysisService.fetchPitchDeckContent(startupData.id);
      if (pitchDeckInfo.hasPitchDeck) {
        contextData += `\nPITCH DECK AVAILABLE:\n`;
        contextData += `- File Name: ${pitchDeckInfo.fileName}\n`;
        contextData += `- File Type: ${pitchDeckInfo.fileType}\n`;
        contextData += `- File Size: ${pitchDeckInfo.fileSize} bytes\n`;
        contextData += `- Download URL: ${pitchDeckInfo.downloadURL}\n`;
      } else {
        contextData += `\nPITCH DECK: Not available\n`;
      }

      const analysisSteps = [
        { name: 'Fact Check', fn: () => factCheckContent(contextData) },
        { name: 'Market Size', fn: () => analyzeMarketSize(contextData) },
        { name: 'Product Info', fn: () => analyzeProductInfo(contextData) },
        { name: 'Competition', fn: () => analyzeCompetition(contextData) },
        { name: 'Business Model', fn: () => analyzeBusinessModel(contextData) },
        { name: 'Founders', fn: () => analyzeFounders(contextData) },
        { name: 'Investment Recommendation', fn: () => analyzeInvestmentRecommendation(contextData) }
      ];

      const analysisResults = {};
      let concatenatedText = '';
      const analysisTimestamp = new Date().toISOString();

      for (let i = 0; i < analysisSteps.length; i++) {
        const step = analysisSteps[i];
        const stepProgress = Math.round((i / analysisSteps.length) * 100);
        setAnalysisProgress(stepProgress);
        
        try {
          console.log(`🤖 Running ${step.name} analysis...`);
          setCurrentAnalysisStep(step.name);
          
          const result = await step.fn();
          
          if (result?.data) {
            const fullText = result.data.response || result.data.fullText || result.data.analysis || result.data.summary || 'Analysis completed';
            const summary = result.data.response || result.data.summary || result.data.analysis || 'Analysis completed';
            
            analysisResults[step.name.toLowerCase().replace(' ', '')] = {
              summary: summary,
              fullText: fullText,
              status: result.data.success ? 'completed' : 'error',
              confidence: result.data.success ? 'high' : 'low',
              timestamp: analysisTimestamp
            };
            
            try {
              const analysisType = step.name.toLowerCase().replace(' ', '_');
              await firebaseService.saveIndividualAnalysis(startupData.id, analysisType, {
                summary: summary,
                fullText: fullText,
                status: result.data.success ? 'completed' : 'error',
                confidence: result.data.success ? 'high' : 'low',
                timestamp: analysisTimestamp,
                contextData: contextData.substring(0, 1000)
              });
            } catch (saveError) {
              console.error(`❌ Error saving individual ${step.name} analysis:`, saveError);
            }
            
            concatenatedText += `\n\n=== ${step.name.toUpperCase()} ANALYSIS ===\n`;
            concatenatedText += `Timestamp: ${analysisTimestamp}\n`;
            concatenatedText += `Status: ${result.data.success ? 'completed' : 'error'}\n`;
            concatenatedText += `Confidence: ${result.data.success ? 'high' : 'low'}\n\n`;
            concatenatedText += fullText;
            concatenatedText += '\n' + '='.repeat(50);
          }
        } catch (stepError) {
          console.error(`❌ ${step.name} analysis failed:`, stepError);
          const errorText = `${step.name} analysis failed: ${stepError.message}`;
          
          analysisResults[step.name.toLowerCase().replace(' ', '')] = {
            summary: errorText,
            fullText: errorText,
            status: 'error',
            confidence: 'low',
            timestamp: analysisTimestamp
          };
          
          concatenatedText += `\n\n=== ${step.name.toUpperCase()} ANALYSIS ===\n`;
          concatenatedText += `Timestamp: ${analysisTimestamp}\n`;
          concatenatedText += `Status: error\n`;
          concatenatedText += `Confidence: low\n\n`;
          concatenatedText += errorText;
          concatenatedText += '\n' + '='.repeat(50);
        }
      }

      setAnalysisProgress(100);
      
      const analysisRecord = {
        analysisType: 'comprehensive',
        analysisData: analysisResults,
        concatenatedText: concatenatedText,
        dataSources: {
          hasEmailTranscript: !!(submittedData.emailTranscript?.trim()),
          hasCallTranscript: !!(submittedData.callTranscript?.trim()),
          hasDocuments: !!(submittedData.documents?.length > 0)
        },
        status: 'completed',
        wordCount: concatenatedText.split(' ').length,
        characterCount: concatenatedText.length
      };

      const saveResult = await firebaseService.updateOrCreateAnalysis(startupData.id, analysisRecord);
      
      const fullAnalysisRecord = {
        id: saveResult.id,
        startupId: startupData.id,
        ...analysisRecord,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setAnalyses([fullAnalysisRecord]);
      setAnalysisResults(analysisResults);
      
      setResults(null);
      
      console.log('✅ Analysis completed and saved to Firebase!');
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setAnalysisError(error.message);
    } finally {
      stopLoading('analysis');
      setAnalysisInProgress(false);
      setAnalysisProgress(0);
    }
  };

  const handleCancelAnalysis = () => {
    stopLoading('analysis');
    setAnalysisInProgress(false);
    setAnalysisProgress(0);
    setAnalysisError(null);
  };


  const renderSubmitDataSection = () => (
    <div className="space-y-8">

      {/* Workflow Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Database className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-blue-800">Data Storage Workflow</h3>
        </div>
        <p className="text-blue-700 text-sm">
          📁 <strong>Pitch Deck:</strong> Uploaded immediately to Firebase Storage<br/>
          📧 <strong>Email Transcript:</strong> Stored in Firebase when entered<br/>
          📞 <strong>Call Transcript:</strong> Stored in Firebase when entered<br/>
          💾 <strong>Submit Data:</strong> Saves all data and prepares for comprehensive analysis
        </p>
      </div>

      {/* Pitch Deck Upload */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Pitch Deck</h3>
        </div>
        
        <PitchDeckUpload 
          startupId={user?.uid}
          onPitchDeckChange={handleDocumentUpload}
        />
        
        {formData.documents.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Uploaded Pitch Deck</h4>
            <div className="space-y-2">
              {formData.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({Math.round(doc.size / 1024)} KB)</span>
                    </div>
                  </div>
                  {doc.url && (
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Email Transcript Input */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Email Transcripts</h3>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email Content</label>
          <textarea
            value={formData.emailTranscript}
            onChange={(e) => handleFormChange('emailTranscript', e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
            placeholder="Paste email content here for AI analysis..."
          />
        </div>
      </div>

      {/* Call Transcript Input */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-orange-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Call Transcripts</h3>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Call Transcript</label>
          <textarea
            value={formData.callTranscript}
            onChange={(e) => handleFormChange('callTranscript', e.target.value)}
            rows={8}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
            placeholder="Paste call transcript here for AI analysis..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmitData}
          disabled={checkLoading('submit')}
          className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center space-x-3 ${
            checkLoading('submit')
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {checkLoading('submit') ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Saving to Firebase...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Save & Prepare for Analysis</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderMeetingsSection = () => (
    <div className="space-y-8">
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-green-800">Meeting Management</h3>
        </div>
        <p className="text-green-700">
          Schedule and manage meetings with investors. Request meetings, view your calendar, and track meeting status.
        </p>
      </div>
      
      <MeetingManager userId={user?.uid} userType="startup" />
    </div>
  );

  const renderAnalysisContent = () => (
    // Note: The AI Interview Simulator section is added in the main render function
    <LazyWrapper 
      skeletonType="dashboard" 
      delay={300}
      className="space-y-8"
    >
      {!submittedData ? (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-yellow-800 mb-2">No Data Submitted</h3>
          <p className="text-yellow-700 mb-6">
            Please submit your startup data first before running analysis.
          </p>
          <button
            onClick={() => setActiveSection('submit')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Go to Submit Data
          </button>
        </div>
      ) : (
        <>
          {/* Analysis Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">AI Analysis</h3>
              </div>
              <div className="flex items-center space-x-3">
                {analysisInProgress && (
                  <button
                    onClick={handleCancelAnalysis}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                )}
                
                <button
                  onClick={handleRunAnalysis}
                  disabled={checkLoading('analysis')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  {checkLoading('analysis') ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Run Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-bold text-blue-900">Fact Check</h4>
                <p className="text-sm text-blue-700">Verify claims</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-900">Market Size</h4>
                <p className="text-sm text-emerald-700">Market analysis</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-bold text-purple-900">Product Info</h4>
                <p className="text-sm text-purple-700">Product analysis</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                <Search className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-bold text-orange-900">Competition</h4>
                <p className="text-sm text-orange-700">Competitor analysis</p>
              </div>
            </div>
          </div>

           {/* Progress Indicator */}
           {checkLoading('analysis') && (
             <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-3">
                   <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                   <div>
                     <h4 className="font-bold text-blue-800 text-lg">🔍 Analysis in Progress</h4>
                     <p className="text-blue-600 text-sm">
                       {currentAnalysisStep ? `Running ${currentAnalysisStep} analysis...` : 'Running comprehensive analysis...'}
                     </p>
                     <p className="text-blue-500 text-xs mt-1">
                       {currentAnalysisStep ? 
                         `Processing ${currentAnalysisStep.toLowerCase()} data...` : 
                         'Analyzing pitch deck, transcripts, and business data...'
                       }
                     </p>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-2xl font-bold text-blue-600">
                     {analysisProgress}%
                   </div>
                   <div className="text-xs text-blue-500">Complete</div>
                 </div>
               </div>
               
               {/* Progress Bar */}
               <div className="w-full bg-blue-200 rounded-full h-3 mb-4">
                 <div 
                   className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                   style={{ width: `${analysisProgress}%` }}
                 />
               </div>
               
               {/* Analysis Steps */}
               <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                 {[
                   { name: 'Fact Check', icon: '🔍', key: 'factcheck' },
                   { name: 'Market Size', icon: '📊', key: 'marketsize' },
                   { name: 'Product Info', icon: '🛍️', key: 'productinfo' },
                   { name: 'Competition', icon: '🏆', key: 'competition' },
                   { name: 'Business Model', icon: '💼', key: 'businessmodel' },
                   { name: 'Founders', icon: '👥', key: 'founders' }
                 ].map((step) => (
                   <div 
                     key={step.key}
                     className={`p-2 rounded transition-all duration-300 ${
                       currentAnalysisStep === step.name
                         ? 'bg-green-200 text-green-800 border-2 border-green-300'
                         : 'bg-blue-100 text-blue-700'
                     }`}
                   >
                     {step.icon} {step.name}
                     {currentAnalysisStep === step.name && (
                       <div className="mt-1">
                         <div className="w-full bg-green-300 rounded-full h-1">
                           <div className="bg-green-600 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
                 </div>
                 </div>
                     )}
                 </div>
                 ))}
                 </div>
                 </div>
           )}

          {/* Current Analysis Status */}
          {analyses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                 </div>
                  <h3 className="text-xl font-bold text-gray-900">Current Analysis</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {analyses[0].updatedAt ? 'Updated' : 'Created'}
                  </span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Latest Analysis</h4>
                      <p className="text-sm text-gray-600">
                        {analyses[0].updatedAt 
                          ? `Updated: ${new Date(analyses[0].updatedAt.seconds * 1000).toLocaleString()}`
                          : analyses[0].createdAt 
                            ? `Created: ${new Date(analyses[0].createdAt.seconds * 1000).toLocaleString()}`
                            : 'Date not available'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Current
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {analyses[0].wordCount || 0} words
                    </span>
                  </div>
                </div>
              </div>
              
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 mb-3">
                      Running a new analysis will update this current analysis
                    </p>
                    <button
                      onClick={async () => {
                        console.log('🔄 Manually refreshing analysis data...');
                        const startupAnalysis = await firebaseService.getAnalysisByStartup(startupData.id);
                        console.log('🔄 Refreshed analysis:', startupAnalysis);
                        if (startupAnalysis) {
                          setAnalyses([startupAnalysis]);
                          if (startupAnalysis.analysisData) {
                            setAnalysisResults(startupAnalysis.analysisData);
                          }
                        }
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Refresh Analysis Data
                    </button>
                  </div>
             </div>
           )}

          {/* Current Analysis Results */}
          {analysisResults && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Latest Analysis Results
                      </h3>
                      <p className="text-sm text-gray-600">
                        {analyses[0]?.createdAt ? 
                          `Completed: ${new Date(analyses[0].createdAt.seconds ? analyses[0].createdAt.seconds * 1000 : analyses[0].createdAt).toLocaleString()}` :
                          'Recently completed'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Current
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Individual Analysis Results */}
              <div className="space-y-4">
                {(() => {
                  
                  if (analysisResults && typeof analysisResults === 'object') {
                    
                    if (Array.isArray(analysisResults)) {
                      const convertedResults = {};
                      analysisResults.forEach((item, index) => {
                        if (item && typeof item === 'object') {
                          convertedResults[`analysis_${index + 1}`] = item;
                        }
                      });
                      analysisResults = convertedResults;
                    }
                    
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
                      <h5 className="font-semibold text-gray-800 mb-2">Summary:</h5>
                      <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                        <div className="prose prose-sm max-w-none">
                          {result.summary && typeof result.summary === 'string' ? (
                            formatAnalysisText(result.summary).split('\n').map((line, index) => (
                              <p key={index} className="mb-2 last:mb-0">
                                {line.trim() || '\u00A0'}
                              </p>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">No summary available</p>
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
                            {formatAnalysisText(result.fullText).split('\n').map((line, index) => (
                              <p key={index} className="mb-3 last:mb-0 text-gray-700 leading-relaxed">
                                {line.trim() || '\u00A0'}
                              </p>
                            ))}
                          </div>
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
                            <p className="text-gray-500">Run an analysis to see detailed results here.</p>
                          </div>
                        </div>
                      );
                    }
                  } else {
                    return (
                      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                        <div className="text-center py-8">
                          <div className="p-4 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-yellow-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">Analysis Results Format Error</h3>
                          <p className="text-gray-500 mb-4">The analysis results are in an unexpected format.</p>
                          <div className="bg-gray-100 p-4 rounded-lg text-left">
                            <p className="text-sm text-gray-600 font-mono">
                              {JSON.stringify(analysisResults, null, 2).substring(0, 200)}...
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
              
              {/* Concatenated Analysis Text */}
              {analyses[0]?.concatenatedText && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Complete Analysis Text</h3>
                        <p className="text-sm text-gray-600">
                          Full concatenated analysis results
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                        {analyses[0]?.wordCount || 0} words
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                        {analyses[0]?.characterCount || 0} chars
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      {formatAnalysisText(analyses[0].concatenatedText).split('\n').map((line, index) => {
                        if (line.trim().startsWith('===') && line.trim().endsWith('===')) {
                          return (
                            <h3 key={index} className="text-lg font-bold text-gray-800 mt-6 mb-3 first:mt-0">
                              {line.trim().replace(/=/g, '').trim()}
                            </h3>
                          );
                        }
                        if (line.includes(':') && !line.includes('http')) {
                          const [field, value] = line.split(':', 2);
                          return (
                            <div key={index} className="mb-2">
                              <span className="font-semibold text-gray-700">{field.trim()}:</span>
                              <span className="ml-2 text-gray-600">{value.trim()}</span>
                            </div>
                          );
                        }
                        return (
                          <p key={index} className="mb-3 last:mb-0 text-gray-700 leading-relaxed">
                            {line.trim() || '\u00A0'}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(analyses[0].concatenatedText);
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Copy Text
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([analyses[0].concatenatedText], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `analysis-${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      Download Text
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legacy Analysis Results */}
          {results && results.type === 'analysis' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-gray-900">Analysis Results</h3>
              
              {results.data.factCheck && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <h4 className="text-xl font-bold text-gray-900">Fact Check Results</h4>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {JSON.stringify(results.data.factCheck, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {results.data.marketSize && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                    <h4 className="text-xl font-bold text-gray-900">Market Size Analysis</h4>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {JSON.stringify(results.data.marketSize, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {results.data.productInfo && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <Target className="h-6 w-6 text-purple-600" />
                    <h4 className="text-xl font-bold text-gray-900">Product Information Analysis</h4>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {JSON.stringify(results.data.productInfo, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {results.data.competition && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <Search className="h-6 w-6 text-orange-600" />
                    <h4 className="text-xl font-bold text-gray-900">Competition Analysis</h4>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {JSON.stringify(results.data.competition, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Previous Analyses */}
          {analyses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-6">Previous Analyses</h3>
              <div className="space-y-4">
                {analyses.map((analysis, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {analysis.analysisType || 'Comprehensive Analysis'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(analysis.createdAt?.toDate?.() || analysis.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                          {analysis.status || 'Completed'}
                        </span>
                        <button className="p-2 text-gray-500 hover:text-purple-600 transition-colors duration-300">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </LazyWrapper>
  );

  

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <LoadingSpinner size="xl" text="Processing..." />
          </div>
        </div>
      )}
      
      {/* Floating gradient shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b-2 border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-black text-gray-900">Startup Dashboard</h1>
                  <Sparkles className="h-6 w-6 text-pink-500" />
                </div>
                <p className="text-gray-600 text-lg font-medium">Submit data and get AI-powered analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
                <div className="flex items-center space-x-2 text-sm font-bold text-purple-700">
                  <User className="h-4 w-4" />
                  <span>{user.displayName || user.email}</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-red-300 font-bold"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Section Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 border-2 border-gray-100 flex space-x-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                    activeSection === section.id
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Content */}
        {activeSection === 'submit' && renderSubmitDataSection()}
        
        {activeSection === 'analysis' && (
          <div className="space-y-8">
            {isInterviewing ? (
              <AIInterviewer
                startup={{
                  id: startupData?.id,
                  companyName: startupData?.companyName,
                  industry: startupData?.industry,
                  stage: startupData?.stage,
                  description: startupData?.description,
                  analysisData: analysisResults,
                  documents: formData.documents || [],
                  emailTranscript: formData.emailTranscript || '',
                  callTranscript: formData.callTranscript || ''
                }}
                investorProfile={mockInvestorProfile}
                onEnd={async (transcript) => {
                  try {
                    if (startupData?.id && transcript) {
                      await firebaseService.saveInterviewTranscript(startupData.id, transcript);
                      console.log('✅ Interview transcript saved successfully!');
                    }
                  } catch (error) {
                    console.error('❌ Error saving interview transcript:', error);
                    setError('Failed to save interview transcript.');
                  } finally {
                    setIsInterviewing(false);
                  }
                }}
              />
            ) : (
              <>
                {/* --- AI Interview Integration (New Section) --- */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
                  <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <Mic className="h-6 w-6 text-pink-600" />
                    <span>AI Interview Simulator</span>
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Practice your investor pitch. The AI will generate <strong>critical, data-driven questions</strong> based on your submitted information and the latest AI analysis results.
                  </p>
                  {submittedData && analysisResults && Object.keys(analysisResults).length > 0 ? (
                    <button
                      onClick={() => setIsInterviewing(true)}
                      className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3"
                    >
                      <Mic className="h-5 w-5" />
                      <span>Start Mock Investor Interview</span>
                    </button>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">
                        Please ensure you have **submitted your startup data** and **run the comprehensive analysis** before starting the interview simulation.
                      </p>
                    </div>
                  )}
                </div>
                {/* --- End AI Interview Integration --- */}
                {renderAnalysisContent()}
              </>
            )}
          </div>
        )}
        
        {activeSection === 'meetings' && renderMeetingsSection()}

        {/* Success/Error/Info Messages */}
        {results && results.type === 'success' && (
          <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-green-800">{results.message}</h3>
                <p className="text-green-700">You can now switch to the Analysis tab to run AI analysis on your data.</p>
              </div>
            </div>
          </div>
        )}
        
        {results && results.type === 'info' && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-blue-800">{results.message}</h3>
                  <p className="text-blue-700">Complete your profile to start using the dashboard features.</p>
                  <div className="mt-3 flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-600">Auto-redirecting in a moment...</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                <User className="h-5 w-5" />
                <span>Complete Profile Now</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-bold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default StartupDashboard;