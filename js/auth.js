/**
 * auth.js — Authentification Supabase
 *
 * CONFIGURATION INITIALE (à faire une seule fois) :
 * 1. Créer un projet sur https://supabase.com (gratuit)
 * 2. Aller dans Settings → API
 * 3. Copier "Project URL" et "anon public key" ci-dessous
 * 4. Dans Supabase → Authentication → Settings → activer "Email/Password"
 * 5. Dans Supabase → Table Editor → créer la table "profiles" :
 *      id        uuid  (FK → auth.users.id, primary key)
 *      nom       text
 *      profession text
 *      role      text  (valeur : "professionnel" ou "admin")
 *
 * CRÉER UN PROFESSIONNEL :
 * Dans Supabase → Authentication → Users → "Invite user"
 * Puis dans Table Editor → profiles → ajouter une ligne avec son id et role="professionnel"
 */

// ─── À REMPLACER PAR VOS VALEURS SUPABASE ───────────────────────────────────
var SUPABASE_URL      = 'https://VOTRE-PROJET.supabase.co';
var SUPABASE_ANON_KEY = 'VOTRE-CLE-ANON-PUBLIC';
// ────────────────────────────────────────────────────────────────────────────

var _supabase = null;

/**
 * Initialise le client Supabase (appelé une seule fois).
 * Supabase doit être chargé via CDN avant ce script.
 */
function getClient() {
  if (_supabase) return _supabase;
  if (typeof supabase === 'undefined') {
    console.error('Supabase SDK non chargé. Vérifiez le CDN dans votre HTML.');
    return null;
  }
  _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _supabase;
}

/**
 * Connexion avec email + mot de passe.
 * Retourne { user, error }
 */
async function login(email, password) {
  var client = getClient();
  if (!client) return { user: null, error: 'Client non initialisé' };

  var result = await client.auth.signInWithPassword({ email, password });
  return {
    user:  result.data?.user  || null,
    error: result.error?.message || null,
  };
}

/**
 * Déconnexion.
 */
async function logout() {
  var client = getClient();
  if (!client) return;
  await client.auth.signOut();
  window.location.href = '../index.html';
}

/**
 * Retourne l'utilisateur connecté, ou null.
 */
async function getCurrentUser() {
  var client = getClient();
  if (!client) return null;
  var result = await client.auth.getUser();
  return result.data?.user || null;
}

/**
 * Retourne le profil complet (nom, profession, role) depuis la table profiles.
 */
async function getProfile(userId) {
  var client = getClient();
  if (!client) return null;
  var result = await client
    .from('profiles')
    .select('nom, profession, role')
    .eq('id', userId)
    .single();
  return result.data || null;
}

/**
 * Protège une page : redirige vers login si non connecté ou pas le bon rôle.
 * À appeler au chargement de chaque page protégée.
 *
 * Exemple d'utilisation dans une page HTML :
 *   <script>
 *     document.addEventListener('DOMContentLoaded', function () {
 *       requireAuth('professionnel', '../pages/login.html');
 *     });
 *   </script>
 */
async function requireAuth(requiredRole, loginUrl) {
  loginUrl = loginUrl || '../pages/login.html';

  var user = await getCurrentUser();
  if (!user) {
    window.location.href = loginUrl;
    return null;
  }

  var profile = await getProfile(user.id);
  if (!profile || (requiredRole && profile.role !== requiredRole && profile.role !== 'admin')) {
    window.location.href = loginUrl + '?error=acces_refuse';
    return null;
  }

  return { user, profile };
}

/**
 * Met à jour l'UI de navigation selon l'état de connexion.
 * Injecte le nom de l'utilisateur et un bouton de déconnexion si connecté.
 */
async function updateAuthNav(navSelector) {
  var navEl = document.querySelector(navSelector || '.auth-nav');
  if (!navEl) return;

  var user = await getCurrentUser();
  if (!user) {
    navEl.innerHTML = '<a href="pages/login.html" class="btn btn--outline" style="font-size:13px;padding:6px 14px;">Espace pro</a>';
    return;
  }

  var profile = await getProfile(user.id);
  var nom = profile ? profile.nom : user.email;

  navEl.innerHTML =
    '<span style="font-size:13px;color:var(--color-text-muted);margin-right:12px;">' + nom + '</span>' +
    '<button onclick="logout()" class="btn btn--outline" style="font-size:13px;padding:6px 14px;">Déconnexion</button>';
}

// Exposer les fonctions globalement (pas de module bundler)
window.Auth = { login, logout, getCurrentUser, getProfile, requireAuth, updateAuthNav };
