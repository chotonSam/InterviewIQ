# InterviewIQ — Frontend (Next.js + Tailwind CSS)

AI-powered interview preparation platform — University Web Technology project.
Step 1: HTML/Tailwind designs. Step 2: converted to Next.js. Step 3: Community page (UI). Step 4: backend — MongoDB, auth, Gemini interview. Step 5: Community backend. Step 6: Learning resources. Step 7: GSAP animations. Step 8: Profile + picture upload. Step 9: faster AI, short questions, locked levels, custom fields, practice chat, real history. Step 10: polish — thumbnails, live landing page, new score chart, post delete, profile activity.

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

- Profile (`/profile`): edit name/phone, upload / change / remove a profile picture (browser → Cloudinary unsigned preset → link saved in MongoDB). The picture shows in the sidebar, community posts and comments.

Interview upgrade (step 9):
- Speed: fastest "flash-lite" models first, thinking turned down, hedged requests (a slow model never blocks), timing logged in the server console (`[gemini] model ok in 1200ms`).
- 10 short questions per interview (concept / predict the output / spot the bug / what-if-you-change / quick scenario). Small code snippets are shown in a code block.
- Levels are connected: Easy → Medium → Hard. Medium unlocks after completing Easy, Hard after Medium, separately for each field. Enforced on the server. The results screen suggests the next level.
- "Other field": type any field (e.g. Digital Marketing); it gets its own progress.
- Practice chat (`/chat`): casual AI coach that asks one short question at a time, gives structured feedback (verdict, comment, ideal answer), and answers hint/explain requests. Not scored or locked. Chats are saved.
- Interview history (`/history`): every interview (paginated) plus per-field level progress.

Step 10 polish:
- Answers aren't length-limited any more (up to 2000 characters). Practice-chat explanations can be long and are formatted (paragraphs, bullet lists, bold, code blocks). Mock interview: Ctrl+Enter submits.
- Resource thumbnails: automatic (YouTube thumbnail for videos, the page's own preview image for articles, fetched safely on the server), or upload your own. Broken images fall back to a placeholder.
- Landing page: header shows Dashboard / profile / Log out when logged in (Log in / Start free otherwise); numbers and community posts are real data; copy matches the current interview style.
- Dashboard: new score chart (smooth curve, scale, average line, hover details) and a "next step" card (resume / next level).
- Community: delete your own posts. Profile: "My posts" and "My resources" tabs.


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
| DELETE | `/api/posts/:id`                   | Delete your post                 |
| GET    | `/api/posts/:id/comments`          | List comments (polled for live)  |
| POST   | `/api/posts/:id/comments`          | Add comment                      |
| GET    | `/api/resources?page=&type=`       | Paginated resources              |
| POST   | `/api/resources`                   | Add resource (video/article)     |
| DELETE | `/api/resources/:id`               | Delete your resource             |
| POST   | `/api/resources/:id/rate`          | Rate 1–5 (create or change)      |
| PATCH  | `/api/profile`                     | Update name / phone / picture    |
| POST   | `/api/chat`                        | Start a practice chat            |
| POST   | `/api/chat/:id`                    | Send a message, get coach reply  |
| DELETE | `/api/chat/:id`                    | Delete a chat                    |

## Data model (ERD)

USER 1—* INTERVIEW 1—* QUESTION 1—1 ANSWER 1—1 FEEDBACK, and CATEGORY 1—* INTERVIEW.
USER 1—* POST, POST 1—* COMMENT, POST 1—* LIKE (unique per user+post).
USER 1—* LEARNING_RESOURCE 1—* RATING (unique per user+resource). See `lib/models/`.
USER 1—* CHAT_SESSION (messages embedded).

## Next steps (optional)

1. Email verification (needs an email service such as Resend / Nodemailer)
2. Phone verification (needs an SMS provider — costs money, can be skipped)
3. Resource moderation (suggest → admin approves)
