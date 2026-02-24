const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// @route   GET api/tasks/:projectId
// @desc    Get all tasks for a project
router.get('/:projectId', auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC',
            [req.params.projectId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST api/tasks
// @desc    Create a task
router.post('/', auth, async (req, res) => {
    const { project_id, title, description, status, assignee_id, deadline } = req.body;

    try {
        const [result] = await db.execute(
            'INSERT INTO tasks (project_id, title, description, status, assignee_id, deadline) VALUES (?, ?, ?, ?, ?, ?)',
            [project_id, title, description, status || 'Todo', assignee_id, deadline]
        );

        const newTask = { id: result.insertId, project_id, title, description, status: status || 'Todo', assignee_id, deadline };

        // Emit real-time update
        req.io.to(`project-${project_id}`).emit('task-created', newTask);

        res.json(newTask);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/tasks/:taskId
// @desc    Update task status
router.put('/:taskId', auth, async (req, res) => {
    const { status } = req.body;

    try {
        const [rows] = await db.execute('SELECT project_id FROM tasks WHERE id = ?', [req.params.taskId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Task not found' });

        const projectId = rows[0].project_id;

        await db.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.taskId]);

        // Emit real-time update
        req.io.to(`project-${projectId}`).emit('task-updated', { id: req.params.taskId, status });

        res.json({ id: req.params.taskId, status });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
