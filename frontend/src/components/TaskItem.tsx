import React, { useState } from 'react';
import { Task } from '../types/Task';
import { toast } from 'react-toastify';

interface TaskItemProps {
    task: Task;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
    onRestore?: (id: number) => void;
    onPermanentDelete?: (id: number) => void;
    onEdit: (task: Task) => void;
    isTrash?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
    task,
    onToggle,
    onDelete,
    onRestore,
    onPermanentDelete,
    onEdit,
    isTrash = false,
}) => {
    const [showUndo, setShowUndo] = useState(false);

    const handleToggle = async () => {
        await onToggle(task.id);
        if (!task.is_completed) {
            setShowUndo(true);
            toast.success('Task completed!', {
                position: 'top-right',
                autoClose: 3000,
            });
            setTimeout(() => setShowUndo(false), 5000);
        }
    };

    const priorityColors = {
        low: 'priority-low',
        medium: 'priority-medium',
        high: 'priority-high',
    };

    const formatDate = (date?: string) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className={`task-item ${task.is_completed ? 'completed' : ''}`}>
            {!isTrash && (
                <div className="task-checkbox">
                    <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={handleToggle}
                    />
                </div>
            )}

            <div className="task-content">
                <span className="task-title">{task.title}</span>
                {task.description && (
                    <span className="task-description">{task.description}</span>
                )}
                <div className="task-meta">
                    <span className={`priority-badge ${priorityColors[task.priority]}`}>
                        {task.priority}
                    </span>
                    {task.category && (
                        <span className="category-badge">{task.category}</span>
                    )}
                    {task.due_date && (
                        <span className="due-date">📅 {formatDate(task.due_date)}</span>
                    )}
                    {isTrash && task.deleted_at && (
                        <span className="deleted-date">
                            🗑️ Deleted: {formatDate(task.deleted_at)}
                        </span>
                    )}
                    {task.is_completed && !isTrash && (
                        <span className="completed-badge">✓ Done</span>
                    )}
                </div>
            </div>

            <div className="task-actions">
                {!isTrash ? (
                    <>
                        <button
                            className="btn-edit"
                            onClick={() => onEdit(task)}
                            title="Edit task"
                        >
                            ✏️
                        </button>
                        <button
                            className="btn-delete"
                            onClick={() => onDelete(task.id)}
                            title="Move to trash"
                        >
                            🗑️
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="btn-restore"
                            onClick={() => onRestore?.(task.id)}
                            title="Restore task"
                        >
                            ↩️
                        </button>
                        <button
                            className="btn-permanent-delete"
                            onClick={() => onPermanentDelete?.(task.id)}
                            title="Permanently delete"
                        >
                            💀
                        </button>
                    </>
                )}
            </div>

            {showUndo && (
                <div className="undo-toast">
                    <button onClick={handleToggle}>↩️ Undo</button>
                </div>
            )}
        </div>
    );
};

export default TaskItem;