import Movement from "../../models/Movement.js";
import Product from "../../models/Product.js";
import User from "../../models/User.js";

import { type Request, type Response } from "express";

const RegisterMovement = async (req: Request, res: Response) => {
    const { type, quantity, product } = req.body;
    const userId = req.params.userId;

    try {
        const productDoc = await Product.findById(product);
        if (!productDoc) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (type === 'out' && productDoc.quantityCurrent < quantity) {
            return res.status(400).json({ message: 'Insufficient stock for this movement' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        } 

        const movement = new Movement({
            type,
            quantity,
            product,
            user: userId
        });

        await movement.save();

        res.status(201).json({ message: 'Movement registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering movement', error });
    }
}
