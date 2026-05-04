-- Fix C4: handle_new_user exposed as public RPC
-- Revoke all public execution access from the trigger function
ALTER FUNCTION public.handle_new_user() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
