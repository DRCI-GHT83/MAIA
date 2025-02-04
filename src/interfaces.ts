// interfaces.ts
// Fichier contenant les interfaces utilisées dans l'application.

export interface SearchTool {
  id: string;
  name: string;
  results: string;
}

export interface SavedAnalysis {
  id: string;
  name: string;
  reference_publications: string;
  created_at: string;
}

export interface AnalysisResult {
  referencePresence: {
    publication: string;
    presence: { [toolId: string]: boolean };
    parsed: ParsedPublication;
  }[];
  otherArticles: {
    article: string;
    presence: { [toolId: string]: boolean };
    parsed: ParsedPublication;
  }[];
}

export interface ParsedPublication {
  title: string;
  authors: string[];
  year?: string;
  journal?: string;
  doi?: string;
}

export interface EditingState {
  id: string;
  type: 'reference' | 'other';
  publication: ParsedPublication;
}