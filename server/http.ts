// Static file server for the portfolio site, exposed as a PURE (req,res) handler so it
// can run either mono-process (createAppServer) or mutualised inside a bucket
// (createAppHandler imported by the bucket-runner, without listen). Serves the static
// site files + /api/health for the hub healthcheck.
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { ServerConfig } from "./config.js";

// Site root computed relatively to THIS module (server/dist/http.js -> ../../), NEVER via
// process.cwd(): inside a bucket the cwd is that of the shared runner, not the product.
const ROOT = normalize(join(fileURLToPath(new URL(".", import.meta.url)), "../../"));

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

export function createAppHandler(config: ServerConfig) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const url = request.url || "/";
    if (url === "/api/health" || url === "/__hub_health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok", service: config.productSlug }));
      return;
    }

    let file = safePath(url);
    if (!file) {
      response.writeHead(403);
      response.end("forbidden");
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
        response.writeHead(200, {
          "content-type": type,
          "cache-control": isHtml ? "public, max-age=60, must-revalidate" : "public, max-age=3600",
          ...securityHeaders(),
        });
        response.end(body);
        return;
      } catch {
        // try next candidate
      }
    }

    response.writeHead(404, { "content-type": "text/plain" });
    response.end("404 not found");
  };
}

export function createAppServer(config: ServerConfig) {
  return createServer(createAppHandler(config));
}
