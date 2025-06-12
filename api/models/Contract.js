// Modèle Contract avec calculs de commissions automatiques
const { executeQuery, executeTransaction } = require('../config/database');

class Contract {
    constructor(data) {
        this.id = data.id;
        this.contractNumber = data.contract_number;
        this.prospectId = data.prospect_id;
        this.clientName = data.client_name;
        this.clientCity = data.client_city;
        this.product = data.product;
        this.insurerId = data.insurer_id;
        this.insurerName = data.insurer_name;
        this.monthlyPremium = parseFloat(data.monthly_premium);
        this.annualPremium = parseFloat(data.annual_premium);
        this.commissionType = data.commission_type;
        this.firstYearCommissionRate = parseFloat(data.first_year_commission_rate);
        this.recurrentCommissionRate = parseFloat(data.recurrent_commission_rate);
        this.monthlyCommission = parseFloat(data.monthly_commission);
        this.annualCommission = parseFloat(data.annual_commission);
        this.firstYearAnnualNetCommission = parseFloat(data.first_year_annual_net_commission);
        this.recurrentAnnualGrossCommission = parseFloat(data.recurrent_annual_gross_commission);
        this.recurrentAnnualNetCommission = parseFloat(data.recurrent_annual_net_commission);
        this.status = data.status;
        this.commercial = data.commercial;
        this.signatureDate = data.signature_date;
        this.effectiveDate = data.effective_date;
        this.subscribedDate = data.subscribed_date;
        this.endDate = data.end_date;
        this.renewalDate = data.renewal_date;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    // Créer un nouveau contrat
    static async create(contractData) {
        const query = `
            INSERT INTO contracts (
                contract_number, prospect_id, client_name, client_city, product,
                insurer_id, insurer_name, monthly_premium, status, commercial,
                signature_date, effective_date, subscribed_date, end_date, renewal_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            contractData.contractNumber,
            contractData.prospectId,
            contractData.clientName,
            contractData.clientCity,
            contractData.product,
            contractData.insurerId,
            contractData.insurerName,
            contractData.monthlyPremium,
            contractData.status || 'En Attente',
            contractData.commercial,
            contractData.signatureDate,
            contractData.effectiveDate,
            contractData.subscribedDate,
            contractData.endDate,
            contractData.renewalDate
        ];

        const result = await executeQuery(query, params);
        return await this.findById(result.insertId);
    }

    // Trouver un contrat par ID
    static async findById(id) {
        const query = 'SELECT * FROM v_contracts_detailed WHERE id = ?';
        const results = await executeQuery(query, [id]);
        return results.length > 0 ? new Contract(results[0]) : null;
    }

    // Trouver tous les contrats avec filtres
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM v_contracts_detailed WHERE 1=1';
        const params = [];

        if (filters.commercial) {
            query += ' AND commercial = ?';
            params.push(filters.commercial);
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

        if (filters.insurerId) {
            query += ' AND insurer_id = ?';
            params.push(filters.insurerId);
        }

        if (filters.search) {
            query += ' AND (client_name LIKE ? OR contract_number LIKE ? OR product LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters.signatureDateFrom) {
            query += ' AND signature_date >= ?';
            params.push(filters.signatureDateFrom);
        }

        if (filters.signatureDateTo) {
            query += ' AND signature_date <= ?';
            params.push(filters.signatureDateTo);
        }

        // Pagination
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const offset = (page - 1) * limit;

        query += ' ORDER BY signature_date DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const results = await executeQuery(query, params);
        return results.map(row => new Contract(row));
    }

    // Mettre à jour un contrat
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
        const query = `UPDATE contracts SET ${fields.join(', ')} WHERE id = ?`;
        
        await executeQuery(query, params);
        return await this.findById(id);
    }

    // Supprimer un contrat
    static async delete(id) {
        const query = 'DELETE FROM contracts WHERE id = ?';
        const result = await executeQuery(query, [id]);
        return result.affectedRows > 0;
    }

    // Obtenir les commissions par période
    static async getCommissionsByPeriod(commercial = null, year, month = null) {
        const query = 'CALL GetCommissionsByPeriod(?, ?, ?)';
        const results = await executeQuery(query, [commercial, year, month]);
        return results[0];
    }

    // Calculer le MRR (Monthly Recurring Revenue)
    static async calculateMRR(commercial = null) {
        let query = `
            SELECT 
                SUM(monthly_premium) as total_mrr,
                COUNT(*) as active_contracts,
                AVG(monthly_premium) as avg_premium
            FROM contracts 
            WHERE status IN ('Actif', 'Précompte')
        `;
        const params = [];

        if (commercial) {
            query += ' AND commercial = ?';
            params.push(commercial);
        }

        const results = await executeQuery(query, params);
        return results[0];
    }

    // Obtenir les contrats à renouveler
    static async getContractsToRenew(daysAhead = 30) {
        const query = `
            SELECT * FROM v_contracts_detailed 
            WHERE renewal_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND renewal_date >= CURDATE()
            AND status = 'Actif'
            ORDER BY renewal_date ASC
        `;
        const results = await executeQuery(query, [daysAhead]);
        return results.map(row => new Contract(row));
    }

    // Statistiques par compagnie d'assurance
    static async getStatsByInsurer() {
        const query = 'SELECT * FROM v_insurance_company_performance ORDER BY total_mrr DESC';
        const results = await executeQuery(query);
        return results;
    }

    // Générer un numéro de contrat unique
    static async generateContractNumber(prefix = 'CTR') {
        const year = new Date().getFullYear();
        const query = `
            SELECT COUNT(*) + 1 as next_number 
            FROM contracts 
            WHERE contract_number LIKE ? 
            AND YEAR(created_at) = ?
        `;
        const results = await executeQuery(query, [`${prefix}-${year}-%`, year]);
        const nextNumber = results[0].next_number.toString().padStart(4, '0');
        return `${prefix}-${year}-${nextNumber}`;
    }

    // Calculer les commissions totales pour un commercial
    static async getTotalCommissions(commercial, year = null) {
        let query = `
            SELECT 
                SUM(annual_commission) as total_gross_commission,
                SUM(first_year_annual_net_commission) as total_net_commission,
                SUM(recurrent_annual_net_commission) as total_recurrent_commission,
                COUNT(*) as total_contracts
            FROM contracts 
            WHERE commercial = ?
            AND status IN ('Actif', 'Précompte')
        `;
        const params = [commercial];

        if (year) {
            query += ' AND YEAR(signature_date) = ?';
            params.push(year);
        }

        const results = await executeQuery(query, params);
        return results[0];
    }
}

module.exports = Contract;