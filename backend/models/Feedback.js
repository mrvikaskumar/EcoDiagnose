import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userType: { type: String, required: true },

    // Is this general feedback or a complaint?
    type: { type: String, enum: ['Feedback', 'Complaint'], default: 'Feedback' },

    // The tracking ID to catch the bad partner
    relatedTrackerId: { type: String },

    rating: { type: Number, required: true },
    message: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);