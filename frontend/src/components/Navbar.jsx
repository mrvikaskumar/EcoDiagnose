import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Helper function to navigate and close mobile menu
    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white shadow-sm w-full relative z-50">
            {/* Main Navbar Container */}
            <div className="flex justify-between items-center px-6 lg:px-12 py-5 w-full">

                {/* LOGO */}
                <div
                    onClick={() => handleNavigation('/')}
                    className="text-2xl font-extrabold text-green-600 tracking-tight flex items-center gap-2 cursor-pointer"
                >
                    <span className="text-3xl">🌱</span>
                    Eco<span className="text-gray-800">Diagnose</span>
                </div>

                {/* DESKTOP MENU - Your Exact Original Styling */}
                <div className="hidden lg:flex space-x-4 items-center">
                    <button
                        onClick={() => navigate('/about')}
                        className="bg-gray-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600 transition duration-200"
                    >
                        About Us
                    </button>
                    <button
                        onClick={() => navigate('/how-it-works')}
                        className="bg-gray-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600 transition duration-200"
                    >
                        How It Works
                    </button>
                    <button
                        onClick={() => navigate('/track')}
                        className="bg-gray-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600 transition duration-200"
                    >
                        Track Request
                    </button>
                    <button
                        onClick={() => navigate('/partner/portal')}
                        className="bg-gray-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-600 transition duration-200"
                    >
                        Partner Portal
                    </button>
                    <button
                        onClick={() => navigate('/scanner')}
                        className="ml-4 bg-linear-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        Recycle Your Device
                    </button>
                </div>

                {/* MOBILE HAMBURGER BUTTON */}
                <div className="lg:hidden flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-800 hover:text-green-600 focus:outline-none text-3xl transition-colors"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* MOBILE DROPDOWN MENU */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 flex flex-col px-6 py-4 space-y-3 z-50 animate-fade-in">
                    <button
                        onClick={() => handleNavigation('/about')}
                        className="w-full bg-gray-800 text-white px-5 py-3 rounded-lg font-medium hover:bg-green-600 transition duration-200 text-left"
                    >
                        About Us
                    </button>
                    <button
                        onClick={() => handleNavigation('/how-it-works')}
                        className="w-full bg-gray-800 text-white px-5 py-3 rounded-lg font-medium hover:bg-green-600 transition duration-200 text-left"
                    >
                        How It Works
                    </button>
                    <button
                        onClick={() => handleNavigation('/track')}
                        className="w-full bg-gray-800 text-white px-5 py-3 rounded-lg font-medium hover:bg-green-600 transition duration-200 text-left"
                    >
                        Track Request
                    </button>
                    <button
                        onClick={() => handleNavigation('/partner/portal')}
                        className="w-full bg-gray-800 text-white px-5 py-3 rounded-lg font-medium hover:bg-green-600 transition duration-200 text-left"
                    >
                        Partner Portal
                    </button>

                    <hr className="border-gray-200 my-2" />

                    <button
                        onClick={() => handleNavigation('/scanner')}
                        className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-full font-bold shadow-md text-center mt-2"
                    >
                        Recycle Your Device
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;