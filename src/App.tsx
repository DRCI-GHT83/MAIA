// App.tsx
// Composant principal de l'application, intégrant la collapsibilité pour les sections Publications de Référence et Outils de Recherche.
import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  X,
  Search,
  Download,
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
import {
  PublicationDisplay,
  PublicationDisplayProps,
} from './components/PublicationDisplay';
import {
  PublicationEditor,
  PublicationEditorProps,
} from './components/PublicationEditor';
import {
  SearchTool,
  SavedAnalysis,
  AnalysisResult,
  ParsedPublication,
  EditingState,
} from './interfaces';
import { normalizeTitle, parsePublication, splitPublications } from './utils';
import { Header } from './components/Header';
import { ReferencePublicationInput } from './components/ReferencePublicationInput';
import { ReferencePublicationList } from './components/ReferencePublicationList';
import { SearchToolsSection } from './components/SearchToolsSection';
import { AnalysisResultsSection } from './components/AnalysisResultsSection';
import { SaveAnalysisDialog } from './components/SaveAnalysisDialog';
import { LoadAnalysisDialog } from './components/LoadAnalysisDialog';
import { LoginDialog } from './components/LoginDialog';

//////////////////////
// Composant App
//////////////////////
function App() {
  //////////////////////
  // États principaux
  //////////////////////
  // État pour le mode sombre
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  // Publications de référence entrées par l'utilisateur (texte brut)
  const [referencePublications, setReferencePublications] =
    useState<string>('');
  // Publications de référence parsées
  const [parsedReferencePublications, setParsedReferencePublications] =
    useState<ParsedPublication[]>([]);
  // Outils de recherche configurés
  const [searchTools, setSearchTools] = useState<SearchTool[]>([]);
  // Résultats de l'analyse
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(
    null
  );
  // État d'édition d'une publication
  const [editing, setEditing] = useState<EditingState | null>(null);
  // Ensemble des publications étendues pour l'affichage détaillé
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  // Utilisateur courant
  const [user, setUser] = useState<any>(null);
  // Analyses sauvegardées pour l'utilisateur
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  // Nom de l'analyse en cours de sauvegarde
  const [currentAnalysisName, setCurrentAnalysisName] = useState<string>('');
  // Visibilité du dialogue de sauvegarde
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  // Visibilité du dialogue de chargement
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  // Outil de recherche en cours de drag
  const [draggedTool, setDraggedTool] = useState<string | null>(null);
  // Outil de recherche sur lequel on drag
  const [dragOverTool, setDragOverTool] = useState<string | null>(null);
  // État d'analyse en cours
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // État d'expansion de la liste des références
  const [isReferenceListExpanded, setIsReferenceListExpanded] = useState(true);
  // État d'expansion de la section Publications de Référence
  const [isReferenceInputExpanded, setIsReferenceInputExpanded] =
    useState(true);
  // État d'expansion de la section Outils de Recherche
  const [isSearchToolsExpanded, setIsSearchToolsExpanded] = useState(true);
  // ID de l'analyse en cours de renommage
  const [renameAnalysisId, setRenameAnalysisId] = useState<string | null>(null);
  // Nouveau nom pour l'analyse en cours de renommage
  const [newAnalysisName, setNewAnalysisName] = useState<string>('');

  // États pour l'authentification par email/mot de passe
  // Visibilité du dialogue de connexion
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  // Email pour la connexion/inscription
  const [email, setEmail] = useState('');
  // Mot de passe pour la connexion/inscription
  const [password, setPassword] = useState('');
  // État d'inscription (true) ou de connexion (false)
  const [isRegistering, setIsRegistering] = useState(false);

  //////////////////////
  // Effets
  //////////////////////
  // Effet pour appliquer le mode sombre ou clair au document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Effet pour gérer l'état de session de l'utilisateur Supabase
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

  // Effet pour charger les analyses sauvegardées au chargement de l'utilisateur
  useEffect(() => {
    if (user) {
      loadSavedAnalyses();
    }
  }, [user]);

  // Effet pour parser les publications de référence à chaque changement du texte brut
  useEffect(() => {
    setParsedReferencePublications(
      splitPublications(referencePublications).map(parsePublication)
    );
  }, [referencePublications]);

  //////////////////////
  // Fonctions d'authentification
  //////////////////////
  // Fonction pour gérer la connexion ou l'inscription de l'utilisateur
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

  // Fonction pour gérer la déconnexion de l'utilisateur
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  //////////////////////
  // Chargement des analyses sauvegardées
  //////////////////////
  // Fonction pour charger la liste des analyses sauvegardées depuis Supabase
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
  // Fonction pour sauvegarder l'analyse courante dans Supabase
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
  // Fonction pour charger une analyse sauvegardée et ses outils de recherche
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

  // Fonction pour démarrer le renommage d'une analyse
  const handleRenameAnalysisStart = (
    analysisId: string,
    currentName: string
  ) => {
    setRenameAnalysisId(analysisId);
    setNewAnalysisName(currentName);
  };

  // Fonction pour annuler le renommage d'une analyse
  const handleRenameAnalysisCancel = () => {
    setRenameAnalysisId(null);
    setNewAnalysisName('');
  };

  // Fonction pour confirmer le renommage d'une analyse et mettre à jour dans Supabase
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

  // Fonction pour supprimer une analyse et ses outils de recherche associés
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
  // Fonction pour ajouter un nouvel outil de recherche vide
  const addSearchTool = () => {
    const newTool: SearchTool = {
      id: Date.now().toString(),
      name: '',
      results: '',
    };
    setSearchTools([...searchTools, newTool]);
  };

  // Fonction pour supprimer un outil de recherche par son ID
  const removeSearchTool = (id: string) => {
    setSearchTools(searchTools.filter((tool) => tool.id !== id));
  };

  // Fonction pour mettre à jour un champ d'un outil de recherche
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

  // Fonction pour gérer le début du drag d'un outil de recherche
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    toolId: string
  ) => {
    setDraggedTool(toolId);
    e.currentTarget.classList.add('opacity-50');
  };

  // Fonction pour gérer la fin du drag d'un outil de recherche
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedTool(null);
    setDragOverTool(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  // Fonction pour gérer le drag over sur un outil de recherche
  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    toolId: string
  ) => {
    e.preventDefault();
    if (draggedTool === toolId) return;
    setDragOverTool(toolId);
  };

  // Fonction pour gérer le drop d'un outil de recherche sur un autre et réordonner la liste
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
  // Fonction principale pour analyser les résultats et déterminer la présence des références
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

  // Fonction pour démarrer l'édition d'une publication (référence ou autre)
  const handleEdit = (
    id: string,
    type: 'reference' | 'other',
    publication: ParsedPublication
  ) => {
    setEditing({ id, type, publication });
  };

  // Fonction pour sauvegarder les modifications d'une publication
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

  // Fonction pour supprimer un article (référence ou autre) de la liste et des résultats
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

  // Fonction pour basculer l'état étendu d'un élément (publication) pour afficher/cacher les détails
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

  // Fonction pour exporter les résultats de l'analyse en CSV
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

  const toggleReferenceInputExpand = () => {
    setIsReferenceInputExpanded(!isReferenceInputExpanded);
  };

  const toggleSearchToolsExpand = () => {
    setIsSearchToolsExpanded(!isSearchToolsExpanded);
  };

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
        {/* Header de l'application */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          user={user}
          showLoginDialog={showLoginDialog}
          setShowLoginDialog={setShowLoginDialog}
          handleLogout={handleLogout}
          setShowSaveDialog={setShowSaveDialog}
          setShowLoadDialog={setShowLoadDialog}
        />

        {/* Zone de saisie des publications de référence - Rendu Collapsible */}
        <ReferencePublicationInput
          darkMode={darkMode}
          referencePublications={referencePublications}
          setReferencePublications={setReferencePublications}
          isReferenceInputExpanded={isReferenceInputExpanded}
          toggleReferenceInputExpand={toggleReferenceInputExpand}
        />

        {/* Liste des publications de référence */}
        <ReferencePublicationList
          darkMode={darkMode}
          parsedReferencePublications={parsedReferencePublications}
          isReferenceListExpanded={isReferenceListExpanded}
          setIsReferenceListExpanded={setIsReferenceListExpanded}
          expandedItems={expandedItems}
          toggleExpand={toggleExpand}
          handleEdit={handleEdit}
          removeArticle={removeArticle}
        />

        {/* Outils de recherche - Rendu Collapsible */}
        <SearchToolsSection
          darkMode={darkMode}
          searchTools={searchTools}
          addSearchTool={addSearchTool}
          removeSearchTool={removeSearchTool}
          updateSearchTool={updateSearchTool}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          dragOverTool={dragOverTool}
          isSearchToolsExpanded={isSearchToolsExpanded}
          toggleSearchToolsExpand={toggleSearchToolsExpand}
        />

        {/* Boutons d'analyse et d'export */}
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

        {/* Affichage des résultats de l'analyse */}
        {analysisResults && (
          <AnalysisResultsSection
            darkMode={darkMode}
            analysisResults={analysisResults}
            searchTools={searchTools}
            editing={editing}
            setEditing={setEditing}
            handleEdit={handleEdit}
            handleSaveEdit={handleSaveEdit}
            expandedItems={expandedItems}
            toggleExpand={toggleExpand}
            removeArticle={removeArticle}
          />
        )}
      </div>

      {/* Dialogue de sauvegarde */}
      <SaveAnalysisDialog
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        darkMode={darkMode}
        currentAnalysisName={currentAnalysisName}
        setCurrentAnalysisName={setCurrentAnalysisName}
        handleSaveAnalysis={handleSaveAnalysis}
      />

      {/* Dialogue de chargement */}
      <LoadAnalysisDialog
        showLoadDialog={showLoadDialog}
        setShowLoadDialog={setShowLoadDialog}
        darkMode={darkMode}
        savedAnalyses={savedAnalyses}
        renameAnalysisId={renameAnalysisId}
        newAnalysisName={newAnalysisName}
        setNewAnalysisName={setNewAnalysisName}
        handleLoadAnalysis={handleLoadAnalysis}
        handleRenameAnalysisStart={handleRenameAnalysisStart}
        handleRenameAnalysisCancel={handleRenameAnalysisCancel}
        handleRenameAnalysisConfirm={handleRenameAnalysisConfirm}
        handleDeleteAnalysis={handleDeleteAnalysis}
      />

      {/* Dialogue de connexion (email / mot de passe) */}
      <LoginDialog
        showLoginDialog={showLoginDialog}
        setShowLoginDialog={setShowLoginDialog}
        darkMode={darkMode}
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
      />
    </div>
  );
}

export default App;
