import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// The Supabase JS client exposes an `auth.oauth` namespace for the managed
// OAuth server. Types for it are still in beta, so declare a local shape.
type OAuthClient = { name?: string; redirect_uris?: string[] };
type OAuthDetails = {
  client?: OAuthClient;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthResult = { data: OAuthDetails | null; error: { message: string } | null };
type OAuthNS = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
function oauth(): OAuthNS {
  return (supabase.auth as unknown as { oauth: OAuthNS }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/auth",
        search: { next: location.pathname + location.searchStr },
      });
    }
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(id);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main style={wrap}><div style={card}>Could not load this authorization: {String((error as Error)?.message ?? error)}</div></main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  const name = details?.client?.name ?? "an app";
  return (
    <main style={wrap}>
      <div style={card}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Connect {name} to Becky Biranu</h1>
        <p style={{ marginTop: 10, color: "#cbd5e1", fontSize: 14 }}>
          {name} will be able to call this app's enabled MCP tools while you are signed in.
        </p>
        <p style={{ marginTop: 6, color: "#94a3b8", fontSize: 13 }}>
          This does not bypass this app's permissions or backend policies.
        </p>
        {details?.scope && (
          <p style={{ marginTop: 10, color: "#94a3b8", fontSize: 12 }}>Requested scopes: {details.scope}</p>
        )}
        {error && <p role="alert" style={{ color: "#f87171", marginTop: 12 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button disabled={busy} onClick={() => decide(true)} style={{ ...btn, background: "#3b82f6", color: "#fff" }}>Approve</button>
          <button disabled={busy} onClick={() => decide(false)} style={{ ...btn, background: "#1f2937", color: "#e5e7eb" }}>Cancel</button>
        </div>
      </div>
    </main>
  );
}

const wrap: React.CSSProperties = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b1220", padding: 16 };
const card: React.CSSProperties = { width: "100%", maxWidth: 460, background: "#111827", color: "#e5e7eb", padding: 24, borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,.4)" };
const btn: React.CSSProperties = { flex: 1, padding: "10px 12px", borderRadius: 8, border: 0, fontWeight: 600, cursor: "pointer" };
