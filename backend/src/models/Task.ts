export interface Task {
    id?: number;
    title: string;
    description?: string;
    is_completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    due_date?: Date;
    category?: string;
    created_at?: Date;
    updated_at?: Date;
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