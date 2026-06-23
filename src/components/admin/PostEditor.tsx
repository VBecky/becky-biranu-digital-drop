import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { blogStore, fileToDataUrl, newId, type BlogPost } from "@/lib/blog-store";
import { styles } from "./AdminShell";

export function PostEditor({ initial }: { initial?: BlogPost }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [popup, setPopup] = useState(initial?.popup ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [preview, setPreview] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      alert("Image must be under 4MB.");
      return;
    }
    setImage(await fileToDataUrl(f));
  };

  const save = (publish?: boolean) => {
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    const now = Date.now();
    const post: BlogPost = {
      id: initial?.id ?? newId(),
      title: title.trim(),
      excerpt: excerpt.trim() || content.replace(/<[^>]+>/g, "").slice(0, 160),
      content,
      image,
      popup: popup.trim() || undefined,
      status: publish ? "published" : status,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
    blogStore.upsert(post);
    navigate({ to: "/admin" });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: preview ? "1fr 1fr" : "1fr", gap: 24 }}>
      <div style={styles.card as React.CSSProperties}>
        <label style={styles.label as React.CSSProperties}>
          <span>Title</span>
          <input style={styles.input as React.CSSProperties} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
        </label>

        <label style={styles.label as React.CSSProperties}>
          <span>Excerpt (optional)</span>
          <textarea style={{ ...(styles.input as React.CSSProperties), minHeight: 60, fontFamily: "inherit" }} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary shown on the card" />
        </label>

        <label style={styles.label as React.CSSProperties}>
          <span>Content (HTML / rich text)</span>
          <textarea style={{ ...(styles.input as React.CSSProperties), minHeight: 280, fontFamily: "ui-monospace,monospace", fontSize: 13 }} value={content} onChange={(e) => setContent(e.target.value)} placeholder="<p>Write your post here. HTML tags like <b>bold</b>, <i>italic</i>, <h2>, <ul><li> are supported.</p>" />
        </label>

        <label style={styles.label as React.CSSProperties}>
          <span>Featured Image</span>
          <input type="file" accept="image/*" onChange={onFile} style={{ color: "#7a8499", fontSize: 13 }} />
          {image && <img src={image} alt="" style={{ marginTop: 10, maxWidth: 240, borderRadius: 10 }} />}
        </label>

        <label style={styles.label as React.CSSProperties}>
          <span>Popup Message (optional)</span>
          <textarea style={{ ...(styles.input as React.CSSProperties), minHeight: 60 }} value={popup} onChange={(e) => setPopup(e.target.value)} placeholder="Shown once when a reader opens this post" />
        </label>

        <label style={styles.label as React.CSSProperties}>
          <span>Status</span>
          <select style={styles.input as React.CSSProperties} value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <button onClick={() => save()} style={styles.ghost as React.CSSProperties}>Save</button>
          <button onClick={() => save(true)} style={styles.primary as React.CSSProperties}>Save & Publish</button>
          <button onClick={() => setPreview((v) => !v)} style={styles.ghost as React.CSSProperties}>{preview ? "Hide preview" : "Preview"}</button>
        </div>
      </div>

      {preview && (
        <div style={styles.card as React.CSSProperties}>
          <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "#7fe3ff", marginBottom: 12 }}>Preview</div>
          {image && <img src={image} alt="" style={{ width: "100%", borderRadius: 12, marginBottom: 16, maxHeight: 280, objectFit: "cover" }} />}
          <h2 style={{ fontSize: 26, fontWeight: 600, marginBottom: 10 }}>{title || "Untitled"}</h2>
          <div style={{ color: "#b9c2d4", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  );
}
