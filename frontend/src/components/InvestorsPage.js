import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Building2, Users, Calendar, Star, ChevronRight, Eye, BarChart3, DollarSign, Target, LogOut, Sparkles, Heart, Rocket, MapPin, Globe, Mail, Phone } from 'lucide-react';
import firebaseService from '../services/firebaseService';

const InvestorsPage = ({ user, userType, onLogout, onInvestorSelect }) => {
  const [investors, setInvestors] = useState([]);
  const [filteredInvestors, setFilteredInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: '',
    stage: '',
    industry: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8); // Show 8 items initially

  useEffect(() => {
    fetchInvestors();
  }, []);

  useEffect(() => {
    filterInvestors();
  }, [investors, searchTerm, selectedFilters]);

  // Show fallback data immediately to reduce perceived loading time
  const getFallbackInvestors = () => [
    {
      id: 'demo-1',
      firmName: 'Venture Capital Partners',
      investorType: 'VC',
      focusIndustries: ['Technology', 'Healthcare', 'Fintech'],
      investmentStages: ['Seed', 'Series A', 'Series B'],
      checkSizeRange: '₹50L - ₹5Cr',
      geographicFocus: ['North America', 'Europe'],
      portfolioSize: '50+',
      investmentThesis: 'We invest in early-stage companies with disruptive technology and strong founding teams.',
      yearsExperience: '15+',
      website: 'https://vcp.com',
      linkedin: 'https://linkedin.com/company/vcp',
      twitter: '@VCPartners',
      teamBackground: 'Former entrepreneurs and operators with deep industry expertise',
      previousNotableInvestments: 'Uber, Airbnb, Stripe, Zoom'
    },
    {
      id: 'demo-2',
      firmName: 'Angel Investors Network',
      investorType: 'Angel',
      focusIndustries: ['SaaS', 'E-commerce', 'AI/ML'],
      investmentStages: ['Pre-seed', 'Seed'],
      checkSizeRange: '₹2.5L - ₹25L',
      geographicFocus: ['North America'],
      portfolioSize: '25+',
      investmentThesis: 'Supporting innovative startups with scalable business models and passionate founders.',
      yearsExperience: '10+',
      website: 'https://angelnetwork.com',
      linkedin: 'https://linkedin.com/company/angelnetwork',
      twitter: '@AngelNetwork',
      teamBackground: 'Successful entrepreneurs and industry veterans',
      previousNotableInvestments: 'Slack, Notion, Figma'
    },
    {
      id: 'demo-3',
      firmName: 'Growth Equity Fund',
      investorType: 'Growth Equity',
      focusIndustries: ['Enterprise Software', 'Cybersecurity', 'Cloud Infrastructure'],
      investmentStages: ['Series B', 'Series C', 'Growth'],
      checkSizeRange: '₹1Cr - ₹5Cr',
      geographicFocus: ['Global'],
      portfolioSize: '30+',
      investmentThesis: 'Partnering with market-leading companies to accelerate growth and scale globally.',
      yearsExperience: '20+',
      website: 'https://growthequity.com',
      linkedin: 'https://linkedin.com/company/growthequity',
      twitter: '@GrowthEquity',
      teamBackground: 'Former Fortune 500 executives and investment professionals',
      previousNotableInvestments: 'Salesforce, ServiceNow, CrowdStrike'
    },
    {
      id: 'demo-4',
      firmName: 'Impact Investment Group',
      investorType: 'Impact Investor',
      focusIndustries: ['Clean Energy', 'Education', 'Healthcare'],
      investmentStages: ['Seed', 'Series A'],
      checkSizeRange: '₹25L - ₹2Cr',
      geographicFocus: ['Asia', 'Africa'],
      portfolioSize: '15+',
      investmentThesis: 'Investing in companies that create positive social and environmental impact.',
      yearsExperience: '8+',
      website: 'https://impactgroup.com',
      linkedin: 'https://linkedin.com/company/impactgroup',
      twitter: '@ImpactGroup',
      teamBackground: 'Social entrepreneurs and impact measurement experts',
      previousNotableInvestments: 'SolarCity, Khan Academy, One Acre Fund'
    }
  ];

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      setInitialLoad(true);
      
      console.log('🔄 Fetching investors from Firestore...');
      
      // Try Firestore first
      const firestoreInvestors = await firebaseService.getAllInvestors();
      console.log('👥 Firestore investors:', firestoreInvestors);
      
      if (firestoreInvestors && firestoreInvestors.length > 0) {
        setInvestors(firestoreInvestors);
      } else {
        console.log('⚠️ No investors in Firestore, using fallback data');
        // Only show fallback data if Firestore is empty
        const fallbackData = getFallbackInvestors();
        setInvestors(fallbackData);
      }
    } catch (error) {
      console.error('❌ Error fetching investors:', error);
      // Show fallback data on error
      const fallbackData = getFallbackInvestors();
      setInvestors(fallbackData);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const filterInvestors = () => {
    let filtered = investors.filter(investor => {
      const matchesSearch = investor.firmName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           investor.investmentThesis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           investor.focusIndustries?.some(industry => 
                             industry.toLowerCase().includes(searchTerm.toLowerCase())
                           );
      
      const matchesType = !selectedFilters.type || investor.investorType === selectedFilters.type;
      const matchesStage = !selectedFilters.stage || investor.investmentStages?.includes(selectedFilters.stage);
      const matchesIndustry = !selectedFilters.industry || investor.focusIndustries?.includes(selectedFilters.industry);
      
      return matchesSearch && matchesType && matchesStage && matchesIndustry;
    });
    
    setFilteredInvestors(filtered);
  };

  // Load more items for lazy loading
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, filteredInvestors.length));
  };

  // Get visible investors for lazy loading
  const getVisibleInvestors = () => {
    return filteredInvestors.slice(0, visibleCount);
  };

  const getInvestorTypes = () => {
    const types = [...new Set(investors.map(investor => investor.investorType).filter(Boolean))];
    return types.sort();
  };

  const getStages = () => {
    const stages = [...new Set(investors.flatMap(investor => investor.investmentStages || []))];
    return stages.sort();
  };

  const getIndustries = () => {
    const industries = [...new Set(investors.flatMap(investor => investor.focusIndustries || []))];
    return industries.sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading investors...</p>
        </div>
      </div>
    );
  }

  if (loading && investors.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        {/* Floating gradient shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading investors...</p>
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

      {/* Header */}
      <div className="relative z-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-12">
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl shadow-xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-gray-900">All Investors</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-gray-600 text-xl">Discover and connect with investors</p>
                    <Sparkles className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl px-6 py-3 shadow-lg">
                <div className="text-lg font-black text-blue-700">
                  {filteredInvestors.length} of {investors.length}
                </div>
                <div className="text-sm text-blue-600 font-medium">investors found</div>
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
        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-black text-gray-700 mb-3">Search Investors</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by firm name, thesis, or industries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-lg font-medium hover:border-blue-300 shadow-sm"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-3 px-8 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 font-bold shadow-lg hover:shadow-xl ${
                  showFilters 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-2 border-blue-400' 
                    : 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-2 border-blue-200 hover:from-blue-100 hover:to-cyan-100'
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
            <div className="mt-8 pt-8 border-t-2 border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Investor Type</label>
                  <select
                    value={selectedFilters.type}
                    onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 font-medium"
                  >
                    <option value="">All Types</option>
                    {getInvestorTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Stage Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Investment Stage</label>
                  <select
                    value={selectedFilters.stage}
                    onChange={(e) => setSelectedFilters({...selectedFilters, stage: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 font-medium"
                  >
                    <option value="">All Stages</option>
                    {getStages().map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Focus Industry</label>
                  <select
                    value={selectedFilters.industry}
                    onChange={(e) => setSelectedFilters({...selectedFilters, industry: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 font-medium"
                  >
                    <option value="">All Industries</option>
                    {getIndustries().map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Investors Grid */}
        {filteredInvestors.length === 0 ? (
          <div className="text-center py-16 relative z-10">
            <div className="p-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl inline-block mb-6">
              <TrendingUp className="h-16 w-16 text-blue-600 mx-auto" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">No investors found</h3>
            <p className="text-gray-600 text-lg font-medium">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getVisibleInvestors().map((investor) => (
                <InvestorCard key={investor.id} investor={investor} onSelect={onInvestorSelect} />
              ))}
            </div>
            
            {/* Lazy loading indicator and load more button */}
            {visibleCount < filteredInvestors.length && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Load More Investors ({filteredInvestors.length - visibleCount} remaining)
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

const InvestorCard = ({ investor, onSelect }) => {
  const cardColors = [
    'from-blue-400 to-cyan-500',
    'from-purple-400 to-indigo-500', 
    'from-emerald-400 to-teal-500',
    'from-yellow-400 to-orange-500',
    'from-pink-400 to-rose-500',
    'from-red-400 to-pink-500'
  ];
  const randomColor = cardColors[investor.firmName?.length % cardColors.length || 0];

  return (
    <div className="group">
      <div className={`bg-gradient-to-br ${randomColor} rounded-3xl p-1 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1`}>
        <div className="bg-white rounded-3xl p-8 h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-4 bg-gradient-to-br ${randomColor} rounded-3xl shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300`}>
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">{investor.firmName}</h3>
                <p className="text-sm font-bold text-gray-600 mt-1">{investor.investorType}</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-2xl text-sm font-black shadow-lg transform -rotate-3">
              {investor.portfolioSize}
            </div>
          </div>

          {/* Investment Thesis */}
          <p className="text-gray-600 text-base mb-6 leading-relaxed font-medium">
            {investor.investmentThesis}
          </p>

          {/* Key Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="p-2 bg-blue-100 rounded-2xl mb-2 mx-auto w-fit">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-lg font-black text-gray-800">{investor.checkSizeRange}</div>
              <div className="text-xs font-bold text-gray-500">Check Size</div>
            </div>
            <div className="text-center">
              <div className="p-2 bg-purple-100 rounded-2xl mb-2 mx-auto w-fit">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-lg font-black text-gray-800">{investor.yearsExperience}</div>
              <div className="text-xs font-bold text-gray-500">Experience</div>
            </div>
          </div>

          {/* Focus Industries */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {investor.focusIndustries?.slice(0, 3).map((industry, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-xs rounded-full font-bold shadow-sm">
                  {industry}
                </span>
              ))}
              {investor.focusIndustries?.length > 3 && (
                <span className="px-3 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs rounded-full font-bold shadow-sm">
                  +{investor.focusIndustries.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Investment Stages */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {investor.investmentStages?.map((stage, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs rounded-full font-bold shadow-sm">
                  {stage}
                </span>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onSelect(investor)}
            className={`w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r ${randomColor} text-white rounded-2xl hover:shadow-xl transition-all duration-300 font-black text-lg transform hover:scale-105 shadow-lg`}
          >
            <Eye className="h-5 w-5" />
            <span>View Details</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestorsPage;