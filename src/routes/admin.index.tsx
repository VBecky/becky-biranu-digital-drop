import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, styles as s } from "@/components/admin/AdminShell";
import {
  adminAuth,
  fetchAllPosts,
  fetchProjects,
  fetchSiteContent,
  fileToDataUrl,
  DEFAULT_HOME,
  DEFAULT_ABOUT,
  type BlogPost,
  type Project,
  type HomeContent,
  type AboutContent,
  type Skill,
} from "@/lib/content-store";
import {
  adminSaveBlog,
  adminDeleteBlog,
  adminSaveProject,
  adminDeleteProject,
  adminSaveContent,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminIndex,
});

type Tab = "blog" | "projects" | "about" | "home";

function AdminIndex() {
  const [tab, setTab] = useState<Tab>("blog");
  return (
    <AdminShell title={tab[0].toUpperCase() + tab.slice(1)}>
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {(["blog", "projects", "about", "home"] as Tab[]).map((t) => (
          <button key={t} style={tab === t ? s.tabActive : s.tab} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === "blog" && <BlogManager />}
      {tab === "projects" && <ProjectManager />}
      {tab === "about" && <AboutManager />}
      {tab === "home" && <HomeManager />}
    </AdminShell>
  );
}

function withPw(): string {
  const pw = adminAuth.getPassword();
  if (!pw) throw new Error("Not signed in");
  return pw;
}

/* ================== BLOG ================== */
function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    fetchAllPosts().then((p) => { setPosts(p); setLoading(false); });
  };
  useEffect(reload, []);

  if (editing) return <BlogEditor post={editing} onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>Blog Posts</h2>
        <button style={s.primary} onClick={() => setEditing({ status: "published" })}>+ New Post</button>
      </div>
      {loading ? <p style={{ color: "#7a8499" }}>Loading…</p> : posts.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", color: "#7a8499" }}>No posts yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {posts.map((p) => (
            <div key={p.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "#7a8499", marginTop: 4 }}>
                  {p.status} · {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={s.ghostBtn} onClick={() => setEditing(p)}>Edit</button>
                <button style={s.danger} onClick={async () => {
                  if (!confirm("Delete this post?")) return;
                  await adminDeleteBlog({ data: { password: withPw(), id: p.id } });
                  reload();
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlogEditor({ post, onDone, onCancel }: { post: Partial<BlogPost>; onDone: () => void; onCancel: () => void }) {
  const [p, setP] = useState<Partial<BlogPost>>(post);
  const [saving, setSaving] = useState(false);
  const upd = (k: keyof BlogPost, v: any) => setP((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await adminSaveBlog({ data: { password: withPw(), post: p } });
      onDone();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={s.card}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>{p.id ? "Edit Post" : "New Post"}</h2>
      <label style={s.label}><span>Title</span>
        <input style={s.input} value={p.title || ""} onChange={(e) => upd("title", e.target.value)} />
      </label>
      <label style={s.label}><span>Excerpt (optional — shown on card)</span>
        <textarea style={s.textarea} rows={2} value={p.excerpt || ""} onChange={(e) => upd("excerpt", e.target.value)} />
      </label>
      <label style={s.label}><span>Content (HTML supported)</span>
        <textarea style={s.textarea} rows={12} value={p.content || ""} onChange={(e) => upd("content", e.target.value)} />
      </label>
      <label style={s.label}><span>Cover Image</span>
        <input type="file" accept="image/*" onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          upd("image_url", await fileToDataUrl(f));
        }} style={{ color: "#9aa6bd" }} />
        {p.image_url && <img src={p.image_url} alt="" style={{ marginTop: 10, maxWidth: 240, borderRadius: 10 }} />}
        {p.image_url && <button type="button" style={{ ...s.ghostBtn, marginTop: 8 }} onClick={() => upd("image_url", "")}>Remove image</button>}
      </label>
      <label style={s.label}><span>Optional Popup Message</span>
        <textarea style={s.textarea} rows={3} value={p.popup || ""} onChange={(e) => upd("popup", e.target.value)} placeholder="If filled, shown as popup when opening article" />
      </label>
      <label style={s.label}><span>Status</span>
        <select style={s.input} value={p.status || "draft"} onChange={(e) => upd("status", e.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button style={s.primary} disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</button>
        <button style={s.ghostBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ================== PROJECTS ================== */
function ProjectManager() {
  const [items, setItems] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    fetchProjects().then((p) => { setItems(p); setLoading(false); });
  };
  useEffect(reload, []);

  if (editing) return <ProjectEditor project={editing} onDone={() => { setEditing(null); reload(); }} onCancel={() => setEditing(null)} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>Projects</h2>
        <button style={s.primary} onClick={() => setEditing({ sort_order: items.length, bg: "linear-gradient(135deg,#0ea5e9,#6366f1,#a855f7)" })}>+ New Project</button>
      </div>
      {loading ? <p style={{ color: "#7a8499" }}>Loading…</p> : items.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", color: "#7a8499" }}>No projects yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((p) => (
            <div key={p.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                {p.image_url && <img src={p.image_url} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10 }} />}
                <div>
                  <div style={{ fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#7a8499", marginTop: 4 }}>{p.tech}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={s.ghostBtn} onClick={() => setEditing(p)}>Edit</button>
                <button style={s.danger} onClick={async () => {
                  if (!confirm("Delete this project?")) return;
                  await adminDeleteProject({ data: { password: withPw(), id: p.id } });
                  reload();
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectEditor({ project, onDone, onCancel }: { project: Partial<Project>; onDone: () => void; onCancel: () => void }) {
  const [p, setP] = useState<Partial<Project>>(project);
  const [saving, setSaving] = useState(false);
  const upd = (k: keyof Project, v: any) => setP((prev) => ({ ...prev, [k]: v }));

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    upd("image_url", await fileToDataUrl(f));
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminSaveProject({ data: { password: withPw(), project: p } });
      onDone();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={s.card}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>{p.id ? "Edit Project" : "New Project"}</h2>
      <label style={s.label}><span>Title</span><input style={s.input} value={p.title || ""} onChange={(e) => upd("title", e.target.value)} /></label>
      <label style={s.label}><span>Short description (shown on card)</span><textarea style={s.textarea} rows={2} value={p.description || ""} onChange={(e) => upd("description", e.target.value)} /></label>
      <label style={s.label}><span>Tech stack (separate with " · ")</span><input style={s.input} value={p.tech || ""} onChange={(e) => upd("tech", e.target.value)} placeholder="Python · Tkinter · SQLite" /></label>
      <label style={s.label}><span>Full description (shown in modal)</span><textarea style={s.textarea} rows={5} value={p.full_text || ""} onChange={(e) => upd("full_text", e.target.value)} /></label>
      <label style={s.label}><span>GitHub link</span><input style={s.input} value={p.link || ""} onChange={(e) => upd("link", e.target.value)} placeholder="https://github.com/..." /></label>
      <label style={s.label}><span>Live URL (optional — embeds as iframe)</span><input style={s.input} value={p.live || ""} onChange={(e) => upd("live", e.target.value)} /></label>
      <label style={s.label}><span>Background gradient CSS</span><input style={s.input} value={p.bg || ""} onChange={(e) => upd("bg", e.target.value)} /></label>
      <label style={s.label}><span>Sort order</span><input type="number" style={s.input} value={p.sort_order ?? 0} onChange={(e) => upd("sort_order", parseInt(e.target.value) || 0)} /></label>
      <label style={s.label}><span>Image</span>
        <input type="file" accept="image/*" onChange={onFile} style={{ color: "#9aa6bd" }} />
        {p.image_url && <img src={p.image_url} alt="" style={{ marginTop: 10, maxWidth: 200, borderRadius: 10 }} />}
      </label>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={s.primary} disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</button>
        <button style={s.ghostBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ================== ABOUT ================== */
function AboutManager() {
  const [a, setA] = useState<AboutContent>(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchSiteContent<AboutContent>("about", DEFAULT_ABOUT).then((d) => {
      setA({ ...DEFAULT_ABOUT, ...d, bio: d.bio || [], skills: d.skills || [] });
      setLoading(false);
    });
  }, []);

  const upd = (k: keyof AboutContent, v: any) => setA((p) => ({ ...p, [k]: v }));

  const onPortrait = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    upd("portrait", await fileToDataUrl(f));
  };

  const setBio = (i: number, v: string) => upd("bio", a.bio.map((p, idx) => idx === i ? v : p));
  const addBio = () => upd("bio", [...a.bio, ""]);
  const delBio = (i: number) => upd("bio", a.bio.filter((_, idx) => idx !== i));

  const setSkill = (i: number, k: keyof Skill, v: any) => upd("skills", a.skills.map((sk, idx) => idx === i ? { ...sk, [k]: v } : sk));
  const addSkill = () => upd("skills", [...a.skills, { title: "New skill", value: 70, detail: "" }]);
  const delSkill = (i: number) => upd("skills", a.skills.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      await adminSaveContent({ data: { password: withPw(), key: "about", data: a } });
      setMsg("Saved ✓");
      setTimeout(() => setMsg(""), 2500);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ color: "#7a8499" }}>Loading…</p>;

  return (
    <div style={s.card}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>About Section</h2>
      <label style={s.label}><span>Heading</span><input style={s.input} value={a.heading} onChange={(e) => upd("heading", e.target.value)} /></label>
      <label style={s.label}><span>Portrait Photo</span>
        <input type="file" accept="image/*" onChange={onPortrait} style={{ color: "#9aa6bd" }} />
        {a.portrait && <img src={a.portrait} alt="" style={{ marginTop: 10, maxWidth: 200, borderRadius: 10 }} />}
      </label>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "#7a8499" }}>Bio Paragraphs</span>
          <button style={s.ghostBtn} onClick={addBio}>+ Add paragraph</button>
        </div>
        {a.bio.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <textarea style={s.textarea} rows={3} value={b} onChange={(e) => setBio(i, e.target.value)} />
            <button style={s.danger} onClick={() => delBio(i)}>×</button>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "#7a8499" }}>Skills</span>
          <button style={s.ghostBtn} onClick={addSkill}>+ Add skill</button>
        </div>
        {a.skills.map((sk, i) => (
          <div key={i} style={{ ...s.card, marginBottom: 10, display: "grid", gridTemplateColumns: "1fr 100px 2fr auto", gap: 8, alignItems: "center" }}>
            <input style={s.input} value={sk.title} onChange={(e) => setSkill(i, "title", e.target.value)} placeholder="Title" />
            <input type="number" min={0} max={100} style={s.input} value={sk.value} onChange={(e) => setSkill(i, "value", parseInt(e.target.value) || 0)} />
            <input style={s.input} value={sk.detail} onChange={(e) => setSkill(i, "detail", e.target.value)} placeholder="HTML, CSS, JS" />
            <button style={s.danger} onClick={() => delSkill(i)}>×</button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button style={s.primary} disabled={saving} onClick={save}>{saving ? "Saving…" : "Save About"}</button>
        {msg && <span style={{ color: "#7fe3ff", fontSize: 13 }}>{msg}</span>}
      </div>
    </div>
  );
}

/* ================== HOME ================== */
function HomeManager() {
  const [h, setH] = useState<HomeContent>(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchSiteContent<HomeContent>("home", DEFAULT_HOME).then((d) => {
      setH({ ...DEFAULT_HOME, ...d });
      setLoading(false);
    });
  }, []);

  const upd = (k: keyof HomeContent, v: any) => setH((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      await adminSaveContent({ data: { password: withPw(), key: "home", data: h } });
      setMsg("Saved ✓");
      setTimeout(() => setMsg(""), 2500);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <p style={{ color: "#7a8499" }}>Loading…</p>;

  return (
    <div style={s.card}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>Home / Hero</h2>
      <label style={s.label}><span>Badge</span><input style={s.input} value={h.badge} onChange={(e) => upd("badge", e.target.value)} /></label>
      <label style={s.label}><span>Title</span><input style={s.input} value={h.title} onChange={(e) => upd("title", e.target.value)} /></label>
      <label style={s.label}><span>Subtitle</span><input style={s.input} value={h.subtitle} onChange={(e) => upd("subtitle", e.target.value)} /></label>
      <label style={s.label}><span>Description</span><textarea style={s.textarea} rows={3} value={h.description} onChange={(e) => upd("description", e.target.value)} /></label>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button style={s.primary} disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Home"}</button>
        {msg && <span style={{ color: "#7fe3ff", fontSize: 13 }}>{msg}</span>}
      </div>
    </div>
  );
}
