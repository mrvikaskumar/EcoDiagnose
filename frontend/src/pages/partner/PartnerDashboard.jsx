import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PartnerDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('matched');

    const [allRequests, setAllRequests] = useState([]);
    const [matchedRequests, setMatchedRequests] = useState([]);
    const [historyRequests, setHistoryRequests] = useState([]); // NEW: State for history
    const [partnerProfile, setPartnerProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    const eWasteCategories = [
        "Mobile Smartphones", "Laptops", "Tablets", "Desktop PCs", "Monitors",
        "Keyboards & Mice", "Printers & Scanners", "Routers & Modems", "Smartwatches",
        "Televisions", "Lithium-Ion Batteries", "Motherboards", "Cables & Chargers",
        "Cameras", "Gaming Consoles", "Audio Speakers", "Headphones", "Hard Drives",
        "Power Supplies", "Other (Specify)"
    ];

    // Extracted fetch function so we can reuse it when an item is claimed
    const fetchDashboardData = async () => {
        const partnerId = localStorage.getItem('partnerToken');
        if (!partnerId) {
            navigate('/partner/login');
            return;
        }

        try {
            // 1. Fetch Profile
            const partnerRes = await fetch(`https://ecodiagnose-backend.onrender.com/api/partner/${partnerId}`);
            const partnerData = await partnerRes.json();
            setPartnerProfile(partnerData);
            setEditFormData(partnerData);

            // 2. Fetch Pending Requests
            const requestsRes = await fetch('https://ecodiagnose-backend.onrender.com/api/requests');
            const requestsData = await requestsRes.json();

            // 3. Fetch Partner's History
            const historyRes = await fetch(`https://ecodiagnose-backend.onrender.com/api/partner/${partnerId}/history`);
            const historyData = await historyRes.json();

            if (requestsRes.ok && partnerRes.ok && historyRes.ok) {
                setAllRequests(requestsData);
                setHistoryRequests(historyData);

                const filteredMatches = requestsData.filter(req => {
                    const partnerDamageArray = partnerData.acceptedDamage || [];
                    return partnerDamageArray.some(range => {
                        if (range === '0-50' && req.score <= 50) return true;
                        if (range === '51-100' && req.score > 50) return true;
                        return false;
                    });
                });
                setMatchedRequests(filteredMatches);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('partnerToken');
        localStorage.removeItem('partnerEmail');
        navigate('/');
    };

    // --- CLAIM ITEM FUNCTION ---
    const handleClaimItem = async (requestId) => {
        const isConfirmed = window.confirm("Are you sure you want to claim this item? We will notify the user immediately.");
        if (!isConfirmed) return;

        try {
            const partnerId = localStorage.getItem('partnerToken');
            const response = await fetch(`https://ecodiagnose-backend.onrender.com/api/requests/${requestId}/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partnerId })
            });

            if (response.ok) {
                alert("🎉 Item successfully claimed! The user has been notified.");
                // Refresh the dashboard to move the item from Pending to History
                fetchDashboardData();
                setActiveTab('history'); // Automatically jump to the history tab
            } else {
                const data = await response.json();
                alert(data.error || "Failed to claim item.");
            }
        } catch (error) {
            console.error("Claim error:", error);
            alert("Server error while claiming.");
        }
    };

    // --- EDIT PROFILE HANDLERS ---
    const handleEditChange = (e) => { setEditFormData({ ...editFormData, [e.target.name]: e.target.value }); };

    const handleEditDamageChange = (range) => {
        setEditFormData(prev => {
            const currentDamage = prev.acceptedDamage || [];
            if (currentDamage.includes(range)) return { ...prev, acceptedDamage: currentDamage.filter(r => r !== range) };
            return { ...prev, acceptedDamage: [...currentDamage, range] };
        });
    };

    const handleEditItemChange = (item) => {
        setEditFormData(prev => {
            const currentItems = prev.acceptedItems || [];
            if (currentItems.includes(item)) return { ...prev, acceptedItems: currentItems.filter(i => i !== item) };
            return { ...prev, acceptedItems: [...currentItems, item] };
        });
    };

    const saveProfile = async () => {
        try {
            const response = await fetch(`https://ecodiagnose-backend.onrender.com/api/partner/${partnerProfile._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });
            if (response.ok) {
                alert("Profile updated successfully!");
                fetchDashboardData();
                setIsEditing(false);
            }
        } catch (error) {
            alert("Server error while saving.");
        }
    };

    // Reusable Request Card
    const RequestCard = ({ req, isHistory = false }) => (
        <div className={`border rounded-xl p-5 hover:shadow-lg transition flex flex-col justify-between bg-white relative overflow-hidden ${isHistory ? 'border-green-200' : 'border-gray-200'}`}>

            <div className={`absolute top-0 left-0 w-full h-1 ${isHistory ? 'bg-green-600' : (req.score > 50 ? 'bg-red-500' : 'bg-green-500')}`}></div>

            <div>
                <div className="flex justify-between items-start mb-3 mt-1">
                    <h3 className="font-bold text-lg text-gray-900">{req.product}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${req.score > 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        Damage: {req.score}/100
                    </span>
                </div>

                <div className="mb-4 pb-4 border-b border-gray-100">
                    <p className="text-sm text-gray-600 mb-1"><strong>Condition:</strong> {req.condition}</p>
                    <p className="text-sm text-gray-600"><strong>Location:</strong> {req.userAddress}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">User Details</p>
                    <p className="text-sm text-gray-800 font-medium">👤 {req.userName}</p>
                    <p className="text-sm text-gray-800">📞 +91 {req.userMobile}</p>
                    <p className="text-sm text-gray-800">✉️ {req.userEmail}</p>
                </div>

                <p className="text-xs text-gray-400">
                    {isHistory ? `Claimed on: ${new Date(req.updatedAt).toLocaleDateString()}` : `Posted: ${new Date(req.createdAt).toLocaleDateString()}`} • ID: {req.trackerId}
                </p>
            </div>

            {!isHistory ? (
                <button
                    onClick={() => handleClaimItem(req._id)}
                    className="mt-4 w-full bg-gray-900 text-white py-2.5 rounded-lg font-bold hover:bg-green-600 transition shadow-sm flex justify-center items-center gap-2"
                >
                    <span>🤝</span> Claim Item & Contact User
                </button>
            ) : (
                <div className="mt-4 w-full bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-lg font-bold text-center flex justify-center items-center gap-2">
                    <span>✅</span> Successfully Claimed
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-md sticky top-0 z-50">
                <div className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                    <span className="text-3xl">🌱</span> Eco<span className="text-green-400">Diagnose</span> <span className="text-sm bg-green-500 text-gray-900 px-2 py-0.5 rounded ml-2 font-bold">PARTNER</span>
                </div>
                <button onClick={handleLogout} className="text-sm font-medium bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition">Logout</button>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Partner Control Center</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {partnerProfile?.businessName || 'Partner'}!</p>
                </div>

                <div className="flex space-x-2 border-b border-gray-200 mb-8 overflow-x-auto">
                    <button onClick={() => setActiveTab('matched')} className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition whitespace-nowrap ${activeTab === 'matched' ? 'bg-white border-t border-l border-r border-gray-200 text-green-600 border-b-white -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>🎯 Matched Requests</button>
                    <button onClick={() => setActiveTab('all')} className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition whitespace-nowrap ${activeTab === 'all' ? 'bg-white border-t border-l border-r border-gray-200 text-green-600 border-b-white -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>🌍 All Requests</button>
                    <button onClick={() => setActiveTab('history')} className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition whitespace-nowrap ${activeTab === 'history' ? 'bg-white border-t border-l border-r border-gray-200 text-green-600 border-b-white -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>📦 Claimed History</button>
                    <button onClick={() => setActiveTab('profile')} className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition whitespace-nowrap ${activeTab === 'profile' ? 'bg-white border-t border-l border-r border-gray-200 text-green-600 border-b-white -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>⚙️ Profile & Settings</button>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 min-h-125">

                    {/* TAB 1: MATCHED REQUESTS */}
                    {activeTab === 'matched' && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Perfect Matches For You</h2>
                            {loading ? <p>Loading...</p> : matchedRequests.length === 0 ? <p className="text-gray-500">No matches found.</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{matchedRequests.map(req => <RequestCard key={req._id} req={req} />)}</div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: ALL REQUESTS */}
                    {activeTab === 'all' && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Global E-Waste Feed</h2>
                            {loading ? <p>Loading...</p> : allRequests.length === 0 ? <p className="text-gray-500">No pending requests.</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{allRequests.map(req => <RequestCard key={req._id} req={req} />)}</div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: CLAIMED HISTORY */}
                    {activeTab === 'history' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Your Claimed Items</h2>
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Completed</span>
                            </div>

                            {loading ? <p>Loading...</p> : historyRequests.length === 0 ? (
                                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                    <p className="text-gray-500">You haven't claimed any e-waste yet. Check the Matched Requests tab!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {historyRequests.map(req => <RequestCard key={req._id} req={req} isHistory={true} />)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: PARTNER PROFILE (WITH EDIT MODE) */}
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Settings & Preferences</h2>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">✏️ Edit Profile</button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => { setIsEditing(false); setEditFormData(partnerProfile); }} className="text-red-500 font-medium px-4 py-2 hover:bg-red-50 rounded-lg border border-red-100">Cancel</button>
                                        <button onClick={saveProfile} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 shadow-md">💾 Save Changes</button>
                                    </div>
                                )}
                            </div>

                            {loading ? <p>Loading profile...</p> : !isEditing ? (
                                /* --- VIEW MODE --- */
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                        <div><span className="text-sm text-gray-500 block">Business Name</span><span className="font-bold text-lg">{partnerProfile.businessName}</span></div>
                                        <div><span className="text-sm text-gray-500 block">Mobile Number</span><span className="font-bold text-lg">{partnerProfile.mobile}</span></div>
                                        <div><span className="text-sm text-gray-500 block">Email Address</span><span className="font-bold text-lg">{partnerProfile.email}</span></div>
                                        <div>
                                            <span className="text-sm text-gray-500 block">Full Address</span>
                                            <span className="font-medium text-gray-800">{partnerProfile.address}, {partnerProfile.city}, {partnerProfile.state} - {partnerProfile.pincode}</span>
                                        </div>

                                        <div className="md:col-span-2 pt-4 border-t border-gray-200">
                                            <span className="text-sm text-gray-500 block mb-2">Accepted Damage Ranges</span>
                                            <div className="flex gap-2">
                                                {partnerProfile.acceptedDamage?.map(d => (
                                                    <span key={d} className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm">{d}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 pt-4 border-t border-gray-200">
                                            <span className="text-sm text-gray-500 block mb-2">Accepted Item Categories</span>
                                            <div className="flex flex-wrap gap-2">
                                                {partnerProfile.acceptedItems?.map(item => (
                                                    <span key={item} className="bg-white border border-gray-300 px-3 py-1 rounded-md text-sm font-medium text-gray-700">{item}</span>
                                                ))}
                                                {partnerProfile.otherItemDetails && (
                                                    <span className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-md text-sm font-medium text-blue-700">Other: {partnerProfile.otherItemDetails}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* --- EDIT MODE --- */
                                <div className="bg-white p-6 rounded-xl border-2 border-green-500 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                            <input type="text" name="businessName" value={editFormData.businessName || ''} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                            <input type="text" name="mobile" value={editFormData.mobile || ''} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                                            <input type="text" name="address" value={editFormData.address || ''} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input type="text" name="city" value={editFormData.city || ''} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <input type="text" name="state" value={editFormData.state || ''} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none" />
                                        </div>

                                        <div className="md:col-span-2 pt-4 mt-2 border-t border-gray-200">
                                            <label className="block text-sm font-bold text-gray-800 mb-3">Damage Preferences (Select one or both)</label>
                                            <div className="flex gap-6">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={(editFormData.acceptedDamage || []).includes('0-50')} onChange={() => handleEditDamageChange('0-50')} className="w-5 h-5 text-green-600 rounded cursor-pointer" />
                                                    <span className="font-medium text-gray-800">Score 0-50</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="checkbox" checked={(editFormData.acceptedDamage || []).includes('51-100')} onChange={() => handleEditDamageChange('51-100')} className="w-5 h-5 text-green-600 rounded cursor-pointer" />
                                                    <span className="font-medium text-gray-800">Score 51-100</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 pt-4 mt-2 border-t border-gray-200">
                                            <label className="block text-sm font-bold text-gray-800 mb-3">Accepted Item Categories</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {eWasteCategories.map((item) => (
                                                    <label key={item} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                                                            checked={(editFormData.acceptedItems || []).includes(item)}
                                                            onChange={() => handleEditItemChange(item)}
                                                        />
                                                        <span className="text-gray-700 text-sm font-medium">{item}</span>
                                                    </label>
                                                ))}
                                            </div>

                                            {(editFormData.acceptedItems || []).includes("Other (Specify)") && (
                                                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Please specify other items:</label>
                                                    <input type="text" name="otherItemDetails" value={editFormData.otherItemDetails || ''} onChange={handleEditChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g., Drone motors, AC compressors..." />
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PartnerDashboard;