# Backup puller of the Šprtám content service (docs/OBSAH.md, Zálohy). Runs on another server than the
# service (Coolify: base directory /ops/backup, server hetzner-1). Keeps its state, the encrypted snapshots
# and the git mirror in the /data volume.
FROM python:3.13-alpine
RUN apk add --no-cache age git openssh-client
WORKDIR /app
# GitHub's SSH host keys (https://api.github.com/meta), so the mirror push trusts only GitHub.
COPY known_hosts backup.py ./
RUN adduser -D -u 10001 backup && mkdir -p /data && chown backup:backup /data
USER backup
VOLUME /data
HEALTHCHECK --interval=10m --start-period=10m CMD python /app/backup.py health
CMD ["python", "-u", "/app/backup.py"]
