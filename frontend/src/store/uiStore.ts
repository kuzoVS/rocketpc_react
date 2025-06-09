import { create } from 'zustand';

interface Modal {
    id: string;
    isOpen: boolean;
    data?: any;
}

interface UiState {
    // Sidebar
    sidebarOpen: boolean;

    // Modals
    modals: Modal[];

    // Loading states
    globalLoading: boolean;
    loadingText: string;

    // Notifications
    notifications: Notification[];

    // Theme
    theme: 'dark' | 'light';
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface UiActions {
    // Sidebar
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Modals
    openModal: (id: string, data?: any) => void;
    closeModal: (id: string) => void;
    closeAllModals: () => void;

    // Loading
    setGlobalLoading: (loading: boolean, text?: string) => void;

    // Notifications
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;

    // Theme
    toggleTheme: () => void;
    setTheme: (theme: 'dark' | 'light') => void;
}

export const useUiStore = create<UiState & UiActions>((set, get) => ({
    // State
    sidebarOpen: false,
    modals: [],
    globalLoading: false,
    loadingText: '',
    notifications: [],
    theme: 'dark',

    // Sidebar Actions
    toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    },

    setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
    },

    // Modal Actions
    openModal: (id: string, data?: any) => {
        set((state) => ({
            modals: [
                ...state.modals.filter((modal) => modal.id !== id),
                { id, isOpen: true, data },
            ],
        }));
    },

    closeModal: (id: string) => {
        set((state) => ({
            modals: state.modals.map((modal) =>
                modal.id === id ? { ...modal, isOpen: false } : modal
            ),
        }));
    },

    closeAllModals: () => {
        set((state) => ({
            modals: state.modals.map((modal) => ({ ...modal, isOpen: false })),
        }));
    },

    // Loading Actions
    setGlobalLoading: (loading: boolean, text = 'Загрузка...') => {
        set({ globalLoading: loading, loadingText: text });
    },

    // Notification Actions
    addNotification: (notification: Omit<Notification, 'id'>) => {
        const id = Date.now().toString();
        const newNotification: Notification = {
            id,
            duration: 5000,
            ...notification,
        };

        set((state) => ({
            notifications: [...state.notifications, newNotification],
        }));

        // Auto remove notification
        if (newNotification.duration) {
            setTimeout(() => {
                get().removeNotification(id);
            }, newNotification.duration);
        }
    },

    removeNotification: (id: string) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },

    clearNotifications: () => {
        set({ notifications: [] });
    },

    // Theme Actions
    toggleTheme: () => {
        set((state) => ({
            theme: state.theme === 'dark' ? 'light' : 'dark',
        }));
    },

    setTheme: (theme: 'dark' | 'light') => {
        set({ theme });
    },
}));

// Helper hooks for easier usage
export const useModal = (id: string) => {
    const { modals, openModal, closeModal } = useUiStore();
    const modal = modals.find((m) => m.id === id);

    return {
        isOpen: modal?.isOpen || false,
        data: modal?.data,
        open: (data?: any) => openModal(id, data),
        close: () => closeModal(id),
    };
};

export const useNotifications = () => {
    const { notifications, addNotification, removeNotification } = useUiStore();

    return {
        notifications,
        addNotification,
        removeNotification,
        success: (message: string, title?: string) =>
            addNotification({ type: 'success', message, title }),
        error: (message: string, title?: string) =>
            addNotification({ type: 'error', message, title }),
        warning: (message: string, title?: string) =>
            addNotification({ type: 'warning', message, title }),
        info: (message: string, title?: string) =>
            addNotification({ type: 'info', message, title }),
    };
};