-- Fonctions SQL pour l'API

DELIMITER $$

-- Fonction pour obtenir les prospects avec pagination
CREATE FUNCTION GetProspectsWithPagination(
    commercial_filter VARCHAR(255),
    status_filter VARCHAR(50),
    search_term VARCHAR(255),
    page_number INT,
    page_size INT
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    DECLARE total_count INT;
    DECLARE offset_value INT;
    
    SET offset_value = (page_number - 1) * page_size;
    
    -- Compter le total
    SELECT COUNT(*) INTO total_count
    FROM v_prospects_enriched
    WHERE (commercial_filter IS NULL OR commercial = commercial_filter)
    AND (status_filter IS NULL OR status = status_filter)
    AND (search_term IS NULL OR 
         name LIKE CONCAT('%', search_term, '%') OR 
         email LIKE CONCAT('%', search_term, '%') OR
         phone LIKE CONCAT('%', search_term, '%'));
    
    -- Construire le résultat JSON
    SELECT JSON_OBJECT(
        'data', JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', id,
                'name', name,
                'email', email,
                'phone', phone,
                'status', status,
                'commercial', commercial,
                'source', source,
                'ville', ville,
                'postal_code', postal_code,
                'age', age,
                'days_since_creation', days_since_creation,
                'nb_contracts', nb_contracts,
                'mrr_client', mrr_client
            )
        ),
        'pagination', JSON_OBJECT(
            'page', page_number,
            'page_size', page_size,
            'total_count', total_count,
            'total_pages', CEIL(total_count / page_size)
        )
    ) INTO result
    FROM (
        SELECT *
        FROM v_prospects_enriched
        WHERE (commercial_filter IS NULL OR commercial = commercial_filter)
        AND (status_filter IS NULL OR status = status_filter)
        AND (search_term IS NULL OR 
             name LIKE CONCAT('%', search_term, '%') OR 
             email LIKE CONCAT('%', search_term, '%') OR
             phone LIKE CONCAT('%', search_term, '%'))
        ORDER BY created_at DESC
        LIMIT page_size OFFSET offset_value
    ) AS paginated_prospects;
    
    RETURN result;
END$$

-- Fonction pour calculer les KPIs du dashboard
CREATE FUNCTION GetDashboardKPIs(
    commercial_filter VARCHAR(255),
    start_date DATE,
    end_date DATE
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    DECLARE total_prospects INT;
    DECLARE new_prospects INT;
    DECLARE signed_contracts INT;
    DECLARE total_mrr DECIMAL(10,2);
    DECLARE conversion_rate DECIMAL(5,2);
    
    -- Calculer les métriques
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN status IN ('Nouveau', 'À Relancer') THEN 1 END),
        COUNT(CASE WHEN status = 'Gagné - Client' THEN 1 END)
    INTO total_prospects, new_prospects, signed_contracts
    FROM prospects
    WHERE (commercial_filter IS NULL OR commercial = commercial_filter)
    AND created_at BETWEEN start_date AND end_date;
    
    SELECT COALESCE(SUM(monthly_premium), 0)
    INTO total_mrr
    FROM contracts
    WHERE (commercial_filter IS NULL OR commercial = commercial_filter)
    AND status IN ('Actif', 'Précompte')
    AND signature_date BETWEEN start_date AND end_date;
    
    SET conversion_rate = CASE 
        WHEN total_prospects > 0 THEN (signed_contracts * 100.0 / total_prospects)
        ELSE 0 
    END;
    
    SELECT JSON_OBJECT(
        'total_prospects', total_prospects,
        'new_prospects', new_prospects,
        'signed_contracts', signed_contracts,
        'total_mrr', total_mrr,
        'conversion_rate', conversion_rate
    ) INTO result;
    
    RETURN result;
END$$

-- Fonction pour obtenir les données du pipeline
CREATE FUNCTION GetPipelineData(
    commercial_filter VARCHAR(255)
) RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'name', status,
            'value', count
        )
    ) INTO result
    FROM v_prospects_pipeline
    WHERE (commercial_filter IS NULL OR commercial = commercial_filter)
    AND count > 0;
    
    RETURN result;
END$$

DELIMITER ;