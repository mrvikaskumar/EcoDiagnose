import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    // User Details
    userName: { type: String, required: true },
    userMobile: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits.']
    },
    userEmail: { type: String, required: true }, // NEW: So we can email them the tracker ID
    userAddress: { type: String, required: true },

    // Tracking Details
    trackerId: { type: String, required: true, unique: true }, // NEW: The ECO-123456 ID

    // AI Analysis Details
    product: { type: String, required: true },
    condition: { type: String, required: true },
    score: { type: Number, required: true },

    // Status tracking
    status: { type: String, default: 'Pending' }, // Pending -> Claimed -> Completed
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', default: null }
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);