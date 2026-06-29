import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT = 10;
const MAX_FAVORITES = 20;

interface NavItem {
    path: string;
    label: string;
    timestamp: number;
}

interface NavigationStore {
    favorites: string[];
    recentlyVisited: NavItem[];

    addFavorite: (path: string) => void;
    removeFavorite: (path: string) => void;
    isFavorite: (path: string) => boolean;
    trackVisit: (path: string, label: string) => void;
    clearRecent: () => void;
}

export const useNavigationStore = create<NavigationStore>()(
    persist(
        (set, get) => ({
            favorites: [],
            recentlyVisited: [],

            addFavorite: (path) => {
                const favorites = [...new Set([path, ...get().favorites])].slice(0, MAX_FAVORITES);
                set({ favorites });
            },

            removeFavorite: (path) => {
                set({ favorites: get().favorites.filter(f => f !== path) });
            },

            isFavorite: (path) => get().favorites.includes(path),

            trackVisit: (path, label) => {
                // Don't track auth/system pages
                if (path.startsWith('/login') || path.startsWith('/reset') || path === '/') return;

                const existing = get().recentlyVisited.filter(r => r.path !== path);
                const recentlyVisited = [
                    { path, label, timestamp: Date.now() },
                    ...existing,
                ].slice(0, MAX_RECENT);

                set({ recentlyVisited });
            },

            clearRecent: () => set({ recentlyVisited: [] }),
        }),
        { name: 'erp-navigation' }
    )
);
