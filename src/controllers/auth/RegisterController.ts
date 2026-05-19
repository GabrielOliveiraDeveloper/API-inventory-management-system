import User from '../../models/User.js';

interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'employee';
}

const RegisterController = async (req: { body: RegisterRequest }, res: any) => {

    const { username, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const newUser = new User({ username, email, password, role });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    }   catch (error) {

        res.status(500).json({ message: 'Server error', error });
    }

}

export default RegisterController;