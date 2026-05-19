import Product from "../../models/Product.js";

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

const ProductsController = async (req: {body: ProductRequest }, res: any) => {
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



export { ProductsController };