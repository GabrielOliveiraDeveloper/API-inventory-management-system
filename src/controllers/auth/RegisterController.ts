import User from '../../models/User.js';
import { type Request, type Response } from 'express';
import { z } from 'zod';

const RegisterSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(30),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(['admin', 'employee']).optional()
    })
});

const RegisterController = async (req: Request, res: Response) => {
    try {
        const parsed = RegisterSchema.safeParse({ body: req.body });
        if (!parsed.success) {
            return res.status(400).json({ message: 'Validation error', errors: parsed.error });
        }

        const { username, email, password, role } = parsed.data.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const newUser = new User({ username, email, password, role });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export default RegisterController;