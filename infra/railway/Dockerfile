FROM node:24.22.3-bookworm@sha256:9d266751ca3d7fdbe651c878ffd5ad0a42fed49a18c283509267c97f025b7496
COPY --chmod=755 infra/sandboxes/computer/apt-security.sh /tmp/apt-security.sh
RUN /tmp/apt-security.sh \
  && apt-get update && apt-get upgrade -y --no-install-recommends \
  && apt-get install -y --no-install-recommends gosu tini \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
RUN npm install --global --ignore-scripts npm@11.21.2 && npm cache clean --force
WORKDIR /app
COPY --chmod=755 . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @nurlai/db generate
RUN pnpm --filter @nurlai/api --filter @nurlai/worker build
RUN NURLAI_ALLOW_DEV_SECRETS=1 pnpm --filter @nurlai/web build
RUN install -d -m 750 -o node -g node /data /app/apps/web/node_modules/.vite-temp
RUN /tmp/apt-security.sh --check && rm -f /tmp/apt-security.sh
ENV NODE_ENV=production
ENV NURLAI_ALLOWED_HOSTS=healthcheck.railway.app
EXPOSE 5173
ENTRYPOINT ["/usr/bin/tini", "-g", "--"]
CMD ["bash", "infra/railway/start.sh"]
