import express from 'express';
import jwt from 'jsonwebtoken';
import { validateUsername, validatePassword } from '../validators/validator.js';
import { createUser, findUserByUsername } from '../database/queries.js';

const router = express.Router();

// User registration endpoint
router.post('/register', (req, res) => {
    const db = req.app.locals.db;
    console.log('Registering user');
    
    const { username, password } = req.body;

    // Validate username and password
    if (!validateUsername(username)) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long and contain only alphanumeric characters and underscores' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
    }

    // Check if the username already exists
    findUserByUsername(db, username, (err, user) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        if (user) return res.status(400).json({ error: 'Username already exists' });

        // Create user if username is available
        createUser(db, username, password, (err) => {
            if (err) return res.status(500).json({ error: 'Internal Server Error' });
            res.status(201).json({ message: 'User registered successfully' });
        });
    });
});

// User login endpoint
router.post('/login', (req, res) => {
    const db = req.app.locals.db;
    const { username, password } = req.body;
    findUserByUsername(db, username, (err, user) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        if (user.password!= password) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1m' });
        res.json({ token });
    });
});

export default router;
