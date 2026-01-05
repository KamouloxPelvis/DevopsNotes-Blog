# Étape 1 : build TypeScript
FROM node:20-alpine AS build

WORKDIR /app

# --- OPTIMISATION RAM POUR LE THINKPAD ---
# Empêche Node de dépasser la RAM disponible pendant la compilation
ENV NODE_OPTIONS="--max-old-space-size=1536"

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

# On installe uniquement les dépendances de prod pour alléger l'image
COPY package*.json ./
RUN npm install --only=production

COPY --from=build /app/dist ./dist

# --- VARIABLES R2 ---
# Ces variables seront remplies par GitLab CI via ton docker-compose
ENV R2_ACCOUNT_ID=$R2_ACCOUNT_ID
ENV R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
ENV R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
ENV R2_BUCKET_NAME=$R2_BUCKET_NAME

ENV PORT=5000
EXPOSE 5000

# Limite la RAM aussi à l'exécution pour laisser respirer ton Ubuntu
CMD ["node", "--max-old-space-size=1024", "dist/index.js"]