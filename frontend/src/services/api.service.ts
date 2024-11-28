import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config';
import { authService } from './auth.service';
import { Task, CreateTaskRequest } from '../types';

interface ErrorResponseData {
    retry_after?: number;
    message?: string;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

class ApiService {
    private static instance: ApiService;
    private api: AxiosInstance;
    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    private constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
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
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
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
                            if (newToken && originalRequest.headers) {
                                this.refreshSubscribers.forEach((callback) => callback(newToken));
                                this.refreshSubscribers = [];
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                                return this.api(originalRequest);
                            }
                        }
                        // Если не удалось обновить токен или получить новый
                        authService.removeTokens();
                        window.location.href = '/login';
                        return Promise.reject(new Error('Failed to refresh token'));
                    } catch (error) {
                        authService.removeTokens();
                        window.location.href = '/login';
                        return Promise.reject(error);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                // Обработка ошибок rate limiting
                if (error.response?.status === 429) {
                    const retryAfter = error.response.data.retry_after || 1;
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                    return this.api(error.config!);
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

    public async createTask(task: CreateTaskRequest): Promise<Task> {
        const response = await this.api.post<Task>('/tasks', task);
        return response.data;
    }

    public async updateTask(id: number, task: Partial<Task>): Promise<Task> {
        const response = await this.api.put<Task>(`/tasks/${id}`, task);
        return response.data;
    }

    public async deleteTask(id: number): Promise<void> {
        await this.api.delete(`/tasks/${id}`);
    }
}

export const apiService = ApiService.getInstance();
export const api = apiService.getApi();
