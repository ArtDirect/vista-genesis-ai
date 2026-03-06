import { create } from 'zustand';

export interface VisualizationScene {
  id: string;
  src: string;
  title: string;
  favorited: boolean;
}

interface AppState {
  step: 'onboarding' | 'dream-capture' | 'generating' | 'script' | 'ritual';
  dreamText: string;
  manifestationScript: string;
  scenes: VisualizationScene[];
  streak: number;
  setStep: (step: AppState['step']) => void;
  setDreamText: (text: string) => void;
  setManifestationScript: (script: string) => void;
  setScenes: (scenes: VisualizationScene[]) => void;
  toggleFavorite: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  step: 'onboarding',
  dreamText: '',
  manifestationScript: '',
  scenes: [],
  streak: 4,
  setStep: (step) => set({ step }),
  setDreamText: (dreamText) => set({ dreamText }),
  setManifestationScript: (manifestationScript) => set({ manifestationScript }),
  setScenes: (scenes) => set({ scenes }),
  toggleFavorite: (id) =>
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === id ? { ...s, favorited: !s.favorited } : s
      ),
    })),
}));
