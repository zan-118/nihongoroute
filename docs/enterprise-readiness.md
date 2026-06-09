# Enterprise Readiness

This document defines the operating standard for running NihongoRoute as a production-grade service.

## Current Enterprise Controls

| Area | Control |
| --- | --- |
| Type safety | `npm run typecheck` with strict TypeScript |
| Unit tests | Vitest test suite, including cloud sync payload regression tests |
| Build verification | `npm run build` in CI |
| Static analysis | ESLint with Next.js, React Hooks, a11y, and Zustand selector guard |
| Database migrations | Timestamp/order validation via `npm run db:migrations:check` |
| Runtime readiness | `/api/health` reports required env readiness without production secret-name leakage |
| Admin access | Admin bridge accepts only bearer/header secrets, not query-string secrets |
| Server-only Supabase | Admin client throws when service-role env is missing |
| Documentation | Architecture, folder structure, security policy, env contract, and operations runbook |

## Remaining Enterprise Work

| Priority | Work | Why it matters |
| --- | --- | --- |
| P0 | Install/link Supabase CLI and run `supabase db reset` against migrations | Proves schema can be recreated from code |
| P0 | Run RLS negative tests against local Supabase | Proves users cannot read/write each other's rows |
| P1 | Add error tracking such as Sentry or equivalent | Speeds up production incident detection |
| P1 | Add uptime and synthetic checks for `/api/health`, auth, dashboard, and sync | Catches production failure before users report it |
| P1 | Add backup/restore drill for Supabase Postgres | Validates recovery, not just backup creation |
| P2 | Add Playwright smoke job for chromium on deploy branches | Validates critical user journeys after build |
| P2 | Add dependency vulnerability scanning | Reduces supply-chain blind spots |

## CI Quality Gate

The GitHub Actions workflow in `.github/workflows/quality.yml` runs:

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run build`
- `npm run db:migrations:check`
- Supabase CLI setup/version check

E2E tests are intentionally kept out of the default gate until the project has stable seeded test data. Once seed data is deterministic, add a chromium-only Playwright smoke job first, then expand browser coverage.

## Deployment Standard

1. Merge only after the quality gate passes.
2. Apply Supabase migrations in staging first.
3. Verify `/api/health` returns `200`.
4. Run smoke checks for login, dashboard, library, review, and Sanity admin bridge.
5. Promote to production.
6. Monitor health, sync errors, auth errors, and webhook errors for at least one release window.

## Rollback Standard

1. Roll back application deployment through the hosting provider.
2. For database changes, prefer forward-fix migrations unless the migration is proven reversible and data-safe.
3. If data corruption is suspected, stop write paths first, snapshot current state, then restore from backup or run a corrective migration.
4. Document incident timeline, affected users, root cause, and prevention action.

## Supabase Verification

After installing Supabase CLI:

```bash
supabase init
supabase link --project-ref <project-ref>
supabase db reset
supabase db lint
supabase db diff --linked
```

Expected outcome:

- Migrations recreate the schema without errors.
- No critical lint findings remain.
- Linked diff is empty or intentionally explained by a pending migration.

