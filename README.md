# Portfolio — leandro-sierra.com

Site personnel one-page, statique, servi par nginx:alpine dans un container
Coolify. ~40 MB d'image, HEALTHCHECK inclus, CSP compatible i18n + AdSense.

## Stack

- HTML/CSS/JS vanilla, sans build step
- I18n client : FR, EN, ES, PT
- Navigation flottante gauche + grille produits filtree
- nginx:alpine avec headers de securite stricts (CSP, HSTS, etc.)
- Docker HEALTHCHECK wget pour Coolify

## Déploiement

Auto-deploy via Coolify connecte au repo github.com/leandrosierra/portfolio.
Domaine cible : `https://leandro-sierra.com`.

## Local dev

```sh
docker build -t portfolio .
docker run --rm -p 8080:80 portfolio
# -> http://localhost:8080
```

## Edit

Modifier `index.html` directement. Pas de build step.
Le push declenche un redeploy Coolify (~1 min).
