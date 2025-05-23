import { useState, useEffect } from 'react';

// Deliverable options with scalable structure
const DELIVERABLE_OPTIONS = [
  'Dashboards',
  'Charts/Graphs', 
  'KPI Reporting',
  'Interactive Reports',
  'Embedded Analytics',
  'Infographics',
  'White-labeled Portals'
];

const SUBSCRIPTION_PLANS = [
  'Starter Lite (Monthly)',
  'Starter Growth(Monthly)',
  'Starter Scale (Monthly)',
  'Enterprise Lite (Monthly)',
  'Enterprise Growth (Monthly)',
  'Enterprise Scale (Monthly)',
  'Starter Lite (Annual)',
  'Starter Growth(Annual)',
  'Starter Scale (Annual)',
  'Enterprise Lite (Annual)',
  'Enterprise Growth (Annual)',
  'Enterprise Scale (Annual)',
  'Generative BI Developer'
];



const AUDIENCE_OPTIONS = [
  'Internal Teams',
  'External Clients',
  'Partners/Vendors'
];

const ProjectOverview = ({ formData, updateFormData }) => {
  // State for managing input values as strings
  const [inputValues, setInputValues] = useState({});

  // Initialize form data and input values
  useEffect(() => {
    if (!formData.expectedDeliverables) {
      updateFormData('projectOverview', 'expectedDeliverables', []);
    }
    if (!formData.targetAudience) {
      updateFormData('projectOverview', 'targetAudience', []);
    }

    // Initialize input values from form data
    const initialInputValues = {};
    (formData.expectedDeliverables || []).forEach(deliverable => {
      initialInputValues[`${deliverable.type}-quantity`] = deliverable.quantity.toString();
      initialInputValues[`${deliverable.type}-widgets`] = deliverable.widgets.toString();
    });
    setInputValues(initialInputValues);
  }, []);

  // Handler for multi-select checkboxes
  const handleMultiSelectChange = (field, value) => {
    const updatedValues = formData[field].includes(value)
      ? formData[field].filter(item => item !== value)
      : [...formData[field], value];
    
    updateFormData('projectOverview', field, updatedValues);
  };

  // Handler for deliverable selection
  const handleDeliverableChange = (deliverableType, isSelected) => {
    let updatedDeliverables = [...(formData.expectedDeliverables || [])];
    
    if (isSelected) {
      updatedDeliverables.push({
        type: deliverableType,
        quantity: 1,
        widgets: 0
      });
      // Initialize input values
      setInputValues(prev => ({
        ...prev,
        [`${deliverableType}-quantity`]: '1',
        [`${deliverableType}-widgets`]: '0'
      }));
    } else {
      updatedDeliverables = updatedDeliverables.filter(d => d.type !== deliverableType);
      // Clean up input values
      setInputValues(prev => {
        const newValues = {...prev};
        delete newValues[`${deliverableType}-quantity`];
        delete newValues[`${deliverableType}-widgets`];
        return newValues;
      });
    }
    
    updateFormData('projectOverview', 'expectedDeliverables', updatedDeliverables);
    updateTotalCounts(updatedDeliverables);
  };

  // Handler for updating deliverable details
  const handleDeliverableDetailChange = (deliverableType, field, value) => {
    // Update the input value
    setInputValues(prev => ({
      ...prev,
      [`${deliverableType}-${field}`]: value
    }));

    // Only update form data if we have a valid number
    if (value === '' || !isNaN(value)) {
      const numericValue = value === '' ? (field === 'quantity' ? 1 : 0) : parseInt(value, 10);
      const updatedDeliverables = (formData.expectedDeliverables || []).map(deliverable => 
        deliverable.type === deliverableType 
          ? { ...deliverable, [field]: numericValue }
          : deliverable
      );
      
      updateFormData('projectOverview', 'expectedDeliverables', updatedDeliverables);
      updateTotalCounts(updatedDeliverables);
    }
  };

  // Handle blur event to validate inputs
  const handleBlur = (deliverableType, field) => {
    const key = `${deliverableType}-${field}`;
    const currentValue = inputValues[key];
    
    if (currentValue === '' || isNaN(currentValue)) {
      const defaultValue = field === 'quantity' ? 1 : 0;
      setInputValues(prev => ({
        ...prev,
        [key]: defaultValue.toString()
      }));
      
      const updatedDeliverables = (formData.expectedDeliverables || []).map(deliverable => 
        deliverable.type === deliverableType 
          ? { ...deliverable, [field]: defaultValue }
          : deliverable
      );
      
      updateFormData('projectOverview', 'expectedDeliverables', updatedDeliverables);
      updateTotalCounts(updatedDeliverables);
    }
  };

  // Calculate and update total counts
  const updateTotalCounts = (deliverables) => {
    const totalIntegrations = deliverables.reduce((sum, d) => sum + (d.quantity || 0), 0);
    const totalWidgets = deliverables.reduce((sum, d) => sum + (d.widgets || 0), 0);
    
    updateFormData('projectOverview', 'numberOfIntegrations', totalIntegrations);
    updateFormData('projectOverview', 'numberOfWidgets', totalWidgets);
  };

  // Check if a deliverable is selected
  const isDeliverableSelected = (deliverableType) => {
    return (formData.expectedDeliverables || []).some(d => d.type === deliverableType);
  };

  // Get deliverable details for display
  const getDeliverableDetails = (deliverableType) => {
    const deliverable = (formData.expectedDeliverables || []).find(d => d.type === deliverableType);
    if (!deliverable) return { quantity: '1', widgets: '0' };

    return {
      quantity: inputValues[`${deliverableType}-quantity`] ?? deliverable.quantity.toString(),
      widgets: inputValues[`${deliverableType}-widgets`] ?? deliverable.widgets.toString(),
    };
  };

  return (
    <section className="mb-8 sm:mb-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4 sm:mb-6 pb-2 border-b">
        2. Project Overview
      </h2>
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Project Title */}
        <div>
          <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            id="projectTitle"
            value={formData.projectTitle || ''}
            onChange={(e) => updateFormData('projectOverview', 'projectTitle', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter project title"
            required
          />
        </div>

        {/* Project Description */}
        <div>
          <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Project Description *
          </label>
          <textarea
            id="projectDescription"
            value={formData.projectDescription || ''}
            onChange={(e) => updateFormData('projectOverview', 'projectDescription', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Describe the project scope and requirements"
            required
          ></textarea>
        </div>

        {/* Business Objective */}
        <div>
          <label htmlFor="businessObjective" className="block text-sm font-medium text-gray-700 mb-2">
            Business Objective *
          </label>
          <textarea
            id="businessObjective"
            value={formData.businessObjective || ''}
            onChange={(e) => updateFormData('projectOverview', 'businessObjective', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="What business goals does this project aim to achieve?"
            required
          ></textarea>
        </div>

        {/* Expected Deliverables */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Expected Deliverables
          </label>
          <div className="space-y-4">
            {DELIVERABLE_OPTIONS.map((option) => {
              const isSelected = isDeliverableSelected(option);
              const details = getDeliverableDetails(option);
              
              return (
                <div key={option} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id={`deliverable-${option}`}
                      checked={isSelected}
                      onChange={(e) => handleDeliverableChange(option, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`deliverable-${option}`} className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                      {option}
                    </label>
                  </div>
                  
                  {isSelected && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-7">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantity
                        </label>  
                        <input
                          type="number" 
                          min="1"
                          value={details.quantity}
                          onChange={(e) => handleDeliverableDetailChange(option, 'quantity', e.target.value)}
                          onBlur={() => handleBlur(option, 'quantity')}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Number of Widgets
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={details.widgets}
                          onChange={(e) => handleDeliverableDetailChange(option, 'widgets', e.target.value)}
                          onBlur={() => handleBlur(option, 'widgets')}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Counts Display */}
        {(formData.expectedDeliverables || []).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Project Totals</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Total Integrations: </span>
                <span className="text-blue-600 font-semibold">{formData.numberOfIntegrations || 0}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Widgets: </span>
                <span className="text-blue-600 font-semibold">{formData.numberOfWidgets || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Manual Number Overrides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="numberOfIntegrations" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Integrations (Manual Entry)
            </label>
            <input
              type="number"
              id="numberOfIntegrations"
              min="0"
              value={formData.numberOfIntegrations || 0}
              onChange={(e) => updateFormData('projectOverview', 'numberOfIntegrations', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="numberOfWidgets" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Widgets (Manual Entry)
            </label>
            <input
              type="number"
              id="numberOfWidgets"
              min="0"
              value={formData.numberOfWidgets || 0}
              onChange={(e) => updateFormData('projectOverview', 'numberOfWidgets', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
<div>
  <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700 mb-2">
    Subscription Plan *
  </label>
  <select
    id="subscriptionPlan"
    value={formData.subscriptionPlan || ''}
    onChange={(e) => updateFormData('projectOverview', 'subscriptionPlan', e.target.value)}
    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    required
  >
    <option value="">Select a plan</option>
    {SUBSCRIPTION_PLANS.map((plan) => (
      <option key={plan} value={plan}>
        {plan}
      </option>
    ))}
  </select>
</div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Target Audience
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {AUDIENCE_OPTIONS.map((option) => (
              <div key={option} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
                <input
                  type="checkbox"
                  id={`audience-${option}`}
                  checked={(formData.targetAudience || []).includes(option)}
                  onChange={() => handleMultiSelectChange('targetAudience', option)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`audience-${option}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectOverview;