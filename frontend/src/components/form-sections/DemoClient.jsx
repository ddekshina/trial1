import { useState } from 'react';

export default function DemoClient({ formData, setFormData }) {
  const [otherVertical, setOtherVertical] = useState('');

  const handleVerticalsChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData({
      ...formData,
      demoVerticals: selected,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Demo Client Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Website</label>
          <input
            type="url"
            value={formData.companyWebsite || ''}
            onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Verticals</label>
          <input
            type="number"
            value={formData.numberOfVerticals || ''}
            onChange={(e) => setFormData({ ...formData, numberOfVerticals: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Verticals</label>
        <select
          multiple
          value={formData.demoVerticals || []}
          onChange={handleVerticalsChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="Healthcare">Healthcare</option>
          <option value="Finance">Finance</option>
          <option value="Retail">Retail</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Other">Other</option>
        </select>
        {formData.demoVerticals?.includes('Other') && (
          <input
            type="text"
            value={otherVertical}
            onChange={(e) => {
              setOtherVertical(e.target.value);
              setFormData({ ...formData, customVertical: e.target.value });
            }}
            placeholder="Specify other vertical"
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        )}
      </div>

      {/* Other fields would follow similar pattern */}
    </div>
  );
}