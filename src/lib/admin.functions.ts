import { createServerFn } from "@tanstack/react-start";

function checkPassword(pw: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || pw !== expected) throw new Error("Unauthorized");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// ---- Blog ----
export const adminSaveBlog = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; post: any }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const db = await admin();
    const p = data.post;
    const row = {
      title: p.title || "Untitled",
      excerpt: p.excerpt || "",
      content: p.content || "",
      image_url: p.image_url || "",
      popup: p.popup || "",
      status: p.status || "draft",
      updated_at: new Date().toISOString(),
    };
    if (p.id) {
      const { error } = await db.from("blog_posts").update(row).eq("id", p.id);
      if (error) throw new Error(error.message);
      return { id: p.id };
    } else {
      const { data: ins, error } = await db.from("blog_posts").insert(row).select("id").single();
      if (error) throw new Error(error.message);
      return { id: ins.id };
    }
  });

export const adminDeleteBlog = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const db = await admin();
    const { error } = await db.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Projects ----
export const adminSaveProject = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; project: any }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const db = await admin();
    const p = data.project;
    const row = {
      title: p.title || "Untitled",
      description: p.description || "",
      tech: p.tech || "",
      full_text: p.full_text || "",
      link: p.link || "",
      live: p.live || "",
      image_url: p.image_url || "",
      bg: p.bg || "linear-gradient(135deg,#0ea5e9,#6366f1,#a855f7)",
      sort_order: p.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    };
    if (p.id) {
      const { error } = await db.from("projects").update(row).eq("id", p.id);
      if (error) throw new Error(error.message);
      return { id: p.id };
    } else {
      const { data: ins, error } = await db.from("projects").insert(row).select("id").single();
      if (error) throw new Error(error.message);
      return { id: ins.id };
    }
  });

export const adminDeleteProject = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const db = await admin();
    const { error } = await db.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Site content (home, about) ----
export const adminSaveContent = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; key: string; data: any }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const db = await admin();
    const { error } = await db
      .from("site_content")
      .upsert({ key: data.key, data: data.data, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Verify password (used by login page so we don't store hash on client)
export const adminVerifyPassword = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) => d)
  .handler(async ({ data }) => {
    if (data.username !== "becky") return { ok: false };
    const expected = process.env.ADMIN_PASSWORD;
    return { ok: !!expected && data.password === expected };
  });
