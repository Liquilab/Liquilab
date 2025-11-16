# syntax=docker/dockerfile:1

# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
# toolchain voor native deps (bufferutil/utf-8-validate e.d.)
RUN apk add --no-cache python3 make g++
# kopieer package files + prisma schema (voor postinstall)
COPY package*.json ./
COPY prisma ./prisma
# installeer deps; optional deps overslaan
RUN npm ci --omit=optional

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# schone build
RUN rm -rf .next && npm run build

# ---- run ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# volledige app (build artefacts + node_modules + prisma + src/start scripts)
COPY --from=build /app ./
# start via shell-script zodat $PORT wordt geëxpand
COPY start.sh ./start.sh
RUN chmod +x ./start.sh
EXPOSE 3000
CMD ["./start.sh"]
