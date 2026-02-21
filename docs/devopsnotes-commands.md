# 🛠️ Cheat-Sheet Infrastructure Devopsnotes (K3s)

## 🔌 Connexion au serveur

```bash
ssh kamal@113.30.191.17
# ou avec l'alias configuré
ssh kamal@devopsnotes
```

## 📦 État du Cluster K3s

### Voir tous les pods du blog
kubectl get pods -n blog-prod

### Voir les déploiements et services
kubectl get all -n blog-prod

### Voir l'état global des nœuds du cluster
kubectl get nodes

### 🔍 Logs & Debug

### Logs du backend en temps réel
kubectl logs -f -l app=blog-devopsnotes -c blog-backend -n blog-prod

### Logs du frontend en temps réel
kubectl logs -f -l app=blog-devopsnotes -c blog-frontend -n blog-prod

### Inspecter un pod en détail (utile si un pod crash)
kubectl describe pod <nom-du-pod> -n blog-prod

### Entrer dans un conteneur pour fouiller (ex: backend)
kubectl exec -it <nom-du-pod> -c blog-backend -n blog-prod -- /bin/sh

## 🚀 Déploiement & Relance

### Appliquer les changements d'infrastructure manuellement
kubectl apply -f ~/infrastructure/apps/blog-devopsnotes/k8s/

### Forcer le redémarrage des pods (sans coupure grâce au Rolling Update)
kubectl rollout restart deployment blog-devopsnotes-deployment -n blog-prod

### Supprimer les ressources (Attention !)
kubectl delete -f ~/infrastructure/apps/blog-devopsnotes/k8s/

## 🔐 Gestion des Secrets

### Voir la liste des secrets
kubectl get secrets -n blog-prod

### Inspecter le contenu du secret (les clés seront en base64)
kubectl get secret blog-secrets -n blog-prod -o yaml

## 🌐 Réseau & Routage

### Voir les règles de routage Ingress (équivalent des vhosts)
kubectl get ingress -n blog-prod

### Inspecter l'Ingress pour vérifier les domaines et certificats
kubectl describe ingress blog-ingress -n blog-prod

## 🛡️ Système & Pare-feu

### Mise à jour de l'OS
sudo apt update && sudo apt upgrade -y

### Ouvrir HTTP/HTTPS dans le pare-feu
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

### Éteindre proprement la machine
sudo poweroff

## 🔒 Gestion des Certificats TLS (Remplace certbot)
Dans K3s, les certificats sont gérés automatiquement (ex: via cert-manager) et stockés sous forme de "Secrets" Kubernetes de type TLS.

### Voir tous les certificats générés et leur statut (Ready = True/False)
kubectl get certificates -n blog-prod

### Inspecter un certificat pour comprendre pourquoi il ne se valide pas (erreur Let's Encrypt, challenge DNS/HTTP...)
kubectl describe certificate nom-du-certificat -n blog-prod

### Voir l'émetteur du certificat (ClusterIssuer, ex: letsencrypt-prod)
kubectl get clusterissuers

### Voir le secret TLS généré (qui contient la clé privée et le certificat public)
kubectl get secret nom-du-secret-tls -n blog-prod

### Forcer le renouvellement d'un certificat (en cas de blocage)
***Astuce : Supprimer le secret force cert-manager à le recréer immédiatement***
kubectl delete secret nom-du-secret-tls -n blog-prod