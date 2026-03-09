import { motion } from "framer-motion";
import { Flame, ArrowLeft, Headphones, BookOpen, Library } from "lucide-react";
import { useAppStore } from "@/lib/store";
import AudioPlayer from "./AudioPlayer";
import BackgroundSoundPicker from "./BackgroundSoundPicker";

const DailyRitualScreen = () => {
  const { streak, setStep } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] gradient-ocean px-6 pb-24 pt-14"
    >
      <button
        onClick={() => setStep("script")}
        className="mb-6 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to script
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="mb-1 text-xs font-medium tracking-[0.3em] uppercase text-gold">
          ManifestFlow
        </p>
        <h1 className="mb-2 text-3xl font-semibold text-foreground">
          Daily Listening
          <br />
          <span className="italic text-gradient-sunrise">Ritual</span>
        </h1>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-sunrise">
          <Flame className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Day {streak} of your manifestation ritual
          </p>
          <p className="text-xs text-muted-foreground">Keep listening daily</p>
        </div>
      </motion.div>

      {/* Background Sound */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <BackgroundSoundPicker />
      </motion.div>

      {/* Audio Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <AudioPlayer />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <button className="flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-card/80 px-5 py-4 text-left backdrop-blur-sm transition-colors hover:bg-muted/30">
          <Headphones className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Morning Affirmation</p>
            <p className="text-xs text-muted-foreground">Listen to start your day</p>
          </div>
        </button>
        <button className="flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-card/80 px-5 py-4 text-left backdrop-blur-sm transition-colors hover:bg-muted/30">
          <BookOpen className="h-5 w-5 text-gold" />
          <div>
            <p className="text-sm font-medium text-foreground">Read Your Script</p>
            <p className="text-xs text-muted-foreground">Review your manifestation</p>
          </div>
        </button>
        <button className="flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-card/80 px-5 py-4 text-left backdrop-blur-sm transition-colors hover:bg-muted/30">
          <Library className="h-5 w-5 text-turquoise" />
          <div>
            <p className="text-sm font-medium text-foreground">My Manifestations</p>
            <p className="text-xs text-muted-foreground">View saved manifestations</p>
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default DailyRitualScreen;
