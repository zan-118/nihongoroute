-- Fix C3: Revoke execute from anon and set search_path
ALTER FUNCTION public.sync_user_progress(TEXT, INTEGER, INTEGER, INTEGER, TEXT, JSONB, JSONB, JSONB, JSONB) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.sync_user_progress(TEXT, INTEGER, INTEGER, INTEGER, TEXT, JSONB, JSONB, JSONB, JSONB) FROM public;
REVOKE EXECUTE ON FUNCTION public.sync_user_progress(TEXT, INTEGER, INTEGER, INTEGER, TEXT, JSONB, JSONB, JSONB, JSONB) FROM anon;

GRANT EXECUTE ON FUNCTION public.sync_user_progress(TEXT, INTEGER, INTEGER, INTEGER, TEXT, JSONB, JSONB, JSONB, JSONB) TO authenticated;
