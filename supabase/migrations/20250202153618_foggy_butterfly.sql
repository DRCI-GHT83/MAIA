/*
  # Création des tables pour le stockage des analyses

  1. Nouvelles Tables
    - `analyses`
      - `id` (uuid, clé primaire)
      - `name` (text, nom de l'analyse)
      - `user_id` (uuid, lien vers l'utilisateur authentifié)
      - `reference_publications` (text, publications de référence)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `search_tools`
      - `id` (uuid, clé primaire)
      - `analysis_id` (uuid, lien vers l'analyse)
      - `name` (text, nom de l'outil)
      - `results` (text, résultats de recherche)

  2. Sécurité
    - RLS activé sur les deux tables
    - Politiques pour permettre aux utilisateurs de gérer leurs propres analyses
*/

-- Création de la table des analyses
CREATE TABLE analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  reference_publications text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Création de la table des outils de recherche
CREATE TABLE search_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid REFERENCES analyses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  results text NOT NULL
);

-- Activation RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_tools ENABLE ROW LEVEL SECURITY;

-- Politiques pour analyses
CREATE POLICY "Users can create their own analyses"
  ON analyses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analyses"
  ON analyses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
  ON analyses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
  ON analyses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Politiques pour search_tools
CREATE POLICY "Users can manage search tools for their analyses"
  ON search_tools FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM analyses
    WHERE analyses.id = search_tools.analysis_id
    AND analyses.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM analyses
    WHERE analyses.id = search_tools.analysis_id
    AND analyses.user_id = auth.uid()
  ));