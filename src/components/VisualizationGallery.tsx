import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { VisualizationScene } from "@/lib/store";

interface Props {
  scenes: VisualizationScene[];
  onToggleFavorite: (id: string) => void;
}

const VisualizationGallery = ({ scenes, onToggleFavorite }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {scenes.map((scene, i) => (
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.15 }}
          className="group relative overflow-hidden rounded-xl"
        >
          <img
            src={scene.src}
            alt={scene.title}
            className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-xs font-medium text-foreground">{scene.title}</p>
          </div>
          <button
            onClick={() => onToggleFavorite(scene.id)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/40 backdrop-blur-sm transition-colors"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors ${
                scene.favorited ? "fill-primary text-primary" : "text-foreground/70"
              }`}
            />
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default VisualizationGallery;
