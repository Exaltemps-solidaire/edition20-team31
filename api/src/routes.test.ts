import { describe, expect, it } from "vitest";
import { router } from "./routes.ts";

describe("router", () => {
  it("répond 200 sur les deux routes de santé", () => {
    expect(router("GET", "/health").statut).toBe(200);
    expect(router("GET", "/sante?x=1").statut).toBe(200);
  });

  it("répond 404 sur une route inconnue ou une méthode non prévue", () => {
    expect(router("GET", "/api/v1/inconnue").statut).toBe(404);
    expect(router("POST", "/health").statut).toBe(404);
  });

  it("confirme l'habilitation quand toutes les étapes sont validées, et trace la date", () => {
    const reponse = router("POST", "/api/v1/activs/a2/habiliter");
    expect(reponse.statut).toBe(200);
    expect((reponse.corps as { dateHabilitation: string | null }).dateHabilitation).not.toBeNull();
  });

  it("refuse l'habilitation quand des étapes de formation manquent", () => {
    const reponse = router("POST", "/api/v1/activs/a3/habiliter");
    expect(reponse.statut).toBe(409);
  });

  it("expose la fiche d'une ACTIV' avec ses étapes de formation", () => {
    const reponse = router("GET", "/api/v1/activs/a1");
    expect(reponse.statut).toBe(200);
    expect((reponse.corps as { dateHabilitation: string | null }).dateHabilitation).toBe("2026-11-01");
  });

  it("enregistre une réponse à l'enquête de satisfaction avec une note valide", () => {
    const reponse = router("POST", "/api/v1/activs/a3/satisfaction", JSON.stringify({ note: 4, commentaire: "Utile" }));
    expect(reponse.statut).toBe(201);
    const satisfactions = (reponse.corps as { satisfactions: { note: number }[] }).satisfactions;
    expect(satisfactions.at(-1)).toEqual({ note: 4, commentaire: "Utile" });
  });

  it("refuse une note hors de l'intervalle 1 à 5", () => {
    const reponse = router("POST", "/api/v1/activs/a3/satisfaction", JSON.stringify({ note: 7 }));
    expect(reponse.statut).toBe(400);
  });

  it("liste toutes les ACTIV' avec leur disponibilité, pour le tableau de bord admin", () => {
    const reponse = router("GET", "/api/v1/activs");
    expect(reponse.statut).toBe(200);
    const activs = reponse.corps as { id: string; disponible: boolean }[];
    expect(activs.find((a) => a.id === "a1")?.disponible).toBe(true);
    expect(activs.find((a) => a.id === "a3")?.disponible).toBe(false);
  });
});
