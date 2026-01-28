# Étape 1 : Build de l'application React
FROM node:20-alpine AS build

WORKDIR /app

# Installation des dépendances (optimisé pour le cache Docker)
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Copie du code source
COPY . .

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
    NODE_OPTIONS="--max-old-space-size=1536" npm run build
RUN NODE_OPTIONS="--max-old-space-size=1536" npm run build

# Étape 2 : Serveur de production (Nginx)
FROM nginx:stable-alpine

# On copie les fichiers compilés vers le dossier Nginx
COPY --from=build /app/build /usr/share/nginx/html

# On copie la configuration Nginx personnalisée
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# On expose le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]