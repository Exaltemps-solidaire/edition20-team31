// Routage de l'API, sans dépendance : une fonction pure, testable sans démarrer de serveur.
// Le proxy d'entrée envoie /api/... à ce service sans retirer le préfixe : les routes métier
// se déclarent donc sous /api/v1/... ; /health et /sante restent à la racine (port 8081).

export type Reponse = { statut: number; corps?: unknown };

export type EtapesFormation = { troncCommun: boolean; moderation: boolean; pairAidance: boolean };

export type Satisfaction = { note: number; commentaire: string };

export type ActivDetail = {
  id: string;
  nom: string;
  antenne: string;
  etapes: EtapesFormation;
  dateHabilitation: string | null;
  disponible: boolean;
  satisfactions: Satisfaction[];
};

// Store simple en mémoire : pas de persistance au-delà du cycle de vie du conteneur (hors périmètre de l'itération).
const ACTIVS: Record<string, ActivDetail> = {
  a1: {
    id: "a1",
    nom: "Léa Martin",
    antenne: "Talence",
    etapes: { troncCommun: true, moderation: true, pairAidance: true },
    dateHabilitation: "2026-11-01",
    disponible: true,
    satisfactions: [{ note: 5, commentaire: "Formation claire, bon rythme." }],
  },
  a2: {
    id: "a2",
    nom: "Nora Benali",
    antenne: "Lille",
    etapes: { troncCommun: true, moderation: true, pairAidance: false },
    dateHabilitation: null,
    disponible: true,
    satisfactions: [],
  },
  a3: {
    id: "a3",
    nom: "Fatou Diallo",
    antenne: "Agen",
    etapes: { troncCommun: true, moderation: false, pairAidance: false },
    dateHabilitation: null,
    disponible: false,
    satisfactions: [],
  },
  a4: {
    id: "a4",
    nom: "Inès Costa",
    antenne: "Marmande",
    etapes: { troncCommun: false, moderation: false, pairAidance: false },
    dateHabilitation: null,
    disponible: true,
    satisfactions: [],
  },
};

export function toutesEtapesValidees(etapes: EtapesFormation): boolean {
  return etapes.troncCommun && etapes.moderation;
}

export function peutHabiliter(activ: ActivDetail): boolean {
  return toutesEtapesValidees(activ.etapes) && activ.dateHabilitation === null;
}

export function estNoteValide(note: unknown): note is number {
  return typeof note === "number" && Number.isInteger(note) && note >= 1 && note <= 5;
}

export type StatutFormation = "en-formation" | "termine" | "habilitee";

export function statutDe(activ: ActivDetail): StatutFormation {
  if (activ.dateHabilitation !== null) {
    return "habilitee";
  }
  return toutesEtapesValidees(activ.etapes) ? "termine" : "en-formation";
}

export function router(methode: string, url: string, corpsBrut = ""): Reponse {
  const chemin = new URL(url, "http://api").pathname;
  if (methode === "GET" && (chemin === "/health" || chemin === "/sante")) {
    return { statut: 200, corps: { status: "ok" } };
  }

  if (methode === "GET" && chemin === "/api/v1/activs") {
    const activs = Object.values(ACTIVS).map((activ) => ({ ...activ, statutFormation: statutDe(activ) }));
    return { statut: 200, corps: activs };
  }

  const matchFiche = chemin.match(/^\/api\/v1\/activs\/([^/]+)$/);
  if (methode === "GET" && matchFiche) {
    const activ = ACTIVS[matchFiche[1]];
    return activ ? { statut: 200, corps: { ...activ, statutFormation: statutDe(activ) } } : { statut: 404 };
  }

  const matchHabiliter = chemin.match(/^\/api\/v1\/activs\/([^/]+)\/habiliter$/);
  if (methode === "POST" && matchHabiliter) {
    const activ = ACTIVS[matchHabiliter[1]];
    if (!activ) {
      return { statut: 404 };
    }
    if (!peutHabiliter(activ)) {
      return { statut: 409, corps: { erreur: "Étapes de formation incomplètes" } };
    }
    activ.dateHabilitation = new Date().toISOString().slice(0, 10);
    return { statut: 200, corps: activ };
  }

  const matchSatisfaction = chemin.match(/^\/api\/v1\/activs\/([^/]+)\/satisfaction$/);
  if (methode === "POST" && matchSatisfaction) {
    const activ = ACTIVS[matchSatisfaction[1]];
    if (!activ) {
      return { statut: 404 };
    }
    let demande: { note?: unknown; commentaire?: unknown };
    try {
      demande = JSON.parse(corpsBrut);
    } catch {
      return { statut: 400, corps: { erreur: "Corps JSON invalide" } };
    }
    if (!estNoteValide(demande.note)) {
      return { statut: 400, corps: { erreur: "La note doit être un entier de 1 à 5" } };
    }
    const commentaire = typeof demande.commentaire === "string" ? demande.commentaire : "";
    activ.satisfactions.push({ note: demande.note, commentaire });
    return { statut: 201, corps: activ };
  }

  return { statut: 404 };
}
