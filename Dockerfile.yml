FROM node:22-alpine AS builder

RUN apk update

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

# Stage 2: Runner

FROM node:22-alpine AS installer

RUN apk update

RUN apk add --no-cache libc6-compat
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .

RUN npm ci --omit=dev

FROM node:22-alpine AS runner

RUN apk update

RUN apk add --no-cache libc6-compat

RUN apk add --no-cache openssl

WORKDIR /app

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

USER root

COPY --from=installer /app .

RUN chown -R expressjs:expressjs /app

USER expressjs

EXPOSE 3000

CMD ["npm", "run", "docker-start"]
