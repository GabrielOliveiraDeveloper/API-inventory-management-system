import User from '../../models/User.js';
import jsonwebtoken from 'jsonwebtoken';
import { type Request, type Response } from 'express';
import { z } from 'zod';

const LoginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1)
    })
});

interface UserDocument {
    _id: string;
    email: string;
    password: string;
    username: string;
    role: 'admin' | 'employee';
    comparePassword(password: string): Promise<boolean>;
}

const LoginController = async (req: Request, res: Response) => {
    try {
        const parsed = LoginSchema.safeParse({ body: req.body });
        if (!parsed.success) {
            return res.status(400).json({ message: 'Validation error', errors: parsed.error });
        }

        const { email, password } = parsed.data.body;

        const user = await User.findOne({ email }) as UserDocument | null;
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jsonwebtoken.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', user, token });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export default LoginController;