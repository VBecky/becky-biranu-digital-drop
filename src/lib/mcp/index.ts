import { defineMcp } from "@lovable.dev/mcp-js";
import listBlogPosts from "./tools/list-blog-posts";
import getBlogPost from "./tools/get-blog-post";
import listProjects from "./tools/list-projects";
import getSiteContent from "./tools/get-site-content";

export default defineMcp({
  name: "becky-biranu-mcp",
  title: "Becky Biranu Portfolio",
  version: "0.1.0",
  instructions:
    "Public read-only tools for Becky Biranu's portfolio site. Use `list_blog_posts` and `get_blog_post` to read published blog posts, `list_projects` for portfolio projects, and `get_site_content` for the home/about content blocks.",
  tools: [listBlogPosts, getBlogPost, listProjects, getSiteContent],
});
