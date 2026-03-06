import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2 } from "lucide-react";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Mock progress
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return p + 0.5;
        });
      }, 100);
    }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-3">
        <Volume2 className="h-4 w-4 text-gold" />
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold">
          Morning Affirmation
        </p>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full gradient-sunrise text-primary-foreground"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="ml-0.5 h-5 w-5" />
          )}
        </motion.button>

        <div className="flex-1">
          {/* Progress bar */}
          <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full gradient-sunrise"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{Math.floor(progress * 0.06)}:{String(Math.floor((progress * 3.6) % 60)).padStart(2, "0")}</span>
            <span>6:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
