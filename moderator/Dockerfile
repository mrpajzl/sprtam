# Moderation of Šprtám (docs/MODERACE.md). Build context: the repository root
# (Coolify: Dockerfile location /moderator/Dockerfile, base directory /).
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run moderator:build

FROM node:24-alpine
WORKDIR /app
# The server is one bundle (no node_modules); it reads the content it was built with.
COPY --from=build /app/moderator/dist ./moderator/dist
COPY --from=build /app/moderator/dist-server ./moderator/dist-server
COPY --from=build /app/content ./content
ENV PORT=8090 DATA_DIR=/data NODE_ENV=production TRUST_PROXY=1
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 8090
HEALTHCHECK CMD wget -qO- http://127.0.0.1:8090/healthz || exit 1
CMD ["node", "--no-warnings=ExperimentalWarning", "moderator/dist-server/index.mjs"]
