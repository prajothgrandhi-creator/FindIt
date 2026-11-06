# FindIt rules
Campus Lost & Found for PES University. Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase (https://hcnvwjbjohajbnebfzya.supabase.co), pgvector.
Colors (globals.css tokens only): bg #15121C, surface #292333, elevated #342C40, accent #F59E0B, accent-bright #FFBE24, text #F7F4FA, muted #B7AEBF, subtle #8E8799, border rgba(255,255,255,.10), success #34D399, warning #FBBF24, danger #F87171. Font Inter, bold headings.
Page titles: two lines, line 2 amber. Primary button solid amber, dark text, 8px radius. Cards: surface, 1px border, 12px radius. Dark, elegant, minimal; no emoji icons; no fake data or stats; every list has skeleton, empty and error states. Responsive, accessible.
SRN regex: ^PES[0-9]UG[0-9]{2}[A-Z]{2,3}[0-9]{3}$. Must also exist in student_roster. Generic auth errors.
Secrets only in .env.local. Public vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Server-only logic on server.
Token rules: do not re-read files you just wrote, do not write docs or tests unless asked, do not print file contents, run lint/tsc/build once at the end only, final report max 8 lines.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
