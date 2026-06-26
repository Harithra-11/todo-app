import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { RegisterDTO, LoginDTO } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const authController = {
    // Register new user
    async register(req: Request, res: Response) {
        try {
            const { username, email, password }: RegisterDTO = req.body;

            // Validation
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }

            // Check if user exists
            const userExists = await pool.query(
                'SELECT * FROM users WHERE email = $1 OR username = $2',
                [email, username]
            );

            if (userExists.rows.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Create user
            const result = await pool.query(
                `INSERT INTO users (username, email, password_hash)
                 VALUES ($1, $2, $3)
                 RETURNING id, username, email, created_at`,
                [username, email, passwordHash]
            );

            const newUser = result.rows[0];

            // ✅ FIX: Using 'as any' to bypass TypeScript overload issue
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email, username: newUser.username } as any,
                JWT_SECRET as any,
                { expiresIn: JWT_EXPIRES_IN } as any
            );

            res.status(201).json({
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                },
                token,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Registration failed' });
        }
    },

    // Login user
    async login(req: Request, res: Response) {
        try {
            const { email, password }: LoginDTO = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }

            // Find user
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = result.rows[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // ✅ FIX: Using 'as any' to bypass TypeScript overload issue
            const token = jwt.sign(
                { id: user.id, email: user.email, username: user.username } as any,
                JWT_SECRET as any,
                { expiresIn: JWT_EXPIRES_IN } as any
            );

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    // Get current user
    async getCurrentUser(req: Request, res: Response) {
        try {
            // @ts-ignore - user added by middleware
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const result = await pool.query(
                'SELECT id, username, email, created_at FROM users WHERE id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to get user' });
        }
    },
};