import React, { useState, useEffect } from 'react';
import { setSoundSettings, setClickSound, setKeySound, playSound } from '../utils/soundEffects';
import '../styles/settings.css';

const Settings = ({ userSettings, onUpdateSettings, onResetAll, onResetXP }) => {
  const [localSettings, setLocalSettings] = useState(userSettings || {
    themeColor: '#00FF00',
    scanlinesEnabled: true,
    soundEnabled: false,
    soundSettings: {
      clickSoft: true,
      clickHard: true,
      clickDigital: true,
      keyTypewriter: true,
      keyThock: true,
      keyMembrane: true,
      effects: true,
    },
    currentClickSound: 'clickSoft',
    currentKeySound: 'keyTypewriter',
    hiddenWidgets: []
  });

  const [showAdvancedSound, setShowAdvancedSound] = useState(false);

  const colorPresets = [
    { name: 'CLASSIC', value: '#00FF00', label: '🟢' },
    { name: 'DANGER', value: '#FF0000', label: '🔴' },
    { name: 'COOL', value: '#00FFFF', label: '🔵' },
    { name: 'RETRO', value: '#FF00FF', label: '🟣' },
    { name: 'ARCADE', value: '#FFFF00', label: '🟡' },
    { name: 'FLAME', value: '#FF6600', label: '🟠' }
  ];

  // Sync sound settings with sound effects system
  useEffect(() => {
    if (localSettings.soundSettings) {
      setSoundSettings(localSettings.soundSettings);
    }
    if (localSettings.currentClickSound) {
      setClickSound(localSettings.currentClickSound);
    }
    if (localSettings.currentKeySound) {
      setKeySound(localSettings.currentKeySound);
    }
  }, [localSettings.soundSettings, localSettings.currentClickSound, localSettings.currentKeySound]);

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

  const handleSoundToggle = (soundType) => {
    const newSoundSettings = {
      ...localSettings.soundSettings,
      [soundType]: !localSettings.soundSettings[soundType]
    };
    const newSettings = {
      ...localSettings,
      soundSettings: newSoundSettings
    };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const handleClickSoundChange = (type) => {
    const newSettings = {
      ...localSettings,
      currentClickSound: type
    };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);

    // Play a preview
    if (localSettings.soundEnabled) {
      playSound(type);
    }
  };

  const handleKeySoundChange = (type) => {
    const newSettings = {
      ...localSettings,
      currentKeySound: type
    };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);

    // Play a preview
    if (localSettings.soundEnabled) {
      playSound(type);
    }
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

        {localSettings.soundEnabled && (
          <>
            <button
              className="toggle-advanced-sound-btn"
              onClick={() => setShowAdvancedSound(!showAdvancedSound)}
            >
              {showAdvancedSound ? '▼' : '►'} ADVANCED SOUND OPTIONS
            </button>

            {showAdvancedSound && (
              <div className="advanced-sound-options">
                {/* Click Sound Selection */}
                <div className="sound-category">
                  <h4>🖱️ CLICK SOUNDS</h4>
                  <p className="sound-description">Choose your click sound style</p>

                  <div className="sound-selector">
                    <label className={localSettings.currentClickSound === 'clickSoft' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="clickSound"
                        checked={localSettings.currentClickSound === 'clickSoft'}
                        onChange={() => handleClickSoundChange('clickSoft')}
                      />
                      <span>SOFT CLICK</span>
                    </label>

                    <label className={localSettings.currentClickSound === 'clickHard' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="clickSound"
                        checked={localSettings.currentClickSound === 'clickHard'}
                        onChange={() => handleClickSoundChange('clickHard')}
                      />
                      <span>HARD CLICK</span>
                    </label>

                    <label className={localSettings.currentClickSound === 'clickDigital' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="clickSound"
                        checked={localSettings.currentClickSound === 'clickDigital'}
                        onChange={() => handleClickSoundChange('clickDigital')}
                      />
                      <span>DIGITAL BEEP</span>
                    </label>
                  </div>
                </div>

                {/* Keyboard Sound Selection */}
                <div className="sound-category">
                  <h4>⌨️ KEYBOARD SOUNDS</h4>
                  <p className="sound-description">Choose your typing sound style</p>

                  <div className="sound-selector">
                    <label className={localSettings.currentKeySound === 'keyTypewriter' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="keySound"
                        checked={localSettings.currentKeySound === 'keyTypewriter'}
                        onChange={() => handleKeySoundChange('keyTypewriter')}
                      />
                      <span>TYPEWRITER</span>
                    </label>

                    <label className={localSettings.currentKeySound === 'keyThock' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="keySound"
                        checked={localSettings.currentKeySound === 'keyThock'}
                        onChange={() => handleKeySoundChange('keyThock')}
                      />
                      <span>MECHANICAL THOCK</span>
                    </label>

                    <label className={localSettings.currentKeySound === 'keyMembrane' ? 'active' : ''}>
                      <input
                        type="radio"
                        name="keySound"
                        checked={localSettings.currentKeySound === 'keyMembrane'}
                        onChange={() => handleKeySoundChange('keyMembrane')}
                      />
                      <span>SOFT MEMBRANE</span>
                    </label>
                  </div>
                </div>

                {/* Individual Sound Toggles */}
                <div className="sound-category">
                  <h4>🎵 INDIVIDUAL SOUND TOGGLES</h4>

                  <div className="sound-toggles">
                    <div className="setting-toggle compact">
                      <label>
                        <input
                          type="checkbox"
                          checked={localSettings.soundSettings?.effects !== false}
                          onChange={() => handleSoundToggle('effects')}
                        />
                        <span>GAME EFFECTS (Success, Complete, Error)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
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
            <span>0.4.1 - Enhanced</span>
          </div>
          <div className="info-row">
            <span>BUILD:</span>
            <span>Arcade Edition</span>
          </div>
          <div className="info-row">
            <span>STATUS:</span>
            <span>Feature Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
