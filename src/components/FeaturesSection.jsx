import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      icon: '⚡',
      title: 'AI TASK BREAKDOWN',
      description: 'Automatically split overwhelming tasks into bite-sized, actionable steps. No more paralysis.'
    },
    {
      icon: '🎮',
      title: 'GAMIFICATION SYSTEM',
      description: 'Earn XP for every completed subtask. Level up from 1 to 100. Turn productivity into a game.'
    },
    {
      icon: '🚨',
      title: 'EMERGENCY MODE',
      description: 'Feeling overwhelmed? One-click access to simplified interface. Just one task. Just get started.'
    },
    {
      icon: '📊',
      title: 'PROGRESS TRACKING',
      description: 'Visual feedback on every win. Watch your XP grow. See your level rise. Feel the momentum.'
    },
    {
      icon: '🛠️',
      title: 'PRODUCTIVITY TOOLS',
      description: 'Focus timer, habit tracker, mood logger, and more. Everything you need in one dashboard.'
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="container">
        <h2 className="section-title">
          [ CORE FEATURES ]
        </h2>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <span className="feature-icon">{feature.icon}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
