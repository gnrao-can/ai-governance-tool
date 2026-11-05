# Container image for AI Governance Tool - SVC-01: API Gateway + Bilingual Web UI (C-01/C-02)
# Built with Podman and deployed to Red Hat OpenShift on a Kubernetes cluster.

FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY src ./src

RUN npm install express uuid

EXPOSE 8084

CMD ["node", "src/index.js"]
