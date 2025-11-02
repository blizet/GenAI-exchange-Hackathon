import React, { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { 
  TrendingUp, Upload, DollarSign, Users, Target, 
  FileText, Globe, Calendar, CheckCircle, Building2,
  ArrowRight, ArrowLeft, Save, AlertCircle, Briefcase
} from 'lucide-react';

// Move constants outside component to prevent recreation on every render
const STEPS = [
  { id: 1, title: 'Basic Information', icon: Building2 },
  { id: 2, title: 'Investment Focus', icon: Target },
  { id: 3, title: 'Contact & Submit', icon: CheckCircle }
];

const INVESTOR_TYPES = [
  'Angel Investor', 'Venture Capital', 'Private Equity', 'Corporate VC',
  'Family Office', 'Hedge Fund', 'Government Fund', 'Accelerator', 'Other'
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Fintech', 'E-commerce', 'Education',
  'Real Estate', 'Manufacturing', 'Energy', 'Transportation', 'Media & Entertainment',
  'Food & Beverage', 'Fashion', 'Sports', 'Travel', 'AI/ML', 'Blockchain',
  'CleanTech', 'Biotech', 'Other'
];

const STAGES = [
  'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth', 'Late Stage'
];

const CHECK_SIZES = [
  '₹0 - ₹2L', '₹2L - ₹10L', '₹10L - ₹50L', '₹50L - ₹1Cr',
  '₹1Cr - ₹5Cr', '₹5Cr - ₹10Cr', '₹10Cr - ₹25Cr', '₹25Cr+'
];

const REGIONS = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America',
  'Middle East & Africa', 'Global', 'Local/Regional'
];

const VALUE_ADD_OPTIONS = [
  'Mentorship', 'Strategic Guidance', 'Industry Connections', 'Technical Expertise',
  'Marketing Support', 'Operational Support', 'Fundraising Assistance', 'Exit Strategy',
  'Board Seats', 'Advisory Roles', 'Other'
];

const COMMUNICATION_STYLES = [
  'Formal & Structured', 'Casual & Direct', 'Data-Driven', 'Relationship-Focused',
  'Quick Decisions', 'Thorough Analysis', 'Other'
];

// Memoized checkbox component for better performance
const MemoizedCheckbox = memo(({ 
  id, 
  value, 
  checked, 
  onChange, 
  label, 
  className = "w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
}) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className={className}
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
));

const InvestorOnboarding = memo(({ onComplete, onBack, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    firmName: initialData?.firmName || '',
    investorType: initialData?.investorType || '',
    focusIndustries: initialData?.focusIndustries || [],
    investmentStages: initialData?.investmentStages || [],
    checkSizeRange: initialData?.checkSizeRange || '',
    
    // Investment Focus
    investmentThesis: initialData?.investmentThesis || '',
    
    // Contact Information
    website: initialData?.website || '',
    linkedin: initialData?.linkedin || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const formDataRef = useRef(formData);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Update form data ref when form data changes
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  }, []);

  const handleTextInputChange = useCallback((field, value) => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced update
    debounceTimeoutRef.current = setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }, 300);
    
    // Clear error immediately
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  }, []);

  const handleArrayChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  }, []);

  const validateStep = useCallback((step) => {
    const currentFormData = formDataRef.current;
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!currentFormData.firmName) {
          newErrors.firmName = 'Firm name is required';
        }
        if (!currentFormData.investorType) {
          newErrors.investorType = 'Investor type is required';
        }
        if (currentFormData.focusIndustries.length === 0) {
          newErrors.focusIndustries = 'At least one focus industry is required';
        }
        if (currentFormData.investmentStages.length === 0) {
          newErrors.investmentStages = 'At least one investment stage is required';
        }
        if (!currentFormData.checkSizeRange) {
          newErrors.checkSizeRange = 'Check size range is required';
        }
        break;
      case 2:
        if (!currentFormData.investmentThesis) {
          newErrors.investmentThesis = 'Investment thesis is required';
        }
        break;
      case 3:
        if (!currentFormData.website) {
          newErrors.website = 'Website is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      setErrors({}); // Clear all errors when moving to next step
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      // Here you would typically send the data to your backend
      console.log('Submitting investor data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onComplete(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, formData, onComplete]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Firm/Individual Name *
                </label>
                <input
                  type="text"
                  value={formData.firmName}
                  onChange={(e) => handleInputChange('firmName', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.firmName ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Enter your firm or individual name"
                />
                {errors.firmName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.firmName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Investor Type *
                </label>
                <select
                  value={formData.investorType}
                  onChange={(e) => handleInputChange('investorType', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.investorType ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select investor type</option>
                  {INVESTOR_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.investorType && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.investorType}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Focus Industries *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INDUSTRIES.map(industry => (
                  <MemoizedCheckbox
                    key={industry}
                    id={`industry-${industry}`}
                    value={industry}
                    checked={formData.focusIndustries?.includes(industry) || false}
                    onChange={() => handleArrayChange('focusIndustries', industry)}
                    label={industry}
                  />
                ))}
              </div>
              {errors.focusIndustries && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.focusIndustries}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Investment Stages *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STAGES.map(stage => (
                  <MemoizedCheckbox
                    key={stage}
                    id={`stage-${stage}`}
                    value={stage}
                    checked={formData.investmentStages?.includes(stage) || false}
                    onChange={() => handleArrayChange('investmentStages', stage)}
                    label={stage}
                  />
                ))}
              </div>
              {errors.investmentStages && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.investmentStages}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Typical Check Size Range *
              </label>
              <select
                value={formData.checkSizeRange}
                onChange={(e) => handleInputChange('checkSizeRange', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.checkSizeRange ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Select check size range</option>
                {CHECK_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.checkSizeRange && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.checkSizeRange}
                </p>
              )}
            </div>

          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Investment Thesis *
              </label>
              <textarea
                value={formData.investmentThesis}
                onChange={(e) => handleInputChange('investmentThesis', e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.investmentThesis ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Describe your investment philosophy, what you look for in startups, and your approach to investing. This helps startups understand your investment criteria and approach."
              />
              {errors.investmentThesis && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.investmentThesis}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website *
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.website ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="https://yourfirm.com"
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.website}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investor Onboarding</h1>
          <p className="text-gray-600">Create your investor profile to discover and connect with startups</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center min-w-0 flex-1">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`hidden sm:block w-8 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
                <div className="text-center px-1 mt-2">
                  <p className={`text-xs sm:text-sm font-semibold leading-tight ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <div className="flex space-x-4">
              {currentStep < STEPS.length ? (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Submit Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InvestorOnboarding;
