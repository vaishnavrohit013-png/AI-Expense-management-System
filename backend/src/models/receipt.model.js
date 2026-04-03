import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null
    },
    imageUrl: {
        type: String,
        required: true
    },
    merchant: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        default: 'Other'
    },
    status: {
        type: String,
        enum: ['Extracted', 'Saved', 'Review Required'],
        default: 'Extracted'
    },
    rawAiData: {
        type: Object,
        default: {}
    },
    metadata: {
        currency: { type: String, default: 'INR' },
        tax: { type: Number, default: 0 },
        paymentMethod: { type: String, trim: true }
    }
}, {
    timestamps: true
});

// Index for faster searching by user and date
receiptSchema.index({ user: 1, date: -1 });

const Receipt = mongoose.model('Receipt', receiptSchema);

export default Receipt;
