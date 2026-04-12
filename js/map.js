/**
 * map.js — Annuaire cartographique des professionnels de la chaîne foncière
 *
 * Dépendance : Leaflet.js (chargé via CDN dans annuaire.html)
 * Données     : data/professionnels.json
 *
 * Pour ajouter un professionnel :
 *   → Éditer data/professionnels.json (pas besoin de toucher ce fichier)
 *
 * Pour personnaliser l'apparence des marqueurs :
 *   → Modifier la fonction `createIcon()` ci-dessous
 */

(function () {
  'use strict';

  /* ── Configuration ── */
  var CONFIG = {
    dataUrl:   '../data/professionnels.json', // chemin relatif depuis pages/
    mapCenter: [5.35, -4.0],                  // Centre sur Abidjan
    zoom:      7,
    tileUrl:   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttrib: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  };

  /* ── Couleurs par catégorie de professionnel ── */
  var CATEGORY_COLORS = {
    'Géomètre expert':      '#1C4731',
    'Notaire':              '#2D6B47',
    'Avocat foncier':       '#B94E27',
    'Conservation foncière':'#B87B0A',
    'Promoteur immobilier': '#4A6FA5',
    'default':              '#6B6560',
  };

  /* ── Crée un marqueur SVG coloré ── */
  function createIcon(category) {
    var color = CATEGORY_COLORS[category] || CATEGORY_COLORS['default'];
    var svgMarker = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">',
        '<path d="M14 0C6.3 0 0 6.3 0 14c0 9.8 14 22 14 22S28 23.8 28 14C28 6.3 21.7 0 14 0z" fill="', color, '" opacity="0.9"/>',
        '<circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>',
      '</svg>'
    ].join('');

    return L.divIcon({
      html:      svgMarker,
      className: 'map-marker',
      iconSize:  [28, 36],
      iconAnchor:[14, 36],
      popupAnchor:[0, -38],
    });
  }

  /* ── Génère le contenu HTML d'une popup ── */
  function buildPopup(pro) {
    var lines = [
      '<div class="map-popup">',
        '<div class="map-popup__category">', escapeHtml(pro.categorie), '</div>',
        '<div class="map-popup__name">',     escapeHtml(pro.nom),       '</div>',
        pro.agrement
          ? '<div class="map-popup__agrement">N° agrément : ' + escapeHtml(pro.agrement) + '</div>'
          : '',
        '<div class="map-popup__ville">',    escapeHtml(pro.ville),     '</div>',
        pro.telephone
          ? '<div class="map-popup__contact"><a href="tel:' + escapeHtml(pro.telephone) + '">'
            + escapeHtml(pro.telephone) + '</a></div>'
          : '',
        pro.email
          ? '<div class="map-popup__contact"><a href="mailto:' + escapeHtml(pro.email) + '">'
            + escapeHtml(pro.email) + '</a></div>'
          : '',
      '</div>',
    ];
    return lines.join('');
  }

  /* ── Filtre les marqueurs par catégorie ── */
  function filterMarkers(markers, category) {
    markers.forEach(function (item) {
      if (!category || item.data.categorie === category) {
        item.marker.addTo(item.layer);
      } else {
        item.layer.removeLayer(item.marker);
      }
    });
  }

  /* ── Utilitaire : échappe le HTML ── */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Affiche un message d'erreur sur la carte ── */
  function showMapError(mapEl, message) {
    mapEl.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;'
      + 'font-family:sans-serif;color:#6B6560;font-size:14px;padding:2rem;text-align:center;">'
      + message + '</div>';
  }

  /* ── Point d'entrée principal ── */
  function initMap() {
    var mapEl = document.getElementById('pro-map');
    if (!mapEl) return;

    /* Vérifier que Leaflet est chargé */
    if (typeof L === 'undefined') {
      showMapError(mapEl, 'Leaflet.js non chargé. Vérifiez votre connexion internet.');
      return;
    }

    /* Créer la carte */
    var map = L.map('pro-map', {
      center:          CONFIG.mapCenter,
      zoom:            CONFIG.zoom,
      scrollWheelZoom: false,
    });

    /* Fond de carte OpenStreetMap */
    L.tileLayer(CONFIG.tileUrl, {
      attribution: CONFIG.tileAttrib,
      maxZoom:     19,
    }).addTo(map);

    /* Charger les données JSON */
    fetch(CONFIG.dataUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('Erreur HTTP ' + res.status);
        return res.json();
      })
      .then(function (professionnels) {
        var layer   = L.layerGroup().addTo(map);
        var markers = [];
        var categories = {};

        professionnels.forEach(function (pro) {
          if (!pro.lat || !pro.lng) return;

          var marker = L.marker([pro.lat, pro.lng], { icon: createIcon(pro.categorie) })
            .bindPopup(buildPopup(pro), { maxWidth: 260 });

          markers.push({ marker: marker, data: pro, layer: layer });
          marker.addTo(layer);
          categories[pro.categorie] = true;
        });

        /* Mettre à jour le compteur */
        var countEl = document.getElementById('pro-count');
        if (countEl) countEl.textContent = professionnels.length;

        /* Alimenter le filtre par catégorie */
        var filterEl = document.getElementById('filter-categorie');
        if (filterEl) {
          Object.keys(categories).sort().forEach(function (cat) {
            var opt  = document.createElement('option');
            opt.value       = cat;
            opt.textContent = cat;
            filterEl.appendChild(opt);
          });

          filterEl.addEventListener('change', function () {
            var val = this.value;
            /* Vider le calque et ré-ajouter les marqueurs filtrés */
            layer.clearLayers();
            markers.forEach(function (item) {
              if (!val || item.data.categorie === val) {
                item.marker.addTo(layer);
              }
            });
          });
        }

        /* Recherche par nom ou ville */
        var searchEl = document.getElementById('search-pro');
        if (searchEl) {
          searchEl.addEventListener('input', function () {
            var query = this.value.toLowerCase().trim();
            layer.clearLayers();
            markers.forEach(function (item) {
              var match =
                !query ||
                item.data.nom.toLowerCase().includes(query) ||
                item.data.ville.toLowerCase().includes(query);
              if (match) item.marker.addTo(layer);
            });
          });
        }
      })
      .catch(function (err) {
        console.warn('Impossible de charger les professionnels :', err);
        showMapError(mapEl,
          'Les données ne sont pas encore disponibles. '
          + 'Consultez data/professionnels.json pour ajouter des professionnels.'
        );
      });
  }

  /* Lancer après le DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }

})();
