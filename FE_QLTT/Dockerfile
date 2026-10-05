FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini
COPY package.json ./

FROM base AS dev
ENV NODE_ENV=development
RUN npm install --no-audit --no-fund
COPY . .
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "dev"]
