# ADHD Quest Mobile

React Native mobile app for ADHD Quest productivity suite.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env`
- Add your Supabase credentials

3. Start the app:
```bash
npm start
```

## Building

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## Features

- Full task management on mobile
- Cloud sync with web app
- Push notifications for reminders
- Offline support
- Streak tracking
- XP and achievements
- All widgets from web version

## Architecture

The mobile app shares business logic with the web version through common utility modules imported from the parent directory. UI components are platform-specific but follow the same retro aesthetic.
