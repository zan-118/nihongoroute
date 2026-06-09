# Security Policy

## Supported Surface

NihongoRoute protects these production surfaces as first-class security boundaries:

- Browser application and offline IndexedDB state.
- Supabase Auth, Postgres, Storage, RLS policies, and `sync_user_progress` RPC.
- Sanity Studio admin bridge routes under `/api/admin/*`.
- Donation webhooks under `/api/webhooks/*`.
- Server-only integrations for Gemini, Sanity tokens, and Supabase service-role access.

## Secret Handling

- Never expose `SUPABASE_SERVICE_ROLE_KEY`, Sanity API tokens, webhook secrets, or Gemini API keys to client components.
- Only variables prefixed with `NEXT_PUBLIC_` may be read by browser code.
- Admin bridge requests must authenticate with `Authorization: Bearer <secret>` or `x-admin-api-secret`.
- Admin secrets must not be passed in query strings because URLs are commonly captured in logs, browser history, and monitoring tools.
- Keep `.env.local` private. Use `.env.example` as the committed contract for required variables.

## Reporting

For private security issues, contact the project owner directly before publishing details. Include:

- Affected route, table, policy, or component.
- Reproduction steps.
- Expected versus actual access.
- Any relevant logs with secrets removed.

## Release Gate

Before production deployment:

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run db:migrations:check
npm run build
```

When Supabase CLI is installed and linked, also run:

```bash
supabase --version
supabase db reset
supabase db lint
```

## Security Review Checklist

- RLS is enabled on every exposed Supabase table.
- Policies are scoped to `auth.uid()` or an equivalent ownership rule.
- `service_role` usage is limited to server route handlers and webhook/admin paths.
- Security-definer functions do not rely on user-editable metadata for authorization.
- Admin and webhook secrets are compared server-side and never returned in API responses.
- Health endpoints do not reveal secret names in production responses.
- Route handlers validate input length, allowed enum values, and expected payload shape.
- Logs do not contain tokens, full Authorization headers, or personally sensitive payloads.

