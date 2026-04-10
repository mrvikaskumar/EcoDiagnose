import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const [requests, setRequests] = useState([]);
    const [partners, setPartners] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({ totalReq: 0, claimedReq: 0, pendingReq: 0, totalPartners: 0, totalFeedback: 0, staleReq: 0 });

    // NEW: State for the Warning Email Modal
    const [warningModal, setWarningModal] = useState({
        isOpen: false,
        partner: null,
        message: 'We have received complaints regarding your recent requests and/or a violation of our Terms & Conditions. Please rectify this behavior immediately to avoid account suspension.'
    });
    const [isSendingWarning, setIsSendingWarning] = useState(false);

    const fetchAdminData = async () => {
        try {
            const [reqRes, partRes, feedRes] = await Promise.all([
                fetch('http://localhost:5001/api/admin/requests'),
                fetch('http://localhost:5001/api/admin/partners'),
                fetch('http://localhost:5001/api/admin/feedback')
            ]);

            if (reqRes.ok && partRes.ok && feedRes.ok) {
                const reqData = await reqRes.json();
                const partData = await partRes.json();
                const feedData = await feedRes.json();

                setRequests(reqData);
                setPartners(partData);
                setFeedbacks(feedData);

                const claimed = reqData.filter(r => r.status === 'Claimed').length;
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const staleCount = reqData.filter(r => new Date(r.createdAt) < thirtyDaysAgo).length;

                setStats({
                    totalReq: reqData.length,
                    claimedReq: claimed,
                    pendingReq: reqData.length - claimed,
                    totalPartners: partData.length,
                    totalFeedback: feedData.length,
                    staleReq: staleCount
                });
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const isAdmin = localStorage.getItem('adminToken');
        if (!isAdmin) {
            navigate('/partner/login');
            return;
        }
        fetchAdminData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/');
    };

    // --- ADMIN CONTROL FUNCTIONS ---

    // 1. WARNING SYSTEM
    const handleSendWarning = async () => {
        setIsSendingWarning(true);
        try {
            const response = await fetch(`http://localhost:5001/api/admin/partners/${warningModal.partner._id}/warn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customMessage: warningModal.message })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.autoBlocked
                    ? `Warning sent! This was their 5th warning, so they have been AUTOMATICALLY BLOCKED.`
                    : `Warning email sent! They now have ${data.warningCount}/5 warnings.`);
                setWarningModal({ isOpen: false, partner: null, message: '' });
                fetchAdminData(); // Refresh the table
            } else {
                alert("Failed to send warning.");
            }
        } catch (error) {
            alert("Server error while sending warning.");
        } finally {
            setIsSendingWarning(false);
        }
    };

    // 2. BLOCK SYSTEM
    const handleToggleBlock = async (partnerId, currentStatus) => {
        const action = currentStatus ? "UNBLOCK" : "BLOCK";
        if (!window.confirm(`Are you sure you want to ${action} this partner?`)) return;

        try {
            const response = await fetch(`http://localhost:5001/api/admin/partners/${partnerId}/block`, {
                method: 'PATCH'
            });
            if (response.ok) {
                fetchAdminData();
            } else {
                alert("Failed to update partner status.");
            }
        } catch (error) {
            alert("Server error.");
        }
    };

    // 3. DELETE PARTNER SYSTEM
    const handleDeletePartner = async (partnerId) => {
        if (!window.confirm("⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE this partner? This cannot be undone.")) return;

        try {
            const response = await fetch(`http://localhost:5001/api/admin/partners/${partnerId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchAdminData();
            } else {
                alert("Failed to delete partner.");
            }
        } catch (error) {
            alert("Server error.");
        }
    };

    // 4. DELETE FEEDBACK SYSTEM
    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm("Are you sure you want to delete this feedback/complaint?")) return;

        try {
            const response = await fetch(`http://localhost:5001/api/admin/feedback/${feedbackId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchAdminData(); // Refresh the dashboard to remove it from the screen
            } else {
                alert("Failed to delete feedback.");
            }
        } catch (error) {
            alert("Server error.");
        }
    };

    const renderStars = (rating) => "⭐".repeat(rating);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRequests = requests.filter(req => new Date(req.createdAt) >= thirtyDaysAgo);
    const staleRequests = requests.filter(req => new Date(req.createdAt) < thirtyDaysAgo);

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800 relative">

            {/* WARNING EMAIL MODAL */}
            {warningModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-100 px-4">
                    <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
                        <div className="flex items-center gap-3 mb-4 border-b pb-4">
                            <span className="text-3xl">⚠️</span>
                            <div>
                                <h3 className="text-xl font-black text-red-600">Issue Official Warning</h3>
                                <p className="text-sm text-gray-500">Sending to: <b>{warningModal.partner?.businessName}</b></p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Compose Email Message:</label>
                            <textarea
                                rows="5"
                                className="w-full border border-gray-300 p-4 rounded-xl outline-none focus:ring-2 focus:ring-red-500 resize-none text-gray-700"
                                value={warningModal.message}
                                onChange={(e) => setWarningModal({ ...warningModal, message: e.target.value })}
                            ></textarea>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">This will be emailed directly to the partner.</span>
                                <span className="text-sm font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                                    Current Warnings: {warningModal.partner?.warningCount || 0} / 5
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setWarningModal({ isOpen: false, partner: null, message: '' })}
                                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendWarning}
                                disabled={isSendingWarning}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition flex items-center gap-2 shadow-md"
                            >
                                {isSendingWarning ? 'Sending...' : '✉️ Send Warning'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="flex justify-between items-center px-6 py-4 bg-indigo-900 text-white shadow-md sticky top-0 z-50">
                <div className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                    <span>👑</span> Eco<span className="text-indigo-400">Diagnose</span> <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded ml-2 font-bold tracking-widest uppercase">Admin</span>
                </div>
                <button onClick={handleLogout} className="text-sm font-medium bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg transition border border-indigo-500">
                    Exit Admin
                </button>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">

                <div className="flex space-x-2 border-b border-gray-300 mb-8 overflow-x-auto">
                    <button onClick={() => setActiveTab('overview')} className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition whitespace-nowrap ${activeTab === 'overview' ? 'bg-white border-t border-l border-r border-gray-300 text-indigo-700 border-b-white -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}>📊 Overview & Stats</button>
                    <button onClick={() => setActiveTab('requests')} className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition whitespace-nowrap ${activeTab === 'requests' ? 'bg-white border-t border-l border-r border-gray-300 text-indigo-700 border-b-white -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}>📱 Active Requests</button>
                    <button onClick={() => setActiveTab('stale')} className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition whitespace-nowrap ${activeTab === 'stale' ? 'bg-white border-t border-l border-r border-gray-300 text-red-600 border-b-white -mb-px' : 'text-gray-500 hover:text-red-500 hover:bg-gray-200'}`}>⏳ 30+ Days Old</button>
                    <button onClick={() => setActiveTab('partners')} className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition whitespace-nowrap ${activeTab === 'partners' ? 'bg-white border-t border-l border-r border-gray-300 text-indigo-700 border-b-white -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}>🏭 Registered Partners</button>
                    <button onClick={() => setActiveTab('feedback')} className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition whitespace-nowrap ${activeTab === 'feedback' ? 'bg-white border-t border-l border-r border-gray-300 text-indigo-700 border-b-white -mb-px' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}>🗣️ User Feedback & Complaints</button>
                </div>

                {loading ? <div className="text-center py-20 text-xl font-bold text-gray-500">Loading System Data...</div> : (
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 min-h-125">

                        {/* TAB 1: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">System Analytics</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                                    <div className="bg-linear-to-br from-indigo-500 to-indigo-700 p-6 rounded-xl text-white shadow-md">
                                        <p className="text-indigo-100 font-medium mb-1">Total Requests</p>
                                        <h3 className="text-3xl font-black">{stats.totalReq}</h3>
                                    </div>
                                    <div className="bg-linear-to-br from-emerald-500 to-emerald-700 p-6 rounded-xl text-white shadow-md">
                                        <p className="text-emerald-100 font-medium mb-1">Claimed</p>
                                        <h3 className="text-3xl font-black">{stats.claimedReq}</h3>
                                    </div>
                                    <div className="bg-linear-to-br from-amber-500 to-amber-700 p-6 rounded-xl text-white shadow-md">
                                        <p className="text-amber-100 font-medium mb-1">Pending</p>
                                        <h3 className="text-3xl font-black">{stats.pendingReq}</h3>
                                    </div>
                                    <div className="bg-linear-to-br from-red-500 to-red-700 p-6 rounded-xl text-white shadow-md">
                                        <p className="text-red-100 font-medium mb-1">30+ Days Old</p>
                                        <h3 className="text-3xl font-black">{stats.staleReq}</h3>
                                    </div>
                                    <div className="bg-linear-to-br from-slate-700 to-slate-900 p-6 rounded-xl text-white shadow-md">
                                        <p className="text-slate-300 font-medium mb-1">Total Partners</p>
                                        <h3 className="text-3xl font-black">{stats.totalPartners}</h3>
                                    </div>
                                    <div className="bg-linear-to-br from-pink-500 to-pink-700 p-6 rounded-xl text-white shadow-md">
                                        <p className="text-pink-100 font-medium mb-1">Feedback</p>
                                        <h3 className="text-3xl font-black">{stats.totalFeedback}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: ACTIVE REQUESTS */}
                        {activeTab === 'requests' && (
                            <div className="animate-fade-in overflow-x-auto">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Active Requests (Last 30 Days)</h2>
                                {recentRequests.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">No active requests found.</div>
                                ) : (
                                    <table className="w-full text-left border-collapse min-w-200">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                                <th className="p-4 rounded-tl-lg">Tracker ID</th>
                                                <th className="p-4">Device</th>
                                                <th className="p-4">User Details</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 rounded-tr-lg">Claimed By</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {recentRequests.map(req => (
                                                <tr key={req._id} className="hover:bg-gray-50">
                                                    <td className="p-4 font-mono font-bold text-indigo-700">{req.trackerId}</td>
                                                    <td className="p-4">
                                                        <p className="font-bold text-gray-900">{req.product}</p>
                                                        <p className="text-xs text-gray-500">Damage: {req.score}/100</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-medium text-gray-800">{req.userName}</p>
                                                        <p className="text-xs text-gray-500">{req.userEmail}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'Claimed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        {req.status === 'Claimed' && req.claimedBy ? (
                                                            <div>
                                                                <p className="font-bold text-green-700">{req.claimedBy.businessName}</p>
                                                                <p className="text-xs text-gray-500">{req.claimedBy.email}</p>
                                                            </div>
                                                        ) : <span className="text-gray-400 italic">Unclaimed</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* TAB 3: STALE REQUESTS */}
                        {activeTab === 'stale' && (
                            <div className="animate-fade-in overflow-x-auto">
                                <div className="flex justify-between items-center mb-6 border-b pb-2">
                                    <h2 className="text-2xl font-bold text-red-700">Archived Requests (30+ Days Old)</h2>
                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">Admin Manual Action Required</span>
                                </div>
                                {staleRequests.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">No requests older than 30 days right now.</div>
                                ) : (
                                    <table className="w-full text-left border-collapse min-w-200">
                                        <thead>
                                            <tr className="bg-red-50 text-red-800 text-sm uppercase tracking-wider">
                                                <th className="p-4 rounded-tl-lg">Tracker ID</th>
                                                <th className="p-4">Device</th>
                                                <th className="p-4">User Details</th>
                                                <th className="p-4">Date Submitted</th>
                                                <th className="p-4 rounded-tr-lg">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {staleRequests.map(req => (
                                                <tr key={req._id} className="hover:bg-red-50 transition">
                                                    <td className="p-4 font-mono font-bold text-red-700">{req.trackerId}</td>
                                                    <td className="p-4">
                                                        <p className="font-bold text-gray-900">{req.product}</p>
                                                        <p className="text-xs text-gray-500">Damage: {req.score}/100</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-medium text-gray-800">{req.userName}</p>
                                                        <p className="text-xs text-gray-500">{req.userEmail}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-bold text-gray-700">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                        <p className="text-xs text-gray-500">{Math.floor((new Date() - new Date(req.createdAt)) / (1000 * 60 * 60 * 24))} days ago</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'Claimed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* TAB 4: PARTNERS */}
                        {activeTab === 'partners' && (
                            <div className="animate-fade-in overflow-x-auto">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Registered Organizations & Control</h2>
                                <table className="w-full text-left border-collapse min-w-250">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                            <th className="p-4 rounded-tl-lg">Organization</th>
                                            <th className="p-4">Legal / GST</th>
                                            <th className="p-4">Warnings</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 rounded-tr-lg text-right">Admin Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {partners.map(partner => (
                                            <tr key={partner._id} className={`hover:bg-gray-50 ${partner.isBlocked ? 'bg-red-50' : ''}`}>
                                                <td className="p-4">
                                                    <p className="font-bold text-gray-900">{partner.businessName}</p>
                                                    <p className="text-sm text-gray-600">{partner.email}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                        {partner.gstNumber || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`font-bold px-2 py-1 rounded text-sm ${partner.warningCount >= 4 ? 'bg-red-100 text-red-700' : partner.warningCount > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {partner.warningCount || 0} / 5
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${partner.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                        {partner.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => setWarningModal({
                                                            isOpen: true,
                                                            partner: partner,
                                                            message: 'We have noticed a violation of our Terms & Conditions and/or received user complaints regarding your recent requests. Please rectify this behavior immediately to avoid account suspension.'
                                                        })}
                                                        className="px-3 py-1.5 rounded text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
                                                    >
                                                        ⚠️ Warn
                                                    </button>

                                                    <button
                                                        onClick={() => handleToggleBlock(partner._id, partner.isBlocked)}
                                                        className={`px-3 py-1.5 rounded text-xs font-bold text-white transition shadow-sm ${partner.isBlocked ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                                                    >
                                                        {partner.isBlocked ? '🔓 Unblock' : '🚫 Block'}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeletePartner(partner._id)}
                                                        className="px-3 py-1.5 rounded text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 5: FEEDBACK */}
                        {activeTab === 'feedback' && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">User Feedback & Complaints</h2>
                                {feedbacks.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">No feedback submitted yet.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {feedbacks.map(fb => (
                                            <div key={fb._id} className={`p-6 rounded-xl border shadow-sm relative ${fb.type === 'Complaint' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                                <div className="absolute top-6 right-6 text-xl">{renderStars(fb.rating)}</div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-lg text-gray-900">{fb.name}</h3>
                                                    {fb.type === 'Complaint' && (
                                                        <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">COMPLAINT</span>
                                                    )}
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full inline-block mb-4 ${fb.userType.includes('Partner') ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                                                    {fb.userType}
                                                </span>
                                                <div className="bg-white p-4 rounded-lg border border-gray-100 mb-3">
                                                    <p className="text-gray-700 italic">"{fb.message}"</p>
                                                </div>
                                                {fb.type === 'Complaint' && fb.relatedTrackerId && (
                                                    <div className="mb-2">
                                                        <span className="text-xs font-bold text-red-800 uppercase">Related Tracker ID: </span>
                                                        <span className="text-sm font-mono font-bold text-red-600 bg-white px-2 py-1 rounded border border-red-100">{fb.relatedTrackerId}</span>
                                                    </div>
                                                )}

                                                {/* NEW: Bottom row with Date and Delete Button */}
                                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200/50">
                                                    <p className="text-xs text-gray-400">
                                                        Submitted on: {new Date(fb.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <button
                                                        onClick={() => handleDeleteFeedback(fb._id)}
                                                        className="text-xs flex items-center gap-1 font-bold text-red-500 hover:text-red-700 bg-white hover:bg-red-50 px-3 py-1.5 rounded border border-red-100 transition shadow-sm"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;