# 🎮 ADHD QUEST v1.0.0 - Full-Stack Productivity Suite

> *The ultimate cross-platform productivity suite for ADHD, now with cloud sync, achievements, statistics, and mobile support!*

[![Made with React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Powered by Claude](https://img.shields.io/badge/AI-Claude%20API-8B5CF6?style=flat)](https://www.anthropic.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🚀 What's New in v1.0.0

ADHD Quest has evolved from a browser app into a **comprehensive cross-platform productivity suite**:

### 🆕 Major Features

- ☁️ **Cloud Sync & User Accounts** - Sync your data across all devices with Supabase
- 📱 **Mobile App** - Full React Native (Expo) mobile version for iOS and Android
- 🏆 **Enhanced Achievements System** - 23+ achievements with progress tracking and unlock animations
- 📊 **Statistics Dashboard** - Comprehensive analytics with Chart.js visualizations
- 🔥 **Streak Tracking** - Daily activity streaks with milestones and XP bonuses
- 📥 **Data Export** - Export your data in JSON, CSV, or iCalendar formats
- 🎨 **Theme Editor** - Create custom color themes with real-time preview
- 📋 **Template Library** - Save and reuse common task structures
- 🎵 **Custom Sound Packs** - Upload your own sound effects (coming soon)
- 🔔 **Push Notifications** - Reminders for tasks, pomodoros, and streak preservation
- 🔐 **Secure Authentication** - Email/password and magic link login
- 📈 **Productivity Insights** - Best performance times, trends, and heatmaps

---

## 📱 Platforms

ADHD Quest now runs on:

- 🌐 **Web** - Desktop browsers (Chrome, Firefox, Safari, Edge)
- 📱 **iOS** - Native mobile app via React Native (Expo)
- 🤖 **Android** - Native mobile app via React Native (Expo)
- 💻 **PWA** - Progressive Web App with offline support

All platforms share the same cloud backend and sync seamlessly!

---

## 🎯 Core Features

### Task Management
- 🤖 **AI Task Breakdown** - Claude API creates hyper-detailed subtasks
- 🎯 **3 Granularity Levels** - Quick (5 steps), Detailed (15 steps), Very Detailed (30+ steps)
- ⚡ **10 XP per Subtask** - Instant dopamine hits for ADHD brains
- 📊 **Level System** - Progress from Level 1-100 (exponential XP curve)
- ⏱️ **Speedrun Mode** - Track how long each subtask takes
- 📋 **Templates** - Save and reuse common task patterns

### Productivity Tools
- 🍅 **Pomodoro Timer** - 25/5 min focus/break sessions with stats
- 📝 **Quick Capture** - Brain dump with notes and drawing canvas
- 📅 **Calendar View** - See your quests on a timeline
- ⏰ **Time Trainer** - Practice and improve time estimation skills
- 🔥 **Streak Tracker** - Maintain daily activity streaks

### Analytics & Insights
- 📊 **Statistics Dashboard** - Task completion trends, XP earnings, pomodoro stats
- 📈 **Productivity Trends** - 30-day trend analysis (increasing/decreasing/stable)
- 🗓️ **Activity Heatmap** - Visual calendar showing productivity patterns
- ⏰ **Best Performance Times** - Discover your peak productivity hours/days
- 🎯 **Achievement Progress** - Track progress toward unlocking badges

### Gamification
- 🏆 **23+ Achievements** - Speed, completion, mastery, productivity, special categories
- 🎖️ **15 Rank Tiers** - From Novice to God Mode (every 5 levels)
- ✨ **XP Multipliers** - Streak bonuses and special event multipliers
- 🔓 **Unlock Animations** - Satisfying animations when unlocking achievements
- 📊 **Leaderboards** - Compare stats (optional, opt-in)

### Customization
- 🎨 **Theme Editor** - Create custom color palettes
- 🎵 **Sound Packs** - Built-in retro sounds + upload custom packs
- 📺 **CRT Scanlines** - Optional retro screen effect
- ⚙️ **Flexible Settings** - Customize every aspect of your experience

### Cloud & Sync
- ☁️ **Auto Sync** - Real-time synchronization across devices
- 🔄 **Offline Mode** - Work offline, sync when online
- ⚠️ **Conflict Resolution** - Smart merging of conflicting changes
- 💾 **Data Export** - Download your data anytime in multiple formats
- 🔐 **Secure Storage** - End-to-end encrypted cloud storage

---

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm
- An [Anthropic API key](https://console.anthropic.com/) (free tier available!)
- A [Supabase account](https://supabase.com/) (free tier available!)

### Web App Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harvey362/ADHD-Quest.git
   cd ADHD-Quest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```bash
   # Supabase Configuration
   REACT_APP_SUPABASE_URL=your_supabase_url_here
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Anthropic API (for AI subtask generation)
   REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here

   # App Configuration
   REACT_APP_VERSION=1.0.0
   REACT_APP_ENVIRONMENT=development

   # Feature Flags
   REACT_APP_ENABLE_CLOUD_SYNC=true
   REACT_APP_ENABLE_PUSH_NOTIFICATIONS=true
   ```

4. **Set up Supabase database**

   - Create a new Supabase project at https://supabase.com
   - Run the schema SQL:
     ```bash
     # In Supabase SQL Editor, run:
     cat supabase-schema.sql
     ```
   - Copy your Supabase URL and anon key to `.env`

5. **Start the app**
   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser!

### Mobile App Installation

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Expo**
   ```bash
   npm start
   ```

4. **Run on device/emulator**
   - For iOS: `npm run ios` (requires macOS + Xcode)
   - For Android: `npm run android` (requires Android Studio)
   - For physical device: Scan QR code with Expo Go app

---

## 📊 New Widgets & Components

### Statistics Dashboard
Comprehensive analytics showing:
- Task completion trends (line charts)
- XP earnings over time (bar charts)
- Pomodoro session distribution
- Time trainer accuracy improvements
- Productivity breakdown (pie charts)
- Best performance times
- 30-day trend analysis

**Access:** Widget Library → Statistics

### Achievements & Badges
- **23+ Achievements** across 5 categories
- **Progress Tracking** - See how close you are to unlocking
- **Unlock Animations** - Satisfying visual feedback
- **Achievement Notifications** - Desktop/mobile alerts
- **Category Filtering** - Speed, Completion, Mastery, Productivity, Special

**Access:** Widget Library → Achievements

### Streak Tracker
- **Current Streak** - Days of consecutive activity
- **Longest Streak** - Personal best record
- **Milestones** - 3, 7, 14, 30, 60, 90, 180, 365 day achievements
- **XP Bonuses** - Extra XP for maintaining streaks
- **Multipliers** - Up to 2x XP at 30+ day streaks
- **Warning System** - Notifications before streak breaks

**Access:** Dashboard sidebar or Widget Library → Streak

### Template Library
- **Built-in Templates** - Clean room, morning routine, study session
- **Custom Templates** - Create and save your own
- **Quick Apply** - One-click task creation from templates
- **Usage Tracking** - See which templates you use most

**Access:** Dashboard → Templates button

### Theme Editor
- **6 Preset Themes** - Classic Green, Electric Blue, Hot Pink, etc.
- **Custom Colors** - Choose any color you like
- **Real-time Preview** - See changes before applying
- **Auto-generated Shades** - System creates matching dark/darker shades
- **Persistent Storage** - Theme saved across sessions

**Access:** Settings → Theme Editor

### User Profile
- **Account Management** - Update username, email, password
- **Sync Status** - See last sync time and pending changes
- **Force Sync** - Manually trigger cloud synchronization
- **Statistics Overview** - Total XP, level, tasks, streaks
- **Account Actions** - Sign out, delete account

**Access:** Top-right profile icon (when logged in)

---

## 🔐 Authentication & Cloud Sync

### Sign Up / Sign In

1. Click "Sign In" button on landing page
2. Choose:
   - **Email + Password** - Traditional signup
   - **Magic Link** - Passwordless email link
3. Create account or sign in
4. Existing local data automatically migrates to cloud

### Cloud Sync Features

- **Auto Sync** - Every 5 minutes when online
- **Manual Sync** - Force sync anytime from profile
- **Offline Queue** - Changes saved locally, synced when online
- **Conflict Resolution** - Latest timestamp wins, XP takes max value
- **Data Integrity** - Checksums and validation on every sync

### What Gets Synced?

✅ Tasks & subtasks
✅ Completed quests
✅ XP & level progress
✅ Achievements unlocked
✅ Streak data
✅ Notes & drawings
✅ Pomodoro sessions
✅ Time trainer results
✅ Settings & preferences
✅ Custom templates

---

## 📥 Data Export

### Export Formats

1. **JSON** - Complete raw data export
2. **CSV** - Spreadsheet-compatible tables
   - Tasks CSV
   - Subtasks CSV
   - Notes CSV
   - Statistics CSV
3. **iCalendar (.ics)** - Calendar events for:
   - Tasks with due dates
   - Completed quests
   - Pomodoro sessions

### How to Export

1. Go to Settings → Data Management
2. Choose export format
3. Select date range (optional)
4. Click "Export Data"
5. File downloads automatically

### Import Data

- JSON exports can be re-imported
- Merges with existing data (no duplicates)
- Preserves IDs and timestamps

---

## 🎮 Complete Widget List

1. ⚡ **Task Crusher** - AI-powered task breakdown
2. 📜 **Quest Log** - Completed quests archive
3. 🍅 **Pomodoro Timer** - Focus/break timer
4. 📝 **Quick Capture** - Notes & drawings
5. 📅 **Calendar View** - Monthly timeline
6. ⏰ **Time Trainer** - Estimation practice
7. 🏆 **Achievements** - Badge collection
8. 📊 **Statistics** - Analytics dashboard
9. 🔥 **Streak Tracker** - Daily streaks
10. 📋 **Templates** - Reusable task patterns
11. 🎨 **Theme Editor** - Color customization
12. ⚙️ **Settings** - App configuration

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Chart.js** - Data visualization
- **React Toastify** - Notifications

### Backend & Database
- **Supabase** - PostgreSQL database + Auth + Storage
- **Row Level Security (RLS)** - Secure data access
- **Real-time Subscriptions** - Live updates

### Mobile
- **React Native 0.73** - Mobile framework
- **Expo ~50.0** - Build toolchain
- **Expo Notifications** - Push notifications
- **Async Storage** - Offline data

### AI & Services
- **Anthropic Claude API** - AI task breakdown
- **Web Audio API** - Sound effects
- **HTML5 Canvas** - Drawing widget

### Utilities
- **date-fns** - Date manipulation
- **papaparse** - CSV export
- **ical-generator** - iCalendar export
- **jszip** - ZIP file creation
- **localforage** - Enhanced local storage

---

## 📁 Project Structure

```
ADHD-Quest/
├── .env (create this - see setup)
├── .env.example
├── package.json
├── supabase-schema.sql (database schema)
├── public/
│   └── index.html
├── mobile/ (React Native app)
│   ├── package.json
│   ├── app.json
│   └── README.md
└── src/
    ├── App.js (main router + auth)
    ├── index.js
    ├── config/
    │   └── supabase.js (Supabase client)
    ├── components/ (UI components)
    │   ├── Dashboard.jsx (Task Crusher)
    │   ├── StatsDashboard.jsx ⭐ NEW
    │   ├── AchievementsEnhanced.jsx ⭐ NEW
    │   ├── StreakWidget.jsx ⭐ NEW
    │   ├── TemplateLibrary.jsx ⭐ NEW
    │   ├── ThemeEditor.jsx ⭐ NEW
    │   ├── Login.jsx ⭐ NEW
    │   ├── SignUp.jsx ⭐ NEW
    │   ├── UserProfile.jsx ⭐ NEW
    │   ├── CompletedQuests.jsx
    │   ├── PomodoroTimer.jsx
    │   ├── QuickCapture.jsx
    │   ├── CalendarView.jsx
    │   ├── TimeTrainer.jsx
    │   └── Settings.jsx
    ├── services/ (business logic)
    │   ├── aiService.js
    │   ├── authService.js ⭐ NEW
    │   ├── cloudSyncService.js ⭐ NEW
    │   └── notificationService.js ⭐ NEW
    ├── utils/ (helpers)
    │   ├── xpSystem.js
    │   ├── rankSystem.js
    │   ├── achievementSystem.js
    │   ├── soundEffects.js
    │   ├── streakTracker.js ⭐ NEW
    │   ├── statsAggregator.js ⭐ NEW
    │   └── exportService.js ⭐ NEW
    └── styles/ (CSS files)
        └── (all component styles)
```

---

## 🎨 Design Philosophy

**Retro 8-bit aesthetic meets modern functionality:**

- **Black background + Neon colors** - Minimal visual noise
- **Press Start 2P font** - Authentic pixel aesthetic
- **Arcade cartridge UI** - Each tool is a game
- **CRT scanlines** - Optional vintage effect
- **Instant feedback** - No loading states, immediate responses

**Why retro?** Because fewer visual distractions = better focus for ADHD brains! 🧠

---

## 📊 Version History

### v1.0.0 (Current)
- ☁️ Cloud sync with Supabase
- 🔐 User authentication
- 📱 Mobile app (iOS/Android)
- 🏆 Enhanced achievements
- 📊 Statistics dashboard
- 🔥 Streak tracking
- 📥 Data export (JSON/CSV/iCal)
- 🎨 Theme editor
- 📋 Template library
- 🔔 Push notifications

### v0.4.0
- ✅ All 7 core widgets
- 🎮 Arcade UI
- 🎵 Sound effects
- 📺 CRT scanlines
- 🎨 6 color themes

### v0.3.0
- ⏰ Time Trainer
- 📅 Calendar View
- 🍅 Pomodoro Timer

### v0.2.0
- 📝 Quick Capture
- 📜 Quest Log
- ⚡ Speedrun mode

### v0.1.0
- 🤖 AI task breakdown
- ✨ XP system
- 🎯 Basic task management

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

**Areas where help is needed:**
- Additional achievements
- More built-in templates
- Sound pack contributions
- Mobile UI polish
- Accessibility improvements
- Translations

---

## 📝 License

MIT License - Feel free to fork and adapt!

See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Anthropic** - Claude AI API
- **Supabase** - Backend infrastructure
- **Expo** - Mobile development platform
- **Chart.js** - Data visualization
- **Press Start 2P** font by CodeMan38
- **VT323** font by Peter Hull
- Everyone with ADHD who understands the struggle 💚

---

## 💬 Support & Community

- **Issues**: [GitHub Issues](https://github.com/harvey362/ADHD-Quest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/harvey362/ADHD-Quest/discussions)
- **Email**: [Your contact]

---

## 🎯 Roadmap

### v1.1.0 (Planned)
- [ ] Social features (optional sharing)
- [ ] Team/family accounts
- [ ] Recurring tasks
- [ ] Task dependencies
- [ ] Advanced analytics

### v1.2.0 (Planned)
- [ ] Machine learning task suggestions
- [ ] Voice input for tasks
- [ ] Wearable device integration
- [ ] Browser extensions

### Long-term
- [ ] Desktop apps (Electron)
- [ ] API for third-party integrations
- [ ] Plugin system
- [ ] Marketplace for themes/sounds

---

<div align="center">

**Made with 💚 by someone who gets it**

**ADHD Quest isn't just a productivity app. It's a survival tool.** 🎮

[⭐ Star this repo](https://github.com/harvey362/ADHD-Quest) • [🐛 Report Bug](https://github.com/harvey362/ADHD-Quest/issues) • [💡 Request Feature](https://github.com/harvey362/ADHD-Quest/issues)

</div>
