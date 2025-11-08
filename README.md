# ADHD QUEST - Productivity Dashboard

> Level up your productivity through gamification

## 🎮 Overview

ADHD Quest is a web-based productivity dashboard designed specifically for individuals with ADHD and executive dysfunction. It transforms overwhelming tasks into manageable quests, rewarding completion with XP and progression through a leveling system.

**Current Status:** Phase 1a - Landing Page Complete ✅

## ✨ Features (Planned)

- **AI Task Breakdown**: Automatically split tasks into actionable subtasks
- **Gamification System**: Earn XP (10 per subtask), level up from 1-100
- **Emergency Mode**: Simplified interface for high-overwhelm moments
- **Tool Dashboard**: Pomodoro timer, habit tracker, mood logger, and more
- **Retro Aesthetic**: Black & green terminal-inspired 8-bit design

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Extract the project folder** to your desired location

2. **Navigate to the project directory**:
   ```bash
   cd adhd-productivity-app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
adhd-productivity-app/
├── package.json              # Project dependencies
├── public/
│   ├── index.html           # HTML template with pixel fonts
│   └── fonts/               # (Reserved for custom fonts)
├── src/
│   ├── index.js             # React entry point
│   ├── App.js               # Main app component
│   ├── components/
│   │   ├── LandingPage.jsx  # Main landing page
│   │   ├── HeroSection.jsx  # Hero section with CTA
│   │   ├── FeaturesSection.jsx  # Features grid
│   │   ├── PreviewSection.jsx   # Dashboard preview
│   │   └── Footer.jsx       # Footer component
│   ├── styles/
│   │   ├── global.css       # Global styles & theme
│   │   └── landing.css      # Landing page styles
│   └── assets/              # (Reserved for images/icons)
└── README.md
```

## 🎨 Design System

### Color Palette
- **Background**: Pure Black (#000000)
- **Foreground**: Bright Green (#00FF00)
- **No other colors** (strict green/black theme)

### Typography
- **Primary Font**: Press Start 2P (8-bit pixel font)
- **Secondary Font**: VT323 (monospace terminal font)
- **Font loaded from**: Google Fonts

### Aesthetic
- Retro 1980s terminal/computing aesthetic
- Wireframe graphics and line art
- ASCII art dashboard mockup
- Optional scanline and CRT effects

## 📋 BRD Requirements Tracking

### Phase 1a - Landing Page (COMPLETED)

#### Visual Design ✅
- [x] FR-00-01: Pure black background
- [x] FR-00-02: Bright green text
- [x] FR-00-03: No other colors
- [x] FR-00-04: 8-bit/pixel font for all text
- [x] FR-00-05: Pixel-style buttons
- [x] FR-00-06: Green wireframe borders
- [x] FR-00-07: ASCII/pixel art visuals

#### Content Sections ✅
- [x] FR-00-08: Hero section with app name/logo
- [x] FR-00-09: Tagline with value proposition
- [x] FR-00-10: Feature preview (5 key features)
- [x] FR-00-11: Dashboard mockup/illustration (ASCII art)
- [x] FR-00-12: Call-to-action button
- [x] FR-00-13: Footer with minimal info

#### Interactions ✅
- [x] FR-00-14: CTA button hover state
- [x] FR-00-15: CTA button navigation (placeholder)
- [x] FR-00-16: Smooth scroll behavior
- [x] FR-00-17: 8-bit style interactions

#### Layout ✅
- [x] FR-00-18: Desktop-first responsive design
- [x] FR-00-19: Centered content with margins
- [x] FR-00-20: Section spacing
- [x] FR-00-21: Grid-based layout

#### Typography ✅
- [x] FR-00-22: Clear heading hierarchy
- [x] FR-00-23: Readable text at desktop resolution
- [x] FR-00-24: Pixel font styling maintained
- [x] FR-00-25: Optimized line height/spacing

## 🛠️ Tech Stack

- **React** 18.2.0
- **React Scripts** 5.0.1
- **CSS3** (No frameworks - custom styling)
- **Google Fonts** (Press Start 2P, VT323)

## 📦 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner (when tests are added)

## 🚧 Roadmap

### Phase 1b - Core Functionality (Next)
- [ ] Task input interface
- [ ] Mock AI task breakdown
- [ ] Subtask management (add/edit/delete/complete)
- [ ] XP & leveling system
- [ ] Progress visualization
- [ ] Emergency Mode
- [ ] Local storage persistence

### Phase 2 - Backend Integration
- [ ] User authentication
- [ ] Cloud database (Firebase/Supabase)
- [ ] Cross-device sync

### Phase 3 - Real AI Integration
- [ ] Claude API / OpenAI integration
- [ ] Natural language processing
- [ ] Context-aware task generation

### Phase 4 - Extended Features
- [ ] Pomodoro timer
- [ ] Habit tracker
- [ ] Mood/energy logger
- [ ] Calendar integration
- [ ] Daily planning interface
- [ ] Medication reminders
- [ ] Time estimation practice
- [ ] Distraction log

## 🎯 Design Principles

1. **Minimal friction**: Don't let the app become another task
2. **Positive reinforcement**: Only rewards, no penalties
3. **Visual feedback**: Immediate response to every action
4. **Emergency-ready**: Always accessible simplified mode
5. **Distinctive aesthetic**: Memorable retro computing vibe

## 🤝 Contributing

This is currently a solo project in MVP development phase. Contributions, feedback, and suggestions are welcome!

## 📄 License

[To be determined]

## 🙏 Acknowledgments

- Built for the ADHD community and executive dysfunction warriors
- Inspired by gamification mechanics and retro computing aesthetics
- Designed with accessibility and usability as core priorities

---

**Current Version:** 0.1.0 - Landing Page MVP  
**Last Updated:** November 2025  
**Status:** Phase 1a Complete ✅ | Phase 1b In Progress ⏳

---

## 💡 Quick Tips

### First Time Running?
If you see errors after `npm install`, try:
```bash
npm install --legacy-peer-deps
```

### Port Already in Use?
If port 3000 is occupied:
```bash
PORT=3001 npm start
```

### Want to Deploy?
Build the production version:
```bash
npm run build
```
Then deploy the `build` folder to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)

---

**[ PRESS START TO BEGIN YOUR QUEST ]**
