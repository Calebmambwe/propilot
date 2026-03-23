import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Active org
  activeOrgId: string | null;
  setActiveOrgId: (orgId: string | null) => void;

  // Toasts (ephemeral — not persisted)
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Proposal filters
  proposalStatusFilter: string | null;
  setProposalStatusFilter: (status: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Active org
      activeOrgId: null,
      setActiveOrgId: (orgId) => set({ activeOrgId: orgId }),

      // Toasts (not persisted — overwritten on hydration)
      toasts: [],
      addToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { ...toast, id: Math.random().toString(36).slice(2) },
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      // Proposal filters
      proposalStatusFilter: null,
      setProposalStatusFilter: (status) => set({ proposalStatusFilter: status }),
    }),
    {
      name: 'propilot-ui',
      // Only persist non-ephemeral state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeOrgId: state.activeOrgId,
        proposalStatusFilter: state.proposalStatusFilter,
      }),
    },
  ),
);
