-- HB Capital mentorship registrations
-- Run this once in your Supabase project's SQL Editor (Project → SQL Editor → New query).
-- This creates the table the registration form on the website writes to,
-- and the Macro Intelligence dashboard can read from / approve against.

create table if not exists mentorship_registrations (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),

  full_name          text not null,
  phone              text not null,
  email              text not null,

  package            text not null,          -- e.g. "Full Program — MWK 1,800,000 upfront"
  payment_method     text,                    -- e.g. "FDH Bank", "TNM Mpamba"
  payment_reference  text,                    -- transaction ID / reference, optional

  status             text not null default 'pending',  -- pending | approved | rejected
  approved_at        timestamptz,
  approved_by        text,                    -- admin identifier, filled in by the dashboard
  notes              text                     -- internal notes, filled in by the dashboard
);

-- Row Level Security: locked down by default, opened up narrowly below.
alter table mentorship_registrations enable row level security;

-- The public website (using the anon/public key) may INSERT new registrations,
-- but can NOT read, update, or delete any rows — this keeps client data private
-- even though the anon key is visible in the site's front-end code.
create policy "Public can submit registrations"
  on mentorship_registrations
  for insert
  to anon
  with check (true);

-- No select/update/delete policy is created for "anon" — which means the public
-- website has no way to read back registrations, only submit new ones.
--
-- Reading the list and approving/rejecting registrations should be done from
-- your Macro Intelligence dashboard using Supabase's service_role key (server-side
-- only, e.g. in an API route) — never expose the service_role key in front-end code.
