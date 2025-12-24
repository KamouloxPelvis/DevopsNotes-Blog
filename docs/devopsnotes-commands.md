# Connexion au serveur
ssh kamal@devopsnotes

# Mise à jour
sudo apt update
sudo apt upgrade

# État des conteneurs
docker ps

# Arrêt des services
docker compose down

# Rebuild + relance en arrière-plan
docker compose up --build -d

# Logs d’un service
docker compose logs -f frontend
docker compose logs -f backend


# Éditer le vhost
sudo nano /etc/nginx/sites-available/devopsnotes.org

# Activer le vhost (si pas déjà fait)
sudo ln -s /etc/nginx/sites-available/devopsnotes.org /etc/nginx/sites-enabled/devopsnotes.org

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

# Redémarrer Nginx (si besoin)
sudo systemctl restart nginx


# Installation (une fois)
sudo apt install snapd
sudo snap install core && sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Certificat pour devopsnotes.org
sudo certbot --nginx -d devopsnotes.org

# Certificat pour devopsnotes.org + www.devopsnotes.org
sudo certbot --nginx -d devopsnotes.org -d www.devopsnotes.org

# Test de renouvellement automatique
sudo certbot renew --dry-run


# Éditer un fichier
nano fichier
sudo nano /etc/nginx/sites-available/devopsnotes.org

# Supprimer un fichier
rm monfichier
rm -f monfichier   # sans confirmation


# Ouvrir HTTP/HTTPS dans UFW
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status

# Éteindre proprement la machine
sudo shutdown -h now
# ou
sudo poweroff
