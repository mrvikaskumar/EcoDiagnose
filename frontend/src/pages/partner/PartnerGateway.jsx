import React from 'react';
import { useNavigate } from 'react-router-dom';

const PartnerGateway = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            {/* Navigation */}
            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm mb-8 relative z-10">
                <div
                    onClick={() => navigate('/')}
                    className="text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer flex items-center gap-2"
                >
                    <span className="text-3xl">🌱</span>
                    Eco<span className="text-gray-800">Diagnose</span> <span className="text-sm bg-gray-800 text-white px-2 py-0.5 rounded ml-2">PARTNER PORTAL</span>
                </div>
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800 font-medium transition">
                    ← Back to User Site
                </button>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Welcome to the <span className="text-green-600">Partner Ecosystem</span>
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Connect with local users, manage your e-waste claims, and update your recycling preferences from one central dashboard. Please select an option to continue.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                    {/* Card 1: Existing Partner (Login) */}
                    <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 hover:border-green-100 transition-all duration-300 flex flex-col justify-between items-center text-center group transform hover:-translate-y-2">
                        <div>
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-8 mx-auto shadow-inner group-hover:scale-110 transition">
                                👤
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">I am an Existing Partner</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed max-w-sm">
                                Login using your registered mobile number and verified OTP to access your specific dashboard.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/partner/login')}
                            className="w-full sm:w-auto bg-green-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition shadow-md"
                        >
                            Partner Login →
                        </button>
                    </div>

                    {/* Card 2: New Partner (Register) */}
                    <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 hover:border-green-100 transition-all duration-300 flex flex-col justify-between items-center text-center group transform hover:-translate-y-2">
                        <div>
                            <div className="w-20 h-20 bg-gray-800 text-white rounded-full flex items-center justify-center text-4xl mb-8 mx-auto shadow-inner group-hover:scale-110 transition">
                                🤝
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">I want to become a Partner</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed max-w-sm">
                                New to EcoDiagnose? Register your shop or organization to begin accepting damage items from local users.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/partner/register')}
                            className="w-full sm:w-auto bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-700 transition shadow-md"
                        >
                            Join the Ecosystem →
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PartnerGateway;