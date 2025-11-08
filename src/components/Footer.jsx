import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>ADHD QUEST v0.1.0 | MVP Phase 1a</p>
        <p>© {currentYear} | Built for executive dysfunction warriors</p>
        
        <div className="footer-links">
          <a href="#features" className="footer-link">Features</a>
          <a href="#preview" className="footer-link">Preview</a>
          <a href="#about" className="footer-link">About</a>
          <a href="#contact" className="footer-link">Contact</a>
        </div>
        
        <p className="mt-sm" style={{ fontSize: '14px', fontFamily: 'VT323' }}>
          [ Press START to begin your quest ]
        </p>
      </div>
    </footer>
  );
};

export default Footer;
