const TechnicalScope = ({ formData, updateFormData }) => {
  // Handler for multi-select checkboxes
  const handleMultiSelectChange = (field, value) => {
    const updatedValues = (formData[field] || []).includes(value)
      ? formData[field].filter(item => item !== value)
      : [...(formData[field] || []), value];
    
    updateFormData('technicalScope', field, updatedValues);
  };

  // Enhanced data source options
  const dataSourceOptions = [
    'Excel',
    'CSV', 
    'XML',
    'XLS',
    'XLSX',
    'JSON',
    'APIs',
    'Database',
    'Cloud Storage'
  ];

  const integrationOptions = [
    'CRM (Salesforce)',
    'ERP (SAP)',
    'BI Tools (Power BI, Tableau)',
    'Custom APIs'
  ];

  const volumeOptions = [
    'Small (<1M)',
    'Medium (1M–10M)',
    'Large (10M+)'
  ];

  // Database options
  const databaseOptions = [
    'MongoDB',
    'MySQL', 
    'Microsoft SQL',
    'Snowflake',
    'PostgreSQL',
    'Airtable'
  ];

  // API availability handlers
  const handleApiQuestionChange = (field, value) => {
    updateFormData('technicalScope', field, value);
  };

  return (
    <section className="mb-8 sm:mb-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4 sm:mb-6 pb-2 border-b">
        3. Technical Scope
      </h2>
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Data Sources */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Data Sources
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dataSourceOptions.map((option) => (
              <div key={option} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
                <input
                  type="checkbox"
                  id={`datasource-${option}`}
                  checked={(formData.dataSources || []).includes(option)}
                  onChange={() => handleMultiSelectChange('dataSources', option)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`datasource-${option}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Databases */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Databases
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {databaseOptions.map((option) => (
              <div key={option} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
                <input
                  type="checkbox"
                  id={`database-${option}`}
                  checked={(formData.databases || []).includes(option)}
                  onChange={() => handleMultiSelectChange('databases', option)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`database-${option}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Storage Name */}
        <div>
          <label htmlFor="cloudStorageName" className="block text-sm font-medium text-gray-700 mb-2">
            Cloud Storage Service
          </label>
          <input
            type="text"
            id="cloudStorageName"
            value={formData.cloudStorageName || ''}
            onChange={(e) => updateFormData('technicalScope', 'cloudStorageName', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., AWS S3, Google Cloud Storage, Azure Blob Storage"
          />
        </div>

        {/* Google Spreadsheet */}
        <div>
          <label htmlFor="googleSpreadsheet" className="block text-sm font-medium text-gray-700 mb-2">
            Google Spreadsheet Link
          </label>
          <input
            type="url"
            id="googleSpreadsheet"
            value={formData.googleSpreadsheet || ''}
            onChange={(e) => updateFormData('technicalScope', 'googleSpreadsheet', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://docs.google.com/spreadsheets/d/..."
          />
        </div>

        {/* Volume of Data */}
        <div>
          <label htmlFor="volumeOfData" className="block text-sm font-medium text-gray-700 mb-2">
            Volume of Data *
          </label>
          <select
            id="volumeOfData"
            value={formData.volumeOfData || 'Small (<1M)'}
            onChange={(e) => updateFormData('technicalScope', 'volumeOfData', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {volumeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Required Integrations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Required Integrations
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {integrationOptions.map((option) => (
              <div key={option} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
                <input
                  type="checkbox"
                  id={`integration-${option}`}
                  checked={(formData.requiredIntegrations || []).includes(option)}
                  onChange={() => handleMultiSelectChange('requiredIntegrations', option)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`integration-${option}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* API Information Section */}
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h3 className="text-md font-medium text-gray-800 mb-4">API Information</h3>
          
          {/* API Name */}
          <div className="mb-4">
            <label htmlFor="apiName" className="block text-sm font-medium text-gray-700 mb-2">
              Primary API Name
            </label>
            <input
              type="text"
              id="apiName"
              value={formData.apiName || ''}
              onChange={(e) => updateFormData('technicalScope', 'apiName', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Salesforce REST API"
            />
          </div>

          {/* API Available and Documented */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Available?
              </label>
              <select
                value={formData.apiAvailable || false}
                onChange={(e) => handleApiQuestionChange('apiAvailable', e.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Documented?
              </label>
              <select
                value={formData.apiDocumented || false}
                onChange={(e) => handleApiQuestionChange('apiDocumented', e.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>
          </div>

          {/* API Test Kit Link */}
          {formData.apiAvailable && (
            <div className="mb-4">
              <label htmlFor="apiTestKitLink" className="block text-sm font-medium text-gray-700 mb-2">
                API Test Kit Link
              </label>
              <input
                type="url"
                id="apiTestKitLink"
                value={formData.apiTestKitLink || ''}
                onChange={(e) => updateFormData('technicalScope', 'apiTestKitLink', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://developer.example.com/docs/api-explorer"
              />
            </div>
          )}

          {/* Integration-specific API Questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CRM API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CRM: API Documented?
              </label>
              <select
                value={formData.crmApiDocumented || false}
                onChange={(e) => handleApiQuestionChange('crmApiDocumented', e.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>

            {/* ERP API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ERP: API Documented?
              </label>
              <select
                value={formData.erpApiDocumented || false}
                onChange={(e) => handleApiQuestionChange('erpApiDocumented', e.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>

            {/* BI Tools API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BI Tools: API Available?
              </label>
              <select
                value={formData.biToolsApiAvailable || false}
                onChange={(e) => handleApiQuestionChange('biToolsApiAvailable', e.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>

            {/* APIs API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                APIs: API Available?
              </label>
              <select
                value={formData.apisApiAvailable || false}
                onChange={(e) => handleApiQuestionChange('apisApiAvailable', e.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>
          </div>

          {/* APIs Test Kit Link */}
          {formData.apisApiAvailable && (
            <div className="mt-4">
              <label htmlFor="apisTestKitLink" className="block text-sm font-medium text-gray-700 mb-2">
                APIs Test Kit Link
              </label>
              <input
                type="url"
                id="apisTestKitLink"
                value={formData.apisTestKitLink || ''}
                onChange={(e) => updateFormData('technicalScope', 'apisTestKitLink', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api-test-kit.example.com"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TechnicalScope;