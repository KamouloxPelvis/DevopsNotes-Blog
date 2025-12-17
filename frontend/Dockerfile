# Étape 1 : build React
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : Nginx pour servir le build
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Optionnel : conf nginx custom si tu utilises React Router
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
