# InterviewIQ — Frontend (Next.js + Tailwind CSS)

AI-powered interview preparation platform — University Web Technology project.
Step 1: HTML/Tailwind designs. Step 2: converted to Next.js. Step 3: Community page.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000

> Requires Node.js 18.17+. Fonts (Instrument Serif, Inter, IBM Plex Mono) are loaded via `next/font/google`, so the first `dev`/`build` needs internet access.

## Pages

| Route        | What it is                                             |
| ------------ | ------------------------------------------------------ |
| `/`          | Landing page                                           |
| `/auth`      | Log in / Create account (with live username check demo) |
| `/dashboard` | Stats, score trend, category breakdown, history        |
| `/interview` | Interactive mock interview session + AI feedback panel |
| `/community` | Posts, like toggle, expandable comments, pagination    |

## Project structure

```
app/
  layout.js            Root layout (fonts, metadata)
  globals.css          Tailwind + shared classes (.field, .btn-primary, .annot-underline)
  page.js              Landing page
  auth/page.js         Auth page
  (app)/layout.js      Shared sidebar shell for logged-in pages
  (app)/dashboard/
  (app)/interview/
components/
  landing/             Hero, HowItWorks, Features, CommunityPreview, CtaBand, header/footer
  auth/                AuthTabs (client), AuthSidePanel
  dashboard/           StatCards, ScoreTrend, CategoryBreakdown, RecentInterviews, RecommendedResources
  interview/           InterviewSession (client), FeedbackPanel
  Sidebar.js, Logo.js, Icons.js, Annot.js
lib/data.js            Mock data (replaced by API/MongoDB in the backend step)
```

## What is real vs. mocked right now

- Real: routing, layouts, reusable components, responsive UI, tabs, word count, timer, question progress, "evaluating → feedback" flow.
- Mocked (backend step): login/register submit, username availability (`AuthTabs.js`, fake taken list), AI evaluation (`lib/data.js → mockFeedback`), all dashboard numbers.

## Next steps (backend)

1. MongoDB + Mongoose models (User, Category, Interview, Question, Answer, Feedback, Post, Comment, Like, Resource, Rating)
2. Auth.js session login/logout + `/api/users/check-username`
3. `/api/interviews` routes + Gemini integration (server-side only; copy `.env.example` → `.env.local`)
4. Community (posts, comments, likes) and Learning Resources pages
