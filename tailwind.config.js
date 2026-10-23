/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14161F",
          soft: "#1B1E2B",
          line: "#2A2E40",
        },
        paper: "#F6F4EF",
        indigo: {
          DEFAULT: "#5B5FEF",
          dim: "#4347C4",
        },
        signal: {
          green: "#34D399",
          amber: "#FBBF24",
          red: "#F87171",
        },
        slate: {
          muted: "#9297AC",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
