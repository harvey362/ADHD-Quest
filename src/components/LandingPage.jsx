import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import PreviewSection from './PreviewSection';
import Footer from './Footer';
import '../styles/landing.css';

const LandingPage = ({ onEnterApp }) => {
  return (
    <div className="landing-page scanlines">
      <HeroSection onEnterApp={onEnterApp} />
      <FeaturesSection />
      <PreviewSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
