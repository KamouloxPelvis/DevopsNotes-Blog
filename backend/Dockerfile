# Étape 1 : build TypeScript
FROM node:20-alpine AS build

WORKDIR /app

# Installer les dépendances
COPY package*.json tsconfig.json ./
# On peut garder npm install ici, il consomme moins que la compilation
RUN npm install

# Copier le code source
COPY src ./src

RUN npx --node-options="--max-old-space-size=2048" tsc

# Étape 2 : image d'exécution
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# On récupère le dossier dist généré par tsc
COPY --from=build /app/dist ./dist

ENV PORT=5000
EXPOSE 5000

CMD ["node", "--max-old-space-size=1024", "dist/index.js"]