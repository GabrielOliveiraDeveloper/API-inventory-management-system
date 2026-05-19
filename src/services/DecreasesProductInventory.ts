import Product from "../models/Product.js";
import EmailSender from "./EmailSender.js";

const DecreasesProductInventory = async (productId: string, quantity: number) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    if (product.quantityCurrent < quantity) {
        throw new Error('Insufficient stock to decrease');
    }

    if(product.quantityCurrent - quantity < product.quantityMin) {
        await EmailSender(
            process.env.ADMIN_EMAIL || '',
            `Stock Alert: ${product.name} is below minimum threshold`,
            `The current stock of ${product.name} (SKU: ${product.sku}) is ${product.quantityCurrent - quantity}, which is below the minimum threshold of ${product.quantityMin}. Please restock soon.`
        )

        throw new Error('Stock is below minimum threshold after decrease. Alert email sent to admin.');
    }

    product.quantityCurrent -= quantity;
    await product.save();

    return product;
};

export default DecreasesProductInventory;