export default function BusinessAnalysis({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Business Analysis Information</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Problem Statement</label>
        <textarea
          value={formData.problemStatement || ''}
          onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Does client have a support team?</label>
          <select
            value={formData.hasSupportTeam || ''}
            onChange={(e) => setFormData({ ...formData, hasSupportTeam: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Complex math modeling involved?</label>
          <select
            value={formData.hasComplexMath || ''}
            onChange={(e) => setFormData({ ...formData, hasComplexMath: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="maybe">Maybe</option>
          </select>
        </div>
      </div>
      {/* Other fields would follow similar pattern */}
    </div>
  );
}