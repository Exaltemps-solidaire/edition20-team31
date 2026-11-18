# Déploiement

Application pour **L'BURN** (Les BURN'ettes), qui trace le parcours ACTIV' de la formation à l'habilitation comme pair-aidante, pour la chargée de remobilisation, la directrice d'antenne et l'ACTIV'.

## Services

- `frontend/` : Next.js en export statique, servi par nginx (port 80 du conteneur, publié en 8080). **Exposé au public.**
- `api/` : Node sans dépendance, port 8081 (publié en 8081). Reçoit `/api/v1/...` (préfixe conservé par le proxy d'entrée).

## Services externes appelés

Aucun pour l'instant : les données sont en dur côté frontend (personas, liste d'ACTIV'). Aucune base de données, aucun appel IA.

## Connu comme fragile ou inachevé

- Pas de persistance : toute action (habilitation, présence, enquête) prévue aux itérations suivantes n'est pas encore écrite nulle part.
- `/espace` (vue ACTIV') est un écran de redirection minimal, sans contenu métier — prévu en itération 3.
- Pas d'authentification : sélection de persona dans une liste (« Qui êtes-vous ? »), décision du squad, pas de compte ni de mot de passe.

## Contact

Équipe 31. Association : L'BURN.
