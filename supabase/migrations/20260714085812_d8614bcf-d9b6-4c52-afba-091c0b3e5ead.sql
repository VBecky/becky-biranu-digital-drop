
CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.blog_comments TO anon, authenticated;
GRANT ALL ON public.blog_comments TO service_role;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read comments" ON public.blog_comments FOR SELECT USING (true);
CREATE POLICY "public insert comments" ON public.blog_comments FOR INSERT
  WITH CHECK (char_length(content) BETWEEN 1 AND 2000 AND char_length(author_name) BETWEEN 1 AND 80);
CREATE INDEX blog_comments_post_id_idx ON public.blog_comments(post_id, created_at DESC);

CREATE TABLE public.blog_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  client_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, client_id)
);
GRANT SELECT, INSERT, DELETE ON public.blog_likes TO anon, authenticated;
GRANT ALL ON public.blog_likes TO service_role;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read likes" ON public.blog_likes FOR SELECT USING (true);
CREATE POLICY "public insert likes" ON public.blog_likes FOR INSERT
  WITH CHECK (char_length(client_id) BETWEEN 8 AND 128);
CREATE POLICY "public delete likes" ON public.blog_likes FOR DELETE USING (true);
CREATE INDEX blog_likes_post_id_idx ON public.blog_likes(post_id);
