const PricingFactors = ({ formData, updateFormData }) => {
  // Handler for multi-select checkboxes
  const handleMultiSelectChange = (field, value) => {
    const updatedValues = (formData[field] || []).includes(value)
      ? formData[field].filter(item => item !== value)
      : [...(formData[field] || []), value];
    
    updateFormData('pricingFactors', field, updatedValues);
  };

  const engagementOptions = [
    'One-time Project',
    'Monthly Retainer',
    'Subscription'
  ];

  // Updated delivery model options (removed "API-based")
  const deliveryModelOptions = [
    'Web Portal',
    'Downloadable Reports'
  ];

  const supportPlanOptions = [
    'Basic',
    'Priority',
    'Dedicated Account Manager'
  ];

  return (
    <section className="mb-8 sm:mb-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4 sm:mb-6 pb-2 border-b">
        5. Pricing Factors
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Engagement Type */}
        <div className="col-span-1">
          <label htmlFor="engagementType" className="block text-sm font-medium text-gray-700 mb-2">
            Engagement Type *
          </label>
          <select
            id="engagementType"
            value={formData.engagementType}
            onChange={(e) => updateFormData('pricingFactors', 'engagementType', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {engagementOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Support Plan Required */}
        <div className="col-span-1">
          <label htmlFor="supportPlanRequired" className="block text-sm font-medium text-gray-700 mb-2">
            Support Plan Required *
          </label>
          <select
            id="supportPlanRequired"
            value={formData.supportPlanRequired}
            onChange={(e) => updateFormData('pricingFactors', 'supportPlanRequired', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {supportPlanOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="col-span-1">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => updateFormData('pricingFactors', 'startDate', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* End Date */}
        <div className="col-span-1">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            Estimated End Date *
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => updateFormData('pricingFactors', 'endDate', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Delivery Model */}
        <div className="col-span-1 lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Delivery Model
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliveryModelOptions.map((option) => (
              <div key={option} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
                <input
                  type="checkbox"
                  id={`delivery-${option}`}
                  checked={(formData.deliveryModel || []).includes(option)}
                  onChange={() => handleMultiSelectChange('deliveryModel', option)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`delivery-${option}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
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

export default PricingFactors;