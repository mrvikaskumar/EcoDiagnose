import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-gray-900 text-gray-300 py-10 mt-auto border-t-4 border-green-600">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Brand Section */}
                <div>
                    <div className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 mb-4">
                        <span>🌱</span> Eco<span className="text-green-500">Diagnose</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                        Pioneering smart e-waste management through AI triage and decentralized recycling networks. Built at NIT Patna.
                    </p>
                    <p className="text-xs text-gray-500">© {new Date().getFullYear()} EcoDiagnose. All rights reserved.</p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2 inline-block">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><button onClick={() => navigate('/')} className="hover:text-green-400 transition">Home</button></li>
                        <li><button onClick={() => navigate('/about')} className="hover:text-green-400 transition">About Us</button></li>
                        <li><button onClick={() => navigate('/how-it-works')} className="hover:text-green-400 transition">How It Works</button></li>
                        <li><button onClick={() => navigate('/partner/portal')} className="hover:text-green-400 transition">Partner Portal</button></li>
                    </ul>
                </div>

                {/* Legal & Support */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2 inline-block">Legal & Support</h3>
                    <ul className="space-y-2 text-sm mb-6">
                        <li><button onClick={() => navigate('/terms')} className="hover:text-green-400 transition">Terms & Conditions</button></li>
                        <li><button onClick={() => navigate('/privacy')} className="hover:text-green-400 transition">Privacy Policy</button></li>
                    </ul>

                    {/* FEEDBACK BUTTON */}
                    <button
                        onClick={() => navigate('/feedback')}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-500 transition shadow-md flex items-center gap-2"
                    >
                        <span>💬</span> Submit Feedback
                    </button>
                </div>

            </div>
        </footer>
    );
};

export default Footer;