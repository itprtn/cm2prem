-- Triggers pour automatiser les calculs et maintenir la cohérence

DELIMITER $$

-- Trigger pour calculer automatiquement les commissions lors de l'insertion d'un contrat
CREATE TRIGGER calculate_commissions_insert
BEFORE INSERT ON contracts
FOR EACH ROW
BEGIN
    DECLARE commission_type_val VARCHAR(20);
    DECLARE first_year_rate_val DECIMAL(5,2);
    DECLARE recurrent_rate_val DECIMAL(5,2);
    DECLARE net_factor_val DECIMAL(3,2);
    
    -- Récupérer les paramètres de commission de la compagnie
    SELECT commission_type, first_year_rate, recurrent_rate, net_factor
    INTO commission_type_val, first_year_rate_val, recurrent_rate_val, net_factor_val
    FROM insurance_companies 
    WHERE id = NEW.insurer_id OR name = NEW.insurer_name
    LIMIT 1;
    
    -- Utiliser des valeurs par défaut si la compagnie n'est pas trouvée
    IF commission_type_val IS NULL THEN
        SET commission_type_val = 'Linéaire';
        SET first_year_rate_val = 8.00;
        SET recurrent_rate_val = 3.00;
        SET net_factor_val = 0.70;
    END IF;
    
    -- Calculer les commissions
    SET NEW.commission_type = commission_type_val;
    SET NEW.first_year_commission_rate = first_year_rate_val;
    SET NEW.recurrent_commission_rate = recurrent_rate_val;
    SET NEW.monthly_commission = (NEW.monthly_premium * first_year_rate_val) / 100;
    SET NEW.annual_commission = NEW.monthly_commission * 12;
    SET NEW.first_year_annual_net_commission = NEW.annual_commission * net_factor_val;
    SET NEW.recurrent_annual_gross_commission = (NEW.monthly_premium * recurrent_rate_val) / 100 * 12;
    SET NEW.recurrent_annual_net_commission = NEW.recurrent_annual_gross_commission * net_factor_val;
END$$

-- Trigger pour recalculer les commissions lors de la mise à jour d'un contrat
CREATE TRIGGER calculate_commissions_update
BEFORE UPDATE ON contracts
FOR EACH ROW
BEGIN
    DECLARE commission_type_val VARCHAR(20);
    DECLARE first_year_rate_val DECIMAL(5,2);
    DECLARE recurrent_rate_val DECIMAL(5,2);
    DECLARE net_factor_val DECIMAL(3,2);
    
    -- Recalculer seulement si la prime mensuelle ou l'assureur a changé
    IF NEW.monthly_premium != OLD.monthly_premium OR NEW.insurer_id != OLD.insurer_id OR NEW.insurer_name != OLD.insurer_name THEN
        -- Récupérer les paramètres de commission
        SELECT commission_type, first_year_rate, recurrent_rate, net_factor
        INTO commission_type_val, first_year_rate_val, recurrent_rate_val, net_factor_val
        FROM insurance_companies 
        WHERE id = NEW.insurer_id OR name = NEW.insurer_name
        LIMIT 1;
        
        -- Utiliser des valeurs par défaut si nécessaire
        IF commission_type_val IS NULL THEN
            SET commission_type_val = 'Linéaire';
            SET first_year_rate_val = 8.00;
            SET recurrent_rate_val = 3.00;
            SET net_factor_val = 0.70;
        END IF;
        
        -- Recalculer les commissions
        SET NEW.commission_type = commission_type_val;
        SET NEW.first_year_commission_rate = first_year_rate_val;
        SET NEW.recurrent_commission_rate = recurrent_rate_val;
        SET NEW.monthly_commission = (NEW.monthly_premium * first_year_rate_val) / 100;
        SET NEW.annual_commission = NEW.monthly_commission * 12;
        SET NEW.first_year_annual_net_commission = NEW.annual_commission * net_factor_val;
        SET NEW.recurrent_annual_gross_commission = (NEW.monthly_premium * recurrent_rate_val) / 100 * 12;
        SET NEW.recurrent_annual_net_commission = NEW.recurrent_annual_gross_commission * net_factor_val;
    END IF;
END$$

-- Trigger pour mettre à jour le statut du prospect quand un contrat est signé
CREATE TRIGGER update_prospect_status_on_contract
AFTER INSERT ON contracts
FOR EACH ROW
BEGIN
    UPDATE prospects 
    SET status = 'Gagné - Client', 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.prospect_id;
END$$

-- Trigger pour générer automatiquement un numéro de ticket
CREATE TRIGGER generate_ticket_number
BEFORE INSERT ON tickets
FOR EACH ROW
BEGIN
    DECLARE next_number INT;
    DECLARE year_suffix VARCHAR(4);
    
    SET year_suffix = YEAR(CURDATE());
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number, 2, 6) AS UNSIGNED)), 0) + 1
    INTO next_number
    FROM tickets
    WHERE ticket_number LIKE CONCAT('T', year_suffix, '%');
    
    SET NEW.ticket_number = CONCAT('T', year_suffix, LPAD(next_number, 6, '0'));
END$$

-- Trigger pour logger les activités importantes
CREATE TRIGGER log_prospect_changes
AFTER UPDATE ON prospects
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_logs (action, entity_type, entity_id, old_values, new_values)
        VALUES (
            'status_change',
            'prospect',
            NEW.id,
            JSON_OBJECT('status', OLD.status),
            JSON_OBJECT('status', NEW.status)
        );
    END IF;
END$$

CREATE TRIGGER log_contract_changes
AFTER UPDATE ON contracts
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_logs (action, entity_type, entity_id, old_values, new_values)
        VALUES (
            'status_change',
            'contract',
            NEW.id,
            JSON_OBJECT('status', OLD.status),
            JSON_OBJECT('status', NEW.status)
        );
    END IF;
END$$

DELIMITER ;