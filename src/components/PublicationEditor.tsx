// components/PublicationEditor.tsx
// Composant pour éditer les détails d'une publication.
import React, { useState } from 'react';
import { ParsedPublication } from '../interfaces';

export interface PublicationEditorProps {
  publication: ParsedPublication;
  onSave: (edited: ParsedPublication) => void;
  onCancel: () => void;
  darkMode: boolean;
}

export const PublicationEditor: React.FC<PublicationEditorProps> = ({
  publication,
  onSave,
  onCancel,
  darkMode,
}) => {
  // État local pour gérer la publication en cours d'édition
  const [edited, setEdited] = useState<ParsedPublication>({ ...publication });

  // Classe CSS pour les inputs, variant selon le mode sombre ou clair
  const inputClassName = `w-full p-2 border rounded-md ${
    darkMode
      ? 'bg-gray-800 border-gray-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <div
      className={`space-y-4 p-4 rounded-md ${
        darkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}
    >
      {/* Champ pour le titre */}
      <div>
        <label
          className={`block text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          } mb-1`}
        >
          Titre
        </label>
        <input
          type="text"
          value={edited.title}
          onChange={(e) => setEdited({ ...edited, title: e.target.value })}
          className={inputClassName}
        />
      </div>

      {/* Champ pour les auteurs (textarea) */}
      <div>
        <label
          className={`block text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          } mb-1`}
        >
          Auteurs (un par ligne)
        </label>
        <textarea
          value={edited.authors.join('\n')}
          onChange={(e) =>
            setEdited({
              ...edited,
              authors: e.target.value
                .split('\n')
                .map((a) => a.trim())
                .filter(Boolean),
            })
          }
          className={`${inputClassName} h-24`}
        />
      </div>

      {/* Champs pour l'année et le journal (en grid) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className={`block text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            } mb-1`}
          >
            Année
          </label>
          <input
            type="text"
            value={edited.year || ''}
            onChange={(e) => setEdited({ ...edited, year: e.target.value })}
            className={inputClassName}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            } mb-1`}
          >
            Journal
          </label>
          <input
            type="text"
            value={edited.journal || ''}
            onChange={(e) => setEdited({ ...edited, journal: e.target.value })}
            className={inputClassName}
          />
        </div>
      </div>

      {/* Champ pour le DOI */}
      <div>
        <label
          className={`block text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          } mb-1`}
        >
          DOI
        </label>
        <input
          type="text"
          value={edited.doi || ''}
          onChange={(e) => setEdited({ ...edited, doi: e.target.value })}
          className={inputClassName}
          placeholder="10.xxxx/xxxxx"
        />
      </div>

      {/* Boutons d'action (Annuler et Enregistrer) */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => onCancel()}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Annuler
        </button>
        <button
          onClick={() => onSave(edited)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
};