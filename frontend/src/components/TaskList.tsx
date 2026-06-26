import React from 'react';
import { Task } from '../types/Task';
import TaskItem from './TaskItem';

interface TaskListProps {
    tasks: Task[];
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
    onRestore?: (id: number) => void;
    onPermanentDelete?: (id: number) => void;
    onEdit: (task: Task) => void;
    isTrash?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
    tasks,
    onToggle,
    onDelete,
    onRestore,
    onPermanentDelete,
    onEdit,
    isTrash = false,
}) => {
    if (tasks.length === 0) {
        return (
            <div className="empty-state">
                <p>{isTrash ? 'Trash is empty' : 'No tasks found'}</p>
            </div>
        );
    }

    return (
        <div className="task-list">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onPermanentDelete={onPermanentDelete}
                    onEdit={onEdit}
                    isTrash={isTrash}
                />
            ))}
        </div>
    );
};

export default TaskList;