import Movement from "../../models/Movement.js";
import Product from "../../models/Product.js";
import User from "../../models/User.js";
import DecreasesProductInventory from "../../services/DecreasesProductInventory.js";
import IncreaseProductInventory from "../../services/IncreaseProductInventory.js";
import { type Response } from "express";
import { type CustomRequest } from "../../middlewares/AuthMiddleware.js";
import { z } from "zod";

const RegisterMovementSchema = z.object({
    params: z.object({
        userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID format")
    }),
    body: z.object({
        type: z.enum(['in', 'out']),
        quantity: z.number().int().positive(),
        product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID format")
    })
});

const GetMovementsSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
        type: z.enum(['in', 'out']).optional(),
        product: z.string().optional(),
        user: z.string().optional()
    })
});

const RegisterMovement = async (req: CustomRequest, res: Response) => {
    try {
        const parsed = RegisterMovementSchema.safeParse({ params: req.params, body: req.body });
        if (!parsed.success) {
            return res.status(400).json({ message: 'Validation error', errors: parsed.error });
        }

        const { userId } = parsed.data.params;
        const { type, quantity, product } = parsed.data.body;

        if (type === 'in' && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Only admins can add stock' });
        }

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

const GetMovements = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const parsed = GetMovementsSchema.safeParse({ query: req.query });
        if (!parsed.success) {
            res.status(400).json({ message: 'Validation error', errors: parsed.error });
            return;
        }

        const { page, limit, type, product, user } = parsed.data.query;
        const query: any = {};

        if (type) query.type = type;
        if (product) query.product = product;
        if (user) query.user = user;

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