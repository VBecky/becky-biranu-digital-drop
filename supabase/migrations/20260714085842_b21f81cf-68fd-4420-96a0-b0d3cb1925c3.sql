
REVOKE EXECUTE ON FUNCTION public.unlike_post(uuid, text) FROM anon, authenticated, public;
DROP FUNCTION public.unlike_post(uuid, text);
