"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FORMATRICES } from "@/lib/roles";

type EtapesFormation = { troncCommun: boolean; moderation: boolean; pairAidance: boolean };
type Satisfaction = { note: number; commentaire: string };
type StatutFormation = "en-formation" | "termine" | "habilitee";
type ActivListe = {
  id: string;
  nom: string;
  antenne: string;
  etapes: EtapesFormation;
  dateHabilitation: string | null;
  disponible: boolean;
  satisfactions: Satisfaction[];
  statutFormation: StatutFormation;
};

const LIBELLE_STATUT: Record<StatutFormation, string> = {
  "en-formation": "En formation",
  termine: "Formation terminée",
  habilitee: "Habilitée",
};

function moyenneSatisfaction(satisfactions: Satisfaction[]): string | null {
  if (satisfactions.length === 0) {
    return null;
  }
  const moyenne = satisfactions.reduce((s, r) => s + r.note, 0) / satisfactions.length;
  return `${moyenne.toFixed(1)}/5 (${satisfactions.length})`;
}

export default function TableauDeBordAdmin() {
  const [activs, setActivs] = useState<ActivListe[] | null>(null);

  useEffect(() => {
    fetch("/api/v1/activs")
      .then((r) => r.json())
      .then(setActivs)
      .catch(() => setActivs([]));
  }, []);

  if (!activs) {
    return <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>Chargement…</main>;
  }

  const compte = { "en-formation": 0, termine: 0, habilitee: 0 };
  for (const activ of activs) {
    compte[activ.statutFormation] += 1;
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <p>
        <Link href="/">← Changer de persona</Link>
      </p>
      <h1>Tableau de bord admin</h1>
      <p>
        {compte["en-formation"]} en formation · {compte.termine} formation(s) terminée(s) ·{" "}
        {compte.habilitee} habilitée(s)
      </p>
      <table style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>ACTIV&apos;</th>
            <th>Antenne</th>
            <th>Statut</th>
            <th>Avancement</th>
            <th>Disponibilité</th>
            <th>Satisfaction</th>
          </tr>
        </thead>
        <tbody>
          {activs.map((activ) => {
            const moyenne = moyenneSatisfaction(activ.satisfactions);
            return (
              <tr key={activ.id}>
                <td>
                  <Link href={`/admin/activ/${activ.id}`}>{activ.nom}</Link>
                </td>
                <td>{activ.antenne}</td>
                <td>{LIBELLE_STATUT[activ.statutFormation]}</td>
                <td>{Number(activ.etapes.troncCommun) + Number(activ.etapes.moderation)}/2 étapes</td>
                <td>{activ.disponible ? "Disponible" : "Non disponible"}</td>
                <td>
                  {moyenne ?? <span className="badge badge-attente">En attente (obligatoire)</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 style={{ marginTop: 40 }}>Formatrices disponibles</h2>
      <table style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>Formatrice</th>
            <th>Antenne</th>
            <th>Disponibilité</th>
            <th>Modules qu&apos;elle peut animer</th>
          </tr>
        </thead>
        <tbody>
          {FORMATRICES.map((formatrice) => (
            <tr key={formatrice.id}>
              <td>{formatrice.nom}</td>
              <td>{formatrice.antenne}</td>
              <td>{formatrice.disponible ? "Disponible" : "Non disponible"}</td>
              <td>{formatrice.modules.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
