# Étape 1 : build TypeScript
FROM node:20-alpine AS build

WORKDIR /app

# Installer les dépendances
COPY package*.json tsconfig.json ./
RUN npm install

# Copier le code source
COPY src ./src

# Build TypeScript -> dist/
RUN npm run build

# Étape 2 : image d'exécution
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=build /app/dist ./dist

ENV PORT=5000
EXPOSE 5000

CMD ["node", "dist/index.js"]
