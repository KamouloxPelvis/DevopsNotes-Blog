# Étape 1 : Build de l'application React
FROM node:18-alpine AS build

WORKDIR /app

# Installation des dépendances (optimisé pour le cache Docker)
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# --- ÉTAPE CRUCIALE ---
# On copie le fichier .env généré par GitLab dans le dossier de travail
# Cela permet à 'npm run build' d'injecter les variables REACT_APP_
COPY .env ./

# Build de l'application
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Étape 2 : Serveur de production (Nginx)
FROM nginx:stable-alpine

# On copie les fichiers compilés vers le dossier Nginx
COPY --from=build /app/build /usr/share/nginx/html

# On expose le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]