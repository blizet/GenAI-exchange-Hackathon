import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../providers/firebase';

export const populateSampleData = async () => {
  try {
    console.log('🔄 Adding sample data to Firestore...');

    // Sample startups data
    const sampleStartups = [
      {
        companyName: 'TechFlow AI',
        industry: 'Technology',
        description: 'Revolutionary AI-powered workflow automation platform for enterprises',
        teamSize: '25-50',
        stage: 'Series A',
        overallScore: 85,
        foundedYear: '2020',
        sector: 'AI/ML',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        companyName: 'GreenEnergy Solutions',
        industry: 'Clean Energy',
        description: 'Sustainable energy solutions for smart cities and industrial applications',
        teamSize: '10-25',
        stage: 'Seed',
        overallScore: 78,
        foundedYear: '2021',
        sector: 'CleanTech',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        companyName: 'HealthTech Innovations',
        industry: 'Healthcare',
        description: 'AI-driven diagnostic tools for early disease detection and prevention',
        teamSize: '50-100',
        stage: 'Series B',
        overallScore: 92,
        foundedYear: '2019',
        sector: 'HealthTech',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        companyName: 'FinTech Pro',
        industry: 'Financial Services',
        description: 'Next-generation payment processing and financial management platform',
        teamSize: '30-60',
        stage: 'Series A',
        overallScore: 88,
        foundedYear: '2020',
        sector: 'FinTech',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Sample investors data
    const sampleInvestors = [
      {
        firmName: 'Venture Capital Partners',
        investmentThesis: 'We invest in early-stage companies with disruptive technology and strong founding teams.',
        checkSizeRange: '₹50L - ₹5Cr',
        focusIndustries: ['Technology', 'Healthcare', 'Fintech'],
        name: 'John Smith',
        bio: 'Experienced venture capitalist with 15+ years in tech investments',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        firmName: 'Angel Investors Network',
        investmentThesis: 'Supporting innovative startups with scalable business models and passionate founders.',
        checkSizeRange: '₹2.5L - ₹25L',
        focusIndustries: ['SaaS', 'E-commerce', 'AI/ML'],
        name: 'Sarah Johnson',
        bio: 'Serial entrepreneur and angel investor focused on early-stage startups',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        firmName: 'Growth Capital Fund',
        investmentThesis: 'We partner with high-growth companies ready to scale globally.',
        checkSizeRange: '₹1Cr - ₹10Cr',
        focusIndustries: ['Technology', 'E-commerce', 'Manufacturing'],
        name: 'Michael Chen',
        bio: 'Growth equity investor specializing in scaling businesses',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Add startups to Firestore
    console.log('📊 Adding startups...');
    for (const startup of sampleStartups) {
      try {
        const docRef = await addDoc(collection(db, 'startups'), startup);
        console.log('✅ Added startup:', startup.companyName, 'with ID:', docRef.id);
      } catch (error) {
        console.error('❌ Error adding startup:', startup.companyName, error);
      }
    }

    // Add investors to Firestore
    console.log('👥 Adding investors...');
    for (const investor of sampleInvestors) {
      try {
        const docRef = await addDoc(collection(db, 'investors'), investor);
        console.log('✅ Added investor:', investor.firmName, 'with ID:', docRef.id);
      } catch (error) {
        console.error('❌ Error adding investor:', investor.firmName, error);
      }
    }

    console.log('🎉 Sample data population completed!');
    return true;
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    return false;
  }
};

// Function to clear existing data (use with caution)
export const clearSampleData = async () => {
  try {
    console.log('🗑️ Clearing sample data...');
    // Note: This would require delete operations which need proper authentication
    console.log('⚠️ Clear data function requires proper authentication setup');
    return false;
  } catch (error) {
    console.error('❌ Error clearing sample data:', error);
    return false;
  }
};

