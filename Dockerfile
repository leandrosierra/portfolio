# Portfolio statique servi par nginx:alpine.
# Image minimale (~40 MB), HEALTHCHECK inclus pour que Coolify report
# `running:healthy` directement.

FROM nginx:alpine

# Copie le site + config nginx avec headers de securite stricts.
COPY index.html /usr/share/nginx/html/index.html
COPY ads.txt /usr/share/nginx/html/ads.txt
COPY security_headers.conf /etc/nginx/snippets/security_headers.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# wget present dans nginx:alpine -- pas de layer supplementaire.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -T 4 --spider http://127.0.0.1:80/ || exit 1
