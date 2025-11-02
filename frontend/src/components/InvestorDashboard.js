import React, { useState, useEffect, Suspense, lazy, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, TrendingUp, Building2, MapPin, Calendar, Star, LogOut, User, Eye, BarChart3, AlertTriangle, PieChart, Sparkles, Zap, Heart, Rocket, Target, Shield, Users, ChevronRight, X, Brain, CheckCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';
import firebaseService from '../services/firebaseService';
import { downloadStartupReportPDF } from '../utils/pdfGenerator';
import LoadingSpinner from './LoadingSpinner';
import SkeletonLoader from './SkeletonLoader';
import LazyWrapper from './LazyWrapper';
import useLoading from '../hooks/useLoading';
import NotificationBell from './NotificationBell';
import NotificationCenter from './NotificationCenter';

const InvestorDashboard = memo(({ user, onLogout, onStartupSelect }) => {
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [startupAnalysis, setStartupAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [investorProfile, setInvestorProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savedStartups, setSavedStartups] = useState([]);
  const [savedStartupsLoading, setSavedStartupsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [showNotifications, setShowNotifications] = useState(false);

  const categories = useMemo(() => [
    'all', 'fintech', 'healthtech', 'edtech', 'saas', 'ecommerce',
    'ai', 'machine learning', 'blockchain', 'cybersecurity',
    'biotech', 'cleantech', 'agtech', 'proptech'
  ], []);

  const sortOptions = useMemo(() => [
    { value: 'recent', label: 'Most Recent' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'industry', label: 'Industry' },
    { value: 'stage', label: 'Stage' }
  ], []);


  const handleDeleteSavedStartup = useCallback(async (savedStartupId, startupId) => {
    try {
      await firebaseService.unsaveStartup(startupId);
      setSavedStartups(prev => prev.filter(item => item.id !== savedStartupId));
    } catch (error) {
      console.error('Error deleting saved startup:', error);
    }
  }, []);

  const loadInvestorProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      console.log('🔍 Loading investor profile for user:', user.uid);
      
      const investorData = await firebaseService.findInvestorByUserId(user.uid);
      console.log('🔍 Investor profile loaded:', investorData);
      
      if (investorData) {
        setInvestorProfile(investorData);
        
        console.log('✅ Investor profile loaded successfully');
      } else {
        console.log('ℹ️ No investor profile found');
        setInvestorProfile(null);
      }
    } catch (error) {
      console.error('Error loading investor profile:', error);
      setInvestorProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [user.uid]);

  const loadStartups = useCallback(async () => {
    try {
      setLoading(true);
      const allStartups = await firebaseService.getAllStartups();
      setStartups(allStartups);
    } catch (error) {
      console.error('Error loading startups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSavedStartups = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setSavedStartupsLoading(true);
      const saved = await firebaseService.getSavedStartupsForInvestor(user.uid);
      setSavedStartups(saved);
    } catch (error) {
      console.error('Error loading saved startups:', error);
    } finally {
      setSavedStartupsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadInvestorProfile();
  }, [loadInvestorProfile]);

  useEffect(() => {
    // Load startups and saved startups regardless of profile status
    if (!profileLoading) {
      loadStartups();
      loadSavedStartups();
    }
  }, [profileLoading, loadStartups, loadSavedStartups]);

  const loadStartupAnalysis = useCallback(async (startupId) => {
    try {
      setAnalysisLoading(true);
      const analyses = await firebaseService.getAnalysesByStartup(startupId);
      if (analyses && analyses.length > 0) {
        // Get the most recent analysis
        const latestAnalysis = analyses[0];
        setStartupAnalysis(latestAnalysis);
      } else {
        setStartupAnalysis(null);
      }
    } catch (error) {
      console.error('Error loading startup analysis:', error);
      setStartupAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  const handleStartupClick = useCallback(async (startup) => {
    setSelectedStartup(startup);
    setShowAnalysisModal(true);
    await loadStartupAnalysis(startup.id);
  }, [loadStartupAnalysis]);

  const handleDownloadPDF = useCallback(() => {
    if (selectedStartup) {
      downloadStartupReportPDF(selectedStartup, startupAnalysis);
    }
  }, [selectedStartup, startupAnalysis]);

  const filteredStartups = useMemo(() => {
    let filtered = startups;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(startup =>
        startup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(startup =>
        startup.industry?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'industry':
          return (a.industry || '').localeCompare(b.industry || '');
        case 'stage':
          return (a.stage || '').localeCompare(b.stage || '');
        case 'recent':
        default:
          return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - 
                 new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
      }
    });

    return filtered;
  }, [startups, searchTerm, selectedCategory, sortBy]);

  const getStageColor = (stage) => {
    const colors = {
      'pre-seed': 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200',
      'seed': 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200',
      'series-a': 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200',
      'series-b': 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200',
      'series-c': 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border border-pink-200',
      'growth': 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200'
    };
    return colors[stage] || 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
  };

  const getIndustryIcon = (industry) => {
    const icons = {
      'fintech': '💰',
      'healthtech': '🏥',
      'edtech': '🎓',
      'saas': '☁️',
      'ecommerce': '🛒',
      'ai': '🤖',
      'blockchain': '⛓️',
      'cybersecurity': '🔒',
      'biotech': '🧬',
      'cleantech': '🌱',
      'agtech': '🌾',
      'proptech': '🏠'
    };
    return icons[industry?.toLowerCase()] || '🚀';
  };

  // Show loading spinner while checking profile
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-10 animate-bounce"></div>
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Investor Dashboard</h1>
                <p className="text-pink-100 text-sm font-medium">Discover your next investment</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <NotificationBell onOpenNotifications={() => setShowNotifications(true)} />
              <div className="flex items-center space-x-3 bg-white bg-opacity-20 rounded-2xl px-4 py-2 backdrop-blur-sm">
                <div className="p-1 bg-white rounded-lg">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-white font-semibold">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-white hover:text-pink-200 transition-colors bg-white bg-opacity-20 rounded-2xl px-4 py-2 backdrop-blur-sm font-semibold"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl border-2 border-purple-100 p-8 mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h2 className="text-3xl font-black text-gray-900">Discover Investment Opportunities</h2>
            <Heart className="h-6 w-6 text-pink-500" />
          </div>
          <p className="text-xl text-gray-600 mb-8 font-medium">
            Explore promising startups, analyze their potential, and make informed investment decisions with AI-powered insights.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Building2 className="h-8 w-8" />
                <span className="text-lg font-bold">Total Startups</span>
              </div>
              <p className="text-4xl font-black">{startups.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center space-x-3 mb-3">
                <TrendingUp className="h-8 w-8" />
                <span className="text-lg font-bold">Active</span>
              </div>
              <p className="text-4xl font-black">{filteredStartups.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center space-x-3 mb-3">
                <BarChart3 className="h-8 w-8" />
                <span className="text-lg font-bold">Categories</span>
              </div>
              <p className="text-4xl font-black">{categories.length - 1}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Star className="h-8 w-8" />
                <span className="text-lg font-bold">Featured</span>
              </div>
              <p className="text-4xl font-black">0</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === 'discover'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span>Discover Startups</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              <Heart className="h-5 w-5" />
              <span>Saved Startups ({savedStartups.length})</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Search className="h-6 w-6 text-purple-500" />
            <h3 className="text-2xl font-black text-gray-900">Find Your Perfect Investment</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3">Search Startups</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, description, or industry..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 text-lg font-medium"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 text-lg font-medium"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 text-lg font-medium"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'discover' ? (
          /* Startups Grid - Lazy Loaded */
          <LazyWrapper 
            skeletonType="card" 
            skeletonCount={6}
            delay={200}
          >
            {loading ? (
              <div className="flex flex-col justify-center items-center py-24">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-500 mb-6"></div>
                <p className="text-xl font-bold text-gray-600">Loading amazing startups...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStartups.map((startup) => (
                  <div
                    key={startup.id}
                    className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 hover:shadow-2xl transition-all duration-300 p-8 group hover:-translate-y-2 hover:border-purple-200 cursor-pointer"
                    onClick={() => handleStartupClick(startup)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300 text-2xl">
                          {getIndustryIcon(startup.industry)}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900">{startup.name}</h3>
                          <p className="text-sm text-purple-600 font-bold">{startup.industry}</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-purple-600 transform hover:scale-110 transition-all duration-300">
                        <Eye className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-base mb-6 line-clamp-3 leading-relaxed font-medium">
                      {startup.description || 'No description available.'}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      {startup.stage && (
                        <span className={`px-3 py-2 rounded-full text-xs font-bold ${getStageColor(startup.stage)}`}>
                          {startup.stage}
                        </span>
                      )}
                      {startup.location && (
                        <span className="px-3 py-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-full text-xs font-bold flex items-center border border-gray-200">
                          <MapPin className="h-3 w-3 mr-1" />
                          {startup.location}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span className="font-semibold">
                          {new Date(startup.createdAt?.toDate?.() || startup.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadStartupReportPDF(startup, null);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-xs font-bold"
                        >
                          <Download className="h-3 w-3" />
                          <span>PDF</span>
                        </button>
                        <div className="flex items-center space-x-2 text-purple-600 hover:text-pink-600 font-bold transition-colors duration-200">
                          <span>View Details</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </LazyWrapper>
        ) : (
          /* Saved Startups */
          <LazyWrapper 
            skeletonType="card" 
            skeletonCount={3}
            delay={200}
          >
            {savedStartupsLoading ? (
              <div className="flex flex-col justify-center items-center py-24">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-500 mb-6"></div>
                <p className="text-xl font-bold text-gray-600">Loading your saved startups...</p>
              </div>
            ) : savedStartups.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Heart className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4">No saved startups yet</h3>
                <p className="text-xl text-gray-500 font-medium">Start exploring and save startups you're interested in!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedStartups.map((savedStartup) => (
                  <div
                    key={savedStartup.id}
                    className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 hover:shadow-2xl transition-all duration-300 p-8 group hover:-translate-y-2 hover:border-purple-200 cursor-pointer"
                    onClick={() => handleStartupClick(savedStartup.startupData)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300 text-2xl">
                          {getIndustryIcon(savedStartup.startupData.industry)}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900">{savedStartup.startupData.name}</h3>
                          <p className="text-sm text-green-600 font-bold">{savedStartup.startupData.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                        <button className="text-gray-400 hover:text-purple-600 transform hover:scale-110 transition-all duration-300">
                          <Eye className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-base mb-6 line-clamp-3 leading-relaxed font-medium">
                      {savedStartup.startupData.description || 'No description available.'}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-bold">
                        {savedStartup.startupData.stage}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-bold">
                        Saved
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Saved {new Date(savedStartup.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-bold text-gray-700">
                          {savedStartup.startupData.overallScore || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </LazyWrapper>
        )}

        {/* Analysis Modal */}
        {showAnalysisModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                      <Brain className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">Startup Analysis</h2>
                      <p className="text-purple-100">
                        {selectedStartup?.name} - {selectedStartup?.industry}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAnalysisModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {analysisLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-lg font-bold text-gray-600">Loading analysis...</p>
                  </div>
                ) : startupAnalysis ? (
                  <div className="space-y-6">
                    {/* Analysis Overview */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        <h3 className="text-xl font-black text-gray-900">Analysis Overview</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-black text-blue-600">
                            {startupAnalysis.analysisType || 'Comprehensive'}
                          </div>
                          <div className="text-sm text-blue-700 font-bold">Analysis Type</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-black text-blue-600">
                            {startupAnalysis.status || 'Completed'}
                          </div>
                          <div className="text-sm text-blue-700 font-bold">Status</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-black text-blue-600">
                            {new Date(startupAnalysis.createdAt?.toDate?.() || startupAnalysis.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-blue-700 font-bold">Date</div>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Results */}
                    {startupAnalysis.results && (
                      <div className="space-y-6">
                        {/* Fact Check Results */}
                        {startupAnalysis.results.factCheck && (
                          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-100">
                            <div className="flex items-center space-x-3 mb-4">
                              <Shield className="h-6 w-6 text-emerald-600" />
                              <h4 className="text-xl font-black text-gray-900">Fact Check Analysis</h4>
                            </div>
                            <div className="prose max-w-none">
                              <div className="bg-gray-50 rounded-xl p-4">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                                  {typeof startupAnalysis.results.factCheck === 'string' 
                                    ? startupAnalysis.results.factCheck 
                                    : JSON.stringify(startupAnalysis.results.factCheck, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Market Size Analysis */}
                        {startupAnalysis.results.marketSize && (
                          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
                            <div className="flex items-center space-x-3 mb-4">
                              <TrendingUp className="h-6 w-6 text-blue-600" />
                              <h4 className="text-xl font-black text-gray-900">Market Size Analysis</h4>
                            </div>
                            <div className="prose max-w-none">
                              <div className="bg-gray-50 rounded-xl p-4">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                                  {typeof startupAnalysis.results.marketSize === 'string' 
                                    ? startupAnalysis.results.marketSize 
                                    : JSON.stringify(startupAnalysis.results.marketSize, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Product Information Analysis */}
                        {startupAnalysis.results.productInfo && (
                          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
                            <div className="flex items-center space-x-3 mb-4">
                              <Target className="h-6 w-6 text-purple-600" />
                              <h4 className="text-xl font-black text-gray-900">Product Information Analysis</h4>
                            </div>
                            <div className="prose max-w-none">
                              <div className="bg-gray-50 rounded-xl p-4">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                                  {typeof startupAnalysis.results.productInfo === 'string' 
                                    ? startupAnalysis.results.productInfo 
                                    : JSON.stringify(startupAnalysis.results.productInfo, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Competition Analysis */}
                        {startupAnalysis.results.competition && (
                          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
                            <div className="flex items-center space-x-3 mb-4">
                              <Search className="h-6 w-6 text-orange-600" />
                              <h4 className="text-xl font-black text-gray-900">Competition Analysis</h4>
                            </div>
                            <div className="prose max-w-none">
                              <div className="bg-gray-50 rounded-xl p-4">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                                  {typeof startupAnalysis.results.competition === 'string' 
                                    ? startupAnalysis.results.competition 
                                    : JSON.stringify(startupAnalysis.results.competition, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* No Analysis Available */}
                    {!startupAnalysis.results && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-yellow-800 mb-2">No Analysis Available</h3>
                        <p className="text-yellow-700">
                          This startup hasn't completed any AI analysis yet. Analysis will appear here once the startup submits their data and runs analysis.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-red-800 mb-2">Error Loading Analysis</h3>
                    <p className="text-red-700">
                      There was an error loading the analysis for this startup. Please try again.
                    </p>
                    <button
                      onClick={() => loadStartupAnalysis(selectedStartup.id)}
                      className="mt-4 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <button
                  onClick={handleDownloadPDF}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF Report</span>
                </button>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowAnalysisModal(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => onStartupSelect(selectedStartup)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Full Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Center */}
        <NotificationCenter 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
      </div>
    </div>
  );
});

export default InvestorDashboard;