const { getConnection } = require('../Config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        let db = getConnection();

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email, and password'
            });
        }

        const [existingUser] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email.toLowerCase(), hashedPassword]
        );
        const token = jwt.sign(
            {
                userId: result.insertId,
                email: email.toLowerCase()
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: result.insertId,
                    username,
                    email: email.toLowerCase()
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

// Login function
const login = async (req, res) => {
    try {
        let db = getConnection();
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const [results] = await db.execute(
            'SELECT id, username, email, password FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        const user = results[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email is invalid'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password is invalid'
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET || 'defaultsecret',
            { expiresIn: '24h' }
        );

        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

//search function
const searchUsers = async (req, res) => {
    try {
        let db = getConnection();
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a search query'
            });
        }

        const keyword = `%${search.toLowerCase()}%`;

        const [results] = await db.execute(
            `SELECT id, username, email FROM users 
             WHERE LOWER(username) LIKE ? OR LOWER(email) LIKE ?`,
            [keyword, keyword]
        );

        return res.status(200).json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during user search'
        });
    }
};


module.exports = {
    register,
    login,
    searchUsers
};