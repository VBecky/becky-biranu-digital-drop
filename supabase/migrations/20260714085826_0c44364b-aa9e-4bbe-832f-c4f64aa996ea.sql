
DROP POLICY "public delete likes" ON public.blog_likes;

CREATE OR REPLACE FUNCTION public.unlike_post(_post_id uuid, _client_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.blog_likes WHERE post_id = _post_id AND client_id = _client_id;
$$;

GRANT EXECUTE ON FUNCTION public.unlike_post(uuid, text) TO anon, authenticated;
