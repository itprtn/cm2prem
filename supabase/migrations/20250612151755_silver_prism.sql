-- Index supplémentaires pour optimiser les performances

-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_prospects_commercial_status ON prospects(commercial, status);
CREATE INDEX idx_prospects_status_created ON prospects(status, created_at);
CREATE INDEX idx_prospects_commercial_created ON prospects(commercial, created_at);

CREATE INDEX idx_contracts_commercial_status ON contracts(commercial, status);
CREATE INDEX idx_contracts_status_signature ON contracts(status, signature_date);
CREATE INDEX idx_contracts_commercial_signature ON contracts(commercial, signature_date);

CREATE INDEX idx_tickets_status_reception ON tickets(status, reception_date);
CREATE INDEX idx_tickets_sav_status ON tickets(assigned_to_sav, status);

-- Index pour les recherches textuelles
CREATE FULLTEXT INDEX idx_prospects_search ON prospects(name, email);
CREATE FULLTEXT INDEX idx_contracts_search ON contracts(client_name, contract_number);

-- Index pour les calculs de commissions
CREATE INDEX idx_contracts_insurer_premium ON contracts(insurer_id, monthly_premium);
CREATE INDEX idx_contracts_commercial_premium ON contracts(commercial, monthly_premium);

-- Index pour les objectifs
CREATE INDEX idx_cabinet_objectives_period ON cabinet_objectives(period, year, month);
CREATE INDEX idx_commercial_objectives_period ON commercial_objectives(commercial_id, period, year, month);

-- Index pour les logs d'activité
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, created_at);
CREATE INDEX idx_activity_logs_entity_date ON activity_logs(entity_type, entity_id, created_at);