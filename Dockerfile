# ShelfSync ERP web: Nuxt 4 con SSR (Nitro node-server).
# La URL del API se configura en runtime con NUXT_PUBLIC_API_BASE / NUXT_API_BASE_SERVER (no hace falta rebuild).

# -----------Etapa 1: build ------------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# --ignore-scripts: el postinstall (nuxt prepare) necesita el código, que aún no se copia
RUN npm ci --ignore-scripts

COPY . .
RUN npx nuxt build

# ----------Etapa 2: produccion -----------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

# .output es autocontenido (incluye sus node_modules)
COPY --from=build --chown=node:node /app/.output ./.output
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/login || exit 1
CMD ["node", ".output/server/index.mjs"]
