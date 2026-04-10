import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Catch the AI data passed from the ScannerPage
    const aiData = location.state || {
        product: "Unknown Device",
        condition: "Unknown",
        score: 0
    };

    // State to hold the form data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        additionalInfo: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    // NEW: State for legal compliance checkbox
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // NEW: Security Check
        if (!acceptedTerms) {
            alert("You must agree to the Terms & Conditions and confirm your data is wiped.");
            return;
        }

        setIsSubmitting(true);

        // We map your custom form fields to match the MongoDB Request Schema
        // We combine the address fields so the partner sees the full location
        const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}. Note: ${formData.additionalInfo}`;

        const finalPayload = {
            userName: formData.fullName,
            userEmail: formData.email,
            userMobile: formData.mobile,
            userAddress: fullAddress,
            product: aiData.product,
            condition: aiData.condition,
            score: aiData.score
        };

        try {
            const response = await fetch('https://ecodiagnose-backend.onrender.com/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload)
            });

            const data = await response.json();

            if (response.ok) {
                // Success! Pass ALL real data to the Summary Page
                navigate('/summary', {
                    state: {
                        trackerId: data.trackerId,
                        formData: formData,
                        aiData: aiData
                    }
                });
            } else {
                alert(data.error || "Failed to submit request.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Server connection failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">

            {/* Simple Navigation Header */}
            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm mb-8">
                <div
                    onClick={() => navigate('/')}
                    className="text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer flex items-center gap-2"
                >
                    <span className="text-3xl">🌱</span>
                    Eco<span className="text-gray-800">Diagnose</span>
                </div>
                <button
                    onClick={() => navigate('/scanner')}
                    className="text-gray-500 hover:text-gray-800 font-medium transition"
                >
                    ← Back to Scanner
                </button>
            </nav>

            {/* Form Container */}
            <div className="max-w-4xl mx-auto px-4">

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                        Pickup & Contact Details
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Where should our certified distributors pick up your <span className="font-bold text-green-700">{aiData.product}</span>?
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">

                    {/* Section 1: Contact Information */}
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text" name="fullName" required
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                            <input
                                type="tel"
                                name="mobile"
                                required
                                maxLength="10"
                                pattern="[0-9]{10}"
                                title="Please enter exactly 10 digits"
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="e.g. 9876543210"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email" name="email" required
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    {/* Section 2: Address Details */}
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Pickup Location</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Local Address (House No, Street, Landmark)</label>
                            <input
                                type="text" name="address" required
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="123 Green Avenue, Near Central Park"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                                type="text" name="city" required
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="Mumbai"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                            <input
                                type="text" name="state" required
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="Maharashtra"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                            <input
                                type="text"
                                name="pincode"
                                required
                                maxLength="6"
                                pattern="[1-9][0-9]{5}"
                                title="Please enter a valid 6-digit Pincode (cannot start with 0)"
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="400001"
                            />
                        </div>
                    </div>

                    {/* Section 3: Custom E-Waste Description */}
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Device Details (Optional)</h2>
                    <div className="mb-10">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tell us more about your device (Does it power on? Any internal issues the AI couldn't see?)
                        </label>
                        <textarea
                            name="additionalInfo" rows="4"
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none"
                            placeholder="The screen is cracked, but the phone still turns on and holds a charge..."
                        ></textarea>
                    </div>

                    {/* NEW: Section 4: Legal Compliance for Users */}
                    <div className="mt-10 pt-8 border-t border-gray-200">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">User Data & Legal Agreement</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                By submitting this request, you confirm that you are the legal owner of this device. You must ensure that all personal data, photos, and accounts are completely erased/factory reset before handing the device to a partner. EcoDiagnose is a matching platform and is not liable for data breaches from unformatted devices.
                            </p>

                            <label className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    required
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <span className="text-gray-800 font-medium text-sm">
                                    I confirm my personal data is wiped, and I agree to the <span className="text-green-600 underline cursor-pointer hover:text-green-700">Terms & Conditions</span>.
                                </span>
                            </label>
                        </div>

                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full md:w-auto bg-linear-to-r from-green-500 to-emerald-600 text-white px-12 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'transform hover:-translate-y-1'}`}
                            >
                                {isSubmitting ? "Generating Tracker ID..." : "Review & Submit Request →"}
                            </button>
                        </div>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default DetailsPage;