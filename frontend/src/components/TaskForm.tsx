import React, { useState } from 'react';
import { CreateTaskDTO } from '../types/Task';

interface TaskFormProps {
    onSubmit: (task: CreateTaskDTO) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [category, setCategory] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            category: category.trim() || undefined,
            due_date: dueDate || undefined,
        });

        // Reset form
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategory('');
        setDueDate('');
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="form-input"
                    required
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <select 
                        value={priority} 
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="form-select"
                    >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Category (optional)"
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="form-input"
                    />
                </div>
                <button type="submit" className="btn-add">Add Task</button>
            </div>
        </form>
    );
};

export default TaskForm;