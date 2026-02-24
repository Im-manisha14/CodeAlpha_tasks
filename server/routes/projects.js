const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// @route   GET api/projects
// @desc    Get all projects for the logged in user
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT p.* FROM projects p 
             JOIN project_members pm ON p.id = pm.project_id 
             WHERE pm.user_id = ?`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST api/projects
// @desc    Create a project
router.post('/', auth, async (req, res) => {
    const { name, description } = req.body;

    try {
        const [result] = await db.execute(
            'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
            [name, description, req.user.id]
        );

        const projectId = result.insertId;

        // Add owner as a member
        await db.execute(
            'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
            [projectId, req.user.id, 'Owner']
        );

        res.json({ id: projectId, name, description, owner_id: req.user.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
