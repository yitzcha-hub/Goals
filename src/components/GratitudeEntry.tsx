import React, { useState } from 'react';

interface GratitudeEntryProps {
  date: string;
  entries: string[];
  photos: string[];
  onAddEntry: (entry: string) => void;
  onAddPhoto: (file: File) => void;
  isDemo?: boolean;
}

export const GratitudeEntry: React.FC<GratitudeEntryProps> = ({
  date,
  entries = [],
  photos = [],
  onAddEntry,
  onAddPhoto
}) => {
  const [newEntry, setNewEntry] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const safeEntries = Array.isArray(entries) ? entries : [];
  const safePhotos = Array.isArray(photos) ? photos : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.trim()) {
      onAddEntry(newEntry);
      setNewEntry('');
    }
  };


  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-amber-800">
          Gratitude - {date}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-amber-600 hover:text-amber-800 transition-colors"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {safeEntries.length > 0 && (
        <div className="space-y-2 mb-4">
          {safeEntries.slice(0, isExpanded ? safeEntries.length : 2).map((entry, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">✨</span>
              <p className="text-gray-700 text-sm">{entry}</p>
            </div>
          ))}
        </div>
      )}

      {safePhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {safePhotos.slice(0, isExpanded ? safePhotos.length : 3).map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Memory ${index + 1}`}
              className="w-full h-20 object-cover rounded-lg"
            />
          ))}
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="What are you grateful for today?"
          className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
          >
            Add Gratitude
          </button>
          <label className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm cursor-pointer">
            Add Photo
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onAddPhoto(e.target.files[0])}
            />
          </label>
        </div>
      </form>
    </div>
  );
};