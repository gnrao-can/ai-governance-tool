# Container image for AI Governance Tool — SVC-07: Measures Evaluator (C-10)
# Built with Podman and deployed to Red Hat OpenShift on a Kubernetes cluster.

FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY src ./src

RUN npm install express uuid

EXPOSE 8084

CMD ["node", "src/index.js"]
