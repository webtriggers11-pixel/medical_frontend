import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  contextSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openContextSidebar: () => void;
  closeContextSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  contextSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openContextSidebar: () => set({ contextSidebarOpen: true }),
  closeContextSidebar: () => set({ contextSidebarOpen: false }),
}));
