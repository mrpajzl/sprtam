FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# The app and the server (one bundled file). No content in the image: the server keeps a copy of the
# current release from the content service in /data (CONTENT_API, docs/OBSAH.md).
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
ENV PORT=8080 DATA_DIR=/data NODE_ENV=production
# Runs as root like the images before: the existing /data volume belongs to root.
VOLUME /data
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "dist-server/index.mjs"]
