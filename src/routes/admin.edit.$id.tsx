import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { AdminShell, styles } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";
import { blogStore } from "@/lib/blog-store";

export const Route = createFileRoute("/admin/edit/$id")({
  head: () => ({ meta: [{ title: "Edit Post" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: EditPostRoute,
});

function EditPostRoute() {
  const { id } = useParams({ from: "/admin/edit/$id" });
  const post = blogStore.get(id);

  return (
    <AdminShell title="Edit Post">
      {post ? (
        <PostEditor initial={post} />
      ) : (
        <div style={{ ...(styles.card as React.CSSProperties), textAlign: "center", padding: 60 }}>
          <p style={{ color: "#7a8499", marginBottom: 16 }}>Post not found.</p>
          <Link to="/admin" style={styles.ghost as React.CSSProperties}>Back to dashboard</Link>
        </div>
      )}
    </AdminShell>
  );
}
