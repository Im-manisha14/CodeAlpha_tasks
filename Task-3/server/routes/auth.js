const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// @route   POST api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check for existing email
        const [emailRows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (emailRows.length > 0) {
            return res.status(400).json({ message: 'Email already registered. Please sign in instead.' });
        }

        // Check for existing username
        const [userRows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (userRows.length > 0) {
            return res.status(400).json({ message: 'Username is already taken. Please choose another.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: result.insertId, username, email } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
