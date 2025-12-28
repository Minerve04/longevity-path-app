export interface Cure {
  id: string;
  name: string;
  description: string;
  duration: number;
  tasks: string[];
  icon: "ginger" | "turmeric" | "propolis" | "rhodiola" | "chana" | "reishi" | "custom";
  isCustom?: boolean;
}

export const DEFAULT_CURES: Cure[] = [
  {
    id: "gingembre",
    name: "Gingembre",
    description: "Anti-inflammatoire naturel",
    duration: 21,
    tasks: ["Prendre gingembre"],
    icon: "ginger",
  },
  {
    id: "curcuma",
    name: "Curcuma",
    description: "Antioxydant puissant",
    duration: 21,
    tasks: ["Prendre curcuma"],
    icon: "turmeric",
  },
  {
    id: "propolis",
    name: "Propolis",
    description: "Renforce l'immunité",
    duration: 14,
    tasks: ["Prendre propolis"],
    icon: "propolis",
  },
  {
    id: "rhodiola",
    name: "Rhodiola",
    description: "Adaptogène anti-stress",
    duration: 30,
    tasks: ["Prendre rhodiola"],
    icon: "rhodiola",
  },
  {
    id: "chana",
    name: "Chana",
    description: "Équilibre hormonal",
    duration: 30,
    tasks: ["Prendre chana"],
    icon: "chana",
  },
  {
    id: "reishi",
    name: "Reishi",
    description: "Champignon adaptogène",
    duration: 30,
    tasks: ["Prendre reishi"],
    icon: "reishi",
  },
];

const CUSTOM_CURES_KEY = "longevity-custom-cures";

export const loadCustomCures = (): Cure[] => {
  try {
    const saved = localStorage.getItem(CUSTOM_CURES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveCustomCures = (cures: Cure[]) => {
  localStorage.setItem(CUSTOM_CURES_KEY, JSON.stringify(cures));
};

export const getAllCures = (): Cure[] => {
  return [...DEFAULT_CURES, ...loadCustomCures()];
};
