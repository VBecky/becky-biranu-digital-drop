import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PostEditor } from "@/components/admin/PostEditor";

export const Route = createFileRoute("/admin/create")({
  head: () => ({ meta: [{ title: "New Post" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => (
    <AdminShell title="New Post">
      <PostEditor />
    </AdminShell>
  ),
});
