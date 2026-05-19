import Product from "../models/Product.js";

const DecreasesProductInventory = async (productId: string, quantity: number) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (product.quantityCurrent < quantity) {
            throw new Error('Insufficient stock to decrease');
        }

        product.quantityCurrent -= quantity;
        await product.save();
    }
    catch (error) {
        throw new Error('Error decreasing product inventory');
    }
};

export default DecreasesProductInventory;