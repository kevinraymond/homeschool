# Homeschool AI Platform

The first AI-native, privacy-first, mobile-first homeschooling platform.

## 🎯 Mission

Build the ultimate student/parent-first platform that:
- Uses local AI for privacy-preserving tutoring
- Manages multiple children intelligently
- Works beautifully on mobile, tablet, and desktop
- Automates compliance tracking
- Provides enterprise-grade analytics without complexity

## 🏗️ Project Structure

```
homeschool-ai/
├── apps/
│   ├── mobile/          # React Native (Expo) - Student & Parent apps
│   └── web/             # Next.js - Parent dashboard & marketing
├── packages/
│   ├── ui/              # Shared UI components (NativeWind)
│   ├── curriculum/      # Curriculum engine & templates
│   ├── ai/              # AI tutoring logic (local + cloud)
│   ├── database/        # Supabase schemas & types
│   └── utils/           # Shared utilities
├── content/
│   └── math/            # Math curriculum (K-5 MVP)
└── docs/                # Architecture & design docs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Expo CLI: `npm install -g expo-cli`
- Supabase account (free tier)
- AWS account for Bedrock (optional, for cloud AI)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start mobile app
pnpm mobile

# Start web dashboard (separate terminal)
pnpm web
```

### First Run

1. Open Expo Go app on your phone
2. Scan QR code from terminal
3. Create a family account
4. Add your first student
5. Try the sample math lesson!

## 📱 Tech Stack

**Frontend:**
- React Native + Expo (cross-platform mobile)
- Next.js (web dashboard)
- NativeWind (Tailwind for React Native)
- Zustand (state management)
- React Query (server state)

**Backend:**
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- AWS Bedrock (cloud AI fallback)

**AI:**
- Local: Llama 3.2 (1B/3B) via llama.cpp
- Local STT: Whisper Tiny via whisper.cpp
- Local TTS: Piper
- Cloud: Claude (Haiku/Sonnet) via AWS Bedrock

**Data:**
- WatermelonDB (offline-first local database)
- Supabase (cloud sync, optional)

## 🎓 MVP Scope

**Phase 1: Elementary Math (K-5)**
- Addition, subtraction, multiplication, division, fractions
- ~100 interactive lessons
- AI tutor with Socratic method
- Adaptive difficulty adjustment
- Multi-child parent dashboard
- Basic compliance tracking

**Platform:**
- iOS (primary)
- Android
- Web (parent dashboard)

## 🔒 Privacy First

- Local AI processing (data never leaves device by default)
- Optional cloud sync (encrypted, parent controlled)
- COPPA compliant by design
- FERPA compliant education records
- Parent owns and controls all data
- Export/delete anytime

## 📊 Key Metrics

**Engagement:**
- 60%+ DAU/WAU ratio
- 5+ sessions per week per student
- 30+ minutes per session
- 80%+ lesson completion rate

**Learning:**
- 20%+ improvement on assessments
- 15%+ faster mastery vs. traditional methods
- 4.5+ / 5 parent satisfaction

## 🗺️ Roadmap

### Week 1-2: Foundation
- [x] Project structure
- [ ] Database schemas
- [ ] Basic React Native app
- [ ] Student model & first screen

### Week 3-6: Core Features
- [ ] Lesson player (swipeable cards)
- [ ] Local AI tutor integration
- [ ] Practice problems with hints
- [ ] Parent dashboard (multi-child view)
- [ ] Adaptive difficulty engine

### Week 7-8: Polish
- [ ] Offline-first architecture
- [ ] Voice features (Whisper)
- [ ] Compliance tracking
- [ ] Performance optimization

### Week 9-10: Testing
- [ ] Family alpha testing
- [ ] Bug fixes
- [ ] Security audit
- [ ] Privacy policy

### Week 11-12: Launch
- [ ] Friends & family beta
- [ ] App Store submission
- [ ] Google Play submission
- [ ] Community beta launch

## 🛠️ Development

### Useful Commands

```bash
# Development
pnpm dev              # Run all apps in dev mode
pnpm mobile           # Mobile app only
pnpm web              # Web dashboard only

# Building
pnpm build            # Build all apps
pnpm test             # Run all tests
pnpm lint             # Lint all packages

# Cleanup
pnpm clean            # Remove all build artifacts
```

### Database Migrations

```bash
# Create new migration
cd packages/database
supabase migration new migration_name

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > types/database.ts
```

## 📝 License

Copyright © 2025. All rights reserved.

## 🤝 Contributing

This is currently a solo project. Future contributions welcome after MVP launch.

## 📞 Contact

Built with ❤️ by a homeschool parent for homeschool families.
