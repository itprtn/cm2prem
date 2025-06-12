// Contrôleur pour les prospects
const Prospect = require('../models/Prospect');

class ProspectController {
    // Obtenir tous les prospects avec filtres et pagination
    static async getAll(req, res) {
        try {
            const filters = {
                commercial: req.query.commercial,
                status: req.query.status,
                search: req.query.search,
                ville: req.query.ville,
                page: req.query.page || 1,
                limit: req.query.limit || 20
            };

            const prospects = await Prospect.findAll(filters);
            const total = await Prospect.count(filters);

            res.json({
                success: true,
                data: prospects,
                pagination: {
                    page: parseInt(filters.page),
                    limit: parseInt(filters.limit),
                    total,
                    pages: Math.ceil(total / filters.limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des prospects',
                error: error.message
            });
        }
    }

    // Obtenir un prospect par ID
    static async getById(req, res) {
        try {
            const prospect = await Prospect.findById(req.params.id);
            if (!prospect) {
                return res.status(404).json({
                    success: false,
                    message: 'Prospect non trouvé'
                });
            }

            res.json({
                success: true,
                data: prospect
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du prospect',
                error: error.message
            });
        }
    }

    // Créer un nouveau prospect
    static async create(req, res) {
        try {
            const prospect = await Prospect.create(req.body);
            res.status(201).json({
                success: true,
                data: prospect,
                message: 'Prospect créé avec succès'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de la création du prospect',
                error: error.message
            });
        }
    }

    // Mettre à jour un prospect
    static async update(req, res) {
        try {
            const prospect = await Prospect.update(req.params.id, req.body);
            if (!prospect) {
                return res.status(404).json({
                    success: false,
                    message: 'Prospect non trouvé'
                });
            }

            res.json({
                success: true,
                data: prospect,
                message: 'Prospect mis à jour avec succès'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de la mise à jour du prospect',
                error: error.message
            });
        }
    }

    // Supprimer un prospect
    static async delete(req, res) {
        try {
            const deleted = await Prospect.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Prospect non trouvé'
                });
            }

            res.json({
                success: true,
                message: 'Prospect supprimé avec succès'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du prospect',
                error: error.message
            });
        }
    }

    // Obtenir les prospects à relancer
    static async getToFollow(req, res) {
        try {
            const commercial = req.query.commercial;
            const daysThreshold = parseInt(req.query.days) || 7;
            
            const prospects = await Prospect.getProspectsToFollow(commercial, daysThreshold);
            
            res.json({
                success: true,
                data: prospects
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des prospects à relancer',
                error: error.message
            });
        }
    }

    // Obtenir les statistiques du pipeline
    static async getPipelineStats(req, res) {
        try {
            const commercial = req.query.commercial;
            const stats = await Prospect.getPipelineStats(commercial);
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques',
                error: error.message
            });
        }
    }

    // Mettre à jour les tentatives de relance
    static async updateRelance(req, res) {
        try {
            const prospect = await Prospect.updateRelanceAttempts(req.params.id);
            
            res.json({
                success: true,
                data: prospect,
                message: 'Tentative de relance enregistrée'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la relance',
                error: error.message
            });
        }
    }

    // Recherche avancée
    static async advancedSearch(req, res) {
        try {
            const searchCriteria = req.body;
            const prospects = await Prospect.advancedSearch(searchCriteria);
            
            res.json({
                success: true,
                data: prospects
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche avancée',
                error: error.message
            });
        }
    }
}

module.exports = ProspectController;