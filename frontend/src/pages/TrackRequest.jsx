import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TrackRequest = () => {
    const navigate = useNavigate();
    const [trackerId, setTrackerId] = useState('');
    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackerId.trim()) return;

        setLoading(true);
        setError('');
        setRequestData(null);

        try {
            const response = await fetch(`http://localhost:5001/api/requests/track/${trackerId}`);
            const data = await response.json();

            if (response.ok) {
                setRequestData(data);
            } else {
                setError(data.error || "Tracking ID not found.");
            }
        } catch (err) {
            setError("Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            {/* Navigation */}
            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm mb-12 relative z-10">
                <div onClick={() => navigate('/')} className="text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer flex items-center gap-2">
                    <span className="text-3xl">🌱</span> Eco<span className="text-gray-800">Diagnose</span>
                </div>
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800 font-medium transition">
                    ← Back to Home
                </button>
            </nav>

            <div className="max-w-3xl mx-auto px-4">

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Track Your E-Waste</h1>
                    <p className="text-gray-600 text-lg">Enter your ECO Tracking ID to see the status of your recycling request.</p>
                </div>

                {/* Search Box */}
                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-12">
                    <input
                        type="text"
                        value={trackerId}
                        onChange={(e) => setTrackerId(e.target.value.toUpperCase())}
                        placeholder="e.g. ECO-123456"
                        className="flex-1 px-6 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg font-medium tracking-wide uppercase shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-4 rounded-xl font-bold text-white shadow-md transition ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'}`}
                    >
                        {loading ? "Searching..." : "Track Now"}
                    </button>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 text-center animate-fade-in max-w-xl mx-auto">
                        <span className="text-2xl block mb-2">😞</span>
                        <p className="font-bold">{error}</p>
                        <p className="text-sm mt-1">Please check the ID you entered and try again.</p>
                    </div>
                )}

                {/* Results Card */}
                {requestData && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">

                        {/* Header Status Bar */}
                        <div className={`px-6 py-4 flex justify-between items-center ${requestData.status === 'Pending' ? 'bg-yellow-50 border-b border-yellow-100' : 'bg-green-50 border-b border-green-100'}`}>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Status</p>
                                <div className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${requestData.status === 'Pending' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
                                    <h2 className={`text-xl font-black ${requestData.status === 'Pending' ? 'text-yellow-700' : 'text-green-700'}`}>
                                        {requestData.status === 'Pending' ? 'Awaiting Partner Pickup' : 'Claimed by Partner!'}
                                    </h2>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tracker ID</p>
                                <p className="font-mono font-bold text-gray-800">{requestData.trackerId}</p>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Device Info */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Device Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Item</p>
                                            <p className="font-bold text-gray-900">{requestData.product}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Condition</p>
                                            <p className="font-medium text-gray-800">{requestData.condition}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Date Submitted</p>
                                            <p className="font-medium text-gray-800">{new Date(requestData.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Partner Info (Only shows if claimed) */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Partner Details</h3>

                                    {requestData.status === 'Pending' ? (
                                        <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100 h-32 flex flex-col items-center justify-center">
                                            <p className="text-gray-500 text-sm italic">Your request is currently live on the partner marketplace. We will notify you when a certified recycler claims it.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                            <p className="font-bold text-green-900 text-lg mb-2">{requestData.claimedBy?.businessName}</p>
                                            <p className="text-sm text-green-800 mb-1">📞 {requestData.claimedBy?.mobile}</p>
                                            <p className="text-sm text-green-800">✉️ {requestData.claimedBy?.email}</p>
                                            <p className="text-xs text-green-600 mt-3 italic">This partner will contact you shortly to arrange the pickup.</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TrackRequest;