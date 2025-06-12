-- Vues pour simplifier les requêtes complexes

-- Vue pour les prospects avec informations enrichies
CREATE VIEW v_prospects_enriched AS
SELECT 
    p.*,
    TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
    DATEDIFF(CURDATE(), p.created_at) as days_since_creation,
    DATEDIFF(CURDATE(), COALESCE(p.last_relance_date, p.created_at)) as days_since_last_contact,
    COUNT(c.id) as nb_contracts,
    COALESCE(SUM(CASE WHEN c.status IN ('Actif', 'Précompte') THEN c.monthly_premium END), 0) as mrr_client
FROM prospects p
LEFT JOIN contracts c ON p.id = c.prospect_id
GROUP BY p.id;

-- Vue pour les contrats avec informations de commission détaillées
CREATE VIEW v_contracts_detailed AS
SELECT 
    c.*,
    p.name as prospect_name,
    p.email as prospect_email,
    p.phone as prospect_phone,
    ic.name as insurance_company_name,
    ic.commission_type as company_commission_type,
    TIMESTAMPDIFF(MONTH, c.effective_date, CURDATE()) as months_active,
    CASE 
        WHEN c.renewal_date <= CURDATE() THEN 'À renouveler'
        WHEN c.renewal_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Renouvellement proche'
        ELSE 'Actif'
    END as renewal_status
FROM contracts c
LEFT JOIN prospects p ON c.prospect_id = p.id
LEFT JOIN insurance_companies ic ON c.insurer_id = ic.id;

-- Vue pour les tickets avec informations client
CREATE VIEW v_tickets_detailed AS
SELECT 
    t.*,
    p.name as client_name,
    p.email as client_email,
    p.phone as client_phone,
    p.ville as client_ville,
    c.contract_number,
    c.product as contract_product,
    CASE 
        WHEN t.status = 'Fermé' THEN t.processing_duration_days
        ELSE DATEDIFF(CURDATE(), t.reception_date)
    END as current_duration_days
FROM tickets t
LEFT JOIN prospects p ON t.prospect_id = p.id
LEFT JOIN contracts c ON t.contract_id = c.id;

-- Vue pour les statistiques commerciales par mois
CREATE VIEW v_commercial_monthly_stats AS
SELECT 
    u.id as commercial_id,
    u.name as commercial_name,
    YEAR(c.signature_date) as year,
    MONTH(c.signature_date) as month,
    COUNT(c.id) as contracts_signed,
    SUM(c.monthly_premium) as total_monthly_premium,
    SUM(c.annual_commission) as total_annual_commission,
    SUM(c.first_year_annual_net_commission) as total_net_commission,
    AVG(c.monthly_premium) as avg_monthly_premium
FROM users u
LEFT JOIN contracts c ON u.name = c.commercial AND c.status IN ('Actif', 'Précompte')
WHERE u.role = 'Commercial'
GROUP BY u.id, u.name, YEAR(c.signature_date), MONTH(c.signature_date);

-- Vue pour le pipeline des prospects par commercial
CREATE VIEW v_prospects_pipeline AS
SELECT 
    commercial,
    status,
    COUNT(*) as count,
    ROUND(AVG(TIMESTAMPDIFF(DAY, created_at, CURDATE())), 0) as avg_days_in_status
FROM prospects
GROUP BY commercial, status;

-- Vue pour les performances par compagnie d'assurance
CREATE VIEW v_insurance_company_performance AS
SELECT 
    ic.id,
    ic.name,
    ic.commission_type,
    ic.first_year_rate,
    ic.recurrent_rate,
    COUNT(c.id) as total_contracts,
    COUNT(CASE WHEN c.status IN ('Actif', 'Précompte') THEN 1 END) as active_contracts,
    SUM(CASE WHEN c.status IN ('Actif', 'Précompte') THEN c.monthly_premium END) as total_mrr,
    SUM(CASE WHEN c.status IN ('Actif', 'Précompte') THEN c.annual_commission END) as total_annual_commission,
    AVG(c.monthly_premium) as avg_premium
FROM insurance_companies ic
LEFT JOIN contracts c ON ic.id = c.insurer_id
GROUP BY ic.id, ic.name, ic.commission_type, ic.first_year_rate, ic.recurrent_rate;