FROM 127.0.0.1:5000/ada-node-base:latest AS build
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

FROM 127.0.0.1:5000/ada-node-base:latest AS deps
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM 127.0.0.1:5000/ada-node-base:latest
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/dist ./server/dist
COPY package*.json ./
EXPOSE 3000
HEALTHCHECK --interval=120s --timeout=3s --start-period=10s --retries=3 CMD wget -q --spider http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server/dist/index.js"]
