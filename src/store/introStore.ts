import { create } from "zustand";

type IntroState = {
  showMenu: boolean;
  setShowMenu: (value: boolean) => void;
};

export const useIntroStore = create<IntroState>((set) => ({
  showMenu: false,
  setShowMenu: (value) => set({ showMenu: value }),
}));