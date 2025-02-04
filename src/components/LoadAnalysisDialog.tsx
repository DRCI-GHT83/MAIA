// components/LoadAnalysisDialog.tsx
// Dialogue modal pour charger une analyse sauvegardée, avec fonctionnalité de tri de la liste des analyses.
import React, { useState, useMemo } from 'react';
import { SavedAnalysis } from '../interfaces';
import { Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';

interface LoadAnalysisDialogProps {
  showLoadDialog: boolean;
  setShowLoadDialog: React.Dispatch<React.SetStateAction<boolean>>;
  darkMode: boolean;
  savedAnalyses: SavedAnalysis[];
  renameAnalysisId: string | null;
  newAnalysisName: string;
  setNewAnalysisName: React.Dispatch<React.SetStateAction<string>>;
  handleLoadAnalysis: (analysisId: string) => void;
  handleRenameAnalysisStart: (analysisId: string, currentName: string) => void;
  handleRenameAnalysisCancel: () => void;
  handleRenameAnalysisConfirm: (analysisId: string) => void;
  handleDeleteAnalysis: (analysisId: string) => void;
}

export const LoadAnalysisDialog: React.FC<LoadAnalysisDialogProps> = ({
  showLoadDialog,
  setShowLoadDialog,
  darkMode,
  savedAnalyses,
  renameAnalysisId,
  newAnalysisName,
  setNewAnalysisName,
  handleLoadAnalysis,
  handleRenameAnalysisStart,
  handleRenameAnalysisCancel,
  handleRenameAnalysisConfirm,
  handleDeleteAnalysis,
}) => {
  if (!showLoadDialog) return null;

  // États pour la gestion du tri
  const [sortField, setSortField] = useState<'name' | 'created_at'>(
    'created_at'
  ); // Tri par défaut par date de création
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Direction par défaut: descendant

  // Fonction de tri des analyses
  const sortedAnalyses = useMemo(() => {
    const sortableAnalyses = [...savedAnalyses]; // Crée une copie pour ne pas modifier l'original
    sortableAnalyses.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'created_at') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        comparison = dateA - dateB;
      }
      return sortDirection === 'asc' ? comparison : comparison * -1;
    });
    return sortableAnalyses;
  }, [savedAnalyses, sortField, sortDirection]);

  // Fonction pour changer le champ de tri
  const handleSortBy = (field: 'name' | 'created_at') => {
    if (field === sortField) {
      // Si on clique sur le champ de tri actuel, inverser la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Sinon, changer le champ de tri et mettre la direction par défaut (descendant pour date, ascendant pour nom)
      setSortField(field);
      setSortDirection(field === 'created_at' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        className={`p-6 rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } max-w-md w-full`}
      >
        <h3
          className={`text-xl font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Charger une analyse
        </h3>

        {/* Entêtes de colonne pour le tri */}
        <div className="flex text-sm mb-2">
          <button
            className="flex-1 px-2 py-1 font-semibold hover:underline text-left"
            onClick={() => handleSortBy('name')}
          >
            Nom de l'analyse
            {sortField === 'name' &&
              (sortDirection === 'asc' ? (
                <ChevronUp size={16} className="inline-block ml-1" />
              ) : (
                <ChevronDown size={16} className="inline-block ml-1" />
              ))}
          </button>
          <button
            className="w-24 px-2 py-1 font-semibold hover:underline text-left"
            onClick={() => handleSortBy('created_at')}
          >
            Date
            {sortField === 'created_at' &&
              (sortDirection === 'asc' ? (
                <ChevronUp size={16} className="inline-block ml-1" />
              ) : (
                <ChevronDown size={16} className="inline-block ml-1" />
              ))}
          </button>
          <div className="w-16"> {/* Espace pour les actions */} </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {sortedAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              className={`w-full p-4 rounded-md mb-2 flex justify-between items-center ${
                darkMode
                  ? 'hover:bg-gray-700 bg-gray-750'
                  : 'hover:bg-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex-1 min-w-0"> {/* Permet au texte de se tronquer */}
                {renameAnalysisId === analysis.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newAnalysisName}
                      onChange={(e) => setNewAnalysisName(e.target.value)}
                      className={`p-2 rounded-md w-full ${ // Ajout de w-full
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={() => handleRenameAnalysisConfirm(analysis.id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={handleRenameAnalysisCancel}
                      className="px-2 py-1 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div
                    className={`font-medium cursor-pointer truncate ${ // Ajout de truncate
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    onClick={() => handleLoadAnalysis(analysis.id)}
                    title={analysis.name} // Tooltip pour afficher le nom complet si tronqué
                  >
                    {analysis.name}
                  </div>
                )}
                <div
                  className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {new Date(analysis.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2 w-16 justify-end"> {/* Ajustement largeur et alignement */}
                {renameAnalysisId !== analysis.id && (
                  <button
                    onClick={() =>
                      handleRenameAnalysisStart(analysis.id, analysis.name)
                    }
                    className="p-2 text-gray-500 hover:text-blue-600"
                    aria-label="Renommer"
                  >
                    <Edit size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteAnalysis(analysis.id)}
                  className="p-2 text-gray-500 hover:text-red-600"
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowLoadDialog(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};