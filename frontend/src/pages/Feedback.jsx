import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        userType: 'Everyday User (Recycling a device)',
        type: 'Feedback', // NEW: Default to Feedback
        relatedTrackerId: '', // NEW
        rating: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('https://ecodiagnose-backend.onrender.com/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(formData.type === 'Complaint'
                    ? "Your complaint has been securely submitted. Our Admin team will investigate the partner immediately."
                    : "Thank you! Your feedback has been securely submitted to the EcoDiagnose Admin team.");
                navigate('/');
            } else {
                alert("Failed to submit form.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Server connection failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-2xl">

                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800 font-medium transition mb-8 flex items-center gap-2">
                    ← Back to Home
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12">
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-4">{formData.type === 'Complaint' ? '🚨' : '💬'}</div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                            {formData.type === 'Complaint' ? 'File a Complaint' : 'We Value Your Feedback'}
                        </h1>
                        <p className="text-gray-600">
                            {formData.type === 'Complaint' ? 'Did a partner violate our terms? Let us know so we can take action.' : 'Help us improve the EcoDiagnose platform.'}
                        </p>
                    </div>

                    {/* TOGGLE: Feedback vs Complaint */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'Feedback' })}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${formData.type === 'Feedback' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            💬 General Feedback
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'Complaint' })}
                            className={`flex-1 py-3 rounded-lg font-bold text-sm transition ${formData.type === 'Complaint' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            🚨 File a Complaint
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="text-left space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input type="text" name="name" required onChange={handleChange} value={formData.name} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Your Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                                <select name="userType" onChange={handleChange} value={formData.userType} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 outline-none bg-white">
                                    <option>Everyday User (Recycling a device)</option>
                                    <option>Partner (Repair Shop / Recycler)</option>
                                </select>
                            </div>
                        </div>

                        {/* NEW: Tracker ID (Only shows if Complaint is selected) */}
                        {formData.type === 'Complaint' && (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-fade-in">
                                <label className="block text-sm font-bold text-red-800 mb-2">Related Tracker ID (Optional but recommended)</label>
                                <input type="text" name="relatedTrackerId" onChange={handleChange} value={formData.relatedTrackerId} className="w-full px-4 py-3 rounded-lg border border-red-300 focus:ring-red-500 outline-none uppercase font-mono" placeholder="e.g. ECO-123456" />
                                <p className="text-xs text-red-600 mt-2">Providing this helps us instantly identify and ban the offending partner.</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Experience Rating</label>
                            <select name="rating" required onChange={handleChange} value={formData.rating} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-lg">
                                <option value="">Select a rating...</option>
                                <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                                <option value="4">⭐⭐⭐⭐ - Good</option>
                                <option value="3">⭐⭐⭐ - Average</option>
                                <option value="2">⭐⭐ - Poor</option>
                                <option value="1">⭐ - Terrible</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                            <textarea name="message" required onChange={handleChange} value={formData.message} rows="5" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 outline-none resize-none" placeholder="Tell us what happened..."></textarea>
                        </div>

                        <button type="submit" disabled={isSubmitting} className={`w-full text-white py-4 rounded-xl font-bold text-lg transition shadow-md ${formData.type === 'Complaint' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-green-600'}`}>
                            {isSubmitting ? "Sending..." : (formData.type === 'Complaint' ? "Submit Complaint" : "Submit Feedback")}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Feedback;