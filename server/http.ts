// Static file server for the portfolio site, exposed as a PURE (req,res) handler so it
// can run either mono-process (createAppServer) or mutualised inside a bucket
// (createAppHandler imported by the bucket-runner, without listen). Serves the static
// site files + /api/health for the hub healthcheck.
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
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
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const ANALYTICS_HOST = "https://analytics.leandro-sierra.com";
const EXPERIMENT_ID = Number(process.env.ADA_EXPERIMENT_ID || "1");
const EXPERIMENT_URL = (process.env.ADA_EXPERIMENTS_URL || "").replace(/\/$/, "");
const EXPERIMENT_TOKEN = process.env.ADA_EXPERIMENTS_TOKEN || "";
const ANALYTICS_SNIPPET = `<script>
(function(){
  var analyticsHost = "${ANALYTICS_HOST}";
  function path(){ return "/" + window.location.host + window.location.pathname + window.location.search; }
  window.goatcounter = Object.assign({}, window.goatcounter || {}, {
    endpoint: analyticsHost + "/count",
    path: path,
    no_onload: true,
    allow_local: true
  });
  var s = document.createElement("script");
  s.async = true;
  s.src = analyticsHost + "/count.js";
  s.setAttribute("data-goatcounter", analyticsHost + "/count");
  s.setAttribute("data-goatcounter-host", window.location.host);
  s.onload = function(){ window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path: path(), title: document.title }); };
  document.head.appendChild(s);
}());
</script>`;

const CONSENT_SNIPPET = `<script>
(function(){
  var key = "portfolio_consent_v1";
  if (localStorage.getItem(key) || document.getElementById("consent-banner")) return;
  var css = ".consent-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:50;background:#111827;color:#fff;border-radius:8px;box-shadow:0 16px 40px rgba(0,0,0,.25);font:14px/1.45 system-ui,sans-serif}.consent-banner__inner{max-width:980px;margin:auto;padding:14px 16px;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap}.consent-banner label{display:inline-flex;align-items:center;gap:6px}.consent-banner button{border:0;border-radius:6px;padding:8px 12px;background:#fff;color:#111827;font-weight:700;cursor:pointer}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  var banner = document.createElement("div");
  banner.id = "consent-banner";
  banner.className = "consent-banner";
  banner.innerHTML = '<div class="consent-banner__inner"><span>Mesure d\\'audience GoatCounter active sans cookie.</span><label><input type="checkbox" name="metrics-consent" checked disabled data-consent-metrics-state="checked disabled"> Metrics</label><button type="button">OK</button></div>';
  banner.querySelector("button").addEventListener("click", function(){ localStorage.setItem(key, "metrics"); banner.remove(); });
  document.body.appendChild(banner);
}());
</script>`;

function withAnalytics(html: string, variant = "control"): string {
  let out = html.replace(/<script data-goatcounter="https:\/\/analytics\.leandro-sierra\.com\/count" async src="https:\/\/analytics\.leandro-sierra\.com\/count\.js"><\/script>\s*/g, "");
  if (!out.includes("data-goatcounter")) out = out.replace("</head>", `${ANALYTICS_SNIPPET}\n</head>`);
  if (!out.includes("data-consent-metrics-state")) out = out.replace("</body>", `${CONSENT_SNIPPET}\n</body>`);
  const causal = `<script>(function(){var v=${JSON.stringify(variant)};document.documentElement.dataset.ctaVariant=v;var a=document.querySelector('a[href*="contact"]');if(a&&v==='concise')a.textContent='Parlons de votre produit';if(a)a.addEventListener('click',function(){fetch('/api/experiment/contact-intent',{method:'POST',headers:{'content-type':'application/json'},body:'{}',keepalive:true}).catch(function(){})},{once:true})}());</script>`;
  out = out.replace("</body>", `${causal}\n</body>`);
  return out;
}

function subjectCookie(request: IncomingMessage): { subject: string; created: boolean } {
  const match = String(request.headers.cookie || "").match(/(?:^|;\s*)portfolio_subject=([a-f0-9-]{36})/i);
  return match ? { subject: match[1], created: false } : { subject: randomUUID(), created: true };
}

async function causal(path: "assign" | "events", payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!EXPERIMENT_URL || !EXPERIMENT_TOKEN || !Number.isInteger(EXPERIMENT_ID)) return {};
  const response = await fetch(`${EXPERIMENT_URL}/api/product-experiments/${EXPERIMENT_ID}/${path}`, {
    method: "POST", headers: { authorization: `Bearer ${EXPERIMENT_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(2500),
  });
  return response.ok ? await response.json() as Record<string, unknown> : {};
}

const CSP =
  "default-src 'self'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "font-src 'self'; " +
  "img-src 'self' data: https:; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.leandro-sierra.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://googleads4.g.doubleclick.net https://tpc.googlesyndication.com https://fundingchoicesmessages.google.com https://ep1.adtrafficquality.google; " +
  "connect-src 'self' https://analytics.leandro-sierra.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://googleads4.g.doubleclick.net https://fundingchoicesmessages.google.com https://ep1.adtrafficquality.google; " +
  "frame-src https://googleads.g.doubleclick.net https://googleads4.g.doubleclick.net https://tpc.googlesyndication.com https://fundingchoicesmessages.google.com https://www.google.com; " +
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

function redirect(response: ServerResponse, location: string): void {
  response.writeHead(301, { location, ...securityHeaders() });
  response.end();
}

export function createAppHandler(config: ServerConfig) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const url = request.url || "/";
    const pathname = decodeURIComponent(url.split("?")[0].split("#")[0]);
    if (url === "/api/health" || url === "/__hub_health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok", service: config.productSlug }));
      return;
    }
    if (pathname === "/api/experiment/contact-intent" && request.method === "POST") {
      const { subject } = subjectCookie(request);
      await causal("events", { subject_key: subject, metric: "contact_intent", value: 1, dedup_key: `contact:${subject}` }).catch(() => ({}));
      response.writeHead(202, { "content-type": "application/json", ...securityHeaders() });
      response.end('{"accepted":true}');
      return;
    }

    if (pathname === "/privacy-policy" || pathname === "/privacy-policy.html") {
      redirect(response, "/privacy.html");
      return;
    }
    if (pathname === "/terms-of-use" || pathname === "/terms-of-use.html" || pathname === "/legal") {
      redirect(response, "/terms.html");
      return;
    }

    let file = safePath(url);
    if (!file) {
      response.writeHead(403, { "content-type": "text/plain; charset=utf-8", ...securityHeaders() });
      response.end("forbidden");
      return;
    }

    // Try the path, then the .html variant for clean URLs. This is a static site, so
    // unknown paths must stay 404 instead of becoming soft-404 copies of the homepage.
    const candidates = [file];
    if (!extname(file)) candidates.push(file + ".html");

    for (const cand of candidates) {
      try {
        const s = await stat(cand);
        if (!s.isFile()) continue;
        const body = await readFile(cand);
        const type = TYPES[extname(cand)] || "application/octet-stream";
        const isHtml = type.startsWith("text/html");
        let variant = "control";
        const cookie = subjectCookie(request);
        if (isHtml && cand.endsWith("index.html")) {
          const assigned: Record<string, unknown> = await causal("assign", { subject_key: cookie.subject }).catch(() => ({}));
          variant = typeof assigned.variant === "string" ? assigned.variant : "control";
        }
        const payload = isHtml ? withAnalytics(body.toString("utf8"), variant) : body;
        response.writeHead(200, {
          "content-type": type,
          "cache-control": isHtml ? "public, max-age=60, must-revalidate" : "public, max-age=3600",
          ...securityHeaders(),
          ...(cookie.created ? { "set-cookie": `portfolio_subject=${cookie.subject}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax` } : {}),
        });
        response.end(payload);
        return;
      } catch {
        // try next candidate
      }
    }

    response.writeHead(404, { "content-type": "text/plain; charset=utf-8", ...securityHeaders() });
    response.end("404 not found");
  };
}

export function createAppServer(config: ServerConfig) {
  return createServer(createAppHandler(config));
}
