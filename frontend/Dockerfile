# Étape 1 : build React
FROM node:20-alpine AS builder
WORKDIR /app

# --- OPTIMISATION RAM ---
ENV NODE_OPTIONS="--max-old-space-size=1536"
# -------------------------

COPY package*.json ./
RUN npm ci
COPY . .

# --- TON AJOUT ICI ---
# On récupère l'argument passé par le docker-compose
ARG REACT_APP_API_URL
# On l'injecte pour que React le voit pendant le build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
# ---------------------

RUN npm run build

# Étape 2 : Nginx pour servir le build
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]