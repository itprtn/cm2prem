// Modèle Prospect avec toutes les opérations CRUD
const { executeQuery, executeTransaction } = require('../config/database');

class Prospect {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.dateOfBirth = data.date_of_birth;
        this.postalCode = data.postal_code;
        this.ville = data.ville;
        this.status = data.status;
        this.commercial = data.commercial;
        this.source = data.source;
        this.canal = data.canal;
        this.dateDemande = data.date_demande;
        this.relanceAttempts = data.relance_attempts;
        this.lastRelanceDate = data.last_relance_date;
        this.lastInteraction = data.last_interaction;
        this.notes = data.notes;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    // Créer un nouveau prospect
    static async create(prospectData) {
        const query = `
            INSERT INTO prospects (
                name, email, phone, date_of_birth, postal_code, ville, 
                status, commercial, source, canal, date_demande, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            prospectData.name,
            prospectData.email,
            prospectData.phone,
            prospectData.dateOfBirth,
            prospectData.postalCode,
            prospectData.ville,
            prospectData.status || 'Nouveau',
            prospectData.commercial,
            prospectData.source,
            prospectData.canal || 'email',
            prospectData.dateDemande,
            prospectData.notes
        ];

        const result = await executeQuery(query, params);
        return await this.findById(result.insertId);
    }

    // Trouver un prospect par ID
    static async findById(id) {
        const query = 'SELECT * FROM v_prospects_enriched WHERE id = ?';
        const results = await executeQuery(query, [id]);
        return results.length > 0 ? new Prospect(results[0]) : null;
    }

    // Trouver tous les prospects avec filtres et pagination
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM v_prospects_enriched WHERE 1=1';
        const params = [];

        if (filters.commercial) {
            query += ' AND commercial = ?';
            params.push(filters.commercial);
        }

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.search) {
            query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters.ville) {
            query += ' AND ville = ?';
            params.push(filters.ville);
        }

        // Pagination
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const offset = (page - 1) * limit;

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const results = await executeQuery(query, params);
        return results.map(row => new Prospect(row));
    }

    // Compter les prospects avec filtres
    static async count(filters = {}) {
        let query = 'SELECT COUNT(*) as total FROM prospects WHERE 1=1';
        const params = [];

        if (filters.commercial) {
            query += ' AND commercial = ?';
            params.push(filters.commercial);
        }

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.search) {
            query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const results = await executeQuery(query, params);
        return results[0].total;
    }

    // Mettre à jour un prospect
    static async update(id, updateData) {
        const fields = [];
        const params = [];

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                params.push(updateData[key]);
            }
        });

        if (fields.length === 0) {
            throw new Error('Aucune donnée à mettre à jour');
        }

        params.push(id);
        const query = `UPDATE prospects SET ${fields.join(', ')} WHERE id = ?`;
        
        await executeQuery(query, params);
        return await this.findById(id);
    }

    // Supprimer un prospect
    static async delete(id) {
        const query = 'DELETE FROM prospects WHERE id = ?';
        const result = await executeQuery(query, [id]);
        return result.affectedRows > 0;
    }

    // Obtenir les prospects à relancer
    static async getProspectsToFollow(commercial = null, daysThreshold = 7) {
        const query = 'CALL GetProspectsToFollow(?, ?)';
        const results = await executeQuery(query, [commercial, daysThreshold]);
        return results[0].map(row => new Prospect(row));
    }

    // Obtenir les statistiques du pipeline
    static async getPipelineStats(commercial = null) {
        const query = 'CALL GetProspectsPipeline(?)';
        const results = await executeQuery(query, [commercial]);
        return results[0];
    }

    // Mettre à jour les tentatives de relance
    static async updateRelanceAttempts(id) {
        const query = `
            UPDATE prospects 
            SET relance_attempts = relance_attempts + 1,
                last_relance_date = CURDATE(),
                last_interaction = NOW()
            WHERE id = ?
        `;
        await executeQuery(query, [id]);
        return await this.findById(id);
    }

    // Recherche avancée avec filtres multiples
    static async advancedSearch(searchCriteria) {
        let query = 'SELECT * FROM v_prospects_enriched WHERE 1=1';
        const params = [];

        if (searchCriteria.ageMin) {
            query += ' AND age >= ?';
            params.push(searchCriteria.ageMin);
        }

        if (searchCriteria.ageMax) {
            query += ' AND age <= ?';
            params.push(searchCriteria.ageMax);
        }

        if (searchCriteria.postalCodes && searchCriteria.postalCodes.length > 0) {
            query += ` AND postal_code IN (${searchCriteria.postalCodes.map(() => '?').join(',')})`;
            params.push(...searchCriteria.postalCodes);
        }

        if (searchCriteria.sources && searchCriteria.sources.length > 0) {
            query += ` AND source IN (${searchCriteria.sources.map(() => '?').join(',')})`;
            params.push(...searchCriteria.sources);
        }

        if (searchCriteria.daysSinceCreation) {
            query += ' AND days_since_creation >= ?';
            params.push(searchCriteria.daysSinceCreation);
        }

        query += ' ORDER BY created_at DESC';

        const results = await executeQuery(query, params);
        return results.map(row => new Prospect(row));
    }
}

module.exports = Prospect;