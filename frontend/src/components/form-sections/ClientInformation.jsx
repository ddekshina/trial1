import { useState, useEffect } from 'react';

// Country to currency mapping
const COUNTRY_CURRENCY_MAP = {
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'Germany': 'EUR',
  'France': 'EUR',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Japan': 'JPY',
  'China': 'CNY',
  'India': 'INR',
  'Brazil': 'BRL',
  'Mexico': 'MXN',
  'South Korea': 'KRW',
  'Netherlands': 'EUR',
  'Switzerland': 'CHF',
  'Sweden': 'SEK',
  'Norway': 'NOK',
  'Denmark': 'DKK',
  'Singapore': 'SGD',
  'Hong Kong': 'HKD',
  'New Zealand': 'NZD'
};

const COUNTRIES = Object.keys(COUNTRY_CURRENCY_MAP).sort();

const ClientInformation = ({ formData, updateFormData }) => {
  const [pricingAnalystError, setPricingAnalystError] = useState('');

  // Validate pricing analyst name
  const validatePricingAnalystName = (name) => {
    if (!name) {
      setPricingAnalystError('');
      return;
    }
    
    const regex = /^pricing/i;
    if (!regex.test(name)) {
      setPricingAnalystError('Pricing analyst name must start with "pricing"');
    } else {
      setPricingAnalystError('');
    }
  };

  // Handle country change and auto-update currency
  const handleCountryChange = (country) => {
    updateFormData('clientInformation', 'country', country);
    const currency = COUNTRY_CURRENCY_MAP[country] || '';
    updateFormData('clientInformation', 'currency', currency);
  };

  // Format revenue with currency
  const formatRevenue = (revenue, currency) => {
    if (!revenue || !currency) return revenue;
    return `${currency} ${parseFloat(revenue).toLocaleString()}`;
  };

  return (
    <section className="mb-8 sm:mb-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-blue-800 mb-4 sm:mb-6 pb-2 border-b">
        1. Client Information
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Pricing Analyst Name */}
        <div className="col-span-1 sm:col-span-2">
          <label htmlFor="pricingAnalystName" className="block text-sm font-medium text-gray-700 mb-2">
            Pricing Analyst Name *
          </label>
          <input
            type="text"
            id="pricingAnalystName"
            value={formData.pricingAnalystName || ''}
            onChange={(e) => {
              updateFormData('clientInformation', 'pricingAnalystName', e.target.value);
              validatePricingAnalystName(e.target.value);
            }}
            className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              pricingAnalystError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., pricing_john_smith"
            required
          />
          {pricingAnalystError && (
            <p className="mt-1 text-sm text-red-600">{pricingAnalystError}</p>
          )}
        </div>

        {/* Client Name */}
        <div className="col-span-1">
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
            Client Name *
          </label>
          <input
            type="text"
            id="clientName"
            value={formData.clientName}
            onChange={(e) => updateFormData('clientInformation', 'clientName', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Client Type */}
        <div className="col-span-1">
          <label htmlFor="clientType" className="block text-sm font-medium text-gray-700 mb-2">
            Client Type *
          </label>
          <select
            id="clientType"
            value={formData.clientType}
            onChange={(e) => updateFormData('clientInformation', 'clientType', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="B2B">B2B</option>
            <option value="B2B2B">B2B2B</option>
            <option value="Private Individual">Private Individual</option>
          </select>
        </div>

        {/* Country */}
        <div className="col-span-1">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <select
            id="country"
            value={formData.country || ''}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="col-span-1">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            id="city"
            value={formData.city || ''}
            onChange={(e) => updateFormData('clientInformation', 'city', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter city"
            required
          />
        </div>

        {/* Currency (Auto-populated) */}
        <div className="col-span-1">
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <input
            type="text"
            id="currency"
            value={formData.currency || ''}
            readOnly
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            placeholder="Auto-filled based on country"
          />
        </div>

        {/* Industry Sector */}
        <div className="col-span-1">
          <label htmlFor="industrySector" className="block text-sm font-medium text-gray-700 mb-2">
            Industry Sector *
          </label>
          <input
            type="text"
            id="industrySector"
            value={formData.industrySector}
            onChange={(e) => updateFormData('clientInformation', 'industrySector', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Healthcare, Finance, Technology"
            required
          />
        </div>

        {/* Company Size */}
        <div className="col-span-1">
          <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
            Company Size (employees) *
          </label>
          <input
            type="number"
            id="companySize"
            value={formData.companySize}
            onChange={(e) => updateFormData('clientInformation', 'companySize', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            placeholder="Number of employees"
            required
          />
        </div>

        {/* Annual Revenue */}
        <div className="col-span-1">
          <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700 mb-2">
            Annual Revenue {formData.currency ? `(${formData.currency})` : '($)'} *
          </label>
          <input
            type="number"
            id="annualRevenue"
            value={formData.annualRevenue}
            onChange={(e) => updateFormData('clientInformation', 'annualRevenue', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            placeholder={`Annual revenue in ${formData.currency || 'USD'}`}
            required
          />
          {formData.annualRevenue && formData.currency && (
            <p className="mt-1 text-sm text-gray-600">
              Display: {formatRevenue(formData.annualRevenue, formData.currency)}
            </p>
          )}
        </div>

        {/* Primary Contact Name */}
        <div className="col-span-1">
          <label htmlFor="primaryContactName" className="block text-sm font-medium text-gray-700 mb-2">
            Primary Contact Name *
          </label>
          <input
            type="text"
            id="primaryContactName"
            value={formData.primaryContactName}
            onChange={(e) => updateFormData('clientInformation', 'primaryContactName', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Contact person name"
            required
          />
        </div>
        
        {/* Email */}
        <div className="col-span-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => updateFormData('clientInformation', 'email', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="contact@company.com"
            required
          />
        </div>

        {/* Phone Number */}
        <div className="col-span-1">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => updateFormData('clientInformation', 'phoneNumber', e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        {/* BI Team Questions */}
        <div className="col-span-1 sm:col-span-2">
          <h3 className="text-md font-medium text-gray-800 mb-4 mt-4 border-t pt-4">
            BI Team Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Has BI Team?
              </label>
              <select
                value={formData.hasBiTeam || false}
                onChange={(e) => updateFormData('clientInformation', 'hasBiTeam', e.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wants to use tool with BI team?
              </label>
              <select
                value={formData.wantsToUseToolWithBi || false}
                onChange={(e) => updateFormData('clientInformation', 'wantsToUseToolWithBi', e.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Will provide BI projects?
              </label>
              <select
                value={formData.willProvideBiProjects || false}
                onChange={(e) => updateFormData('clientInformation', 'willProvideBiProjects', e.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientInformation;