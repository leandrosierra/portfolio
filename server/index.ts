// Static file server for the portfolio site, served by the webapp-hub (Node/PM2).
// Serves HTML/CSS/asset files from the repo root (process.cwd()) and exposes
// /api/health for the hub healthcheck.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const PORT = Number(process.env.PORT) || 3000;
const ROOT = process.cwd();

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

const CSP =
  "default-src 'self'; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src https://fonts.gstatic.com; " +
  "img-src 'self' data: https:; " +
  "script-src 'self' 'unsafe-inline' https://analytics.leandro-sierra.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; " +
  "connect-src 'self' https://analytics.leandro-sierra.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net; " +
  "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; " +
  "frame-ancestors 'none'; form-action 'self'; base-uri 'self';";

function securityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": CSP,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  };
}

function safePath(urlPath: string): string | null {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  let rel = clean === "/" ? "/index.html" : clean;
  // map extensionless paths to .html (e.g. /about -> /about.html) for clean URLs
  const candidate = normalize(join(ROOT, rel));
  if (!candidate.startsWith(resolve(ROOT))) return null; // path traversal guard
  return candidate;
}

const server = createServer(async (req, res) => {
  const url = req.url || "/";
  if (url === "/api/health" || url === "/__hub_health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  let file = safePath(url);
  if (!file) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }

  // try the path, then the .html variant (clean URLs), then SPA fallback to index.html
  const candidates = [file];
  if (!extname(file)) candidates.push(file + ".html");
  candidates.push(join(ROOT, "index.html"));

  for (const cand of candidates) {
    try {
      const s = await stat(cand);
      if (!s.isFile()) continue;
      const body = await readFile(cand);
      const type = TYPES[extname(cand)] || "application/octet-stream";
      const isHtml = type.startsWith("text/html");
      res.writeHead(200, {
        "content-type": type,
        "cache-control": isHtml ? "public, max-age=60, must-revalidate" : "public, max-age=3600",
        ...securityHeaders(),
      });
      res.end(body);
      return;
    } catch {
      // try next candidate
    }
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("404 not found");
});

server.listen(PORT, () => console.log(`portfolio static server on :${PORT} (root=${ROOT})`));
