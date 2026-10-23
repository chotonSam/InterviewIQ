// Mock data used by the UI. In the backend step these will come from MongoDB via API routes.

export const stats = [
  { label: "Total interviews", value: "27" },
  { label: "Average score", value: "81", suffix: "/100", tone: "green" },
  { label: "Practice streak", value: "6", suffix: " days" },
  { label: "Strongest category", value: "Frontend Dev.", small: true },
];

export const categoryScores = [
  { name: "Frontend Development", score: 88, tone: "green" },
  { name: "System Design", score: 74, tone: "indigo" },
  { name: "HR / Behavioral", score: 69, tone: "amber" },
  { name: "Backend Development", score: 61, tone: "amber" },
];

export const recentInterviews = [
  { id: 1, title: "Frontend Development · Medium", when: "Today, 9:40 AM", questions: 6, score: 88, tone: "green" },
  { id: 2, title: "HR / Behavioral · Easy", when: "Yesterday, 6:15 PM", questions: 5, score: 69, tone: "amber" },
  { id: 3, title: "System Design · Hard", when: "3 days ago", questions: 4, score: 74, tone: "indigo" },
  { id: 4, title: "Backend Development · Medium", when: "6 days ago", questions: 6, score: 61, tone: "red" },
];

export const trendPoints = [
  [10, 120], [75, 110], [140, 95], [205, 100], [270, 70], [335, 55], [400, 40], [470, 25],
];

export const resources = [
  { id: 1, tag: "Backend Development", title: "Designing REST APIs that scale", kind: "video" },
  { id: 2, tag: "HR / Behavioral", title: 'Answering "tell me about yourself" well', kind: "video" },
  { id: 3, tag: "Article", title: "How to quantify impact in answers", kind: "article" },
];

export const communityPosts = [
  {
    id: 1, author: "Farhan T.", when: "3 days ago", color: "bg-indigo/30",
    title: "What actually helped my system design round",
    body: 'Practiced with the "hard" difficulty three times before my real interview — the feedback on trade-offs was the part that stuck.',
    likes: 42, comments: 11,
  },
  {
    id: 2, author: "Nusrat A.", when: "1 week ago", color: "bg-signal-green/30",
    title: "HR round questions I keep seeing",
    body: "Sharing the 6 questions that came up in every mock HR round this month, plus what the AI flagged in my answers.",
    likes: 67, comments: 23,
  },
  {
    id: 3, author: "Rakib H.", when: "2 weeks ago", color: "bg-signal-amber/30",
    title: "Went from 61 to 88 in two weeks",
    body: 'Logging the resources that closed my biggest gap — mostly the "quantify impact" note I kept getting.',
    likes: 89, comments: 34,
  },
];

export const interviewQuestions = [
  "Tell me about a time you had to optimize a slow-loading page. What did you do?",
  "Explain the difference between server-side rendering and client-side rendering.",
  "How would you structure state management in a large React application?",
  "Describe how you would make a web page accessible to screen-reader users.",
  "Walk me through what happens when you type a URL into the browser.",
  "Tell me about a disagreement with a teammate and how you resolved it.",
];

// Static example of what the AI evaluation will return (replaced by the Gemini response later)
export const mockFeedback = {
  score: 78,
  strengths: [
    "Gave a concrete starting metric (6s load time)",
    "Named a specific, relevant technique (code splitting)",
  ],
  improvements: [
    "Quantify the outcome — what did load time become?",
    "Mention how you verified the improvement",
  ],
  suggested:
    "…I profiled the page with Lighthouse, found unused JS bundles, and split the code so charts loaded lazily. That took load time from 6s down to 1.8s, which I confirmed with a follow-up Lighthouse run.",
};

export const toneText = {
  green: "text-signal-green",
  amber: "text-signal-amber",
  red: "text-signal-red",
  indigo: "text-paper",
};
export const toneBg = {
  green: "bg-signal-green",
  amber: "bg-signal-amber",
  red: "bg-signal-red",
  indigo: "bg-indigo",
};
