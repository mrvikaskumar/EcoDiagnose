import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PartnerLogin = () => {
    const navigate = useNavigate();
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);

        const ADMIN_EMAIL = "vikaschouhan77122@gmail.com";

        try {
            // Send request to backend so it triggers the email for BOTH partners and the Admin
            const response = await fetch('https://ecodiagnose-backend.onrender.com/api/partner/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                // If it's the admin, pass the 'admin' flow so your Verify OTP page knows where to redirect!
                const flowType = email === ADMIN_EMAIL ? 'admin' : 'login';
                navigate('/partner/verify-otp', { state: { email, flow: flowType } });
            } else {
                alert(data.error || "Login failed.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Could not connect to the server.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm mb-8 relative z-10">
                <div onClick={() => navigate('/')} className="text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer flex items-center gap-2">
                    <span className="text-3xl">🌱</span> Eco<span className="text-gray-800">Diagnose</span> <span className="text-sm bg-gray-800 text-white px-2 py-0.5 rounded ml-2">PORTAL LOGIN</span>
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

                    <button type="submit" disabled={isSending} className={`w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition transform hover:-translate-y-0.5 shadow-md flex items-center justify-center gap-2 ${isSending ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <span>✉️</span> {isSending ? 'Sending OTP...' : 'Send Verification OTP'}
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