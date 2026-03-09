import { create } from 'zustand';

export interface VisualizationScene {
  id: string;
  src: string;
  title: string;
  favorited: boolean;
}

export type AppStep = 'onboarding' | 'dream-capture' | 'generating' | 'script' | 'ritual';
export type NavTab = 'home' | 'visualizations' | 'ritual' | 'profile';

interface AppState {
  step: AppStep;
  activeTab: NavTab;
  dreamText: string;
  dreamCategory: string;
  manifestationScript: string;
  scenes: VisualizationScene[];
  streak: number;
  setStep: (step: AppStep) => void;
  setActiveTab: (tab: NavTab) => void;
  setDreamText: (text: string) => void;
  setDreamCategory: (category: string) => void;
  setManifestationScript: (script: string) => void;
  setScenes: (scenes: VisualizationScene[]) => void;
  toggleFavorite: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  step: 'onboarding',
  activeTab: 'home',
  dreamText: '',
  dreamCategory: '',
  manifestationScript: '',
  scenes: [],
  streak: 4,
  setStep: (step) => set({ step }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDreamText: (dreamText) => set({ dreamText }),
  setDreamCategory: (dreamCategory) => set({ dreamCategory }),
  setManifestationScript: (manifestationScript) => set({ manifestationScript }),
  setScenes: (scenes) => set({ scenes }),
  toggleFavorite: (id) =>
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === id ? { ...s, favorited: !s.favorited } : s
      ),
    })),
}));
