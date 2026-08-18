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

window.SUPABASE_URL = 'https://ppdwkovceuzlvvxzhyli.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZHdrb3ZjZXV6bHZ2eHpoeWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTI0MTMsImV4cCI6MjA5Njc2ODQxM30.4Fqf58BSTBUL-5rznGP68U0yJmvs1Pu5HMGOffQEsKY';
