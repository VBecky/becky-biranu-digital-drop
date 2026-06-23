import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { adminAuth } from "@/lib/blog-store";

export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!adminAuth.isAuthed()) {
      navigate({ to: "/admin-login" });
    } else {
      setReady(true);
    }
  }, [navigate]);

  if (!ready) return null;

  const logout = () => {
    adminAuth.logout();
    navigate({ to: "/admin-login" });
  };

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <Link to="/admin" style={styles.brandLink}>BB · Admin</Link>
          <span style={styles.crumb}>/ {title}</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/" style={styles.ghost}>View site</Link>
          <button onClick={logout} style={styles.ghost}>Logout</button>
        </div>
      </header>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

export const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", background: "#05060a", color: "#e7ecf3", fontFamily: "'Sora',system-ui,sans-serif" },
  header: { position: "sticky", top: 0, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", background: "rgba(8,12,22,0.7)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  brand: { display: "flex", alignItems: "baseline", gap: 12 },
  brandLink: { fontWeight: 700, color: "#e7ecf3", textDecoration: "none", letterSpacing: "-0.01em" },
  crumb: { color: "#7a8499", fontSize: 13 },
  ghost: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e7ecf3", padding: "8px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer", textDecoration: "none", fontFamily: "inherit" },
  main: { maxWidth: 1100, margin: "0 auto", padding: "32px 28px 80px" },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 },
  input: { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#e7ecf3", fontSize: 15, fontFamily: "inherit" },
  label: { display: "flex", flexDirection: "column", gap: 8, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "#7a8499", marginBottom: 16 },
  primary: { background: "linear-gradient(135deg,#7fe3ff,#a78bfa)", color: "#0b0e16", border: "none", padding: "12px 22px", borderRadius: 999, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  danger: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff8a8a", padding: "8px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
};
