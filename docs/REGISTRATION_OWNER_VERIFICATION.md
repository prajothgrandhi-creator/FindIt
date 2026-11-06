# Owner guide: seed and verify one real FindIt registration

## Registration and roster status (read-only checks, 2026-11-01)

- `.env.local` loaded values for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. The configured Supabase URL host matched the expected FindIt project. `NEXT_PUBLIC_SITE_URL` and `ROSTER_IMPORT_ADMIN_USER_IDS` are not configured; local development falls back to `http://localhost:3000`, while production requires `NEXT_PUBLIC_SITE_URL`. The admin allowlist must be configured before admin access is granted.
- Read-only Supabase REST schema introspection returned HTTP 200 and reported `universities(id,name,slug,is_active,created_at)`, `student_roster(university_id,normalized_srn,auth_email,is_active,imported_at)`, and `student_profiles(id,university_id,normalized_srn,display_name,verification_status,created_at,updated_at)`.
- The configured project and active PES University lookup returned HTTP 200 and the expected university ID. A recent exact-count REST GET returned one row each for `universities`, `student_roster`, and `student_profiles`; a separate restricted lookup reported an active roster match for the owner's supplied SRN. These responses selected only non-private identifiers; no email, profile contents, or roster rows were printed.
- This latest API result conflicts with the owner's SQL Editor report of zero roster rows and an earlier API count of zero. The row's authorization/provenance is not established. Do not register against it until the owner confirms in the correct Supabase project that the active row contains their own real, approved identity and approved email. The query contract and expected column names are accepted, with no observed service-role API error.
- The migration enables RLS, revokes roster access from public/anon/authenticated, and grants `SELECT` to `service_role`. Successful service-role queries show the application's privileged query path is not blocked; the live `pg_policies` catalog was not introspected. Supabase Auth email-confirmation settings were not verified.
- No database writes or Auth requests were made. Do not conclude registration succeeded from an active roster match or generic 202; Auth and profile creation remain unverified.

## Owner-only SQL seed template

Only the project owner or an authorized PES roster administrator should use this template, and only for their own real, approved roster entry. Replace all three placeholders with verified values before running it in the intended Supabase project's SQL Editor. Do not commit a filled-in copy, share the real email, or use this for a fictional/test identity. This template was not executed by the development agent.

```sql
insert into public.student_roster (
  university_id,
  normalized_srn,
  auth_email,
  is_active
)
select
  u.id,
  upper(btrim('<NORMALIZED_SRN>')),
  lower(btrim('<REAL_EMAIL>')),
  true
from public.universities as u
where u.id = '<PES_UNIVERSITY_UUID>'::uuid
  and u.slug = 'pes-university'
  and u.is_active = true
  and upper(btrim('<NORMALIZED_SRN>')) ~ '^PES[0-9]UG[0-9]{2}[A-Z]{2,3}[0-9]{3}$'
  and position('@' in lower(btrim('<REAL_EMAIL>'))) > 1
returning university_id, normalized_srn, is_active;
```

The insert should return exactly one row. Zero returned rows means the university or input validation did not match. A unique/FK/check-constraint error must be investigated; do not bypass it with weaker constraints or `ON CONFLICT DO UPDATE`.

## End-to-end verification checklist

1. Confirm only the approved row exists for the owner/student: expected PES university ID, uppercase trimmed SRN, approved lower-case authentication email, and `is_active = true`. Do not export unrelated roster rows.
2. In the Supabase Dashboard, confirm email/password Auth is enabled and inspect the account's confirmation status after signup. Configure the local/deployed site URL and `/auth/callback` redirect URL as appropriate. Do not disable email confirmation to force success.
3. Submit the same SRN, roster-authorized email, full name, and chosen password at `/signup`. In server logs, expect `roster_match_found`, `auth_creation_attempted`, and `auth_creation_succeeded`; if confirmation is pending, `email_not_confirmed`; after profile insertion, `profile_creation_succeeded`. Failure states include `no_roster_match`, `roster_email_mismatch`, `auth_signup_failed`, and `profile_insert_failed`. These events contain no SRN, email, password, or secret.
4. Confirm the corresponding Auth user and its confirmation state in Supabase Authentication > Users. Then confirm one `student_profiles` row exists for that Auth user and SRN, with `verification_status = 'pending'`. The public 202 response alone is not evidence of account creation.
5. Sign in at `/login` with the same SRN and password. Verify that the server obtains an Auth user through `getUser()` and the session reaches the protected student area.
6. To test administration, obtain explicit owner approval for the real administrator Auth UUID and add it to server-only `ROSTER_IMPORT_ADMIN_USER_IDS`, then restart the server. The current SRN login also requires that admin identity to have an approved active roster mapping. The importer is `POST /api/admin/roster-import` (authenticated same-origin CSV request); there is no roster-import UI. Do not expose the allowlist or service-role key as `NEXT_PUBLIC_` variables.

No end-to-end registration or login is claimed until these steps have been completed and the Auth user and profile are independently verified.

## Phase 2 implementation review and latest checks

- Existing implementation: signup validates university/SRN/email/name/password; checks an active university and active `(university_id, normalized_srn)` roster row through a server-role client; requires the submitted email to match that row's private `auth_email`; uses the roster email only server-side for Auth signup; inserts a pending profile after Auth signup. SRN login resolves the same active row, signs in through cookie-aware Supabase SSR, and verifies via `auth.getUser()`.
- Admin authorization verifies the Supabase user server-side and checks `ROSTER_IMPORT_ADMIN_USER_IDS`. The CSV API is protected and validates same-origin and rows, but there is no upload UI. The allowlist is not configured in the loaded environment; login also needs the admin identity to have an active roster mapping, so the importer has a bootstrap dependency.
- Option A (authorized roster): preserves the roster-backed signup and is the smallest, fastest safe option once the roster source/provenance is verified. The latest API result suggests a row may now exist, but its legitimacy must be confirmed by the owner before use.
- Option B (self-registration without a roster): not implemented. It requires an explicit student email field and confirmation design because Supabase Auth needs an email, a schema change because `student_profiles` has a foreign key to `student_roster`, and a defined authorized process/UI for moving pending profiles to verified. A valid-looking SRN or verified email does not prove enrollment. Do not implement until these product/security decisions are approved.
- Latest checks: `npm test` passed (24 tests), lint passed, and `npx tsc --noEmit` passed. `npm run build` failed in Turbopack starting its CSS worker (`Failed to write app endpoint /page`). `npm run build -- --webpack` also failed with local `EPERM` creating `.next/server/app/api/admin`; neither build is claimed successful.
- Loaded environment presence: Supabase URL, publishable key, and service-role key present; URL host matches expected project; `NEXT_PUBLIC_SITE_URL` and `ROSTER_IMPORT_ADMIN_USER_IDS` missing/empty. Development has a localhost fallback for the site URL; production needs the explicit URL. No Auth signup/login or production write was attempted.
