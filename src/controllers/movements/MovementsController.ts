import Movement from "../../models/Movement.js";
import Product from "../../models/Product.js";
import User from "../../models/User.js";
import DecreasesProductInventory from "../../services/DecreasesProductInventory.js";
import IncreaseProductInventory from "../../services/IncreaseProductInventory.js";
import { type Request, type Response } from "express";

const RegisterMovement = async (req: Request, res: Response) => {
    const { type, quantity, product } = req.body;
    const userId = req.params.userId;

    if (!['in', 'out'].includes(type)) {
        return res.status(400).json({ message: 'Invalid movement type' });
    }

    try {
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (type === 'in') {
            await IncreaseProductInventory(product, quantity);
        } else if (type === 'out') {
            await DecreasesProductInventory(product, quantity);
        } 

        const movement = new Movement({
            type,
            quantity,
            product,
            user: userId
        });

        await movement.save();

        return res.status(201).json({ message: 'Movement registered successfully' });
    } catch (error: any) {
        if (error.message === 'Insufficient stock to decrease') {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({ message: 'Error registering movement', error: error.message });
    }
}

const GetMovements = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const type = req.query.type as string;
        const product = req.query.product as string;
        const user = req.query.user as string;

        const query: any = {};

        if (type) {
            query.type = type;
        }

        if (product) {
            query.product = product;
        }

        if (user) {
            query.user = user;
        }

        const skip = (page - 1) * limit;

        const [movements, totalMovements] = await Promise.all([
            Movement.find(query)
                .populate('product')
                .populate('user', '-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Movement.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalMovements / limit);

        res.status(200).json({
            message: 'Movements retrieved successfully',
            pagination: {
                totalItems: totalMovements,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            movements
        });

    } catch (error: any) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message || error 
        });
    }
};

export { RegisterMovement, GetMovements };