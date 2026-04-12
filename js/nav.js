/**
 * nav.js — Gestion de la navigation par onglets
 *
 * Fonctionnement :
 *  - Les liens du nav ont un attribut [data-section] pointant vers l'ID de la section.
 *  - Au clic, on masque toutes les sections et on affiche la section ciblée.
 *  - Le hash de l'URL est mis à jour pour permettre le partage de liens directs.
 *  - Au chargement, on lit le hash pour activer la bonne section.
 */

(function () {
  'use strict';

  const NAV_CLASS_ACTIVE   = 'is-active';
  const SECTION_CLASS      = 'section';
  const SECTION_ACTIVE     = 'is-active';

  function getLinks() {
    return Array.from(document.querySelectorAll('[data-section]'));
  }

  function getSections() {
    return Array.from(document.querySelectorAll('.' + SECTION_CLASS));
  }

  /**
   * Affiche la section correspondant à `targetId` et
   * met à jour les états actifs dans le nav.
   */
  function activateSection(targetId) {
    const sections = getSections();
    const links    = getLinks();

    // Masquer toutes les sections
    sections.forEach(function (sec) {
      sec.classList.remove(SECTION_ACTIVE);
    });

    // Désactiver tous les liens
    links.forEach(function (link) {
      link.classList.remove(NAV_CLASS_ACTIVE);
    });

    // Activer la section ciblée
    const target = document.getElementById(targetId);
    if (target) {
      target.classList.add(SECTION_ACTIVE);
    }

    // Activer le lien correspondant
    links.forEach(function (link) {
      if (link.dataset.section === targetId) {
        link.classList.add(NAV_CLASS_ACTIVE);

        // Faire défiler la barre de nav pour que l'onglet actif soit visible
        const navInner = link.closest('.nav-bar__inner');
        if (navInner) {
          const linkRect  = link.getBoundingClientRect();
          const innerRect = navInner.getBoundingClientRect();
          if (linkRect.right > innerRect.right || linkRect.left < innerRect.left) {
            link.scrollIntoView({ block: 'nearest', inline: 'center' });
          }
        }
      }
    });
  }

  /**
   * Retourne la première section disponible (défaut si hash absent).
   */
  function getDefaultSection() {
    const links = getLinks();
    return links.length ? links[0].dataset.section : null;
  }

  /**
   * Lit le hash de l'URL et active la section correspondante.
   * Si le hash est vide ou ne correspond à aucune section, active la première.
   */
  function loadFromHash() {
    const hash    = window.location.hash.replace('#', '');
    const links   = getLinks();
    const ids     = links.map(function (l) { return l.dataset.section; });
    const target  = ids.includes(hash) ? hash : getDefaultSection();
    if (target) activateSection(target);
  }

  /**
   * Initialisation : attache les événements une fois le DOM prêt.
   */
  function init() {
    const links = getLinks();

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = link.dataset.section;
        activateSection(targetId);
        // Mettre à jour le hash sans déclencher le scroll natif
        history.replaceState(null, '', '#' + targetId);
        // Remonter jusqu'à la barre de nav
        const navBar = document.querySelector('.nav-bar');
        if (navBar) {
          window.scrollTo({ top: navBar.offsetTop, behavior: 'smooth' });
        }
      });
    });

    // Charger depuis le hash au premier chargement
    loadFromHash();

    // Réagir aux changements de hash (boutons précédent/suivant du navigateur)
    window.addEventListener('hashchange', loadFromHash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
