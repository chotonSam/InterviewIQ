// Finds the preview image of a web page (its og:image), safely, on the server.
import dns from "node:dns/promises";
import net from "node:net";

const MAX_BYTES = 300_000;
const TIMEOUT_MS = 4000;
const MAX_REDIRECTS = 3;

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase();
    return l === "::" || l === "::1" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:");
  }
  return true;
}

// Never let the server be tricked into opening internal addresses (localhost, 192.168.x.x, cloud metadata…)
async function assertPublic(u) {
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("bad protocol");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("private host");
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new Error("private ip");
    return;
  }
  const addrs = await dns.lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new Error("private ip");
}

async function readStart(res) {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let html = "";
  let bytes = 0;
  while (bytes < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    html += decoder.decode(value, { stream: true });
    if (/<\/head>/i.test(html)) break; // the meta tags live in <head>
  }
  reader.cancel().catch(() => {});
  return html;
}

const decodeEntities = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x2F;/gi, "/");

function pickImage(html, baseUrl) {
  const wanted = ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"];
  const found = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    const content = /content\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (key && content && wanted.includes(key) && !found[key]) found[key] = decodeEntities(content.trim());
  }
  const raw = wanted.map((k) => found[k]).find(Boolean);
  if (!raw) return "";
  try {
    const abs = new URL(raw, baseUrl);
    return abs.protocol === "https:" ? abs.toString().slice(0, 500) : ""; // https only (browsers block http images on our https site)
  } catch {
    return "";
  }
}

// Returns an https image URL, or "" when there isn't one / the page can't be read
export async function fetchPreviewImage(pageUrl) {
  try {
    let url = new URL(pageUrl);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublic(url);
      const res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; InterviewIQBot/1.0)", Accept: "text/html,application/xhtml+xml" },
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        url = new URL(res.headers.get("location"), url);
        continue;
      }
      if (!res.ok || !/text\/html|application\/xhtml/i.test(res.headers.get("content-type") ?? "")) return "";
      return pickImage(await readStart(res), url);
    }
    return "";
  } catch {
    return "";
  }
}
