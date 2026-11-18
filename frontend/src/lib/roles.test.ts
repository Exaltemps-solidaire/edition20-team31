import { describe, expect, it } from "vitest";
import { ACTIVS, compterEtapesValidees, compterParStatut, routePourRole } from "./roles";

describe("routePourRole", () => {
  it("dirige les rôles admin (chargée de remobilisation, directrice d'antenne) vers /admin", () => {
    expect(routePourRole("chargee-remobilisation")).toBe("/admin");
    expect(routePourRole("directrice-antenne")).toBe("/admin");
  });

  it("dirige le rôle ACTIV' vers /espace", () => {
    expect(routePourRole("activ")).toBe("/espace");
  });
});

describe("compterParStatut", () => {
  it("compte les ACTIV' par statut sur les données de démonstration", () => {
    expect(compterParStatut(ACTIVS)).toEqual({
      "en-formation": 2,
      termine: 1,
      habilitee: 1,
    });
  });

  it("renvoie des compteurs à zéro sur une liste vide", () => {
    expect(compterParStatut([])).toEqual({ "en-formation": 0, termine: 0, habilitee: 0 });
  });
});

describe("compterEtapesValidees", () => {
  it("compte les étapes validées, pour afficher l'avancement d'une ACTIV' en formation", () => {
    expect(compterEtapesValidees({ troncCommun: true, moderation: false })).toBe(1);
    expect(compterEtapesValidees({ troncCommun: true, moderation: true })).toBe(2);
    expect(compterEtapesValidees({ troncCommun: false, moderation: false })).toBe(0);
  });
});
