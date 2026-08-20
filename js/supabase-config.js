// Supabase project connection details for the HB Capital website.
//
// Where to find these: Supabase dashboard → your project → Project Settings → API
//   - SUPABASE_URL    = "Project URL"
//   - SUPABASE_ANON_KEY = "anon" "public" key (NOT the service_role key)
//
// The anon/public key is SAFE to use here — it's designed to be visible in
// browser code. Row Level Security (see supabase/schema.sql) is what actually
// protects the data: this key can only INSERT new registrations, it cannot
// read, edit, or delete anything.
//
// Never put the service_role key in this file or anywhere in the website —
// that key bypasses Row Level Security entirely and must stay private,
// used only from a secure server (e.g. inside the Macro Intelligence dashboard's backend).

window.SUPABASE_URL = 'PASTE_YOUR_SUPABASE_PROJECT_URL_HERE';
window.SUPABASE_ANON_KEY = 'PASTE_YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE';
