import React from 'react';
import '../styles/placeholderwidget.css';

const PlaceholderWidget = ({ widgetName, widgetIcon, widgetDescription }) => {
  return (
    <div className="placeholder-widget">
      <div className="placeholder-icon">{widgetIcon}</div>
      <h2 className="placeholder-title">{widgetName}</h2>
      <p className="placeholder-description">{widgetDescription}</p>
      
      <div className="placeholder-content">
        <div className="construction-banner">
          <p>🚧 UNDER CONSTRUCTION 🚧</p>
          <p className="construction-subtitle">This widget is coming soon!</p>
        </div>
        
        <div className="placeholder-mockup">
          <div className="mockup-line"></div>
          <div className="mockup-line short"></div>
          <div className="mockup-line"></div>
          <div className="mockup-line medium"></div>
          <div className="mockup-line"></div>
          <div className="mockup-line short"></div>
        </div>
        
        <p className="placeholder-footer">
          Stay tuned for updates! This feature will be<br />
          implemented in a future release.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderWidget;
