import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Play, Copy, Check, Eye, X, RefreshCw, LogOut } from "lucide-react";

interface Submission {
  id: string;
  created_at: string;
  email: string;
  input_type: string;
  raw_text: string | null;
  voice_file_url: string | null;
  transcript_text: string | null;
  polished_script: string | null;
  audio_url: string | null;
  status: string;
  utm_source: string | null;
  utm_campaign: string | null;
  voice_duration_seconds: number | null;
}

const AdminPage = () => {
  const [authState, setAuthState] = useState<"loading" | "login" | "authed" | "denied">("loading");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [editScript, setEditScript] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuthState("login");
        return;
      }
      // Check if user is in admins table
      const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (error || !data) {
        setAuthState("denied");
      } else {
        setAuthState("authed");
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        setAuthState("login");
        return;
      }
      const { data } = await supabase.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
      setAuthState(data ? "authed" : "denied");
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      setLoginError(error.message);
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthState("login");
    setSubmissions([]);
    setSelected(null);
  };

  const loadSubmissions = useCallback(async () => {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSubmissions(data as Submission[]);
  }, []);

  useEffect(() => {
    if (authState === "authed") loadSubmissions();
  }, [authState, loadSubmissions]);

  const updateSubmission = async (id: string, updates: Record<string, unknown>) => {
    setSaving(true);
    await supabase.from("submissions").update(updates).eq("id", id);
    await loadSubmissions();
    if (selected?.id === id) {
      setSelected((prev) => prev ? { ...prev, ...updates } as Submission : null);
    }
    setSaving(false);
  };

  const copyEmailTemplate = (sub: Submission) => {
    const template = `Hi ${sub.email},\n\nYour manifestation audio is ready! 🎧\n\nListen here: ${sub.audio_url || "[audio link]"}\n\nWe recommend listening every morning for at least 21 days.\n\nWith love,\nManifestFlow`;
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColors: Record<string, string> = {
    new: "bg-secondary text-secondary-foreground",
    polishing: "bg-accent text-accent-foreground",
    ready: "bg-primary/10 text-primary",
    sent: "bg-muted text-muted-foreground",
  };

  // ── Loading ──
  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  // ── Login ──
  if (authState === "login") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <h1 className="mb-2 text-2xl font-serif text-center">Admin</h1>
          <p className="mb-6 text-sm text-muted-foreground text-center">Sign in with your admin account.</p>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {loginError && <p className="mb-3 text-sm text-destructive text-center">{loginError}</p>}
          <button
            disabled={loginLoading}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loginLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  // ── Denied (logged in but not an admin) ──
  if (authState === "denied") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="mb-2 text-2xl font-serif">Access Denied</h1>
          <p className="mb-6 text-sm text-muted-foreground">Your account doesn't have admin access.</p>
          <button
            onClick={handleLogout}
            className="rounded-full border border-border px-6 py-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // ── Authed admin ──
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif">Submissions</h1>
        <div className="flex items-center gap-3">
          <button onClick={loadSubmissions} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="p-3">Date</th>
              <th className="p-3">Email</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">UTM</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                <td className="p-3 text-xs whitespace-nowrap">
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-xs">{s.email}</td>
                <td className="p-3">
                  <span className="text-xs">{s.input_type}</span>
                </td>
                <td className="p-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s.status] || ""}`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {s.utm_source || "—"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => { setSelected(s); setEditScript(s.polished_script || ""); }}
                    className="text-primary hover:underline text-xs"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif">Submission Detail</h2>
              <button onClick={() => setSelected(null)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-medium">{selected.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span> {selected.input_type}
                {selected.voice_duration_seconds && ` (${selected.voice_duration_seconds}s)`}
              </div>

              {selected.voice_file_url && (
                <div>
                  <span className="text-muted-foreground block mb-1">Voice Recording:</span>
                  <audio controls src={selected.voice_file_url} className="w-full" />
                </div>
              )}

              {selected.raw_text && (
                <div>
                  <span className="text-muted-foreground block mb-1">Raw Text:</span>
                  <p className="rounded-lg bg-muted p-3 text-xs">{selected.raw_text}</p>
                </div>
              )}

              {selected.transcript_text && (
                <div>
                  <span className="text-muted-foreground block mb-1">Transcript:</span>
                  <p className="rounded-lg bg-muted p-3 text-xs">{selected.transcript_text}</p>
                </div>
              )}

              {/* Polished Script */}
              <div>
                <span className="text-muted-foreground block mb-1">Polished Script:</span>
                <textarea
                  value={editScript}
                  onChange={(e) => setEditScript(e.target.value)}
                  rows={8}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => updateSubmission(selected.id, { polished_script: editScript })}
                  disabled={saving}
                  className="mt-1 text-xs text-primary hover:underline"
                >
                  {saving ? "Saving…" : "Save Script"}
                </button>
              </div>

              {/* Audio */}
              {selected.audio_url && (
                <div>
                  <span className="text-muted-foreground block mb-1">Generated Audio:</span>
                  <audio controls src={selected.audio_url} className="w-full" />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => updateSubmission(selected.id, { status: "ready" })}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
                >
                  Mark Ready
                </button>
                <button
                  onClick={() => updateSubmission(selected.id, { status: "sent" })}
                  className="rounded-full bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground"
                >
                  Mark Sent
                </button>
                <button
                  onClick={() => copyEmailTemplate(selected)}
                  className="flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy Email Template"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
