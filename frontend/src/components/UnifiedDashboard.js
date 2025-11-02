/**
 * Unified Dashboard Component
 * Consolidates startup and investor dashboard functionality into a single, reusable component.
 */

import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { useUser, useData, useUI } from '../contexts/AppContext';
import { 
  Search, Filter, TrendingUp, Building2, MapPin, Calendar, Star, 
  LogOut, User, Eye, BarChart3, AlertTriangle, PieChart, Sparkles, 
  Zap, Heart, Rocket, Target, Shield, Users, ChevronRight, X, 
  Brain, CheckCircle, AlertCircle, RefreshCw, Download, Plus,
  FileText, Upload, Settings, Bell, HelpCircle
} from 'lucide-react';
import { downloadStartupReportPDF } from '../utils/pdfGenerator';
import firebaseService from '../services/firebaseService';

const UnifiedDashboard = memo(({ userType, onLogout, onStartupSelect }) => {
  const { user, userProfile, loading: userLoading, error: userError } = useUser();
  const { 
    startups, 
    investors, 
    analyses, 
    loading: dataLoading, 
    errors: dataErrors,
    loadStartups,
    loadInvestors,
    loadAnalyses,
    addNotification
  } = useData();
  const { theme, modals, openModal, closeModal } = useUI();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemAnalysis, setItemAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Categories and sort options based on user type
  const categories = userType === 'startup' 
    ? ['all', 'fintech', 'healthtech', 'edtech', 'saas', 'ecommerce', 'ai', 'machine learning', 'blockchain', 'cybersecurity', 'biotech', 'cleantech', 'agtech', 'proptech']
    : ['all', 'early-stage', 'growth-stage', 'late-stage', 'pre-ipo', 'public'];

  const sortOptions = userType === 'startup'
    ? [
        { value: 'recent', label: 'Most Recent' },
        { value: 'name', label: 'Name A-Z' },
        { value: 'industry', label: 'Industry' },
        { value: 'stage', label: 'Stage' }
      ]
    : [
        { value: 'recent', label: 'Most Recent' },
        { value: 'name', label: 'Name A-Z' },
        { value: 'focus', label: 'Investment Focus' },
        { value: 'experience', label: 'Experience' }
      ];

  // Load data on mount
  useEffect(() => {
    if (userType === 'startup') {
      loadStartups();
    } else {
      loadInvestors();
    }
  }, [userType, loadStartups, loadInvestors]);

  // Filter and sort data
  const filterAndSortData = () => {
    const data = userType === 'startup' ? startups : investors;
    let filtered = data;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.industry?.toLowerCase() === selectedCategory.toLowerCase() ||
        item.stage?.toLowerCase() === selectedCategory.toLowerCase() ||
        item.focus?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort data
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
          const dateA = new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
          const dateB = new Date(b.createdAt?.toDate?.() || b.createdAt || 0);
          return dateB - dateA;
      }
    });

    return filtered;
  };

  const filteredData = filterAndSortData();

  // Load analysis for selected item
  const loadItemAnalysis = async (itemId) => {
    try {
      setAnalysisLoading(true);
      const analyses = await firebaseService.getAnalysesByStartup(itemId);
      if (analyses && analyses.length > 0) {
        setItemAnalysis(analyses[0]);
      } else {
        setItemAnalysis(null);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      setItemAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Handle item click
  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setShowAnalysisModal(true);
    if (userType === 'investor') {
      await loadItemAnalysis(item.id);
    }
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (selectedItem) {
      downloadStartupReportPDF(selectedItem, itemAnalysis);
    }
  };

  // Get stage color for startups
  const getStageColor = (stage) => {
    const colors = {
      'idea': 'bg-blue-100 text-blue-800',
      'mvp': 'bg-yellow-100 text-yellow-800',
      'early': 'bg-green-100 text-green-800',
      'growth': 'bg-purple-100 text-purple-800',
      'scale': 'bg-pink-100 text-pink-800',
      'exit': 'bg-gray-100 text-gray-800'
    };
    return colors[stage?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Get industry icon
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
    return icons[industry?.toLowerCase()] || '🏢';
  };

  // Render loading state
  if (userLoading || dataLoading[userType === 'startup' ? 'startups' : 'investors']) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg font-bold text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (userError || dataErrors[userType === 'startup' ? 'startups' : 'investors']) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700 mb-4">
            {userError || dataErrors[userType === 'startup' ? 'startups' : 'investors']}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black">
                {userType === 'startup' ? 'Startup Dashboard' : 'Investor Dashboard'}
              </h1>
              <p className="text-purple-100 mt-2">
                {userType === 'startup' 
                  ? 'Manage your startup profile and track your progress'
                  : 'Discover and analyze investment opportunities'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => openModal('settings')}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors duration-200"
              >
                <Settings className="h-6 w-6" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors duration-200"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 mb-8 border-2 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Welcome back, {user?.displayName || user?.email || 'User'}!
              </h2>
              <p className="text-blue-700 font-medium">
                {userType === 'startup' 
                  ? 'Ready to showcase your startup to potential investors?'
                  : 'Ready to discover your next investment opportunity?'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {userType === 'startup' ? (
            <>
              <button
                onClick={() => setActiveTab('submit-data')}
                className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Submit Data</h3>
                </div>
                <p className="text-gray-600">Update your startup information and documents</p>
              </button>
              
              <button
                onClick={() => setActiveTab('view-analysis')}
                className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">View Analysis</h3>
                </div>
                <p className="text-gray-600">Review AI analysis of your startup data</p>
              </button>
              
              <button
                onClick={() => openModal('profile')}
                className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Profile Settings</h3>
                </div>
                <p className="text-gray-600">Manage your profile and preferences</p>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('discover')}
                className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Discover Startups</h3>
                </div>
                <p className="text-gray-600">Browse and filter startup opportunities</p>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Analytics</h3>
                </div>
                <p className="text-gray-600">View investment analytics and trends</p>
              </button>
              
              <button
                onClick={() => openModal('profile')}
                className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Profile Settings</h3>
                </div>
                <p className="text-gray-600">Manage your investor profile</p>
              </button>
            </>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${userType === 'startup' ? 'startups' : 'investors'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
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

        {/* Data Grid */}
        {filteredData.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Building2 className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4">
              No {userType === 'startup' ? 'startups' : 'investors'} found
            </h3>
            <p className="text-xl text-gray-500 font-medium">
              Try adjusting your search or filter criteria to discover more opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 hover:shadow-2xl transition-all duration-300 p-8 group hover:-translate-y-2 hover:border-purple-200 cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300 text-2xl">
                      {getIndustryIcon(item.industry)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">{item.name}</h3>
                      <p className="text-sm text-purple-600 font-bold">{item.industry}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-purple-600 transform hover:scale-110 transition-all duration-300">
                    <Eye className="h-6 w-6" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-base mb-6 line-clamp-3 leading-relaxed font-medium">
                  {item.description || 'No description available.'}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {item.stage && (
                    <span className={`px-3 py-2 rounded-full text-xs font-bold ${getStageColor(item.stage)}`}>
                      {item.stage}
                    </span>
                  )}
                  {item.location && (
                    <span className="px-3 py-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-full text-xs font-bold flex items-center border border-gray-200">
                      <MapPin className="h-3 w-3 mr-1" />
                      {item.location}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span className="font-semibold">
                      {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadStartupReportPDF(item, null);
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

        {/* Analysis Modal */}
        {showAnalysisModal && selectedItem && (
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
                      <h2 className="text-2xl font-black">Analysis Report</h2>
                      <p className="text-purple-100">
                        {selectedItem.name} - {selectedItem.industry}
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
                ) : itemAnalysis ? (
                  <div className="space-y-6">
                    {/* Analysis results would be rendered here */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                      <h3 className="text-xl font-black text-gray-900 mb-4">Analysis Complete</h3>
                      <p className="text-blue-700">Analysis results would be displayed here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-yellow-800 mb-2">No Analysis Available</h3>
                    <p className="text-yellow-700">
                      This {userType === 'startup' ? 'startup' : 'item'} hasn't completed any AI analysis yet.
                    </p>
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
                    onClick={() => onStartupSelect(selectedItem)}
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
      </div>
    </div>
  );
});

export default UnifiedDashboard;
