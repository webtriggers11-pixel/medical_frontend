import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  contextSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openContextSidebar: () => void;
  closeContextSidebar: () => void;
}

// On phones/tablets the sidebar is an overlay drawer, so it must start closed
// (collapsed) — otherwise it covers the screen on first load. On desktop
// (lg+ ≥ 1024px) it starts open as a normal docked sidebar.
const startsCollapsed =
  typeof window !== 'undefined' && window.innerWidth < 1024;

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: startsCollapsed,
  contextSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openContextSidebar: () => set({ contextSidebarOpen: true }),
  closeContextSidebar: () => set({ contextSidebarOpen: false }),
}));
