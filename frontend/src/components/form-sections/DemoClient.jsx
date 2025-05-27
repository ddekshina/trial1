import { useState } from 'react';

export default function DemoClient({ formData, updateFormData }) {
  const [otherVertical, setOtherVertical] = useState('');

  const handleVerticalsChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    updateFormData(null, 'demoVerticals', selected);
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold">Demo Client Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Company Website</label>
          <input
            type="url"
            value={formData.companyWebsite || ''}
            onChange={(e) => updateFormData(null, 'companyWebsite', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Number of Verticals</label>
          <input
            type="number"
            value={formData.numberOfVerticals || ''}
            onChange={(e) => updateFormData(null, 'numberOfVerticals', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Verticals</label>
        <select
          multiple
          value={formData.demoVerticals || []}
          onChange={handleVerticalsChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
            value={formData.customVertical || ''}
            onChange={(e) => {
              setOtherVertical(e.target.value);
              updateFormData(null, 'customVertical', e.target.value);
            }}
            placeholder="Specify other vertical"
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Demo Use Case</label>
        <textarea
          value={formData.demoUseCase || ''}
          onChange={(e) => updateFormData(null, 'demoUseCase', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Reference Links (comma separated)</label>
        <input
          type="text"
          value={formData.referenceLinks || ''}
          onChange={(e) => updateFormData(null, 'referenceLinks', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Smartcard AI Demo Links</label>
        <input
          type="text"
          value={formData.smartcardLinks || ''}
          onChange={(e) => updateFormData(null, 'smartcardLinks', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Demo Date & Time</label>
          <input
            type="datetime-local"
            value={formData.demoDatetime || ''}
            onChange={(e) => updateFormData(null, 'demoDatetime', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Time Zone</label>
          <input
            type="text"
            placeholder="e.g. UTC+5:30"
            value={formData.demoTimezone || ''}
            onChange={(e) => updateFormData(null, 'demoTimezone', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Country</label>
          <input
            type="text"
            value={formData.demoCountry || ''}
            onChange={(e) => updateFormData(null, 'demoCountry', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">City</label>
          <input
            type="text"
            value={formData.demoCity || ''}
            onChange={(e) => updateFormData(null, 'demoCity', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Meeting Link</label>
        <input
          type="url"
          value={formData.demoMeetingLink || ''}
          onChange={(e) => updateFormData(null, 'demoMeetingLink', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Next Steps After Demo</label>
        <textarea
          value={formData.nextDemoStep || ''}
          onChange={(e) => updateFormData(null, 'nextDemoStep', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Client Project Ideas</label>
        <textarea
          value={formData.clientProjectIdeas || ''}
          onChange={(e) => updateFormData(null, 'clientProjectIdeas', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
    </div>
  );
}