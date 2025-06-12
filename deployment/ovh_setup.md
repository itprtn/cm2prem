# Guide de déploiement sur OVH

## Prérequis
- Hébergement web OVH avec support MySQL/PHP
- Accès SSH (selon l'offre)
- Base de données MySQL

## Étapes de déploiement

### 1. Configuration de la base de données

1. **Créer la base de données sur OVH**
   - Connectez-vous à votre espace client OVH
   - Allez dans "Hébergements" > "Bases de données"
   - Créez une nouvelle base MySQL
   - Notez les informations de connexion

2. **Importer le schéma**
   ```bash
   # Via phpMyAdmin ou ligne de commande
   mysql -h [HOST] -u [USER] -p [DATABASE] < database/schema.sql
   mysql -h [HOST] -u [USER] -p [DATABASE] < database/triggers.sql
   mysql -h [HOST] -u [USER] -p [DATABASE] < database/stored_procedures.sql
   mysql -h [HOST] -u [USER] -p [DATABASE] < database/views.sql
   mysql -h [HOST] -u [USER] -p [DATABASE] < database/indexes.sql
   mysql -h [HOST] -u [USER] -p [DATABASE] < database/sample_data.sql
   ```

### 2. Configuration de l'environnement

Créez un fichier `.env` avec vos paramètres OVH :

```env
# Base de données OVH
DB_HOST=your-database-host.mysql.db
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=3306

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email configuration (si nécessaire)
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-email-password

# Application
NODE_ENV=production
PORT=3000
```

### 3. Déploiement de l'API Node.js

Si votre hébergement OVH supporte Node.js :

```bash
# Installer les dépendances
npm install --production

# Démarrer l'application
npm start
```

### 4. Alternative PHP pour OVH mutualisé

Si vous êtes sur un hébergement mutualisé sans Node.js, voici une version PHP équivalente :

```php
<?php
// config/database.php
class Database {
    private $host = 'your-host.mysql.db';
    private $db_name = 'your-database';
    private $username = 'your-username';
    private $password = 'your-password';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8")
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Erreur de connexion: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
```

### 5. Structure des fichiers sur OVH

```
/www/
├── api/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   └── index.php
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
└── .htaccess
```

### 6. Configuration Apache (.htaccess)

```apache
RewriteEngine On

# Redirection API
RewriteRule ^api/(.*)$ api/index.php [QSA,L]

# Redirection SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Headers de sécurité
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

### 7. Optimisations pour la production

1. **Index de base de données**
   - Tous les index sont définis dans `database/indexes.sql`

2. **Cache**
   - Utilisez le cache OVH si disponible
   - Implémentez un cache Redis si possible

3. **Monitoring**
   - Configurez les logs d'erreur
   - Surveillez les performances de la base

### 8. Sécurité

1. **Mots de passe forts**
2. **Certificat SSL** (Let's Encrypt via OVH)
3. **Sauvegarde automatique** de la base de données
4. **Limitation des tentatives de connexion**

### 9. Tests après déploiement

```bash
# Test de connexion à la base
curl https://yourdomain.com/api/health

# Test d'authentification
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@premunia.fr","password":"your-password"}'

# Test des prospects
curl https://yourdomain.com/api/prospects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. Maintenance

- **Sauvegarde quotidienne** de la base de données
- **Mise à jour régulière** des dépendances
- **Monitoring des logs** d'erreur
- **Optimisation des requêtes** lentes

## Support OVH

En cas de problème :
1. Vérifiez les logs d'erreur dans votre espace client
2. Contactez le support OVH si nécessaire
3. Consultez la documentation OVH pour votre type d'hébergement