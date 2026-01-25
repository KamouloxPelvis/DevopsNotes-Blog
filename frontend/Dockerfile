# Étape 1 : Build de l'application React
FROM node:20-alpine AS build

WORKDIR /app

# Installation des dépendances (optimisé pour le cache Docker)
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Copie du code source
COPY . .

# --- ÉTAPE CRUCIALE ---
# On copie le fichier .env généré par GitLab dans le dossier de travail
# Cela permet à 'npm run build' d'injecter les variables REACT_APP_
COPY .env ./

# On déclare l'argument envoyé par docker-compose ou GitLab
ARG SENTRY_AUTH_TOKEN
# On le transforme en variable d'env pour que le script npm run build le voie
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

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