const base = {
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const CheckCircleIcon = (p) => (
  <svg width="18" height="18" {...base} {...p}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
export const ChartIcon = (p) => (
  <svg width="18" height="18" {...base} {...p}><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14" /></svg>
);
export const ChatIcon = (p) => (
  <svg width="18" height="18" {...base} {...p}><path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l1.586-1.586z" /></svg>
);
export const BookIcon = (p) => (
  <svg width="18" height="18" {...base} {...p}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
);
export const PlayIcon = (p) => (
  <svg width="28" height="28" {...base} strokeWidth={1.8} {...p}>
    <path d="M14.752 11.168l-6.518-3.76A1 1 0 007 8.24v7.52a1 1 0 001.234.972l6.518-1.76a1 1 0 00.748-.972V12.14a1 1 0 00-.748-.972z" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);
export const CheckIcon = (p) => (
  <svg width="18" height="18" {...base} strokeWidth={2.2} {...p}><path d="M5 13l4 4L19 7" /></svg>
);
