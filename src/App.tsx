import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  X,
  Search,
  Download,
  Edit2,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
  Save,
  FolderOpen,
  GripVertical,
  Trash2,
  Edit,
} from 'lucide-react';
import { supabase } from './supabase';

//////////////////////
// Interfaces
//////////////////////

interface SearchTool {
  id: string;
  name: string;
  results: string;
}

interface SavedAnalysis {
  id: string;
  name: string;
  reference_publications: string;
  created_at: string;
}

interface AnalysisResult {
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

interface ParsedPublication {
  title: string;
  authors: string[];
  year?: string;
  journal?: string;
  doi?: string;
}

interface EditingState {
  id: string;
  type: 'reference' | 'other';
  publication: ParsedPublication;
}

interface PublicationDisplayProps {
  publication: ParsedPublication;
  onEdit: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  type: 'reference' | 'other';
  index: number;
  darkMode: boolean;
}

//////////////////////
// Helper Functions from Original Code
//////////////////////

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function parsePublication(text: string): ParsedPublication {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  let authors: string[] = [];
  let year: string | undefined;
  let title: string = '';
  let journal: string | undefined;
  let doi: string | undefined;

  for (const line of lines) {
    if (line.startsWith('Auteurs :')) {
      const authorsText = line.replace('Auteurs :', '').trim();
      authors = authorsText
        .split(/[,;]/)
        .map((author) => author.trim())
        .filter(
          (author) =>
            author.length > 0 &&
            !author.includes('Study Group') &&
            !author.includes('Investigators')
        );
    } else if (line.startsWith('Date de publication :')) {
      const dateText = line.replace('Date de publication :', '').trim();
      const yearMatch = dateText.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        year = yearMatch[0];
      }
    } else if (line.startsWith('Titre complet :')) {
      title = line.replace('Titre complet :', '').trim();
    } else if (line.startsWith('Journal :')) {
      journal = line.replace('Journal :', '').trim();
    } else if (line.startsWith('DOI :')) {
      doi = line.replace('DOI :', '').trim();
      if (!doi.startsWith('PMID:')) {
        const doiMatch = doi.match(/\b(10\.\d{4,}(?:\.\d+)*\/[^.\s]+)\b/);
        if (doiMatch) {
          doi = doiMatch[1];
        }
      }
    }
  }

  return {
    title: title || 'Sans titre',
    authors: authors.map((author) => author.trim()).filter(Boolean),
    year,
    journal,
    doi,
  };
}

function PublicationEditor({
  publication,
  onSave,
  onCancel,
  darkMode,
}: {
  publication: ParsedPublication;
  onSave: (edited: ParsedPublication) => void;
  onCancel: () => void;
  darkMode: boolean;
}) {
  const [edited, setEdited] = useState<ParsedPublication>({ ...publication });

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
}

//////////////////////
// PublicationDisplay Component - Modified to include delete and type/index props
//////////////////////

function PublicationDisplay({
  publication,
  onEdit,
  expanded,
  onToggleExpand,
  onDelete,
  type,
  index,
  darkMode,
}: PublicationDisplayProps) {
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
}

//////////////////////
// App Component - Merged and Modified
//////////////////////

function App() {
  //////////////////////
  // États principaux
  //////////////////////
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [referencePublications, setReferencePublications] =
    useState<string>('');
  const [parsedReferencePublications, setParsedReferencePublications] =
    useState<ParsedPublication[]>([]);
  const [searchTools, setSearchTools] = useState<SearchTool[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(
    null
  );
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [currentAnalysisName, setCurrentAnalysisName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [draggedTool, setDraggedTool] = useState<string | null>(null);
  const [dragOverTool, setDragOverTool] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReferenceListExpanded, setIsReferenceListExpanded] = useState(true);
  const [renameAnalysisId, setRenameAnalysisId] = useState<string | null>(null);
  const [newAnalysisName, setNewAnalysisName] = useState<string>('');

  // États pour l'authentification par email/mot de passe
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  //////////////////////
  // Effets
  //////////////////////
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadSavedAnalyses();
    }
  }, [user]);

  useEffect(() => {
    setParsedReferencePublications(
      splitPublications(referencePublications).map(parsePublication)
    );
  }, [referencePublications]);

  //////////////////////
  // Fonctions d'authentification
  //////////////////////
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = isRegistering
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      setShowLoginDialog(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  //////////////////////
  // Chargement des analyses sauvegardées
  //////////////////////
  const loadSavedAnalyses = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des analyses :', error);
      return;
    }
    setSavedAnalyses(data);
  };

  //////////////////////
  // Sauvegarde d'une analyse
  //////////////////////
  const handleSaveAnalysis = async () => {
    if (!user) {
      alert('Veuillez vous connecter pour sauvegarder une analyse');
      return;
    }

    if (!currentAnalysisName.trim()) {
      alert("Veuillez entrer un nom pour l'analyse");
      return;
    }

    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert([
        {
          name: currentAnalysisName,
          reference_publications: referencePublications,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (analysisError) {
      console.error(
        "Erreur lors de la sauvegarde de l'analyse :",
        analysisError
      );
      return;
    }

    const searchToolsData = searchTools.map((tool) => ({
      analysis_id: analysis.id,
      name: tool.name,
      results: tool.results,
    }));

    const { error: toolsError } = await supabase
      .from('search_tools')
      .insert(searchToolsData);

    if (toolsError) {
      console.error(
        'Erreur lors de la sauvegarde des outils de recherche :',
        toolsError
      );
      return;
    }

    setShowSaveDialog(false);
    setCurrentAnalysisName('');
    await loadSavedAnalyses();
  };

  //////////////////////
  // Chargement et édition d'une analyse sauvegardée
  //////////////////////
  const handleLoadAnalysis = async (analysisId: string) => {
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError) {
      console.error("Erreur lors du chargement de l'analyse :", analysisError);
      return;
    }

    const { data: tools, error: toolsError } = await supabase
      .from('search_tools')
      .select('*')
      .eq('analysis_id', analysisId);

    if (toolsError) {
      console.error(
        'Erreur lors du chargement des outils de recherche :',
        toolsError
      );
      return;
    }

    setReferencePublications(analysis.reference_publications);
    setSearchTools(
      tools.map((tool: any) => ({
        id: tool.id.toString(),
        name: tool.name,
        results: tool.results,
      }))
    );

    setShowLoadDialog(false);
  };

  const handleRenameAnalysisStart = (
    analysisId: string,
    currentName: string
  ) => {
    setRenameAnalysisId(analysisId);
    setNewAnalysisName(currentName);
  };

  const handleRenameAnalysisCancel = () => {
    setRenameAnalysisId(null);
    setNewAnalysisName('');
  };

  const handleRenameAnalysisConfirm = async (analysisId: string) => {
    if (!newAnalysisName.trim()) {
      alert("Veuillez entrer un nouveau nom pour l'analyse.");
      return;
    }

    const { error } = await supabase
      .from('analyses')
      .update({ name: newAnalysisName })
      .eq('id', analysisId);

    if (error) {
      console.error("Erreur lors du renommage de l'analyse :", error);
      alert("Erreur lors du renommage de l'analyse.");
    } else {
      setRenameAnalysisId(null);
      setNewAnalysisName('');
      await loadSavedAnalyses(); // Recharger la liste après renommage
    }
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?')) {
      const { error: toolsError } = await supabase
        .from('search_tools')
        .delete()
        .eq('analysis_id', analysisId);

      if (toolsError) {
        console.error(
          'Erreur lors de la suppression des outils de recherche liés :',
          toolsError
        );
        alert("Erreur lors de la suppression de l'analyse.");
        return;
      }

      const { error: analysisError } = await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId);

      if (analysisError) {
        console.error(
          "Erreur lors de la suppression de l'analyse :",
          analysisError
        );
        alert("Erreur lors de la suppression de l'analyse.");
      } else {
        await loadSavedAnalyses(); // Recharger la liste après suppression
      }
    }
  };

  //////////////////////
  // Gestion des outils de recherche (ajout, suppression, mise à jour, drag & drop)
  //////////////////////
  const addSearchTool = () => {
    const newTool: SearchTool = {
      id: Date.now().toString(),
      name: '',
      results: '',
    };
    setSearchTools([...searchTools, newTool]);
  };

  const removeSearchTool = (id: string) => {
    setSearchTools(searchTools.filter((tool) => tool.id !== id));
  };

  const updateSearchTool = (
    id: string,
    field: 'name' | 'results',
    value: string
  ) => {
    setSearchTools(
      searchTools.map((tool) =>
        tool.id === id ? { ...tool, [field]: value } : tool
      )
    );
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    toolId: string
  ) => {
    setDraggedTool(toolId);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedTool(null);
    setDragOverTool(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    toolId: string
  ) => {
    e.preventDefault();
    if (draggedTool === toolId) return;
    setDragOverTool(toolId);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetToolId: string
  ) => {
    e.preventDefault();
    if (!draggedTool || draggedTool === targetToolId) return;

    const draggedIndex = searchTools.findIndex(
      (tool) => tool.id === draggedTool
    );
    const targetIndex = searchTools.findIndex(
      (tool) => tool.id === targetToolId
    );

    const newTools = [...searchTools];
    const [draggedItem] = newTools.splice(draggedIndex, 1);
    newTools.splice(targetIndex, 0, draggedItem);

    setSearchTools(newTools);
    setDraggedTool(null);
    setDragOverTool(null);
  };

  //////////////////////
  // Analyse Results Function - From Original Code - Modified for current state
  //////////////////////

  const analyzeResults = async () => {
    setIsAnalyzing(true);
    const references = splitPublications(referencePublications);

    const referencePresence = references.map((publication) => {
      const parsed = parsePublication(publication);
      const normalizedTitle = normalizeTitle(parsed.title);

      return {
        publication,
        parsed,
        presence: Object.fromEntries(
          searchTools.map((tool) => {
            const toolResults = splitPublications(tool.results).map(
              parsePublication
            );

            const found = toolResults.some(
              (result) => normalizeTitle(result.title) === normalizedTitle
            );

            return [tool.id, found];
          })
        ),
      };
    });

    const otherArticles = new Set<string>();
    searchTools.forEach((tool) => {
      const results = splitPublications(tool.results);

      results.forEach((result) => {
        const parsedResult = parsePublication(result);
        const normalizedResultTitle = normalizeTitle(parsedResult.title);

        const isReference = references.some((ref) => {
          const parsedRef = parsePublication(ref);
          return normalizeTitle(parsedRef.title) === normalizedResultTitle;
        });

        if (!isReference) {
          otherArticles.add(result);
        }
      });
    });

    const otherArticlesAnalysis = Array.from(otherArticles).map((article) => {
      const parsed = parsePublication(article);
      const normalizedTitle = normalizeTitle(parsed.title);

      return {
        article,
        parsed,
        presence: Object.fromEntries(
          searchTools.map((tool) => {
            const toolResults = splitPublications(tool.results).map(
              parsePublication
            );

            const found = toolResults.some(
              (result) => normalizeTitle(result.title) === normalizedTitle
            );

            return [tool.id, found];
          })
        ),
      };
    });

    setAnalysisResults({
      referencePresence,
      otherArticles: otherArticlesAnalysis,
    });
    setIsAnalyzing(false);
  };

  const handleEdit = (
    id: string,
    type: 'reference' | 'other',
    publication: ParsedPublication
  ) => {
    setEditing({ id, type, publication });
  };

  const handleSaveEdit = (edited: ParsedPublication) => {
    if (!editing || !analysisResults) return;

    setAnalysisResults((prev) => {
      if (!prev) return prev;

      if (editing.type === 'reference') {
        return {
          ...prev,
          referencePresence: prev.referencePresence.map((item, idx) =>
            idx.toString() === editing.id ? { ...item, parsed: edited } : item
          ),
        };
      } else {
        return {
          ...prev,
          otherArticles: prev.otherArticles.map((item, idx) =>
            idx.toString() === editing.id ? { ...item, parsed: edited } : item
          ),
        };
      }
    });

    setEditing(null);
  };

  const removeArticle = (index: number, type: 'reference' | 'other') => {
    if (type === 'reference') {
      const publications = splitPublications(referencePublications);
      publications.splice(index, 1);
      setReferencePublications(publications.join('\n\n'));
    } else if (type === 'other') {
      if (!analysisResults) return;
      const updatedOtherArticles = [...analysisResults.otherArticles];
      updatedOtherArticles.splice(index, 1);
      setAnalysisResults({
        ...analysisResults,
        otherArticles: updatedOtherArticles,
      });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  function splitPublications(text: string): string[] {
    const articles = text
      .split(/\n\s*\n/)
      .filter((article) => article.trim().length > 0);
    return articles;
  }

  function exportToCSV(
    analysisResults: AnalysisResult,
    searchTools: SearchTool[]
  ) {
    const headers = [
      'Type',
      'Titre',
      'Auteurs',
      'Année',
      'Journal',
      'DOI',
      ...searchTools.map((tool) => tool.name),
    ];

    const referenceRows = analysisResults.referencePresence.map((item) => {
      const publication = item.parsed;
      return [
        'Référence',
        `"${publication.title}"`,
        `"${publication.authors.join('; ')}"`,
        `"${publication.year || ''}"`,
        `"${publication.journal || ''}"`,
        `"${publication.doi || ''}"`,
        ...searchTools.map((tool) => (item.presence[tool.id] ? 'Oui' : 'Non')),
      ].join(',');
    });

    const otherRows = analysisResults.otherArticles.map((item) => {
      const article = item.parsed;
      return [
        'Autre',
        `"${article.title}"`,
        `"${article.authors.join('; ')}"`,
        `"${article.year || ''}"`,
        `"${article.journal || ''}"`,
        `"${article.doi || ''}"`,
        ...searchTools.map((tool) => (item.presence[tool.id] ? 'Oui' : 'Non')),
      ].join(',');
    });

    const csv = [headers.join(','), ...referenceRows, ...otherRows].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'analyse_publications.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  //////////////////////
  // Rendu JSX
  //////////////////////

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
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
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Zone de saisie des publications de référence */}
        <div
          className={`p-6 rounded-lg shadow-sm border ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            Publications de Référence
          </h2>
          <textarea
            className={`w-full h-40 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Entrez vos publications de référence, séparées par une ligne vide"
            value={referencePublications}
            onChange={(e) => setReferencePublications(e.target.value)}
          />
        </div>

        {/* Liste des publications de référence - Collapsible and Consistent Design */}
        <div
          className={`mt-6 p-6 rounded-lg shadow-sm border ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-800'
              } flex items-center gap-2`}
            >
              Liste des Publications de Référence
              <button
                onClick={() =>
                  setIsReferenceListExpanded(!isReferenceListExpanded)
                }
                className="text-gray-400 hover:text-gray-600"
              >
                {isReferenceListExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </h2>
          </div>
          {isReferenceListExpanded &&
            parsedReferencePublications.length > 0 && (
              <div>
                {parsedReferencePublications.map((pub, index) => (
                  <PublicationDisplay
                    key={index}
                    publication={pub}
                    onEdit={() =>
                      handleEdit(index.toString(), 'reference', pub)
                    }
                    expanded={expandedItems.has(index.toString())}
                    onToggleExpand={() => toggleExpand(index.toString())}
                    onDelete={removeArticle}
                    type="reference"
                    index={index}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            )}
          {isReferenceListExpanded &&
            parsedReferencePublications.length === 0 && (
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Aucune publication de référence saisie.
              </p>
            )}
        </div>

        {/* Outils de recherche */}
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
              }`}
            >
              Outils de Recherche
            </h2>
            <button
              onClick={addSearchTool}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Ajouter un Outil
            </button>
          </div>
          <div className="space-y-4">
            {searchTools.map((tool, index) => (
              <div
                key={tool.id}
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
                      onChange={(e) =>
                        updateSearchTool(tool.id, 'name', e.target.value)
                      }
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
                  onChange={(e) =>
                    updateSearchTool(tool.id, 'results', e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={analyzeResults}
            className={`px-6 py-3 rounded-md transition-colors font-semibold ${
              !referencePublications || searchTools.length === 0 || isAnalyzing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
            disabled={
              !referencePublications || searchTools.length === 0 || isAnalyzing
            }
          >
            {isAnalyzing ? 'Analyse en cours...' : 'Analyser les Résultats'}
          </button>
          {analysisResults && (
            <button
              onClick={() => exportToCSV(analysisResults, searchTools)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exporter en CSV
            </button>
          )}
        </div>

        {analysisResults && (
          <div className="space-y-8 mt-8">
            <div
              className={`p-6 rounded-lg shadow-sm border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
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
                <p
                  className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
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
                                onToggleExpand={() =>
                                  toggleExpand(index.toString())
                                }
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

            <div
              className={`p-6 rounded-lg shadow-sm border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
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
                <p
                  className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
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
                                  handleEdit(
                                    index.toString(),
                                    'other',
                                    item.parsed
                                  )
                                }
                                expanded={expandedItems.has(`other-${index}`)}
                                onToggleExpand={() =>
                                  toggleExpand(`other-${index}`)
                                }
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
        )}
      </div>

      {/* Dialogue de sauvegarde */}
      {showSaveDialog && (
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
      )}

      {/* Dialogue de chargement */}
      {showLoadDialog && (
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
            <div className="max-h-96 overflow-y-auto">
              {savedAnalyses.map((analysis) => (
                <div // Changed from button to div for layout flexibility
                  key={analysis.id}
                  className={`w-full p-4 rounded-md mb-2 flex justify-between items-center ${
                    darkMode
                      ? 'hover:bg-gray-700 bg-gray-750'
                      : 'hover:bg-gray-100 bg-gray-50'
                  }`}
                >
                  <div>
                    {renameAnalysisId === analysis.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newAnalysisName}
                          onChange={(e) => setNewAnalysisName(e.target.value)}
                          className={`p-2 rounded-md ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <button
                          onClick={() =>
                            handleRenameAnalysisConfirm(analysis.id)
                          }
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
                        className={`font-medium cursor-pointer ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                        onClick={() => handleLoadAnalysis(analysis.id)} // Load on name click
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
                  <div className="flex gap-2">
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
      )}

      {/* Dialogue de connexion (email / mot de passe) */}
      {showLoginDialog && (
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
      )}
    </div>
  );
}

export default App;
