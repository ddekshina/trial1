import { useCallback } from 'react';

export default function FileUploader({ files, setFiles }) {
  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = useCallback((id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  }, [setFiles]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Attach Documents (PDF, DOC)</label>
      <div className="flex items-center">
        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span>Select Files</span>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="sr-only"
          />
        </label>
        <p className="ml-2 text-sm text-gray-500">PDF, DOC up to 10MB</p>
      </div>

      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-2 border rounded">
              <div className="truncate w-3/4">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}