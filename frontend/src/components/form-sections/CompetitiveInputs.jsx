const CompetitiveInputs = ({ formData, updateFormData }) => {
  return (
    <section className="mb-8 sm:mb-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4 sm:mb-6 pb-2 border-b">
        6. Competitive / Value-based Inputs
      </h2>
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Client Budget Range */}
        <div>
          <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-2">
            Client Budget Range *
          </label>
          <input
            type="number"
            id="budgetRange"
            value={formData.budgetRange || ''}
            onChange={(e) => updateFormData('competitiveInputs', 'budgetRange', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            placeholder="Enter budget range"
            required
          />
        </div>

        {/* Competitor Comparison */}
        <div>
          <label htmlFor="competitorComparison" className="block text-sm font-medium text-gray-700 mb-2">
            Competitor Comparison
          </label>
          <textarea
            id="competitorComparison"
            value={formData.competitorComparison || ''}
            onChange={(e) => updateFormData('competitiveInputs', 'competitorComparison', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Describe competing solutions and their positioning"
          ></textarea>
        </div>

        {/* ROI Expectations */}
        <div>
          <label htmlFor="roiExpectations" className="block text-sm font-medium text-gray-700 mb-2">
            ROI Expectations
          </label>
          <textarea
            id="roiExpectations"
            value={formData.roiExpectations || ''}
            onChange={(e) => updateFormData('competitiveInputs', 'roiExpectations', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Expected return on investment metrics and timeline"
          ></textarea>
        </div>

        {/* Tiered Pricing Needed */}
        <div>
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="tieredPricingNeeded"
              checked={formData.tieredPricingNeeded || false}
              onChange={(e) => updateFormData('competitiveInputs', 'tieredPricingNeeded', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="tieredPricingNeeded" className="ml-3 text-sm font-medium text-gray-700">
              Tiered Pricing Needed
            </label>
          </div>
          
          {formData.tieredPricingNeeded && (
            <div>
              <label htmlFor="tieredPricingDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Tiered Pricing Details
              </label>
              <textarea
                id="tieredPricingDetails"
                value={formData.tieredPricingDetails || ''}
                onChange={(e) => updateFormData('competitiveInputs', 'tieredPricingDetails', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder="Describe the different pricing tiers and their features"
              ></textarea>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CompetitiveInputs;