import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ScannerPage = () => {
    const navigate = useNavigate();

    // States
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState(null);

    // Camera specific states
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // Refs
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Clean up camera if user leaves the page
    useEffect(() => {
        return () => stopCamera();
    }, []);

    // --- GALLERY UPLOAD LOGIC ---
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
            setAiResult(null);
        }
    };

    const openGallery = () => {
        fileInputRef.current.click();
    };

    // --- CUSTOM WEBCAM LOGIC ---
    const startCamera = async () => {
        setIsCameraOpen(true);
        setAiResult(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Could not access camera.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const takeSnapshot = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const file = new File([blob], "live_capture.jpg", { type: "image/jpeg" });
                setSelectedFile(file);
                setImagePreview(URL.createObjectURL(file));
                stopCamera();
            }, "image/jpeg");
        }
    };

    // --- SEND TO BACKEND LOGIC ---
    const runAnalysis = async () => {
        if (!selectedFile) {
            alert("Please capture or upload an image first!");
            return;
        }

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('https://ecodiagnose-backend.onrender.com/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            setAiResult({
                product: data.product,
                condition: data.condition,
                viability: data.viability,
                score: data.score
            });

        } catch (error) {
            console.error("Error analyzing image:", error);
            alert("There was an error connecting to the AI server.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            {/* Navigation Header */}
            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm mb-8">
                <div
                    onClick={() => navigate('/')}
                    className="text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer flex items-center gap-2"
                >
                    <span className="text-3xl">🌱</span>
                    Eco<span className="text-gray-800">Diagnose</span>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-500 hover:text-gray-800 font-medium transition"
                >
                    ← Back to Home
                </button>
            </nav>

            <div className="max-w-3xl mx-auto px-4 pb-20">

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                        Device Assessment Scanner
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Upload a clear photo of your electronic device. Our AI will identify the item and assess its condition for recycling.
                    </p>
                </div>

                {/* Main Interface Box */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 text-center">

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />

                    {/* Conditional Rendering Logic */}
                    {isCameraOpen ? (
                        <div className="animate-fade-in">
                            <div className="relative rounded-xl overflow-hidden bg-black mb-6 border border-gray-300 shadow-inner">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full max-h-96 object-contain"
                                ></video>
                                <canvas ref={canvasRef} className="hidden"></canvas>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button onClick={stopCamera} className="px-6 py-3 text-red-500 font-semibold border border-red-200 rounded-lg hover:bg-red-50 transition">
                                    Cancel
                                </button>
                                <button onClick={takeSnapshot} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition">
                                    📸 Snap Photo
                                </button>
                            </div>
                        </div>
                    ) : !imagePreview ? (
                        <div className="py-10">
                            <div className="text-6xl mb-6">📷</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-8">Select how you want to provide your photo</h3>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <button onClick={startCamera} className="w-full sm:w-auto bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-900 transition shadow-md flex items-center justify-center gap-2">
                                    <span>📸</span> Take Live Photo
                                </button>
                                <button onClick={openGallery} className="w-full sm:w-auto bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2">
                                    <span>📂</span> Upload from Gallery
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <img src={imagePreview} alt="E-Waste Preview" className="max-w-full max-h-80 mx-auto rounded-xl shadow-sm border border-gray-100 mb-8 object-contain" />
                            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                                <button
                                    onClick={() => { setImagePreview(null); setSelectedFile(null); setAiResult(null); }}
                                    className="px-6 py-3 text-red-500 font-semibold border border-red-200 rounded-lg hover:bg-red-50 transition"
                                >
                                    Discard Photo
                                </button>
                                <button
                                    onClick={runAnalysis}
                                    disabled={isAnalyzing}
                                    className={`px-8 py-3 rounded-lg font-bold text-white shadow-md transition flex items-center justify-center gap-2 ${isAnalyzing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isAnalyzing ? "Running AI Models..." : '🚀 Analyze Device'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* VIEW 4: AI RESULTS CARD */}
                {aiResult && (
                    <div className="mt-8 bg-white p-8 rounded-2xl shadow-lg border border-green-100 animate-fade-in border-t-4 border-t-green-500">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span>📋</span> Recyclability Report
                        </h2>

                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-100">
                                <span className="text-gray-500 md:w-1/3 font-medium">Detected Device:</span>
                                <span className="text-gray-900 font-bold text-lg">{aiResult.product}</span>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-100">
                                <span className="text-gray-500 md:w-1/3 font-medium">Physical Condition:</span>
                                <span className="text-gray-800 font-medium">{aiResult.condition}</span>
                            </div>

                            {/* NUMERICAL DAMAGE SCORE */}
                            <div className="flex flex-col md:flex-row md:items-center py-3 border-b border-gray-100">
                                <span className="text-gray-500 md:w-1/3 font-medium">AI Damage Score:</span>
                                <div className="md:w-2/3 mt-2 md:mt-0">
                                    <span className={`inline-block px-4 py-1 rounded-md text-xl font-black tracking-wide ${aiResult.score > 50 ? 'bg-red-50 text-red-700 border border-red-200' :
                                        aiResult.score > 0 ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                            'bg-green-50 text-green-700 border border-green-200'
                                        }`}>
                                        {aiResult.score} / 100
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center py-3">
                                <span className="text-gray-500 md:w-1/3 font-medium">Recycling Viability:</span>
                                <span className="text-green-600 font-bold">{aiResult.viability}</span>
                            </div>
                        </div>

                        <div className="mt-10 text-center border-t border-gray-100 pt-8">
                            <p className="text-sm text-gray-500 mb-4">Ready to recycle this device? Provide your pickup details to connect with a distributor.</p>
                            <button
                                // ---> UPDATED LINE HERE <---
                                onClick={() => navigate('/details', { state: aiResult })}
                                className="w-full md:w-auto bg-green-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-700 hover:shadow-lg transition transform hover:-translate-y-1"
                            >
                                Proceed to Next Step →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScannerPage;