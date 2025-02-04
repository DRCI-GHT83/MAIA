// components/LoginDialog.tsx
// Dialogue modal pour la connexion ou l'inscription de l'utilisateur.
import React from 'react';

interface LoginDialogProps {
  showLoginDialog: boolean;
  setShowLoginDialog: React.Dispatch<React.SetStateAction<boolean>>;
  darkMode: boolean;
  isRegistering: boolean;
  setIsRegistering: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleLogin: (e: React.FormEvent) => Promise<void>;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  showLoginDialog,
  setShowLoginDialog,
  darkMode,
  isRegistering,
  setIsRegistering,
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
}) => {
  if (!showLoginDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
          {isRegistering ? 'Créer un compte' : 'Connexion'}
        </h3>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-1`}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 rounded-md ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-1`}
            >
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 rounded-md ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className={`text-sm ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              {isRegistering
                ? 'Déjà un compte ? Se connecter'
                : 'Créer un compte'}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowLoginDialog(false)}
                className={`px-4 py-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                } hover:text-gray-800`}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isRegistering ? "S'inscrire" : 'Se connecter'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};