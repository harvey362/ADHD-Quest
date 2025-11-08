import React, { useState } from 'react';
import '../styles/settings.css';

const Settings = ({ userSettings, onUpdateSettings, onResetAll, onResetXP }) => {
  const [localSettings, setLocalSettings] = useState(userSettings || {
    themeColor: '#00FF00',
    scanlinesEnabled: true,
    soundEnabled: false,
    hiddenWidgets: []
  });

  const colorPresets = [
    { name: 'CLASSIC', value: '#00FF00', label: '🟢' },
    { name: 'DANGER', value: '#FF0000', label: '🔴' },
    { name: 'COOL', value: '#00FFFF', label: '🔵' },
    { name: 'RETRO', value: '#FF00FF', label: '🟣' },
    { name: 'ARCADE', value: '#FFFF00', label: '🟡' },
    { name: 'FLAME', value: '#FF6600', label: '🟠' }
  ];

  const handleColorChange = (color) => {
    const newSettings = { ...localSettings, themeColor: color };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const handleToggle = (setting) => {
    const newSettings = { ...localSettings, [setting]: !localSettings[setting] };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const handleResetAll = () => {
    if (window.confirm('Reset ALL data? This will delete all tasks, XP, and settings. This cannot be undone!')) {
      if (window.confirm('Are you ABSOLUTELY sure? This action is permanent!')) {
        onResetAll();
      }
    }
  };

  const handleResetXP = () => {
    if (window.confirm('Reset XP and Level back to 1? Tasks will remain.')) {
      onResetXP();
    }
  };

  return (
    <div className="settings-widget">
      <h2>[ SETTINGS ]</h2>

      {/* Theme Color */}
      <div className="settings-section">
        <h3>⚙️ THEME COLOR</h3>
        <p className="setting-description">Choose your primary color scheme</p>
        <div className="color-grid">
          {colorPresets.map((preset) => (
            <button
              key={preset.value}
              className={`color-preset ${localSettings.themeColor === preset.value ? 'active' : ''}`}
              onClick={() => handleColorChange(preset.value)}
              style={{
                borderColor: preset.value,
                boxShadow: localSettings.themeColor === preset.value ? `0 0 20px ${preset.value}` : 'none'
              }}
            >
              <span className="preset-emoji">{preset.label}</span>
              <span className="preset-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Options */}
      <div className="settings-section">
        <h3>👁️ VISUAL OPTIONS</h3>
        
        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={localSettings.scanlinesEnabled}
              onChange={() => handleToggle('scanlinesEnabled')}
            />
            <span>SCANLINE EFFECT</span>
          </label>
          <p className="setting-description">Classic CRT monitor scanlines</p>
        </div>
      </div>

      {/* Audio Options */}
      <div className="settings-section">
        <h3>🔊 AUDIO OPTIONS</h3>
        
        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={localSettings.soundEnabled}
              onChange={() => handleToggle('soundEnabled')}
            />
            <span>SOUND EFFECTS</span>
          </label>
          <p className="setting-description">Enable retro sound effects for interactions</p>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section danger-zone">
        <h3>⚠️ DATA MANAGEMENT</h3>
        
        <button 
          onClick={handleResetXP}
          className="reset-xp-btn"
        >
          RESET XP & LEVEL
        </button>
        <p className="setting-description">Reset progress to Level 1, keep tasks</p>
        
        <button 
          onClick={handleResetAll}
          className="reset-all-btn"
        >
          ⚠️ RESET ALL DATA ⚠️
        </button>
        <p className="setting-description">Delete everything - cannot be undone!</p>
      </div>

      {/* App Info */}
      <div className="settings-section app-info">
        <h3>📋 APP INFO</h3>
        <div className="info-grid">
          <div className="info-row">
            <span>VERSION:</span>
            <span>0.2.0 - Phase 1b</span>
          </div>
          <div className="info-row">
            <span>BUILD:</span>
            <span>Arcade Edition</span>
          </div>
          <div className="info-row">
            <span>STATUS:</span>
            <span>MVP Active Development</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
