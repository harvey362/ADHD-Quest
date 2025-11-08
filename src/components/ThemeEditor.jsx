/**
 * Theme Editor
 *
 * Allows users to customize color palettes and preview changes in real-time.
 * Supports built-in presets and custom color creation.
 */

import React, { useState, useEffect } from 'react';
import '../styles/themeeditor.css';

function ThemeEditor({ currentTheme, onThemeChange, onBack }) {
  const [customColor, setCustomColor] = useState('#00FF00');
  const [previewColor, setPreviewColor] = useState(currentTheme || '#00FF00');

  const presets = [
    { name: 'Classic Green', color: '#00FF00', icon: '🟢' },
    { name: 'Electric Blue', color: '#00AAFF', icon: '🔵' },
    { name: 'Hot Pink', color: '#FF00AA', icon: '🔴' },
    { name: 'Golden Yellow', color: '#FFAA00', icon: '🟡' },
    { name: 'Purple Haze', color: '#AA00FF', icon: '🟣' },
    { name: 'Mint Green', color: '#00FFAA', icon: '🟢' },
  ];

  useEffect(() => {
    applyThemePreview(previewColor);
  }, [previewColor]);

  const applyThemePreview = (color) => {
    const root = document.documentElement;
    root.style.setProperty('--color-green', color);
    root.style.setProperty('--color-green-dark', adjustBrightness(color, -50));
    root.style.setProperty('--color-green-darker', adjustBrightness(color, -100));
  };

  const adjustBrightness = (hexColor, adjustment) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.min(255, r + adjustment));
    const newG = Math.max(0, Math.min(255, g + adjustment));
    const newB = Math.max(0, Math.min(255, b + adjustment));

    return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
  };

  const handleSelectPreset = (color) => {
    setPreviewColor(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (color) => {
    setCustomColor(color);
    setPreviewColor(color);
  };

  const handleApply = () => {
    if (onThemeChange) {
      onThemeChange(previewColor);
    }

    // Save to localStorage
    const settings = JSON.parse(localStorage.getItem('adhd_quest_settings') || '{}');
    settings.primaryColor = previewColor;
    localStorage.setItem('adhd_quest_settings', JSON.stringify(settings));
  };

  const handleReset = () => {
    const defaultColor = '#00FF00';
    setPreviewColor(defaultColor);
    setCustomColor(defaultColor);
  };

  return (
    <div className="theme-editor">
      <div className="theme-header">
        <button className="back-button" onClick={onBack}>
          ← BACK
        </button>
        <h1 className="theme-title">🎨 THEME EDITOR</h1>
      </div>

      <div className="theme-preview-section">
        <h2>Preview</h2>
        <div className="preview-container">
          <div className="preview-box">
            <h3>ADHD QUEST</h3>
            <p>The quick brown fox jumps over the lazy dog</p>
            <button className="preview-button">Sample Button</button>
            <div className="preview-progress-bar">
              <div className="preview-progress-fill" style={{ width: '75%' }}></div>
            </div>
            <div className="preview-xp-bar">
              <div className="preview-xp-fill" style={{ width: '60%' }}></div>
              <span className="preview-xp-text">Level 10 - 600/1000 XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="theme-presets-section">
        <h2>Presets</h2>
        <div className="presets-grid">
          {presets.map((preset, index) => (
            <button
              key={index}
              className={`preset-button ${previewColor === preset.color ? 'active' : ''}`}
              onClick={() => handleSelectPreset(preset.color)}
              style={{
                borderColor: preset.color,
                boxShadow: previewColor === preset.color ? `0 0 20px ${preset.color}` : 'none',
              }}
            >
              <div className="preset-icon">{preset.icon}</div>
              <div className="preset-name">{preset.name}</div>
              <div
                className="preset-color-sample"
                style={{ backgroundColor: preset.color }}
              ></div>
            </button>
          ))}
        </div>
      </div>

      <div className="theme-custom-section">
        <h2>Custom Color</h2>
        <div className="custom-color-picker">
          <input
            type="color"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            className="color-input"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            className="color-text-input"
            placeholder="#00FF00"
          />
        </div>
        <p className="custom-hint">
          Choose any color you like! The system will auto-generate matching shades.
        </p>
      </div>

      <div className="theme-actions">
        <button className="apply-button" onClick={handleApply}>
          APPLY THEME
        </button>
        <button className="reset-button" onClick={handleReset}>
          RESET TO DEFAULT
        </button>
      </div>

      <div className="theme-info">
        <h2>About Themes</h2>
        <p>
          ADHD Quest uses a monochromatic theme system. Choose your primary color,
          and we'll automatically generate darker shades for contrast and hierarchy.
        </p>
        <p>
          Your theme preference is saved locally and will persist across sessions.
        </p>
      </div>
    </div>
  );
}

export default ThemeEditor;
