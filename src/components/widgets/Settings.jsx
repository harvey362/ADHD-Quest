import React from 'react';
import '../styles/settings.css';

const Settings = ({ settings, onSettingsChange }) => {
  const themes = [
    { id: 'classic', name: 'CLASSIC', color: '#00FF00', description: 'Original Green' },
    { id: 'danger', name: 'DANGER', color: '#FF0000', description: 'Red Alert' },
    { id: 'cool', name: 'COOL', color: '#00FFFF', description: 'Cyan Wave' },
    { id: 'retro', name: 'RETRO', color: '#FF00FF', description: 'Purple Haze' },
    { id: 'arcade', name: 'ARCADE', color: '#FFFF00', description: 'Gold Rush' },
    { id: 'flame', name: 'FLAME', color: '#FF8800', description: 'Orange Fire' }
  ];

  const handleThemeChange = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    onSettingsChange({ ...settings, theme: themeId, themeColor: theme.color });
  };

  const handleToggle = (setting) => {
    onSettingsChange({ ...settings, [setting]: !settings[setting] });
  };

  const handleResetData = () => {
    if (window.confirm('⚠️ WARNING: This will delete ALL tasks, quests, and progress. Are you absolutely sure?')) {
      if (window.confirm('This cannot be undone. Delete everything?')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const handleResetXP = () => {
    if (window.confirm('Reset your XP and level back to 1? Tasks will remain.')) {
      onSettingsChange({ ...settings, resetXP: true });
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">[ SYSTEM CONFIGURATION ]</h2>

      {/* Theme Selection */}
      <div className="settings-section">
        <h3 className="section-title">THEME COLOR</h3>
        <p className="section-description">Choose your interface color scheme</p>
        
        <div className="theme-grid">
          {themes.map(theme => (
            <div
              key={theme.id}
              className={`theme-option ${settings.theme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
              style={{
                borderColor: theme.color,
                backgroundColor: settings.theme === theme.id ? `${theme.color}22` : 'transparent'
              }}
            >
              <div 
                className="theme-color-preview" 
                style={{ backgroundColor: theme.color }}
              />
              <div className="theme-info">
                <span className="theme-name" style={{ color: theme.color }}>
                  {theme.name}
                </span>
                <span className="theme-description">{theme.description}</span>
              </div>
              {settings.theme === theme.id && (
                <span className="theme-active-indicator" style={{ color: theme.color }}>
                  ✓ ACTIVE
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Visual Effects */}
      <div className="settings-section">
        <h3 className="section-title">VISUAL EFFECTS</h3>
        
        <div className="toggle-option">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={settings.scanlines}
              onChange={() => handleToggle('scanlines')}
              className="toggle-checkbox"
            />
            <span className="toggle-text">SCANLINES - CRT monitor effect</span>
          </label>
        </div>

        <div className="toggle-option">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={settings.glowEffects}
              onChange={() => handleToggle('glowEffects')}
              className="toggle-checkbox"
            />
            <span className="toggle-text">GLOW EFFECTS - Text & border glow</span>
          </label>
        </div>

        <div className="toggle-option">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={settings.animations}
              onChange={() => handleToggle('animations')}
              className="toggle-checkbox"
            />
            <span className="toggle-text">ANIMATIONS - Motion effects</span>
          </label>
        </div>
      </div>

      {/* Audio Settings */}
      <div className="settings-section">
        <h3 className="section-title">AUDIO</h3>
        
        <div className="toggle-option">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={() => handleToggle('soundEffects')}
              className="toggle-checkbox"
            />
            <span className="toggle-text">SOUND EFFECTS - Button clicks & notifications</span>
          </label>
        </div>

        <div className="toggle-option">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={settings.levelUpSound}
              onChange={() => handleToggle('levelUpSound')}
              className="toggle-checkbox"
            />
            <span className="toggle-text">LEVEL UP SOUND - Victory fanfare</span>
          </label>
        </div>
      </div>

      {/* Timer Settings */}
      <div className="settings-section">
        <h3 className="section-title">SPEEDRUN TIMER</h3>
        
        <div className="toggle-option">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={settings.showSubtaskTimer}
              onChange={() => handleToggle('showSubtaskTimer')}
              className="toggle-checkbox"
            />
            <span className="toggle-text">SHOW TIMER ON SUBTASKS - Display elapsed time</span>
          </label>
        </div>

        <div className="toggle-option">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={settings.autoStartTimer}
              onChange={() => handleToggle('autoStartTimer')}
              className="toggle-checkbox"
            />
            <span className="toggle-text">AUTO-START TIMER - Begin on first check</span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger-section">
        <h3 className="section-title danger-title">⚠️ DANGER ZONE ⚠️</h3>
        
        <button onClick={handleResetXP} className="danger-btn">
          RESET XP & LEVEL
        </button>
        
        <button onClick={handleResetData} className="danger-btn critical">
          🗑️ DELETE ALL DATA
        </button>
        
        <p className="danger-warning">
          Warning: These actions cannot be undone!
        </p>
      </div>

      {/* App Info */}
      <div className="settings-section app-info">
        <p>ADHD QUEST v0.2.0</p>
        <p>Phase 1b - Widget System</p>
        <p>Build: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default Settings;
