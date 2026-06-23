import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { adminAuth } from "@/lib/blog-store";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (adminAuth.isAuthed()) navigate({ to: "/admin" });
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminAuth.login(u, p)) {
      navigate({ to: "/admin" });
    } else {
      setErr("Invalid credentials");
    }
  };

  return (
    <div style={styles.wrap}>
      <form onSubmit={submit} style={styles.card}>
        <h1 style={styles.h1}>Admin Sign-In</h1>
        <p style={styles.sub}>Restricted area.</p>
        <label style={styles.label}>
          <span>Username</span>
          <input style={styles.input} value={u} onChange={(e) => setU(e.target.value)} autoFocus />
        </label>
        <label style={styles.label}>
          <span>Password</span>
          <input type="password" style={styles.input} value={p} onChange={(e) => setP(e.target.value)} />
        </label>
        {err && <div style={styles.err}>{err}</div>}
        <button type="submit" style={styles.btn}>Sign in</button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#05060a", color: "#e7ecf3", fontFamily: "'Sora',system-ui,sans-serif", padding: 24 },
  card: { width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 32, backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", gap: 18 },
  h1: { fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" },
  sub: { fontSize: 13, color: "#7a8499", marginTop: -10 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "#7a8499" },
  input: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#e7ecf3", fontSize: 15, fontFamily: "inherit" },
  err: { color: "#ff7a7a", fontSize: 13 },
  btn: { background: "linear-gradient(135deg,#7fe3ff,#a78bfa)", color: "#0b0e16", border: "none", padding: "12px 18px", borderRadius: 999, fontWeight: 600, fontSize: 14, cursor: "pointer", marginTop: 6 },
};
