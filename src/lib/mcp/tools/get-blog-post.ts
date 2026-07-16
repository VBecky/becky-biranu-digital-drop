import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { publicSupabase } from "../supabase";

export default defineTool({
  name: "get_blog_post",
  title: "Get blog post",
  description: "Get a single published blog post with its full content by id.",
  inputSchema: {
    id: z.string().describe("Blog post id."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const db = publicSupabase();
    const { data, error } = await db
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Not found" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { post: data },
    };
  },
});
