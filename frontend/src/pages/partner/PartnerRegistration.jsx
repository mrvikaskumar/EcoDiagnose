import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PartnerRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        businessName: '',
        gstNumber: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        acceptedItems: [],
        otherItemDetails: '',
        acceptedDamage: []
    });

    const [acceptedTerms, setAcceptedTerms] = useState(false); // NEW: T&C State

    const eWasteCategories = [
        "Mobile Smartphones", "Laptops", "Tablets", "Desktop PCs", "Monitors",
        "Keyboards & Mice", "Printers & Scanners", "Routers & Modems", "Smartwatches",
        "Televisions", "Lithium-Ion Batteries", "Motherboards", "Cables & Chargers",
        "Cameras", "Gaming Consoles", "Audio Speakers", "Headphones", "Hard Drives",
        "Power Supplies", "Other (Specify)"
    ];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (item) => {
        setFormData((prev) => {
            const isSelected = prev.acceptedItems.includes(item);
            if (isSelected) {
                return { ...prev, acceptedItems: prev.acceptedItems.filter(i => i !== item) };
            } else {
                return { ...prev, acceptedItems: [...prev.acceptedItems, item] };
            }
        });
    };

    const handleDamageChange = (range) => {
        setFormData((prev) => {
            const isSelected = prev.acceptedDamage.includes(range);
            if (isSelected) {
                return { ...prev, acceptedDamage: prev.acceptedDamage.filter(r => r !== range) };
            } else {
                return { ...prev, acceptedDamage: [...prev.acceptedDamage, range] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Extra security check just in case the HTML 'required' tag fails
        if (!acceptedTerms) {
            alert("You must agree to the Terms & Conditions to register.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/partner/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/partner/verify-otp', { state: { email: formData.email, flow: 'register' } });
            } else {
                alert(data.error || "Registration failed.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Could not connect to the server.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">

            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm mb-8 relative z-10">
                <div onClick={() => navigate('/')} className="text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer flex items-center gap-2">
                    <span className="text-3xl">🌱</span> Eco<span className="text-gray-800">Diagnose</span> <span className="text-sm bg-gray-800 text-white px-2 py-0.5 rounded ml-2">PARTNER</span>
                </div>
                <button onClick={() => navigate('/partner/login')} className="text-gray-500 hover:text-gray-800 font-medium transition">
                    Already have an account? Login
                </button>
            </nav>

            <div className="max-w-4xl mx-auto px-4">

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Join our Recycling Network</h1>
                    <p className="text-gray-600 text-lg">Register your repair shop or recycling center to receive direct e-waste leads from local consumers.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">

                    {/* SECTION 1: Basic Info */}
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Organization Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business / Shop Name *</label>
                            <input type="text" name="businessName" required onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. Raju Electronics" />
                        </div>

                        {/* NEW: GST / Certification Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">GST / Registration No. *</label>
                            <input
                                type="text"
                                name="gstNumber"
                                required
                                maxLength="15"
                                pattern="^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[Zz][0-9a-zA-Z]{1}$"
                                title="Please enter a valid 15-character GST Number (e.g., 22AAAAA0000A1Z5)"
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none uppercase"
                                placeholder="e.g. 22AAAAA0000A1Z5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-bold">
                                    +91
                                </span>
                                <input
                                    type="tel" // Opens the number pad on phones!
                                    name="mobile"
                                    required
                                    maxLength="10"
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit mobile number"
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                            <input type="email" name="email" required onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="contact@shop.com" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Shop Address *</label>
                            <input type="text" name="address" required onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Shop No, Street, Landmark" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                            <input type="text" name="city" required onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Mumbai" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                            <input type="text" name="state" required onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Maharashtra" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                            <input
                                type="text"
                                name="pincode"
                                required
                                maxLength="6"
                                pattern="[0-9]{6}"
                                title="Please enter a valid 6-digit Pincode"
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="e.g. 800005"
                            />
                        </div>
                    </div>

                    {/* SECTION 2: Item Preferences */}
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">What E-Waste do you accept?</h2>
                    <div className="mb-10">
                        <p className="text-sm text-gray-500 mb-4">Select all the categories your shop is equipped to handle or salvage.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {eWasteCategories.map((item) => (
                                <label key={item} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                    <input type="checkbox" className="w-5 h-5 text-green-600 focus:ring-green-500 rounded" checked={formData.acceptedItems.includes(item)} onChange={() => handleCheckboxChange(item)} />
                                    <span className="text-gray-700 font-medium">{item}</span>
                                </label>
                            ))}
                        </div>
                        {formData.acceptedItems.includes("Other (Specify)") && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Please specify other items:</label>
                                <input type="text" name="otherItemDetails" onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g., Drone motors, AC compressors..." />
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: Damage Score Preferences */}
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Condition Preferences</h2>
                    <div className="mb-10">
                        <p className="text-sm text-gray-500 mb-4">What level of AI Damage Score are you looking for? (Select one or both)</p>
                        <div className="flex flex-col sm:flex-row gap-4">

                            <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition ${formData.acceptedDamage.includes('0-50') ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="flex items-center mb-2">
                                    <input type="checkbox" checked={formData.acceptedDamage.includes('0-50')} onChange={() => handleDamageChange('0-50')} className="w-5 h-5 text-green-600 focus:ring-green-500 rounded" />
                                    <span className="ml-3 font-bold text-gray-900">Score 0 to 50</span>
                                </div>
                                <p className="text-sm text-gray-600 ml-8">Minor damage, intact parts, can be repaired or salvaged for spares.</p>
                            </label>

                            <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition ${formData.acceptedDamage.includes('51-100') ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className="flex items-center mb-2">
                                    <input type="checkbox" checked={formData.acceptedDamage.includes('51-100')} onChange={() => handleDamageChange('51-100')} className="w-5 h-5 text-green-600 focus:ring-green-500 rounded" />
                                    <span className="ml-3 font-bold text-gray-900">Score 51 to 100</span>
                                </div>
                                <p className="text-sm text-gray-600 ml-8">Heavily damaged, completely dead, useful for raw material extraction.</p>
                            </label>
                        </div>
                    </div>

                    {/* SECTION 4: Terms & Conditions (NEW) */}
                    <div className="mt-10 pt-8 border-t border-gray-200">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">Legal Compliance & Agreement</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                To join the EcoDiagnose partner network, your organization must comply with local e-waste handling regulations, maintain accurate GST records, and adhere to our strict data privacy standards for user electronics. EcoDiagnose reserves the right to suspend or block accounts with poor user feedback or unverified credentials.
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
                                    I confirm that the GST number provided is accurate, and I agree to the <span className="text-green-600 underline cursor-pointer hover:text-green-700">Terms & Conditions</span> and <span className="text-green-600 underline cursor-pointer hover:text-green-700">Privacy Policy</span>.
                                </span>
                            </label>
                        </div>

                        <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition shadow-lg flex justify-center items-center gap-2">
                            <span>🚀</span> Create Partner Account
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PartnerRegistration;