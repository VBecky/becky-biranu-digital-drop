import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { blogStore, type BlogPost } from "@/lib/blog-store";
import { AdminShell, styles } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  const refresh = () => setPosts(blogStore.all());

  useEffect(() => {
    refresh();
    window.addEventListener("blog:updated", refresh);
    return () => window.removeEventListener("blog:updated", refresh);
  }, []);

  const remove = (id: string) => {
    if (confirm("Delete this post?")) blogStore.remove(id);
  };

  return (
    <AdminShell title="Dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600 }}>Blog Posts</h1>
          <p style={{ color: "#7a8499", fontSize: 14, marginTop: 4 }}>{posts.length} total</p>
        </div>
        <Link to="/admin/create" style={styles.primary as React.CSSProperties}>+ New Post</Link>
      </div>

      {posts.length === 0 ? (
        <div style={{ ...styles.card, textAlign: "center", padding: 60, color: "#7a8499" }}>
          No posts yet. Create your first one.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {posts.map((p) => (
            <div key={p.id} style={{ ...styles.card, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: 10, background: p.image ? `url(${p.image}) center/cover` : "linear-gradient(135deg,#0ea5e9,#7c3aed)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: p.status === "published" ? "rgba(127,227,255,0.15)" : "rgba(255,200,80,0.15)", color: p.status === "published" ? "#7fe3ff" : "#ffc850" }}>{p.status}</span>
                  <span style={{ fontSize: 12, color: "#7a8499" }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: "#8a93a8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.excerpt}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link to="/admin/edit/$id" params={{ id: p.id }} style={styles.ghost as React.CSSProperties}>Edit</Link>
                <button onClick={() => remove(p.id)} style={styles.danger as React.CSSProperties}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
