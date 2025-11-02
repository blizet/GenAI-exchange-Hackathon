import React, { useState, useEffect } from 'react';
import { Search, Filter, Building2, TrendingUp, Users, Calendar, Star, ChevronRight, Eye, BarChart3, Shield, Target, DollarSign, LogOut, Sparkles, Heart, Rocket } from 'lucide-react';
import { discoverStartups } from '../services/api';
import firebaseService from '../services/firebaseService';

const StartupsPage = ({ user, userType, onLogout, onStartupSelect }) => {
  const [startups, setStartups] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    sector: '',
    stage: '',
    hasAnalysis: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12); // Show 12 items initially

  useEffect(() => {
    fetchStartups();
  }, []);

  useEffect(() => {
    filterStartups();
  }, [startups, searchTerm, selectedFilters]);

  // Show fallback data immediately to reduce perceived loading time
  const getFallbackStartups = () => [
    {
      id: 'demo-1',
      companyName: 'TechFlow AI',
      description: 'Revolutionary AI-powered workflow automation platform for enterprises',
      industry: 'Technology',
      stage: 'Series A',
      teamSize: '25-50',
      foundedYear: '2021',
      overallScore: 85,
      hasAnalysis: true,
      documentAnalysis: true,
      emailAnalysis: true,
      businessModelAnalysis: true
    },
    {
      id: 'demo-2',
      companyName: 'GreenEnergy Solutions',
      description: 'Sustainable energy solutions for smart cities and industrial applications',
      industry: 'Clean Energy',
      stage: 'Seed',
      teamSize: '10-25',
      foundedYear: '2022',
      overallScore: 78,
      hasAnalysis: true,
      documentAnalysis: true,
      marketIntelligenceAnalysis: true
    },
    {
      id: 'demo-3',
      companyName: 'HealthTech Innovations',
      description: 'AI-driven diagnostic tools for early disease detection and prevention',
      industry: 'Healthcare',
      stage: 'Series B',
      teamSize: '50-100',
      foundedYear: '2020',
      overallScore: 92,
      hasAnalysis: true,
      documentAnalysis: true,
      emailAnalysis: true,
      callAnalysis: true,
      businessModelAnalysis: true,
      marketIntelligenceAnalysis: true,
      riskAssessmentAnalysis: true
    },
    {
      id: 'demo-4',
      companyName: 'FinTech Pro',
      description: 'Next-generation financial technology solutions for digital banking',
      industry: 'Fintech',
      stage: 'Series A',
      teamSize: '30-60',
      foundedYear: '2021',
      overallScore: 88,
      hasAnalysis: true,
      documentAnalysis: true,
      businessModelAnalysis: true,
      riskAssessmentAnalysis: true
    },
    {
      id: 'demo-5',
      companyName: 'EduTech Solutions',
      description: 'Personalized learning platforms powered by artificial intelligence',
      industry: 'Education',
      stage: 'Seed',
      teamSize: '15-30',
      foundedYear: '2023',
      overallScore: 75,
      hasAnalysis: false,
      documentAnalysis: false
    },
    {
      id: 'demo-6',
      companyName: 'AgriTech Innovations',
      description: 'Smart farming solutions using IoT and AI for sustainable agriculture',
      industry: 'Agriculture',
      stage: 'Pre-seed',
      teamSize: '8-15',
      foundedYear: '2023',
      overallScore: 72,
      hasAnalysis: true,
      documentAnalysis: true
    },
    {
      id: 'demo-7',
      companyName: 'RetailTech Solutions',
      description: 'AI-powered retail analytics and customer experience optimization',
      industry: 'Retail',
      stage: 'Series A',
      teamSize: '20-40',
      foundedYear: '2022',
      overallScore: 81,
      hasAnalysis: true,
      documentAnalysis: true,
      businessModelAnalysis: true
    },
    {
      id: 'demo-8',
      companyName: 'LogiTech Pro',
      description: 'Automated logistics and supply chain management platform',
      industry: 'Logistics',
      stage: 'Series B',
      teamSize: '40-80',
      foundedYear: '2021',
      overallScore: 89,
      hasAnalysis: true,
      documentAnalysis: true,
      emailAnalysis: true,
      businessModelAnalysis: true,
      marketIntelligenceAnalysis: true
    }
  ];

  const fetchStartups = async () => {
    try {
      setLoading(true);
      setInitialLoad(true);
      
      console.log('🔄 Fetching startups from Firestore...');
      
      // Try Firestore first
      const firestoreStartups = await firebaseService.getAllStartups();
      console.log('📊 Firestore startups:', firestoreStartups);
      
      if (firestoreStartups && firestoreStartups.length > 0) {
        setStartups(firestoreStartups);
      } else {
        console.log('⚠️ No startups in Firestore, using fallback data');
        // Only show fallback data if Firestore is empty
        const fallbackData = getFallbackStartups();
        setStartups(fallbackData);
      }
    } catch (error) {
      console.error('❌ Error fetching startups:', error);
      // Show fallback data on error
      const fallbackData = getFallbackStartups();
      setStartups(fallbackData);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const filterStartups = () => {
    let filtered = startups.filter(startup => {
      const matchesSearch = startup.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           startup.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           startup.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           startup.sector?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSector = !selectedFilters.sector || startup.industry === selectedFilters.sector || startup.sector === selectedFilters.sector;
      const matchesStage = !selectedFilters.stage || startup.stage === selectedFilters.stage;
      const matchesAnalysis = selectedFilters.hasAnalysis === 'all' || 
                             (selectedFilters.hasAnalysis === 'yes' && startup.hasAnalysis) ||
                             (selectedFilters.hasAnalysis === 'no' && !startup.hasAnalysis);
      
      return matchesSearch && matchesSector && matchesStage && matchesAnalysis;
    });
    
    setFilteredStartups(filtered);
  };

  // Load more items for lazy loading
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 12, filteredStartups.length));
  };

  // Get visible startups for lazy loading
  const getVisibleStartups = () => {
    return filteredStartups.slice(0, visibleCount);
  };

  const getSectors = () => {
    const sectors = [...new Set(startups.map(startup => startup.industry || startup.sector).filter(Boolean))];
    return sectors.sort();
  };

  const getStages = () => {
    const stages = [...new Set(startups.map(startup => startup.stage).filter(Boolean))];
    return stages.sort();
  };

  const getAnalysisCount = (startup) => {
    let count = 0;
    if (startup.documentAnalysis) count++;
    if (startup.emailAnalysis) count++;
    if (startup.callAnalysis) count++;
    if (startup.factCheckAnalysis) count++;
    if (startup.businessModelAnalysis) count++;
    if (startup.marketIntelligenceAnalysis) count++;
    if (startup.riskAssessmentAnalysis) count++;
    if (startup.comprehensiveAnalysis) count++;
    return count;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-100 border border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-100 border border-amber-200';
    return 'text-rose-700 bg-rose-100 border border-rose-200';
  };

  if (loading && startups.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        {/* Floating gradient shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading startups...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching real-time data from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating gradient shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce"></div>

      {/* Header - Jamm.co inspired clean design */}
      <div className="relative z-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-12">
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-xl">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-gray-900">All Startups</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-gray-600 text-xl">Discover and analyze promising startups</p>
                    <Sparkles className="h-5 w-5 text-pink-500" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl px-6 py-3 shadow-lg">
                <div className="text-lg font-black text-purple-700">
                  {filteredStartups.length} of {startups.length}
                </div>
                <div className="text-sm text-purple-600 font-medium">startups found</div>
              </div>
              {user && (
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold border border-gray-200 hover:border-red-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Search and Filters - Modern Jamm.co style */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-black text-gray-700 mb-3">Search Startups</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, description, or sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 text-lg font-medium hover:border-purple-300 shadow-sm"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-3 px-8 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 font-bold shadow-lg hover:shadow-xl ${
                  showFilters 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-2 border-purple-400' 
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-2 border-purple-200 hover:from-purple-100 hover:to-pink-100'
                }`}
              >
                <Filter className="h-6 w-6" />
                <span>Filters</span>
                {showFilters && <span className="bg-white/20 px-2 py-1 rounded-full text-xs">Active</span>}
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-8 pt-8 border-t-2 border-purple-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sector Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Sector</label>
                  <select
                    value={selectedFilters.sector}
                    onChange={(e) => setSelectedFilters({...selectedFilters, sector: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 font-medium"
                  >
                    <option value="">All Sectors</option>
                    {getSectors().map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                {/* Stage Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Stage</label>
                  <select
                    value={selectedFilters.stage}
                    onChange={(e) => setSelectedFilters({...selectedFilters, stage: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 font-medium"
                  >
                    <option value="">All Stages</option>
                    {getStages().map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                {/* Analysis Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Analysis Status</label>
                  <select
                    value={selectedFilters.hasAnalysis}
                    onChange={(e) => setSelectedFilters({...selectedFilters, hasAnalysis: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 font-medium"
                  >
                    <option value="all">All Startups</option>
                    <option value="yes">With Analysis</option>
                    <option value="no">Without Analysis</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Startups Grid */}
        {filteredStartups.length === 0 ? (
          <div className="text-center py-16 relative z-10">
            <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl inline-block mb-6">
              <Building2 className="h-16 w-16 text-purple-600 mx-auto" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">No startups found</h3>
            <p className="text-gray-600 text-lg font-medium">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getVisibleStartups().map((startup) => (
                <StartupCard key={startup.id} startup={startup} getAnalysisCount={getAnalysisCount} getScoreColor={getScoreColor} onSelect={onStartupSelect} />
              ))}
            </div>
            
            {/* Lazy loading indicator and load more button */}
            {visibleCount < filteredStartups.length && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Load More Startups ({filteredStartups.length - visibleCount} remaining)
                </button>
              </div>
            )}
            
            {/* Background loading indicator */}
            {initialLoad && (
              <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2 z-50">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-200 border-t-purple-600"></div>
                <span className="text-sm text-gray-600">Loading real data...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const StartupCard = ({ startup, getAnalysisCount, getScoreColor, onSelect }) => {
  const analysisCount = getAnalysisCount(startup);
  const hasAnalysis = analysisCount > 0;
  
  const cardColors = [
    'from-pink-400 to-rose-500',
    'from-purple-400 to-indigo-500', 
    'from-blue-400 to-cyan-500',
    'from-emerald-400 to-teal-500',
    'from-yellow-400 to-orange-500',
    'from-red-400 to-pink-500'
  ];
  const randomColor = cardColors[startup.companyName?.length % cardColors.length || 0];

  return (
    <div className="group">
      {/* Chumbak inspired vibrant card design */}
      <div className={`bg-gradient-to-br ${randomColor} rounded-3xl p-1 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1`}>
        <div className="bg-white rounded-3xl p-8 h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-4 bg-gradient-to-br ${randomColor} rounded-3xl shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300`}>
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">{startup.companyName}</h3>
                <p className="text-sm font-bold text-gray-600 mt-1">{startup.sector}</p>
              </div>
            </div>
            {hasAnalysis && (
              <div className={`px-4 py-2 rounded-2xl text-sm font-black ${getScoreColor(startup.overallScore || 75)} shadow-lg transform -rotate-3`}>
                {startup.overallScore || 75}/100
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-base mb-6 leading-relaxed font-medium">
            {startup.description || 'No description available'}
          </p>

          {/* Stats with colorful icons */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="p-2 bg-pink-100 rounded-2xl mb-2 mx-auto w-fit">
                <Users className="h-5 w-5 text-pink-600" />
              </div>
              <div className="text-lg font-black text-gray-800">{startup.teamSize || 'N/A'}</div>
              <div className="text-xs font-bold text-gray-500">Team Size</div>
            </div>
            <div className="text-center">
              <div className="p-2 bg-blue-100 rounded-2xl mb-2 mx-auto w-fit">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-lg font-black text-gray-800">{startup.foundedYear || 'N/A'}</div>
              <div className="text-xs font-bold text-gray-500">Founded</div>
            </div>
            <div className="text-center">
              <div className="p-2 bg-purple-100 rounded-2xl mb-2 mx-auto w-fit">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-lg font-black text-gray-800">{analysisCount}</div>
              <div className="text-xs font-bold text-gray-500">Analyses</div>
            </div>
          </div>

          {/* Analysis Types Available - Chumbak style tags */}
          {hasAnalysis && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {startup.documentAnalysis && (
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-xs rounded-full font-bold shadow-sm">📄 Doc</span>
                )}
                {startup.emailAnalysis && (
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs rounded-full font-bold shadow-sm">📧 Email</span>
                )}
                {startup.callAnalysis && (
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs rounded-full font-bold shadow-sm">📞 Call</span>
                )}
                {startup.businessModelAnalysis && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-bold shadow-sm">💼 Business</span>
                )}
                {startup.marketIntelligenceAnalysis && (
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-400 to-blue-500 text-white text-xs rounded-full font-bold shadow-sm">📊 Market</span>
                )}
                {startup.riskAssessmentAnalysis && (
                  <span className="px-3 py-1 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs rounded-full font-bold shadow-sm">⚠️ Risk</span>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => onSelect(startup)}
            className={`w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r ${randomColor} text-white rounded-2xl hover:shadow-xl transition-all duration-300 font-black text-lg transform hover:scale-105 shadow-lg`}
          >
            <Eye className="h-5 w-5" />
            <span>View Analysis</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartupsPage;

