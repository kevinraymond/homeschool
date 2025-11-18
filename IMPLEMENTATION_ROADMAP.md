# Implementation Roadmap

## 🎯 MVP Goal: Elementary Math Platform (8-12 Weeks)

A polished, functional platform where students can learn 3rd grade math with AI tutoring, and parents can track progress across multiple children.

---

## Week 1-2: Foundation

### Goals
- Project setup complete
- Database connected
- First screen functional

### Tasks

**Day 1-2: Initial Setup**
- [ ] Install dependencies (`pnpm install`)
- [ ] Set up Supabase project
- [ ] Run database schema in Supabase SQL Editor
- [ ] Configure `.env` with Supabase credentials
- [ ] Test mobile app starts (`pnpm mobile`)

**Day 3-4: Database Integration**
- [ ] Create Supabase client singleton
- [ ] Implement auth (sign up, sign in, sign out)
- [ ] Test auth flow in app
- [ ] Create family on signup
- [ ] Add student screen (parent can add a child)

**Day 5-7: First Functional Flow**
- [ ] Parent signs up
- [ ] Parent adds student
- [ ] Student list shows on home screen
- [ ] Navigate to student detail (placeholder)

**Success Criteria**:
- Can sign up, add student, see student in list
- Data persists in Supabase
- No crashes, smooth experience

---

## Week 3-4: Student Learning Interface

### Goals
- Students can complete a lesson
- Practice problems work
- Basic AI hints functional

### Tasks

**Day 8-10: Lesson Player**
- [ ] Create LessonPlayer component
- [ ] Load lesson from YAML (use `math-g3-add-1`)
- [ ] Display video section (placeholder video URL)
- [ ] Swipeable cards between sections

**Day 11-13: Practice Problems**
- [ ] Use ProblemGenerator for math problems
- [ ] Display multiple choice questions
- [ ] Check answers (correct/incorrect feedback)
- [ ] Track time spent per problem

**Day 14: AI Integration**
- [ ] Set up AWS Bedrock credentials
- [ ] Test CloudAITutor hint generation
- [ ] Add "Get Hint" button to problem screen
- [ ] Display AI hint in modal

**Success Criteria**:
- Student can swipe through lesson
- Student can answer practice problems
- AI provides helpful hint when stuck
- Session is tracked in database

---

## Week 5-6: Progress & Adaptive Learning

### Goals
- Track student mastery
- Adjust difficulty dynamically
- Show progress to parents

### Tasks

**Day 15-17: Progress Tracking**
- [ ] Create progress_nodes on lesson completion
- [ ] Calculate mastery_level based on accuracy
- [ ] Update difficulty_level after each session
- [ ] Create LearningSession record with results

**Day 18-20: Adaptive Difficulty**
- [ ] Implement adaptive learning engine
- [ ] Increase difficulty if accuracy > 85%
- [ ] Decrease difficulty if accuracy < 50%
- [ ] Offer hint if stuck >30 seconds

**Day 21: Parent Progress View**
- [ ] Create progress screen for parent
- [ ] Show mastery levels per concept
- [ ] Display recent sessions
- [ ] Calculate learning velocity

**Success Criteria**:
- Difficulty adjusts based on performance
- Parent can see what child has mastered
- Analytics are meaningful and accurate

---

## Week 7-8: Multi-Child & Polish

### Goals
- Support multiple children
- Family insights work
- App feels polished

### Tasks

**Day 22-24: Multi-Child Dashboard**
- [ ] Parent can add multiple students
- [ ] Home screen shows all students
- [ ] Each student has separate progress
- [ ] Switch between students easily

**Day 25-26: Family Insights**
- [ ] Analyze learning patterns across students
- [ ] Generate AI family insight (cross-child)
- [ ] Display insight card on home screen
- [ ] "Apply Suggestion" button (mock for MVP)

**Day 27-28: Polish & UX**
- [ ] Add loading states
- [ ] Add error handling
- [ ] Smooth animations
- [ ] Celebrate lesson completion (animation)
- [ ] Improve visual design

**Success Criteria**:
- Parent can manage 4 kids smoothly
- Family insights are accurate and useful
- App feels professional and polished

---

## Week 9: Family Alpha Testing

### Goals
- Your 4 kids use the app
- Find and fix bugs
- Gather feedback

### Tasks

**Day 29-31: Deploy to Devices**
- [ ] Build with EAS Build
- [ ] Install on family devices (iOS/Android)
- [ ] Add all 4 kids as students
- [ ] Each kid tries at least one lesson

**Day 32-35: Iterate**
- [ ] Log all bugs in notebook
- [ ] Fix critical bugs
- [ ] Implement high-value feedback
- [ ] Test fixes with family

**Success Criteria**:
- App works on real devices
- Kids can complete lessons independently
- Parents can track progress easily
- Major bugs are fixed

---

## Week 10: Compliance & Voice Features

### Goals
- Basic compliance tracking
- Voice tutoring (Whisper)

### Tasks

**Day 36-38: Compliance**
- [ ] Track daily learning time per subject
- [ ] Show compliance progress (days completed)
- [ ] State-specific requirements (start with your state)
- [ ] Export portfolio (basic PDF)

**Day 39-42: Voice Features**
- [ ] Integrate Whisper for speech-to-text
- [ ] Reading fluency assessment
- [ ] Voice-based question answering
- [ ] Text-to-speech for reading support (Piper)

**Success Criteria**:
- Compliance tracking shows accurate data
- Voice features work reliably
- Reading assessment provides useful feedback

---

## Week 11: Expand Curriculum

### Goals
- Add more math lessons
- Cover K-5 basics
- Template for other subjects

### Tasks

**Day 43-45: More Math Lessons**
- [ ] Create 20+ math lessons (all grades K-5)
- [ ] Subtraction, multiplication, division, fractions
- [ ] Test each lesson with your kids
- [ ] Fix any issues with problem generators

**Day 46-47: Curriculum Template**
- [ ] Document lesson creation process
- [ ] Create template for reading lessons
- [ ] Create template for science lessons
- [ ] Make it easy to add new subjects

**Day 48-49: Content Quality**
- [ ] Review all AI prompts (Socratic quality)
- [ ] Test adaptive difficulty
- [ ] Ensure explanations are age-appropriate
- [ ] Get feedback from your kids

**Success Criteria**:
- 20-30 solid math lessons
- Clear path to add other subjects
- Content quality is high

---

## Week 12: Beta Launch Prep

### Goals
- App Store ready
- Landing page live
- Beta invites sent

### Tasks

**Day 50-52: App Store Submission**
- [ ] Create App Store listing (screenshots, description)
- [ ] Submit to App Store (iOS)
- [ ] Submit to Google Play (Android)
- [ ] Set up TestFlight for beta testers

**Day 53-55: Landing Page**
- [ ] Build simple Next.js landing page
- [ ] Explain the value proposition
- [ ] Privacy-first messaging
- [ ] Beta signup form
- [ ] Deploy to Vercel

**Day 56: Beta Launch**
- [ ] Email 20 homeschool families
- [ ] Post in r/homeschool
- [ ] Post in Facebook homeschool groups
- [ ] Create Discord for beta testers
- [ ] Start collecting feedback

**Success Criteria**:
- Apps approved in stores
- 20+ beta testers signed up
- Feedback channel established

---

## Post-MVP: Next 3 Months

### Month 2: Iterate on Feedback
- Fix bugs discovered by beta testers
- Add most-requested features
- Expand math curriculum (geometry, word problems)
- Add second subject (reading or science)

### Month 3: Growth Features
- Full K-5 curriculum (all core subjects)
- Middle school content (grades 6-8)
- Advanced analytics (velocity, predictions)
- Co-op features (basic multi-family)

### Month 4-6: Monetization
- Premium tier ($49/month Family Plan)
- All 50 states compliance
- High school content
- Marketing and growth

---

## Success Metrics

### Week 1-4: Foundation
- No crashes
- Auth works 100%
- First lesson playable

### Week 5-8: Learning
- Students complete lessons independently
- AI hints are helpful (feedback from kids)
- Progress tracking is accurate

### Week 9-12: Launch
- 20+ beta families
- 4.0+ star rating (internal feedback)
- 60%+ retention after 7 days

---

## Risk Mitigation

**If Local AI is too slow:**
- Use cloud AI only (AWS Bedrock)
- Add local AI later (Phase 2)

**If AWS Bedrock is expensive:**
- Start with free tier (generous)
- Optimize prompts (shorter = cheaper)
- Add usage limits for free tier

**If curriculum creation is slow:**
- Focus on math only for MVP
- Use AI to generate practice problems
- Expand subjects after launch

**If not enough beta testers:**
- Start with friends/family
- Post in more communities
- Build in public (Twitter, Reddit)

---

## Your Advantage

You have 4 built-in beta testers (your kids)!

**Use them:**
- Test every feature as you build
- Get immediate feedback
- Iterate quickly
- Build exactly what works

**Trust your instincts:**
- You know what homeschool families need
- You live the pain points daily
- Your experience is your moat

---

## Weekly Checklist

Copy this for each week:

```
## Week X: [Goal]

### Monday
- [ ] Task 1
- [ ] Task 2

### Tuesday
- [ ] Task 3
- [ ] Task 4

### Wednesday
- [ ] Task 5
- [ ] Task 6

### Thursday
- [ ] Task 7
- [ ] Task 8

### Friday
- [ ] Task 9
- [ ] Test with family

### Weekend
- [ ] Polish and prepare for next week
```

---

## Final Thoughts

**This is aggressive but achievable.**

Keys to success:
1. **Start today** - Don't overthink
2. **Ship fast** - Iterate based on feedback
3. **Test with your kids** - Built-in user research
4. **Focus on core value** - Student learns, parent sees progress
5. **Polish later** - Working > Perfect

You've got this! 🚀
