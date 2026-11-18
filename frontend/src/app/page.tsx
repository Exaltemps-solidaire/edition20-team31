"use client";

import { useRouter } from "next/navigation";
import { PERSONAS, routePourRole } from "@/lib/roles";
import styles from "./page.module.css";

const PERSONA_STORAGE_KEY = "lburn-persona-id";

export default function QuiEtesVous() {
  const router = useRouter();

  function choisir(personaId: string, role: (typeof PERSONAS)[number]["role"]) {
    window.localStorage.setItem(PERSONA_STORAGE_KEY, personaId);
    router.push(routePourRole(role));
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Qui êtes-vous ?</h1>
          <p>Choisissez un profil pour accéder à l&apos;espace correspondant.</p>
        </div>
        <ul className={styles.ctas} style={{ flexDirection: "column", maxWidth: "100%" }}>
          {PERSONAS.map((persona) => (
            <li key={persona.id} style={{ listStyle: "none", width: "100%" }}>
              <button
                type="button"
                className={styles.secondary}
                style={{ width: "100%", marginBottom: 12 }}
                onClick={() => choisir(persona.id, persona.role)}
              >
                {persona.nom}
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
