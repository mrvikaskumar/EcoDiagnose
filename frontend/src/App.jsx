import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all your pages
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import DetailsPage from './pages/DetailsPage';
import SummaryPage from './pages/SummaryPage';
import PartnerGateway from './pages/partner/PartnerGateway';
import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerRegistration from './pages/partner/PartnerRegistration';
import PartnerOTPVerify from './pages/partner/PartnerOTPVerify';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import TrackRequest from './pages/TrackRequest';
import AboutUs from './pages/AboutUs';
import HowItWorks from './pages/HowItWorks';
import AdminDashboard from './pages/AdminDashboard';
import Feedback from './pages/Feedback';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Import Components
import Footer from './components/Footer';
// Notice: Navbar import is completely removed from here!

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen App">

        {/* Navbar is NO LONGER here, so it won't force itself on every page */}

        <div className="grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/details" element={<DetailsPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/partner/portal" element={<PartnerGateway />} />
            <Route path="/partner/login" element={<PartnerLogin />} />
            <Route path="/partner/register" element={<PartnerRegistration />} />
            <Route path="/partner/verify-otp" element={<PartnerOTPVerify />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/track" element={<TrackRequest />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/feedback" element={<Feedback />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;