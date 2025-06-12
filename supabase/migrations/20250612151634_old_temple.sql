-- Procédures stockées pour les opérations complexes

DELIMITER $$

-- Procédure pour calculer les KPIs d'un commercial
CREATE PROCEDURE GetCommercialKPIs(
    IN commercial_name VARCHAR(255),
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    SELECT 
        COUNT(DISTINCT p.id) as total_prospects,
        COUNT(DISTINCT CASE WHEN p.status = 'Gagné - Client' THEN p.id END) as prospects_gagnes,
        COUNT(DISTINCT c.id) as total_contracts,
        COALESCE(SUM(CASE WHEN c.status IN ('Actif', 'Précompte') THEN c.monthly_premium END), 0) as mrr_actif,
        COALESCE(SUM(CASE WHEN c.status IN ('Actif', 'Précompte') THEN c.annual_commission END), 0) as commission_annuelle,
        ROUND(
            COUNT(DISTINCT CASE WHEN p.status = 'Gagné - Client' THEN p.id END) * 100.0 / 
            NULLIF(COUNT(DISTINCT CASE WHEN p.status IN ('Gagné - Client', 'Perdu') THEN p.id END), 0), 
            2
        ) as taux_conversion
    FROM prospects p
    LEFT JOIN contracts c ON p.id = c.prospect_id
    WHERE p.commercial = commercial_name
    AND p.created_at BETWEEN start_date AND end_date;
END$$

-- Procédure pour obtenir le pipeline des prospects
CREATE PROCEDURE GetProspectsPipeline(
    IN commercial_name VARCHAR(255)
)
BEGIN
    SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM prospects WHERE commercial = commercial_name OR commercial_name IS NULL), 2) as percentage
    FROM prospects
    WHERE commercial = commercial_name OR commercial_name IS NULL
    GROUP BY status
    ORDER BY 
        CASE status
            WHEN 'Nouveau' THEN 1
            WHEN 'Contact Établi' THEN 2
            WHEN 'Devis Envoyé' THEN 3
            WHEN 'À Relancer' THEN 4
            WHEN 'Gagné - Client' THEN 5
            WHEN 'Perdu' THEN 6
            ELSE 7
        END;
END$$

-- Procédure pour calculer les commissions par période
CREATE PROCEDURE GetCommissionsByPeriod(
    IN commercial_name VARCHAR(255),
    IN year_param INT,
    IN month_param INT
)
BEGIN
    SELECT 
        ic.name as compagnie,
        COUNT(c.id) as nb_contrats,
        SUM(c.monthly_premium) as prime_mensuelle_totale,
        SUM(c.monthly_commission) as commission_mensuelle_totale,
        SUM(c.annual_commission) as commission_annuelle_totale,
        SUM(c.first_year_annual_net_commission) as commission_nette_totale
    FROM contracts c
    LEFT JOIN insurance_companies ic ON c.insurer_id = ic.id
    WHERE (commercial_name IS NULL OR c.commercial = commercial_name)
    AND YEAR(c.signature_date) = year_param
    AND (month_param IS NULL OR MONTH(c.signature_date) = month_param)
    AND c.status IN ('Actif', 'Précompte')
    GROUP BY ic.name
    ORDER BY commission_annuelle_totale DESC;
END$$

-- Procédure pour obtenir les prospects à relancer
CREATE PROCEDURE GetProspectsToFollow(
    IN commercial_name VARCHAR(255),
    IN days_threshold INT
)
BEGIN
    SELECT 
        p.*,
        DATEDIFF(CURDATE(), COALESCE(p.last_relance_date, p.created_at)) as days_since_last_contact
    FROM prospects p
    WHERE (commercial_name IS NULL OR p.commercial = commercial_name)
    AND p.status IN ('À Relancer', 'Contact Établi', 'Devis Envoyé')
    AND DATEDIFF(CURDATE(), COALESCE(p.last_relance_date, p.created_at)) >= days_threshold
    ORDER BY days_since_last_contact DESC;
END$$

-- Procédure pour obtenir les statistiques des tickets SAV
CREATE PROCEDURE GetTicketStats(
    IN assigned_to_sav VARCHAR(255),
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'Ouvert' THEN 1 END) as tickets_ouverts,
        COUNT(CASE WHEN status = 'En cours' THEN 1 END) as tickets_en_cours,
        COUNT(CASE WHEN status = 'Fermé' THEN 1 END) as tickets_fermes,
        AVG(CASE WHEN status = 'Fermé' THEN processing_duration_days END) as duree_moyenne_traitement,
        COUNT(CASE WHEN priority = 'Urgente' THEN 1 END) as tickets_urgents
    FROM tickets
    WHERE (assigned_to_sav IS NULL OR assigned_to_sav = assigned_to_sav)
    AND reception_date BETWEEN start_date AND end_date;
END$$

-- Procédure pour mettre à jour les objectifs réalisés
CREATE PROCEDURE UpdateObjectiveAchievement(
    IN objective_type ENUM('cabinet', 'commercial'),
    IN objective_id VARCHAR(36)
)
BEGIN
    DECLARE target_type_val VARCHAR(50);
    DECLARE period_val VARCHAR(20);
    DECLARE year_val INT;
    DECLARE month_val INT;
    DECLARE quarter_val INT;
    DECLARE commercial_id_val VARCHAR(36);
    DECLARE achieved_value_calc DECIMAL(12,2);
    
    IF objective_type = 'cabinet' THEN
        SELECT target_type, period, year, month, quarter
        INTO target_type_val, period_val, year_val, month_val, quarter_val
        FROM cabinet_objectives
        WHERE id = objective_id;
        
        -- Calculer la valeur réalisée selon le type d'objectif
        IF target_type_val = 'Chiffre d\'Affaires' THEN
            SELECT COALESCE(SUM(annual_commission), 0)
            INTO achieved_value_calc
            FROM contracts
            WHERE YEAR(signature_date) = year_val
            AND (month_val IS NULL OR MONTH(signature_date) = month_val)
            AND (quarter_val IS NULL OR QUARTER(signature_date) = quarter_val)
            AND status IN ('Actif', 'Précompte');
        ELSEIF target_type_val = 'Nouveaux Contrats Signés' THEN
            SELECT COUNT(*)
            INTO achieved_value_calc
            FROM contracts
            WHERE YEAR(signature_date) = year_val
            AND (month_val IS NULL OR MONTH(signature_date) = month_val)
            AND (quarter_val IS NULL OR QUARTER(signature_date) = quarter_val)
            AND status IN ('Actif', 'Précompte');
        END IF;
        
        UPDATE cabinet_objectives
        SET achieved_value = achieved_value_calc
        WHERE id = objective_id;
        
    ELSEIF objective_type = 'commercial' THEN
        SELECT target_type, period, year, month, quarter, commercial_id
        INTO target_type_val, period_val, year_val, month_val, quarter_val, commercial_id_val
        FROM commercial_objectives
        WHERE id = objective_id;
        
        -- Calculer la valeur réalisée pour le commercial
        IF target_type_val = 'Chiffre d\'Affaires' THEN
            SELECT COALESCE(SUM(annual_commission), 0)
            INTO achieved_value_calc
            FROM contracts c
            JOIN users u ON c.commercial = u.name
            WHERE u.id = commercial_id_val
            AND YEAR(c.signature_date) = year_val
            AND (month_val IS NULL OR MONTH(c.signature_date) = month_val)
            AND (quarter_val IS NULL OR QUARTER(c.signature_date) = quarter_val)
            AND c.status IN ('Actif', 'Précompte');
        ELSEIF target_type_val = 'Nouveaux Contrats Signés' THEN
            SELECT COUNT(*)
            INTO achieved_value_calc
            FROM contracts c
            JOIN users u ON c.commercial = u.name
            WHERE u.id = commercial_id_val
            AND YEAR(c.signature_date) = year_val
            AND (month_val IS NULL OR MONTH(c.signature_date) = month_val)
            AND (quarter_val IS NULL OR QUARTER(c.signature_date) = quarter_val)
            AND c.status IN ('Actif', 'Précompte');
        END IF;
        
        UPDATE commercial_objectives
        SET achieved_value = achieved_value_calc
        WHERE id = objective_id;
    END IF;
END$$

DELIMITER ;