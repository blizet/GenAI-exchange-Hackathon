import jsPDF from 'jspdf';

export const generateStartupReportPDF = (startup, analysis) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with word wrapping
  const addWrappedText = (text, x, y, maxWidth, fontSize = 12) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.setFontSize(fontSize);
    doc.text(lines, x, y);
    return y + (lines.length * (fontSize * 0.4));
  };

  // Helper function to add a section header
  const addSectionHeader = (title, y) => {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 50, 150); // Purple color
    doc.text(title, 20, y);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    return y + 10;
  };

  // Helper function to add a subsection
  const addSubsection = (label, value, y) => {
    if (!value || value === '') return y;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`${label}:`, 20, y);
    doc.setFont(undefined, 'normal');
    const wrappedY = addWrappedText(value, 20, y + 5, pageWidth - 40, 10);
    return wrappedY + 5;
  };

  // Title Page
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(100, 50, 150);
  doc.text('Startup Investment Report', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(startup.companyName || 'Company Name', pageWidth / 2, 50, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`Industry: ${startup.industry || 'N/A'}`, pageWidth / 2, 65, { align: 'center' });
  doc.text(`Stage: ${startup.stage || 'N/A'}`, pageWidth / 2, 75, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 85, { align: 'center' });

  // Add a line separator
  doc.setDrawColor(100, 50, 150);
  doc.setLineWidth(0.5);
  doc.line(20, 100, pageWidth - 20, 100);

  yPosition = 120;

  // Company Overview Section
  yPosition = addSectionHeader('Company Overview', yPosition);
  yPosition = addSubsection('Company Name', startup.companyName, yPosition);
  yPosition = addSubsection('Industry', startup.industry, yPosition);
  yPosition = addSubsection('Stage', startup.stage, yPosition);
  yPosition = addSubsection('Founded Year', startup.foundedYear, yPosition);
  yPosition = addSubsection('Description', startup.description, yPosition);
  yPosition = addSubsection('Location', startup.location, yPosition);
  yPosition = addSubsection('Website', startup.website, yPosition);

  // Check if we need a new page
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = 20;
  }

  // Business Model Section
  yPosition = addSectionHeader('Business Model & Strategy', yPosition);
  yPosition = addSubsection('Business Model', startup.businessModel, yPosition);
  yPosition = addSubsection('Target Market', startup.targetMarket, yPosition);
  yPosition = addSubsection('Value Proposition', startup.valueProposition, yPosition);
  yPosition = addSubsection('Revenue Model', startup.revenueModel, yPosition);
  yPosition = addSubsection('Customer Segments', startup.customerSegments, yPosition);
  yPosition = addSubsection('Growth Strategy', startup.growthStrategy, yPosition);

  // Check if we need a new page
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = 20;
  }

  // Market Analysis Section
  yPosition = addSectionHeader('Market Analysis', yPosition);
  yPosition = addSubsection('Market Size', startup.marketSize, yPosition);
  yPosition = addSubsection('Competitive Advantage', startup.competitiveAdvantage, yPosition);
  yPosition = addSubsection('Technology Stack', startup.technologyStack, yPosition);

  // Team Section
  yPosition = addSectionHeader('Team Information', yPosition);
  yPosition = addSubsection('Team Size', startup.teamSize, yPosition);
  
  if (startup.keyMembers && startup.keyMembers.length > 0) {
    yPosition = addSubsection('Key Team Members', startup.keyMembers.join(', '), yPosition);
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = 20;
  }

  // Financial Information Section
  yPosition = addSectionHeader('Financial Information', yPosition);
  yPosition = addSubsection('Revenue', startup.revenue, yPosition);
  yPosition = addSubsection('Funding History', startup.fundingHistory, yPosition);

  // Contact Information Section
  yPosition = addSectionHeader('Contact Information', yPosition);
  yPosition = addSubsection('Email', startup.email, yPosition);
  yPosition = addSubsection('Phone', startup.phone, yPosition);

  // Challenges and Goals Section
  yPosition = addSectionHeader('Challenges & Goals', yPosition);
  yPosition = addSubsection('Current Challenges', startup.challenges, yPosition);
  yPosition = addSubsection('Future Goals', startup.goals, yPosition);

  // AI Analysis Section (if available)
  if (analysis && analysis.results) {
    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition = addSectionHeader('AI Analysis Results', yPosition);
    
    // Fact Check Analysis
    if (analysis.results.factCheck) {
      yPosition = addSubsection('Fact Check Analysis', 
        typeof analysis.results.factCheck === 'string' 
          ? analysis.results.factCheck 
          : JSON.stringify(analysis.results.factCheck, null, 2), 
        yPosition);
    }

    // Market Size Analysis
    if (analysis.results.marketSize) {
      yPosition = addSubsection('Market Size Analysis', 
        typeof analysis.results.marketSize === 'string' 
          ? analysis.results.marketSize 
          : JSON.stringify(analysis.results.marketSize, null, 2), 
        yPosition);
    }

    // Product Information Analysis
    if (analysis.results.productInfo) {
      yPosition = addSubsection('Product Information Analysis', 
        typeof analysis.results.productInfo === 'string' 
          ? analysis.results.productInfo 
          : JSON.stringify(analysis.results.productInfo, null, 2), 
        yPosition);
    }

    // Competition Analysis
    if (analysis.results.competition) {
      yPosition = addSubsection('Competition Analysis', 
        typeof analysis.results.competition === 'string' 
          ? analysis.results.competition 
          : JSON.stringify(analysis.results.competition, null, 2), 
        yPosition);
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
    doc.text('Generated by InvestAI Platform', 20, pageHeight - 10);
  }

  return doc;
};

export const downloadStartupReportPDF = (startup, analysis) => {
  const doc = generateStartupReportPDF(startup, analysis);
  const fileName = `${startup.companyName || 'Startup'}_Investment_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
