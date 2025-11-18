# Getting Started

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **pnpm** package manager (`npm install -g pnpm`)
- **Expo CLI** (`npm install -g expo-cli`)
- **Supabase account** (free tier at supabase.com)
- **iOS Simulator** (Mac only) or **Android Emulator** or physical device
- **AWS account** (optional, for cloud AI - free tier available)

## Initial Setup

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

This will install all dependencies for all packages and apps in the monorepo.

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key
4. Run the database schema:
   ```bash
   # Copy the schema to Supabase SQL editor
   cat packages/database/src/schema.sql
   # Run it in Supabase Dashboard → SQL Editor
   ```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Optional (for cloud AI):
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### 4. Start Development

```bash
# Start mobile app
pnpm mobile

# In a separate terminal, if you want web dashboard
pnpm web
```

### 5. Test on Device

**Using Expo Go (Easiest):**
1. Install Expo Go app on your phone
2. Scan QR code from terminal
3. App will load on your device

**Using Simulators:**
- iOS: Press `i` in terminal
- Android: Press `a` in terminal

## Project Structure

```
homeschool-ai/
├── apps/
│   ├── mobile/          # React Native app (Expo)
│   │   ├── app/         # File-based routing (Expo Router)
│   │   │   ├── index.tsx        # Welcome screen
│   │   │   ├── (auth)/          # Auth flow
│   │   │   └── (app)/           # Main app (after login)
│   │   └── components/  # Reusable components
│   └── web/             # Next.js dashboard (coming soon)
├── packages/
│   ├── database/        # Supabase client & schemas
│   ├── curriculum/      # Lesson templates & loader
│   ├── ai/              # AI tutoring (local + cloud)
│   └── utils/           # Shared utilities
└── content/
    └── math/            # Math curriculum (YAML)
```

## Next Steps

### Week 1: Core Features

1. **Database Integration**
   - Connect mobile app to Supabase
   - Implement authentication
   - Create student CRUD operations

2. **First Lesson**
   - Build lesson player component
   - Implement swipeable cards
   - Test with sample math lesson

3. **AI Integration**
   - Set up AWS Bedrock (cloud AI)
   - Test hint generation
   - Test answer feedback

### Week 2: Student Interface

1. **Lesson Player**
   - Video section component
   - Interactive section component
   - Practice problems component
   - Assessment component

2. **Progress Tracking**
   - Track session time
   - Calculate accuracy
   - Update progress nodes

3. **AI Tutor**
   - Hint system (3 levels)
   - Feedback on answers
   - Struggle detection

### Week 3: Parent Dashboard

1. **Multi-Child View**
   - Family overview screen
   - Individual child screens
   - Today's progress summary

2. **Analytics**
   - Learning sessions chart
   - Mastery levels visualization
   - Time spent analytics

3. **Insights**
   - AI-generated family insights
   - Cross-child pattern detection
   - Recommendations

## Development Tips

### Hot Reload

Expo supports hot reload - just save your files and see changes instantly on device.

### Debugging

```bash
# Open React DevTools
expo start --devtools

# View logs
expo start --clear
```

### TypeScript

All files use TypeScript. Run type checking:

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

### Database Changes

When you update the schema:

1. Update `packages/database/src/schema.sql`
2. Run in Supabase SQL Editor
3. Generate TypeScript types:
   ```bash
   cd packages/database
   supabase gen types typescript --local > types/database.ts
   ```

## Common Issues

### "Metro bundler couldn't start"

```bash
# Clear cache and restart
cd apps/mobile
expo start --clear
```

### "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### "Supabase connection failed"

- Check your `.env` file has correct credentials
- Verify Supabase project is running
- Check network connection

## Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **Supabase**: https://supabase.com/docs
- **NativeWind**: https://www.nativewind.dev
- **React Query**: https://tanstack.com/query

## Need Help?

- Check the `docs/` folder for detailed guides
- Review example code in `content/math/`
- Look at the implementation plan in research repo

## Testing with Your Family

Once the app is functional:

1. **Add your 4 kids as students**
2. **Have them try sample lessons**
3. **Log bugs and feedback** in a notebook
4. **Iterate quickly** - you have built-in user research!

Your experience as a homeschool parent is your superpower. Trust your instincts on what works and what doesn't.
