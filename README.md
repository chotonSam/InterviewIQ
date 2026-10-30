# InterviewIQ — Frontend (Next.js + Tailwind CSS)

AI-powered interview preparation platform — University Web Technology project.
Step 1: HTML/Tailwind designs. Step 2: converted to Next.js. Step 3: Community page (UI). Step 4: backend — MongoDB, auth, Gemini interview. Step 5: Community backend. Step 6: Learning resources. Step 7: GSAP animations.

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

## Setup (backend)

1. `npm install`
2. Make sure `.env.local` exists (copy `.env.example` and fill it in). Needs `MONGODB_URI`, `GEMINI_API_KEY`, `AUTH_SECRET`.
3. In MongoDB Atlas → **Network Access**, allow your IP (for development you can use `0.0.0.0/0`).
4. `npm run dev`

## What's real vs. mocked

Real (MongoDB + Gemini):
- Register / login / logout with a signed httpOnly session cookie (bcrypt-hashed passwords)
- Live username check (`/api/users/check-username`)
- Create interview: category + difficulty → Gemini generates 6 questions (server-side)
- Submit answer: Gemini scores it → saved as Answer + Feedback; interview score = average
- Dashboard: stats, streak, trend, per-category scores, recent interviews (from your real data)
- Reopen any past interview from the dashboard to review answers and feedback

- Community: create posts, paginated feed (5 per page), like/unlike (one per user), comments that update live for everyone who has them open (polls every 5s)
- Learning resources: add YouTube videos (embedded player) or article links, filter by type, paginated (6 per page), 1–5 star rating (change anytime, live average), delete your own, top-rated shown on the dashboard

Animations (GSAP, `components/motion/`): hero entrance, scroll-reveal sections, staggered cards, dashboard chart line draws itself, category bars grow, AI score counts up, question cards slide in. Respects the "reduce motion" OS setting.

Still mock: landing page numbers.

## API routes

| Method | Route                              | Purpose                          |
| ------ | ---------------------------------- | -------------------------------- |
| POST   | `/api/auth/register`               | Create account + session         |
| POST   | `/api/auth/login`                  | Log in                           |
| POST   | `/api/auth/logout`                 | Log out                          |
| GET    | `/api/users/check-username?u=`     | Username availability            |
| POST   | `/api/interviews`                  | Create interview (AI questions)  |
| POST   | `/api/interviews/:id/answers`      | Submit answer (AI evaluation)    |
| GET    | `/api/posts?page=`                 | Paginated community feed         |
| POST   | `/api/posts`                       | Create post                      |
| POST   | `/api/posts/:id/like`              | Toggle like                      |
| GET    | `/api/posts/:id/comments`          | List comments (polled for live)  |
| POST   | `/api/posts/:id/comments`          | Add comment                      |
| GET    | `/api/resources?page=&type=`       | Paginated resources              |
| POST   | `/api/resources`                   | Add resource (video/article)     |
| DELETE | `/api/resources/:id`               | Delete your resource             |
| POST   | `/api/resources/:id/rate`          | Rate 1–5 (create or change)      |

## Data model (ERD)

USER 1—* INTERVIEW 1—* QUESTION 1—1 ANSWER 1—1 FEEDBACK, and CATEGORY 1—* INTERVIEW.
USER 1—* POST, POST 1—* COMMENT, POST 1—* LIKE (unique per user+post).
USER 1—* LEARNING_RESOURCE 1—* RATING (unique per user+resource). See `lib/models/`.

## Next steps

1. Learning resources (YouTube embeds + rating)
2. Profile page + picture upload (Cloudinary)
