// Remaining mock data (landing page + learning-resource suggestions).
// Dashboard and interview data now come from MongoDB.

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
