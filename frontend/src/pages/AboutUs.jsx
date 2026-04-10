import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

            {/* Navigation */}
            <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm sticky top-0 z-50">
                <div onClick={() => navigate('/')} className="text-2xl font-extrabold text-green-600 tracking-tight cursor-pointer flex items-center gap-2">
                    <span className="text-3xl">🌱</span> Eco<span className="text-gray-800">Diagnose</span>
                </div>
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800 font-medium transition">
                    ← Back to Home
                </button>
            </nav>

            {/* Hero Section */}
            <div className="bg-gray-900 text-white py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Pioneering Smart E-Waste Management</h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Millions of tons of electronic waste are generated globally every year. Our mission is to bridge the gap between everyday consumers and certified recyclers using Artificial Intelligence.
                </p>
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem We Solve</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-4">
                            Traditionally, recycling a broken phone or laptop is a manual, tedious process. Scrap dealers strip valuable parts and dump toxic remains like lead and lithium into our soil and rivers.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            We realized the bottleneck was <span className="font-bold text-gray-900">triage</span>—assessing the damage of a device without sending a human expert.
                        </p>
                    </div>
                    <div className="bg-green-50 p-8 rounded-2xl border border-green-100">
                        <h3 className="text-xl font-bold text-green-800 mb-3">Our Core Vision</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3"><span className="text-green-600 font-bold">✓</span> <span className="text-gray-700">Automate damage assessment using computer vision.</span></li>
                            <li className="flex items-start gap-3"><span className="text-green-600 font-bold">✓</span> <span className="text-gray-700">Create a circular economy for spare parts and raw materials.</span></li>
                            <li className="flex items-start gap-3"><span className="text-green-600 font-bold">✓</span> <span className="text-gray-700">Ensure 100% transparent tracking from user to recycler.</span></li>
                        </ul>
                    </div>
                </div>

                {/* The Team / Origin */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-6">🎓</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Roots</h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                        EcoDiagnose was conceptualized and developed by students of NIT Patna. What started as an academic project in deep tech and environmental engineering has evolved into a fully functional, multi-sided marketplace connecting real hardware labs, repair shops, and PROs to local e-waste sources.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;