import React from 'react';
import '../styles/placeholder.css';

const PlaceholderWidget = ({ name, icon, description }) => {
  return (
    <div className="placeholder-widget">
      <div className="placeholder-content">
        <div className="placeholder-icon">{icon}</div>
        <h2 className="placeholder-title">{name}</h2>
        <p className="placeholder-description">{description}</p>
        
        <div className="placeholder-box">
          <p>[ UNDER CONSTRUCTION ]</p>
          <div className="construction-bars">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <p className="placeholder-note">This widget will be available in a future update!</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderWidget;
