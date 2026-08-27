export type Challenge = {
  id: number;
  title: string;
  category: "Intérieur" | "Extérieur" | "Lieu public";
  level: number;
  description: string;
  duration: number;
  completed: boolean;
};

export const challenges: Challenge[] = [
  { id: 1, title: "La boîte unique", category: "Intérieur", level: 1, description: "Place une odeur cible dans une boîte parmi 4 contenants.", duration: 120, completed: true },
  { id: 2, title: "Deux pièces", category: "Intérieur", level: 1, description: "Cache l'odeur dans une pièce et commence la recherche dans une autre.", duration: 180, completed: true },
  { id: 3, title: "Sous une chaise", category: "Intérieur", level: 1, description: "Place la cache à faible hauteur sous un meuble accessible.", duration: 180, completed: false },
  { id: 4, title: "Le long d'un mur", category: "Intérieur", level: 1, description: "Cache l'odeur près d'un mur avec quelques objets neutres autour.", duration: 180, completed: false },
  { id: 5, title: "Petite distraction", category: "Intérieur", level: 1, description: "Ajoute une distraction neutre à distance de la cache.", duration: 180, completed: false },

  { id: 6, title: "Près de la porte", category: "Extérieur", level: 1, description: "Place une cache extérieure simple près d'une entrée.", duration: 180, completed: true },
  { id: 7, title: "Bordure de terrain", category: "Extérieur", level: 1, description: "Cache l'odeur le long d'une bordure ou clôture.", duration: 180, completed: false },
  { id: 8, title: "Objet extérieur", category: "Extérieur", level: 1, description: "Utilise un objet fixe extérieur comme environnement de recherche.", duration: 180, completed: false },
  { id: 9, title: "Vent léger", category: "Extérieur", level: 1, description: "Fais une recherche lorsqu'il y a un peu de vent.", duration: 180, completed: false },
  { id: 10, title: "Deux zones", category: "Extérieur", level: 1, description: "Délimite deux petites zones et place la cache dans une seule.", duration: 240, completed: false },

  { id: 11, title: "Stationnement calme", category: "Lieu public", level: 1, description: "Fais une recherche dans une zone publique calme et sécuritaire.", duration: 180, completed: false },
  { id: 12, title: "Parc tranquille", category: "Lieu public", level: 1, description: "Fais une recherche simple dans un parc peu fréquenté.", duration: 180, completed: false }
];
