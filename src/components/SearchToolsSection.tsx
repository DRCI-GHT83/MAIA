// components/SearchToolsSection.tsx
// Section regroupant la liste des outils de recherche et le bouton pour en ajouter, rendu collapsable.
import React from 'react';
import { SearchTool } from '../interfaces';
import { PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchToolComponent } from './SearchToolComponent';

interface SearchToolsSectionProps {
  darkMode: boolean;
  searchTools: SearchTool[];
  addSearchTool: () => void;
  removeSearchTool: (id: string) => void;
  updateSearchTool: (
    id: string,
    field: 'name' | 'results',
    value: string
  ) => void;
  handleDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    toolId: string
  ) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (
    e: React.DragEvent<HTMLDivElement>,
    toolId: string
  ) => void;
  handleDrop: (
    e: React.DragEvent<HTMLDivElement>,
    targetToolId: string
  ) => void;
  dragOverTool: string | null;
  isSearchToolsExpanded: boolean;
  toggleSearchToolsExpand: () => void;
}

export const SearchToolsSection: React.FC<SearchToolsSectionProps> = ({
  darkMode,
  searchTools,
  addSearchTool,
  removeSearchTool,
  updateSearchTool,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  dragOverTool,
  isSearchToolsExpanded,
  toggleSearchToolsExpand,
}) => {
  return (
    <div
      className={`p-6 rounded-lg shadow-sm border ${
        darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      } mt-8`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-xl font-semibold ${
            darkMode ? 'text-white' : 'text-gray-800'
          } flex items-center gap-2`}
        >
          Outils de Recherche
          <button
            onClick={toggleSearchToolsExpand}
            className="text-gray-400 hover:text-gray-600"
          >
            {isSearchToolsExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </h2>
        </div>
      {isSearchToolsExpanded && (
        <>
          <div className="space-y-4">
            {searchTools.map((tool, index) => (
              <SearchToolComponent
                key={tool.id}
                tool={tool}
                darkMode={darkMode}
                updateSearchTool={updateSearchTool}
                removeSearchTool={removeSearchTool}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                dragOverTool={dragOverTool}
              />
            ))}
          </div>
          <button
            onClick={addSearchTool}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-4"
          >
            <PlusCircle className="w-5 h-5" />
            Ajouter un Outil
          </button>
        </>
      )}
    </div>
  );
};