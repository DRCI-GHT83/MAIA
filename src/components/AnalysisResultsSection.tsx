// components/AnalysisResultsSection.tsx
// Section affichant les résultats de l'analyse, y compris les tables de présence des références et des autres articles.
import React from 'react';
import {
  AnalysisResult,
  SearchTool,
  EditingState,
  ParsedPublication,
} from '../interfaces';
import { PublicationDisplay } from './PublicationDisplay';
import { PublicationEditor } from './PublicationEditor';

interface AnalysisResultsSectionProps {
  darkMode: boolean;
  analysisResults: AnalysisResult;
  searchTools: SearchTool[];
  editing: EditingState | null;
  setEditing: React.Dispatch<React.SetStateAction<EditingState | null>>;
  handleEdit: (
    id: string,
    type: 'reference' | 'other',
    publication: ParsedPublication
  ) => void;
  handleSaveEdit: (edited: ParsedPublication) => void;
  expandedItems: Set<string>;
  toggleExpand: (id: string) => void;
  removeArticle: (index: number, type: 'reference' | 'other') => void;
}

export const AnalysisResultsSection: React.FC<AnalysisResultsSectionProps> = ({
  darkMode,
  analysisResults,
  searchTools,
  editing,
  setEditing,
  handleEdit,
  handleSaveEdit,
  expandedItems,
  toggleExpand,
  removeArticle,
}) => {
  return (
    <div className="space-y-8 mt-8">
      {/* Table de présence des publications de référence */}
      <div
        className={`p-6 rounded-lg shadow-sm border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}
        >
          Présence des Publications de Référence par Outil
        </h2>
        {analysisResults.referencePresence.length === 0 ? (
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Aucune publication de référence analysée.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`min-w-full divide-y ${
                darkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}
            >
              <thead>
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    Publication
                  </th>
                  {searchTools.map((tool) => (
                    <th
                      key={tool.id}
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {tool.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  darkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}
              >
                {analysisResults.referencePresence.map((item, index) => (
                  <tr
                    key={index}
                    className={darkMode ? 'bg-gray-800' : 'bg-white'}
                  >
                    <td
                      className={`px-6 py-4 text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}
                    >
                      {editing?.id === index.toString() &&
                      editing.type === 'reference' ? (
                        <PublicationEditor
                          publication={editing.publication}
                          onSave={handleSaveEdit}
                          onCancel={() => setEditing(null)}
                          darkMode={darkMode}
                        />
                      ) : (
                        <PublicationDisplay
                          publication={item.parsed}
                          onEdit={() =>
                            handleEdit(
                              index.toString(),
                              'reference',
                              item.parsed
                            )
                          }
                          expanded={expandedItems.has(index.toString())}
                          onToggleExpand={() => toggleExpand(index.toString())}
                          onDelete={removeArticle}
                          type="reference"
                          index={index}
                          darkMode={darkMode}
                        />
                      )}
                    </td>
                    {searchTools.map((tool) => (
                      <td
                        key={tool.id}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {item.presence[tool.id] ? '✅' : '❌'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Table des autres articles trouvés */}
      <div
        className={`p-6 rounded-lg shadow-sm border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}
        >
          Autres Articles Trouvés (Non Référencés) par Outil
        </h2>
        {analysisResults.otherArticles.length === 0 ? (
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Aucun autre article trouvé.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`min-w-full divide-y ${
                darkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}
            >
              <thead>
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    Article
                  </th>
                  {searchTools.map((tool) => (
                    <th
                      key={tool.id}
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {tool.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  darkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}
              >
                {analysisResults.otherArticles.map((item, index) => (
                  <tr
                    key={index}
                    className={darkMode ? 'bg-gray-800' : 'bg-white'}
                  >
                    <td
                      className={`px-6 py-4 text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}
                    >
                      {editing?.id === index.toString() &&
                      editing.type === 'other' ? (
                        <PublicationEditor
                          publication={editing.publication}
                          onSave={handleSaveEdit}
                          onCancel={() => setEditing(null)}
                          darkMode={darkMode}
                        />
                      ) : (
                        <PublicationDisplay
                          publication={item.parsed}
                          onEdit={() =>
                            handleEdit(index.toString(), 'other', item.parsed)
                          }
                          expanded={expandedItems.has(`other-${index}`)}
                          onToggleExpand={() => toggleExpand(`other-${index}`)}
                          onDelete={removeArticle}
                          type="other"
                          index={index}
                          darkMode={darkMode}
                        />
                      )}
                    </td>
                    {searchTools.map((tool) => (
                      <td
                        key={tool.id}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}
                      >
                        {item.presence[tool.id] ? '✅' : '❌'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
