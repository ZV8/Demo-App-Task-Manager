import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_URL } from '../config';

interface RetryConfig {
    retries: number;
    retryDelay: number;
    retryCondition: (error: AxiosError<unknown>) => boolean;
}

const defaultRetryConfig: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error: AxiosError<unknown>): boolean => {
        // Повторяем запрос только для определенных ошибок
        return Boolean(
            error.code === 'ECONNABORTED' ||  // Timeout
            error.code === 'ERR_NETWORK' ||   // Network error
            (error.response?.status && error.response?.status >= 500) // Server error
        );
    }
};

class ApiClient {
    private instance: AxiosInstance;
    private retryConfig: RetryConfig;

    constructor(config?: Partial<RetryConfig>) {
        this.retryConfig = { ...defaultRetryConfig, ...config };

        this.instance = axios.create({
            baseURL: API_URL,
            timeout: 10000, // 10 секунд таймаут
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.instance.interceptors.request.use(
            (config) => {
                // Добавляем уникальный идентификатор запроса
                config.headers['X-Request-ID'] = this.generateRequestId();
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError<unknown>) => {
                const config = error.config as AxiosRequestConfig & { _retry?: number };
                
                // Проверяем, нужно ли повторять запрос
                if (
                    config &&
                    (!config._retry || config._retry < this.retryConfig.retries) &&
                    this.retryConfig.retryCondition(error)
                ) {
                    config._retry = (config._retry || 0) + 1;

                    // Ждем перед повторным запросом
                    await this.delay(this.retryConfig.retryDelay * config._retry);

                    // Повторяем запрос
                    return this.instance(config);
                }

                // Форматируем ошибку для пользователя
                const userError = this.formatError(error);
                return Promise.reject(userError);
            }
        );
    }

    private generateRequestId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private formatError(error: AxiosError<unknown>): Error {
        let message = 'Произошла ошибка при выполнении запроса';
        
        if (error.response) {
            // Ошибка от сервера
            const serverError = error.response.data as any;
            message = serverError.error || serverError.message || message;
        } else if (error.code === 'ECONNABORTED') {
            message = 'Превышено время ожидания запроса';
        } else if (error.code === 'ERR_NETWORK') {
            message = 'Ошибка сети. Проверьте подключение к интернету';
        }

        const formattedError = new Error(message);
        formattedError.name = error.name;
        (formattedError as any).code = error.code;
        (formattedError as any).status = error.response?.status;
        
        return formattedError;
    }

    // Методы для выполнения запросов
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.put<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.instance.delete<T>(url, config);
        return response.data;
    }
}

export const apiClient = new ApiClient();
