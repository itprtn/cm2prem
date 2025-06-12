-- Données d'exemple pour tester le système

-- Insertion des utilisateurs par défaut
INSERT INTO users (id, name, email, password_hash, role, status) VALUES
('admin-001', 'Pierre Dubois', 'admin@premunia.fr', '$2b$10$example_hash_admin', 'Admin', 'Actif'),
('comm-001', 'Jean Conseiller', 'jean@premunia.fr', '$2b$10$example_hash_jean', 'Commercial', 'Actif'),
('comm-002', 'Marie Martin', 'marie@premunia.fr', '$2b$10$example_hash_marie', 'Commercial', 'Actif'),
('supp-001', 'Sophie Gestionnaire', 'sophie@premunia.fr', '$2b$10$example_hash_sophie', 'Support', 'Actif');

-- Insertion des compagnies d'assurance
INSERT INTO insurance_companies (id, name, commission_type, first_year_rate, recurrent_rate, net_factor) VALUES
('ins-001', 'APRIL', 'Précompte', 15.00, 5.00, 0.80),
('ins-002', 'SOLLY AZAR', 'Linéaire', 10.00, 10.00, 0.75),
('ins-003', 'NÉOLIANE', 'Précompte', 18.00, 4.00, 0.85),
('ins-004', 'SPVIE', 'Linéaire', 12.00, 8.00, 0.80);

-- Insertion des prospects d'exemple
INSERT INTO prospects (id, name, email, phone, date_of_birth, postal_code, ville, status, commercial, source, canal, date_demande) VALUES
('pros-001', 'Robert Durand', 'robert.durand@email.fr', '06 12 34 56 78', '1954-03-15', '75001', 'Paris', 'Gagné - Client', 'Jean Conseiller', 'Site Web', 'email', '2024-01-15'),
('pros-002', 'Françoise Martin', 'francoise.martin@email.fr', '06 98 76 54 32', '1959-07-20', '69001', 'Lyon', 'Gagné - Client', 'Jean Conseiller', 'Recommandation', 'téléphone', '2024-01-10'),
('pros-003', 'HOLZER PATRICIA', 'holzerpatou57@gmail.com', '0612345678', '1966-01-10', '67000', 'Strasbourg', 'Gagné - Client', 'Marie Martin', 'Site Web', 'email', '2024-03-01'),
('pros-004', 'Laura Craft', 'laura@email.com', '', '1989-05-25', '33000', 'Bordeaux', 'Nouveau', 'Jean Conseiller', 'Web', 'email', '2024-07-25'),
('pros-005', 'Barty Laurent', 'barty.laurent@email.fr', '0601020304', '1957-06-10', '97150', 'Marigot', 'À Relancer', 'Marie Martin', 'fb_sync', 'email', '2025-02-01');

-- Insertion des contrats d'exemple
INSERT INTO contracts (id, contract_number, prospect_id, client_name, client_city, product, insurer_id, insurer_name, monthly_premium, status, commercial, signature_date, effective_date, subscribed_date, renewal_date) VALUES
('cont-001', 'RD-MUT-SENIOR-001', 'pros-001', 'Robert Durand', 'Paris', 'Mutuelle Senior Vitalité', 'ins-003', 'NÉOLIANE', 95.70, 'Actif', 'Jean Conseiller', '2024-01-20', '2024-02-01', '2024-01-20', '2025-02-01'),
('cont-002', 'FM-MUT-COMPL-002', 'pros-002', 'Françoise Martin', 'Lyon', 'Complémentaire Santé Essentiel', 'ins-004', 'SPVIE', 78.30, 'Actif', 'Jean Conseiller', '2024-01-10', '2024-01-15', '2024-01-10', '2025-01-15'),
('cont-003', 'APRIL-HLZ-001', 'pros-003', 'HOLZER PATRICIA', 'Strasbourg', 'Mutuelle Santé Plus', 'ins-001', 'APRIL', 85.50, 'Actif', 'Marie Martin', '2024-03-01', '2024-03-15', '2024-03-01', '2025-03-15');

-- Insertion des templates d'email
INSERT INTO email_templates (id, name, subject, body, template_type) VALUES
('tmpl-001', 'Relance J+0', 'Votre demande de devis mutuelle santé', 'Bonjour %PRÉNOM%,\n\nNous avons bien reçu votre demande de devis en date du %DATE_DEMANDE%.\n\nNous vous proposons de découvrir nos offres personnalisées : %LIEN_DEVIS%\n\nCordialement,\nL\'équipe Premunia', 'Relance'),
('tmpl-002', 'Relance J+5', 'Rappel : Votre devis mutuelle santé vous attend', 'Bonjour %PRÉNOM%,\n\nVous aviez fait une demande de devis le %DATE_DEMANDE%.\n\nN\'hésitez pas à consulter nos propositions : %LIEN_DEVIS%\n\nCordialement,\nL\'équipe Premunia', 'Relance'),
('tmpl-003', 'Relance J+12', 'Dernière chance : Votre devis mutuelle expire bientôt', 'Bonjour %PRÉNOM%,\n\nVotre devis établi le %DATE_DEMANDE% expire bientôt.\n\nProfitez-en maintenant : %LIEN_DEVIS%\n\nCordialement,\nL\'équipe Premunia', 'Relance');

-- Insertion des paramètres système
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'Premunia', 'string', 'Nom de l\'entreprise'),
('default_commission_rate', '8.00', 'number', 'Taux de commission par défaut'),
('email_signature', 'L\'équipe Premunia\nTél: 01 23 45 67 89\nEmail: contact@premunia.fr', 'string', 'Signature email par défaut'),
('automation_enabled', 'true', 'boolean', 'Activation des automatisations'),
('max_relance_attempts', '3', 'number', 'Nombre maximum de tentatives de relance');

-- Insertion des objectifs du cabinet
INSERT INTO cabinet_objectives (target_type, period, year, target_value, achieved_value, description) VALUES
('Chiffre d\'Affaires', 'Annuel', 2024, 1000000.00, 650000.00, 'CA Annuel Cabinet 2024'),
('Nouveaux Contrats Signés', 'Annuel', 2024, 500, 320, 'Nouveaux Contrats Signés 2024');

-- Insertion des objectifs commerciaux
INSERT INTO commercial_objectives (commercial_id, commercial_name, target_type, period, year, month, target_value, achieved_value, description) VALUES
('comm-001', 'Jean Conseiller', 'Chiffre d\'Affaires', 'Mensuel', 2024, 7, 8000.00, 5500.00, 'CA Mensuel Juillet'),
('comm-001', 'Jean Conseiller', 'Nouveaux Contrats Signés', 'Mensuel', 2024, 7, 10, 7, 'Nouveaux Contrats Juillet'),
('comm-002', 'Marie Martin', 'Chiffre d\'Affaires', 'Mensuel', 2024, 7, 7000.00, 6200.00, 'CA Mensuel Juillet'),
('comm-002', 'Marie Martin', 'Nouveaux Contrats Signés', 'Mensuel', 2024, 7, 8, 8, 'Nouveaux Contrats Juillet');