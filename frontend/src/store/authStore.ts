import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, AuthResponse } from '@/types';
import { authApi } from '@/utils/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    clearError: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await authApi.login(credentials);
                    const { access_token, user } = response;

                    set({
                        user,
                        token: access_token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.detail || 'Ошибка входа в систему',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });

                // Redirect to login
                window.location.href = '/login';
            },

            setUser: (user: User) => {
                set({ user });
            },

            clearError: () => {
                set({ error: null });
            },

            checkAuth: async () => {
                const { token } = get();

                if (!token) {
                    set({ isAuthenticated: false });
                    return;
                }

                try {
                    const user = await authApi.getProfile();
                    set({
                        user,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    // Token is invalid, logout
                    get().logout();
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);