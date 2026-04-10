import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 font-medium transition mb-8">← Back</button>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Terms & Conditions</h1>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p><strong>1. Acceptance of Terms:</strong> By accessing and using EcoDiagnose, you accept and agree to be bound by the terms and provisions of this agreement.</p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6">For Everyday Users</h3>
                    <p><strong>2. Data Responsibility:</strong> Users are strictly responsible for wiping all personal data, photos, accounts, and factory resetting their devices before handing them over to a recycling partner. EcoDiagnose acts solely as a matching platform and holds no liability for data breaches resulting from unformatted devices.</p>
                    <p><strong>3. Ownership:</strong> By submitting a device, you legally declare that you are the rightful owner of the electronics being recycled.</p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6">For Recycling Partners</h3>
                    <p><strong>4. Legal Compliance:</strong> Partners must hold valid GST registration and comply with all local and national environmental laws regarding e-waste disposal and material salvage.</p>
                    <p><strong>5. Platform Rights:</strong> EcoDiagnose administrators reserve the right to suspend, block, or permanently delete any partner account that receives poor user feedback, fails to collect claimed items, or violates environmental standards.</p>
                </div>
            </div>
        </div>
    );
};
export default Terms;