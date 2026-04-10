import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PartnerLogin = () => {
    const navigate = useNavigate();
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const ADMIN_EMAIL = "vikaschouhan77122@gmail.com";

        // THE ADMIN INTERCEPTOR: Jump straight to OTP screen
        if (email === ADMIN_EMAIL) {
            navigate('/partner/verify-otp', { state: { email, flow: 'admin' } });
            return;
        }

        // ... Normal Partner Login Logic ...
        try {
            const response = await fetch('http://localhost:5001/api/partner/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            // ... (keep the rest of your existing fetch code here) ...
            const data = await response.json();

            if (response.ok) {
                navigate('/partner/verify-otp', { state: { email, flow: 'login' } });
            } else {
                alert(data.error || "Login failed.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Could not connect to the server.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm mb-8 relative z-10">
                <div onClick={() => navigate('/')} className="text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer flex items-center gap-2">
                    <span className="text-3xl">🌱</span> Eco<span className="text-gray-800">Diagnose</span> <span className="text-sm bg-gray-800 text-white px-2 py-0.5 rounded ml-2">PARTNER LOGIN</span>
                </div>
                <button onClick={() => navigate('/partner/portal')} className="text-gray-500 hover:text-gray-800 font-medium transition">
                    ← Back
                </button>
            </nav>

            <div className="max-w-md mx-auto px-4 py-20">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 animate-fade-in">

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login to your Portal</h1>
                        <p className="text-gray-600">Enter your registered details to receive an OTP.</p>
                    </div>

                    <div className="space-y-6 mb-10">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Registered Shop/Partner Name</label>
                            <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Raju Electronics" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Registered Email Address</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="partner@example.com" />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2">
                        <span>✉️</span> Send Verification OTP
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Not registered yet? <span onClick={() => navigate('/partner/register')} className="text-green-600 font-medium cursor-pointer hover:underline">Create a free account</span>.
                    </p>

                </form>
            </div>
        </div>
    );
};

export default PartnerLogin;