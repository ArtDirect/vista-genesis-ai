import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Plus, Flame, Calendar, Clock, Headphones, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { trackEvent } from "@/lib/events";

interface Ritual {
  id: string;
  title: string | null;
  polished_script: string | null;
  audio_url: string | null;
  created_at: string;
  listen_count: number;
  last_listened_at: string | null;
  status: string;
}

export default function MyAudiosPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  // Load user's rituals
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("submissions")
        .select("id, title, polished_script, audio_url, created_at, listen_count, last_listened_at, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRituals((data as Ritual[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  // Calculate streak
  useEffect(() => {
    if (!user) return;
    const calcStreak = async () => {
      const { data } = await supabase
        .from("listening_log")
        .select("listened_at")
        .eq("user_id", user.id)
        .order("listened_at", { ascending: false })
        .limit(60);

      if (!data || data.length === 0) { setStreak(0); return; }

      // Get unique dates
      const dates = [...new Set(data.map(r => new Date(r.listened_at).toDateString()))];
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let s = 0;
      let checkDate = dates.includes(today) ? new Date() : dates.includes(yesterday) ? new Date(Date.now() - 86400000) : null;

      if (!checkDate) { setStreak(0); return; }

      while (dates.includes(checkDate.toDateString())) {
        s++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      }
      setStreak(s);
    };
    calcStreak();
  }, [user, rituals]);

  const handlePlay = async (ritual: Ritual) => {
    if (!ritual.audio_url || !user) return;

    if (playing === ritual.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }

    // Stop current
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(ritual.audio_url);
    audioRef.current = audio;
    setPlaying(ritual.id);

    audio.play().catch(() => setPlaying(null));
    audio.onended = () => setPlaying(null);

    // Log the listen
    await supabase.from("listening_log").insert({
      user_id: user.id,
      submission_id: ritual.id,
    });

    // Update listen count
    await supabase
      .from("submissions")
      .update({
        listen_count: (ritual.listen_count || 0) + 1,
        last_listened_at: new Date().toISOString(),
      })
      .eq("id", ritual.id);

    // Update local state
    setRituals(prev =>
      prev.map(r => r.id === ritual.id
        ? { ...r, listen_count: (r.listen_count || 0) + 1, last_listened_at: new Date().toISOString() }
        : r
      )
    );

    trackEvent("listened", "/my-audios", ritual.id);
  };

  const readyRituals = rituals.filter(r => r.audio_url && r.status === "ready");
  const pendingRituals = rituals.filter(r => !r.audio_url || r.status !== "ready");
  const totalListens = rituals.reduce((sum, r) => sum + (r.listen_count || 0), 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading your rituals…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-border">
        <Link to="/" className="text-2xl font-serif italic text-primary">ManifestFlow</Link>
        <div className="flex items-center gap-4">
          <Link
            to="/ritual"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> New ritual
          </Link>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Streak + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-serif mb-6">My Rituals</h1>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <Flame className="h-5 w-5 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-serif">{streak}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                Day streak
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <Headphones className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-serif">{totalListens}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                Total listens
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-serif">{readyRituals.length}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                Rituals
              </div>
            </div>
          </div>

          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-sm text-muted-foreground"
            >
              {streak === 1 && "You started your streak today. Come back tomorrow. 🔥"}
              {streak >= 2 && streak < 7 && `${streak} days strong. Keep going. 🔥`}
              {streak >= 7 && streak < 21 && `${streak} day streak! You're building a real practice. 🔥🔥`}
              {streak >= 21 && `${streak} days. This is who you are now. 🔥🔥🔥`}
            </motion.div>
          )}
        </motion.div>

        {/* Rituals list */}
        {readyRituals.length === 0 && pendingRituals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-4xl mb-4">🎧</div>
            <h2 className="text-xl font-serif mb-3">No rituals yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first audio ritual — speak your dream and hear it back.
            </p>
            <Link
              to="/ritual"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Create my first ritual
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {readyRituals.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border bg-card p-5 transition-colors ${
                    playing === r.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Play button */}
                    <button
                      onClick={() => handlePlay(r)}
                      className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                        playing === r.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-primary/10"
                      }`}
                    >
                      {playing === r.id ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium mb-1">
                        {r.title || `Ritual — ${new Date(r.created_at).toLocaleDateString()}`}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {r.polished_script?.split("\n")[0] || "…"}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Headphones className="h-3 w-3" /> {r.listen_count || 0} listens
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {r.last_listened_at
                            ? new Date(r.last_listened_at).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pending rituals */}
            {pendingRituals.length > 0 && (
              <div className="pt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Processing</p>
                {pendingRituals.map(r => (
                  <div key={r.id} className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    {r.title || `Submitted ${new Date(r.created_at).toLocaleDateString()}`}
                    <span className="ml-2 text-xs">({r.status})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
