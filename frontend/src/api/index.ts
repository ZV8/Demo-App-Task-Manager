import { api } from '../services/api.service';
import { authService } from '../services/auth.service';
import { Task, User } from '../types';

export const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', {
        username,
        password,
    });
    const { access_token, refresh_token } = response.data;
    authService.setTokens(access_token, refresh_token);
    return response.data;
};

export const register = async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {
        username,
        email,
        password,
    });
    return response.data;
};

export const logout = () => {
    authService.removeTokens();
};

export const getTasks = async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
};

export const createTask = async (title: string, description: string): Promise<Task> => {
    const response = await api.post('/tasks', { title, description });
    return response.data;
};

export const updateTask = async (id: number, updates: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
};
