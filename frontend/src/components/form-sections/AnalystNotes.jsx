const AnalystNotes = ({ formData, updateFormData }) => {
  return (
    <section className="mb-8 sm:mb-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4 sm:mb-6 pb-2 border-b">
        7. Analyst Notes & Recommendations
      </h2>
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Internal Analyst Notes */}
        <div>
          <label htmlFor="internalAnalystNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Internal Analyst Notes
          </label>
          <textarea
            id="internalAnalystNotes"
            value={formData.internalAnalystNotes || ''}
            onChange={(e) => updateFormData('analystNotes', 'internalAnalystNotes', e.target.value)}
            rows="4"
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Internal observations, complexity assessment, client readiness, etc."
          ></textarea>
        </div>

        {/* Suggested Pricing Model */}
        <div>
          <label htmlFor="suggestedPricingModel" className="block text-sm font-medium text-gray-700 mb-2">
            Suggested Pricing Model
          </label>
          <textarea
            id="suggestedPricingModel"
            value={formData.suggestedPricingModel || ''}
            onChange={(e) => updateFormData('analystNotes', 'suggestedPricingModel', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Recommended pricing structure and rationale"
          ></textarea>
        </div>

        {/* Risk Factors */}
        <div>
          <label htmlFor="riskFactors" className="block text-sm font-medium text-gray-700 mb-2">
            Risk Factors
          </label>
          <textarea
            id="riskFactors"
            value={formData.riskFactors || ''}
            onChange={(e) => updateFormData('analystNotes', 'riskFactors', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Technical, financial, or business risks to consider"
          ></textarea>
        </div>

        {/* Suggested Next Steps */}
        <div>
          <label htmlFor="suggestedNextSteps" className="block text-sm font-medium text-gray-700 mb-2">
            Suggested Next Steps
          </label>
          <textarea
            id="suggestedNextSteps"
            value={formData.suggestedNextSteps || ''}
            onChange={(e) => updateFormData('analystNotes', 'suggestedNextSteps', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Recommended actions for moving forward with this opportunity"
          ></textarea>
        </div>
      </div>
    </section>
  );
};

export default AnalystNotes;