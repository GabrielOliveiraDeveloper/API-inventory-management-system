import Product from "../../models/Product.js";
import {type Request, type Response} from "express";
import mongoose from "mongoose";

interface ProductRequest {
    name: string;
    sku: string;
    description: string;
    category: string;
    costPrice: number;
    salePrice: number;
    quantityCurrent: number;
    quantityMin: number;
}

const CreateProduct = async (req: Request, res: Response) => {
    const { name, sku, description, category, costPrice, salePrice, quantityCurrent, quantityMin } = req.body;

    try {
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
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const category = req.query.category as string;

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
    const { id } = req.params; 
    const updateData = req.body;

    try {

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


export { CreateProduct, GetProducts, UpdateProduct };