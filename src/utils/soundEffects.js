/**
 * Sound Effects System for ADHD Quest
 * Uses Web Audio API to generate retro-style sounds
 */

class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.enabled = false;
    this.init();
  }

  init() {
    try {
      // Create audio context on user interaction (required by browsers)
      if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;

    // Resume audio context if enabled
    if (enabled && this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  /**
   * Play a sound effect
   * @param {string} type - Type of sound effect
   */
  play(type) {
    if (!this.enabled || !this.audioContext) return;

    try {
      // Resume context if suspended (browser requirement)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      switch (type) {
        case 'click':
          this.playClick();
          break;
        case 'click-soft':
          this.playClickSoft();
          break;
        case 'click-hard':
          this.playClickHard();
          break;
        case 'click-mechanical':
          this.playClickMechanical();
          break;
        case 'type-typewriter':
          this.playTypeTypewriter();
          break;
        case 'type-thock':
          this.playTypeThock();
          break;
        case 'type-soft':
          this.playTypeSoft();
          break;
        case 'type-clack':
          this.playTypeClack();
          break;
        case 'success':
          this.playSuccess();
          break;
        case 'complete':
          this.playComplete();
          break;
        case 'error':
          this.playError();
          break;
        case 'start':
          this.playStart();
          break;
        case 'stop':
          this.playStop();
          break;
        case 'powerup':
          this.playPowerUp();
          break;
        case 'coin':
          this.playCoin();
          break;
        default:
          console.warn('Unknown sound effect:', type);
      }
    } catch (e) {
      console.warn('Error playing sound:', e);
    }
  }

  /**
   * Create and play a tone
   */
  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Click sound - short blip
   */
  playClick() {
    this.playTone(800, 0.05, 'square', 0.2);
  }

  /**
   * Success sound - ascending tones
   */
  playSuccess() {
    this.playTone(523, 0.1, 'sine', 0.2); // C
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 100); // E
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.2), 200); // G
  }

  /**
   * Complete sound - power-up style
   */
  playComplete() {
    const frequencies = [262, 330, 392, 523, 659, 784, 1047];
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.1, 'sine', 0.15), i * 50);
    });
  }

  /**
   * Error sound - descending buzz
   */
  playError() {
    this.playTone(400, 0.1, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(300, 0.1, 'sawtooth', 0.2), 100);
    setTimeout(() => this.playTone(200, 0.2, 'sawtooth', 0.2), 200);
  }

  /**
   * Start sound - rising tone
   */
  playStart() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  /**
   * Stop sound - falling tone
   */
  playStop() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  /**
   * Power-up sound - ascending arpeggio
   */
  playPowerUp() {
    const notes = [262, 330, 392, 523]; // C, E, G, C
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'square', 0.15), i * 80);
    });
  }

  /**
   * Coin sound - classic coin pickup
   */
  playCoin() {
    this.playTone(988, 0.1, 'sine', 0.2); // B
    setTimeout(() => this.playTone(1319, 0.2, 'sine', 0.2), 100); // E
  }

  /**
   * CLICK SOUNDS
   */

  /**
   * Soft click - gentle, muted sound
   */
  playClickSoft() {
    this.playTone(600, 0.03, 'sine', 0.15);
  }

  /**
   * Hard click - sharp, pronounced sound
   */
  playClickHard() {
    this.playTone(1200, 0.04, 'square', 0.25);
  }

  /**
   * Mechanical click - like a mechanical keyboard or switch
   */
  playClickMechanical() {
    this.playTone(900, 0.02, 'square', 0.2);
    setTimeout(() => this.playTone(400, 0.02, 'square', 0.15), 20);
  }

  /**
   * TYPING SOUNDS
   */

  /**
   * Typewriter sound - classic mechanical typewriter
   */
  playTypeTypewriter() {
    const frequencies = [800, 850, 820, 840];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

    // Main key strike
    this.playTone(freq, 0.05, 'square', 0.18);

    // Mechanical "clack"
    setTimeout(() => this.playTone(300, 0.03, 'square', 0.12), 25);
  }

  /**
   * Thock sound - deep, satisfying mechanical keyboard sound
   */
  playTypeThock() {
    const frequencies = [200, 210, 195, 205];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

    // Deep thock
    this.playTone(freq, 0.08, 'sine', 0.22);

    // Subtle high-frequency click
    setTimeout(() => this.playTone(1200, 0.02, 'square', 0.08), 15);
  }

  /**
   * Soft typing - gentle membrane keyboard sound
   */
  playTypeSoft() {
    const frequencies = [500, 520, 510, 505];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

    this.playTone(freq, 0.04, 'sine', 0.12);
  }

  /**
   * Clack sound - bright, clicky mechanical keyboard
   */
  playTypeClack() {
    const frequencies = [1000, 1050, 980, 1020];
    const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

    // Bright click
    this.playTone(freq, 0.04, 'square', 0.18);

    // Release sound
    setTimeout(() => this.playTone(600, 0.02, 'square', 0.1), 30);
  }
}

// Create singleton instance
const soundEffects = new SoundEffects();

// Export functions
export const initSoundEffects = (enabled) => {
  soundEffects.setEnabled(enabled);
};

export const playSound = (type) => {
  soundEffects.play(type);
};

export const toggleSound = (enabled) => {
  soundEffects.setEnabled(enabled);
};

export const isSoundEnabled = () => {
  return soundEffects.isEnabled();
};

export default soundEffects;
