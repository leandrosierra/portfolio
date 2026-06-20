"""Regenere les blocs SEO statiques du portfolio depuis la source unique `products`
de index.html : index crawlable (127 liens, lisible sans JS), JSON-LD Person+ItemList,
et sitemap.xml. Idempotent — rejouer apres toute modif de la liste produits.

    python scripts/seo_inject.py
"""

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
SITEMAP = ROOT / "sitemap.xml"
APEX = "https://leandro-sierra.com"

src = INDEX.read_text(encoding="utf-8")

block = re.search(r"const products = \[(.*?)\n\];", src, re.S)
if not block:
    raise SystemExit("liste products introuvable")
rows = re.findall(
    r'\{ id:"([\w-]+)", name:"([^"]+)", family:"(\w+)", url:"([^"]+)", en:"((?:[^"\\]|\\.)*)", fr:"((?:[^"\\]|\\.)*)" \}',
    block.group(1),
)
if len(rows) < 100:
    raise SystemExit(f"parse incomplet : {len(rows)} produits")

FAM = {"ai": "AI", "reg": "Regulation", "ops": "Operations", "public": "Public app"}


def unescape_js(s: str) -> str:
    return s.replace('\\"', '"').replace("\\'", "'")


# --- index crawlable (rendu sans JS, masque visuellement via .seo-index) ---
links = "\n".join(
    f'<li><a href="{html.escape(u)}">{html.escape(n)} — {FAM[f]}: '
    f'{html.escape(unescape_js(en))}</a></li>'
    for (i, n, f, u, en, fr) in rows
)
seo_index = (
    '<!-- SEO-INDEX:START -->\n'
    '<nav class="seo-index" aria-hidden="true">\n'
    "<h1>Leandro Sierra — live web products</h1>\n"
    f"<p>{len(rows)} live web products: EU regulatory-readiness tools, AI tooling and consumer apps.</p>\n"
    f"<ul>\n{links}\n</ul>\n</nav>\n<!-- SEO-INDEX:END -->"
)

# --- JSON-LD Person + ItemList ---
jsonld = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Person",
            "name": "Leandro Sierra",
            "url": APEX,
            "jobTitle": "Web product developer",
            "sameAs": [
                "https://github.com/leandrosierra",
                "https://www.linkedin.com/in/leandro-sierra-ai/",
            ],
        },
        {
            "@type": "ItemList",
            "name": "Live web products by Leandro Sierra",
            "numberOfItems": len(rows),
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": idx + 1,
                    "url": u,
                    "name": n,
                    "description": unescape_js(en),
                    "image": f"{APEX}/shots/{i}.jpg",
                }
                for idx, (i, n, f, u, en, fr) in enumerate(rows)
            ],
        },
    ],
}
seo_jsonld = (
    '<!-- SEO-JSONLD:START -->\n'
    '<script type="application/ld+json">'
    + json.dumps(jsonld, ensure_ascii=False, separators=(",", ":"))
    + "</script>\n<!-- SEO-JSONLD:END -->"
)

src = re.sub(r"<!-- SEO-INDEX:START -->.*?<!-- SEO-INDEX:END -->", lambda _: seo_index, src, flags=re.S)
src = re.sub(r"<!-- SEO-JSONLD:START -->.*?<!-- SEO-JSONLD:END -->", lambda _: seo_jsonld, src, flags=re.S)
INDEX.write_text(src, encoding="utf-8")

# --- sitemap.xml : apex + pages de contenu + tous les produits ---
# Les produits sont des sous-domaines du meme domaine racine (*.leandro-sierra.com),
# possedes et exploites par le meme operateur : cross-submission legitime.
content_pages = [
    APEX + "/",
    APEX + "/products.html",
    APEX + "/about.html",
    APEX + "/contact.html",
    APEX + "/privacy.html",
    APEX + "/terms.html",
]
urls = content_pages + [u for (i, n, f, u, en, fr) in rows]
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u in urls:
    sm.append(f"  <url><loc>{html.escape(u)}</loc></url>")
sm.append("</urlset>\n")
SITEMAP.write_text("\n".join(sm), encoding="utf-8")

print(f"OK: {len(rows)} produits — index crawlable + JSON-LD + sitemap.xml ({len(urls)} urls)")
