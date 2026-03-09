import { motion } from "framer-motion";
import { Flame, ArrowLeft, Headphones, BookOpen, Library } from "lucide-react";
import { useAppStore } from "@/lib/store";
import AudioPlayer from "./AudioPlayer";
import BackgroundSoundPicker from "./BackgroundSoundPicker";

const slow = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] };

const DailyRitualScreen = () => {
  const { streak, setStep } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="min-h-[100dvh] gradient-twilight px-6 pb-24 pt-14"
    >
      <button
        onClick={() => setStep("script")}
        className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground transition-colors duration-500"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...slow }}
        className="mb-10"
      >
        <p className="mb-2 text-xs font-medium tracking-[0.4em] uppercase text-secondary/60">
          Daily ritual
        </p>
        <h1 className="mb-2 text-3xl font-medium text-foreground">
          Your daily
          <br />
          <span className="italic text-gradient-dawn">imagination practice</span>
        </h1>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, ...slow }}
        className="mb-6 flex items-center gap-3 rounded-2xl border border-border/30 bg-card/40 p-4 backdrop-blur-sm"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-dawn">
          <Flame className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Day {streak} of your practice
          </p>
          <p className="text-xs text-muted-foreground/60">Every day, a little clearer</p>
        </div>
      </motion.div>

      {/* Background Sound */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, ...slow }}
        className="mb-6"
      >
        <BackgroundSoundPicker />
      </motion.div>

      {/* Audio Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, ...slow }}
        className="mb-8"
      >
        <AudioPlayer />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, ...slow }}
        className="space-y-3"
      >
        <button className="flex w-full items-center gap-3 rounded-2xl border border-border/30 bg-card/40 px-5 py-4 text-left backdrop-blur-sm transition-all duration-500 hover:bg-card/60">
          <Headphones className="h-5 w-5 text-primary/70" />
          <div>
            <p className="text-sm font-medium text-foreground">Morning Visualization</p>
            <p className="text-xs text-muted-foreground/60">Step into your future</p>
          </div>
        </button>
        <button className="flex w-full items-center gap-3 rounded-2xl border border-border/30 bg-card/40 px-5 py-4 text-left backdrop-blur-sm transition-all duration-500 hover:bg-card/60">
          <BookOpen className="h-5 w-5 text-gold/70" />
          <div>
            <p className="text-sm font-medium text-foreground">Read Your Script</p>
            <p className="text-xs text-muted-foreground/60">Review your imagined future</p>
          </div>
        </button>
        <button className="flex w-full items-center gap-3 rounded-2xl border border-border/30 bg-card/40 px-5 py-4 text-left backdrop-blur-sm transition-all duration-500 hover:bg-card/60">
          <Library className="h-5 w-5 text-accent/70" />
          <div>
            <p className="text-sm font-medium text-foreground">Visualization Gallery</p>
            <p className="text-xs text-muted-foreground/60">See all your scenes</p>
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default DailyRitualScreen;
