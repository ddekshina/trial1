import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePricingAnalysisPDF = (formData, formId = null) => {
  const doc = new jsPDF();
  
  // Set up the document
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175); // Blue color
  doc.text('Pricing Analysis Report', margin, 30);
  
  if (formId) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Form ID: ${formId}`, margin, 40);
  }
  
  // Add creation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 50);
  
  let yPosition = 70;
  
  // Helper function to add section
  const addSection = (title, data) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(title, margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 30;
        }
        
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        let displayValue = value;
        
        // Format arrays
        if (Array.isArray(value)) {
          displayValue = value.length > 0 ? value.join(', ') : 'Not specified';
        }
        
        // Format boolean values
        if (typeof value === 'boolean') {
          displayValue = value ? 'Yes' : 'No';
        }
        
        // Handle long text with wrapping
        const text = `${formattedKey}: ${displayValue}`;
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 30;
          }
          doc.text(line, margin + (index > 0 ? 10 : 0), yPosition);
          yPosition += 5;
        });
        
        yPosition += 2; // Add small gap between fields
      }
    });
    
    yPosition += 10; // Add gap between sections
  };
  
  // Client Information
  addSection('Client Information', {
    'Client Name': formData.clientName || formData.client_name,
    'Client Type': formData.clientType || formData.client_type,
    'Industry Sector': formData.industrySector || formData.industry_sector,
    'Company Size': formData.companySize || formData.company_size,
    'Annual Revenue': formData.annualRevenue || formData.annual_revenue,
    'Primary Contact': formData.primaryContactName || formData.primary_contact_name,
    'Email': formData.email,
    'Phone': formData.phoneNumber || formData.phone_number
  });
  
  // Project Overview
  addSection('Project Overview', {
    'Project Title': formData.projectTitle || formData.project_title,
    'Description': formData.projectDescription || formData.project_description,
    'Business Objective': formData.businessObjective || formData.business_objective,
    'Expected Deliverables': formData.expectedDeliverables || formData.expected_deliverables,
    'Target Audience': formData.targetAudience || formData.target_audience
  });
  
  // Technical Scope
  addSection('Technical Scope', {
    'Data Sources': formData.dataSources || formData.data_sources,
    'Volume of Data': formData.volumeOfData || formData.volume_of_data,
    'Required Integrations': formData.requiredIntegrations || formData.required_integrations
  });
  
  // Features & Functionalities
  addSection('Features & Functionalities', {
    'Interactivity Needed': formData.interactivityNeeded || formData.interactivity_needed,
    'User Access Levels': formData.userAccessLevels || formData.user_access_levels,
    'Customization Needs': formData.customizationNeeds || formData.customization_needs
  });
  
  // Pricing Factors
  addSection('Pricing Factors', {
    'Engagement Type': formData.engagementType || formData.engagement_type,
    'Start Date': formData.startDate || formData.start_date,
    'End Date': formData.endDate || formData.end_date,
    'Delivery Model': formData.deliveryModel || formData.delivery_model,
    'Support Plan': formData.supportPlanRequired || formData.support_plan_required
  });
  
  // Competitive Inputs
  addSection('Competitive / Value-based Inputs', {
    'Budget Range': formData.clientBudgetRange || formData.budget_range,
    'Competitor Comparison': formData.competitorComparison || formData.competitor_comparison,
    'ROI Expectations': formData.roiExpectations || formData.roi_expectations,
    'Tiered Pricing Needed': formData.tieredPricingNeeded || formData.tiered_pricing_needed,
    'Tiered Pricing Details': formData.tieredPricingDetails || formData.tiered_pricing_details
  });
  
  // Analyst Notes
  addSection('Analyst Notes & Recommendations', {
    'Internal Notes': formData.internalAnalystNotes || formData.internal_analyst_notes,
    'Suggested Pricing Model': formData.suggestedPricingModel || formData.suggested_pricing_model,
    'Risk Factors': formData.riskFactors || formData.risk_factors,
    'Next Steps': formData.suggestedNextSteps || formData.suggested_next_steps
  });
  
  return doc;
};

export const downloadPDF = (formData, formId = null) => {
  const doc = generatePricingAnalysisPDF(formData, formId);
  const fileName = `pricing-analysis-${formId || 'new'}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const getPDFBlob = (formData, formId = null) => {
  const doc = generatePricingAnalysisPDF(formData, formId);
  return doc.output('blob');
};