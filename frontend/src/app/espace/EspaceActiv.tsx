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

export function EspaceActiv({ id }: { id: string }) {
  const [activ, setActiv] = useState<ActivDetail | null>(null);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = () => {
    fetch(`/api/v1/activs/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("introuvable"))))
      .then(setActiv)
      .catch(() => setErreur("Impossible de charger votre parcours pour le moment."));
  };

  useEffect(charger, [id]);

  const envoyerSatisfaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentaire.trim().length === 0) {
      setErreur("Un commentaire est requis : l'enquête de satisfaction est obligatoire.");
      return;
    }
    setErreur(null);
    fetch(`/api/v1/activs/${id}/satisfaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, commentaire }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("refusé"))))
      .then((data: ActivDetail) => {
        setActiv(data);
        setCommentaire("");
        setEnvoye(true);
      })
      .catch(() => setErreur("L'envoi de votre retour a échoué, réessayez."));
  };

  if (erreur) {
    return <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>{erreur}</main>;
  }
  if (!activ) {
    return <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>Chargement…</main>;
  }

  const etapesOrdre: (keyof EtapesFormation)[] = ["troncCommun", "moderation", "pairAidance"];
  const prochaine = etapesOrdre.find((e) => !activ.etapes[e]);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <p>
        <Link href="/">← Changer de persona</Link>
      </p>
      <h1>Mon parcours</h1>
      <p>{activ.nom} — {activ.antenne}</p>

      <h2 style={{ marginTop: 32 }}>Mes étapes</h2>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {etapesOrdre.map((e) => (
          <li key={e}>
            <span className={activ.etapes[e] ? "badge badge-ok" : "badge badge-attente"}>
              {activ.etapes[e] ? "Validée" : "À venir"}
            </span>{" "}
            {LIBELLE_ETAPE[e]}
          </li>
        ))}
      </ul>

      {activ.dateHabilitation ? (
        <>
          <p style={{ marginTop: 24 }}>
            <strong>Habilitée le {activ.dateHabilitation}</strong>
          </p>
          <h2>Ce qui s&apos;ouvre pour vous</h2>
          <ul>
            {ACTIONS_DEBLOQUEES.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </>
      ) : prochaine ? (
        <p style={{ marginTop: 24 }}>Prochaine étape : {LIBELLE_ETAPE[prochaine]}.</p>
      ) : (
        <p style={{ marginTop: 24 }}>Toutes vos étapes sont validées — en attente de confirmation d&apos;habilitation.</p>
      )}

      <h2 style={{ marginTop: 40 }}>Votre avis sur la formation</h2>
      {envoye ? (
        <p>Merci, votre retour a été enregistré.</p>
      ) : (
        <form onSubmit={envoyerSatisfaction} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
          <label>
            Note (1 à 5)
            <select value={note} onChange={(e) => setNote(Number(e.target.value))} style={{ display: "block", marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            Commentaire (obligatoire)
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              required
              style={{ display: "block", width: "100%", marginTop: 4 }}
            />
          </label>
          <button type="submit">Envoyer mon retour</button>
        </form>
      )}
    </main>
  );
}
