import axios from 'axios';
import { API_URL } from '../config';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Сервис для управления аутентификацией пользователя
 * @class AuthService
 */
class AuthService {
    /**
     * Токен для аутентификации пользователя
     * @private
     * @type {string | null}
     */
    private token: string | null = null;

    /**
     * Refresh токен для обновления access токена
     * @private
     * @type {string | null}
     */
    private refreshToken: string | null = null;

    /**
     * Получает токен для аутентификации пользователя
     * @returns {string | null} Токен для аутентификации пользователя
     */
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Получает refresh токен для обновления access токена
     * @returns {string | null} Refresh токен для обновления access токена
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    /**
     * Устанавливает токены для аутентификации пользователя
     * @param {string} accessToken - Токен для аутентификации пользователя
     * @param {string} refreshToken - Refresh токен для обновления access токена
     */
    setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    /**
     * Удаляет токены для аутентификации пользователя
     */
    removeTokens(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    /**
     * Обновляет токен для аутентификации пользователя
     * @returns {Promise<boolean>} True, если токен обновлен успешно, false в противном случае
     */
    async refreshToken(): Promise<boolean> {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                return false;
            }

            const response = await axios.post(`${API_URL}/auth/refresh`, {
                refresh_token: refreshToken
            });

            const { access_token, refresh_token } = response.data;
            this.setTokens(access_token, refresh_token);
            return true;
        } catch (error) {
            this.removeTokens();
            return false;
        }
    }

    /**
     * Проверяет, аутентифицирован ли пользователь
     * @returns {boolean} True, если пользователь аутентифицирован, false в противном случае
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Выполняет выход пользователя из системы
     */
    logout(): void {
        this.removeTokens();
    }

    /**
     * Выполняет вход пользователя
     * @param {string} username - Имя пользователя
     * @param {string} password - Пароль пользователя
     * @returns {Promise<boolean>} True, если вход выполнен успешно, false в противном случае
     */
    async login(username: string, password: string): Promise<boolean> {
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post(`${API_URL}/auth/login`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, refresh_token } = response.data;
            this.setTokens(access_token, refresh_token);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    /**
     * Регистрирует нового пользователя
     * @param {string} username - Имя пользователя
     * @param {string} email - Email пользователя
     * @param {string} password - Пароль пользователя
     * @returns {Promise<{ success: boolean; message: string }>} Результат регистрации
     */
    async register(username: string, email: string, password: string): Promise<{ success: boolean; message: string }> {
        try {
            await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password
            });
            return { success: true, message: 'Регистрация успешна' };
        } catch (error: any) {
            console.error('Registration error:', error);
            const message = error.response?.data?.detail || 'Ошибка при регистрации';
            return { success: false, message };
        }
    }
}

export const authService = new AuthService();
