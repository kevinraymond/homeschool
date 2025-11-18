# Architecture Overview

## System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   MOBILE APPS (iOS/Android/Web)         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Student    │  │   Parent    │  │   Settings  │    │
│  │  Interface  │  │  Dashboard  │  │   & Admin   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                  PACKAGES (Shared Logic)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Curriculum  │  │     AI      │  │  Database   │    │
│  │   Engine    │  │   Tutoring  │  │   Client    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Supabase   │  │ AWS Bedrock │  │ Local AI    │    │
│  │  (Cloud DB) │  │ (Cloud AI)  │  │ (On-device) │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Student Learning Session

```
1. Student opens lesson
   ↓
2. Curriculum Engine loads lesson YAML
   ↓
3. Student interacts with content
   ↓
4. Problem Generator creates practice problems
   ↓
5. AI Tutor provides hints (local or cloud)
   ↓
6. Progress tracked locally (WatermelonDB)
   ↓
7. Sync to Supabase (when online, if enabled)
   ↓
8. Parent sees updates in dashboard
```

### Parent Dashboard Updates

```
1. Parent opens dashboard
   ↓
2. Query Supabase for all students
   ↓
3. Fetch recent learning sessions
   ↓
4. Calculate analytics (mastery, velocity)
   ↓
5. AI generates family insights
   ↓
6. Display with React Query caching
```

## Key Architectural Decisions

### 1. Offline-First Architecture

**Why**: Homeschool families often work in areas with poor connectivity (road trips, rural areas).

**How**:
- WatermelonDB for local storage
- All curriculum content bundled with app
- Local AI for core tutoring (optional)
- Background sync when online

### 2. Monorepo with Turborepo

**Why**: Share code between mobile and web, maintain consistency.

**Structure**:
- `apps/`: Deployable applications
- `packages/`: Shared business logic
- `content/`: Curriculum data (YAML)

### 3. Local + Cloud AI Hybrid

**Why**: Privacy + Performance + Reliability

**Strategy**:
- **Default**: Local AI (Llama 3.2 1B/3B)
- **Fallback**: Cloud AI (AWS Bedrock Claude)
- **Auto-detect**: Device capability determines mode

**Privacy Benefits**:
- Student data never leaves device (local mode)
- COPPA compliant by design
- Parent choice (local vs cloud)

### 4. Template-Driven Curriculum

**Why**: Extensible, non-developer friendly, AI-generatable.

**Format**: YAML files with typed schemas

**Benefits**:
- Add subjects without code changes
- Community can contribute content
- AI can generate new lessons
- Easy to localize

### 5. Row-Level Security (Supabase)

**Why**: Privacy, FERPA compliance, multi-tenant security.

**Implementation**:
- Every query filtered by family_id
- Parents can only access their data
- Enforced at database level (can't bypass)

## Security Architecture

### Data Protection

```
┌─────────────────────────────────────────────────────────┐
│                 DEVICE (Student/Parent Phone)           │
│                                                         │
│  Local Data (Encrypted):                               │
│  • Student names, ages                                 │
│  • Learning progress                                   │
│  • Session history                                     │
│  • AI interactions                                     │
│                                                         │
│  Local AI Models:                                      │
│  • Llama 3.2 (.gguf files)                            │
│  • Whisper (speech recognition)                       │
│  • Piper (text-to-speech)                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
           ↕ TLS 1.3 (Encrypted in Transit)
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE (Cloud, Optional)             │
│                                                         │
│  Cloud Data (AES-256 Encrypted):                       │
│  • Account credentials (hashed)                        │
│  • Sync metadata                                       │
│  • Family preferences                                  │
│                                                         │
│  Row-Level Security:                                   │
│  • Family-scoped queries                               │
│  • JWT authentication                                  │
│  • Audit logs                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
1. Parent signs up (email + password)
   ↓
2. Supabase creates user account
   ↓
3. JWT token issued (30 day expiry)
   ↓
4. Token stored securely (Keychain/Keystore)
   ↓
5. All API requests include JWT
   ↓
6. Supabase validates token + applies RLS
```

## Performance Optimizations

### 1. Code Splitting

- Lazy load lesson components
- Dynamic imports for large libraries
- Reduce initial bundle size

### 2. Caching Strategy

**Local Cache (WatermelonDB)**:
- Students, progress, sessions
- Never expires (primary source)

**React Query Cache**:
- Supabase queries cached 5 minutes
- Invalidate on mutations
- Background refetch

**AI Response Cache**:
- Common hints cached locally
- Reduces AI inference time
- Max 100 cached responses

### 3. Image Optimization

- WebP format for all images
- Lazy loading with placeholders
- Responsive images (multiple sizes)

### 4. AI Model Loading

- Lazy load models (don't load on app start)
- Keep in memory after first load
- Preload during splash screen (optional)

## Scalability Considerations

### Current (MVP): 1-1,000 families

**Infrastructure**:
- Supabase free tier (50K MAU)
- AWS Bedrock pay-per-use
- Expo hosting (free)

**Cost**: ~$50-100/month

### Growth (1K-10K families)

**Infrastructure**:
- Supabase Pro ($25/month)
- AWS Bedrock (~$0.001/request)
- Expo EAS ($99/month)

**Cost**: ~$500-1,000/month

### Scale (10K-100K families)

**Infrastructure**:
- Supabase Team ($599/month)
- AWS Bedrock with reserved capacity
- Dedicated CDN for curriculum content
- Background job processing

**Cost**: ~$5,000-10,000/month

## Technology Choices

### Frontend

| Technology | Why |
|------------|-----|
| **React Native** | Cross-platform, single codebase |
| **Expo** | Fast development, OTA updates, easy testing |
| **NativeWind** | Tailwind for RN, consistent styling |
| **Zustand** | Simple state management |
| **React Query** | Server state, caching, optimistic updates |

### Backend

| Technology | Why |
|------------|-----|
| **Supabase** | Postgres, Auth, Storage, Realtime in one |
| **AWS Bedrock** | Claude access without managing servers |
| **Vercel** | Deploy web dashboard, serverless functions |

### AI

| Technology | Why |
|------------|-----|
| **Llama 3.2** | Small enough for mobile, good quality |
| **llama.cpp** | Efficient C++ inference |
| **Claude (Haiku)** | Fast, affordable cloud fallback |

## Future Architecture

### Phase 2: Co-op Features

Add multi-family support:
- Shared curriculum library
- Group scheduling
- Resource sharing
- Multi-instructor access

### Phase 3: Marketplace

Add third-party content:
- Curriculum provider integrations
- Payment processing (Stripe)
- Revenue sharing

### Phase 4: Enterprise

Add school district features:
- SSO integration
- Bulk user management
- Advanced reporting
- White-labeling

## Monitoring & Observability

### Metrics to Track

**Performance**:
- App load time
- Lesson load time
- AI response time
- Battery usage

**Engagement**:
- DAU/MAU ratio
- Session duration
- Lesson completion rate
- Retention (7-day, 30-day)

**Business**:
- New signups
- Free → Paid conversion
- Churn rate
- MRR growth

### Tools

- **Sentry**: Error tracking
- **PostHog**: Analytics (self-hosted for privacy)
- **Expo Application Services**: Build metrics

## Deployment

### Mobile Apps

**iOS**:
- Build with EAS Build
- Submit to App Store
- TestFlight for beta testing

**Android**:
- Build with EAS Build
- Submit to Google Play
- Internal testing track for beta

### Web Dashboard

- Deploy to Vercel
- Automatic deploys from main branch
- Preview deployments for PRs

### Database

- Supabase managed hosting
- Daily automatic backups
- Point-in-time recovery

## Disaster Recovery

**Data Backup**:
- Supabase automatic daily backups
- Export capability for users
- Point-in-time recovery (7 days)

**Service Interruption**:
- Offline-first design means app works without backend
- Local AI fallback if cloud unavailable
- Status page for incidents

**Data Loss Prevention**:
- Users export data regularly (feature)
- Parent-controlled data ownership
- No single point of failure
