import { motion } from "framer-motion";
import { Sun, Moon, Clock, Play, Eye, Flame, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/lib/store";
import AudioPlayer from "./AudioPlayer";

const DailyRitualScreen = () => {
  const { streak, setStep, scenes } = useAppStore();

  const ritualSections = [
    {
      icon: Sun,
      time: "Morning",
      color: "text-gold",
      tasks: [
        { icon: Play, label: "Listen to affirmation", done: false },
        { icon: Eye, label: "View visualization", done: false },
      ],
    },
    {
      icon: Clock,
      time: "Midday",
      color: "text-turquoise",
      tasks: [
        { icon: Eye, label: "Short reminder", done: false },
      ],
    },
    {
      icon: Moon,
      time: "Night",
      color: "text-primary",
      tasks: [
        { icon: Play, label: "Sleep affirmation", done: false },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[100dvh] gradient-ocean px-6 pb-8 pt-14"
    >
      {/* Back */}
      <button
        onClick={() => setStep("script")}
        className="mb-6 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to script
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="mb-1 text-xs font-medium tracking-[0.3em] uppercase text-gold">
          FutureSelf
        </p>
        <h1 className="mb-2 text-3xl font-semibold text-foreground">
          Your Daily
          <br />
          <span className="italic text-gradient-sunrise">Future Ritual</span>
        </h1>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-4 backdrop-blur-sm"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-sunrise">
          <Flame className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Day {streak} of your visualization ritual
          </p>
          <p className="text-xs text-muted-foreground">Keep the momentum going</p>
        </div>
      </motion.div>

      {/* Audio Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <AudioPlayer />
      </motion.div>

      {/* Ritual Sections */}
      <div className="space-y-4">
        {ritualSections.map((section, i) => (
          <motion.div
            key={section.time}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <section.icon className={`h-4 w-4 ${section.color}`} />
              <p className={`text-sm font-semibold ${section.color}`}>
                {section.time}
              </p>
            </div>
            <div className="space-y-2">
              {section.tasks.map((task, j) => (
                <button
                  key={j}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/30 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <task.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{task.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mini vision board */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Your Vision Board
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {scenes.slice(0, 4).map((scene) => (
            <img
              key={scene.id}
              src={scene.src}
              alt={scene.title}
              className="h-20 w-20 shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DailyRitualScreen;
