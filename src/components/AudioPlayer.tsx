import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
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

  const elapsed = Math.floor(progress * 0.06);
  const elapsedSec = Math.floor((progress * 3.6) % 60);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>

        <div className="flex-1">
          <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{elapsed}:{String(elapsedSec).padStart(2, "0")}</span>
            <span>6:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
