import { create } from 'zustand';

export interface VisualizationScene {
  id: string;
  src: string;
  title: string;
  tag: string;
  favorited: boolean;
}

export type AppStep = 'onboarding' | 'dream-capture' | 'generating' | 'script' | 'audio' | 'gallery' | 'dashboard';
export type NavTab = 'home' | 'visualizations' | 'ritual' | 'profile';

interface RitualDay {
  date: string;
  morning: boolean;
  midday: boolean;
  night: boolean;
}

interface AppState {
  step: AppStep;
  activeTab: NavTab;
  dreamText: string;
  manifestationScript: string;
  scenes: VisualizationScene[];
  streak: number;
  ritualDays: RitualDay[];
  backgroundSound: string;

  setStep: (step: AppStep) => void;
  setActiveTab: (tab: NavTab) => void;
  setDreamText: (text: string) => void;
  setManifestationScript: (script: string) => void;
  setScenes: (scenes: VisualizationScene[]) => void;
  toggleFavorite: (id: string) => void;
  setBackgroundSound: (sound: string) => void;
  completeRitual: (period: 'morning' | 'midday' | 'night') => void;
  resetApp: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

const initialState = {
  step: 'onboarding' as AppStep,
  activeTab: 'home' as NavTab,
  dreamText: '',
  manifestationScript: '',
  scenes: [] as VisualizationScene[],
  streak: 0,
  ritualDays: [] as RitualDay[],
  backgroundSound: 'ocean',
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDreamText: (dreamText) => set({ dreamText }),
  setManifestationScript: (manifestationScript) => set({ manifestationScript }),
  setScenes: (scenes) => set({ scenes }),
  toggleFavorite: (id) =>
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === id ? { ...s, favorited: !s.favorited } : s
      ),
    })),
  setBackgroundSound: (backgroundSound) => set({ backgroundSound }),

  completeRitual: (period) => {
    const d = today();
    const state = get();
    const existing = state.ritualDays.find(r => r.date === d);
    let ritualDays: RitualDay[];
    if (existing) {
      ritualDays = state.ritualDays.map(r =>
        r.date === d ? { ...r, [period]: true } : r
      );
    } else {
      ritualDays = [...state.ritualDays, { date: d, morning: false, midday: false, night: false, [period]: true }];
    }
    // Simple streak calc
    let streak = 0;
    const sorted = [...ritualDays].sort((a, b) => b.date.localeCompare(a.date));
    for (const day of sorted) {
      if (day.morning || day.midday || day.night) streak++;
      else break;
    }
    set({ ritualDays, streak });
    logEvent('ritual_completed', { period, date: d });
  },

  resetApp: () => set({ ...initialState }),
}));

// Simple analytics logger
export function logEvent(event: string, data?: Record<string, unknown>) {
  console.log(`[ManifestFlow] ${event}`, data || '');
}
