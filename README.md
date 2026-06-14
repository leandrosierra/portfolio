# Portfolio — leandro-sierra.com

Site personnel statique (portfolio + pages de contenu), servi par
nginx:alpine. ~40 MB d'image, HEALTHCHECK inclus, CSP compatible i18n + AdSense.

## Stack

- HTML/CSS/JS vanilla, sans build step
- I18n client : FR, EN, ES, PT
- Navigation flottante gauche + grille produits filtree
- nginx:alpine avec headers de securite stricts (CSP, HSTS, etc.)
- Docker HEALTHCHECK wget pour l'orchestrateur

## Déploiement

Déployé par l'orchestrateur Hetzner (Traefik ada-proxy) : pull du repo
github.com/leandrosierra/portfolio + `docker build` de l'image nginx, route
TLS Traefik. Domaine cible : `https://leandro-sierra.com`.

## Local dev

```sh
docker build -t portfolio .
docker run --rm -p 8080:80 portfolio
# -> http://localhost:8080
```

## Edit

Modifier les fichiers HTML/CSS directement. Pas de build step.
Après push, déclencher un redeploy via l'orchestrateur Hetzner (build_image).
