// Middleware d'authentification et d'autorisation
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Vérifier le token JWT
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token d\'accès requis'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifier que l'utilisateur existe toujours
        const user = await executeQuery('SELECT * FROM users WHERE id = ? AND status = "Actif"', [decoded.userId]);
        
        if (user.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé ou inactif'
            });
        }

        req.user = user[0];
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token invalide'
        });
    }
};

// Vérifier les rôles autorisés
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé pour ce rôle'
            });
        }

        next();
    };
};

// Middleware pour filtrer les données selon le rôle
const filterByRole = (req, res, next) => {
    if (req.user.role === 'Commercial') {
        // Les commerciaux ne voient que leurs propres données
        req.query.commercial = req.user.name;
    }
    next();
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    filterByRole
};