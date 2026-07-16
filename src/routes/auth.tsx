import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Becky Biranu" },
      { name: "description", content: "Sign in to Becky Biranu's portfolio." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : "",
  }),
  component: AuthPage,
});

function safeNext(next: string): string {
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function AuthPage() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const dest = safeNext(next);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: dest as any, replace: true });
    });
  }, [navigate, dest]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${dest}` },
        });
        if (error) throw error;
        setErr("Check your email to confirm your account, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: dest as any, replace: true });
      }
    } catch (e: any) {
      setErr(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setErr("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${dest}`,
    });
    if (result.error) setErr(result.error.message ?? "Google sign-in failed");
    else if (!(result as any).redirected) navigate({ to: dest as any, replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b1220", padding: 16 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 380, background: "#111827", padding: 24, borderRadius: 12, color: "#e5e7eb", boxShadow: "0 10px 40px rgba(0,0,0,.4)" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p style={{ marginTop: 6, color: "#9ca3af", fontSize: 13 }}>Access your account on Becky Biranu.</p>

        <button type="button" onClick={google} style={btn("#fff", "#111")}>Continue with Google</button>

        <div style={{ textAlign: "center", color: "#6b7280", margin: "14px 0", fontSize: 12 }}>or</div>

        <label style={label}><span>Email</span>
          <input style={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label style={label}><span>Password</span>
          <input style={input} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {err && <div style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>{err}</div>}

        <button disabled={loading} style={btn("#3b82f6", "#fff")}>
          {loading ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>

        <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(""); }}
          style={{ marginTop: 12, background: "transparent", border: 0, color: "#93c5fd", cursor: "pointer", fontSize: 13 }}>
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>

        <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>
          <Link to="/" style={{ color: "#9ca3af" }}>← Back to site</Link>
        </div>
      </form>
    </div>
  );
}

const label: React.CSSProperties = { display: "block", marginTop: 12, fontSize: 13, color: "#cbd5e1" };
const input: React.CSSProperties = { display: "block", width: "100%", marginTop: 4, padding: "10px 12px", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#e5e7eb", fontSize: 14 };
const btn = (bg: string, fg: string): React.CSSProperties => ({ marginTop: 14, width: "100%", padding: "10px 12px", borderRadius: 8, border: 0, background: bg, color: fg, fontWeight: 600, cursor: "pointer" });
