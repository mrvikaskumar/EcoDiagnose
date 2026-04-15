import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PartnerOTPVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || 'your email address';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const finalOtp = otp.join('');
        const ADMIN_EMAIL = "vikaschouhan77122@gmail.com";

        try {
            // Send the OTP to the backend for real verification
            const response = await fetch('https://ecodiagnose-backend.onrender.com/api/partner/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: finalOtp })
            });

            const data = await response.json();

            if (response.ok) {
                // If it's the Admin, go to Admin Dashboard
                if (data.isAdmin || email === ADMIN_EMAIL) {
                    localStorage.setItem('adminToken', 'super-secret-admin-key');
                    alert("Admin Verification Successful!");
                    navigate('/admin/dashboard');
                }
                // If it's a Partner, go to Partner Dashboard
                else {
                    localStorage.setItem('partnerToken', data.partnerId);
                    localStorage.setItem('partnerEmail', email);
                    alert("Verification Successful! Redirecting to your dashboard...");
                    navigate('/partner/dashboard');
                }
            } else {
                alert(data.error || "Invalid OTP! Please check your email.");
                setOtp(['', '', '', '', '', '']); // Clear boxes
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
                    <span className="text-3xl">🌱</span> Eco<span className="text-gray-800">Diagnose</span> <span className="text-sm bg-gray-800 text-white px-2 py-0.5 rounded ml-2">VERIFICATION</span>
                </div>
                <button onClick={() => navigate('/partner/login')} className="text-gray-500 hover:text-gray-800 font-medium transition">
                    ← Back
                </button>
            </nav>

            <div className="max-w-md mx-auto px-4 py-20">
                <form onSubmit={handleVerify} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 animate-fade-in">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
                        <p className="text-gray-600">Enter the 6-digit code we sent to <br /><span className="font-bold text-green-700">{email}</span></p>
                    </div>

                    <div className="flex justify-between items-center gap-2 mb-10">
                        {otp.map((data, index) => {
                            return (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    className="w-12 h-16 text-3xl text-center font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500 outline-none transition"
                                    value={data}
                                    onChange={e => handleChange(e.target, index)}
                                    onFocus={e => e.target.select()}
                                />
                            );
                        })}
                    </div>

                    <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-700 transition shadow-md">
                        ✅ Verify Email
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PartnerOTPVerify;