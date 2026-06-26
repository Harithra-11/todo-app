export interface Task {
    id: number;
    title: string;
    description?: string;
    is_completed: boolean;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    category?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    user_id: number;
}

export interface CreateTaskDTO {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    due_date?: string;
    category?: string;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    is_completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    due_date?: string;
    category?: string;
}

export type FilterType = 'all' | 'active' | 'completed' | 'trash';
export type SortType = 'newest' | 'oldest' | 'priority' | 'due-date';
export type DueDateFilter = 'today' | 'overdue' | 'this-week' | 'all';

export interface FilterOptions {
    filter: FilterType;
    search: string;
    category: string;
    priority: string;
    dueDate: DueDateFilter;
    sortBy: SortType;
    sortOrder: 'asc' | 'desc';
}