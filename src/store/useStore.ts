import { create } from 'zustand';

interface SceneState {
  progress: number;
  targetProgress: number;
  activeSection: string | null;
  bootCompleted: boolean;
  
  setProgress: (progress: number) => void;
  setTargetProgress: (targetProgress: number) => void;
  setActiveSection: (section: string | null) => void;
  completeBoot: () => void;
}

export const useStore = create<SceneState>((set) => ({
  progress: 0,
  targetProgress: 0,
  activeSection: null,
  bootCompleted: false,

  setProgress: (progress) => set({ progress }),
  setTargetProgress: (targetProgress) => set({ targetProgress }),
  setActiveSection: (activeSection) => set({ activeSection }),
  completeBoot: () => set({ bootCompleted: true }),
}));
