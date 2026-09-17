// Minimal toast — will be replaced with shadcn's full toast in future
import { create } from 'zustand';

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

interface ToastStore {
  toasts: Toast[];
  add: (t: Omit<Toast, 'id'>) => void;
  remove: (id: number) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export function toast(t: Omit<Toast, 'id'>) {
  useToastStore.getState().add(t);
}
