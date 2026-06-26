import { Request, Response } from 'express';
import pool from '../config/database';
import { CreateTaskDTO, UpdateTaskDTO } from '../models/Task';

interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        username: string;
    };
}

export const taskController = {
    // Get all tasks with filters, search, and sorting
    async getAllTasks(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const {
                filter,
                search,
                category,
                priority,
                dueDate,
                sortBy,
                sortOrder
            } = req.query;

            // Base query for non-trash tasks
            let query = 'SELECT * FROM tasks WHERE user_id = $1 AND deleted_at IS NULL';
            const params: any[] = [userId];
            let paramCount = 2;

            // Handle trash filter separately
            if (filter === 'trash') {
                query = 'SELECT * FROM tasks WHERE user_id = $1 AND deleted_at IS NOT NULL';
            } else {
                // Status filters for non-trash
                if (filter === 'completed') {
                    query += ' AND is_completed = true';
                } else if (filter === 'active') {
                    query += ' AND is_completed = false';
                }
            }

            // Search by title (works for all filters)
            if (search) {
                query += ` AND title ILIKE $${paramCount}`;
                params.push(`%${search}%`);
                paramCount++;
            }

            // Filter by category (only if not 'all' and not trash)
            if (category && category !== 'all' && filter !== 'trash') {
                query += ` AND category = $${paramCount}`;
                params.push(category);
                paramCount++;
            }

            // Filter by priority (only if not 'all' and not trash)
            if (priority && priority !== 'all' && filter !== 'trash') {
                query += ` AND priority = $${paramCount}`;
                params.push(priority);
                paramCount++;
            }

            // Filter by due date (only for non-trash)
            if (dueDate && filter !== 'trash') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dueDate === 'today') {
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    query += ` AND due_date >= $${paramCount} AND due_date < $${paramCount + 1}`;
                    params.push(today, tomorrow);
                    paramCount += 2;
                } else if (dueDate === 'overdue') {
                    query += ` AND due_date < $${paramCount} AND is_completed = false`;
                    params.push(today);
                    paramCount++;
                } else if (dueDate === 'this-week') {
                    const endOfWeek = new Date(today);
                    endOfWeek.setDate(endOfWeek.getDate() + 7);
                    query += ` AND due_date >= $${paramCount} AND due_date < $${paramCount + 1}`;
                    params.push(today, endOfWeek);
                    paramCount += 2;
                }
            }

            // ✅ FIXED: Clean sorting logic
            if (filter === 'trash') {
                query += ' ORDER BY deleted_at DESC';
            } else if (sortBy) {
                // Map sortBy to actual column names
                let sortField: string;
                switch (sortBy) {
                    case 'newest':
                        sortField = 'created_at';
                        break;
                    case 'oldest':
                        sortField = 'created_at';
                        break;
                    case 'priority':
                        sortField = "CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END";
                        break;
                    case 'due-date':
                        sortField = 'due_date';
                        break;
                    default:
                        sortField = 'created_at';
                }

                // Determine order
                const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
                
                // For 'newest', default is DESC, for 'oldest' default is ASC
                let finalOrder = order;
                if (sortBy === 'newest' && !sortOrder) {
                    finalOrder = 'DESC';
                } else if (sortBy === 'oldest' && !sortOrder) {
                    finalOrder = 'ASC';
                }

                query += ` ORDER BY ${sortField} ${finalOrder}`;
            } else {
                // Default: newest first
                query += ' ORDER BY created_at DESC';
            }

            console.log('Executing query:', query); // Debug log
            console.log('With params:', params); // Debug log

            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error in getAllTasks:', error);
            res.status(500).json({ 
                error: 'Failed to fetch tasks',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
     async getTaskById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const result = await pool.query(
                'SELECT * FROM tasks WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
                [id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch task' });
        }
    },

    // Create a new task
    async createTask(req: AuthRequest, res: Response) {
        try {
            const { title, description, priority, due_date, category }: CreateTaskDTO = req.body;
            const userId = req.user?.id;

            if (!title) {
                return res.status(400).json({ error: 'Title is required' });
            }

            const query = `
                INSERT INTO tasks (title, description, priority, due_date, category, user_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;

            const result = await pool.query(query, [
                title,
                description || null,
                priority || 'medium',
                due_date || null,
                category || null,
                userId
            ]);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create task' });
        }
    },

    // Full update a task
    async updateTask(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const { title, description, is_completed, priority, due_date, category }: UpdateTaskDTO = req.body;

            // Check if task exists and belongs to user
            const checkResult = await pool.query(
                'SELECT * FROM tasks WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
                [id, userId]
            );

            if (checkResult.rows.length === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            // Build dynamic update query
            const updates: string[] = [];
            const values: any[] = [];
            let paramCount = 1;

            if (title !== undefined) {
                updates.push(`title = $${paramCount++}`);
                values.push(title);
            }
            if (description !== undefined) {
                updates.push(`description = $${paramCount++}`);
                values.push(description);
            }
            if (is_completed !== undefined) {
                updates.push(`is_completed = $${paramCount++}`);
                values.push(is_completed);
            }
            if (priority !== undefined) {
                updates.push(`priority = $${paramCount++}`);
                values.push(priority);
            }
            if (due_date !== undefined) {
                updates.push(`due_date = $${paramCount++}`);
                values.push(due_date);
            }
            if (category !== undefined) {
                updates.push(`category = $${paramCount++}`);
                values.push(category);
            }

            updates.push(`updated_at = CURRENT_TIMESTAMP, updated_by = $${paramCount++}`);
            values.push(userId);
            values.push(id);

            const query = `
                UPDATE tasks 
                SET ${updates.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;

            const result = await pool.query(query, values);
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update task' });
        }
    },

    // Soft delete task (move to trash)
    async deleteTask(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const result = await pool.query(
                `UPDATE tasks 
                 SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
                 RETURNING *`,
                [id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            res.json({ message: 'Task moved to trash', task: result.rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete task' });
        }
    },

    // Restore task from trash
    async restoreTask(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const result = await pool.query(
                `UPDATE tasks 
                 SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL
                 RETURNING *`,
                [id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Task not found in trash' });
            }

            res.json({ message: 'Task restored', task: result.rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to restore task' });
        }
    },

    // Permanently delete task
    async permanentDeleteTask(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const result = await pool.query(
                'DELETE FROM tasks WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL RETURNING *',
                [id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Task not found in trash' });
            }

            res.json({ message: 'Task permanently deleted', task: result.rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to permanently delete task' });
        }
    },

    // Toggle task completion
    async toggleTaskStatus(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const result = await pool.query(
                `UPDATE tasks 
                 SET is_completed = NOT is_completed, 
                     updated_at = CURRENT_TIMESTAMP,
                     updated_by = $2
                 WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
                 RETURNING *`,
                [id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to toggle task status' });
        }
    },

    // Get unique categories for filter
    async getCategories(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const result = await pool.query(
                'SELECT DISTINCT category FROM tasks WHERE user_id = $1 AND deleted_at IS NULL AND category IS NOT NULL',
                [userId]
            );
            res.json(result.rows.map(row => row.category));
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    },

    // Get task statistics
    async getStats(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const result = await pool.query(
                `SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN is_completed = false AND deleted_at IS NULL THEN 1 END) as active,
                    COUNT(CASE WHEN is_completed = true AND deleted_at IS NULL THEN 1 END) as completed,
                    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as in_trash
                 FROM tasks 
                 WHERE user_id = $1`,
                [userId]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        }
    }

   
};

    // Get a single task
   