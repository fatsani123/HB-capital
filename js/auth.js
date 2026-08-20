// Shared auth helpers for the HB Capital app.
// Requires supabase-config.js and the supabase-js CDN script to be loaded first.

const ADMIN_EMAIL = 'fatsaninkhono01@gmail.com';

function getSupabaseClient() {
  if (
    window.supabase &&
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    window.SUPABASE_URL.startsWith('http') &&
    !window.SUPABASE_URL.includes('PASTE_YOUR')
  ) {
    if (!window._hbSupabaseClient) {
      window._hbSupabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }
    return window._hbSupabaseClient;
  }
  return null;
}

// Redirects to login.html if there's no active session. Returns the session, or null (and redirects).
async function requireAuth() {
  const client = getSupabaseClient();
  if (!client) {
    console.error('Supabase is not configured yet — see js/supabase-config.js');
    return null;
  }
  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// Like requireAuth, but also redirects non-admins away to dashboard.html.
async function requireAdmin() {
  const session = await requireAuth();
  if (!session) return null;
  if (session.user.email !== ADMIN_EMAIL) {
    window.location.href = 'dashboard.html';
    return null;
  }
  return session;
}

// If the signed-in user is the admin, send them to admin.html instead of dashboard.html.
async function redirectToCorrectDashboard() {
  const client = getSupabaseClient();
  if (!client) return;
  const { data: { session } } = await client.auth.getSession();
  if (!session) return;
  window.location.href = (session.user.email === ADMIN_EMAIL) ? 'admin.html' : 'dashboard.html';
}

async function signOut() {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
  window.location.href = 'login.html';
}
