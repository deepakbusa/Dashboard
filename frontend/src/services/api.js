import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor with retry logic and error handling
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors (connection lost)
        if (!error.response) {
            console.error('❌ Network error - backend unreachable');
            
            // Retry once after 2 seconds
            if (!originalRequest._retry) {
                originalRequest._retry = true;
                await new Promise(resolve => setTimeout(resolve, 2000));
                return api(originalRequest);
            }
            
            // Show user-friendly error
            const errorMessage = 'Backend server is not responding. Please check if the server is running.';
            return Promise.reject(new Error(errorMessage));
        }

        // Handle 401 (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Handle 403 (Forbidden)
        if (error.response?.status === 403) {
            console.error('❌ Access forbidden');
        }

        // Handle 500+ (Server errors)
        if (error.response?.status >= 500) {
            console.error('❌ Server error:', error.response.status);
        }

        return Promise.reject(error);
    }
);

// Auth
export const login = (username, password) =>
    api.post('/auth/login', { username, password });

export const verifyToken = () =>
    api.get('/auth/verify');

// Dashboard
export const getDashboardOverview = () =>
    api.get('/dashboard/overview');

export const getRecentActivity = (limit = 10) =>
    api.get(`/dashboard/activity?limit=${limit}`);

export const getTopServices = (limit = 5) =>
    api.get(`/dashboard/top-services?limit=${limit}`);

export const getUsageTrends = (days = 7) =>
    api.get(`/dashboard/trends?days=${days}`);

// Users
export const getUsers = (page = 1, limit = 10, search = '', filter = '') =>
    api.get(`/users?page=${page}&limit=${limit}&search=${search}&filter=${filter}`);

export const getUserDetails = (userId) =>
    api.get(`/users/${userId}`);

export const createUser = (userData) =>
    api.post('/users', userData);

export const updateUser = (userId, userData) =>
    api.put(`/users/${userId}`, userData);

export const deleteUser = (userId) =>
    api.delete(`/users/${userId}`);

export const blockUser = (userId) =>
    api.post(`/users/${userId}/block`);

export const unblockUser = (userId) =>
    api.post(`/users/${userId}/unblock`);

// Sessions
export const getSessions = (page = 1, limit = 10, status = '') =>
    api.get(`/sessions?page=${page}&limit=${limit}&status=${status}`);

export const endSession = (sessionId) =>
    api.post(`/sessions/${sessionId}/end`);

export const cleanupExpiredSessions = () =>
    api.post('/sessions/cleanup');

// Analytics
export const getDetailedAnalytics = () =>
    api.get('/analytics/detailed');

export const getUserStats = () =>
    api.get('/analytics/user-stats');

// Audit
export const getAuditLogs = (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    return api.get(`/audit?${params}`);
};

export const getAuditSummary = () =>
    api.get('/audit/summary');

export default api;
