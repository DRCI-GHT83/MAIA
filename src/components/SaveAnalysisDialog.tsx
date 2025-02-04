// components/SaveAnalysisDialog.tsx
// Dialogue modal pour sauvegarder une analyse.
import React from 'react';

interface SaveAnalysisDialogProps {
  showSaveDialog: boolean;
  setShowSaveDialog: React.Dispatch<React.SetStateAction<boolean>>;
  darkMode: boolean;
  currentAnalysisName: string;
  setCurrentAnalysisName: React.Dispatch<React.SetStateAction<string>>;
  handleSaveAnalysis: () => Promise<void>;
}

export const SaveAnalysisDialog: React.FC<SaveAnalysisDialogProps> = ({
  showSaveDialog,
  setShowSaveDialog,
  darkMode,
  currentAnalysisName,
  setCurrentAnalysisName,
  handleSaveAnalysis,
}) => {
  if (!showSaveDialog) return null;

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
          Sauvegarder l'analyse
        </h3>
        <input
          type="text"
          placeholder="Nom de l'analyse"
          value={currentAnalysisName}
          onChange={(e) => setCurrentAnalysisName(e.target.value)}
          className={`w-full p-2 mb-4 rounded-md ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowSaveDialog(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};