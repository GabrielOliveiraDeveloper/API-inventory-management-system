import Product from "../models/Product.js";

const IncreaseProductInventory = async (productId: string, quantity: number) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    product.quantityCurrent += quantity;
    await product.save();

    return product;
};

export default IncreaseProductInventory;