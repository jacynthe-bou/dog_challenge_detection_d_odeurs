export type Challenge = {
  id: number;
  title: string;
  category: "Intérieur" | "Extérieur" | "Lieu public";
  level: number;
  description: string;
  duration: number;
  completed: boolean;
  objective?: string;
  materials?: string[];
  installation?: string[];
  steps?: string[];
  successCriteria?: string[];
};

export const challenges: Challenge[] = [
  {
    id: 1,
    title: "Distance",
    category: "Intérieur",
    level: 1,
    description: "Une recherche autonome dans la salle de bain pendant que le conducteur demeure au seuil de la porte.",
    duration: 90,
    completed: false,
    objective: "Développer l'autonomie du chien pendant une recherche alors que le conducteur demeure à distance.",
    materials: ["Gâteries de grande valeur", "Une gâterie à cacher ou une odeur cible", "Support ou contenant pour l'odeur, si nécessaire"],
    installation: ["Dans la salle de bain, cachez une gâterie ou une odeur cible selon le niveau du chien.", "Le chien ne doit pas vous voir préparer ni placer la cache.", "Le conducteur se place au seuil de la porte et y demeure pendant toute la recherche."],
    steps: ["Donnez votre signal habituel de recherche et laissez le chien travailler sans aide.", "Version nourriture : le chien réussit lorsqu'il trouve et mange la gâterie.", "Version odeur : lorsque le chien trouve la source, marquez verbalement « YES » et donnez 2 à 3 récompenses le plus près possible de la source.", "Gardez une dernière récompense pour leurrer le chien à l'extérieur de la pièce, puis donnez-la-lui une fois sorti."],
    successCriteria: ["Le chien trouve la cache en 1 min 30 s ou moins.", "Le conducteur demeure au seuil de la porte.", "La recherche est réalisée sans aide du conducteur."]
  },
  {
    id: 2,
    title: "Le regroupement de chaises",
    category: "Intérieur",
    level: 1,
    description: "Explorer un regroupement compact de chaises et localiser une cache placée sous la hauteur de l'assise.",
    duration: 120,
    completed: false,
    objective: "Amener le chien à explorer une structure composée de plusieurs objets rapprochés et à déterminer précisément où se trouve la cache.",
    materials: ["4 à 6 chaises, idéalement comportant des barreaux entre les pattes", "Gâteries de grande valeur", "Une gâterie à cacher ou une odeur cible", "Gommette pour fixer l'odeur, au besoin"],
    installation: ["Dans une pièce de la maison, regroupez 4 à 6 chaises.", "Placez les chaises de façon à ce que leurs dossiers soient collés les uns aux autres et que l'ensemble forme un seul regroupement compact.", "Cachez une gâterie ou une odeur cible sur l'un des barreaux entre les pattes. Nous souhaitons travailler un peu plus bas que la hauteur de l'assise.", "Le chien ne doit pas vous voir installer la cache.", "Avec une odeur cible, vous pouvez également la fixer avec de la gommette directement sur une patte de chaise afin d'obtenir la hauteur appropriée."],
    steps: ["Amenez le chien dans la pièce et donnez votre signal habituel de recherche.", "Laissez-le explorer l'ensemble des chaises et remonter l'odeur jusqu'à la source.", "Version nourriture : le chien réussit lorsqu'il trouve et mange la gâterie.", "Version odeur : marquez « YES » lorsque le chien trouve la source et donnez 2 à 3 récompenses le plus près possible de celle-ci.", "Gardez une dernière gâterie pour leurrer le chien et l'éloigner de la source, puis donnez-la-lui."],
    successCriteria: ["Le chien localise correctement la cache dans le regroupement de chaises.", "La recherche est réalisée sans aide du conducteur.", "La cache est trouvée en 2 minutes ou moins."]
  },
  {
    id: 3,
    title: "Les huit contenants",
    category: "Intérieur",
    level: 1,
    description: "Identifier le seul contenant qui renferme l'odeur cible ou la nourriture parmi huit contenants identiques.",
    duration: 90,
    completed: false,
    objective: "Amener le chien à discriminer plusieurs contenants et à identifier de façon autonome celui qui contient la cible.",
    materials: ["8 contenants identiques", "Version odeur : 8 couvercles perforés et une seule odeur cible", "Version nourriture : 8 contenants sans couvercle et 1 à 2 gâteries"],
    installation: ["Placez les 8 contenants dans une pièce en formant deux rangées de quatre contenants.", "Version odeur : placez l'odeur cible dans un seul contenant et utilisez les couvercles perforés sur les huit contenants.", "Version nourriture : laissez les huit contenants sans couvercle et placez 1 à 2 gâteries dans un seul contenant.", "Les sept autres contenants demeurent vides."],
    steps: ["Amenez le chien dans la pièce et donnez votre signal habituel de recherche.", "Laissez le chien en liberté explorer les deux rangées sans le guider vers un contenant.", "Version nourriture : le chien réussit lorsqu'il identifie le bon contenant et mange la ou les gâteries.", "Version odeur : le chien réussit lorsqu'il localise correctement le contenant qui renferme l'odeur cible."],
    successCriteria: ["Le chien identifie le bon contenant parmi les huit.", "Le chien effectue la recherche en liberté et sans aide du conducteur.", "Le bon contenant est trouvé en 1 min 30 s ou moins."]
  },
  { id: 4, title: "Défi intérieur 4", category: "Intérieur", level: 1, description: "À construire ensemble.", duration: 180, completed: false },
  { id: 5, title: "Défi intérieur 5", category: "Intérieur", level: 1, description: "À construire ensemble.", duration: 180, completed: false },

  { id: 6, title: "Près de la porte", category: "Extérieur", level: 1, description: "Place une cache extérieure simple près d'une entrée.", duration: 180, completed: false },
  { id: 7, title: "Bordure de terrain", category: "Extérieur", level: 1, description: "Cache l'odeur le long d'une bordure ou clôture.", duration: 180, completed: false },
  { id: 8, title: "Objet extérieur", category: "Extérieur", level: 1, description: "Utilise un objet fixe extérieur comme environnement de recherche.", duration: 180, completed: false },
  { id: 9, title: "Vent léger", category: "Extérieur", level: 1, description: "Fais une recherche lorsqu'il y a un peu de vent.", duration: 180, completed: false },
  { id: 10, title: "Deux zones", category: "Extérieur", level: 1, description: "Délimite deux petites zones et place la cache dans une seule.", duration: 240, completed: false },

  { id: 11, title: "Stationnement calme", category: "Lieu public", level: 1, description: "Fais une recherche dans une zone publique calme et sécuritaire.", duration: 180, completed: false },
  { id: 12, title: "Parc tranquille", category: "Lieu public", level: 1, description: "Fais une recherche simple dans un parc peu fréquenté.", duration: 180, completed: false }
];
