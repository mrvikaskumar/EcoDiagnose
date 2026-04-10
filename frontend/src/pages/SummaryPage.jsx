import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SummaryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Catch the real data passed from DetailsPage
    const { trackerId, formData, aiData } = location.state || {};

    // If someone visits this page directly without submitting, send them home
    if (!trackerId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold mb-4">No Request Found</h2>
                <button onClick={() => navigate('/')} className="bg-green-600 text-white px-6 py-2 rounded-lg">Go Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">

            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm mb-8">
                <div onClick={() => navigate('/')} className="text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer flex items-center gap-2">
                    <span className="text-3xl">🌱</span> Eco<span className="text-gray-800">Diagnose</span>
                </div>
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800 font-medium transition">
                    Return Home
                </button>
            </nav>

            <div className="max-w-4xl mx-auto px-4">

                <div className="text-center mb-10 bg-green-50 border border-green-200 rounded-2xl p-8 shadow-sm">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Request Submitted Successfully!</h1>
                    <p className="text-gray-600 text-lg mb-6">Thank you for choosing to responsibly recycle. We have emailed this tracking ID to <span className="font-bold">{formData.email}</span>.</p>

                    <div className="inline-block bg-white border-2 border-dashed border-green-500 rounded-xl px-8 py-4">
                        <p className="text-sm text-gray-500 font-bold mb-1 uppercase tracking-wider">Your Tracking ID</p>
                        <h2 className="text-3xl font-black text-green-700 tracking-widest">{trackerId}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Device Assessment Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-900 text-white px-6 py-3 font-bold flex items-center gap-2">
                            <span>📱</span> Device Assessment
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold">Detected Device</span>
                                <h3 className="text-lg font-bold text-gray-900">{aiData.product}</h3>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold">Physical Condition</span>
                                <p className="text-gray-800 font-medium">{aiData.condition}</p>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
                                <span className="text-sm font-bold text-gray-700">AI Damage Score:</span>
                                <span className={`px-3 py-1 rounded text-sm font-bold ${aiData.score > 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {aiData.score} / 100
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Pickup Details Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-900 text-white px-6 py-3 font-bold flex items-center gap-2">
                            <span>📍</span> Pickup Details
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold">Contact Person</span>
                                <h3 className="text-lg font-bold text-gray-900">{formData.fullName}</h3>
                                <p className="text-sm text-gray-600">+91 {formData.mobile}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase font-bold">Pickup Address</span>
                                <p className="text-gray-800 font-medium">{formData.address}, {formData.city}, {formData.state} - {formData.pincode}</p>
                            </div>
                            {formData.additionalInfo && (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 italic">
                                    "{formData.additionalInfo}"
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SummaryPage;