// components/PublicationDisplay.tsx
// Composant pour afficher une publication de manière concise ou détaillée.
import React from 'react';
import { ParsedPublication } from '../interfaces';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
} from 'lucide-react';

export interface PublicationDisplayProps {
  publication: ParsedPublication;
  onEdit: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onDelete: (index: number, type: 'reference' | 'other') => void;
  type: 'reference' | 'other';
  index: number;
  darkMode: boolean;
}

export const PublicationDisplay: React.FC<PublicationDisplayProps> = ({
  publication,
  onEdit,
  expanded,
  onToggleExpand,
  onDelete,
  type,
  index,
  darkMode,
}) => {
  return (
    <div
      className={`space-y-2 p-2 rounded-md ${
        darkMode ? 'bg-gray-800 text-white' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="font-medium flex items-center gap-2">
            {publication.title}
            <button
              onClick={onToggleExpand}
              className="text-gray-400 hover:text-gray-600"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          {expanded && (
            <>
              {publication.authors.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  Auteurs : {publication.authors.join(', ')}
                </div>
              )}
              <div className="text-sm text-gray-500 mt-1">
                {publication.year && (
                  <span className="mr-2">Année : {publication.year}</span>
                )}
                {publication.journal && (
                  <span>Journal : {publication.journal}</span>
                )}
              </div>
              {publication.doi && (
                <div className="text-sm text-blue-600 mt-1">
                  <a
                    href={`https://doi.org/${publication.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    DOI : {publication.doi}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-2 py-1 text-gray-400 hover:text-blue-600 border border-gray-200 rounded-md hover:border-blue-600"
          >
            <Edit2 size={16} className={darkMode ? 'text-blue-400' : ''} />
          </button>
          <button
            onClick={() => onDelete(index, type)}
            className="px-2 py-1 text-gray-400 hover:text-red-600 border border-gray-200 rounded-md hover:border-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};