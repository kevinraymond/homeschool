# Getting Started with Homeschool AI

Welcome! This guide will get you up and running with the Homeschool AI platform in about 15 minutes.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([download](https://nodejs.org/))
- **pnpm** package manager: `npm install -g pnpm`
- **Expo Go app** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Ollama** for local AI (optional but recommended): [ollama.ai](https://ollama.ai)

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/your-username/homeschool-ai.git
cd homeschool-ai

# Install dependencies
pnpm install
```

## Step 2: Set Up Supabase (5 minutes)

See the comprehensive guide at **docs/SUPABASE_SETUP.md** for detailed instructions.

**Quick version:**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run migration from `supabase/migrations/00001_initial_schema.sql`
4. Copy API keys to `.env.local`

## Step 3: Configure Environment

```bash
cd apps/mobile
cp .env.example .env.local
```

Edit `.env.local`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Local AI (Optional)

For privacy-first AI tutoring:

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh  # macOS/Linux

# Start server
ollama serve

# Pull model (in new terminal)
ollama pull llama3.2
```

## Step 5: Run the App

```bash
pnpm mobile
```

Scan the QR code with Expo Go app on your phone!

## Step 6: Create Account & Add Students

1. Tap "Get Started Free"
2. Create parent account
3. Check email for confirmation
4. Add students
5. Start learning!

---

## Troubleshooting

### Cannot connect to Supabase
- Check `.env.local` is in `apps/mobile/`
- Restart Expo: `pnpm mobile`

### Local AI not working
- Check Ollama is running: `curl http://localhost:11434/api/tags`
- Install model: `ollama pull llama3.2`

### App crashes
```bash
cd apps/mobile
rm -rf node_modules
pnpm install
pnpm start --clear
```

---

## What's Included

**Sample Curriculum:**
- K-2: Counting, shapes, basic math
- Grade 3: Multiplication, fractions

**Features:**
- Local AI tutoring (Ollama)
- Multi-student support
- Progress tracking
- Offline-capable

---

## Next Steps

- **Add curriculum**: See `content/math/` for examples
- **Customize AI**: Edit `packages/ai/src/prompts.ts`
- **Build parent dashboard**: Coming soon!

Happy homeschooling! 🎓
