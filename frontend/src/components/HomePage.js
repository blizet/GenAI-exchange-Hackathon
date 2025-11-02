import React, { useState, useCallback, useMemo, memo, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, TrendingUp, Users, Star, ChevronRight, Eye, BarChart3, Shield, Target, DollarSign, CheckCircle, Sparkles, Zap, Heart, Rocket, MessageCircle } from 'lucide-react';
import MeetingScheduler from './MeetingScheduler';
// Assuming these are custom components you have
import firebaseService from '../services/firebaseService';
import { populateSampleData } from '../utils/populateSampleData';
import LoadingSpinner from './LoadingSpinner';

// Lazy load sections for better performance
const StartupSection = lazy(() => Promise.resolve({
  default: ({ startups, mappedStartups, getScoreColor, handleStartupCardSelect, handleRequestMeeting, handleStartupsClick, handlePopulateSampleData }) => (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6">
            Featured Startups
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Discover promising investment opportunities with comprehensive AI analysis
          </p>
        </div>
        
        {mappedStartups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mappedStartups.map((startup) => (
              <StartupCard 
                key={startup.id} 
                startup={startup} 
                getScoreColor={getScoreColor} 
                onSelect={handleStartupCardSelect}
                onRequestMeeting={handleRequestMeeting}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-6">No startups available at the moment</p>
            <button
              onClick={handlePopulateSampleData}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg  transform hover:scale-105"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Add Sample Data
            </button>
          </div>
        )}
        
        <div className="text-center mt-16">
          <button
            onClick={handleStartupsClick}
            className="inline-flex items-center px-8 py-4 bg-white border-3 border-purple-300 text-purple-700 font-bold rounded-2xl hover:border-purple-500 hover:bg-purple-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            View All Startups
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}));

const InvestorSection = lazy(() => Promise.resolve({
  default: ({ investors, mappedInvestors, handleInvestorCardSelect, handleRequestMeeting, handleInvestorsClick, handlePopulateSampleData }) => (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6">
            Featured Investors
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Connect with experienced investors seeking innovative opportunities
          </p>
        </div>
        
        {mappedInvestors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mappedInvestors.map((investor) => (
              <InvestorCard 
                key={investor.id} 
                investor={investor} 
                onSelect={handleInvestorCardSelect}
                onRequestMeeting={handleRequestMeeting}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-6">No investors available at the moment</p>
            <button
              onClick={handlePopulateSampleData}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-2xl hover:shadow-lg  transform hover:scale-105"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Add Sample Data
            </button>
          </div>
        )}
        
        <div className="text-center mt-16">
          <button
            onClick={handleInvestorsClick}
            className="inline-flex items-center px-8 py-4 bg-white border-3 border-purple-300 text-purple-700 font-bold rounded-2xl hover:border-purple-500 hover:bg-purple-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            View All Investors
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}));

// Memoized components for better performance
const StartupCard = memo(({ startup, onSelect, getScoreColor, onRequestMeeting }) => {
  const cardColors = [
    'from-pink-400 to-rose-500'
  ];
  const randomColor = cardColors[Math.floor(Math.random() * cardColors.length)];

  return (
    <div className="group" onClick={() => onSelect(startup)}>
      <div className={`bg-gradient-to-br ${randomColor} rounded-3xl p-1 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1`}>
        <div className="bg-white rounded-3xl p-8 h-full">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-gradient-to-br ${randomColor} rounded-2xl shadow-lg`}>
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{startup.companyName}</h3>
                <p className="text-sm font-bold text-gray-600">{startup.sector}</p>
              </div>
            </div>
            {startup.overallScore && (
              <div className={`px-4 py-2 rounded-full text-sm font-black ${getScoreColor(startup.overallScore)} shadow-lg`}>
                {startup.overallScore}/100
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed font-medium">
            {startup.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-pink-100 rounded-lg">
                  <Users className="h-4 w-4 text-pink-600" />
                </div>
                <span className="font-bold text-gray-700">{startup.teamSize} team</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-yellow-100 rounded-lg">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="font-bold text-gray-700">{startup.stage}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(startup);
                }}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r ${randomColor} text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                <span>View Details</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestMeeting(startup, 'startup');
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border-2 border-pink-200 text-pink-600 font-bold rounded-2xl hover:bg-pink-50 hover:border-pink-300 transition-all duration-300"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Request Meeting</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const InvestorCard = memo(({ investor, onSelect, onRequestMeeting }) => {
  const cardColors = [
    'from-blue-400 to-indigo-500',
  ];
  const randomColor = cardColors[Math.floor(Math.random() * cardColors.length)];

  return (
    <div className="group" onClick={() => onSelect(investor)}>
      <div className={`bg-gradient-to-br ${randomColor} rounded-3xl p-1 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:-rotate-1`}>
        <div className="bg-white rounded-3xl p-8 h-full">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`p-3 bg-gradient-to-br ${randomColor} rounded-2xl shadow-lg`}>
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">{investor.company}</h3>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed font-medium">
            {investor.bio}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="font-bold text-gray-700">{investor.investmentRange}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-100 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-bold text-gray-700 text-xs">{investor.sectors.join(', ')}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(investor);
              }}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r ${randomColor} text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
            >
              <span>View Profile</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRequestMeeting(investor, 'investor');
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple-600 font-bold rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Request Meeting</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const HomePage = memo(({ user, userType, onLogin, onStartupSelect, onInvestorSelect }) => {
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Meeting scheduler state
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [selectedMeetingTarget, setSelectedMeetingTarget] = useState(null);

  // Fetch real data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching real data from Firestore...');
        
        // Try to fetch real data first
        try {
          console.log('🔄 Attempting to fetch from Firestore...');
          const [startupsData, investorsData] = await Promise.all([
            firebaseService.getAllStartups(),
            firebaseService.getAllInvestors()
          ]);
          
          console.log('📊 Startups data received:', startupsData);
          console.log('👥 Investors data received:', investorsData);
          console.log('📊 Startups count:', startupsData?.length || 0);
          console.log('👥 Investors count:', investorsData?.length || 0);
          
          // Use real data if available, otherwise use fallback
          if (startupsData && startupsData.length > 0) {
            console.log('✅ Using real startup data');
            setStartups(startupsData.slice(0, 3));
          } else {
            console.log('⚠️ No real startup data, using fallback');
            // Fallback data only if no real data
            setStartups([
              {
                id: 'demo-1',
                companyName: 'TechFlow AI',
                industry: 'Technology',
                description: 'Revolutionary AI-powered workflow automation platform for enterprises',
                teamSize: '25-50',
                stage: 'Series A',
                overallScore: 85
              },
              {
                id: 'demo-2',
                companyName: 'GreenEnergy Solutions',
                industry: 'Clean Energy',
                description: 'Sustainable energy solutions for smart cities and industrial applications',
                teamSize: '10-25',
                stage: 'Seed',
                overallScore: 78
              },
              {
                id: 'demo-3',
                companyName: 'HealthTech Innovations',
                industry: 'Healthcare',
                description: 'AI-driven diagnostic tools for early disease detection and prevention',
                teamSize: '50-100',
                stage: 'Series B',
                overallScore: 92
              }
            ]);
          }
          
          if (investorsData && investorsData.length > 0) {
            console.log('✅ Using real investor data');
            setInvestors(investorsData.slice(0, 2));
          } else {
            console.log('⚠️ No real investor data, using fallback');
            // Fallback data only if no real data
            setInvestors([
              {
                id: 'demo-1',
                firmName: 'Venture Capital Partners',
                investmentThesis: 'We invest in early-stage companies with disruptive technology and strong founding teams.',
                checkSizeRange: '₹50L - ₹5Cr',
                focusIndustries: ['Technology', 'Healthcare', 'Fintech']
              },
              {
                id: 'demo-2',
                firmName: 'Angel Investors Network',
                investmentThesis: 'Supporting innovative startups with scalable business models and passionate founders.',
                checkSizeRange: '₹2.5L - ₹25L',
                focusIndustries: ['SaaS', 'E-commerce', 'AI/ML']
              }
            ]);
          }
        } catch (firebaseError) {
          console.error('❌ Firebase fetch failed:', firebaseError);
          console.error('❌ Error details:', firebaseError.message);
          console.error('❌ Error code:', firebaseError.code);
          
          // Set fallback data only on error
          setStartups([
            {
              id: 'demo-1',
              companyName: 'TechFlow AI',
              industry: 'Technology',
              description: 'Revolutionary AI-powered workflow automation platform for enterprises',
              teamSize: '25-50',
              stage: 'Series A',
              overallScore: 85
            },
            {
              id: 'demo-2',
              companyName: 'GreenEnergy Solutions',
              industry: 'Clean Energy',
              description: 'Sustainable energy solutions for smart cities and industrial applications',
              teamSize: '10-25',
              stage: 'Seed',
              overallScore: 78
            },
            {
              id: 'demo-3',
              companyName: 'HealthTech Innovations',
              industry: 'Healthcare',
              description: 'AI-driven diagnostic tools for early disease detection and prevention',
              teamSize: '50-100',
              stage: 'Series B',
              overallScore: 92
            }
          ]);
          
          setInvestors([
            {
              id: 'demo-1',
              firmName: 'Venture Capital Partners',
              investmentThesis: 'We invest in early-stage companies with disruptive technology and strong founding teams.',
              checkSizeRange: '₹50L - ₹5Cr',
              focusIndustries: ['Technology', 'Healthcare', 'Fintech']
            },
            {
              id: 'demo-2',
              firmName: 'Angel Investors Network',
              investmentThesis: 'Supporting innovative startups with scalable business models and passionate founders.',
              checkSizeRange: '₹2.5L - ₹25L',
              focusIndustries: ['SaaS', 'E-commerce', 'AI/ML']
            }
          ]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error in fetchData:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getScoreColor = useCallback((score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-100 border border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-100 border border-amber-200';
    return 'text-rose-700 bg-rose-100 border border-rose-200';
  }, []);

  // Map Firestore data to component format
  const mappedStartups = useMemo(() => {
    return startups.map(startup => ({
      id: startup.id,
      companyName: startup.companyName || startup.name || 'Unnamed Company',
      sector: startup.industry || startup.sector || 'Technology',
      description: startup.description || 'No description available',
      teamSize: startup.teamSize || 'Unknown',
      stage: startup.stage || 'Unknown',
      overallScore: startup.overallScore || 0
    }));
  }, [startups]);

  const mappedInvestors = useMemo(() => {
    return investors.map(investor => ({
      id: investor.id,
      name: investor.name || 'Anonymous',
      company: investor.firmName || 'Unknown Firm',
      bio: investor.investmentThesis || investor.bio || 'No bio available',
      investmentRange: investor.checkSizeRange || 'Not specified',
      sectors: investor.focusIndustries || []
    }));
  }, [investors]);

  const handleDashboardClick = useCallback(() => {
    if (user) {
      navigate(userType === 'startup' ? '/startup-dashboard' : '/startups');
    } else {
      onLogin();
    }
  }, [user, userType, navigate, onLogin]);

  const handleStartupsClick = useCallback(() => {
    navigate('/startups');
  }, [navigate]);

  const handleInvestorsClick = useCallback(() => {
    navigate('/investors');
  }, [navigate]);

  const handleContactClick = useCallback(() => {
    navigate('/contact');
  }, [navigate]);

  const handleInvestorCardSelect = useCallback((investor) => {
    navigate('/investors');
    // Optional: Call a prop function if you want parent to handle selection
    if (onInvestorSelect) {
      onInvestorSelect(investor);
    }
  }, [navigate, onInvestorSelect]);

  const handleRequestMeeting = useCallback((target, targetType) => {
    if (!user) {
      onLogin();
      return;
    }
    
    setSelectedMeetingTarget({
      id: target.id,
      name: target.name || target.companyName,
      type: targetType
    });
    setShowMeetingScheduler(true);
  }, [user, onLogin]);

  const handleMeetingCreated = useCallback((meeting) => {
    console.log('Meeting created:', meeting);
    // You can add a success notification here
  }, []);

  const handleStartupCardSelect = useCallback((startup) => {
    if (onStartupSelect) {
      onStartupSelect(startup);
    }
    // Optional: You can navigate here if needed
  }, [onStartupSelect]);

  const handlePopulateSampleData = useCallback(async () => {
    try {
      console.log('🔄 Populating sample data...');
      const success = await populateSampleData();
      if (success) {
        console.log('✅ Sample data populated successfully!');
        // Refresh the data
        window.location.reload();
      } else {
        console.error('❌ Failed to populate sample data');
      }
    } catch (error) {
      console.error('❌ Error populating sample data:', error);
    }
  }, []);


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-left">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-pink-100 border border-pink-200 text-gray-700 text-sm font-semibold mb-8 shadow-sm">
              <Sparkles className="h-4 w-4 mr-2 text-pink-500" />
              AI-Powered Investment Intelligence Platform
              <Heart className="h-4 w-4 ml-2 text-pink-500" />
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
              Intelligent investment
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"> analysis</span>
              <br />
              for modern investors
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl leading-relaxed py-0">
              Leverage our advanced AI platform to evaluate startups faster, identify promising opportunities, and make data-driven investment decisions with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleDashboardClick}
                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-bold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                {user ? (userType === 'startup' ? 'Go to Dashboard' : 'Explore Startups') : 'Get Started'}
                <Rocket className="ml-3 h-6 w-6" />
              </button>
              
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                Flexible plans with no long-term commitment
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              How our platform works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Three simple steps to comprehensive startup analysis and investment insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transform group-hover:scale-105 transition-all duration-500 border-4 border-white">
                  <Building2 className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 border border-pink-100 group-hover:border-pink-200 transition-all duration-300">
                <h3 className="text-2xl font-black text-gray-900 mb-4">Submit Materials</h3>
                <p className="text-gray-600 leading-relaxed">Startups upload their business plans, financials, and pitch decks for comprehensive evaluation.</p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transform group-hover:scale-105 transition-all duration-500 border-4 border-white">
                  <Zap className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-100 group-hover:border-purple-200 transition-all duration-300">
                <h3 className="text-2xl font-black text-gray-900 mb-4">AI Analysis</h3>
                <p className="text-gray-600 leading-relaxed">Our specialized AI algorithms analyze business models, market potential, and financial viability.</p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transform group-hover:scale-105 transition-all duration-500 border-4 border-white">
                  <TrendingUp className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full animate-ping"></div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 group-hover:border-emerald-200 transition-all duration-300">
                <h3 className="text-2xl font-black text-gray-900 mb-4">Receive Insights</h3>
                <p className="text-gray-600 leading-relaxed">Investors get detailed reports with investment recommendations and risk assessments.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Startups Section */}
      <Suspense fallback={
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6">
                Featured Startups
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
                Discover promising investment opportunities with comprehensive AI analysis
              </p>
            </div>
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </section>
      }>
        <StartupSection 
          startups={startups}
          mappedStartups={mappedStartups}
          getScoreColor={getScoreColor}
          handleStartupCardSelect={handleStartupCardSelect}
          handleRequestMeeting={handleRequestMeeting}
          handleStartupsClick={handleStartupsClick}
          handlePopulateSampleData={handlePopulateSampleData}
        />
      </Suspense>

      {/* Explore Investors Section */}
      <Suspense fallback={
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6">
                Featured Investors
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
                Connect with experienced investors seeking innovative opportunities
              </p>
            </div>
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </section>
      }>
        <InvestorSection 
          investors={investors}
          mappedInvestors={mappedInvestors}
          handleInvestorCardSelect={handleInvestorCardSelect}
          handleRequestMeeting={handleRequestMeeting}
          handleInvestorsClick={handleInvestorsClick}
          handlePopulateSampleData={handlePopulateSampleData}
        />
      </Suspense>

      {/* Features section */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Platform Advantages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Why leading investors and startups choose our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200 group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Comprehensive<br/>Analysis</h3>
              <p className="text-gray-600 leading-relaxed">Detailed evaluation of business models, financials, market potential, and team strength.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-purple-200 group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Rapid<br/>Evaluation</h3>
              <p className="text-gray-600 leading-relaxed">Receive detailed analysis reports within 48 hours, accelerating your investment process.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-emerald-200 group">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Risk<br/>Assessment</h3>
              <p className="text-gray-600 leading-relaxed">Identify potential risks and challenges with our sophisticated risk evaluation algorithms.</p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-orange-200 group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Market<br/>Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">Access detailed market analysis, competitive landscape, and growth potential assessments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-pink-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full opacity-10 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full opacity-10 animate-pulse"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-8">
            Transform your investment process
          </h2>
          <p className="text-xl text-pink-100 mb-12 font-medium leading-relaxed">
            Access AI-powered analysis capabilities that were previously only available to large venture firms. 
            Make data-driven investment decisions with confidence and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={onLogin}
              className="inline-flex items-center px-10 py-5 bg-white text-purple-600 font-black text-lg rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              Get Started
              <ArrowRight className="ml-3 h-6 w-6" />
            </button>
            <button 
              onClick={handleContactClick}
              className="inline-flex items-center px-10 py-5 border-2 border-white text-white font-black text-lg rounded-2xl hover:bg-white hover:text-purple-600 transition-all duration-300 shadow-xl transform hover:-translate-y-1"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Meeting Scheduler Modal */}
      {showMeetingScheduler && selectedMeetingTarget && (
        <MeetingScheduler
          isOpen={showMeetingScheduler}
          onClose={() => {
            setShowMeetingScheduler(false);
            setSelectedMeetingTarget(null);
          }}
          requesterId={user?.uid || 'demo-user'}
          requesterType={userType || 'startup'}
          recipientId={selectedMeetingTarget.id}
          recipientType={selectedMeetingTarget.type}
          recipientName={selectedMeetingTarget.name}
          onMeetingCreated={handleMeetingCreated}
        />
      )}
    </div>
  );
});

export default HomePage;