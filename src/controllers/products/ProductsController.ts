import Product from "../../models/Product.js";
import { type Request, type Response } from "express";
import { z } from "zod";

const MongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Mongo ID format");

const CreateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        sku: z.string().min(1),
        description: z.string().default(""),
        category: z.string().min(1),
        costPrice: z.number().positive(),
        salePrice: z.number().positive(),
        quantityCurrent: z.number().int().nonnegative(),
        quantityMin: z.number().int().nonnegative()
    })
});

const GetProductsSchema = z.object({
    query: z.object({
        page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
        search: z.string().optional(),
        category: z.string().optional()
    })
});

const UpdateProductSchema = z.object({
    params: z.object({ id: MongoIdSchema }),
    body: z.object({
        name: z.string().min(1).optional(),
        sku: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().min(1).optional(),
        costPrice: z.number().positive().optional(),
        salePrice: z.number().positive().optional(),
        quantityCurrent: z.number().int().nonnegative().optional(),
        quantityMin: z.number().int().nonnegative().optional()
    })
});

const DeleteProductSchema = z.object({
    params: z.object({ id: MongoIdSchema })
});

const CreateProduct = async (req: Request, res: Response) => {
    try {
        const parsed = CreateProductSchema.safeParse({ body: req.body });
        if (!parsed.success) {
            return res.status(400).json({ message: 'Validation error', errors: parsed.error });
        }

        const { name, sku, description, category, costPrice, salePrice, quantityCurrent, quantityMin } = parsed.data.body;

        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) {
            return res.status(400).json({ message: 'SKU already in use' });
        }

        const newProduct = new Product({ name, sku, description, category, costPrice, salePrice, quantityCurrent, quantityMin });
        await newProduct.save();

        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

const GetProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = GetProductsSchema.safeParse({ query: req.query });
        if (!parsed.success) {
            res.status(400).json({ message: 'Validation error', errors: parsed.error });
            return;
        }

        const { page, limit, search, category } = parsed.data.query;
        const query: any = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        const skip = (page - 1) * limit;

        const [products, totalProducts] = await Promise.all([
            Product.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            message: 'Products retrieved successfully',
            pagination: {
                totalItems: totalProducts,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            products
        });
    } catch (error: any) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message || error 
        });
    }
};

const UpdateProduct = async (req: Request, res: Response) => {
    try {
        const parsed = UpdateProductSchema.safeParse({ params: req.params, body: req.body });
        if (!parsed.success) {
            return res.status(400).json({ message: 'Validation error', errors: parsed.error });
        }

        const { id } = parsed.data.params;
        const updateData = parsed.data.body;

        const productToUpdate = await Product.findById(id);
        if (!productToUpdate) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const checks = [];

        if (updateData.sku && updateData.sku.toUpperCase() !== productToUpdate.sku) {
            checks.push(
                Product.findOne({ sku: updateData.sku.trim().toUpperCase() }).then(p => {
                    if (p) throw new Error('SKU already in use by another product');
                })
            );
        }

        if (updateData.name && updateData.name !== productToUpdate.name) {
            checks.push(
                Product.findOne({ name: updateData.name }).then(p => {
                    if (p) throw new Error('Product name already in use');
                })
            );
        }

        if (checks.length > 0) {
            try {
                await Promise.all(checks);
            } catch (err: any) {
                return res.status(400).json({ message: err.message });
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error: any) {
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message || error 
        });
    }
};

const RemoveProduct = async (req: Request, res: Response) => {
    try {
        const parsed = DeleteProductSchema.safeParse({ params: req.params });
        if (!parsed.success) {
            return res.status(400).json({ message: 'Validation error', errors: parsed.error });
        }

        const { id } = parsed.data.params;

        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export { CreateProduct, GetProducts, UpdateProduct, RemoveProduct };