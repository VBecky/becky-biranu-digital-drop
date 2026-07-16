import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { publicSupabase } from "../supabase";

export default defineTool({
  name: "get_site_content",
  title: "Get site content",
  description:
    "Fetch a site content block (e.g. 'home' or 'about') containing headings, bio, and skills as configured in the site.",
  inputSchema: {
    key: z.string().describe("Content key, for example 'home' or 'about'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ key }) => {
    const db = publicSupabase();
    const { data, error } = await db
      .from("site_content")
      .select("key,data,updated_at")
      .eq("key", key)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Not found" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { content: data },
    };
  },
});
