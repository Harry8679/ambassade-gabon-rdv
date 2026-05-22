# Ambassade du Gabon en France — Prise de rendez-vous passeport

Prototype de démonstration. Application **React + TypeScript** (Vite), prête à
être déployée gratuitement sur **GitHub Pages**.

Toutes les données sont simulées en mémoire (dossier `src/data/`). Aucun serveur
n'est nécessaire pour la démo.

## Fonctionnalités

**Espace citoyen**

- Demande de passeport : première demande ou renouvellement.
- Calendrier de dépôt du lundi au jeudi ; une journée complète apparaît grisée
  et n'est plus cliquable.
- Choix d'un créneau horaire ; les créneaux pris sont désactivés.
- Validation par email (le rendez-vous n'est confirmé qu'après le clic sur le
  lien — double opt-in).
- Récupération du passeport : choix d'un vendredi via le numéro de référence.
- **Suivi de dossier** : timeline d'avancement (dépôt → instruction → transmis
  à Libreville → fabrication → retour Paris → disponible), avec alerte en cas
  de pièces manquantes.

**Espace administration**

- Tableau de bord avec indicateurs.
- Liste des dossiers, filtrable par jour et par recherche (nom ou référence).
- **Avancement de l'étape de traitement** via un menu déroulant ; quand
  l'étape passe à « disponible », le citoyen reçoit un email automatiquement.
- Signalement de pièces manquantes (avec note transmise au citoyen).
- Paramétrage de la durée des créneaux (15, 20, 30 ou 45 minutes).

## Lancer en local

Prérequis : Node.js 18 ou supérieur.

```bash
npm install
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

## Déploiement gratuit sur GitHub Pages

### 1. Adapter la configuration

Ouvrez `vite.config.ts` et remplacez la valeur de `base` par le **nom exact de
votre dépôt GitHub** :

```ts
// Dépôt https://github.com/votre-compte/rdv-passeport
base: "/rdv-passeport/",
```

### 2. Envoyer le code sur GitHub

```bash
git init
git add .
git commit -m "Application de prise de rendez-vous passeport"
git branch -M main
git remote add origin https://github.com/votre-compte/votre-depot.git
git push -u origin main
```

### 3. Activer GitHub Pages

Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.

Le workflow `.github/workflows/deploy.yml` se déclenche alors à chaque `push`
sur `main`, construit le site et le publie automatiquement. L'URL finale est de
la forme :

```
https://votre-compte.github.io/votre-depot/
```

## Démo

- Le **mardi 19 mai 2026** apparaît grisé dans le calendrier de dépôt : tous
  ses créneaux sont réservés.
- **Parcours retrait** : référence `GAB-2026-00012` (passeport déjà arrivé).
- **Parcours suivi** : plusieurs références illustrent les différentes étapes :
  - `GAB-2026-00014` — En cours d'instruction
  - `GAB-2026-00015` — Pièces manquantes (alerte rouge avec détail)
  - `GAB-2026-00016` — Transmis à Libreville
  - `GAB-2026-00017` — En fabrication à Libreville
  - `GAB-2026-00018` — Retour vers Paris
  - `GAB-2026-00012` — Disponible à l'ambassade
  - `GAB-2026-00013` — Retrait planifié

Astuce : ouvrez l'**Administration**, faites avancer une étape sur un
dossier, puis revenez sur l'**Espace citoyen** et consultez la même référence —
la timeline est mise à jour en temps réel.

## Structure du projet

```
src/
├── data/
│   ├── constants.ts   couleurs, libellés, pipeline des étapes
│   └── seed.ts        réservations initiales (données simulées)
├── lib/
│   └── helpers.ts     génération des créneaux, dates, calendrier
├── components/
│   ├── Calendrier.tsx
│   ├── GrilleCreneaux.tsx
│   ├── Stepper.tsx
│   ├── Suivi.tsx              timeline d'avancement
│   ├── Widgets.tsx
│   ├── EspaceCitoyen.tsx
│   └── EspaceAdmin.tsx
├── types.ts           types métier
├── App.tsx            composant racine
├── main.tsx           point d'entrée
└── index.css          styles globaux
```

## Étape suivante

Le passage à la version réelle consiste à remplacer `src/data/seed.ts` par des
appels à une API. Une API **Symfony 7 + MySQL** est prévue à cet effet (entité
`Appointment`, service de disponibilité des créneaux, envoi des emails via
Symfony Mailer).
