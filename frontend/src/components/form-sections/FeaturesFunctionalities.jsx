const FeaturesFunctionalities = ({ formData, updateFormData }) => {
  // Handler for multi-select checkboxes
  const handleMultiSelectChange = (field, value) => {
    const updatedValues = (formData[field] || []).includes(value)
      ? formData[field].filter(item => item !== value)
      : [...(formData[field] || []), value];
    
    updateFormData('featuresFunctionalities', field, updatedValues);
  };

  // Real-time capable databases
  const realTimeDatabases = [
    'MongoDB',
    'MySQL', 
    'Microsoft SQL',
    'Snowflake',
    'PostgreSQL',
    'Airtable']; // Add others as needed
  
  // Check if any real-time capable database is selected
  const hasRealTimeDatabase = () => {
    return (formData.databases || []).some(db => 
      realTimeDatabases.includes(db)
    );
  };

  // Interactivity options
  const getInteractivityOptions = () => {
    const baseOptions = ['Drill-down', 'Filtering'];
    
    // Only include "Real-time Updates" if a real-time DB is selected
    if (hasRealTimeDatabase()) {
      return [...baseOptions, 'Real-time Updates'];
    }
    return baseOptions;
  };

  const accessLevelOptions = [
    'Admin',
    'Viewer',
    'Editor'
  ];

  const customizationOptions = [
    'Branding/White-labeling',
    'Theming (Light/Dark)',
    'Language Localization'
  ];

  return (
    <section className="mb-8 sm:mb-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4 sm:mb-6 pb-2 border-b">
        4. Features & Functionalities
      </h2>
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Interactivity Needed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Interactivity Needed
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {getInteractivityOptions().map((option) => {
              const isRealTimeOption = option === 'Real-time Updates';
              const isChecked = (formData.interactivityNeeded || []).includes(option);
              
              // If real-time DB was deselected, remove real-time updates option
              if (isRealTimeOption && !hasRealTimeDatabase() && isChecked) {
                handleMultiSelectChange('interactivityNeeded', option);
              }
              
              return (
                <div 
                  key={option} 
                  className={`flex items-center p-2 hover:bg-gray-50 rounded transition-colors ${
                    isRealTimeOption && !hasRealTimeDatabase() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`interactivity-${option}`}
                    checked={isChecked}
                    onChange={() => handleMultiSelectChange('interactivityNeeded', option)}
                    disabled={isRealTimeOption && !hasRealTimeDatabase()}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      isRealTimeOption && !hasRealTimeDatabase() ? 'cursor-not-allowed' : ''
                    }`}
                  />
                  <label 
                    htmlFor={`interactivity-${option}`} 
                    className={`ml-3 text-sm text-gray-700 cursor-pointer ${
                      isRealTimeOption && !hasRealTimeDatabase() ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    {option}
                    {isRealTimeOption && (
                      <span className="ml-1 text-xs text-gray-500">
                        (requires real-time DB)
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
          {!hasRealTimeDatabase() && (
            <p className="mt-2 text-xs text-gray-500">
              Note: Real-time Updates require MongoDB, Snowflake, or PostgreSQL database
            </p>
          )}
        </div>

        {/* User Access Levels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            User Access Levels
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {accessLevelOptions.map((option) => (
              <div key={option} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
                <input
                  type="checkbox"
                  id={`access-${option}`}
                  checked={(formData.userAccessLevels || []).includes(option)}
                  onChange={() => handleMultiSelectChange('userAccessLevels', option)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`access-${option}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Needs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Customization Needs
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customizationOptions.map((option) => (
              <div key={option} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
                <input
                  type="checkbox"
                  id={`customization-${option}`}
                  checked={(formData.customizationNeeds || []).includes(option)}
                  onChange={() => handleMultiSelectChange('customizationNeeds', option)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`customization-${option}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
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

export default FeaturesFunctionalities;