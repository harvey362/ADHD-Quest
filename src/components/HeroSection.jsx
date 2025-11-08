import React from 'react';

const HeroSection = ({ onEnterApp }) => {
  const handleCTAClick = () => {
    if (onEnterApp) {
      onEnterApp();
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-logo glow-strong">
          &gt; ADHD QUEST_
        </h1>
        
        <p className="hero-tagline">
          LEVEL UP YOUR PRODUCTIVITY
        </p>
        
        <p className="hero-description">
          Transform overwhelming tasks into achievable quests. 
          Break down the impossible. Earn XP. Level up. 
          Win at life, one step at a time.
        </p>
        
        <button className="cta-button" onClick={handleCTAClick}>
          [ START YOUR QUEST ]
        </button>
        
        <div className="scroll-indicator">
          <span className="scroll-text">SCROLL TO EXPLORE</span>
          <span className="scroll-arrow">▼</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
