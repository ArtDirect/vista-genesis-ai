import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, MicOff, Keyboard, Play, Square, RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/events";
import { getUtmParams } from "@/lib/utm";

const placeholders = [
  "I feel emotionally safe in my own body — I trust myself and my decisions.",
  "I'm building my dream life through soft, consistent habits that don't burn me out.",
  "Money feels steady and supportive — I'm saving, investing, and receiving with ease.",
  "My work aligns with my values, and my career is growing in a way that feels joyful.",
  "I'm deeply connected to my intuition — I move through life guided, calm, and clear.",
];

const CreatePage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    trackEvent("page_view", "/create");
  }, []);

  const startRecording = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);
      trackEvent("started_recording", "/create");
      timerRef.current = window.setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setError("Microphone access denied. Please allow microphone or use text instead.");
      setMode("text");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const reRecord = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const canSubmit =
    email.trim() &&
    consent &&
    ((mode === "voice" && audioBlob) || (mode === "text" && text.trim()));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    const utm = getUtmParams();

    try {
      let voice_file_url: string | null = null;
      let voice_file_path: string | null = null;
      let voice_mime_type: string | null = null;
      let voice_duration_seconds: number | null = null;

      if (mode === "voice" && audioBlob) {
        const id = crypto.randomUUID();
        const path = `voice/submission-${id}-${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from("manifestations")
          .upload(path, audioBlob, { contentType: "audio/webm" });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("manifestations").getPublicUrl(path);
        voice_file_url = urlData.publicUrl;
        voice_file_path = path;
        voice_mime_type = "audio/webm";
        voice_duration_seconds = recordingTime;
      }

      const { data, error: insertError } = await supabase
        .from("submissions")
        .insert({
          email: email.trim(),
          input_type: mode,
          raw_text: mode === "text" ? text.trim() : null,
          voice_file_url,
          voice_file_path,
          voice_duration_seconds,
          voice_mime_type,
          consent_given: true,
          utm_source: utm.utm_source,
          utm_campaign: utm.utm_campaign,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      trackEvent("submitted", "/create", data.id);

      // Store submission id for thank you page
      sessionStorage.setItem("mf_submission_id", data.id);
      sessionStorage.setItem("mf_email", email.trim());
      navigate("/thanks");
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-6 pt-12 pb-8 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="mb-2 text-2xl font-serif text-center">Describe the life you want to create.</h1>
        <p className="mb-8 text-sm text-muted-foreground text-center">Speak or type — let your imagination flow.</p>
      </motion.div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("voice")}
          className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${mode === "voice" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
        >
          <Mic className="inline h-4 w-4 mr-1" /> Voice
        </button>
        <button
          onClick={() => setMode("text")}
          className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${mode === "text" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
        >
          <Keyboard className="inline h-4 w-4 mr-1" /> Text
        </button>
      </div>

      {/* Voice mode */}
      {mode === "voice" && (
        <div className="mb-6">
          {!audioBlob && !isRecording && (
            <div className="flex flex-col items-center py-8">
              <button
                onClick={startRecording}
                className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/30 bg-card text-primary hover:border-primary/50 transition-all mb-4"
              >
                <Mic className="h-8 w-8" />
              </button>
              <p className="text-sm text-muted-foreground">Tap to record</p>
            </div>
          )}

          {isRecording && (
            <div className="flex flex-col items-center py-8">
              <button
                onClick={stopRecording}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive text-destructive-foreground animate-pulse mb-4"
              >
                <Square className="h-8 w-8" />
              </button>
              <p className="text-sm font-mono text-foreground">{formatTime(recordingTime)}</p>
              <p className="text-xs text-muted-foreground mt-1">Recording… tap to stop</p>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={togglePlayback}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium">Recording ({formatTime(recordingTime)})</p>
                  <p className="text-xs text-muted-foreground">Tap play to preview</p>
                </div>
              </div>
              <button
                onClick={reRecord}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> Re-record
              </button>
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Text mode */}
      {mode === "text" && (
        <div className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {/* Example prompts */}
          <div className="mt-3 space-y-2">
            {placeholders.slice(0, 3).map((p, i) => (
              <button
                key={i}
                onClick={() => setText(p)}
                className="block w-full rounded-lg border border-border bg-card/50 px-3 py-2 text-left text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1.5">Where should we send your finished audio?</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I agree to have my text/audio processed to generate my audio.
        </span>
      </label>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
        ) : (
          <>Create My Manifestation Audio <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </div>
  );
};

export default CreatePage;
