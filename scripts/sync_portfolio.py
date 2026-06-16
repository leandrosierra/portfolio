from __future__ import annotations

import argparse
import asyncio
import html
import json
import re
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from textwrap import wrap

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
ADA_DB = WORKSPACE / "ada" / "data" / "db" / "ada.db"
BOOTSTRAP_INDEX = WORKSPACE / "ada" / "data" / "products" / "bootstrap" / "index.html"
APEX = "https://leandro-sierra.com"
EXCLUDED = {"adatestdesk", "portfolio"}
FAMILY_LABEL = {"ai": "AI", "reg": "Regulation", "ops": "Operations", "public": "Public app"}


@dataclass
class Product:
    slug: str
    name: str
    family: str
    url: str
    en: str
    fr: str


def js_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def clamp(value: str, limit: int = 190) -> str:
    value = " ".join((value or "").split())
    return value if len(value) <= limit else value[: limit - 1].rstrip() + "…"


def load_existing() -> dict[str, Product]:
    src = (ROOT / "index.html").read_text(encoding="utf-8")
    block = re.search(r"const products = \[(.*?)\n\];", src, re.S)
    if not block:
        return {}
    rows = re.findall(
        r'\{ id:"([\w-]+)", name:"((?:[^"\\]|\\.)*)", family:"(\w+)", url:"([^"]+)", en:"((?:[^"\\]|\\.)*)", fr:"((?:[^"\\]|\\.)*)" \}',
        block.group(1),
    )
    out: dict[str, Product] = {}
    for slug, name, family, url, en, fr in rows:
        out[slug] = Product(slug, json.loads(f'"{name}"'), family, url, json.loads(f'"{en}"'), json.loads(f'"{fr}"'))
    return out


def infer_family(name: str, pitch: str) -> str:
    text = f"{name} {pitch}".lower()
    reg_terms = (
        "compliance", "regulation", "ready", "audit", "eu ", "european", "act", "dora",
        "nis2", "csrd", "cbam", "mica", "gdpr", "aml", "passport", "sanctions",
        "traceability", "due diligence", "whistleblowing", "cyber resilience",
    )
    if any(term in text for term in reg_terms):
        return "reg"
    if "ai" in text or "agent" in text or "llm" in text:
        return "ai"
    ops_terms = ("business", "freelance", "invoice", "contract", "review", "workflow", "team", "smb", "hr")
    if any(term in text for term in ops_terms):
        return "ops"
    return "public"


def load_products() -> list[Product]:
    existing = load_existing()
    con = sqlite3.connect(ADA_DB)
    con.row_factory = sqlite3.Row
    rows = con.execute(
        """
        SELECT slug, name, pitch, domain
        FROM products
        WHERE coalesce(domain, '') <> ''
          AND slug NOT IN ('adatestdesk', 'portfolio')
        ORDER BY slug
        """
    ).fetchall()
    products: list[Product] = []
    for row in rows:
        slug = str(row["slug"])
        current = existing.get(slug)
        name = str(row["name"] or slug)
        pitch = clamp(str(row["pitch"] or name))
        url = str(row["domain"] or f"https://{slug}.leandro-sierra.com").rstrip("/")
        products.append(Product(
            slug=slug,
            name=name,
            family=current.family if current else infer_family(name, pitch),
            url=url,
            en=current.en if current else pitch,
            fr=current.fr if current else pitch,
        ))
    return products


def product_js(products: list[Product]) -> str:
    lines = ["const products = ["]
    for p in products:
        lines.append(
            "  { "
            f"id:{js_string(p.slug)}, name:{js_string(p.name)}, family:{js_string(p.family)}, "
            f"url:{js_string(p.url)}, en:{js_string(p.en)}, fr:{js_string(p.fr)}"
            " },"
        )
    lines.append("];")
    return "\n".join(lines)


def build_jsonld(products: list[Product]) -> str:
    data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "name": "Leandro Sierra",
                "url": APEX,
                "jobTitle": "Web product developer",
                "sameAs": ["https://github.com/leandrosierra", "https://www.linkedin.com/in/leandro-sierra-ai/"],
            },
            {
                "@type": "ItemList",
                "name": "Live web products by Leandro Sierra",
                "numberOfItems": len(products),
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": idx + 1,
                        "url": p.url,
                        "name": p.name,
                        "description": p.en,
                        "image": f"{APEX}/shots/{p.slug}.jpg",
                    }
                    for idx, p in enumerate(products)
                ],
            },
        ],
    }
    return (
        "<!-- SEO-JSONLD:START -->\n"
        '<script type="application/ld+json">'
        + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        + "</script>\n<!-- SEO-JSONLD:END -->"
    )


def build_seo_index(products: list[Product]) -> str:
    links = "\n".join(
        f'<li><a href="{html.escape(p.url)}">{html.escape(p.name)} — {FAMILY_LABEL[p.family]}: '
        f'{html.escape(p.en)}</a></li>'
        for p in products
    )
    return (
        "<!-- SEO-INDEX:START -->\n"
        '<nav class="seo-index" aria-hidden="true">\n'
        "<h1>Leandro Sierra — live web products</h1>\n"
        f"<p>{len(products)} live web products: EU regulatory-readiness tools, AI tooling and consumer apps.</p>\n"
        f"<ul>\n{links}\n</ul>\n</nav>\n<!-- SEO-INDEX:END -->"
    )


def sync_index(products: list[Product]) -> None:
    path = ROOT / "index.html"
    src = path.read_text(encoding="utf-8")
    src = re.sub(r"Portfolio of \d+ live internet products", f"Portfolio of {len(products)} live internet products", src)
    src = re.sub(r"numberOfItems\":\d+", f'numberOfItems":{len(products)}', src)
    src = re.sub(r"const products = \[.*?\n\];", product_js(products), src, flags=re.S)
    src = re.sub(r"<!-- SEO-JSONLD:START -->.*?<!-- SEO-JSONLD:END -->", build_jsonld(products), src, flags=re.S)
    src = re.sub(r"<!-- SEO-INDEX:START -->.*?<!-- SEO-INDEX:END -->", build_seo_index(products), src, flags=re.S)
    path.write_text(src, encoding="utf-8")


def sync_sitemap(products: list[Product]) -> None:
    urls = [APEX + "/", APEX + "/products.html", APEX + "/about.html", APEX + "/contact.html", APEX + "/privacy.html", APEX + "/terms.html"]
    urls.extend(p.url for p in products)
    body = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    body.extend(f"  <url><loc>{html.escape(url)}</loc></url>" for url in urls)
    body.append("</urlset>\n")
    (ROOT / "sitemap.xml").write_text("\n".join(body), encoding="utf-8")


def sync_products_page(products: list[Product]) -> None:
    groups = {key: [p for p in products if p.family == key] for key in FAMILY_LABEL}
    sections = []
    anchors = {"ai": "ai", "reg": "regulation", "ops": "operations", "public": "public-app"}
    for family, label in FAMILY_LABEL.items():
        items = "\n".join(
            f'      <li><a href="{html.escape(p.url)}" rel="noopener"><strong>{html.escape(p.name)}</strong></a> — {html.escape(p.en)}</li>'
            for p in sorted(groups[family], key=lambda x: x.name.casefold())
        )
        sections.append(
            f'  <section>\n    <h2 id="{anchors[family]}">{label} <span class="count">{len(groups[family])}</span></h2>\n'
            f'    <ul class="plist">\n{items}\n    </ul>\n  </section>'
        )
    page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#07080d">
<meta name="color-scheme" content="dark">
<title>All products — Leandro Sierra</title>
<meta name="description" content="The full catalogue of {len(products)} live web products by Leandro Sierra, grouped by category: AI tooling, EU regulatory-readiness kits, operations and consumer apps.">
<link rel="canonical" href="{APEX}/products.html">
<meta property="og:title" content="All products — Leandro Sierra">
<meta property="og:description" content="The full catalogue of {len(products)} live web products, grouped by category.">
<meta property="og:type" content="website">
<meta property="og:url" content="{APEX}/products.html">
<meta property="og:image" content="{APEX}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{APEX}/og.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Sora:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/pages.css">
<style>
  .wrap.wide {{ max-width: 940px; }}
  .catnav {{ display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 36px; }}
  .catnav a {{ border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; font-size: 14px; color: var(--ink-soft); }}
  .catnav a:hover {{ color: var(--ink); text-decoration: none; border-color: var(--accent); }}
  h2 .count {{ color: var(--ink-dim); font-size: 15px; font-weight: 400; }}
  ul.plist {{ list-style: none; padding: 0; }}
  ul.plist li {{ padding: 12px 0; border-bottom: 1px solid var(--line); }}
  ul.plist li strong {{ color: var(--ink); }}
</style>
</head>
<body>
<header class="site"><div class="wrap wide">
  <a class="brand" href="/">Leandro Sierra</a>
  <nav><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy</a></nav>
</div></header>
<main><div class="wrap wide">
  <h1>All products</h1>
  <p class="lead">A complete, browsable index of the {len(products)} live web products built and operated by Leandro Sierra. Each runs on its own subdomain and solves one focused task. Browse by category below.</p>
  <div class="catnav"><a href="#ai">AI</a> <a href="#regulation">Regulation</a> <a href="#operations">Operations</a> <a href="#public-app">Public app</a></div>
{chr(10).join(sections)}
  <hr>
  <p class="meta">Looking for context on how these are built? See the <a href="/about.html">about page</a>. Questions or corrections: <a href="/contact.html">contact</a>.</p>
</div></main>
<footer class="site"><div class="wrap wide">
  <span>© 2026 Leandro Sierra</span><span class="sep">·</span>
  <a href="/">Home</a><span class="sep">·</span>
  <a href="/products.html">All products</a><span class="sep">·</span>
  <a href="/about.html">About</a><span class="sep">·</span>
  <a href="/contact.html">Contact</a><span class="sep">·</span>
  <a href="/privacy.html">Privacy</a>
</div></footer>
</body>
</html>
"""
    (ROOT / "products.html").write_text(page, encoding="utf-8")


def preview_block(slug: str, name: str, description: str, url: str) -> str:
    image = f"{APEX}/shots/{slug}.jpg"
    return f"""<!-- ADA-SOCIAL-PREVIEW:START -->
    <meta property="og:title" content="{html.escape(name, quote=True)}" />
    <meta property="og:description" content="{html.escape(description, quote=True)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{html.escape(url, quote=True)}" />
    <meta property="og:image" content="{html.escape(image, quote=True)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="750" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{html.escape(name, quote=True)}" />
    <meta name="twitter:description" content="{html.escape(description, quote=True)}" />
    <meta name="twitter:image" content="{html.escape(image, quote=True)}" />
    <!-- ADA-SOCIAL-PREVIEW:END -->"""


def inject_preview(path: Path, block: str) -> bool:
    if not path.exists():
        return False
    src = path.read_text(encoding="utf-8")
    head = re.search(r"<head\b[^>]*>(.*?)</head>", src, re.I | re.S)
    if not head:
        return False
    new = re.sub(r"\n?\s*<!-- ADA-SOCIAL-PREVIEW:START -->.*?<!-- ADA-SOCIAL-PREVIEW:END -->", "", src, flags=re.S)
    new = re.sub(r'\n?\s*<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>', "", new, flags=re.I)
    desc = re.search(r'<meta\s+name="description"[^>]*>', new, re.I)
    if desc:
        pos = desc.end()
        new = new[:pos] + "\n    " + block + new[pos:]
    else:
        new = re.sub(r"(<head\b[^>]*>)", r"\1\n    " + block, new, count=1, flags=re.I)
    if new != src:
        path.write_text(new, encoding="utf-8")
        return True
    return False


def preview_targets(slug: str) -> list[Path]:
    root = WORKSPACE / slug
    candidates: list[Path] = []
    for rel in ("index.html",):
        candidates.append(root / rel)
    for base in ("public", "dist", "src"):
        base_path = root / base
        if base_path.exists():
            candidates.extend(p for p in base_path.glob("**/*.html") if "node_modules" not in p.parts)
    seen: set[Path] = set()
    out: list[Path] = []
    for path in candidates:
        if path not in seen:
            out.append(path)
            seen.add(path)
    return out


def sync_previews(products: list[Product]) -> dict[str, int]:
    changed = 0
    skipped = 0
    for p in products:
        block = preview_block(p.slug, p.name, clamp(p.en), p.url)
        targets = preview_targets(p.slug)
        hits = 0
        for target in targets:
            if target.exists():
                before = target.read_text(encoding="utf-8", errors="ignore")
                inject_preview(target, block)
                after = target.read_text(encoding="utf-8", errors="ignore")
                if "ADA-SOCIAL-PREVIEW:START" in after:
                    hits += 1
                    changed += int(before != after)
        skipped += int(hits == 0)
    bootstrap_block = preview_block("__PRODUCT_SLUG__", "__PRODUCT_NAME__", "__PRODUCT_PITCH__", "https://__PRODUCT_SLUG__.leandro-sierra.com")
    bootstrap_changed = inject_preview(BOOTSTRAP_INDEX, bootstrap_block)
    return {"changed": changed, "skipped": skipped, "bootstrap_changed": int(bootstrap_changed)}


async def launch_browser():
    from playwright.async_api import async_playwright

    pw = await async_playwright().start()
    for kwargs in ({"channel": "chrome"}, {"channel": "msedge"}, {}):
        try:
            browser = await pw.chromium.launch(headless=True, **kwargs)
            return pw, browser
        except Exception:
            continue
    await pw.stop()
    raise RuntimeError("No Chromium browser available for screenshots")


async def capture_one(browser, product: Product, sem: asyncio.Semaphore) -> tuple[str, str]:
    async with sem:
        page = await browser.new_page(viewport={"width": 1200, "height": 750}, device_scale_factor=1)
        try:
            await page.goto(product.url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(1600)
            await page.screenshot(path=str(ROOT / "shots" / f"{product.slug}.jpg"), type="jpeg", quality=82)
            return product.slug, "ok"
        except Exception as exc:
            return product.slug, f"error: {exc}"
        finally:
            await page.close()


async def capture_screenshots(products: list[Product], *, only_missing: bool, limit: int, concurrency: int) -> dict[str, object]:
    targets = products
    if only_missing:
        targets = [p for p in products if not (ROOT / "shots" / f"{p.slug}.jpg").exists()]
    if limit:
        targets = targets[:limit]
    (ROOT / "shots").mkdir(exist_ok=True)
    if not targets:
        return {"total": 0, "ok": 0, "errors": []}
    pw, browser = await launch_browser()
    try:
        sem = asyncio.Semaphore(concurrency)
        results = await asyncio.gather(*(capture_one(browser, p, sem) for p in targets))
    finally:
        await browser.close()
        await pw.stop()
    errors = [{"slug": slug, "error": status} for slug, status in results if status != "ok"]
    repaired = repair_low_variance_previews(targets)
    return {"total": len(results), "ok": len(results) - len(errors), "errors": errors, "repaired": repaired}


def font(size: int, bold: bool = False):
    from PIL import ImageFont

    candidates = [
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def image_variance(path: Path) -> float:
    from PIL import Image, ImageStat

    image = Image.open(path).convert("RGB").resize((120, 75))
    return max(ImageStat.Stat(image).stddev)


def draw_fallback_preview(product: Product) -> None:
    from PIL import Image, ImageDraw

    width, height = 1200, 750
    base = Image.new("RGB", (width, height), "#07080d")
    draw = ImageDraw.Draw(base)
    colors = {
        "ai": ("#7C9BFF", "#16234d"),
        "reg": ("#50D39B", "#123829"),
        "ops": ("#FFB86B", "#3f2812"),
        "public": ("#E879F9", "#351a3d"),
    }
    accent, deep = colors.get(product.family, colors["public"])
    for y in range(height):
        ratio = y / height
        shade = int(12 + ratio * 20)
        draw.line([(0, y), (width, y)], fill=(shade, shade + 2, shade + 9))
    draw.ellipse((-220, -120, 520, 520), fill=deep)
    draw.ellipse((760, 430, 1420, 980), fill="#111827")
    draw.rounded_rectangle((72, 72, width - 72, height - 72), radius=34, outline="#2d3345", width=2, fill="#0c0f19")
    draw.rounded_rectangle((104, 104, 330, 154), radius=25, fill=accent)
    draw.text((132, 116), FAMILY_LABEL.get(product.family, "Product").upper(), fill="#07080d", font=font(20, True))
    draw.text((104, 210), product.name, fill="#f8fafc", font=font(62, True))
    y = 320
    for line in wrap(product.en, width=58)[:4]:
        draw.text((108, y), line, fill="#cbd5e1", font=font(31))
        y += 44
    draw.line((108, 596, width - 108, 596), fill="#263042", width=2)
    draw.text((108, 626), product.url.replace("https://", ""), fill=accent, font=font(27, True))
    draw.text((width - 310, 626), "leandro-sierra.com", fill="#64748b", font=font(24))
    base.save(ROOT / "shots" / f"{product.slug}.jpg", "JPEG", quality=88, optimize=True)


def repair_low_variance_previews(products: list[Product]) -> list[str]:
    repaired: list[str] = []
    for product in products:
        path = ROOT / "shots" / f"{product.slug}.jpg"
        if path.exists() and image_variance(path) < 8:
            draw_fallback_preview(product)
            repaired.append(product.slug)
    return repaired


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-screenshots", action="store_true")
    parser.add_argument("--missing-screenshots", action="store_true")
    parser.add_argument("--limit-screenshots", type=int, default=0)
    parser.add_argument("--concurrency", type=int, default=6)
    args = parser.parse_args()

    products = load_products()
    sync_index(products)
    sync_products_page(products)
    sync_sitemap(products)
    previews = sync_previews(products)

    shots = {"total": 0, "ok": 0, "errors": []}
    if not args.no_screenshots:
        shots = asyncio.run(capture_screenshots(
            products,
            only_missing=args.missing_screenshots,
            limit=args.limit_screenshots,
            concurrency=max(1, args.concurrency),
        ))
    print(json.dumps({
        "products": len(products),
        "excluded": sorted(EXCLUDED),
        "previews": previews,
        "screenshots": shots,
    }, ensure_ascii=False, indent=2))
    return 0 if not shots["errors"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
