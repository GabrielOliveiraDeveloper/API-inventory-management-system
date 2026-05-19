import mongoose from 'mongoose';

const movementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['in', 'out'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Movement = mongoose.model('Movement', movementSchema);

export default Movement;