import Product from "../models/Product.js";

const IncreaseProductInventory = async (productId: string, quantity: number) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        product.quantityCurrent += quantity;
        await product.save();
    } catch (error) {
        throw new Error('Error increasing product inventory');
    }
};

export default IncreaseProductInventory;