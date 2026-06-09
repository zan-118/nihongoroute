# Operations Runbook

## Health Check

Endpoint:

```text
/api/health
```

Expected production response:

- `200` when required env vars are present.
- `503` when required env vars are missing.
- No production response should reveal exact missing secret names.

## Required Environment

Use `.env.example` as the source contract. Required for normal app boot:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`

Required for privileged features:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_API_SECRET`
- `SANITY_STUDIO_ADMIN_API_SECRET`
- `SANITY_API_READ_TOKEN`
- `SANITY_API_WRITE_TOKEN`
- `GEMINI_API_KEY`
- `TRAKTEER_WEBHOOK_SECRET`
- `SAWERIA_WEBHOOK_SECRET`

## Common Incidents

### Sync Failures

Symptoms:

- UI shows sync error.
- Dirty SRS or lesson records do not clear.
- `sync_user_progress` errors appear in server or Supabase logs.

Actions:

1. Check current deployment and recent migration changes.
2. Verify Supabase RPC `sync_user_progress` exists and accepts current payload shape.
3. Confirm `user_srs` and `user_lessons` unique constraints exist for upsert.
4. Run unit tests for cloud sync payload.
5. If only XP is inconsistent, inspect `accepted_xp` behavior before changing client XP.

### Admin Bridge Unauthorized

Symptoms:

- Sanity Studio cannot search Supabase content.
- `/api/admin/*` returns `401`.

Actions:

1. Verify `ADMIN_API_SECRET` in the app environment.
2. Verify `SANITY_STUDIO_ADMIN_API_SECRET` in the Studio environment.
3. Confirm Studio sends `Authorization: Bearer <secret>`.
4. Do not add query-string secret fallback.

### Health Degraded

Symptoms:

- `/api/health` returns `503`.

Actions:

1. Check required env vars in the deployment platform.
2. Redeploy after fixing env values.
3. If production response only shows counts, reproduce locally with full env detail in development mode.

### Webhook Failures

Symptoms:

- Supporter records are not saved.
- Webhook endpoint returns `401` or `500`.

Actions:

1. Check webhook secret configuration.
2. Confirm payload format from provider.
3. Check Supabase `supporters` table availability and service-role env.
4. Replay a sanitized test payload in staging before production retry.

## Backup And Restore

Minimum standard:

- Enable Supabase scheduled backups for production.
- Keep a manual backup before destructive migrations.
- Perform restore drills on a non-production project.

Restore drill checklist:

1. Restore latest backup to staging.
2. Run smoke checks for auth, dashboard, library, SRS review, and admin bridge.
3. Compare critical table counts.
4. Document elapsed recovery time and issues found.

