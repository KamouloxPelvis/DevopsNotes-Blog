# Étape 1 : build TypeScript
FROM node:20-alpine AS build

WORKDIR /app

# Installer les dépendances
COPY package*.json tsconfig.json ./
# On ajoute le flag ici aussi par sécurité pour l'analyse des types lors de l'install
RUN NODE_OPTIONS="--max-old-space-size=1536" npm install

# Copier le code source
COPY src ./src

# --- CORRECTION ICI ---
# On force l'allocation de RAM directement dans la commande de build
RUN NODE_OPTIONS="--max-old-space-size=1536" npm run build

# Étape 2 : image d'exécution
FROM node:20-alpine

WORKDIR /app

# On installe uniquement les dépendances de prod
COPY package*.json ./
RUN npm install --only=production

COPY --from=build /app/dist ./dist

ENV PORT=5000
EXPOSE 5000

# Excellente idée de limiter la RAM à l'exécution pour ton Ubuntu !
CMD ["node", "--max-old-space-size=1024", "dist/index.js"]