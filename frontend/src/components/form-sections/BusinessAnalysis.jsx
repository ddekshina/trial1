export default function BusinessAnalysis({ formData, updateFormData }) {
  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold">Business Analysis Information</h3>

      <div>
        <label className="block text-sm font-medium">Problem Statement</label>
        <textarea
          value={formData.problemStatement || ''}
          onChange={(e) => updateFormData(null, 'problemStatement', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Case Description</label>
        <textarea
          value={formData.caseDescription || ''}
          onChange={(e) => updateFormData(null, 'caseDescription', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Stakeholders</label>
        <input
          type="text"
          value={formData.stakeholders || ''}
          onChange={(e) => updateFormData(null, 'stakeholders', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Final Goal</label>
        <textarea
          value={formData.finalGoal || ''}
          onChange={(e) => updateFormData(null, 'finalGoal', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Are Resources Documented?</label>
          <select
            value={formData.resourcesDocumented || ''}
            onChange={(e) => updateFormData(null, 'resourcesDocumented', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="partial">Partially</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Timeline for Documentation</label>
          <input
            type="text"
            placeholder="e.g. Within 2 weeks"
            value={formData.docTimeline || ''}
            onChange={(e) => updateFormData(null, 'docTimeline', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Should We Document?</label>
          <select
            value={formData.shouldDocument || ''}
            onChange={(e) => updateFormData(null, 'shouldDocument', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="discuss">To Be Discussed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Is There a Support Team?</label>
          <select
            value={formData.hasSupportTeam || ''}
            onChange={(e) => updateFormData(null, 'hasSupportTeam', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Complex Math Modeling Involved?</label>
          <select
            value={formData.hasComplexMath || ''}
            onChange={(e) => updateFormData(null, 'hasComplexMath', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="maybe">Maybe</option>
          </select>
        </div>
      </div>
    </div>
  );
}