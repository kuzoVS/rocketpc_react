import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
    User,
    LoginCredentials,
    AuthResponse,
    RepairRequest,
    CreateRequestData,
    UpdateRequestData,
    Client,
    CreateClientData,
    Master,
    DashboardStats,
    ChartData,
    HistoryItem
} from '@/types';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    timeout: 10000,
    withCredentials: true, // Для работы с cookies
});

// Request interceptor для добавления токена
api.interceptors.request.use(
    (config) => {
        // Токен будет автоматически передаваться через cookie
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor для обработки ошибок
api.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await fetch('/auth/login', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        // Если login через форму успешен, получаем профиль
        const user = await authApi.getProfile();
        return {
            access_token: 'cookie-auth',
            token_type: 'bearer',
            user,
        };
    },

    logout: async (): Promise<void> => {
        await fetch('/logout', {
            method: 'GET',
            credentials: 'include',
        });
    },

    getProfile: async (): Promise<User> => {
        return api.get('/auth/profile');
    },
};

// Requests API
export const requestsApi = {
    getAll: async (): Promise<RepairRequest[]> => {
        return api.get('/dashboard/api/requests');
    },

    getById: async (id: string): Promise<RepairRequest> => {
        return api.get(`/dashboard/api/requests/${id}/full`);
    },

    create: async (data: CreateRequestData): Promise<{ id: string }> => {
        return api.post('/dashboard/api/requests', data);
    },

    update: async (id: string, data: UpdateRequestData): Promise<void> => {
        return api.put(`/dashboard/api/requests/${id}/full`, data);
    },

    updateStatus: async (id: string, status: string, comment?: string): Promise<void> => {
        return api.put(`/dashboard/api/requests/${id}/status`, { status, comment });
    },

    assignMaster: async (id: string, masterId: number): Promise<void> => {
        return api.post(`/dashboard/api/requests/${id}/assign-master`, {
            master_id: masterId,
        });
    },

    unassignMaster: async (id: string): Promise<void> => {
        return api.delete(`/dashboard/api/requests/${id}/unassign-master`);
    },

    archive: async (id: string): Promise<void> => {
        return api.post(`/dashboard/api/requests/${id}/archive`);
    },

    getHistory: async (id: string): Promise<HistoryItem[]> => {
        return api.get(`/dashboard/api/requests/${id}/history`);
    },

    // Public API для создания заявок без авторизации
    createPublic: async (data: CreateRequestData): Promise<{ id: string }> => {
        return api.post('/api/requests', data);
    },

    getStatusPublic: async (id: string): Promise<RepairRequest> => {
        return api.get(`/api/requests/${id}/status`);
    },
};

// Clients API
export const clientsApi = {
    getAll: async (): Promise<Client[]> => {
        return api.get('/api/clients');
    },

    getById: async (id: number): Promise<Client> => {
        return api.get(`/api/clients/${id}`);
    },

    create: async (data: CreateClientData): Promise<{ id: number }> => {
        return api.post('/api/clients', data);
    },

    update: async (id: number, data: Partial<CreateClientData>): Promise<void> => {
        return api.put(`/api/clients/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        return api.delete(`/api/clients/${id}`);
    },

    search: async (phone: string): Promise<Client[]> => {
        return api.get(`/api/clients/search?phone=${phone}`);
    },

    getStatistics: async (): Promise<any> => {
        return api.get('/api/clients/statistics');
    },
};

// Masters API
export const mastersApi = {
    getAvailable: async (): Promise<Master[]> => {
        return api.get('/dashboard/api/masters/available');
    },

    getWorkload: async (id: number): Promise<any> => {
        return api.get(`/dashboard/api/masters/${id}/workload`);
    },

    getDashboard: async (): Promise<any[]> => {
        return api.get('/dashboard/api/masters/dashboard');
    },
};

// Users API
export const usersApi = {
    getAll: async (): Promise<{ users: User[]; total: number }> => {
        return api.get('/dashboard/users/api/list');
    },

    getById: async (id: number): Promise<User> => {
        return api.get(`/dashboard/users/api/${id}`);
    },

    create: async (data: FormData): Promise<void> => {
        return api.post('/dashboard/users', data);
    },

    update: async (id: number, data: FormData): Promise<void> => {
        return api.post(`/dashboard/users/${id}`, data);
    },

    toggleStatus: async (id: number, activate: boolean): Promise<void> => {
        const endpoint = activate ? 'activate' : 'deactivate';
        return api.post(`/dashboard/users/${id}/${endpoint}`);
    },

    delete: async (id: number): Promise<void> => {
        return api.post(`/dashboard/users/${id}/delete`);
    },

    getStatistics: async (): Promise<any> => {
        return api.get('/dashboard/users/api/statistics');
    },
};

// Dashboard API
export const dashboardApi = {
    getStats: async (): Promise<DashboardStats> => {
        return api.get('/dashboard/api/stats/detailed');
    },

    getRecentRequests: async (): Promise<RepairRequest[]> => {
        return api.get('/dashboard/api/recent-requests');
    },

    getWeeklyChart: async (): Promise<ChartData> => {
        return api.get('/dashboard/api/charts/weekly');
    },

    getMonthlyChart: async (): Promise<ChartData> => {
        return api.get('/dashboard/api/charts/monthly');
    },

    getDeviceStats: async (): Promise<any[]> => {
        return api.get('/dashboard/api/stats/devices');
    },
};

export default api;