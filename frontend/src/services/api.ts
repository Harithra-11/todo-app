import axios from 'axios';
import { Task, CreateTaskDTO, UpdateTaskDTO, FilterOptions } from '../types/Task';

const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to all requests
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    register: async (username: string, email: string, password: string) => {
        const response = await api.post('/auth/register', { username, email, password });
        return response.data;
    },
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

export const taskApi = {
    // Get all tasks with filters
    getTasks: async (options: FilterOptions) => {
        const params: any = {
            filter: options.filter,
            search: options.search || undefined,
            category: options.category || undefined,
            priority: options.priority || undefined,
            dueDate: options.dueDate !== 'all' ? options.dueDate : undefined,
            sortBy: options.sortBy,
            sortOrder: options.sortOrder,
        };
        
        const response = await api.get<Task[]>('/tasks', { params });
        return response.data;
    },

    // Get a single task
    getTask: async (id: number) => {
        const response = await api.get<Task>(`/tasks/${id}`);
        return response.data;
    },

    // Create a new task
    createTask: async (task: CreateTaskDTO) => {
        const response = await api.post<Task>('/tasks', task);
        return response.data;
    },

    // Update a task
    updateTask: async (id: number, task: UpdateTaskDTO) => {
        const response = await api.put<Task>(`/tasks/${id}`, task);
        return response.data;
    },

    // Delete a task (move to trash)
    deleteTask: async (id: number) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    },

    // Restore task from trash
    restoreTask: async (id: number) => {
        const response = await api.post(`/tasks/${id}/restore`);
        return response.data;
    },

    // Permanently delete task
    permanentDeleteTask: async (id: number) => {
        const response = await api.delete(`/tasks/${id}/permanent`);
        return response.data;
    },

    // Toggle task completion
    toggleTask: async (id: number) => {
        const response = await api.patch<Task>(`/tasks/${id}/toggle`);
        return response.data;
    },

    // Get categories
    getCategories: async () => {
        const response = await api.get<string[]>('/tasks/categories');
        return response.data;
    },

    // Get statistics
    getStats: async () => {
        const response = await api.get('/tasks/stats');
        return response.data;
    },
};