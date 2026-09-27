# WDIII Tech Vault — Express server for Cloud Run
FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

# Cloud Run sets PORT (default 8080); server.js reads it
EXPOSE 8080
USER node
CMD ["node", "server.js"]
