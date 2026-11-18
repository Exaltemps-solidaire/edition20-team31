// Logique métier de l'écran « Qui êtes-vous ? » : pas de connexion ni de mot de passe
// (décision du squad, cf. passation) — un persona choisi détermine un rôle, qui détermine
// la vue vers laquelle on redirige.

export type RoleId = "chargee-remobilisation" | "directrice-antenne" | "activ";

export type Persona = {
  id: string;
  nom: string;
  role: RoleId;
};

export const PERSONAS: Persona[] = [
  { id: "camille", nom: "Camille — chargée de remobilisation", role: "chargee-remobilisation" },
  { id: "sophie", nom: "Sophie — directrice d'antenne", role: "directrice-antenne" },
  { id: "lea", nom: "Léa — ACTIV' en formation", role: "activ" },
];

export function routePourRole(role: RoleId): string {
  if (role === "activ") {
    return "/espace";
  }
  return "/admin";
}

export type StatutFormation = "en-formation" | "termine" | "habilitee";

export type EtapesFormation = { troncCommun: boolean; moderation: boolean };

export type Activ = {
  id: string;
  nom: string;
  antenne: string;
  statut: StatutFormation;
  disponible: boolean;
  etapes: EtapesFormation;
};

export const ACTIVS: Activ[] = [
  {
    id: "a1",
    nom: "Léa Martin",
    antenne: "Talence",
    statut: "habilitee",
    disponible: true,
    etapes: { troncCommun: true, moderation: true },
  },
  {
    id: "a2",
    nom: "Nora Benali",
    antenne: "Lille",
    statut: "termine",
    disponible: true,
    etapes: { troncCommun: true, moderation: true },
  },
  {
    id: "a3",
    nom: "Fatou Diallo",
    antenne: "Agen",
    statut: "en-formation",
    disponible: false,
    etapes: { troncCommun: true, moderation: false },
  },
  {
    id: "a4",
    nom: "Inès Costa",
    antenne: "Marmande",
    statut: "en-formation",
    disponible: true,
    etapes: { troncCommun: false, moderation: false },
  },
];

export function compterParStatut(activs: Activ[]): Record<StatutFormation, number> {
  return activs.reduce(
    (compte, activ) => {
      compte[activ.statut] += 1;
      return compte;
    },
    { "en-formation": 0, termine: 0, habilitee: 0 } as Record<StatutFormation, number>,
  );
}

export function compterEtapesValidees(etapes: EtapesFormation): number {
  return Number(etapes.troncCommun) + Number(etapes.moderation);
}

// Formatrices : les personnes qui animent les modules, distinctes des ACTIV' qui les suivent.
export type Formatrice = {
  id: string;
  nom: string;
  antenne: string;
  disponible: boolean;
  modules: string[];
};

export const FORMATRICES: Formatrice[] = [
  { id: "f1", nom: "Hélène Roussel", antenne: "Talence", disponible: true, modules: ["Tronc commun", "Modération"] },
  { id: "f2", nom: "Awa Koné", antenne: "Lille", disponible: false, modules: ["Modération", "Pair-aidance"] },
  { id: "f3", nom: "Claire Fontaine", antenne: "Agen", disponible: true, modules: ["Tronc commun"] },
];
