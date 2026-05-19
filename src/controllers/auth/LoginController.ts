import User from '../../models/User.js';
import jsonwebtoken from 'jsonwebtoken';

interface UserDocument {
    _id: string;
    email: string;
    password: string;
    username: string;
    role: 'admin' | 'employee';
    comparePassword(password: string): Promise<boolean>;
}

interface LoginRequest {
    email: string;
    password: string;
}

const LoginController = async (req: { body: LoginRequest }, res: any) => {
    const { email, password } = req.body;

    try {
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