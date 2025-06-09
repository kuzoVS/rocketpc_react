// Auth Types
export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: 'admin' | 'director' | 'manager' | 'master';
    phone?: string;
    is_active: boolean;
    created_at: string;
    last_login?: string;
    specialization?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

// Request Types
export interface RepairRequest {
    id: number;
    request_id: string;
    client_id: number;
    client_name: string;
    client_phone: string;
    client_email?: string;
    device_type: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    problem_description: string;
    status: RequestStatus;
    priority: RequestPriority;
    estimated_cost?: number;
    final_cost?: number;
    estimated_completion?: string;
    actual_completion?: string;
    assigned_master_id?: number;
    assigned_master_name?: string;
    master_name?: string;
    master_specialization?: string;
    created_by_id?: number;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
    warranty_period: number;
    repair_duration_hours?: number;
    parts_used?: string;
    notes?: string;
}

export type RequestStatus =
    | 'Принята'
    | 'Диагностика'
    | 'Ожидание запчастей'
    | 'В ремонте'
    | 'Тестирование'
    | 'Готова к выдаче'
    | 'Выдана';

export type RequestPriority = 'Низкая' | 'Обычная' | 'Высокая' | 'Критическая';

export interface CreateRequestData {
    client_name: string;
    phone: string;
    email?: string;
    device_type: string;
    brand?: string;
    model?: string;
    problem_description: string;
    priority?: RequestPriority;
    assigned_master_id?: number;
}

export interface UpdateRequestData {
    status?: RequestStatus;
    priority?: RequestPriority;
    estimated_cost?: number;
    final_cost?: number;
    estimated_completion?: string;
    assigned_master_id?: number;
    problem_description?: string;
    parts_used?: string;
    notes?: string;
    comment?: string;
}

// Client Types
export interface Client {
    id: number;
    full_name: string;
    phone: string;
    email?: string;
    address?: string;
    created_at: string;
    total_repairs: number;
    total_requests?: number;
    active_requests?: number;
    completed_requests?: number;
    total_spent?: number;
    is_vip: boolean;
    notes?: string;
    requests?: RepairRequest[];
    device_types?: DeviceType[];
}

export interface DeviceType {
    device_type: string;
    count: number;
    last_repair: string;
}

export interface CreateClientData {
    full_name: string;
    phone: string;
    email?: string;
    address?: string;
    is_vip?: boolean;
    notes?: string;
}

// Master Types
export interface Master {
    id: number;
    username: string;
    full_name: string;
    phone?: string;
    specialization?: string;
    is_available: boolean;
    current_repairs_count: number;
    max_concurrent_repairs: number;
    active_repairs: number;
    skills?: MasterSkill[];
}

export interface MasterSkill {
    skill_name: string;
    skill_level: number;
}

// Statistics Types
export interface DashboardStats {
    total_requests: number;
    active_requests: number;
    completed_this_month: number;
    completed_last_month: number;
    growth_percentage: number;
    avg_cost: number;
    avg_repair_time: number;
    monthly_revenue: number;
    status_stats: StatusStat[];
    priority_stats: PriorityStat[];
    top_masters: TopMaster[];
}

export interface StatusStat {
    status: string;
    count: number;
}

export interface PriorityStat {
    priority: string;
    count: number;
}

export interface TopMaster {
    full_name: string;
    completed_repairs: number;
    avg_days: number;
}

export interface ChartData {
    labels: string[];
    requests: number[];
    completed: number[];
}

// API Response Types
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
    detail?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}

// Form Types
export interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    className?: string;
}

// Filter Types
export interface RequestFilters {
    search?: string;
    status?: RequestStatus | '';
    priority?: RequestPriority | '';
    period?: 'today' | 'week' | 'month' | '';
    master_id?: number | '';
}

export interface ClientFilters {
    search?: string;
    type?: 'all' | 'vip' | 'active' | 'new';
    sort?: 'name' | 'date' | 'repairs' | 'spending';
}

export interface UserFilters {
    search?: string;
    role?: string;
    status?: 'active' | 'inactive' | '';
    sort?: 'name' | 'role' | 'created' | 'login';
}

// History Types
export interface HistoryItem {
    id: string;
    action_type: 'status_change' | 'master_assignment' | 'master_unassignment';
    old_status?: string;
    new_status?: string;
    master_name?: string;
    master_specialization?: string;
    changed_at: string;
    changed_by_name?: string;
    changed_by_role?: string;
    comment?: string;
}