# Étape 1 : Build de l'application React
FROM node:20-alpine AS build

WORKDIR /app

# Installation des dépendances (optimisé pour le cache Docker)
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Copie du code source
COPY . .

ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG="devopsnotes-org"
ARG SENTRY_PROJECT="devopsnotes-org"

ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT


# Build de l'application
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