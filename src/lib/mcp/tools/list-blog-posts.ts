import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { publicSupabase } from "../supabase";

export default defineTool({
  name: "list_blog_posts",
  title: "List blog posts",
  description:
    "List published blog posts from Becky Biranu's portfolio site, newest first. Returns id, title, excerpt, image, and dates.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Max posts to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const db = publicSupabase();
    const { data, error } = await db
      .from("blog_posts")
      .select("id,title,excerpt,image_url,created_at,updated_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { posts: data ?? [] },
    };
  },
});
