# MAIA DRCI - Outil d'Analyse de Publications Académiques

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Ajoutez ici un badge de statut du projet si applicable (ex: build status, coverage) -->

## Présentation

**MAIA DRCI** est une application web React conçue pour faciliter l'analyse de la littérature académique. Elle permet de comparer une liste de publications de référence avec les résultats obtenus à partir de différents outils de recherche (comme Google Scholar, PubMed, etc.). L'outil identifie rapidement si les publications de référence sont présentes dans les résultats de recherche, et met en évidence les articles supplémentaires trouvés.

**Objectif principal :** Simplifier et accélérer le processus de revue de littérature en automatisant l'identification de la présence (ou absence) de publications clés dans les résultats de recherche.

## Fonctionnalités Clés

*   **Analyse Comparative :** Compare une liste de publications de référence avec les résultats de recherche de plusieurs outils.
*   **Support du Mode Sombre :** Interface utilisateur adaptable avec un mode sombre pour un confort visuel amélioré.
*   **Gestion des Publications de Référence :**
    *   Saisie facile des publications de référence (format texte, séparées par ligne vide).
    *   Affichage clair et organisé des publications parsées (titre, auteurs, année, journal, DOI).
    *   Possibilité d'éditer et de supprimer des publications de référence directement dans l'interface.
    *   Liste repliable des publications de référence pour une interface plus épurée.
*   **Intégration d'Outils de Recherche :**
    *   Ajout dynamique d'outils de recherche (nom et résultats de recherche à coller).
    *   Réorganisation des outils par Drag & Drop.
    *   Suppression facile des outils.
*   **Résultats d'Analyse Détaillés :**
    *   Tableaux de résultats clairs indiquant la présence ou l'absence des publications de référence pour chaque outil.
    *   Section dédiée aux "Autres Articles Trouvés" (non référencés) avec indication de leur présence par outil.
    *   Possibilité d'éditer les informations des publications directement dans les tableaux de résultats.
    *   Système d'expansion/réduction pour afficher plus ou moins de détails sur chaque publication.
*   **Export CSV :** Exportation facile des résultats d'analyse au format CSV pour une utilisation ultérieure ou le partage.
*   **Sauvegarde et Chargement d'Analyses :**
    *   Possibilité de sauvegarder les analyses (publications de référence et outils de recherche) pour un usage ultérieur.
    *   Système de chargement des analyses sauvegardées.
    *   Authentification utilisateur pour la gestion des analyses sauvegardées (via Supabase).
    *   Renommage et suppression des analyses sauvegardées.
*   **Authentification Utilisateur :** Système d'authentification par email/mot de passe (via Supabase) pour la sauvegarde et la gestion des analyses personnelles.

## Démo (Ajouter des captures d'écran ou un GIF animé ici)

<!--
**[Insérer ici des captures d'écran de l'application en action, montrant l'interface, les tableaux de résultats, etc.]**

**[Optionnellement, un GIF animé montrant le workflow principal de l'application]**
-->

## Installation et Utilisation

### Prérequis

*   [Node.js](https://nodejs.org/) (version recommandée >= 16)
*   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
*   Un compte [Supabase](https://supabase.com/) (pour l'authentification et la sauvegarde des données - optionnel si vous ne souhaitez pas utiliser ces fonctionnalités)

### Installation

1.  **Cloner le repository GitHub :**
    ```bash
    git clone [URL_DE_VOTRE_REPOSITORY]
    cd [NOM_DU_REPOSITORY]
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install  # ou yarn install
    ```

3.  **Configuration de Supabase (Optionnel - si vous utilisez l'authentification et la sauvegarde) :**
    *   Créez un projet sur [Supabase](https://supabase.com/).
    *   Récupérez votre **URL de projet Supabase** et votre **clé API publique (anon key)**.
    *   Créez un fichier `.env.local` à la racine du projet et ajoutez les variables d'environnement suivantes :

        ```env
        VITE_SUPABASE_URL=VOTRE_URL_SUPABASE
        VITE_SUPABASE_ANON_KEY=VOTRE_CLE_API_PUBLIQUE
        ```

    *   **Important :** Ne commitez jamais votre fichier `.env.local` dans votre repository public. Il est inclus dans `.gitignore` pour cette raison.

### Lancement de l'application

```bash
npm run dev # ou yarn dev