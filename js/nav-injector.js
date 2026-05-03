/**
 * nav-injector.js — Module de navigation cohérente
 * 
 * Crée une structure de navigation unique et l'injecte sur toutes les pages.
 * Cela garantit que :
 * 1. Tous les liens de navigation sont identiques partout
 * 2. La page active est marquée avec .is-current
 * 3. Les chemins relatifs s'ajustent automatiquement selon la position de la page
 * 4. Les changements futurs n'affectent qu'un seul fichier
 */

// ─── Structure de navigation (source unique de vérité) ───────────────────────
const NAV_ITEMS = [
  { href: 'index.html', label: 'Guide' },
  { href: 'annuaire.html', label: 'Annuaire' },
  { href: 'graphiques.html', label: 'Graphiques' },
  { href: 'demarches.html', label: 'Démarches' },
  { href: 'espace-pro.html', label: 'Espace pro' },
  { href: 'geocodeur.html', label: 'Géocodeur' },
  { href: 'login.html', label: 'Login' },
];

/**
 * Détecte si la page courante est dans le répertoire pages/ ou à la racine.
 * Retourne true si dans pages/, false si à la racine.
 */
function isInPagesDirectory() {
  return window.location.pathname.includes('/pages/');
}

/**
 * Construit le chemin href correct selon la position courante.
 * Si on est dans pages/, les liens internes deviennent ./page.html
 * et le lien Guide devient ../index.html
 */
function buildHref(origHref) {
  const isInPages = isInPagesDirectory();
  
  if (origHref === 'index.html') {
    // Guide — toujours à la racine
    return isInPages ? '../index.html' : 'index.html';
  } else {
    // Autres pages dans pages/
    return isInPages ? origHref : 'pages/' + origHref;
  }
}

/**
 * Détecte la page courante en regardant window.location.pathname.
 * Retourne le href de la page active (sans le ../ ou pages/).
 */
function getCurrentPageHref() {
  const pathname = window.location.pathname;
  
  // Extraction du nom de fichier
  const filename = pathname.split('/').pop() || 'index.html';
  
  // Normalisation
  if (filename === '' || filename === '/') return 'index.html';
  return filename;
}

/**
 * Crée et injecte la barre de navigation sur la page.
 * Appelle cette fonction au chargement de la page.
 */
function injectNavigation(containerSelector = '.site-nav') {
  // Vérifier si un conteneur exist déjà (par exemple .site-nav manuel)
  let navContainer = document.querySelector(containerSelector);
  
  // Si le conteneur n'existe pas, le créer et l'insérer après le header
  if (!navContainer) {
    const header = document.querySelector('.page-header');
    const insertPoint = header ? header.nextElementSibling : document.querySelector('main');
    
    navContainer = document.createElement('div');
    navContainer.className = 'site-nav';
    
    if (insertPoint) {
      insertPoint.parentNode.insertBefore(navContainer, insertPoint);
    } else {
      document.body.appendChild(navContainer);
    }
  }
  
  // Créer la structure HTML
  const currentPageHref = getCurrentPageHref();
  const innerDiv = document.createElement('div');
  innerDiv.className = 'site-nav__inner';
  
  NAV_ITEMS.forEach(item => {
    const link = document.createElement('a');
    link.href = buildHref(item.href);
    link.textContent = item.label;
    
    // Marquer la page courante
    if (item.href === currentPageHref) {
      link.classList.add('is-current');
    }
    
    innerDiv.appendChild(link);
  });
  
  // Remplacer le contenu du conteneur
  navContainer.innerHTML = '';
  navContainer.appendChild(innerDiv);
}

/**
 * Initialiser à la fin du chargement du DOM
 */
document.addEventListener('DOMContentLoaded', function () {
  injectNavigation();
});

// Exposer globalement pour utilisation manuelle si nécessaire
window.NavInjector = { injectNavigation, NAV_ITEMS };
