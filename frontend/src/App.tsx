import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import { taskApi } from './services/api';
import { Task, FilterOptions } from './types/Task';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskFilter from './components/TaskFilter';
import TaskEditModal from './components/TaskEditModal';
import Auth from './components/Auth';
import './App.css';

const App: React.FC = () => {
    // ✅ This must be inside AuthProvider
    const { user, logout, isLoading } = useAuth();
    
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, in_trash: 0 });
    const [loading, setLoading] = useState(true);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<FilterOptions>({
        filter: 'all',
        search: '',
        category: 'all',
        priority: 'all',
        dueDate: 'all',
        sortBy: 'newest',
        sortOrder: 'desc',
    });

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            const data = await taskApi.getTasks(filters);
            setTasks(data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const loadCategories = async () => {
        try {
            const data = await taskApi.getCategories();
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadStats = async () => {
        try {
            const data = await taskApi.getStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) {
            loadTasks();
            loadCategories();
            loadStats();
        }
    }, [user, loadTasks]);

    const handleCreateTask = async (taskData: any) => {
        try {
            const newTask = await taskApi.createTask(taskData);
            setTasks([newTask, ...tasks]);
            await loadStats();
            toast.success('Task created successfully!');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to create task');
        }
    };

    const handleToggleTask = async (id: number) => {
        try {
            const updatedTask = await taskApi.toggleTask(id);
            setTasks(tasks.map(task => task.id === id ? updatedTask : task));
            await loadStats();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to toggle task');
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (window.confirm('Move this task to trash?')) {
            try {
                await taskApi.deleteTask(id);
                setTasks(tasks.filter(task => task.id !== id));
                await loadStats();
                toast.info('Task moved to trash');
            } catch (err: any) {
                console.error(err);
                toast.error(err.response?.data?.error || 'Failed to delete task');
            }
        }
    };

    const handleRestoreTask = async (id: number) => {
        try {
            await taskApi.restoreTask(id);
            setTasks(tasks.filter(task => task.id !== id));
            await loadStats();
            toast.success('Task restored!');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to restore task');
        }
    };

    const handlePermanentDelete = async (id: number) => {
        if (window.confirm('Permanently delete this task? This cannot be undone!')) {
            try {
                await taskApi.permanentDeleteTask(id);
                setTasks(tasks.filter(task => task.id !== id));
                await loadStats();
                toast.success('Task permanently deleted');
            } catch (err: any) {
                console.error(err);
                toast.error(err.response?.data?.error || 'Failed to delete task');
            }
        }
    };

    const handleUpdateTask = async (id: number, updates: any) => {
        try {
            const updatedTask = await taskApi.updateTask(id, updates);
            setTasks(tasks.map(task => task.id === id ? updatedTask : task));
            await loadStats();
            toast.success('Task updated successfully!');
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to update task');
        }
    };

    const handleEditClick = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const updateFilter = (key: keyof FilterOptions, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Show loading state
    if (isLoading) {
        return <div className="loading-screen">Loading...</div>;
    }

    // Show auth screen if not logged in
    if (!user) {
        return <Auth />;
    }

    const isTrash = filters.filter === 'trash';

    return (
        <div className="App">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="todo-container">
                <div className="app-header">
                    <h1>📝 Todo List</h1>
                    <div className="user-info">
                        <span>👤 {user?.username}</span>
                        <button onClick={logout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>

                {!isTrash && <TaskForm onSubmit={handleCreateTask} />}

                <TaskFilter
                    currentFilter={filters.filter}
                    onFilterChange={(filter) => updateFilter('filter', filter)}
                    searchTerm={filters.search}
                    onSearchChange={(search) => updateFilter('search', search)}
                    selectedCategory={filters.category}
                    onCategoryChange={(category) => updateFilter('category', category)}
                    selectedPriority={filters.priority}
                    onPriorityChange={(priority) => updateFilter('priority', priority)}
                    dueDateFilter={filters.dueDate}
                    onDueDateFilterChange={(dueDate) => updateFilter('dueDate', dueDate)}
                    sortBy={filters.sortBy}
                    onSortChange={(sortBy) => updateFilter('sortBy', sortBy)}
                    sortOrder={filters.sortOrder}
                    onSortOrderChange={(sortOrder) => updateFilter('sortOrder', sortOrder)}
                    categories={categories}
                    stats={stats}
                    isTrash={isTrash}
                />

                {loading && <div className="loading">Loading tasks...</div>}

                {!loading && (
                    <TaskList
                        tasks={tasks}
                        onToggle={handleToggleTask}
                        onDelete={handleDeleteTask}
                        onRestore={handleRestoreTask}
                        onPermanentDelete={handlePermanentDelete}
                        onEdit={handleEditClick}
                        isTrash={isTrash}
                    />
                )}
            </div>

            <TaskEditModal
                task={editingTask}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleUpdateTask}
            />
        </div>
    );
};

export default App;