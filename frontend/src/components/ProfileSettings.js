import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Settings, Building2, TrendingUp, Save, Edit3, 
  CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff,
  Mail, Phone, Globe, MapPin, Calendar, Briefcase,
  Target, DollarSign, Users, FileText, Shield, Star, Bell
} from 'lucide-react';
import { createStartupProfile, createInvestorProfile } from '../services/api';
import firebaseService from '../services/firebaseService';
import StartupOnboarding from './StartupOnboarding';
import InvestorOnboarding from './InvestorOnboarding';

const ProfileSettings = ({ user, userType, onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Refs to track component mount state and timers
  const isMountedRef = useRef(true);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    loadProfileData();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [user, userType]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      if (!user || !userType) {
        console.log('No user or userType available');
        return;
      }

      let profileData = null;
      
      if (userType === 'startup') {
        profileData = await firebaseService.findStartupByUserId(user.uid);
        console.log('📊 [PROFILE] Loaded startup data:', profileData);
      } else if (userType === 'investor') {
        profileData = await firebaseService.findInvestorByUserId(user.uid);
        console.log('📊 [PROFILE] Loaded investor data:', profileData);
      }
      
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;
      
      if (profileData) {
        setProfileData(profileData);
        setShowOnboarding(!profileData.isComplete);
      } else {
        // No profile found, show onboarding
        const defaultData = {
          userEmail: user.email,
          isComplete: false
        };
        setProfileData(defaultData);
        setShowOnboarding(true);
      }
      
    } catch (error) {
      console.error('Error loading profile:', error);
      
      if (!isMountedRef.current) return;
      
      setMessage({ type: 'error', text: 'Failed to load profile data' });
      setProfileData({ userEmail: user?.email, isComplete: false });
      setShowOnboarding(true);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleOnboardingComplete = async (data) => {
      try {
        setSaving(true);
        
        // Check if user is authenticated
        if (!user || !user.uid) {
          setMessage({ 
            type: 'error', 
            text: 'You must be logged in to save your profile. Please log in and try again.' 
          });
          return;
        }
        
        // Prepare data with required userId
        const profileDataWithUser = {
          ...data,
          userId: user.uid,
          userEmail: user.email,
          displayName: user.displayName,
          isComplete: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('📤 Sending profile data:', profileDataWithUser);

        // Save to Firebase
        let savedId;
        if (userType === 'startup') {
          savedId = await firebaseService.saveStartup(profileDataWithUser);
        } else {
          savedId = await firebaseService.saveInvestor(profileDataWithUser);
        }
        
        if (!savedId) {
          throw new Error('Failed to save profile - no ID returned');
        }

        console.log('✅ Profile saved with ID:', savedId);
        
        // Update local state with saved data
        setProfileData({ 
          ...profileData, 
          ...profileDataWithUser,
          id: savedId
        });
        
        setShowOnboarding(false);
        setIsEditing(false);
        setMessage({ 
          type: 'success', 
          text: 'Profile saved successfully! Redirecting to your dashboard...' 
        });
        
        // Set up redirect
        redirectTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          
          if (userType === 'startup') {
            navigate('/startup-dashboard');
          } else if (userType === 'investor') {
            navigate('/investor-dashboard');
          }
        }, 2000);
        
      } catch (error) {
        console.error('Error saving profile:', error);
        
        setMessage({ 
          type: 'error', 
          text: error.message || 'Failed to save profile. Please try again.' 
        });
      } finally {
        setSaving(false);
      }
    };

  const handleEditProfile = () => {
    setIsEditing(true);
    setShowOnboarding(true);
  };

  const handleCancelOnboarding = () => {
    setShowOnboarding(false);
    setIsEditing(false);
    // Clear any error messages
    setMessage({ type: '', text: '' });
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    {userType === 'startup' ? (
                      <Building2 className="h-8 w-8 text-white" />
                    ) : (
                      <TrendingUp className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white">
                      {isEditing ? 'Edit Profile' : 'Complete Your Profile'}
                    </h1>
                    <p className="text-white/80 text-lg">
                      {isEditing 
                        ? 'Update your profile information' 
                        : 'Help us understand your business better'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelOnboarding}
                  className="text-white/80 hover:text-white transition-colors"
                  disabled={saving}
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8">
              {userType === 'startup' ? (
                <StartupOnboarding 
                  onComplete={handleOnboardingComplete}
                  onBack={handleCancelOnboarding}
                  initialData={profileData}
                  isSubmitting={saving}
                />
              ) : (
                <InvestorOnboarding 
                  onComplete={handleOnboardingComplete}
                  onBack={handleCancelOnboarding}
                  initialData={profileData}
                  isSubmitting={saving}
                />
              )}
            </div>
          </div>
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
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900">Profile Settings</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-gray-600 text-lg">
                      {userType === 'startup' ? 'Startup Profile' : 'Investor Profile'}
                    </p>
                    {profileData?.isComplete && (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleEditProfile}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold"
              >
                <Edit3 className="h-5 w-5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl ${
            message.type === 'success' 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-bold">{message.text}</span>
            </div>
          </div>
        )}

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
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile Completion Status */}
                {!profileData?.isComplete && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                      <div>
                        <h3 className="text-lg font-black text-amber-800">Profile Incomplete</h3>
                        <p className="text-amber-700 font-medium">
                          Complete your profile to get the most out of the platform
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleEditProfile}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold"
                    >
                      Complete Profile
                    </button>
                  </div>
                )}

                {/* Basic Information */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <User className="h-6 w-6 text-purple-600" />
                    <span>Basic Information</span>
                  </h2>
                  
                  {userType === 'startup' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{profileData?.companyName || 'Not provided'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Industry</label>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{profileData?.industry || 'Not provided'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Stage</label>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{profileData?.stage || 'Not provided'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Team Size</label>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{profileData?.teamSize || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{profileData?.description || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Firm Name</label>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{profileData?.firmName || 'Not provided'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Investor Type</label>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{profileData?.investorType || 'Not provided'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Portfolio Size</label>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{profileData?.portfolioSize || 'Not provided'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Experience</label>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <span className="text-gray-900 font-medium">{profileData?.yearsExperience || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <Globe className="h-6 w-6 text-purple-600" />
                    <span>Contact Information</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-gray-900 font-medium">{profileData?.email || user?.email || 'Not provided'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-gray-900 font-medium">{profileData?.phone || 'Not provided'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-gray-900 font-medium">{profileData?.website || 'Not provided'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <span className="text-gray-900 font-medium">{profileData?.location || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Preferences</h2>
                <p className="text-gray-600">Preferences settings will be displayed here...</p>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Security</h2>
                <p className="text-gray-600">Security settings will be displayed here...</p>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Notifications</h2>
                <p className="text-gray-600">Notification settings will be displayed here...</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">Profile Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Completion</span>
                  <span className="text-2xl font-black text-purple-600">
                    {profileData?.isComplete ? '100%' : '60%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      profileData?.isComplete 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-600'
                    }`}
                    style={{ width: profileData?.isComplete ? '100%' : '60%' }}
                  ></div>
                </div>
                {!profileData?.isComplete && (
                  <button
                    onClick={handleEditProfile}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold"
                  >
                    Complete Profile
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleEditProfile}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold"
                >
                  <Edit3 className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold">
                  <FileText className="h-5 w-5" />
                  <span>Download Data</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;