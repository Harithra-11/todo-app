import React from 'react';
import { FilterType, SortType, DueDateFilter } from '../types/Task';

interface TaskFilterProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    selectedPriority: string;
    onPriorityChange: (priority: string) => void;
    dueDateFilter: DueDateFilter;
    onDueDateFilterChange: (filter: DueDateFilter) => void;
    sortBy: SortType;
    onSortChange: (sort: SortType) => void;
    sortOrder: 'asc' | 'desc';
    onSortOrderChange: (order: 'asc' | 'desc') => void;
    categories: string[];
    stats: { total: number; active: number; completed: number; in_trash: number };
    isTrash?: boolean;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
    currentFilter,
    onFilterChange,
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    selectedPriority,
    onPriorityChange,
    dueDateFilter,
    onDueDateFilterChange,
    sortBy,
    onSortChange,
    sortOrder,
    onSortOrderChange,
    categories,
    stats,
    isTrash = false,
}) => {
    const filters: { label: string; value: FilterType }[] = [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Trash', value: 'trash' },
    ];

    const sortOptions: { label: string; value: SortType }[] = [
        { label: 'Newest', value: 'newest' },
        { label: 'Oldest', value: 'oldest' },
        { label: 'Priority', value: 'priority' },
        { label: 'Due Date', value: 'due-date' },
    ];

    const dueDateOptions: { label: string; value: DueDateFilter }[] = [
        { label: 'All', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'This Week', value: 'this-week' },
    ];

    // Removed unused priorityOptions variable

    return (
        <div className="task-filter">
            <div className="filter-top">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="filter-buttons">
                    {filters.map((filter) => (
                        <button
                            key={filter.value}
                            className={`filter-btn ${currentFilter === filter.value ? 'active' : ''}`}
                            onClick={() => onFilterChange(filter.value)}
                        >
                            {filter.label}
                            {filter.value === 'all' && ` (${stats.total})`}
                            {filter.value === 'active' && ` (${stats.active})`}
                            {filter.value === 'completed' && ` (${stats.completed})`}
                            {filter.value === 'trash' && ` (${stats.in_trash})`}
                        </button>
                    ))}
                </div>
            </div>

            {!isTrash && (
                <div className="filter-bottom">
                    <div className="filter-group">
                        <label>Category:</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => onCategoryChange(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Priority:</label>
                        <select
                            value={selectedPriority}
                            onChange={(e) => onPriorityChange(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Due Date:</label>
                        <select
                            value={dueDateFilter}
                            onChange={(e) => onDueDateFilterChange(e.target.value as DueDateFilter)}
                        >
                            {dueDateOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Sort By:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value as SortType)}
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Order:</label>
                        <select
                            value={sortOrder}
                            onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskFilter;