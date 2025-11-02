import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Building2, TrendingUp, LogOut, User, Sparkles, Rocket, Heart, ChevronDown, FileText, DollarSign, BookOpen, Phone, Settings, BarChart3, MessageSquare, Calendar, Search } from 'lucide-react';

const Navbar = ({ user, userType, onLogout, currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const exploreRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target)) {
        setExploreOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
    { name: 'Explore', href: '#', current: false, hasDropdown: true },
  ];

  const exploreItems = [
    { name: 'Startups', href: '/startups', icon: Building2 },
    { name: 'Investors', href: '/investors', icon: TrendingUp },
    { name: 'Resources', href: '/resources', icon: BookOpen },
  ];

  const handleNavClick = (href) => {
    if (href === '/') {
      navigate('/');
    } else if (href === '/startups') {
      navigate(userType === 'startup' ? '/startup-dashboard' : '/startups');
    } else if (href === '/investors') {
      navigate(userType === 'investor' ? '/investor-dashboard' : '/investors');
    } else if (href === '/about' || href === '/resources') {
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    return userType === 'startup' ? '/startup-dashboard' : '/investor-dashboard';
  };

  return (
    <nav className="bg-white shadow-xl border-b-2 border-purple-100 sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300 border-2 border-white">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900 flex items-center space-x-1">
                  <span>InvestAI</span>
                  <Sparkles className="h-5 w-5 text-pink-500" />
                </span>
                <p className="text-xs text-purple-600 font-bold">AI-Powered Investment Platform</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {navigation.map((item) => (
                <div key={item.name} className="relative" ref={item.hasDropdown ? exploreRef : null}>
                  {item.hasDropdown ? (
                    <button
                      onClick={() => setExploreOpen(!exploreOpen)}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-1 ${
                        item.current
                          ? 'text-white bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg border-2 border-purple-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-2 border-transparent hover:border-purple-200'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                        item.current
                          ? 'text-white bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg border-2 border-purple-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-2 border-transparent hover:border-purple-200'
                      }`}
                    >
                      {item.name}
                    </button>
                  )}
                  
                  {/* Explore Dropdown */}
                  {item.hasDropdown && exploreOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border-2 border-purple-100 py-2 z-50">
                      {exploreItems.map((exploreItem) => {
                        const IconComponent = exploreItem.icon;
                        return (
                          <button
                            key={exploreItem.name}
                            onClick={() => {
                              handleNavClick(exploreItem.href);
                              setExploreOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
                          >
                            <IconComponent className="h-4 w-4 mr-3 text-purple-600" />
                            {exploreItem.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Dashboard Link */}
                  <button
                    onClick={() => navigate(getDashboardLink())}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl px-4 py-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-purple-100">
                        {userType === 'startup' ? (
                          <Building2 className="h-4 w-4 text-purple-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-pink-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-gray-900">
                          {user.displayName || user.email}
                        </span>
                        <p className="text-xs text-purple-600 font-semibold">
                          {userType === 'startup' ? 'Startup' : 'Investor'}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {/* Profile Dropdown Menu */}
                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border-2 border-purple-100 py-2 z-50">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                          {userType === 'startup' ? 'Startup Account' : 'Investor Account'}
                        </div>
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setProfileOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
                        >
                          <User className="h-4 w-4 mr-3 text-purple-600" />
                          Profile Settings
                        </button>
                        <button
                          onClick={() => {
                            navigate('/meetings');
                            setProfileOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
                        >
                          <Calendar className="h-4 w-4 mr-3 text-purple-600" />
                          Meetings
                        </button>
                        <button
                          onClick={() => {
                            navigate('/messages');
                            setProfileOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
                        >
                          <MessageSquare className="h-4 w-4 mr-3 text-purple-600" />
                          Messages
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={onLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-bold transition-colors duration-300 hover:bg-gray-50 rounded-2xl border-2 border-transparent hover:border-gray-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-2xl text-sm font-black hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-purple-300 flex items-center space-x-2"
                  >
                    <span>Get Started</span>
                    <Rocket className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-2xl text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-300 border-2 border-gray-200 hover:border-purple-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-6 space-y-3 bg-gradient-to-b from-white to-purple-50 border-t-2 border-purple-100 shadow-xl">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.hasDropdown ? (
                  <div>
                    <button
                      onClick={() => setExploreOpen(!exploreOpen)}
                      className={`block w-full text-left px-4 py-3 rounded-2xl text-base font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-between ${
                        item.current
                          ? 'text-white bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg border-2 border-purple-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 border-2 border-transparent hover:border-purple-200'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {exploreOpen && (
                      <div className="ml-4 mt-2 space-y-2">
                        {exploreItems.map((exploreItem) => {
                          const IconComponent = exploreItem.icon;
                          return (
                            <button
                              key={exploreItem.name}
                              onClick={() => {
                                handleNavClick(exploreItem.href);
                                setExploreOpen(false);
                              }}
                              className="flex items-center w-full text-left px-4 py-2 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
                            >
                              <IconComponent className="h-4 w-4 mr-3 text-purple-600" />
                              {exploreItem.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className={`block w-full text-left px-4 py-3 rounded-2xl text-base font-bold transition-all duration-300 transform hover:scale-105 ${
                      item.current
                        ? 'text-white bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg border-2 border-purple-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 border-2 border-transparent hover:border-purple-200'
                    }`}
                  >
                    {item.name}
                  </button>
                )}
              </div>
            ))}
            
            {user ? (
              <div className="pt-6 pb-3 border-t-2 border-purple-200 space-y-4">
                <div className="flex items-center px-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-purple-100">
                    {userType === 'startup' ? (
                      <Building2 className="h-5 w-5 text-purple-600" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-pink-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-black text-gray-800">
                      {user.displayName || user.email}
                    </div>
                    <div className="text-sm text-purple-600 font-bold">
                      {userType === 'startup' ? 'Startup' : 'Investor'}
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Link */}
                <button
                  onClick={() => {
                    navigate(getDashboardLink());
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-base font-bold text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
                >
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </button>
                
                {/* Profile Options */}
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-base font-bold text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/meetings');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-base font-bold text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Meetings</span>
                  </div>
                </button>
                
                <button
                  onClick={onLogout}
                  className="block w-full text-left px-4 py-3 text-base font-bold text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-red-300"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="pt-6 pb-3 border-t-2 border-purple-200 space-y-3">
                <button
                  onClick={() => navigate('/auth')}
                  className="block w-full text-left px-4 py-3 text-base font-bold text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="block w-full text-left px-4 py-3 text-base font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-purple-300 flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <Rocket className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

