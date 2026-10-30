export const RESOURCE_TAGS = ["Frontend", "Backend", "System Design", "HR / Behavioral", "Interview Tips", "General"];

// Returns the 11-character video id for the common YouTube link styles, or null
export function parseYouTubeId(raw) {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^(www|m)\./, "");
    let id = null;

    if (host === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0];
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else {
        const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?]+)/);
        if (m) id = m[2];
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

// Only plain http(s) links are allowed (blocks javascript:, data:, etc.)
export function cleanUrl(raw) {
  try {
    const u = new URL(String(raw).trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString().slice(0, 500);
  } catch {
    return null;
  }
}
