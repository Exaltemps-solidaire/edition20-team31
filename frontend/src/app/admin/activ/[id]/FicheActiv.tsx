"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type EtapesFormation = { troncCommun: boolean; moderation: boolean; pairAidance: boolean };
type Satisfaction = { note: number; commentaire: string };
type ActivDetail = {
  id: string;
  nom: string;
  antenne: string;
  etapes: EtapesFormation;
  dateHabilitation: string | null;
  satisfactions: Satisfaction[];
};

const LIBELLE_ETAPE: Record<keyof EtapesFormation, string> = {
  troncCommun: "Tronc commun",
  moderation: "Formation modération",
  pairAidance: "Formation pair-aidance",
};

const ACTIONS_DEBLOQUEES = ["Animer un atelier", "Participer à une permanence ou un groupe de parole"];

export function FicheActiv({ id }: { id: string }) {
  const [activ, setActiv] = useState<ActivDetail | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = () => {
    fetch(`/api/v1/activs/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("introuvable"))))
      .then(setActiv)
      .catch(() => setErreur("Fiche introuvable"));
  };

  useEffect(charger, [id]);

  const confirmerHabilitation = () => {
    fetch(`/api/v1/activs/${id}/habiliter`, { method: "POST" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("refusé"))))
      .then(setActiv)
      .catch(() => setErreur("Les étapes de formation ne sont pas toutes validées"));
  };

  if (erreur) {
    return <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>{erreur}</main>;
  }
  if (!activ) {
    return <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>Chargement…</main>;
  }

  const toutesValidees = activ.etapes.troncCommun && activ.etapes.moderation;
  const peutHabiliter = toutesValidees && activ.dateHabilitation === null;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <p>
        <Link href="/admin">← Retour au tableau de bord</Link>
      </p>
      <h1>{activ.nom}</h1>
      <p>{activ.antenne}</p>

      <h2>Formation</h2>
      <ul>
        {(Object.keys(activ.etapes) as (keyof EtapesFormation)[]).map((cle) => (
          <li key={cle}>
            {activ.etapes[cle] ? "✅" : "⬜️"} {LIBELLE_ETAPE[cle]}
          </li>
        ))}
      </ul>

      {activ.dateHabilitation ? (
        <>
          <p>
            <strong>Habilitée le {activ.dateHabilitation}</strong>
          </p>
          <h2>Actions débloquées</h2>
          <ul>
            {ACTIONS_DEBLOQUEES.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </>
      ) : (
        <button onClick={confirmerHabilitation} disabled={!peutHabiliter}>
          Confirmer l&apos;habilitation
        </button>
      )}

      <h2 style={{ marginTop: 32 }}>Enquête de satisfaction</h2>
      {activ.satisfactions.length === 0 ? (
        <p>Aucun retour pour le moment.</p>
      ) : (
        <>
          <p>
            Note moyenne :{" "}
            {(activ.satisfactions.reduce((s, r) => s + r.note, 0) / activ.satisfactions.length).toFixed(1)}/5 (
            {activ.satisfactions.length} retour{activ.satisfactions.length > 1 ? "s" : ""})
          </p>
          <ul>
            {activ.satisfactions.map((s, i) => (
              <li key={i}>
                {s.note}/5{s.commentaire ? ` — ${s.commentaire}` : ""}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
