import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { publicSupabase } from "../supabase";

export default defineTool({
  name: "list_projects",
  title: "List projects",
  description:
    "List Becky Biranu's portfolio projects, ordered as displayed on the site. Returns title, description, tech stack, links, and image.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Max projects to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const db = publicSupabase();
    const { data, error } = await db
      .from("projects")
      .select("id,title,description,tech,full_text,link,live,image_url,sort_order")
      .order("sort_order", { ascending: true })
      .limit(limit ?? 50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { projects: data ?? [] },
    };
  },
});
