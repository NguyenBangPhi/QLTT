# mariadb-client cung cấp mysqldump/mysql cho /api/system/backup và /api/system/restore.
# mariadb-connector-c đi kèm plugin caching_sha2_password — thiếu nó thì không xác thực
# được với MySQL 8.4 (lỗi "Plugin caching_sha2_password could not be loaded").
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini mariadb-client mariadb-connector-c
COPY package.json package-lock.json ./

FROM base AS deps
RUN npm ci --no-audit --no-fund

FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "start:dev"]

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS prod
WORKDIR /app
RUN apk add --no-cache tini mariadb-client mariadb-connector-c
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]
