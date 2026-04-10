import React from 'react';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm sticky top-0 z-50">
                <div onClick={() => navigate('/')} className="text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer flex items-center gap-2">
                    <span className="text-3xl">🌱</span> Eco<span className="text-gray-800">Diagnose</span>
                </div>
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800 font-medium transition">
                    ← Back to Home
                </button>
            </nav>

            <div className="text-center py-16 px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">How The Platform Works</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">EcoDiagnose operates a dual-sided marketplace. Here is how data flows securely from the user's camera directly to our certified recycling partners.</p>
            </div>

            {/* Added items-stretch so both cards match the height of the tallest one */}
            <div className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">

                {/* User Flow Card - Added flex, flex-col, and h-full */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border-t-4 border-t-green-500 border border-gray-100 flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <span className="bg-green-100 text-green-700 p-2 rounded-lg">📱</span> For Everyday Users
                    </h2>

                    <div className="space-y-8 mb-8">
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">1</div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">AI Device Scan</h3>
                                <p className="text-gray-600 mt-1">Take a live photo of your broken electronics. Our Python-based AI model analyzes the image to identify the product and assess physical damage.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">2</div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Get Damage Score</h3>
                                <p className="text-gray-600 mt-1">Receive an instant score out of 100 indicating if the device is viable for spare part salvage or requires raw material extraction.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">3</div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Submit & Track</h3>
                                <p className="text-gray-600 mt-1">Provide your pickup details and receive a unique ECO- Tracking ID via email to monitor your request in real-time.</p>
                            </div>
                        </div>
                    </div>

                    {/* Added mt-auto to push the button to the absolute bottom */}
                    <button onClick={() => navigate('/scanner')} className="mt-auto w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
                        Recycle a Device Now
                    </button>
                </div>

                {/* Partner Flow Card - Added flex, flex-col, and h-full */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border-t-4 border-t-gray-900 border border-gray-100 flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <span className="bg-gray-200 text-gray-800 p-2 rounded-lg">🏭</span> For Recycling Partners
                    </h2>

                    <div className="space-y-8 mb-8">
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center font-bold">1</div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Set Preferences</h3>
                                <p className="text-gray-600 mt-1">Register your organization and select the exact e-waste categories and AI damage ranges you want to accept.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center font-bold">2</div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Smart Matching</h3>
                                <p className="text-gray-600 mt-1">Our matching engine filters global user requests and feeds perfectly matched devices directly to your dashboard.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center font-bold">3</div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Claim & Collect</h3>
                                <p className="text-gray-600 mt-1">Click to claim an item. The system instantly locks the request, updates the user's tracking status, and emails them your contact info.</p>
                            </div>
                        </div>
                    </div>

                    {/* Added mt-auto to push the button to the absolute bottom */}
                    <button onClick={() => navigate('/partner/portal')} className="mt-auto w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">
                        Access Partner Portal
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HowItWorks;