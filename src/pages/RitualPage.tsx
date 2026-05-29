import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Keyboard, ArrowRight, Loader2, Pencil, Play, Pause, RotateCcw, Download, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/events";
import { getUtmParams } from "@/lib/utm";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

type Step = "capture" | "generating" | "script" | "audio";

const placeholders = [
  "I want to feel calm in my body, build something I'm proud of, and have time for the people I love.",
  "I want financial freedom, a peaceful home near nature, and meaningful work that doesn't drain me.",
  "I want to wake up excited, trust myself, and live a life that feels honest.",
];

export default function RitualPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("capture");

  // capture state
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [dreamText, setDreamText] = useState("");
  const { user } = useAuth();
  const [email, setEmail] = useState("");

  // Auto-fill email from session
  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // pipeline state
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingStage, setGeneratingStage] = useState<"saving" | "transcribing" | "polishing" | "voicing">("saving");
  const [error, setError] = useState("");

  // script edit
  const [editingScript, setEditingScript] = useState(false);
  const [scriptDraft, setScriptDraft] = useState("");

  // audio playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    trackEvent("ritual_page_view", "/ritual");
  }, []);

  // Stop the recorder, timer, and mic tracks if the user leaves mid-recording.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stream?.getTracks().forEach((t) => t.stop());
        recorder.stop();
      }
    };
  }, []);

  // ---- Voice recording ----
  const startRecording = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      trackEvent("started_recording", "/ritual");
      timerRef.current = window.setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setError("Microphone access denied. Try text instead.");
      setMode("text");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ---- Submission pipeline ----
  const canSubmit =
    email.trim().includes("@") &&
    ((mode === "voice" && audioBlob) || (mode === "text" && dreamText.trim().length > 10));

  const handleBeginRitual = async () => {
    if (!canSubmit) {
      setError("Please add your email and your dream.");
      return;
    }
    setError("");
    setStep("generating");
    setGenerating(true);
    setGeneratingStage("saving");

    const utm = getUtmParams();
    let voice_file_url: string | null = null;
    let voice_file_path: string | null = null;
    let raw = mode === "text" ? dreamText.trim() : "(voice recording)";

    try {
      // 1. upload voice if any
      if (mode === "voice" && audioBlob) {
        const id = crypto.randomUUID();
        const path = `voice/submission-${id}-${Date.now()}.webm`;
        const { error: upErr } = await supabase.storage
          .from("manifestations")
          .upload(path, audioBlob, { contentType: "audio/webm" });
        if (upErr) throw upErr;
        const { data: u } = supabase.storage.from("manifestations").getPublicUrl(path);
        voice_file_url = u.publicUrl;
        voice_file_path = path;
      }

      // 2. insert submission row FIRST (so we have a submission_id for auth)
      const { data: ins, error: insErr } = await supabase
        .from("submissions")
        .insert({
          email: email.trim(),
          user_id: user?.id ?? null,
          input_type: mode,
          raw_text: raw,
          voice_file_url,
          voice_file_path,
          voice_duration_seconds: mode === "voice" ? recordingTime : null,
          voice_mime_type: mode === "voice" ? "audio/webm" : null,
          consent_given: true,
          status: "polishing",
          utm_source: utm.utm_source,
          utm_campaign: utm.utm_campaign,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      const subId = ins.id as string;
      setSubmissionId(subId);
      trackEvent("submitted", "/ritual", subId);

      // 3. transcribe voice if recorded (now with submission_id for auth)
      let transcribedText = "";
      if (mode === "voice" && voice_file_url) {
        setGeneratingStage("transcribing");
        const { data: txData, error: txErr } = await supabase.functions.invoke("transcribe-audio", {
          body: { audio_url: voice_file_url, submission_id: subId },
        });
        if (txErr) {
          console.error("Transcription failed, falling back to text input:", txErr);
        } else {
          transcribedText = txData?.transcript?.trim() || "";
        }
        if (transcribedText) {
          raw = transcribedText;
        } else if (dreamText.trim()) {
          raw = dreamText.trim();
        }
      }

      // 4. polish with GPT — use real transcript for voice, typed text for text
      setGeneratingStage("polishing");
      const dreamForAI = mode === "text"
        ? dreamText.trim()
        : (transcribedText || dreamText.trim() || "I want a life that feels calm, free, and aligned with who I really am.");
      const { data: polishData, error: polishErr } = await supabase.functions.invoke("polish-script", {
        body: { dream: dreamForAI, submission_id: subId },
      });
      if (polishErr) throw polishErr;
      const polished: string = polishData?.script || "";
      if (!polished) throw new Error("Empty script returned");
      setScript(polished);
      setScriptDraft(polished);
      trackEvent("script_generated", "/ritual", subId);

      setGenerating(false);
      setStep("script");
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Something went wrong.");
      setGenerating(false);
      setStep("capture");
    }
  };

  const handleConfirmScript = async () => {
    if (!submissionId) return;
    const final = editingScript ? scriptDraft : script;
    setScript(final);
    setEditingScript(false);

    if (editingScript) {
      await supabase.from("submissions").update({ polished_script: final }).eq("id", submissionId);
    }

    setStep("generating");
    setGenerating(true);
    setGeneratingStage("voicing");
    trackEvent("audio_requested", "/ritual", submissionId);
    try {
      const { data, error: aErr } = await supabase.functions.invoke("generate-audio", {
        body: { script: final, submission_id: submissionId },
      });

      // supabase.functions.invoke surfaces non-2xx as `error` with the raw Response in error.context.
      // Pull the structured body so we can branch on data.error codes.
      let body: any = data;
      if (aErr && (aErr as any).context && typeof (aErr as any).context.json === "function") {
        try { body = await (aErr as any).context.json(); } catch { /* keep aErr.message */ }
      }

      if (body?.error === "sign_in_required") {
        setGenerating(false);
        setStep("script");
        toast.info(body.message || "Sign in to create more audios.", {
          action: { label: "Sign in", onClick: () => navigate("/login") },
        });
        return;
      }
      if (body?.error === "out_of_credits") {
        setGenerating(false);
        setStep("script");
        toast.info(body.message || "You're out of credits.");
        return;
      }
      if (body?.error === "audio_generation_failed" || body?.retryable) {
        setGenerating(false);
        setStep("script");
        toast.error(body.message || "Audio generation failed. Try again.");
        return;
      }
      if (aErr) throw aErr;

      const url = body?.audio_url;
      if (!url) throw new Error("No audio returned");
      setAudioUrl(url);
      // audio_generated is logged server-side by generate-audio — don't duplicate.
      setGenerating(false);
      setStep("audio");
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Audio generation failed.");
      setGenerating(false);
      setStep("script");
      toast.error(e?.message || "Audio generation failed.");
    }
  };

  // ---- Audio playback ----
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full">
      <div className="mx-auto max-w-xl px-6 py-10">
        <AnimatePresence mode="wait">
          {step === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-10 mt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-4">Step 1 of 4</p>
                <h1 className="text-4xl md:text-5xl font-serif italic leading-tight mb-4">
                  Whisper your future.
                </h1>
                <p className="text-base text-muted-foreground font-light max-w-md mx-auto">
                  Describe the life you're calling in. Speak it like it's already yours.
                </p>
              </div>

              <div className="flex gap-2 mb-6 p-1 bg-card rounded-full border border-border w-fit mx-auto">
                <button
                  onClick={() => setMode("voice")}
                  className={`px-5 py-2 rounded-full text-sm transition-all ${mode === "voice" ? "bg-primary text-primary-foreground shadow-coral" : "text-muted-foreground"}`}
                >
                  <Mic className="inline h-3.5 w-3.5 mr-1.5" />Voice
                </button>
                <button
                  onClick={() => setMode("text")}
                  className={`px-5 py-2 rounded-full text-sm transition-all ${mode === "text" ? "bg-primary text-primary-foreground shadow-coral" : "text-muted-foreground"}`}
                >
                  <Keyboard className="inline h-3.5 w-3.5 mr-1.5" />Text
                </button>
              </div>

              {mode === "voice" ? (
                <div className="rounded-3xl border border-border bg-card/40 backdrop-blur p-10 text-center mb-6">
                  {!audioBlob && !isRecording && (
                    <>
                      <button
                        onClick={startRecording}
                        className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-coral hover:scale-105 transition-transform"
                      >
                        <span className="absolute inset-0 rounded-full bg-primary/30 animate-breathe" />
                        <Mic className="relative h-10 w-10" />
                      </button>
                      <p className="text-sm text-muted-foreground">Tap to begin</p>
                    </>
                  )}
                  {isRecording && (
                    <>
                      <button
                        onClick={stopRecording}
                        className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-destructive text-destructive-foreground animate-breathe"
                      >
                        <Square className="h-10 w-10" />
                      </button>
                      <p className="font-mono text-2xl text-foreground">{formatTime(recordingTime)}</p>
                      <p className="text-xs text-muted-foreground mt-2">Recording… tap to finish</p>
                    </>
                  )}
                  {audioBlob && !isRecording && (
                    <>
                      <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-primary/20 border border-primary/40">
                        <Sparkles className="h-10 w-10 text-primary" />
                      </div>
                      <p className="text-base text-foreground mb-2">Recorded · {formatTime(recordingTime)}</p>
                      <button
                        onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
                        className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <RotateCcw className="h-3 w-3" /> Re-record
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <textarea
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    placeholder={placeholders[0]}
                    rows={6}
                    className="w-full resize-none rounded-2xl border border-border bg-card/40 backdrop-blur px-5 py-4 text-base font-serif italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="mt-3 space-y-2">
                    {placeholders.slice(1).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setDreamText(p)}
                        className="block w-full text-left text-xs text-muted-foreground/70 hover:text-foreground italic px-3 py-1.5 rounded-lg hover:bg-card/40 transition-colors"
                      >
                        "{p}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-full border border-border bg-card/40 backdrop-blur px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="mt-2 text-xs text-muted-foreground/70 text-center">
                  We'll send your finished audio here.
                </p>
              </div>

              {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}

              <button
                onClick={handleBeginRitual}
                disabled={!canSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-coral disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition-transform"
              >
                Begin My Ritual <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex min-h-[80vh] flex-col items-center justify-center text-center"
            >
              <div className="relative mb-12">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-breathe" />
                <div className="relative h-32 w-32 rounded-full border border-primary/40 bg-card/40 backdrop-blur flex items-center justify-center animate-float-slow">
                  <Sparkles className="h-12 w-12 text-primary animate-shimmer" />
                </div>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-4">
                {generatingStage === "saving" && "Receiving"}
                {generatingStage === "transcribing" && "Listening"}
                {generatingStage === "polishing" && "Refining"}
                {generatingStage === "voicing" && "Voicing"}
              </p>
              <h2 className="text-3xl md:text-4xl font-serif italic mb-4 max-w-md">
                {generatingStage === "saving" && "Holding your dream."}
                {generatingStage === "transcribing" && "Hearing your words."}
                {generatingStage === "polishing" && "Shaping your future into words."}
                {generatingStage === "voicing" && "Giving it a voice."}
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm font-light">
                {generatingStage === "saving" && "Saving your submission…"}
                {generatingStage === "transcribing" && "Transcribing your voice recording…"}
                {generatingStage === "polishing" && "GPT is crafting your manifestation script…"}
                {generatingStage === "voicing" && "ElevenLabs is recording your audio in a calm, grounded voice…"}
              </p>
              <Loader2 className="mt-8 h-5 w-5 text-primary animate-spin" />
            </motion.div>
          )}

          {step === "script" && (
            <motion.div
              key="script"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8 mt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-4">Step 3 of 4</p>
                <h1 className="text-4xl font-serif italic mb-3">Your script.</h1>
                <p className="text-sm text-muted-foreground font-light">Read it. Feel it. Edit if it's not yours.</p>
              </div>

              <div className="rounded-3xl border border-border bg-card/40 backdrop-blur p-8 mb-6 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                {editingScript ? (
                  <textarea
                    value={scriptDraft}
                    onChange={(e) => setScriptDraft(e.target.value)}
                    rows={14}
                    className="relative w-full resize-none bg-transparent text-lg leading-[1.9] font-serif italic text-foreground focus:outline-none"
                  />
                ) : (
                  <p className="relative whitespace-pre-line text-lg leading-[1.9] font-serif italic text-foreground/90">
                    {script}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => {
                    if (editingScript) { setScript(scriptDraft); }
                    setEditingScript(!editingScript);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border border-border bg-card/40 px-5 py-3 text-sm text-foreground hover:bg-card/70 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {editingScript ? "Save edits" : "Edit script"}
                </button>
              </div>

              <button
                onClick={handleConfirmScript}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-coral hover:scale-[1.01] transition-transform"
              >
                Voice my manifestation <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {step === "audio" && audioUrl && (
            <motion.div
              key="audio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-10 mt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-4">Step 4 of 4</p>
                <h1 className="text-4xl md:text-5xl font-serif italic mb-3">It's yours.</h1>
                <p className="text-sm text-muted-foreground font-light max-w-sm mx-auto">
                  Listen every morning. Let your future settle into your body.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card/40 backdrop-blur p-10 text-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                <div className="relative">
                  <button
                    onClick={togglePlay}
                    className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-coral hover:scale-105 transition-transform"
                  >
                    {isPlaying && <span className="absolute inset-0 rounded-full bg-primary/30 animate-breathe" />}
                    <span className="relative">
                      {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 ml-1" />}
                    </span>
                  </button>

                  <div className="mx-auto max-w-xs mb-3">
                    <div className="h-1 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground font-mono">
                      <span>{formatTime(Math.floor(progress))}</span>
                      <span>{formatTime(Math.floor(duration))}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground italic">
                    Voiced by ElevenLabs · Crafted for you
                  </p>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>

              <a
                href={audioUrl}
                download="manifestation.mp3"
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card/40 px-5 py-3 text-sm text-foreground hover:bg-card/70 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download audio
              </a>

              <button
                onClick={() => navigate(user ? "/my-audios" : "/thanks")}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-coral hover:scale-[1.01] transition-transform"
              >
                {user ? "Go to My Rituals" : "Finish ritual"} <ArrowRight className="h-4 w-4" />
              </button>

              {!user && (
                <button
                  onClick={() => navigate("/login")}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-8 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in to save your rituals
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
