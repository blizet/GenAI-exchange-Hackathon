import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, TrendingUp, Brain, Target, Users, 
  BarChart3, Shield, Zap, Globe, CheckCircle,
  ArrowRight, Sparkles, Rocket, Heart, Star
} from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI algorithms analyze startup documents, emails, and calls to provide comprehensive insights and investment recommendations.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'Intelligent matching system connects startups with the most suitable investors based on industry, stage, and investment criteria.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards and analytics provide real-time insights into market trends, startup performance, and investment opportunities.',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Enterprise-grade security ensures all sensitive business information and documents are protected with the highest standards.',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: Users,
      title: 'Expert Network',
      description: 'Connect with industry experts, mentors, and advisors who can provide valuable guidance and support for your business growth.',
      color: 'from-rose-500 to-pink-600'
    },
    {
      icon: Zap,
      title: 'Rapid Processing',
      description: 'Lightning-fast document processing and analysis, delivering insights in minutes rather than days or weeks.',
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Startups Analyzed', icon: Building2 },
    { number: '500+', label: 'Active Investors', icon: TrendingUp },
    { number: '95%', label: 'Accuracy Rate', icon: CheckCircle },
    { number: '24/7', label: 'AI Analysis', icon: Brain }
  ];

  const benefits = [
    {
      title: 'For Startups',
      icon: Building2,
      items: [
        'Get AI-powered analysis of your business model and market potential',
        'Connect with investors who match your industry and stage',
        'Access comprehensive market intelligence and competitor analysis',
        'Receive detailed feedback on your pitch and presentation',
        'Track your progress with real-time analytics and insights'
      ],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'For Investors',
      icon: TrendingUp,
      items: [
        'Discover high-potential startups using advanced AI filtering',
        'Get comprehensive due diligence reports in minutes',
        'Access detailed market analysis and competitive intelligence',
        'Connect with startups that match your investment criteria',
        'Track portfolio performance with advanced analytics'
      ],
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm">
                <Brain className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-black text-white mb-6">
              InvestAI
              <Sparkles className="inline-block h-12 w-12 text-yellow-300 ml-4" />
            </h1>
            <p className="text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              The world's first AI-powered investment platform that revolutionizes how startups and investors connect, 
              analyze opportunities, and make data-driven decisions.
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Get Started
                <ArrowRight className="inline-block h-5 w-5 ml-2" />
              </button>
              <button 
                onClick={() => navigate('/resources')}
                className="px-8 py-4 bg-white/20 text-white rounded-2xl font-black text-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl inline-block mb-4">
                    <IconComponent className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-4xl font-black text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-bold">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* What We Do Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              What We Do
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              InvestAI leverages cutting-edge artificial intelligence to transform the investment landscape, 
              making it easier, faster, and more accurate for startups and investors to find the perfect match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                    <div className={`p-4 bg-gradient-to-br ${feature.color} rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Why Choose InvestAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides unique advantages for both startups and investors, 
              powered by advanced AI technology and industry expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="group">
                  <div className={`bg-gradient-to-br ${benefit.color} rounded-3xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2`}>
                    <div className="flex items-center mb-6">
                      <div className="p-3 bg-white/20 rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <h3 className="text-3xl font-black">{benefit.title}</h3>
                    </div>
                    <ul className="space-y-4">
                      {benefit.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <CheckCircle className="h-6 w-6 text-white/80 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-white/90 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-6">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Our platform uses state-of-the-art machine learning models and natural language processing 
              to deliver unprecedented insights and accuracy in investment analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-sm mb-6">
                <Brain className="h-12 w-12 text-white mx-auto" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Machine Learning</h3>
              <p className="text-white/80">
                Advanced ML algorithms analyze patterns and predict investment success with 95% accuracy.
              </p>
            </div>
            <div className="text-center">
              <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-sm mb-6">
                <Globe className="h-12 w-12 text-white mx-auto" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Global Data</h3>
              <p className="text-white/80">
                Access to millions of data points from global markets, startups, and investment trends.
              </p>
            </div>
            <div className="text-center">
              <div className="p-6 bg-white/20 rounded-3xl backdrop-blur-sm mb-6">
                <Zap className="h-12 w-12 text-white mx-auto" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Real-time Processing</h3>
              <p className="text-white/80">
                Lightning-fast analysis and insights delivered in real-time for immediate decision making.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-gray-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-black text-white mb-6">
            Ready to Transform Your Investment Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of startups and investors who are already using InvestAI to make smarter, 
            faster, and more successful investment decisions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-black text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Rocket className="inline-block h-5 w-5 mr-2" />
              Start Free Trial
            </button>
            <button 
              onClick={() => navigate('/resources')}
              className="px-8 py-4 bg-white/20 text-white rounded-2xl font-black text-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              <Heart className="inline-block h-5 w-5 mr-2" />
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
