import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listBlogPosts from "./tools/list-blog-posts";
import getBlogPost from "./tools/get-blog-post";
import listProjects from "./tools/list-projects";
import getSiteContent from "./tools/get-site-content";

// The OAuth issuer must be the direct Supabase host; the published SUPABASE_URL
// is the .lovable.cloud proxy which the RFC 8414 issuer check rejects.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "becky-biranu-mcp",
  title: "Becky Biranu Portfolio",
  version: "0.1.0",
  instructions:
    "Sign-in-gated read-only tools for Becky Biranu's portfolio site. Use `list_blog_posts` and `get_blog_post` for published blog posts, `list_projects` for portfolio projects, and `get_site_content` for the home/about content blocks.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listBlogPosts, getBlogPost, listProjects, getSiteContent],
});
