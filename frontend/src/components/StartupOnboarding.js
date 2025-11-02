import React, { useState } from 'react';
import { 
  Building2, Users, Target, CheckCircle,
  ArrowRight, ArrowLeft, Save, AlertCircle
} from 'lucide-react';

const StartupOnboarding = ({ onComplete, onBack, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    companyName: initialData?.companyName || '',
    legalStructure: initialData?.legalStructure || '',
    industry: initialData?.industry || '',
    subIndustry: initialData?.subIndustry || '',
    foundedDate: initialData?.foundedDate || '',
    stage: initialData?.stage || '',
    description: initialData?.description || '',
    mission: initialData?.mission || '',
    vision: initialData?.vision || '',
    
    // Products & Services
    coreProducts: initialData?.coreProducts || '',
    targetMarket: initialData?.targetMarket || '',
    customerSegments: initialData?.customerSegments || '',
    businessModel: initialData?.businessModel || '',
    technologyStack: initialData?.technologyStack || '',
    
    // Team Information
    teamSize: initialData?.teamSize || '',
    keyMembers: initialData?.keyMembers || [],
    founderBackground: initialData?.founderBackground || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Information', icon: Building2 },
    { id: 2, title: 'Products & Services', icon: Target },
    { id: 3, title: 'Team & Leadership', icon: Users },
    { id: 4, title: 'Review & Submit', icon: CheckCircle }
  ];

  const industries = [
    'Technology', 'Healthcare', 'Fintech', 'E-commerce', 'Education',
    'Real Estate', 'Manufacturing', 'Energy', 'Transportation', 'Media & Entertainment',
    'Food & Beverage', 'Fashion', 'Sports', 'Travel', 'Other'
  ];

  const stages = [
    'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth', 'IPO Ready'
  ];

  const legalStructures = [
    'Corporation (C-Corp)', 'S-Corporation', 'LLC', 'Partnership', 'Sole Proprietorship', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };


  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.companyName) newErrors.companyName = 'Company name is required';
        if (!formData.legalStructure) newErrors.legalStructure = 'Legal structure is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.stage) newErrors.stage = 'Stage is required';
        if (!formData.description) newErrors.description = 'Company description is required';
        if (!formData.mission) newErrors.mission = 'Mission statement is required';
        break;
      case 2:
        if (!formData.coreProducts) newErrors.coreProducts = 'Core products/services is required';
        if (!formData.targetMarket) newErrors.targetMarket = 'Target market is required';
        if (!formData.businessModel) newErrors.businessModel = 'Business model is required';
        break;
      case 3:
        if (!formData.teamSize) newErrors.teamSize = 'Team size is required';
        if (!formData.founderBackground) newErrors.founderBackground = 'Founder background is required';
        break;
      case 4:
        // Review step - no additional validation needed, all previous steps should be valid
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      // Ensure all required fields are present
      const cleanedData = {
        ...formData,
        teamSize: formData.teamSize || '0',
        stage: formData.stage || 'Not Specified',
        industry: formData.industry || 'Other',
        companyName: formData.companyName.trim(),
        description: formData.description.trim(),
        isComplete: true
      };

      console.log('📝 Submitting startup data:', cleanedData);
      await onComplete(cleanedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({
        submit: 'Failed to save startup profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.companyName ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Enter your company name"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.companyName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Legal Structure *
                </label>
                <select
                  value={formData.legalStructure}
                  onChange={(e) => handleInputChange('legalStructure', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.legalStructure ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select legal structure</option>
                  {legalStructures.map(structure => (
                    <option key={structure} value={structure}>{structure}</option>
                  ))}
                </select>
                {errors.legalStructure && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.legalStructure}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.industry ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.industry}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub-Industry
                </label>
                <input
                  type="text"
                  value={formData.subIndustry}
                  onChange={(e) => handleInputChange('subIndustry', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., SaaS, Mobile Apps, AI/ML"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Founded Date
                </label>
                <input
                  type="date"
                  value={formData.foundedDate}
                  onChange={(e) => handleInputChange('foundedDate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stage *
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.stage ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select stage</option>
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                {errors.stage && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.stage}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.description ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Describe your company, what you do, and your unique value proposition (150-200 words)"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mission Statement *
                </label>
                <textarea
                  value={formData.mission}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.mission ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="What is your company's mission?"
                />
                {errors.mission && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.mission}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vision Statement
                </label>
                <textarea
                  value={formData.vision}
                  onChange={(e) => handleInputChange('vision', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="What is your company's vision for the future?"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Core Products/Services *
              </label>
              <textarea
                value={formData.coreProducts}
                onChange={(e) => handleInputChange('coreProducts', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.coreProducts ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Describe your main products or services in detail"
              />
              {errors.coreProducts && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.coreProducts}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Market *
              </label>
              <textarea
                value={formData.targetMarket}
                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.targetMarket ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Who are your target customers and market segments?"
              />
              {errors.targetMarket && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.targetMarket}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Segments
              </label>
              <input
                type="text"
                value={formData.customerSegments}
                onChange={(e) => handleInputChange('customerSegments', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="e.g., SMBs, Enterprise, Consumers, B2B, B2C"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Model *
              </label>
              <textarea
                value={formData.businessModel}
                onChange={(e) => handleInputChange('businessModel', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.businessModel ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="How do you make money? Describe your revenue model"
              />
              {errors.businessModel && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.businessModel}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Technology Stack
              </label>
              <input
                type="text"
                value={formData.technologyStack}
                onChange={(e) => handleInputChange('technologyStack', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="e.g., React, Node.js, Python, AWS, MongoDB"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Team Size *
              </label>
              <select
                value={formData.teamSize}
                onChange={(e) => handleInputChange('teamSize', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.teamSize ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Select team size</option>
                <option value="1-5">1-5 employees</option>
                <option value="6-10">6-10 employees</option>
                <option value="11-25">11-25 employees</option>
                <option value="26-50">26-50 employees</option>
                <option value="51-100">51-100 employees</option>
                <option value="100+">100+ employees</option>
              </select>
              {errors.teamSize && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.teamSize}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Founder Background *
              </label>
              <textarea
                value={formData.founderBackground}
                onChange={(e) => handleInputChange('founderBackground', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.founderBackground ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Describe the founders' backgrounds, experience, and relevant expertise"
              />
              {errors.founderBackground && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.founderBackground}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-green-800">Ready to Submit!</h3>
              </div>
              <p className="text-green-700">
                Please review your information below. Once submitted, your startup profile will be created and you'll be able to start connecting with investors.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Company Information</h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p><span className="font-semibold">Name:</span> {formData.companyName}</p>
                <p><span className="font-semibold">Legal Structure:</span> {formData.legalStructure}</p>
                <p><span className="font-semibold">Industry:</span> {formData.industry}</p>
                <p><span className="font-semibold">Stage:</span> {formData.stage}</p>
                <p><span className="font-semibold">Team Size:</span> {formData.teamSize}</p>
                <p><span className="font-semibold">Founded:</span> {formData.foundedDate}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Business Description</h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700">{formData.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Products & Services</h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700">{formData.coreProducts}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Business Model & Market</h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p><span className="font-semibold">Business Model:</span> {formData.businessModel}</p>
                <p><span className="font-semibold">Target Market:</span> {formData.targetMarket}</p>
                <p><span className="font-semibold">Customer Segments:</span> {formData.customerSegments}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Team & Leadership</h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700">{formData.founderBackground}</p>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-6">
              <div className="flex items-center mb-2">
                <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-sm font-semibold text-blue-800">Note</h4>
              </div>
              <p className="text-blue-700 text-sm">
                You can upload your pitch deck, financial documents, and other materials later from your dashboard.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Startup Onboarding</h1>
          <p className="text-gray-600">Create your startup profile to connect with investors</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center min-w-0 flex-1">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-8 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-purple-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
                <div className="text-center px-1 mt-2">
                  <p className={`text-xs sm:text-sm font-semibold leading-tight ${
                    currentStep >= step.id ? 'text-purple-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-100 p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <div className="flex space-x-4">
              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
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
};

export default StartupOnboarding;
