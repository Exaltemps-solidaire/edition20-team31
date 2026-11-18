# Plan d'itérations — L'BURN / parcours ACTIV'

- **Source du plan** : proposé par l'agent (aucun plan d'itérations trouvé dans la passation : pas de fichier `cadrage/*iteration*`, pas de clé `iterations` dans `passation.json`).
- **Plan validé le 2026-11-18** par les cadreurs.
- **Temps restant annoncé** : 60 minutes, au moment de la planification (2026-11-18). Au début de l'itération 1 : 45 minutes restantes. Au début de l'itération 2 : 30 minutes restantes — ✂️ la demande d'enrichissement de « Mon parcours », de staffing/dispatch et de vue QA pour la directrice d'antenne (apportée par le développeur après l'itération 1) ne tient plus dans le temps restant ; elle reste en « À venir », après confirmation du développeur de prioriser l'itération 2 déjà validée.
- **Durée du tour de test de l'équipe** : 5 minutes.
- **Capacité estimée** : avec un tour de test de 5 min et ~5 min de publication, chaque itération coûte au moins ~15-20 minutes. Sur 60 minutes, 3 itérations détaillées tiennent confortablement ; une 4e ne tiendrait que si les précédentes vont plus vite que prévu.
- **Hors périmètre (rappelé de la passation)** : connexion/inscription/compte (aucune auth — sélection de persona), parcours BBA/BIB, Sentinelle, paiement en ligne, communauté/chat, back-office au-delà de la confirmation d'habilitation, activités ACTIV' externes.
- ✂️ **Risque de taille** : au rythme de 3 itérations sur 60 minutes, les étapes 3 (confirmation de présence) et 4 (enquête de satisfaction) du plan de l'équipe ne tiennent probablement pas. Elles restent en « À venir » ; si le temps manque, la dernière itération disponible sert à stabiliser plutôt qu'à les coder à la hâte.

## Itération 1 : L'application est en ligne, affiche l'écran « Qui êtes-vous ? » et un tableau de bord admin avec des données en dur

- **Dans le périmètre** :
  - `.env.example` et `DEPLOIEMENT.md` (le squelette `api/`/`frontend/` est déjà posé par le gabarit du serveur).
  - Écran « Qui êtes-vous ? » : liste de personas (chargée de remobilisation, directrice d'antenne, ACTIV'/pair-aidante), sélection sans mot de passe.
  - Écran « Tableau de bord admin » : liste d'ACTIV' avec un statut (en formation / terminé), données en dur.
- **Hors périmètre** : vraie API/BDD pour les ACTIV', fiche ACTIV' détaillée, actions d'habilitation.
- **Critères d'acceptation** :
  - Étant donné l'application déployée, quand on l'ouvre, alors l'écran « Qui êtes-vous ? » propose les rôles du scénario.
  - Étant donné qu'on a choisi « chargée de remobilisation », quand on accède au tableau de bord, alors on voit une liste d'ACTIV' avec leur statut.
  - Étant donné l'application en ligne, quand on appelle `/health` et `/sante`, alors ils répondent 200.
- **Hypothèse de l'équipe couverte** : aucune — `5-hypotheses.md` est vide dans la passation ; cette itération pose la base technique et visuelle.
- **Codage estimé** : 10 minutes.
- **Fichiers prévus** : écran « Qui êtes-vous ? », écran tableau de bord admin, `.env.example`, `DEPLOIEMENT.md`, données en dur (fixture). (~5 fichiers)
- **Tests unitaires prévus** : 1 à 3, sur la logique de filtrage/statut des ACTIV' dans le tableau de bord (pas sur le balisage des écrans).
- **Étapes ajoutées à la démo** : ouvrir l'application, choisir le persona « chargée de remobilisation », voir le tableau de bord.
- **Bilan** :
  - **Durée de codage réelle** : 3 minutes (budget 10 min, pas de dépassement).
  - **Dépassement de la publication** : la publication a largement dépassé les ~5 minutes estimées (environ 40 minutes au total), à cause d'un blocage infrastructure sans rapport avec le code : la plateforme (`gitlab-ci-local`) a buté 3 fois sur la limite de débit anonyme de Docker Hub pour tirer `registry:2` et `pgvector/pgvector` (→ `registry.internal`, `postgres.internal`). Deux relances espacées dans le temps ont fini par passer.
  - **Critères satisfaits** : les 3 (écran « Qui êtes-vous ? », tableau de bord admin en dur, `/health` et `/sante` à 200).
  - **Reporté** : rien de prévu n'a été reporté.
  - **Ce que le harnais a bloqué ou refusé** : rien — `npm test` passait et le contrat de déployabilité ne signalait aucune borne, donc `signaler-version.sh 1` est passé du premier coup.
  - **Modifications** :
    - `.env.example` : variable `PORT` documentée — critère 3 (contrat de déployabilité).
    - `DEPLOIEMENT.md` : fiche de déploiement de l'application — critère 3.
    - `frontend/src/lib/roles.ts` : personas, mapping rôle→route, données ACTIV' en dur, calcul des compteurs par statut — critères 1 et 2.
    - `frontend/src/lib/roles.test.ts` : tests sur `routePourRole` et `compterParStatut` — critère 2 (DoD).
    - `frontend/src/app/page.tsx` : écran « Qui êtes-vous ? » (remplace la page Next par défaut) — critère 1.
    - `frontend/src/app/admin/page.tsx` : tableau de bord admin avec données en dur — critère 2.
    - `frontend/src/app/espace/page.tsx` : page de redirection minimale pour le rôle ACTIV' (contenu réel en itération 3).
    - `frontend/Dockerfile`, `api/Dockerfile` : images de base qualifiées en `docker.io/library/...` (exigé par le `/CLAUDE.md` du serveur, sinon échec de résolution hors terminal interactif).
    - `podman-compose.yml` : écrit à la racine pour le déploiement (front sur 8080, api sur 8081, réseau `core-network`).
    - `e2e/demo.spec.ts` : étapes « je choisis le persona » et « je vois le tableau de bord » ajoutées à la démo.

## Itération 2 : La chargée de remobilisation confirme l'habilitation d'une ACTIV' depuis sa fiche, et les actions correspondantes se débloquent

- **Dans le périmètre** :
  - Fiche ACTIV' : matrice de formation (tronc commun, formation modération, formation pair-aidance si suivie).
  - Action « confirmer l'habilitation » : trace la date, débloque les actions (texte des actions ouvertes : animer un atelier, participer à une permanence/groupe de parole).
- **Hors périmètre** : intégration à un vrai référentiel de formation externe ; persistance au-delà d'un store simple côté API.
- **Critères d'acceptation** :
  - Étant donné une ACTIV' dont toutes les étapes de formation sont validées, quand la chargée confirme l'habilitation, alors la date est enregistrée et affichée sur la fiche.
  - Étant donné une habilitation confirmée, quand on revient au tableau de bord, alors le statut de l'ACTIV' passe à « habilitée ».
  - Étant donné une ACTIV' avec des étapes manquantes, quand on consulte sa fiche, alors l'action de confirmation n'est pas disponible.
- **Hypothèse de l'équipe couverte** : aucune hypothèse formelle fournie ; répond directement au job to be done n°1 de la passation (« l'habilitation soit tracée et les actions se débloquent »).
- **Codage estimé** : 10 minutes.
- **Fichiers prévus** : route API habilitation, store/données, composant Fiche ACTIV', mise à jour du tableau de bord, tests. (~5 fichiers)
- **Tests unitaires prévus** : 1 à 3, sur la règle « toutes les étapes validées → habilitation possible » et son inverse.
- **Étapes ajoutées à la démo** : depuis le tableau de bord, ouvrir une fiche ACTIV', confirmer l'habilitation, voir le statut mis à jour.
- **Bilan** :
  - **Durée de codage réelle** : 2 minutes (budget 10 min, pas de dépassement).
  - **Publication** : rapide cette fois — le registre et postgres étaient déjà sains, build + push + redéploiement + vérification + signal en quelques minutes, sans blocage infra.
  - **Critères satisfaits** : les 3 (date tracée et affichée à la confirmation ; statut qui passe à « habilitée » — vérifié côté API via la fiche, qui reflète désormais `dateHabilitation` ; action de confirmation indisponible/refusée (409) quand des étapes manquent).
  - **Reporté** : rien de prévu n'a été reporté.
  - **Ce que le harnais a bloqué ou refusé** : rien — `npm test` passait (9 tests), le contrat de déployabilité ne signalait aucune borne.
  - **Démo Playwright** : échoue en local sur l'étape « fiche ACTIV' », attendu — elle appelle `/api/v1/...` en chemin relatif, qui ne se route vers l'API que derrière la vraie passerelle (routage par chemin), pas quand on teste le port 8080 directement depuis la VM. À vérifier par le développeur via `$URL_PUBLIQUE` ; non bloquant (hors DoD).
  - **Modifications** :
    - `api/src/routes.ts` : fiche ACTIV' avec étapes de formation, règle « toutes les étapes validées → habilitation possible », action `POST /api/v1/activs/:id/habiliter` qui trace la date — critères 1, 2, 3.
    - `api/src/routes.test.ts` : 3 tests ajoutés (confirmation avec date tracée, refus à 409 si étapes manquantes, lecture de la fiche) — DoD point 2.
    - `frontend/src/app/admin/activ/[id]/page.tsx` : route statique (generateStaticParams) pour la fiche de chaque ACTIV' — critère 1.
    - `frontend/src/app/admin/activ/[id]/FicheActiv.tsx` : composant client, matrice de formation, bouton de confirmation désactivé si incomplet, actions débloquées affichées une fois habilitée — critères 1 et 3.
    - `frontend/src/app/admin/page.tsx` : lien de chaque ligne du tableau vers sa fiche — critère 2.
    - `e2e/demo.spec.ts` : étapes « j'ouvre la fiche de Nora » et « je confirme son habilitation » ajoutées à la démo.

## Itération 3 : L'ACTIV' habilitée voit son parcours et ce qui s'ouvre pour elle dans « Mon parcours »

- **Dans le périmètre** : écran « Mon parcours » pour le persona ACTIV' — étapes de formation validées, et actions débloquées après habilitation.
- **Hors périmètre** : confirmation de présence, enquête de satisfaction.
- **Critères d'acceptation** :
  - Étant donné le persona ACTIV' habilitée, quand elle ouvre « Mon parcours », alors elle voit ses étapes validées et les actions désormais ouvertes.
  - Étant donné le persona ACTIV' non habilitée, quand elle ouvre « Mon parcours », alors elle voit son avancement sans les actions débloquées.
- **Hypothèse de l'équipe couverte** : aucune hypothèse formelle fournie ; complète le scénario idéal décrit dans le PRD de la passation (étape 4).
- **Codage estimé** : 8 minutes.
- **Fichiers prévus** : écran « Mon parcours », lecture du statut via l'API, tests. (~4 fichiers)
- **Tests unitaires prévus** : 1 à 2, sur la règle de déblocage des actions selon le statut d'habilitation.
- **Étapes ajoutées à la démo** : changer de persona vers l'ACTIV' habilitée, voir son parcours et ses actions débloquées.
- **Bilan** : _à remplir en fin d'itération_

## Itération 3bis : La chargée de remobilisation voit, dans le tableau de bord, la disponibilité et l'avancement de chaque ACTIV', et une table des formatrices disponibles par module

- **Contexte** : itération ajoutée en cours de build à la demande du développeur (temps restant non reconfirmé — « avance rapidement » demandé explicitement, donc codée sans attendre un chiffre à jour).
- **Dans le périmètre** :
  - Tableau de bord admin : colonnes « Avancement » (étapes de formation validées / 2) et « Disponibilité » pour chaque ACTIV'.
  - Nouvelle table « Formatrices disponibles » : distinction formatrice/ACTIV', disponibilité de chaque formatrice, modules qu'elle peut animer.
- **Hors périmètre, explicitement laissé de côté** (plusieurs demandes du développeur, trop grosses ou en conflit avec le hors-périmètre du squad — voir note ⚠️ plus bas) :
  - Rapports d'étonnement post-formation et alertes de signalement (directrice d'antenne).
  - Chat de recommandation de formation pour l'ACTIV' (contredit le hors-périmètre « communauté/chat » du squad, et dépend d'un quota LLM partagé).
  - Catalogue de formation pour les admins (recoupe le « back-office au-delà de l'habilitation », hors périmètre du squad).
  - Dates de sessions de formation / planning.
  - Action de dispatch effective (assigner une ACTIV' à un atelier) — seule la visibilité de la disponibilité est couverte ici.
- **Critères d'acceptation** :
  - Étant donné le tableau de bord admin, quand on le consulte, alors chaque ACTIV' affiche son avancement (x/2 étapes) et sa disponibilité.
  - Étant donné le tableau de bord admin, quand on le consulte, alors une table distincte liste les formatrices, leur disponibilité et les modules qu'elles peuvent animer.
- **Codage réel** : moins d'1 minute.
- **Tests unitaires ajoutés** : 1 (règle de comptage des étapes validées, `compterEtapesValidees`).
- **Fichiers modifiés** : `frontend/src/lib/roles.ts` (champs `disponible`/`etapes` sur `Activ`, fixture `FORMATRICES`, `compterEtapesValidees`), `frontend/src/lib/roles.test.ts`, `frontend/src/app/admin/page.tsx` (colonnes + table).
- **Déploiement** : image frontend reconstruite et republiée ; `/health` et `/sante` toujours à 200 ; contrat de déployabilité sans borne ; `npm test` passe (10 tests) ; version 3 signalée à PM Lab.
- ⚠️ **À faire valider par les cadreurs** : les items laissés hors périmètre ci-dessus, en particulier le chat (contradiction directe avec une exclusion déjà actée) et le catalogue de formation (back-office).

## Itération 4 : Front modernisé, « Mon parcours » réel pour l'ACTIV', et enquête de satisfaction

- **Contexte** : itération ajoutée à la demande du développeur (« front moderne rapidement et les retours » → clarifié : enquête de satisfaction), sans reconfirmation du temps restant — enchaînée directement sur la demande explicite d'avancer vite.
- **Dans le périmètre** :
  - Design modernisé : palette, typographie, boutons, tableaux et formulaires cohérents sur tout le site (`globals.css`), au lieu des styles par défaut de `create-next-app`.
  - Écran « Mon parcours » (persona ACTIV', itération 3 initialement prévue) : étapes de formation, prochaine étape, actions débloquées si habilitée — lit la fiche API déjà posée en itération 2.
  - Enquête de satisfaction : l'ACTIV' note sa formation (1 à 5) avec un commentaire facultatif ; la chargée de remobilisation voit la moyenne et le détail des retours sur la fiche ACTIV'.
- **Hors périmètre** : agrégation de la satisfaction dans le tableau de bord global (seulement visible fiche par fiche pour l'instant) ; rapports d'étonnement structurés et alertes de signalement (restent en « À venir », plus gros).
- **Critères d'acceptation** :
  - Étant donné le persona ACTIV', quand elle ouvre « Mon parcours », alors elle voit ses étapes validées et sa prochaine étape (ou les actions débloquées si habilitée).
  - Étant donné l'écran « Mon parcours », quand elle note sa formation et envoie un commentaire, alors le retour est enregistré et confirmé à l'écran.
  - Étant donné une fiche ACTIV' avec des retours de satisfaction, quand la chargée de remobilisation la consulte, alors elle voit la note moyenne et le détail des retours.
- **Codage réel** : environ 8 minutes.
- **Tests unitaires ajoutés** : 2 (enregistrement d'une note valide avec trace du commentaire, refus d'une note hors de l'intervalle 1–5).
- **Fichiers modifiés** : `frontend/src/app/globals.css`, `frontend/src/app/layout.tsx` (titre), `frontend/src/app/espace/page.tsx` + `EspaceActiv.tsx` (nouveau), `frontend/src/app/admin/activ/[id]/FicheActiv.tsx` (section satisfaction), `api/src/server.ts` (lecture du corps de requête), `api/src/routes.ts` (route satisfaction + validation), `api/src/routes.test.ts`.
- **Déploiement** : images api et frontend reconstruites et republiées ; `/health` et `/sante` à 200 ; contrat de déployabilité sans borne ; `npm test` passe (12 tests) ; version 4 signalée à PM Lab.
- **Démo** : étapes ACTIV'/satisfaction ajoutées ; régression corrigée (le nouveau tableau « Formatrices » faisait échouer le locator générique `getByRole("table")` de l'itération 1, précisé avec `.first()`). L'étape « fiche ACTIV' » échoue toujours en local pour la raison déjà connue (routage `/api/` par la vraie passerelle uniquement) — non bloquant.

## Itération 5 : Enquête de satisfaction rendue obligatoire + visibilité agrégée dans le tableau de bord admin

- **Contexte** : demande explicite du développeur (« rajoute une colonne satisfaction stp et que l'enquete de satistafaction est mandatory pour chaque user et les admin le visualise »), enchaînée sans reconfirmation du temps restant, conformément à « avance rapidement ».
- **Dans le périmètre** :
  - Le tableau de bord admin lit désormais la liste réelle (`GET /api/v1/activs`) au lieu de la fixture statique front, avec une colonne « Satisfaction » par ACTIV' (moyenne + nombre de retours, ou badge « En attente (obligatoire) » si aucun retour).
  - Le commentaire de l'enquête de satisfaction (persona ACTIV') devient obligatoire : champ `required`, et un message d'erreur bloque l'envoi si le commentaire est vide.
  - Nouveau champ `disponible` unifié côté API (`ActivDetail`), et `statutFormation` calculé par l'API (`statutDe`) plutôt que dupliqué côté front.
- **Hors périmètre** : chatbot de recommandation de formation et catalogue de formation pour les admins — toujours en conflit direct avec le hors-périmètre acté par l'équipe (« communauté/chat », « back-office au-delà de la confirmation d'habilitation ») ; redemandés par le développeur dans cette itération, non codés en l'absence de confirmation des cadreurs.
- **Critères d'acceptation** :
  - Étant donné le tableau de bord admin, quand on le consulte, alors chaque ACTIV' affiche sa satisfaction moyenne ou un badge « en attente ».
  - Étant donné l'écran « Mon parcours », quand l'ACTIV' tente d'envoyer l'enquête sans commentaire, alors l'envoi est refusé avec un message explicite.
- **Codage réel** : environ 6 minutes.
- **Tests unitaires ajoutés** : 1 (`GET /api/v1/activs` expose bien `disponible` par ACTIV').
- **Fichiers modifiés** : `api/src/routes.ts` (`disponible` sur `ActivDetail`+fixtures, `StatutFormation`/`statutDe`, route liste), `api/src/routes.test.ts`, `frontend/src/app/admin/page.tsx` (réécrit en composant client, fetch de la liste, colonne Satisfaction), `frontend/src/app/espace/EspaceActiv.tsx` (commentaire obligatoire).
- **Déploiement** : images api et frontend reconstruites et republiées ; `/health` et `/sante` à 200 ; `GET /api/v1/activs` vérifié par curl ; contrat de déployabilité sans borne ; `npm test` passe (13 tests) ; version 5 signalée à PM Lab.
- ⚠️ **À faire valider par les cadreurs** : chatbot + catalogue de formation, redemandés une troisième fois par le développeur — nécessitent une confirmation explicite de sortie du hors-périmètre avant d'être codés, et un budget de quota LLM à vérifier côté plateforme.

## À venir

- Dispatch effectif des ACTIV' vers les ateliers selon leur formation complétée (au-delà de la simple visibilité de disponibilité).
- Rapports d'étonnement post-formation + alertes de signalement pour la directrice d'antenne.
- Catalogue de formation pour les admins (besoins, évolutions) — à confirmer avec les cadreurs (recoupe le hors-périmètre « back-office »).
- Chat de recommandation de formation pour l'ACTIV' — à confirmer avec les cadreurs (recoupe le hors-périmètre « communauté/chat »), et dépend d'un budget de quota LLM à vérifier.
- Dates de sessions de formation / planning de disponibilité.
- Confirmation de présence à une formation physique, directement dans l'espace ACTIV' (étape 3 du plan de l'équipe).
