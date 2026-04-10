import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
    businessName: { type: String, required: true },

    // NEW: Legal Certification / GST Number
    gstNumber: {
        type: String,
        required: [true, 'GST Number is required'],
        uppercase: true, // Automatically converts "abcd" to "ABCD"
        trim: true,
        match: [
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            'Invalid GST Number Format. Please enter a valid 15-character GSTIN.'
        ]
    },
    mobile: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits.']
    },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { // (If you have a pincode field in your schema, add this!)
        type: String,
        required: true,
        match: [/^[1-9][0-9]{5}$/, 'Pincode must be exactly 6 digits and cannot start with 0.']
    },
    acceptedItems: [{ type: String }],
    otherItemDetails: { type: String },
    acceptedDamage: { type: [String], required: true },

    // Auth & Admin Fields
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },

    // NEW: Admin Control
    isBlocked: { type: Boolean, default: false },

    warningCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Partner', partnerSchema);