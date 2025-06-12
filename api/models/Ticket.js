// Modèle Ticket pour la gestion SAV
const { executeQuery } = require('../config/database');

class Ticket {
    constructor(data) {
        this.id = data.id;
        this.ticketNumber = data.ticket_number;
        this.prospectId = data.prospect_id;
        this.contractId = data.contract_id;
        this.commercialAttribution = data.commercial_attribution;
        this.receptionDate = data.reception_date;
        this.canal = data.canal;
        this.insuranceCompany = data.insurance_company;
        this.subject = data.subject;
        this.description = data.description;
        this.assignedDate = data.assigned_date;
        this.assignedToSAV = data.assigned_to_sav;
        this.treatmentDetails = data.treatment_details;
        this.closureDate = data.closure_date;
        this.status = data.status;
        this.priority = data.priority;
        this.processingDurationDays = data.processing_duration_days;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    // Créer un nouveau ticket
    static async create(ticketData) {
        const query = `
            INSERT INTO tickets (
                prospect_id, contract_id, commercial_attribution, reception_date,
                canal, insurance_company, subject, description, assigned_to_sav,
                status, priority
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            ticketData.prospectId,
            ticketData.contractId,
            ticketData.commercialAttribution,
            ticketData.receptionDate || new Date().toISOString().split('T')[0],
            ticketData.canal || 'mail',
            ticketData.insuranceCompany,
            ticketData.subject,
            ticketData.description,
            ticketData.assignedToSAV,
            ticketData.status || 'Ouvert',
            ticketData.priority || 'Normale'
        ];

        const result = await executeQuery(query, params);
        return await this.findById(result.insertId);
    }

    // Trouver un ticket par ID
    static async findById(id) {
        const query = 'SELECT * FROM v_tickets_detailed WHERE id = ?';
        const results = await executeQuery(query, [id]);
        return results.length > 0 ? new Ticket(results[0]) : null;
    }

    // Trouver tous les tickets avec filtres
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM v_tickets_detailed WHERE 1=1';
        const params = [];

        if (filters.assignedToSAV) {
            query += ' AND assigned_to_sav = ?';
            params.push(filters.assignedToSAV);
        }

        if (filters.status) {
            if (Array.isArray(filters.status)) {
                query += ` AND status IN (${filters.status.map(() => '?').join(',')})`;
                params.push(...filters.status);
            } else {
                query += ' AND status = ?';
                params.push(filters.status);
            }
        }

        if (filters.priority) {
            query += ' AND priority = ?';
            params.push(filters.priority);
        }

        if (filters.search) {
            query += ' AND (client_name LIKE ? OR ticket_number LIKE ? OR subject LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters.receptionDateFrom) {
            query += ' AND reception_date >= ?';
            params.push(filters.receptionDateFrom);
        }

        if (filters.receptionDateTo) {
            query += ' AND reception_date <= ?';
            params.push(filters.receptionDateTo);
        }

        // Pagination
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const offset = (page - 1) * limit;

        query += ' ORDER BY reception_date DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const results = await executeQuery(query, params);
        return results.map(row => new Ticket(row));
    }

    // Mettre à jour un ticket
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
        const query = `UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`;
        
        await executeQuery(query, params);
        return await this.findById(id);
    }

    // Fermer un ticket
    static async close(id, treatmentDetails = '') {
        const query = `
            UPDATE tickets 
            SET status = 'Fermé', 
                closure_date = CURDATE(),
                treatment_details = CONCAT(COALESCE(treatment_details, ''), ?, '\n--- Ticket fermé le ', CURDATE(), ' ---')
            WHERE id = ?
        `;
        await executeQuery(query, [treatmentDetails, id]);
        return await this.findById(id);
    }

    // Assigner un ticket à un agent SAV
    static async assign(id, savAgent) {
        const query = `
            UPDATE tickets 
            SET assigned_to_sav = ?,
                assigned_date = CURDATE(),
                status = CASE WHEN status = 'Ouvert' THEN 'En cours' ELSE status END
            WHERE id = ?
        `;
        await executeQuery(query, [savAgent, id]);
        return await this.findById(id);
    }

    // Obtenir les statistiques des tickets
    static async getStats(assignedToSAV = null, startDate = null, endDate = null) {
        const query = 'CALL GetTicketStats(?, ?, ?)';
        const results = await executeQuery(query, [assignedToSAV, startDate, endDate]);
        return results[0][0];
    }

    // Obtenir les tickets par priorité
    static async getByPriority(priority = 'Urgente') {
        const query = `
            SELECT * FROM v_tickets_detailed 
            WHERE priority = ? AND status != 'Fermé'
            ORDER BY reception_date ASC
        `;
        const results = await executeQuery(query, [priority]);
        return results.map(row => new Ticket(row));
    }

    // Obtenir les tickets en retard
    static async getOverdueTickets(daysThreshold = 7) {
        const query = `
            SELECT * FROM v_tickets_detailed 
            WHERE status != 'Fermé'
            AND current_duration_days > ?
            ORDER BY current_duration_days DESC
        `;
        const results = await executeQuery(query, [daysThreshold]);
        return results.map(row => new Ticket(row));
    }

    // Ajouter un commentaire au traitement
    static async addTreatmentNote(id, note, author) {
        const timestamp = new Date().toISOString().split('T')[0];
        const formattedNote = `\n--- ${timestamp} (${author}) ---\n${note}`;
        
        const query = `
            UPDATE tickets 
            SET treatment_details = CONCAT(COALESCE(treatment_details, ''), ?)
            WHERE id = ?
        `;
        await executeQuery(query, [formattedNote, id]);
        return await this.findById(id);
    }

    // Obtenir les métriques de performance SAV
    static async getPerformanceMetrics(savAgent = null, year = null) {
        let query = `
            SELECT 
                assigned_to_sav,
                COUNT(*) as total_tickets,
                COUNT(CASE WHEN status = 'Fermé' THEN 1 END) as closed_tickets,
                AVG(CASE WHEN status = 'Fermé' THEN processing_duration_days END) as avg_resolution_time,
                COUNT(CASE WHEN priority = 'Urgente' THEN 1 END) as urgent_tickets,
                ROUND(COUNT(CASE WHEN status = 'Fermé' THEN 1 END) * 100.0 / COUNT(*), 2) as resolution_rate
            FROM tickets
            WHERE assigned_to_sav IS NOT NULL
        `;
        const params = [];

        if (savAgent) {
            query += ' AND assigned_to_sav = ?';
            params.push(savAgent);
        }

        if (year) {
            query += ' AND YEAR(reception_date) = ?';
            params.push(year);
        }

        query += ' GROUP BY assigned_to_sav ORDER BY total_tickets DESC';

        const results = await executeQuery(query, params);
        return results;
    }
}

module.exports = Ticket;