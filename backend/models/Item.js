import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    confidenceScore: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending Pickup'
    },
    scannedAt: {
        type: Date,
        default: Date.now
    }
});

const Item = mongoose.model('Item', itemSchema);

// This is the crucial line that fixes your exact error!
export default Item;