# BabyFoot Manager

BabyFoot Manager est une application pour générer des parties de babyfoot. La fonction principale est de créer des jeux de manière collaborative.

### Prérequis

Vous devez avoir Docker et Docker Compose installés sur votre système ou Node.js installé si vous préférez démarrer l'application directement.

### Installation

1. **Cloner le dépôt Git**

   ```bash
   git clone https://github.com/mohamedyessine/BabyFootManager
   cd BabyFootManager



2. **Exécution avec Docker Compose**

*Assurez-vous que Docker est en cours d'exécution.
*Double-cliquez sur docker_compose.bat pour exécuter Docker Compose.
*L'application sera accessible à l'adresse suivante : 
### http://localhost:4200
*Pour accéder à la base de données PostgreSQL :
   Ouvrez un terminal dans l'image PostgreSQL en exécutant :
   ### docker exec -it babyfootmanager-db-1 psql -U postgres babyfoot


3. **Exécution avec Node.js**
*Assurez-vous que Node.js et npm sont installés sur votre système.

*Installez les dépendances du projet :
### npm install

*Configurez les variables d'environnement PostgreSQL dans le fichier config.js basé sur votre configuration dans api/config.js

Lancez l'application :
### npm start

L'application sera accessible à l'adresse suivante : 
### http://localhost:4200


**Remarques**
Si vous rencontrez des problèmes, assurez-vous que Docker (ou Node.js) et Docker Compose (ou les dépendances npm) sont correctement installés et configurés.
### Assurez-vous que les ports 4200 et 8080 sont disponibles sur votre système.