import React from 'react';

interface VersionSelectorProps {
  onSelectVersion: (version: string) => void;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({ onSelectVersion }) => {
  const versions = [
    { id: 'demo', name: 'Demo Version', description: 'Interactive preview', color: 'green' },
    { id: 'personal', name: 'Personal Space', description: 'Your experimentation area', color: 'purple' },
    { id: 'business', name: 'Business Focus', description: 'Professional goals', color: 'blue' },
    { id: 'wellness', name: 'Wellness Journey', description: 'Health & mindfulness', color: 'teal' },
    { id: 'creative', name: 'Creative Space', description: 'Artistic pursuits', color: 'orange' },
    { id: 'family', name: 'Family Focus', description: 'Relationships & home', color: 'rose' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Choose Your <span className="text-indigo-600">Journey</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select from 6 different versions of the life manifestation app, each tailored for different goals and audiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {versions.map((version) => (
            <div
              key={version.id}
              onClick={() => onSelectVersion(version.id)}
              className={`bg-white rounded-xl shadow-lg border-l-4 border-${version.color}-500 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group`}
            >
              <div className={`w-12 h-12 bg-${version.color}-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <div className={`w-6 h-6 bg-${version.color}-500 rounded-full`}></div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{version.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{version.description}</p>
              
              <button className={`w-full py-2 bg-${version.color}-500 text-white rounded-lg hover:bg-${version.color}-600 transition-colors font-medium`}>
                Enter {version.name}
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Each version offers the same powerful features with different themes, goals, and target audiences
          </p>
        </div>
      </div>
    </div>
  );
};