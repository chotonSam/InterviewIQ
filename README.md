# InterviewIQ — Frontend (Next.js + Tailwind CSS)

AI-powered interview preparation platform — University Web Technology project.
Step 1: HTML/Tailwind designs. Step 2: converted to Next.js. Step 3: Community page (UI). Step 4: backend — MongoDB, auth, Gemini interview. Step 5: Community backend. Step 6: Learning resources. Step 7: GSAP animations. Step 8: Profile + picture upload. Step 9: faster AI, short questions, locked levels, custom fields, practice chat, real history. Step 10: polish — thumbnails, live landing page, new score chart, post delete, profile activity. Step 11: mobile navigation, notifications, replies, public profiles, profile redesign, resource search. Step 12: email verification (OTP + link). Step 13: timed mode + time tracking. Step 14: custom topics ("Other") for posts and resources. Step 15: Community topic filter + "Did you mean?". Step 16: forgot / reset / change password.

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


### Passwords: forgot, reset and change

- **Forgot password** (`/forgot-password`, linked from the login form): enter your email; if an account exists a **6-digit code (10 min, 5 tries)** and a **link (1 h)** are emailed with the same free Gmail setup as email verification. Enter the code + a new password on the same page, or open the link (`/reset-password?token=...`). The answer is always the same whether or not the email has an account, so nobody can use the page to find out who is registered. Limits: 1 email per minute and 5 per day per account. Codes/tokens are stored only as hashes. Getting the reset email also counts as verifying the email address.
- **Change password** (Profile -> "Change password"): needs the current password; 5 wrong attempts pause the check for 15 minutes; the new password must differ from the old one.
- **Rules:** 8-72 characters (bcrypt only reads the first 72 bytes), enforced on register, reset and change.
- **Other devices are signed out:** every user has a `tokenVersion` that goes up on each reset/change; each login cookie carries the number it was issued with, and `getSessionUserId` (lib/session.js) rejects a cookie whose number is old. The device that changed the password gets a fresh cookie and stays logged in. Cookies issued before this feature keep working until the first reset/change.
- **Not covered yet:** the login form itself has no limit on wrong-password attempts.

### Custom topics ("Other…") for posts and resources

- The topic dropdown in the community form and the add-resource form has an **Other… (type your own)** choice. Topics are 2-30 characters with at least one letter; letters, numbers and `& + . # / -` are allowed.
- One topic keeps one spelling: "frontend" becomes the built-in "Frontend"; "DATA SCIENCE" reuses an existing "Data Science"; a brand-new topic gets a capital first letter. Matching is literal (no regex tricks) and done on the server.
- Topics people already typed are suggested while you type. On the Resources page they also appear as filter chips (the 8 busiest, the rest in a "More topics" menu); the topic you are filtering by always keeps its chip.
- Posting still needs a non-empty topic; the Publish / Add buttons stay disabled while "Other" is chosen but empty.
- **Community topic filter:** chips above the posts (built-in topics with counts, the 8 busiest custom ones, the rest in a "More topics" menu) show only posts about one topic, across all pages (`GET /api/posts?tag=...`; the response also carries `tagCounts`). The same `TopicChips` component is used on the Resources page. Posting while a filter is on clears the filter so your new post is visible. Old, slower responses never overwrite newer ones.
- **"Did you mean…?":** when a typed topic is a near miss of an existing one (1 letter off for words up to 5 letters, 2 for longer; a swapped pair counts as 1), the form offers the existing topic with a "Use it" button. Exact matches ignoring capitals get no prompt — the server already unifies those. Choosing a built-in topic switches the form back to the dropdown. (`closestTopic` in `lib/topics.js`)

### Timed mode and time tracking

- On the interview setup page an optional **Timed mode** switch gives every question a countdown: Easy 1:30, Medium 2:00, Hard 3:00 (`TIME_LIMITS` in `lib/topics.js`).
- When the countdown reaches zero, whatever is typed is submitted automatically. An empty answer is allowed only in this case and scores very low; the feedback says "Time ran out".
- The clock counts only while the tab is visible, so it **pauses** when you switch away or leave. The time is saved every 10 s, on leaving and on page close, so a refresh continues from the same point.
- Every answer stores how long it took (shown in the feedback, the results screen average, and a "Timed" label in the history). Untimed interviews show a count-up clock and are never cut off.
- Rules are enforced on the server: "time ran out" counts only for timed interviews, time values are clamped (0-3600 s), saved time only moves forward, and a timed and an untimed attempt at the same level are kept separate.

### Email verification (free, Gmail SMTP + Nodemailer)

- At sign-up an email is sent with a **6-digit code (OTP)** and a **link**; either one verifies the account.
  - Code: valid 10 minutes, 5 tries, stored only as a keyed hash (HMAC with AUTH_SECRET). Typed into the yellow banner at the top of the app.
  - Link: valid 24 hours, single use; only a SHA-256 hash of the token is stored.
- "Resend email" is limited to 1 per minute and 5 per day per account, and only mails the account's own address.
- Unverified users see the banner and cannot post, comment, reply or add resources (set `REQUIRE_VERIFIED_EMAIL=false` to switch the block off). Verified users get a "Verified" badge on their profile.
- Setup: Gmail account with 2-Step Verification -> App Password -> `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `APP_URL` in `.env.local`, then restart. With no SMTP settings (development only) the code and link are printed in the server terminal and shown in the banner.

## API routes

| Method | Route                              | Purpose                          |
| ------ | ---------------------------------- | -------------------------------- |
| POST   | `/api/auth/register`               | Create account + session         |
| POST   | `/api/auth/login`                  | Log in                           |
| POST   | `/api/auth/logout`                 | Log out                          |
| GET    | `/api/users/check-username?u=`     | Username availability            |
| POST   | `/api/interviews`                  | Create interview (AI questions)  |
| POST   | `/api/interviews/:id/answers`      | Submit answer (AI evaluation)    |
| POST   | `/api/interviews/:id/progress`     | Save time spent on a question    |
| GET    | `/api/posts?page=`                 | Paginated community feed         |
| POST   | `/api/posts`                       | Create post                      |
| POST   | `/api/posts/:id/like`              | Toggle like                      |
| DELETE | `/api/posts/:id`                   | Delete your post                 |
| GET    | `/api/notifications`               | Your notifications               |
| POST   | `/api/notifications`               | Mark one / all as read           |
| GET    | `/api/notifications/unread-count`  | Unread number for the badge      |
| GET    | `/api/posts/:id/comments`          | List comments (polled for live)  |
| POST   | `/api/posts/:id/comments`          | Add comment                      |
| GET    | `/api/resources?page=&type=&tag=&q=&sort=&mine=` | Search, filter, sort, paginate |
| POST   | `/api/resources`                   | Add resource (video/article)     |
| DELETE | `/api/resources/:id`               | Delete your resource             |
| POST   | `/api/resources/:id/rate`          | Rate 1–5 (create or change)      |
| PATCH  | `/api/profile`                     | Update name / phone / picture    |
| POST   | `/api/auth/verify-email`           | Confirm the emailed link token   |
| POST   | `/api/auth/verify-code`            | Confirm the 6-digit code (OTP)   |
| POST   | `/api/auth/resend-verification`    | Send a new verification email    |
| POST   | `/api/auth/forgot-password`        | Email a reset code + link        |
| POST   | `/api/auth/reset-password`         | Set a new password (code or link)|
| POST   | `/api/auth/change-password`        | Change password (logged in)      |
| POST   | `/api/auth/resend-verification`    | Send a new verification email    |
| POST   | `/api/chat`                        | Start a practice chat            |
| POST   | `/api/chat/:id`                    | Send a message, get coach reply  |
| DELETE | `/api/chat/:id`                    | Delete a chat                    |

## Data model (ERD)

USER 1—* INTERVIEW 1—* QUESTION 1—1 ANSWER 1—1 FEEDBACK, and CATEGORY 1—* INTERVIEW.
USER 1—* POST, POST 1—* COMMENT, POST 1—* LIKE (unique per user+post).
USER 1—* LEARNING_RESOURCE 1—* RATING (unique per user+resource). See `lib/models/`.
USER 1—* CHAT_SESSION (messages embedded).

## Next steps (optional)

1. Limit wrong-password attempts on the login form
2. Phone verification (needs an SMS provider — costs money, can be skipped)
3. Resource moderation (suggest → admin approves)
