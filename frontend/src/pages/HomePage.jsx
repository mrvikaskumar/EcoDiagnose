import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // <-- IMPORTED JUST FOR THE HOME PAGE

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 w-full overflow-x-hidden">

            {/* NEW NAVBAR LIVES ONLY ON THE HOMEPAGE NOW */}
            <Navbar />

            {/* IMPACT HERO SECTION */}
            <header className="relative w-full px-6 py-24 lg:py-32 flex flex-col items-center justify-center text-center bg-green-50/50">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                        Give Your Old Electronics a <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-500">Second Life.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Every year, millions of tons of e-waste end up in landfills, leaking harmful toxins into our soil. Join our mission to responsibly recycle your devices, protect the environment, and build a sustainable future.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button
                            onClick={() => navigate('/scanner')}
                            className="w-full sm:w-auto bg-linear-to-r from-green-500 to-emerald-600 text-white text-lg px-8 py-4 rounded-full font-bold hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Start Recycling Now
                        </button>
                    </div>
                </div>
            </header>

            {/* WHY RECYCLE E-WASTE SECTION */}
            <section className="w-full bg-white py-24 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-16">
                        Why Your E-Waste Matters
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">

                        {/* Impact Card 1 */}
                        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mb-6">
                                ⚠️
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Prevent Toxic Pollution</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Smartphones and laptops contain hazardous materials like lead and mercury. Proper disposal ensures these chemicals never reach our soil and water supply.
                            </p>
                        </div>

                        {/* Impact Card 2 */}
                        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-3xl mb-6">
                                🔄
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Recover Rare Resources</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Your old devices are packed with precious metals like gold, silver, and copper. Recycling extracts these materials so they can be reused to build new tech.
                            </p>
                        </div>

                        {/* Impact Card 3 */}
                        <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-3xl mb-6">
                                🌍
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Reduce Carbon Footprint</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Mining new materials for electronics generates massive carbon emissions. By recycling what we already have, we drastically cut down on greenhouse gases.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;