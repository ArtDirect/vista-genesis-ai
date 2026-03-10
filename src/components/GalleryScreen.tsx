import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAppStore, logEvent } from "@/lib/store";
import VisualizationGallery from "./VisualizationGallery";

const GalleryScreen = () => {
  const { scenes, toggleFavorite, setStep } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-[100dvh] flex-col px-6 pt-14 pb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8 text-center"
      >
        <h2 className="mb-2 text-2xl font-serif">Your Visual Scenes</h2>
        <p className="text-sm text-muted-foreground">Tap the heart to save your favorites.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mb-8"
      >
        <VisualizationGallery scenes={scenes} onToggleFavorite={toggleFavorite} />
      </motion.div>

      <div className="flex-1" />

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          logEvent('gallery_confirmed');
          logEvent('reached_dashboard');
          setStep("dashboard");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20"
      >
        Go to My Daily Ritual
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
};

export default GalleryScreen;
