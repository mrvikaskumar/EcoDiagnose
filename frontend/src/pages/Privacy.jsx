import React from 'react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 font-medium transition mb-8">← Back</button>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>

                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p><strong>1. Information Collection:</strong> We collect personal information (Name, Email, Mobile, Address) solely for the purpose of facilitating the pickup and exchange of e-waste between users and certified partners.</p>
                    <p><strong>2. Image Processing:</strong> Photos uploaded to our AI Scanner are processed temporarily for damage assessment. We do not permanently store photos of your devices in our primary database after the assessment is complete.</p>
                    <p><strong>3. Data Sharing:</strong> Your contact information is kept entirely private and is only shared with a specific Recycling Partner *after* they have officially claimed your specific Tracker ID.</p>
                    <p><strong>4. Security:</strong> We use industry-standard security measures to protect your personal information and tracking IDs from unauthorized access.</p>
                </div>
            </div>
        </div>
    );
};
export default Privacy;