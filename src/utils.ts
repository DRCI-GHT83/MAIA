// utils.ts
// Fichier contenant les fonctions utilitaires de l'application.

import { ParsedPublication } from './interfaces';

// Fonction pour normaliser un titre en minuscules et sans caractères spéciaux
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Fonction pour parser le texte d'une publication en objet ParsedPublication
export function parsePublication(text: string): ParsedPublication {
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

// Fonction pour diviser un texte de publications en un tableau de publications individuelles
export function splitPublications(text: string): string[] {
  const articles = text
    .split(/\n\s*\n/)
    .filter((article) => article.trim().length > 0);
  return articles;
}