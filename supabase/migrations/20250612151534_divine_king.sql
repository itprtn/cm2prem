-- Premunia CRM Database Schema
-- Compatible avec MySQL/MariaDB pour déploiement OVH

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS premunia_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE premunia_crm;

-- Table des utilisateurs
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Commercial', 'Support') NOT NULL DEFAULT 'Commercial',
    avatar_url VARCHAR(500),
    status ENUM('Actif', 'Inactif') DEFAULT 'Actif',
    permissions JSON,
    last_activity TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- Table des prospects
CREATE TABLE prospects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    postal_code VARCHAR(10),
    ville VARCHAR(255),
    status ENUM('Nouveau', 'Contact Établi', 'Devis Envoyé', 'Gagné - Client', 'Perdu', 'À Relancer', 'Ne Répond Pas', 'Inexploitable') NOT NULL DEFAULT 'Nouveau',
    commercial VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    canal ENUM('email', 'téléphone', 'fb_sync', 'autre') DEFAULT 'email',
    date_demande DATE,
    relance_attempts INT DEFAULT 0,
    last_relance_date DATE,
    last_interaction TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_commercial (commercial),
    INDEX idx_source (source),
    INDEX idx_postal_code (postal_code),
    INDEX idx_created_at (created_at)
);

-- Table des compagnies d'assurance
CREATE TABLE insurance_companies (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) UNIQUE NOT NULL,
    commission_type ENUM('Précompte', 'Linéaire') NOT NULL DEFAULT 'Linéaire',
    first_year_rate DECIMAL(5,2) NOT NULL DEFAULT 8.00,
    recurrent_rate DECIMAL(5,2) NOT NULL DEFAULT 3.00,
    net_factor DECIMAL(3,2) NOT NULL DEFAULT 0.70,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des contrats
CREATE TABLE contracts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    prospect_id VARCHAR(36) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_city VARCHAR(255),
    product VARCHAR(255) NOT NULL,
    insurer_id VARCHAR(36),
    insurer_name VARCHAR(255),
    monthly_premium DECIMAL(10,2) NOT NULL,
    annual_premium DECIMAL(10,2) GENERATED ALWAYS AS (monthly_premium * 12) STORED,
    commission_type ENUM('Précompte', 'Linéaire'),
    first_year_commission_rate DECIMAL(5,2),
    recurrent_commission_rate DECIMAL(5,2),
    monthly_commission DECIMAL(10,2),
    annual_commission DECIMAL(10,2),
    first_year_annual_net_commission DECIMAL(10,2),
    recurrent_annual_gross_commission DECIMAL(10,2),
    recurrent_annual_net_commission DECIMAL(10,2),
    status ENUM('Actif', 'En Attente', 'Expiré', 'Annulé', 'Précompte', 'Impayé') NOT NULL DEFAULT 'En Attente',
    commercial VARCHAR(255) NOT NULL,
    signature_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    subscribed_date DATE NOT NULL,
    end_date DATE,
    renewal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE,
    FOREIGN KEY (insurer_id) REFERENCES insurance_companies(id) ON DELETE SET NULL,
    INDEX idx_contract_number (contract_number),
    INDEX idx_prospect_id (prospect_id),
    INDEX idx_status (status),
    INDEX idx_commercial (commercial),
    INDEX idx_signature_date (signature_date),
    INDEX idx_effective_date (effective_date)
);

-- Table des tickets SAV
CREATE TABLE tickets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    prospect_id VARCHAR(36) NOT NULL,
    contract_id VARCHAR(36),
    commercial_attribution VARCHAR(255),
    reception_date DATE NOT NULL,
    canal ENUM('mail', 'téléphone', 'portail client', 'autre') NOT NULL DEFAULT 'mail',
    insurance_company VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    assigned_date DATE,
    assigned_to_sav VARCHAR(255),
    treatment_details TEXT,
    closure_date DATE,
    status ENUM('Ouvert', 'En cours', 'Fermé', 'En attente client') NOT NULL DEFAULT 'Ouvert',
    priority ENUM('Basse', 'Normale', 'Haute', 'Urgente') DEFAULT 'Normale',
    processing_duration_days INT GENERATED ALWAYS AS (
        CASE 
            WHEN closure_date IS NOT NULL AND reception_date IS NOT NULL 
            THEN DATEDIFF(closure_date, reception_date)
            ELSE NULL 
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_prospect_id (prospect_id),
    INDEX idx_status (status),
    INDEX idx_assigned_to_sav (assigned_to_sav),
    INDEX idx_reception_date (reception_date)
);

-- Table des campagnes
CREATE TABLE campaigns (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Active', 'Inactive', 'Terminée') NOT NULL DEFAULT 'Inactive',
    start_date DATE NOT NULL,
    end_date DATE,
    target_audience VARCHAR(500),
    budget DECIMAL(10,2) DEFAULT 0.00,
    spent_amount DECIMAL(10,2) DEFAULT 0.00,
    leads_generated INT DEFAULT 0,
    conversions INT DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_created_by (created_by)
);

-- Table des séquences d'automatisation
CREATE TABLE automation_sequences (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_conditions JSON NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Inactive',
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
);

-- Table des étapes d'automatisation
CREATE TABLE automation_steps (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sequence_id VARCHAR(36) NOT NULL,
    step_order INT NOT NULL,
    action_type ENUM('Envoyer Email', 'Créer Tâche', 'Changer Statut Prospect', 'Ajouter/Retirer Tag Prospect', 'Mettre à jour Champ Prospect', 'Notifier Commercial', 'Webhook') NOT NULL,
    action_details JSON NOT NULL,
    delay_hours INT DEFAULT 0,
    conditions JSON,
    email_template_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sequence_id) REFERENCES automation_sequences(id) ON DELETE CASCADE,
    INDEX idx_sequence_id (sequence_id),
    INDEX idx_step_order (step_order)
);

-- Table des templates d'email
CREATE TABLE email_templates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    template_type ENUM('Relance', 'Devis', 'Suivi', 'Anniversaire', 'Autre') DEFAULT 'Autre',
    variables JSON,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_template_type (template_type),
    INDEX idx_created_by (created_by)
);

-- Table des tâches automatisées
CREATE TABLE automated_tasks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type ENUM('Appel Anniversaire', 'Suivi Cross-sell', 'Relance', 'Autre') NOT NULL DEFAULT 'Autre',
    due_date DATE NOT NULL,
    assigned_to VARCHAR(255) NOT NULL,
    related_prospect_id VARCHAR(36),
    related_contract_id VARCHAR(36),
    status ENUM('À faire', 'En cours', 'Terminée', 'Annulée') NOT NULL DEFAULT 'À faire',
    priority ENUM('Basse', 'Normale', 'Haute') DEFAULT 'Normale',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (related_prospect_id) REFERENCES prospects(id) ON DELETE SET NULL,
    FOREIGN KEY (related_contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
    INDEX idx_due_date (due_date),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status)
);

-- Table des objectifs du cabinet
CREATE TABLE cabinet_objectives (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    target_type ENUM('Chiffre d\'Affaires', 'Nouveaux Contrats Signés', 'Prospects Gagnés') NOT NULL,
    period ENUM('Mensuel', 'Trimestriel', 'Annuel') NOT NULL,
    year INT NOT NULL,
    month INT NULL,
    quarter INT NULL,
    target_value DECIMAL(12,2) NOT NULL,
    achieved_value DECIMAL(12,2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period_year (period, year),
    INDEX idx_target_type (target_type)
);

-- Table des objectifs commerciaux
CREATE TABLE commercial_objectives (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    commercial_id VARCHAR(36) NOT NULL,
    commercial_name VARCHAR(255) NOT NULL,
    target_type ENUM('Chiffre d\'Affaires', 'Nouveaux Contrats Signés', 'Prospects Gagnés') NOT NULL,
    period ENUM('Mensuel', 'Trimestriel', 'Annuel') NOT NULL,
    year INT NOT NULL,
    month INT NULL,
    quarter INT NULL,
    target_value DECIMAL(12,2) NOT NULL,
    achieved_value DECIMAL(12,2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (commercial_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_commercial_id (commercial_id),
    INDEX idx_period_year (period, year),
    INDEX idx_target_type (target_type)
);

-- Table des logs d'activité
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);

-- Table des paramètres système
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);