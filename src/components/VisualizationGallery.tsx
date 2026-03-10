import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { VisualizationScene } from "@/lib/store";

interface Props {
  scenes: VisualizationScene[];
  onToggleFavorite: (id: string) => void;
}

const VisualizationGallery = ({ scenes, onToggleFavorite }: Props) => {
  return (
    <div className="columns-2 gap-3 space-y-3">
      {scenes.map((scene, i) => (
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="group relative break-inside-avoid overflow-hidden rounded-xl border border-border bg-card"
        >
          <img
            src={scene.src}
            alt={scene.title}
            className="w-full object-cover"
            style={{ aspectRatio: i % 3 === 0 ? '3/4' : '1/1' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-card">{scene.title}</p>
              <p className="text-[10px] text-card/70">{scene.tag}</p>
            </div>
            <button
              onClick={() => onToggleFavorite(scene.id)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-card/30 backdrop-blur-sm"
            >
              <Heart
                className={`h-3.5 w-3.5 transition-colors ${
                  scene.favorited ? "fill-primary text-primary" : "text-card"
                }`}
              />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default VisualizationGallery;
