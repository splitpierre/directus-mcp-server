FROM node:22-alpine

WORKDIR /app

COPY package.json ./
# No dependencies to install yet, but good practice
# RUN npm install --production

COPY index.js ./

# Environment variables should be passed at runtime
ENV DIRECTUS_URL="http://localhost:8055"
ENV DIRECTUS_TOKEN=""

CMD ["node", "index.js"]
