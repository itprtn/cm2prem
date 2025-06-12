// Routes pour les prospects
const express = require('express');
const router = express.Router();
const ProspectController = require('../controllers/ProspectController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes CRUD de base
router.get('/', ProspectController.getAll);
router.get('/:id', ProspectController.getById);
router.post('/', authorizeRoles(['Admin', 'Commercial']), ProspectController.create);
router.put('/:id', authorizeRoles(['Admin', 'Commercial']), ProspectController.update);
router.delete('/:id', authorizeRoles(['Admin']), ProspectController.delete);

// Routes spécialisées
router.get('/follow/list', ProspectController.getToFollow);
router.get('/stats/pipeline', ProspectController.getPipelineStats);
router.post('/search/advanced', ProspectController.advancedSearch);
router.patch('/:id/relance', authorizeRoles(['Admin', 'Commercial']), ProspectController.updateRelance);

module.exports = router;