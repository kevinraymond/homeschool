# Supabase Setup Guide

This guide walks you through setting up Supabase for the Homeschool AI platform.

## Quick Start (5 minutes)

### 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email

### 2. Create New Project

1. Click "New Project"
2. Choose settings:
   - **Name**: `homeschool-ai` (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (perfect for MVP)

3. Wait 2-3 minutes for project to initialize

### 3. Run Database Migration

1. In your Supabase project, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/00001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
6. Verify success: You should see "Success. No rows returned"

### 4. Get Your API Keys

1. Click **Settings** (gear icon, left sidebar)
2. Click **API** (in Settings menu)
3. Copy these values:

   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (keep this secret!)
   ```

### 5. Configure Your App

Create `.env.local` in `apps/mobile/`:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit the `.env.local` file! It's already in `.gitignore`.

### 6. Enable Email Auth (Optional but Recommended)

1. In Supabase, click **Authentication** → **Providers**
2. Enable **Email** provider (it's enabled by default)
3. Scroll down to **Email Templates**
4. Customize the confirmation email (optional)

### 7. Configure URL for Development

1. In Supabase, click **Authentication** → **URL Configuration**
2. Add your site URLs:
   ```
   Site URL: exp://localhost:8081
   Redirect URLs: exp://localhost:8081, http://localhost:19006
   ```

---

## Database Schema Overview

The migration creates 5 main tables:

### 1. **families**
- Stores parent account info
- Links to Supabase Auth
- Tracks subscription tier

### 2. **students**
- Child profiles (first name only, no PII)
- Links to family
- Stores learning preferences

### 3. **learning_sessions**
- Tracks each lesson session
- Records time, accuracy, struggles
- Links to curriculum lesson IDs

### 4. **progress_nodes**
- Concept-level mastery tracking
- Adaptive difficulty scores
- Last practiced timestamps

### 5. **compliance_logs**
- Daily learning logs for state requirements
- Subject hours tracking
- Notes field for parent observations

---

## Row-Level Security (RLS)

**What it does**: Ensures families can only see their own data.

**How it works**:
- Every query automatically filters by `family_id`
- Parents can't access other families' data (enforced at DB level)
- Kids can't access other families' kids

**Testing RLS**:
```sql
-- This query will only return YOUR family's students
SELECT * FROM students;

-- Even if you try to specify another family_id, it won't work!
SELECT * FROM students WHERE family_id = 'some-other-family-uuid';
-- Returns 0 rows (RLS blocks it)
```

---

## Verification Steps

After running the migration, verify it worked:

### 1. Check Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- `families`
- `students`
- `learning_sessions`
- `progress_nodes`
- `compliance_logs`

### 2. Check RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`

### 3. Test Insert (Optional)

Try creating a test family (replace with your Supabase auth user ID):

```sql
-- First, get your user ID from Supabase Auth dashboard
-- Then insert a test family:

INSERT INTO families (parent_email)
VALUES ('your-auth-email@example.com');

-- If this works, RLS is configured correctly!
```

---

## Pricing & Limits (Free Tier)

The Supabase free tier includes:

- ✅ **50,000 monthly active users** (way more than you need for MVP)
- ✅ **500 MB database** (can store ~10,000 students worth of data)
- ✅ **1 GB file storage** (for avatars, exports)
- ✅ **2 GB bandwidth** (API requests)
- ✅ **Unlimited API requests**
- ✅ **Paused after 7 days of inactivity** (free tier only)

**For your use case**: The free tier is perfect for:
- 100-1,000 families
- Tens of thousands of learning sessions
- All MVP features

You'll only need to upgrade ($25/month Pro tier) if:
- You have 1,000+ active families
- Database exceeds 500 MB
- You need point-in-time recovery

---

## Backup & Export

### Manual Backup (Free)

1. Go to **Database** → **Backups** in Supabase
2. Click **Create Backup** (manually)
3. Download the backup file

### Automated Backups (Pro Tier)

- Daily automated backups
- Point-in-time recovery
- 7-day retention

### Export All Data (Anytime)

In SQL Editor:

```sql
-- Export all family data as JSON
SELECT json_build_object(
  'family', (SELECT json_agg(families.*) FROM families),
  'students', (SELECT json_agg(students.*) FROM students),
  'sessions', (SELECT json_agg(learning_sessions.*) FROM learning_sessions),
  'progress', (SELECT json_agg(progress_nodes.*) FROM progress_nodes)
);
```

---

## Troubleshooting

### "Invalid API key" Error

**Problem**: App can't connect to Supabase

**Solution**:
1. Double-check `.env.local` has correct keys
2. Restart Expo dev server: `pnpm mobile`
3. Verify keys match Supabase dashboard (Settings → API)

### "Row-level security policy violation" Error

**Problem**: Can't insert/update data

**Solution**:
1. Make sure you're signed in via Supabase Auth
2. Verify your auth user email matches `parent_email` in `families` table
3. Check RLS policies are enabled

### "Database is paused" (Free Tier)

**Problem**: Free tier auto-pauses after 7 days of inactivity

**Solution**:
1. Go to Supabase dashboard
2. Click "Restore" button
3. Database will be active in ~1 minute

---

## Next Steps

After Supabase is set up:

1. ✅ Run the mobile app: `pnpm mobile`
2. ✅ Sign up with a parent account
3. ✅ Add student profiles
4. ✅ Start a lesson and verify progress syncs
5. ✅ Check Supabase dashboard to see data appear

---

## Advanced: Self-Hosting (Optional)

If you want to run your own Supabase instance:

```bash
# Clone Supabase
git clone https://github.com/supabase/supabase
cd supabase/docker

# Start Supabase locally
docker-compose up -d

# Access at http://localhost:3000
# Use local API URL in your .env.local
```

**Trade-offs**:
- ✅ Full control, no monthly cost
- ✅ Unlimited usage
- ❌ You manage updates, backups, security
- ❌ Requires server to run 24/7

---

## Support

**Supabase Docs**: https://supabase.com/docs
**Supabase Discord**: https://discord.supabase.com

**Project Issues**: https://github.com/your-username/homeschool-ai/issues
