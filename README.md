# DevOpsNotes

DevOpsNotes est un mini‑blog technique orienté DevOps / SecOps.  
L’objectif du projet est de démontrer des compétences concrètes en :

- conception d’API Node.js / TypeScript,
- intégration d’une base MongoDB Atlas,
- conteneurisation avec Docker (multi‑stage),
- orchestration avec Docker Compose,
- gestion des fichiers statiques (uploads d’images) et configuration d’un frontend React.

---

## 1. Architecture applicative

- **Frontend** : React (Create React App), servi par Nginx dans un container dédié.
- **Backend** : API REST Node.js / Express + TypeScript.
- **Base de données** : MongoDB Atlas (cluster hébergé dans le cloud).
- **Stockage fichiers** : dossier `uploads/` exposé par l’API (images des articles, avatars, etc.).
- **Orchestration** : Docker Compose pour lancer l’ensemble de la stack.

Schéma logique :

- Le frontend communique avec le backend via `HTTP` sur `http://localhost:5000`.
- Le backend communique avec MongoDB Atlas via une URI `mongodb+srv://...`.
- Les images sont servies par l’API sur `/uploads/...` et consommées par le frontend.

---

## 2. Fonctionnalités principales

### Backend (API)

- Authentification avec utilisateur administrateur initial (email + mot de passe).
- Authentification avec utilisateur membre du forum (création / édition / suppression de son fil de discussion, fonctionnalité de réponse aux threads)
- Gestion des articles de blog :
  - création, modification, suppression (côté admin),
  - listing, filtrage par tag, consultation détaillée.
- Upload d’images associées aux articles :
  - stockage dans un dossier `uploads/`,
  - exposition publique via `GET /uploads/<filename>`.
- Route de healthcheck pour supervision : `GET /api/health` → `{"status":"ok"}`.

### Frontend

- Listing des articles avec :
  - titre, extrait, tags, nombre de commentaires,
  - images chargées depuis le backend.
- Filtrage par tags (ci‑cd, docker, devops, cybersecurity, etc.).
- Pages de détail d’un article.
- Formulaire pour créer un nouvel article (côté admin, connecté à l’API).

---

## 3. Conteneurisation et infrastructure

### Backend – Dockerfile (multi‑stage)

- **Stage 1 : build**
  - Image de base : `node:20-alpine`.
  - Installation des dépendances, compilation TypeScript → JavaScript (`dist/`).

- **Stage 2 : runtime**
  - Image de base : `node:20-alpine`.
  - Copie du `package.json` minimal + dépendances de production.
  - Copie des fichiers compilés `dist/`.
  - Exposition du port `5000`.
  - Démarrage de l’API avec `node dist/index.js`.

Le backend charge sa configuration via des variables d’environnement (URI MongoDB, secrets JWT, compte admin…).

### Frontend – Dockerfile

- **Stage 1 : build**
  - Image de base : `node:20-alpine`.
  - Build du frontend React (`npm ci` puis `npm run build`).

- **Stage 2 : Nginx**
  - Image de base : `nginx:alpine`.
  - Copie du build React dans `/usr/share/nginx/html`.
  - Nginx sert l’application sur le port `80`.

### Docker Compose

Un fichier `docker-compose.yml` orchestre les services :

- **Service `backend`**
  - Build depuis `./backend`.
  - Port mappé : `5000:5000`.
  - Variables d’environnement :
    - `MONGODB_URI`
    - `JWT_SECRET`
    - `ADMIN_EMAIL`
    - `ADMIN_PASSWORD`
  - Volume :
    - `./backend/uploads:/app/uploads` (les images uploadées sont persistées sur le host).

- **Service `frontend`**
  - Build depuis `./frontend`.
  - Port mappé : `3000:80`.
  - Utilise `REACT_APP_API_URL` pour pointer vers le backend (`http://localhost:5000`).

---

## 4. Configuration

### Backend – fichier `.env` (dans `backend/`)

MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxxx.mongodb.net/devopsnotes
PORT=5000
ADMIN_EMAIL=ton_email_admin
ADMIN_PASSWORD=ton_mdp_admin
JWT_SECRET=un_secret_solide
JWT_EXPIRES=1h


### Frontend – fichier `.env` (dans `frontend/`)


---

## 5. Lancement “one shot”

Depuis la racine du projet (`DevOpsNotes/`) :

docker compose up -d --build


Cette commande :

- reconstruit les images backend et frontend si nécessaire,
- démarre les containers en arrière‑plan,
- crée le réseau Docker et monte le volume `uploads`.

Endpoints principaux :

- Backend (healthcheck) : http://localhost:5000/api/health  
- Backend (articles) : http://localhost:5000/api/articles  
- Frontend : http://localhost:3000  

---

## 6. Arrêt et supervision

Arrêter proprement les containers :

docker compose down

Consulter l’état des services :

docker compose ps


Consulter les logs :

docker compose logs backend
docker compose logs frontend


---

## 7. Objectif du projet

Ce projet a été réalisé pour démontrer :

- la capacité à **concevoir une API Node.js/TypeScript** connectée à MongoDB Atlas,
- la **mise en place d’un frontend React** qui consomme cette API,
- la **maîtrise de Docker** (images multi‑stage, gestion des fichiers statiques, volumes),
- l’**orchestration via Docker Compose** pour rapprocher backend, frontend et base de données dans un environnement reproductible.

Il peut servir de base à des évolutions futures (CI/CD, déploiement sur un VPS ou dans le cloud, ajout d’un reverse proxy Nginx unique, monitoring, etc.).
