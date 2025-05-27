import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import FormLayout from '../components/layout/FormLayout';
import ClientInformation from '../components/form-sections/ClientInformation';
import ProjectOverview from '../components/form-sections/ProjectOverview';
import TechnicalScope from '../components/form-sections/TechnicalScope';
import FeaturesFunctionalities from '../components/form-sections/FeaturesFunctionalities';
import PricingFactors from '../components/form-sections/PricingFactors';
import CompetitiveInputs from '../components/form-sections/CompetitiveInputs';
import AnalystNotes from '../components/form-sections/AnalystNotes';
import DemoClient from '../components/form-sections/DemoClient';
import BusinessAnalysis from '../components/form-sections/BusinessAnalysis';
import DownloadShareButtons from '../components/DownloadShareButtons';
import FileUploader from '../components/FileUploader';
import { Tabs, Tab, Box } from '@mui/material'; 
import QuoteGenerator from '../components/QuoteGenerator'; 

const API_BASE_URL = 'http://localhost:5000';

const FormPage = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [submittedFormId, setSubmittedFormId] = useState(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [files, setFiles] = useState([]);
  const [quote, setQuote] = useState(null);

  // Enhanced form state with all new fields
  const [formData, setFormData] = useState({
    wantsDemo: false,
    wantsBusinessAnalysis: false,
    // Client Information
    pricingAnalystName: '',
    clientName: '',
    clientType: 'B2B',
    country: '',
    city: '',
    currency: '',
    industrySector: '',
    companySize: '',
    annualRevenue: '',
    primaryContactName: '',
    email: '',
    phoneNumber: '',
    
    // BI Team Information
    hasBiTeam: false,
    wantsToUseToolWithBi: false,
    willProvideBiProjects: false,
    
    // Project Overview
    subscriptionPlan: '',
    projectTitle: '',
    projectDescription: '',
    businessObjective: '',
    expectedDeliverables: [], // Array of objects: { type, quantity, widgets }
    targetAudience: [],
    numberOfIntegrations: 0,
    numberOfWidgets: 0,
    
    // Technical Scope
    dataSources: [],
    databases: [],
    cloudStorageName: '',
    googleSpreadsheet: '',
    volumeOfData: 'Small (<1M)',
    requiredIntegrations: [],
    
    // API Information
    apiName: '',
    apiAvailable: false,
    apiDocumented: false,
    apiTestKitLink: '',
    crmApiDocumented: false,
    erpApiDocumented: false,
    biToolsApiAvailable: false,
    apisApiAvailable: false,
    apisTestKitLink: '',
    
    // Features & Functionalities
    interactivityNeeded: [],
    userAccessLevels: [],
    customizationNeeds: [],
    
    // Pricing Factors
    engagementType: 'One-time Project',
    startDate: '',
    endDate: '',
    deliveryModel: [],
    supportPlanRequired: 'Basic',
    
    // Competitive / Value-based Inputs
    budgetRange: '',
    competitorComparison: '',
    roiExpectations: '',
    tieredPricingNeeded: false,
    tieredPricingDetails: '',
    
    // Analyst Notes & Recommendations
    internalAnalystNotes: '',
    suggestedPricingModel: '',
    riskFactors: '',
    suggestedNextSteps: '',

  // DEMO CLIENT FIELDS
  companyWebsite: '',
  numberOfVerticals: '',
  demoVerticals: [],
  customVertical: '',
  demoUseCase: '',
  referenceLinks: '',
  smartcardLinks: '',
  demoDatetime: '',
  demoTimezone: '',
  demoCountry: '',
  demoCity: '',
  demoMeetingLink: '',
  clientAttachments: [],
  demoExtraAttachments: [],
  nextDemoStep: '',
  clientProjectIdeas: '',

  // BUSINESS ANALYSIS FIELDS
  problemStatement: '',
  caseDescription: '',
  stakeholders: '',
  finalGoal: '',
  resourcesDocumented: '',
  docTimeline: '',
  shouldDocument: '',
  hasSupportTeam: '',
  hasComplexMath: '',
  });

  // Update form data handler
  const updateFormData = (section, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  // Transform form data for API submission
  const transformFormDataForAPI = (data) => {
    const transformed = {
      // Client Information
      pricing_analyst_name: data.pricingAnalystName,
      client_name: data.clientName,
      client_type: data.clientType,
      country: data.country,
      city: data.city,
      currency: data.currency,
      industry_sector: data.industrySector,
      company_size: parseInt(data.companySize) || 0,
      annual_revenue: parseInt(data.annualRevenue) || 0,
      primary_contact_name: data.primaryContactName,
      email: data.email,
      phone_number: data.phoneNumber,
      
      // BI Team
      has_bi_team: data.hasBiTeam,
      wants_to_use_tool_with_bi: data.wantsToUseToolWithBi,
      will_provide_bi_projects: data.willProvideBiProjects,
      
      // Project Overview
      subscription_plan: data.subscriptionPlan,
      project_title: data.projectTitle,
      project_description: data.projectDescription,
      business_objective: data.businessObjective,
      expected_deliverables: data.expectedDeliverables,
      target_audience: data.targetAudience,
      number_of_integrations: data.numberOfIntegrations,
      number_of_widgets: data.numberOfWidgets,
      
      // Technical Scope
      data_sources: data.dataSources,
      databases: data.databases,
      cloud_storage_name: data.cloudStorageName,
      google_spreadsheet: data.googleSpreadsheet,
      volume_of_data: data.volumeOfData,
      required_integrations: data.requiredIntegrations,
      
      // API Information
      api_name: data.apiName,
      api_available: data.apiAvailable,
      api_documented: data.apiDocumented,
      api_test_kit_link: data.apiTestKitLink,
      crm_api_documented: data.crmApiDocumented,
      erp_api_documented: data.erpApiDocumented,
      bi_tools_api_available: data.biToolsApiAvailable,
      apis_api_available: data.apisApiAvailable,
      apis_test_kit_link: data.apisTestKitLink,
      
      // Features & Functionalities
      interactivity_needed: data.interactivityNeeded,
      user_access_levels: data.userAccessLevels,
      customization_needs: data.customizationNeeds,
      
      // Pricing Factors
      engagement_type: data.engagementType,
      start_date: data.startDate,
      end_date: data.endDate,
      delivery_model: data.deliveryModel,
      support_plan_required: data.supportPlanRequired,
      
      // Competitive Inputs
      budget_range: parseInt(data.budgetRange) || 0,
      competitor_comparison: data.competitorComparison,
      roi_expectations: data.roiExpectations,
      tiered_pricing_needed: data.tieredPricingNeeded,
      tiered_pricing_details: data.tieredPricingDetails,
      
      // Analyst Notes
      internal_analyst_notes: data.internalAnalystNotes,
      suggested_pricing_model: data.suggestedPricingModel,
      risk_factors: data.riskFactors,
      suggested_next_steps: data.suggestedNextSteps,

      // Demo Client Fields
      wants_demo: data.wantsDemo,
      company_website: data.companyWebsite,
      use_case_description: data.useCaseDescription,
      reference_links: data.referenceLinks,
      number_of_verticals: data.numberOfVerticals,
      demo_verticals: data.demoVerticals,
      custom_vertical: data.customVertical,
      demo_scheduled_at: data.demoScheduledAt,
      timezone: data.timezone,
      meeting_link: data.meetingLink,
      next_steps: data.nextSteps,
      client_suggestions: data.clientSuggestions,

      // Business Analysis Fields
      wants_business_analysis: data.wantsBusinessAnalysis,
      problem_statement: data.problemStatement,
      case_description: data.caseDescription,
      stakeholders: data.stakeholders,
      visualization_goal: data.visualizationGoal,
      resources_status: data.resourcesStatus,
      has_support_team: data.hasSupportTeam,
      has_complex_math: data.hasComplexMath,

      // Client type tag
      client_type_tag: 
        data.wantsDemo && data.wantsBusinessAnalysis ? 'both' :
        data.wantsDemo ? 'demo' :
        data.wantsBusinessAnalysis ? 'business-analysis' : ''
    };
    
    return transformed;
  };

  // Transform API data back to form format
  const transformAPIDataToForm = (apiData) => {
    const transformed = {
      // Client Information
      pricingAnalystName: apiData.pricing_analyst_name || '',
      clientName: apiData.client_name || '',
      clientType: apiData.client_type || 'B2B',
      country: apiData.country || '',
      city: apiData.city || '',
      currency: apiData.currency || '',
      industrySector: apiData.industry_sector || '',
      companySize: apiData.company_size || '',
      annualRevenue: apiData.annual_revenue || '',
      primaryContactName: apiData.primary_contact_name || '',
      email: apiData.email || '',
      phoneNumber: apiData.phone_number || '',
      
      // BI Team
      hasBiTeam: apiData.has_bi_team || false,
      wantsToUseToolWithBi: apiData.wants_to_use_tool_with_bi || false,
      willProvideBiProjects: apiData.will_provide_bi_projects || false,
      
      // Project Overview
      subscriptionPlan: apiData.subscription_plan || '',
      projectTitle: apiData.project_title || '',
      projectDescription: apiData.project_description || '',
      businessObjective: apiData.business_objective || '',
      expectedDeliverables: apiData.expected_deliverables || [],
      targetAudience: apiData.target_audience || [],
      numberOfIntegrations: apiData.number_of_integrations || 0,
      numberOfWidgets: apiData.number_of_widgets || 0,
      
      // Technical Scope
      dataSources: apiData.data_sources || [],
      databases: apiData.databases || [],
      cloudStorageName: apiData.cloud_storage_name || '',
      googleSpreadsheet: apiData.google_spreadsheet || '',
      volumeOfData: apiData.volume_of_data || 'Small (<1M)',
      requiredIntegrations: apiData.required_integrations || [],
      
      // API Information
      apiName: apiData.api_name || '',
      apiAvailable: apiData.api_available || false,
      apiDocumented: apiData.api_documented || false,
      apiTestKitLink: apiData.api_test_kit_link || '',
      crmApiDocumented: apiData.crm_api_documented || false,
      erpApiDocumented: apiData.erp_api_documented || false,
      biToolsApiAvailable: apiData.bi_tools_api_available || false,
      apisApiAvailable: apiData.apis_api_available || false,
      apisTestKitLink: apiData.apis_test_kit_link || '',
      
      // Features & Functionalities
      interactivityNeeded: apiData.interactivity_needed || [],
      userAccessLevels: apiData.user_access_levels || [],
      customizationNeeds: apiData.customization_needs || [],
      
      // Pricing Factors
      engagementType: apiData.engagement_type || 'One-time Project',
      startDate: apiData.start_date || '',
      endDate: apiData.end_date || '',
      deliveryModel: apiData.delivery_model || [],
      supportPlanRequired: apiData.support_plan_required || 'Basic',
      
      // Competitive Inputs
      budgetRange: apiData.budget_range || '',
      competitorComparison: apiData.competitor_comparison || '',
      roiExpectations: apiData.roi_expectations || '',
      tieredPricingNeeded: apiData.tiered_pricing_needed || false,
      tieredPricingDetails: apiData.tiered_pricing_details || '',
      
      // Analyst Notes
      internalAnalystNotes: apiData.internal_analyst_notes || '',
      suggestedPricingModel: apiData.suggested_pricing_model || '',
      riskFactors: apiData.risk_factors || '',
      suggestedNextSteps: apiData.suggested_next_steps || '',

      // Demo Client Fields
      wantsDemo: apiData.wants_demo || false,
      companyWebsite: apiData.company_website || '',
      useCaseDescription: apiData.use_case_description || '',
      referenceLinks: apiData.reference_links || '',
      numberOfVerticals: apiData.number_of_verticals || 0,
      demoVerticals: apiData.demo_verticals || [],
      customVertical: apiData.custom_vertical || '',
      demoScheduledAt: apiData.demo_scheduled_at || '',
      timezone: apiData.timezone || '',
      meetingLink: apiData.meeting_link || '',
      nextSteps: apiData.next_steps || '',
      clientSuggestions: apiData.client_suggestions || '',

      // Business Analysis Fields
      wantsBusinessAnalysis: apiData.wants_business_analysis || false,
      problemStatement: apiData.problem_statement || '',
      caseDescription: apiData.case_description || '',
      stakeholders: apiData.stakeholders || '',
      visualizationGoal: apiData.visualization_goal || '',
      resourcesStatus: apiData.resources_status || '',
      hasSupportTeam: apiData.has_support_team || '',
      hasComplexMath: apiData.has_complex_math || ''
    };
    
    return transformed;
  };

  // Form submission handler
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setSubmitStatus({ type: '', message: '' });
  
  try {
    const formDataToSubmit = new FormData();
    const submissionData = transformFormDataForAPI(formData);
    
    // Append form data as JSON
    formDataToSubmit.append('data', JSON.stringify(submissionData));
    
    // Append files
    files.forEach(file => {
      formDataToSubmit.append('files', file.file);
    });

    const response = await axios.post(`${API_BASE_URL}/api/forms`, formDataToSubmit, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const formId = response.data.form_id || response.data.id;
    setSubmittedFormId(formId);
    setIsFormSubmitted(true);
    
    setSubmitStatus({
      type: 'success',
      message: `Form submitted successfully! Form ID: ${formId || 'N/A'}`
    });

    setActiveTab('quote');
  } catch (error) {
    console.error('Full error:', error);
    console.error('Response data:', error.response?.data);
    console.error('Response status:', error.response?.status);
    
    let errorMessage = 'Failed to submit form. Please try again.';
    if (error.response?.data?.details) {
      errorMessage = `Validation errors: ${JSON.stringify(error.response.data.details)}`;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    }
    
    setSubmitStatus({
      type: 'error',
      message: errorMessage
    });
  } finally {
    setIsLoading(false);
  }
};

  // Reset form handler
  const handleResetForm = () => {
    setIsFormSubmitted(false);
    setSubmittedFormId(null);
    setSubmitStatus({ type: '', message: '' });
    setActiveTab('form'); // Switch back to form tab when resetting
    setFiles([]);
    
    // Reset to initial state
    setFormData({
      wantsDemo: false,
      wantsBusinessAnalysis: false,
      pricingAnalystName: '',
      clientName: '',
      clientType: 'B2B',
      country: '',
      city: '',
      currency: '',
      industrySector: '',
      companySize: '',
      annualRevenue: '',
      primaryContactName: '',
      email: '',
      phoneNumber: '',
      hasBiTeam: false,
      wantsToUseToolWithBi: false,
      willProvideBiProjects: false,
      projectTitle: '',
      projectDescription: '',
      businessObjective: '',
      expectedDeliverables: [],
      targetAudience: [],
      numberOfIntegrations: 0,
      numberOfWidgets: 0,
      dataSources: [],
      databases: [],
      cloudStorageName: '',
      googleSpreadsheet: '',
      volumeOfData: 'Small (<1M)',
      requiredIntegrations: [],
      apiName: '',
      apiAvailable: false,
      apiDocumented: false,
      apiTestKitLink: '',
      crmApiDocumented: false,
      erpApiDocumented: false,
      biToolsApiAvailable: false,
      apisApiAvailable: false,
      apisTestKitLink: '',
      interactivityNeeded: [],
      userAccessLevels: [],
      customizationNeeds: [],
      engagementType: 'One-time Project',
      startDate: '',
      endDate: '',
      deliveryModel: [],
      supportPlanRequired: 'Basic',
      budgetRange: '',
      competitorComparison: '',
      roiExpectations: '',
      tieredPricingNeeded: false,
      tieredPricingDetails: '',
      internalAnalystNotes: '',
      suggestedPricingModel: '',
      riskFactors: '',
      suggestedNextSteps: '',
      companyWebsite: '',
      useCaseDescription: '',
      referenceLinks: '',
      numberOfVerticals: 0,
      demoVerticals: [],
      customVertical: '',
      demoScheduledAt: '',
      timezone: '',
      meetingLink: '',
      nextSteps: '',
      clientSuggestions: '',
      problemStatement: '',
      caseDescription: '',
      stakeholders: '',
      visualizationGoal: '',
      resourcesStatus: '',
      hasSupportTeam: '',
      hasComplexMath: ''
    });
  };


  // Fetch existing form data if ID is provided
  useEffect(() => {
    const fetchFormData = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/forms/${id}`);
          if (response.data) {
            const transformedData = transformAPIDataToForm(response.data);
            setFormData(transformedData);
            setSubmittedFormId(id);
            setIsFormSubmitted(true);
          }
        } catch (error) {
          console.error('Error fetching form data:', error);
          setSubmitStatus({
            type: 'error',
            message: 'Failed to load existing form data.'
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchFormData();
  }, [id]);

  // Check if form has meaningful data for download/share
  const hasFormData = formData.clientName || formData.projectTitle || formData.industrySector;

  return (
    <FormLayout>
      <div className="max-w-5xl mx-auto p-4">
        {/* TABS NAVIGATION */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newTab) => setActiveTab(newTab)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Pricing Form" value="form" />
            <Tab label="Quote Generator" value="quote" disabled={!isFormSubmitted} />
          </Tabs>
        </Box>

        {/* FORM TAB */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-blue-800">Pricing Analyst Form</h1>
              {isFormSubmitted && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                >
                  Create New Form
                </button>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <ClientInformation formData={formData} updateFormData={updateFormData} />
                <ProjectOverview formData={formData} updateFormData={updateFormData} />
                <TechnicalScope formData={formData} updateFormData={updateFormData} />
                <FeaturesFunctionalities formData={formData} updateFormData={updateFormData} />
                <PricingFactors formData={formData} updateFormData={updateFormData} />
                <CompetitiveInputs formData={formData} updateFormData={updateFormData} />
                <AnalystNotes formData={formData} updateFormData={updateFormData} />

                {/* Demo Client Section */}
                <div className="mt-6 p-4 border rounded-lg">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.wantsDemo}
                      onChange={(e) => updateFormData(null, 'wantsDemo', e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">This is a demo client</span>
                  </label>

                  {formData.wantsDemo && (
                    <DemoClient formData={formData} updateFormData={updateFormData} />
                  )}
                </div>

                {/* Business Analysis Section */}
                <div className="mt-6 p-4 border rounded-lg">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.wantsBusinessAnalysis}
                      onChange={(e) => updateFormData(null, 'wantsBusinessAnalysis', e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">This requires business analysis</span>
                  </label>

                  {formData.wantsBusinessAnalysis && (
                    <BusinessAnalysis formData={formData} updateFormData={updateFormData} />
                  )}
                </div>

                {/* File Uploader */}
                <div className="mt-6">
                  <FileUploader files={files} setFiles={setFiles} />
                </div>
                
                {submitStatus.message && (
                  <div 
                    id="success-section"
                    className={`p-4 my-6 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}
                  >
                    <div className="font-medium">{submitStatus.message}</div>
                  </div>
                )}
                
                {/* Submit button - only show if form is not submitted */}
                {!isFormSubmitted && (
                  <div className="mt-8 flex justify-center">
                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Submitting...' : 'Submit Pricing Analysis'}
                    </button>
                  </div>
                )}
                
                {/* Download and Share buttons */}
                {(isFormSubmitted || hasFormData) && (
                  <div className="mt-8 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">
                        {isFormSubmitted ? 'Your Report is Ready!' : 'Preview & Share'}
                      </h3>
                      <p className="text-gray-600 text-center mb-4">
                        {isFormSubmitted 
                          ? 'Download your pricing analysis report or share it with your team.'
                          : 'You can download or share your current form data as a PDF report.'}
                      </p>
                      <DownloadShareButtons
                        formData={formData}
                        formId={submittedFormId}
                        isVisible={true}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </form>
        )}

        {/* QUOTE TAB (Shows after submission) */}
        {activeTab === 'quote' && isFormSubmitted && (
          <QuoteGenerator formData={formData} />
        )}
      </div>
    </FormLayout>
  );
};

export default FormPage;