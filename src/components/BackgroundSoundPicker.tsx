import { motion } from "framer-motion";
import { Waves, Music, TreePine, Piano, Brain } from "lucide-react";
import { useAppStore } from "@/lib/store";

const sounds = [
  { id: "ocean", label: "Ocean", icon: Waves },
  { id: "ambient", label: "Ambient", icon: Music },
  { id: "piano", label: "Piano", icon: Piano },
  { id: "forest", label: "Forest", icon: TreePine },
  { id: "focus", label: "Focus", icon: Brain },
];

const BackgroundSoundPicker = () => {
  const { backgroundSound, setBackgroundSound } = useAppStore();

  return (
    <div className="rounded-2xl border border-border/30 bg-card/40 p-5 backdrop-blur-sm">
      <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-secondary/60">
        Ambient sound
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sounds.map((sound) => {
          const isActive = backgroundSound === sound.id;
          return (
            <motion.button
              key={sound.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBackgroundSound(sound.id)}
              className={`flex shrink-0 flex-col items-center gap-1.5 rounded-xl px-4 py-3 text-xs font-medium transition-all duration-500 ${
                isActive
                  ? "gradient-dawn text-primary-foreground"
                  : "border border-border/30 bg-muted/20 text-muted-foreground hover:border-primary/20"
              }`}
            >
              <sound.icon className="h-4 w-4" />
              {sound.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BackgroundSoundPicker;
