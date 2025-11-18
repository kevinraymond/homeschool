# CLAUDE.md - AI Homeschool Platform

## Project Vision

An **AI-native, privacy-first homeschooling platform** that brings adaptive, Socratic tutoring to families with elementary-age children (K-6). This is a personal project built in phases, focused on delivering a polished MVP with working AI interactions and real curriculum content.

### Core Philosophy

**Privacy = Local**
- AI processing happens on-device by default
- Cloud integrations are optional, not required
- Parents maintain full control of their children's data
- COPPA/FERPA compliant from the ground up

**Target Users**
- Families with 2-3 elementary students (K-6)
- Parents with low-average technical skills
- Focus on making homeschooling more accessible and effective

**Development Approach**
- Build in **phases/features**, not timelines
- Work progresses as time allows
- Focus on showing value early (working AI + lessons)
- Polish matters - this should feel professional

---

## Current State

### What's Built (Foundation)

**Architecture:**
- ✅ Monorepo with pnpm workspaces (Turborepo)
- ✅ React Native + Expo mobile app
- ✅ Shared packages: `@homeschool-ai/ai`, `curriculum`, `database`
- ✅ TypeScript throughout with strict mode
- ✅ File-based routing (Expo Router)
- ✅ NativeWind (Tailwind for React Native)

**AI Tutoring Engine:**
- ✅ Socratic prompt templates (3 hint levels)
- ✅ Answer assessment framework
- ✅ Cloud AI integration (AWS Bedrock - optional)
- ⚠️ **NEEDS**: Local AI integration (Ollama/LM Studio)

**Curriculum System:**
- ✅ YAML-based lesson format (Zod validated)
- ✅ Dynamic problem generators (math: add, subtract, multiply, divide, fractions)
- ✅ Sample Grade 3 math curriculum
- ✅ Adaptive difficulty scoring
- ⚠️ **NEEDS**: More K-6 content, lesson player UI

**Database:**
- ✅ Supabase types (Family, Student, LearningSession, ProgressNode)
- ✅ Helper functions for CRUD operations
- ✅ Compliance logging framework
- ⚠️ **NEEDS**: Supabase project setup, local-first sync strategy

**Mobile App:**
- ✅ Tab navigation (Home, Lessons, Progress, Settings)
- ✅ Mock home dashboard with student cards
- ✅ React Query + Zustand state management
- ⚠️ **NEEDS**: Auth screens, lesson player, practice UI, real data connection

**Documentation:**
- ✅ README, ARCHITECTURE.md, GETTING_STARTED.md
- ✅ 12-week roadmap (reference only - not following timeline)
- ✅ PROJECT_SUMMARY.md

---

## MVP Scope

**Must-Have for "Something Solid Working":**

1. **Working AI Tutor**
   - Local LLM running (Ollama with Llama 3.2)
   - Socratic hints that actually help
   - Answer checking with encouraging feedback
   - Voice interaction (optional bonus)

2. **Real Curriculum Content**
   - Complete K-2 Math unit (addition, subtraction, counting)
   - Complete 3-5 Math unit (multiplication, division, fractions)
   - 1-2 Reading/Language Arts units
   - Engaging, age-appropriate lessons

3. **Core App Experience**
   - Simple auth (parent creates family, adds kids)
   - Student dashboard (what to work on today)
   - Lesson player with swipeable sections
   - Practice problems with AI help
   - Basic progress tracking (stars, completion %)

4. **Polish**
   - Smooth animations and transitions
   - Encouraging, kid-friendly UI
   - Parent-friendly settings
   - Works offline after initial lesson download

**Nice-to-Have (Post-MVP):**
- Web parent dashboard
- Advanced analytics
- Multi-subject expansion
- Learning path customization
- Compliance reporting
- Voice features (speech-to-text, text-to-speech)

---

## Technical Architecture

### Local-First Strategy

**Data Storage:**
- **Local DB**: WatermelonDB (offline-first reactive database)
- **Cloud Sync**: Supabase (optional, parent-controlled)
- **Lessons**: Bundled YAML files, cached locally
- **Progress**: Stored locally first, synced when online

**AI Processing:**
- **Primary**: Ollama (local LLM server) or LM Studio
- **Model**: Llama 3.2 (3B for on-device, 8B for desktop)
- **Fallback**: Cloud API (AWS Bedrock, Anthropic) - optional, API key required
- **Voice**: Whisper.cpp (local STT), Piper (local TTS)

**Network Usage:**
- Initial app download
- Curriculum content updates (optional)
- Usage analytics (anonymous, optional)
- Cloud backup (optional, encrypted)

### Tech Stack

**Mobile App:**
- React Native 0.73 + Expo 50
- Expo Router (file-based routing)
- NativeWind (Tailwind CSS)
- React Query (server state)
- Zustand (client state)
- WatermelonDB (local database)

**Backend (Optional Cloud):**
- Supabase (PostgreSQL + Auth + Storage)
- Row-level security (RLS) for family data isolation

**AI:**
- Ollama (local LLM server)
- Llama 3.2 (primary model)
- AWS Bedrock (optional cloud fallback)
- Whisper.cpp (speech-to-text)
- Piper (text-to-speech)

**Content:**
- YAML curriculum files
- Zod schema validation
- Dynamic problem generation
- Bundled with app or downloaded on demand

---

## Development Phases

### Phase 1: Foundation & Local AI
**Goal:** Get local AI working with basic lesson flow

**Tasks:**
- [ ] Set up Ollama locally for development
- [ ] Implement LocalAITutor class (replace CloudAITutor)
- [ ] Create simple lesson player component
- [ ] Build practice problem UI with AI hint buttons
- [ ] Test Socratic tutoring flow end-to-end

**Deliverable:** Demo video showing AI helping student solve math problem

---

### Phase 2: Auth & Multi-Student
**Goal:** Support real families with multiple children

**Tasks:**
- [ ] Implement parent signup/login (local first)
- [ ] Student profile creation (names, ages, avatars)
- [ ] Student switcher in app
- [ ] Local database setup (WatermelonDB)
- [ ] Progress tracking per student

**Deliverable:** Parent can create family, add 2-3 kids, each kid sees personalized dashboard

---

### Phase 3: Curriculum Content
**Goal:** Deliver real K-6 math curriculum

**Tasks:**
- [ ] Write K-2 Math curriculum (5-10 lessons)
- [ ] Write 3-5 Math curriculum (5-10 lessons)
- [ ] Create lesson templates for different section types
- [ ] Build curriculum navigation (unit → lesson → section)
- [ ] Add completion tracking and stars/rewards

**Deliverable:** Students can complete 2-3 full math units with variety

---

### Phase 4: Polish & UX
**Goal:** Make it feel professional and encouraging

**Tasks:**
- [ ] Design system (colors, typography, spacing)
- [ ] Smooth animations (lesson transitions, problem solving)
- [ ] Encouraging feedback messages
- [ ] Sound effects (optional)
- [ ] Parent dashboard (today's activity, progress overview)
- [ ] Settings (AI model selection, offline mode, etc.)

**Deliverable:** App feels polished and ready to show others

---

### Phase 5: Optional Cloud (Future)
**Goal:** Add cloud sync for families who want it

**Tasks:**
- [ ] Set up Supabase project
- [ ] Implement sync logic (local → cloud)
- [ ] Parent-controlled backup/restore
- [ ] Multi-device support
- [ ] Cloud AI fallback (for devices without local LLM)

**Deliverable:** Optional cloud features for advanced users

---

## Account Setup Requirements

**REQUIRED for MVP:**
- [ ] **Expo Account** (free) - For mobile development & testing
  - Sign up: https://expo.dev
  - Needed for: Building app, testing with Expo Go

- [ ] **Ollama** (free, local) - For AI tutoring
  - Install: https://ollama.ai
  - Model: `ollama pull llama3.2`
  - Runs locally, no account needed

**OPTIONAL (Cloud Features):**
- [ ] **Supabase** (free tier) - For cloud sync
  - Sign up: https://supabase.com
  - Only needed if implementing Phase 5

- [ ] **AWS Account** - For cloud AI fallback
  - Only if parent opts into cloud AI
  - Can use Anthropic API instead

- [ ] **Apple Developer** ($99/year) - For iOS app store
  - Only needed for public release

- [ ] **Google Play** ($25 one-time) - For Android app store
  - Only needed for public release

---

## Alternative Local Solutions

### Instead of Supabase (Fully Local):
- **WatermelonDB** - Offline-first local database (already planned)
- **SQLite** - Direct SQL database on device
- **Async Storage** - Simple key-value storage
- **File system** - Store progress as JSON files

**Trade-off:** No cloud sync, but 100% privacy and works offline

### Instead of AWS Bedrock (Local AI):
- **Ollama** - Easiest local LLM server (recommended)
- **LM Studio** - GUI for running local models
- **llama.cpp** - Direct C++ integration (more complex)
- **On-device with React Native** - Possible with smaller models

**Trade-off:** Requires parent's device to run LLM (desktop/laptop recommended for development)

### Hybrid Approach (Recommended):
- **Default**: Fully local (WatermelonDB + Ollama)
- **Optional**: Parent can enable cloud sync (Supabase) or cloud AI (API keys)
- **Usage Reporting**: Anonymous analytics (lesson completion, no PII) - can be disabled

---

## Current File Structure

```
/home/user/homeschool/
├── apps/
│   └── mobile/                    # React Native + Expo app
│       ├── app/
│       │   ├── _layout.tsx        # Root layout
│       │   ├── index.tsx          # Welcome screen
│       │   ├── (auth)/            # Auth flows (TODO)
│       │   └── (app)/             # Main app
│       │       ├── home.tsx       # Dashboard (has mock data)
│       │       ├── lessons.tsx    # TODO
│       │       ├── progress.tsx   # TODO
│       │       └── settings.tsx   # TODO
│       ├── app.json               # Expo config
│       ├── package.json
│       └── tailwind.config.js
│
├── packages/
│   ├── ai/                        # AI tutoring engine
│   │   └── src/
│   │       ├── cloud-tutor.ts     # AWS Bedrock (optional)
│   │       ├── local-tutor.ts     # TODO: Ollama integration
│   │       ├── prompts.ts         # Socratic prompt templates
│   │       └── types.ts
│   │
│   ├── curriculum/                # Lesson engine
│   │   └── src/
│   │       ├── loader.ts          # YAML lesson loader
│   │       ├── problem-generator.ts # Dynamic math problems
│   │       └── types.ts           # Zod schemas
│   │
│   └── database/                  # Data layer
│       └── src/
│           └── index.ts           # Supabase client (optional)
│
├── content/                       # Curriculum YAML files
│   └── math/
│       └── grade3/                # Sample content
│
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md
│   ├── GETTING_STARTED.md
│   └── IMPLEMENTATION_ROADMAP.md
│
├── CLAUDE.md                      # THIS FILE
├── README.md
├── PROJECT_SUMMARY.md
└── package.json                   # Root monorepo config
```

---

## Key Implementation Notes

### Local AI Integration (Priority)

**Current State:**
- `packages/ai/src/cloud-tutor.ts` implements AWS Bedrock
- `packages/ai/src/local-tutor.ts` is a placeholder

**Next Steps:**
1. Install Ollama locally: `curl -fsSL https://ollama.ai/install.sh | sh`
2. Pull model: `ollama pull llama3.2`
3. Implement LocalAITutor class:
   ```typescript
   class LocalAITutor {
     async generateHint(problem, studentAnswer, hintLevel) {
       // POST to http://localhost:11434/api/generate
       // Use prompts from prompts.ts
       // Return Socratic hint
     }
   }
   ```
4. Add AI provider selection in app settings
5. Test with real math problems from curriculum

### Lesson Player (Priority)

**Component Structure:**
```
<LessonPlayer lesson={currentLesson}>
  <VideoSection />      {/* YouTube embed or local video */}
  <InteractiveSection /> {/* Swipeable explanation cards */}
  <PracticeSection>      {/* Dynamic problems + AI help */}
    <ProblemCard>
      <Problem />
      <AnswerInput />
      <HintButton level={1|2|3} />
      <SubmitButton />
    </ProblemCard>
  </PracticeSection>
  <AssessmentSection />  {/* Final quiz */}
</LessonPlayer>
```

**Features:**
- Swipeable navigation (left/right)
- Progress dots at bottom
- AI help button always available
- Encouraging feedback animations
- Auto-save progress

### Local Database Strategy

**WatermelonDB Schema:**
```
Students (id, name, age, avatarUrl, gradeLevel)
Lessons (id, subjectId, title, content, difficulty)
LearningSession (id, studentId, lessonId, startedAt, completedAt)
ProgressNode (id, studentId, lessonId, sectionId, masteryScore)
```

**Sync Strategy (Optional Cloud):**
- Write locally first (instant)
- Queue sync operations
- Push to Supabase when online
- Conflict resolution: local wins (parent's device is source of truth)

### Curriculum Content Guidelines

**YAML Format:**
```yaml
id: math-k-addition-1
title: "Counting On to Add"
gradeLevel: "K"
subject: "math"
estimatedMinutes: 20

sections:
  - type: video
    title: "What is Adding?"
    url: "https://youtube.com/..."

  - type: interactive
    title: "Let's Count Together"
    slides:
      - markdown: "When we add, we put groups together..."
        image: "/assets/counting-blocks.png"

  - type: practice
    title: "Try It Yourself"
    problems:
      - type: "addition"
        difficulty: 0.2
        minValue: 1
        maxValue: 5
        count: 5

  - type: assessment
    title: "Show What You Know"
    passingScore: 0.8
    problems: [...]
```

**Content Principles:**
- Age-appropriate language
- Visual examples
- Progressive difficulty
- Immediate feedback
- Celebration of success

---

## Common Development Commands

```bash
# Install all dependencies
pnpm install

# Start mobile app (Expo)
pnpm mobile

# Start Ollama (in separate terminal)
ollama serve

# Pull AI model
ollama pull llama3.2

# Build all packages
pnpm build

# Lint everything
pnpm lint

# Clean and reinstall
pnpm clean && pnpm install
```

---

## Testing Strategy

**Manual Testing (MVP):**
- Test on real device via Expo Go
- Parent persona: Create family, add 3 kids
- Student persona: Complete 2-3 lessons per grade
- Test offline mode (airplane mode)
- Test AI hints at all 3 levels

**Automated Testing (Post-MVP):**
- Jest for unit tests (problem generators, AI prompts)
- React Native Testing Library (component tests)
- Detox for E2E (optional, later)

---

## Privacy & Compliance

**Data Collection (Minimal):**
- Student first names only (no last names)
- Ages (for curriculum placement)
- Learning progress (local by default)
- Anonymous usage stats (optional)

**Data Storage:**
- Local first (WatermelonDB)
- Cloud sync optional (parent controlled)
- Encrypted at rest (Supabase RLS when cloud enabled)

**Compliance:**
- COPPA: No PII collection, parental consent required
- FERPA: Education records protected, parent-controlled
- No ads, no third-party tracking
- Open source (transparency)

**Parent Controls:**
- View all stored data
- Export data (JSON/CSV)
- Delete all data
- Disable cloud sync
- Disable usage analytics

---

## Future Expansion Ideas

**Content:**
- Science curriculum (experiments, observations)
- Reading/Language Arts (phonics, comprehension)
- Social studies (geography, history)
- Art & Music (creative expression)

**Features:**
- Learning path customization
- Parent-created lessons
- Sibling collaboration (work together)
- Voice interactions (ask questions verbally)
- Handwriting recognition (math on tablet)
- Video lessons (record parent teaching)

**Community:**
- Curriculum marketplace (share lessons)
- Parent forums
- Co-op scheduling (meet with other families)
- Field trip planner

**Advanced AI:**
- Multi-modal (image understanding)
- Long-term memory (remember student preferences)
- Personalized learning paths
- Real-time difficulty adjustment

---

## Getting Help

**For Development Questions:**
- Check ARCHITECTURE.md for system design
- Check GETTING_STARTED.md for setup
- Read package READMEs in `packages/*/`
- Review sample curriculum in `content/`

**For AI Questions:**
- Prompt templates: `packages/ai/src/prompts.ts`
- Ollama docs: https://ollama.ai/docs
- Llama 3.2 guide: https://huggingface.co/meta-llama/Llama-3.2-3B

**For React Native Questions:**
- Expo docs: https://docs.expo.dev
- NativeWind: https://www.nativewind.dev
- React Query: https://tanstack.com/query

---

## Success Criteria (MVP)

**You know it's working when:**
1. Parent can create account and add 2-3 kids
2. Each kid sees personalized dashboard
3. Kid can open a lesson and navigate sections
4. Kid can solve practice problems with AI hints
5. AI provides helpful, Socratic guidance
6. Progress saves and persists
7. App works offline after initial setup
8. UI feels polished and encouraging
9. Parent can see what kids accomplished today
10. The whole thing feels like magic ✨

---

## Notes for Future Claude Sessions

**Context to Remember:**
- This is a **local-first, privacy-focused** homeschool app
- Target: **K-6 elementary**, **2-3 kids per family**
- **MVP = working AI tutor + real curriculum + polish**
- **No timelines**, work in phases as time allows
- **Ollama + Llama 3.2** for local AI (priority)
- **Cloud is optional** (Supabase, AWS Bedrock)
- Parent has **low-average tech skills** (keep it simple)

**Current Priorities:**
1. Get local AI working (Ollama integration)
2. Build lesson player UI
3. Create K-6 math curriculum content
4. Polish the core experience

**What's Already Built:**
- Monorepo infrastructure
- AI prompt templates
- Curriculum types and problem generators
- Database schema
- Mobile app shell
- Comprehensive docs

**What Needs Building:**
- LocalAITutor implementation
- Auth screens
- Lesson player component
- Practice UI with AI hints
- Real curriculum content (YAML files)
- WatermelonDB integration
- Settings and parent dashboard

**Quick Wins:**
- Test existing problem generators
- Write 3-5 sample lessons
- Prototype lesson player UI
- Get Ollama running locally
- Make first AI tutoring interaction work

---

**Last Updated:** 2025-11-18 (Session: claude/explore-homeschool-app-01C4BWRT3JVYGzYBNQ5EXemj)