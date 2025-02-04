// components/ReferencePublicationList.tsx
// Composant pour afficher la liste des publications de référence parsées.
import React from 'react';
import { ParsedPublication, EditingState } from '../interfaces';
import { PublicationDisplay } from './PublicationDisplay';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ReferencePublicationListProps {
  darkMode: boolean;
  parsedReferencePublications: ParsedPublication[];
  isReferenceListExpanded: boolean;
  setIsReferenceListExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  expandedItems: Set<string>;
  toggleExpand: (id: string) => void;
  handleEdit: (
    id: string,
    type: 'reference' | 'other',
    publication: ParsedPublication
  ) => void;
  removeArticle: (index: number, type: 'reference' | 'other') => void;
}

export const ReferencePublicationList: React.FC<
  ReferencePublicationListProps
> = ({
  darkMode,
  parsedReferencePublications,
  isReferenceListExpanded,
  setIsReferenceListExpanded,
  expandedItems,
  toggleExpand,
  handleEdit,
  removeArticle,
}) => {
  return (
    <div
      className={`mt-6 p-6 rounded-lg shadow-sm border ${
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
          Liste des Publications de Référence
          <button
            onClick={() => setIsReferenceListExpanded(!isReferenceListExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isReferenceListExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </h2>
      </div>
      {isReferenceListExpanded && parsedReferencePublications.length > 0 && (
        <div>
          {parsedReferencePublications.map((pub, index) => (
            <PublicationDisplay
              key={index}
              publication={pub}
              onEdit={() => handleEdit(index.toString(), 'reference', pub)}
              expanded={expandedItems.has(index.toString())}
              onToggleExpand={() => toggleExpand(index.toString())}
              onDelete={removeArticle}
              type="reference"
              index={index}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
      {isReferenceListExpanded && parsedReferencePublications.length === 0 && (
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Aucune publication de référence saisie.
        </p>
      )}
    </div>
  );
};