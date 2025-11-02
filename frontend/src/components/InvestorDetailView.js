import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, Calendar, MapPin, Globe, Mail, Phone, Star, Building2, BarChart3, FileText, DollarSign, Target, Shield, Eye, ChevronRight, Sparkles, Heart, Rocket } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const InvestorDetailView = ({ investor, onBack }) => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'portfolio', name: 'Portfolio', icon: Building2 },
    { id: 'investment', name: 'Investment Criteria', icon: Target },
    { id: 'team', name: 'Team', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-xl border-b-2 border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-bold">Back</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl shadow-xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900">{investor.firmName}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-gray-600 text-lg">{investor.investorType}</p>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-sm font-bold">
                      {investor.portfolioSize} Portfolio
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold">
                <Heart className="h-5 w-5" />
                <span>Save</span>
              </button>
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
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50'
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
                {/* Investment Thesis */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span>Investment Thesis</span>
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed font-medium">
                    {investor.investmentThesis}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <span>Investment Details</span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                      <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{investor.checkSizeRange}</div>
                      <div className="text-sm font-bold text-gray-600">Check Size</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                      <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{investor.portfolioSize}</div>
                      <div className="text-sm font-bold text-gray-600">Portfolio</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                      <Calendar className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{investor.yearsExperience}</div>
                      <div className="text-sm font-bold text-gray-600">Experience</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                      <Target className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-black text-gray-900">{investor.investmentStages?.length || 0}</div>
                      <div className="text-sm font-bold text-gray-600">Stages</div>
                    </div>
                  </div>
                </div>

                {/* Focus Industries */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    <span>Focus Industries</span>
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {investor.focusIndustries?.map((industry, index) => (
                      <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-500 text-white rounded-full font-bold shadow-sm">
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Investment Stages */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                    <span>Investment Stages</span>
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {investor.investmentStages?.map((stage, index) => (
                      <span key={index} className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-full font-bold shadow-sm">
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notable Investments */}
                {investor.previousNotableInvestments && (
                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                      <Star className="h-6 w-6 text-blue-600" />
                      <span>Notable Investments</span>
                    </h2>
                    <p className="text-gray-600 text-lg font-medium">
                      {investor.previousNotableInvestments}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Portfolio Companies</h2>
                <p className="text-gray-600">Portfolio companies will be displayed here...</p>
              </div>
            )}

            {activeTab === 'investment' && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Investment Criteria</h2>
                <p className="text-gray-600">Detailed investment criteria will be displayed here...</p>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Team Information</h2>
                <p className="text-gray-600">Team details will be displayed here...</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{investor.website || 'Website not available'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{investor.email || 'Email not available'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{investor.phone || 'Phone not available'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{investor.location || 'Location not available'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-black text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold">
                  <Mail className="h-5 w-5" />
                  <span>Contact Investor</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-bold">
                  <FileText className="h-5 w-5" />
                  <span>Submit Pitch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InvestorDetailView;
