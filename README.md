# 🎮 ADHD QUEST - Arcade Edition

> *Transform overwhelming tasks into epic quests with AI-powered micro-steps and retro 8-bit vibes*

[![Made with React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Powered by Claude](https://img.shields.io/badge/AI-Claude%20API-8B5CF6?style=flat)](https://www.anthropic.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🕹️ What Is This?

**ADHD Quest** is a gamified productivity app designed specifically for people with ADHD and executive dysfunction. It uses AI to break down overwhelming tasks into ultra-granular micro-steps (like "stand up", "touch the suitcase", "open the suitcase") so you can actually **start** instead of being paralyzed.

Complete micro-steps → Earn XP → Level up from 1-100 → Feel awesome! 🎉

### ✨ Key Features

- 🤖 **AI Task Breakdown** - Claude API creates hyper-detailed subtasks
- 🎯 **3 Granularity Levels** - Quick (5 steps), Detailed (15 steps), Very Detailed (30+ steps)
- ⚡ **10 XP per Subtask** - Instant dopamine hits for ADHD brains
- 📊 **Level System** - Progress from Level 1-100 (exponential XP curve)
- ⏱️ **Speedrun Mode** - Track how long each subtask takes
- 🏆 **Quest Log** - View completed quests with times & XP earned
- 🎨 **6 Color Themes** - Green, Red, Cyan, Purple, Yellow, Orange
- 📺 **CRT Scanlines** - Optional retro screen effect
- 🎪 **Arcade Widget Library** - 11 tools (8 coming soon!)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm
- An [Anthropic API key](https://console.anthropic.com/) (free tier available!)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harvey362/ADHD-Quest.git
   cd ADHD-Quest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key**
   
   Create a `.env` file in the root directory:
   ```bash
   REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
   ```
   
   > 🔑 Get your API key at: https://console.anthropic.com/
   > 
   > ⚠️ **Never commit your `.env` file!** It's already in `.gitignore`

4. **Start the app**
   ```bash
   npm start
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🎮 How to Use

### Creating Your First Quest

1. Click **"START YOUR QUEST"** on the landing page
2. Select the **"Task Crusher"** cartridge from the arcade
3. Enter a task (e.g., "Clean my room")
4. Choose granularity level (Very Detailed recommended!)
5. Click **"BREAK IT DOWN"** and watch the AI magic ✨
6. Check off micro-steps as you complete them
7. Earn 10 XP per step and watch your level grow!

### Speedrun Mode

Want to track your time?
- ✅ Check "Speedrun Mode" before breaking down a task
- ⏱️ Timer starts when you complete the first subtask
- See live elapsed time for each step
- View all your speedrun stats in the Quest Log!

### Arcade Widgets

Currently available:
- 🎯 **Task Crusher** - Main AI task breakdown tool (fully functional)
- 🏆 **Quest Log** - View completed quests with stats (fully functional)
- ⚙️ **Settings** - Themes, scanlines, data management (fully functional)
- 🏗️ **8 More Widgets** - Coming soon! (Focus Timer, Quick Capture, Mood Logger, Calendar, Daily Review, Distraction Log, Med Reminders, Time Trainer)

---

## 🎨 Design Philosophy

**ADHD Quest** uses a strict retro 8-bit aesthetic inspired by 1980s arcade games:

- **Black background + Neon green text** (6 color themes available)
- **Press Start 2P font** for that authentic pixel feel
- **Arcade cartridge UI** - Each tool is a game cartridge
- **CRT scanlines** - Optional vintage monitor effect
- **No smooth animations** - Crisp, digital transitions only

Why? Because **retro aesthetics = fewer distractions = better focus** for ADHD brains! 🧠

---

## 🛠️ Tech Stack

- **Frontend:** React 18.2.0 (JavaScript/ES6+)
- **Styling:** Pure CSS3 (no frameworks)
- **AI:** Anthropic Claude API (Sonnet 4)
- **Storage:** localStorage (client-side only)
- **Fonts:** Press Start 2P, VT323 (Google Fonts)

**No backend required!** Everything runs in your browser.

---

## 📊 Project Status

**Current Version:** v0.3.1 - Arcade Edition  
**Status:** ✅ Production Ready - Core Features Complete

### ✅ Completed Features
- [x] AI task breakdown with 3 granularity levels
- [x] XP system (10 XP per subtask, levels 1-100)
- [x] Speedrun timer with per-subtask tracking
- [x] Completed quest log with sorting
- [x] 6 color themes with instant switching
- [x] Arcade widget library UI
- [x] Settings panel (theme, scanlines, data reset)
- [x] localStorage persistence

### 🚧 Coming Soon
- [ ] Pomodoro Focus Timer widget
- [ ] Quick Capture (brain dump) widget
- [ ] Mood Logger widget
- [ ] Calendar view widget
- [ ] Sound effects system
- [ ] Better quest restore function
- [ ] Badges & achievements
- [ ] Cloud sync + user accounts

---

## 📁 Project Structure

```
adhd-productivity-app/
├── .env (create this - see setup instructions)
├── package.json
├── public/
│   └── index.html
└── src/
    ├── App.js (main state management)
    ├── index.js
    ├── components/
    │   ├── LandingPage.jsx
    │   ├── WidgetLibrary.jsx (arcade cabinet)
    │   ├── Dashboard.jsx (Task Crusher)
    │   ├── TaskInput.jsx
    │   ├── TaskList.jsx
    │   ├── TaskItem.jsx
    │   ├── XPBar.jsx
    │   ├── CompletedQuests.jsx
    │   ├── Settings.jsx
    │   └── PlaceholderWidget.jsx
    ├── services/
    │   └── aiService.js (Claude API calls)
    ├── utils/
    │   └── xpSystem.js (XP calculations)
    └── styles/
        └── *.css (component styles)
```

---

## 🤝 Contributing

This is a personal project for ADHD productivity, but suggestions are welcome!

**Found a bug?** Open an issue!  
**Have an idea?** Open a discussion!  
**Want to build a widget?** Check the roadmap and let's chat!

---

## 📝 License

MIT License - Feel free to fork and adapt for your own ADHD needs!

---

## 🙏 Acknowledgments

- **Anthropic** for the amazing Claude API
- **Press Start 2P** font by CodeMan38
- **VT323** font by Peter Hull
- Everyone with ADHD who understands the struggle of "just start the thing" 💚

---

## 💬 Why This Exists

I have ADHD. Traditional to-do apps don't work because "clean room" feels impossible. But "stand up" → "walk to room" → "touch one object"? **That** I can do.

This app turns every overwhelming task into a series of tiny, achievable wins. The XP system provides instant dopamine rewards. The speedrun timer gamifies time estimation. The retro aesthetic minimizes visual overwhelm.

**ADHD Quest isn't just a productivity app. It's a survival tool.** 🎮

---

<div align="center">

**Made with 💚 by someone who gets it**

[⭐ Star this repo](https://github.com/harvey362/ADHD-Quest) • [🐛 Report Bug](https://github.com/harvey362/ADHD-Quest/issues) • [💡 Request Feature](https://github.com/harvey362/ADHD-Quest/issues)

</div>
