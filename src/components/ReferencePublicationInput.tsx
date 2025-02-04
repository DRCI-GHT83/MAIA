// components/ReferencePublicationInput.tsx
// Composant pour l'input des publications de référence (textarea).
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ReferencePublicationInputProps {
  darkMode: boolean;
  referencePublications: string;
  setReferencePublications: React.Dispatch<React.SetStateAction<string>>;
  isReferenceInputExpanded: boolean;
  toggleReferenceInputExpand: () => void;
}

export const ReferencePublicationInput: React.FC<
  ReferencePublicationInputProps
> = ({
  darkMode,
  referencePublications,
  setReferencePublications,
  isReferenceInputExpanded,
  toggleReferenceInputExpand,
}) => {
  return (
    <div
      className={`p-6 rounded-lg shadow-sm border ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-xl font-semibold ${
            darkMode ? 'text-white' : 'text-gray-800'
          } flex items-center gap-2`}
        >
          Publications de Référence
          <button
            onClick={toggleReferenceInputExpand}
            className="text-gray-400 hover:text-gray-600"
          >
            {isReferenceInputExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </h2>
      </div>
      {isReferenceInputExpanded && (
        <textarea
          className={`w-full h-40 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          placeholder="Entrez vos publications de référence, séparées par une ligne vide"
          value={referencePublications}
          onChange={(e) => setReferencePublications(e.target.value)}
        />
      )}
    </div>
  );
};