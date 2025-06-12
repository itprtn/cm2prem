// Point d'entrée principal de l'API
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import des routes
const prospectRoutes = require('./routes/prospects');
const contractRoutes = require('./routes/contracts');
const ticketRoutes = require('./routes/tickets');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Limitation du taux de requêtes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par windowMs
    message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
});
app.use('/api/', limiter);

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prospects', prospectRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route de santé
app.get('/api/health', async (req, res) => {
    const dbStatus = await testConnection();
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: dbStatus ? 'Connected' : 'Disconnected',
        version: '1.0.0'
    });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
    console.error('Erreur:', error);
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Démarrage du serveur
app.listen(PORT, async () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
    
    // Test de la connexion à la base de données
    await testConnection();
});

module.exports = app;