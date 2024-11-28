export interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    created_at: string;
    owner_id: number;
}

export interface User {
    id: number;
    email: string;
    username: string;
}

export interface LoginForm {
    username: string;
    password: string;
}

export interface RegisterFormData extends LoginForm {
    email: string;
    confirmPassword: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
    completed: boolean;
}
