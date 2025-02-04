// components/Header.tsx
// Composant Header de l'application contenant le titre, le sous-titre et les boutons d'action.
import React from 'react';
import { Search, Moon, Sun, Save, FolderOpen } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
  showLoginDialog: boolean;
  setShowLoginDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogout: () => void;
  setShowSaveDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLoadDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  user,
  showLoginDialog,
  setShowLoginDialog,
  handleLogout,
  setShowSaveDialog,
  setShowLoadDialog,
}) => {
  return (
    <header className="mb-8 flex justify-between items-center">
      <div>
        <h1
          className={`text-3xl font-bold flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          <Search className="w-8 h-8 text-blue-500" />
          MAIA DRCI
        </h1>
        <p
          className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Outils de recherche académique
        </p>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="w-5 h-5" />
              Sauvegarder
            </button>
            <button
              onClick={() => setShowLoadDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FolderOpen className="w-5 h-5" />
              Charger
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowLoginDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Connexion
          </button>
        )}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${
            darkMode
              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};