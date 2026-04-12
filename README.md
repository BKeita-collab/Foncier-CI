# Foncier Ivoirien — Guide pratique

Site statique sur le droit foncier en Côte d'Ivoire, hébergé sur GitHub Pages.

---

## Architecture du projet

```
foncier-ivoirien/
│
├── index.html                ← Page principale : guide foncier (9 sections)
│
├── pages/
│   ├── annuaire.html         ← Annuaire cartographique des professionnels
│   └── graphiques.html       ← Schémas visuels des processus fonciers
│
├── css/
│   ├── variables.css         ← Tokens de design (couleurs, fonts, rayons…)
│   ├── base.css              ← Reset global et typographie de base
│   ├── components.css        ← Composants réutilisables (cards, tables, steps…)
│   └── layout.css            ← Structure de page (hero, nav, main, footer)
│
├── js/
│   ├── nav.js                ← Navigation par onglets (tabs)
│   └── map.js                ← Carte Leaflet pour l'annuaire
│
├── data/
│   └── professionnels.json   ← Données de l'annuaire (éditable sans coder)
│
└── README.md
```

---

## Démarrage rapide

Ce site est **100 % statique** — aucun serveur, aucun build tool nécessaire.

### Tester en local

Ouvrir `index.html` directement dans un navigateur.

> Pour la carte (annuaire.html), il faut servir les fichiers via un serveur local
> à cause du chargement du fichier JSON. Utiliser :
> ```
> npx serve .
> # ou
> python3 -m http.server 8000
> ```

### Publier sur GitHub Pages

1. Créer un dépôt GitHub public (ex: `foncier-ivoirien`)
2. Pousser tous les fichiers sur la branche `main`
3. Aller dans **Settings → Pages → Source → Deploy from branch → main / root**
4. Le site est accessible à : `https://[username].github.io/foncier-ivoirien/`

---

## Maintenir le site

### Modifier le contenu des sections (index.html)

Ouvrir `index.html` et trouver la section voulue avec son commentaire HTML :

```html
<!-- ─── 1. FONDAMENTAUX ─── -->
<section id="fondamentaux" class="section">
  ...
</section>
```

Chaque section contient du HTML simple avec des classes comme `.card`, `.loi-box`, `.steps`, etc.
Ces classes sont définies dans `css/components.css`.

### Changer les couleurs / typographie

Modifier uniquement `css/variables.css` — toutes les couleurs du site en dépendent :

```css
:root {
  --color-green: #1C4731;    /* Couleur principale */
  --color-terra: #B94E27;    /* Erreurs / dangers */
  --color-amber: #B87B0A;    /* Avertissements */
  /* ... */
}
```

### Ajouter un professionnel à l'annuaire

Éditer `data/professionnels.json` en suivant le modèle existant :

```json
{
  "id": 8,
  "nom": "Cabinet Exemple",
  "categorie": "Géomètre expert",
  "agrement": "OGECI-2024-099",
  "ville": "Abidjan — Yopougon",
  "adresse": "Rue des professionnels",
  "telephone": "+225 27 00 00 00 00",
  "email": "contact@exemple.ci",
  "lat": 5.3324,
  "lng": -4.0761
}
```

Catégories disponibles : `Géomètre expert`, `Notaire`, `Avocat foncier`,
`Conservation foncière`, `Promoteur immobilier`.

Pour trouver les coordonnées GPS d'une adresse : [latlong.net](https://www.latlong.net)

### Ajouter un schéma dans graphiques.html

1. Ouvrir `pages/graphiques.html`
2. Ajouter un bouton dans `.schema-nav` :
   ```html
   <button class="schema-nav__btn" data-schema="mon-schema">Mon schéma</button>
   ```
3. Ajouter la section correspondante :
   ```html
   <div id="schema-mon-schema" class="schema">
     <p class="sub-heading">Titre du schéma</p>
     <figure class="diagram-wrap">
       <!-- SVG ici -->
     </figure>
   </div>
   ```

### Ajouter une nouvelle section dans le guide

1. Ajouter un onglet dans la barre de nav de `index.html` :
   ```html
   <li><a href="#ma-section" data-section="ma-section">Ma section</a></li>
   ```
2. Ajouter la section dans le `<main>` :
   ```html
   <section id="ma-section" class="section">
     <div class="section__header">
       <h2>Titre</h2>
       <p>Sous-titre</p>
     </div>
     <!-- contenu -->
   </section>
   ```

---

## Composants disponibles (css/components.css)

| Classe | Utilisation |
|--------|-------------|
| `.loi-box` | Encadré de référence légale avec bordure gauche verte |
| `.card-grid` + `.card` | Grille de cartes |
| `.steps` + `.step` | Liste d'étapes numérotées |
| `.table-wrap` + `table` | Tableau avec style intégré |
| `.note` | Note d'avertissement (fond ambre) |
| `.highlight-box` | Encadré mis en valeur (fond vert) |
| `.badge` + `.badge--green/amber/danger` | Badge inline |
| `.tag` + `.tag--green/amber/terra/neutral` | Étiquette de catégorie |
| `.two-col` | Grille deux colonnes |
| `.stat-card` | Carte de statistique (valeur + label) |
| `.btn--primary` / `.btn--outline` | Boutons |
| `.sub-heading` | Sous-titre de section (serif) |
| `.divider` | Ligne séparatrice |

---

## Technologies utilisées

| Technologie | Usage | CDN |
|-------------|-------|-----|
| HTML5 | Structure | — |
| CSS3 (vanilla) | Styles | — |
| JavaScript (vanilla) | Navigation, carte | — |
| [Leaflet.js 1.9.4](https://leafletjs.com) | Carte interactive | unpkg.com |
| [OpenStreetMap](https://www.openstreetmap.org) | Fond de carte | — |
| [Google Fonts](https://fonts.google.com) | Cormorant Garamond + DM Sans | fonts.googleapis.com |

Aucun framework, aucun build tool — le site fonctionne avec un simple navigateur.

---

## Développements prévus

- [ ] Formulaire de contact pour rejoindre l'annuaire
- [ ] Filtres avancés dans l'annuaire (district, ville)
- [ ] Page de détail pour chaque professionnel
- [ ] Mode hors-ligne (Service Worker)
- [ ] Versions imprimables des schémas (PDF)
- [ ] Moteur de recherche dans le guide

---

## Références légales

- Loi n° 2020-624 du 14 août 2020 portant Code de l'urbanisme et du domaine foncier urbain
- Loi n° 98-750 du 23 décembre 1998 relative au domaine foncier rural
- Loi n° 2004-412 du 14 août 2004 modifiant la loi n° 98-750

---

*Ce site est fourni à titre informatif et pédagogique. Il ne constitue pas un avis juridique.*
# Foncier-CI
