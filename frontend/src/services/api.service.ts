import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config';
import { authService } from './auth.service';
import { Task } from '../types';

interface ErrorResponseData {
    retry_after?: number;
    message?: string;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

class ApiService {
    private api: AxiosInstance;
    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                const token = authService.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError<ErrorResponseData>) => {
                const originalRequest = error.config as RetryableRequest | undefined;
                
                if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        try {
                            const token = await new Promise<string>((resolve) => {
                                this.refreshSubscribers.push((token: string) => {
                                    resolve(token);
                                });
                            });
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return this.api(originalRequest);
                        } catch (err) {
                            return Promise.reject(err);
                        }
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const refreshed = await authService.refreshToken();
                        if (refreshed) {
                            const newToken = authService.getToken();
                            this.refreshSubscribers.forEach((callback) => callback(newToken!));
                            this.refreshSubscribers = [];
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return this.api(originalRequest);
                        }
                    } catch (error) {
                        authService.removeTokens();
                        window.location.href = '/login';
                        return Promise.reject(error);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    public getApi(): AxiosInstance {
        return this.api;
    }

    // Task API methods
    public async getTasks(): Promise<Task[]> {
        const response = await this.api.get<Task[]>('/tasks');
        return response.data;
    }

    public async createTask(title: string, description?: string, completed: boolean = false): Promise<Task> {
        const response = await this.api.post<Task>('/tasks', { title, description, completed });
        return response.data;
    }

    public async updateTask(id: number, data: Partial<Task>): Promise<Task> {
        const response = await this.api.put<Task>(`/tasks/${id}`, data);
        return response.data;
    }

    public async deleteTask(id: number): Promise<void> {
        await this.api.delete(`/tasks/${id}`);
    }
}

export const apiService = new ApiService();
export const api = apiService.getApi();
