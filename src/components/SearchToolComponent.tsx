// components/SearchToolComponent.tsx
// Composant pour un outil de recherche individuel, incluant le nom et la zone de texte pour les résultats.
import React from 'react';
import { SearchTool } from '../interfaces';
import { X, GripVertical } from 'lucide-react';

interface SearchToolComponentProps {
  tool: SearchTool;
  darkMode: boolean;
  updateSearchTool: (
    id: string,
    field: 'name' | 'results',
    value: string
  ) => void;
  removeSearchTool: (id: string) => void;
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
}

export const SearchToolComponent: React.FC<SearchToolComponentProps> = ({
  tool,
  darkMode,
  updateSearchTool,
  removeSearchTool,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  dragOverTool,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, tool.id)}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => handleDragOver(e, tool.id)}
      onDrop={(e) => handleDrop(e, tool.id)}
      className={`border rounded-lg p-4 transition-all duration-200 ${
        darkMode
          ? 'border-gray-700 bg-gray-750'
          : 'border-gray-200 bg-white'
      } ${
        dragOverTool === tool.id
          ? 'border-blue-500 transform scale-[1.02]'
          : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            className={`cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Nom de l'outil (ex : Google Scholar)"
            className={`flex-1 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            value={tool.name}
            onChange={(e) => updateSearchTool(tool.id, 'name', e.target.value)}
          />
          <button
            onClick={() => removeSearchTool(tool.id)}
            className="text-red-500 hover:text-red-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <textarea
        className={`w-full h-32 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          darkMode
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
        }`}
        placeholder="Collez les résultats de recherche de cet outil"
        value={tool.results}
        onChange={(e) => updateSearchTool(tool.id, 'results', e.target.value)}
      />
    </div>
  );
};