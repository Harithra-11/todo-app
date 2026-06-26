import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

// GET /api/tasks - Get all tasks with filters
router.get('/', taskController.getAllTasks);

// GET /api/tasks/categories - Get unique categories
router.get('/categories', taskController.getCategories);

// GET /api/tasks/stats - Get task statistics
router.get('/stats', taskController.getStats);

// GET /api/tasks/:id - Get a single task
router.get('/:id', taskController.getTaskById);

// POST /api/tasks - Create a new task
router.post('/', taskController.createTask);

// PUT /api/tasks/:id - Full update a task
router.put('/:id', taskController.updateTask);

// DELETE /api/tasks/:id - Soft delete (move to trash)
router.delete('/:id', taskController.deleteTask);

// POST /api/tasks/:id/restore - Restore from trash
router.post('/:id/restore', taskController.restoreTask);

// DELETE /api/tasks/:id/permanent - Permanently delete
router.delete('/:id/permanent', taskController.permanentDeleteTask);

// PATCH /api/tasks/:id/toggle - Toggle completion
router.patch('/:id/toggle', taskController.toggleTaskStatus);

export default router;