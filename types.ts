
export enum ProspectStatus {
  NOUVEAU = 'Nouveau',
  CONTACT_ETABLI = 'Contact Établi',
  DEVIS_ENVOYE = 'Devis Envoyé',
  GAGNE_CLIENT = 'Gagné - Client',
  PERDU = 'Perdu',
  A_RELANCER = 'À Relancer', // For email automation, maps to 'en attente'
  NE_REPOND_PAS = 'Ne Répond Pas',
  INEXPLOITABLE = 'Inexploitable', // If automation sequence fails
}

export enum ContractStatus {
  ACTIF = 'Actif',
  EN_ATTENTE = 'En Attente',
  EXPIRE = 'Expiré',
  ANNULE = 'Annulé',
  PRECOMPTE = 'Précompte',
  UNPAID = 'Impayé',
}

export enum UserRole {
  ADMIN = 'Admin',
  COMMERCIAL = 'Commercial',
  SUPPORT = 'Support', // Gestionnaire / SAV
}

export type CanalType = 'email' | 'téléphone' | 'fb_sync' | 'autre';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status?: 'Actif' | 'Inactif';
  createdDate?: string;
  lastActivity?: string;
  permissions?: string[];
}

export interface Prospect {
  id: string;
  name: string; // Full name as in "Contact" column
  dateOfBirth?: string; // Format YYYY-MM-DD for internal storage
  ville?: string;
  postalCode?: string; // Key information
  email: string;
  phone: string;
  status: ProspectStatus;
  commercial: string; // Attribution
  source: string; // Origine
  createdDate: string; // Création (YYYY-MM-DD for easier sorting/filtering)
  dateDemande?: string; // Date of initial request for automation, DD/MM/YYYY
  lastInteraction?: string; // (YYYY-MM-DD)
  age?: number; // Made optional, dateOfBirth is preferred
  canal?: CanalType; // For automation logic
  relanceAttempts?: number; // For automation tracking
  lastRelanceDate?: string; // For automation tracking (YYYY-MM-DD or DD/MM/YYYY)
}

export interface Contract {
  id: string;
  contractNumber: string; // N° de contrat
  clientName: string; // Nom Prénom (of the client on contract)
  clientCity?: string; // Ville (from client's profile, can be redundant if linked to prospect)
  product: string;
  insurerName?: string; // Compagnie
  monthlyPremium: number; // Cotisation mensuel
  annualPremium?: number; // Cotisation annuel
  
  signatureDate: string; // YYYY-MM-DD - Mandatory
  
  commissionType?: 'Précompte' | 'Linéaire';
  firstYearCommissionRate?: number; // % rate
  recurrentCommissionRate?: number; // % rate
  
  monthlyCommission?: number; // Calculated: firstYearMonthlyGrossCommission
  annualCommission?: number;  // Calculated: firstYearAnnualGrossCommission
  firstYearAnnualNetCommission?: number; // Calculated
  recurrentAnnualGrossCommission?: number; // Calculated
  recurrentAnnualNetCommission?: number; // Calculated

  status: ContractStatus;
  commercial: string; // Attribution
  effectiveDate: string; // Date d'effet (YYYY-MM-DD)
  subscribedDate: string; // Souscrit le (if different from effectiveDate, or use one) (YYYY-MM-DD)
  endDate?: string; // Date de fin de contrat (YYYY-MM-DD)
  renewalDate?: string; // For anniversary task (YYYY-MM-DD)
}


export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Terminée';
  startDate: string; // DD/MM/YYYY
  endDate?: string; // DD/MM/YYYY
  targetAudience: string;
  budget: number;
}

export type AutomationTriggerType = 
  | "Prospect Statut Change" 
  | "Tag Ajouté/Retiré" 
  | "Date Spécifique Atteinte" 
  | "Anniversaire Contrat"
  | "Champ Prospect Modifié"
  | "Score Prospect Atteint";

export type AutomationActionType = 
  | 'Envoyer Email' 
  | 'Créer Tâche' 
  | 'Changer Statut Prospect'
  | 'Ajouter/Retirer Tag Prospect'
  | 'Mettre à jour Champ Prospect'
  | 'Notifier Commercial'
  | 'Webhook';

export interface AutomationStep {
  id: string;
  order: number;
  type: AutomationActionType; // Updated type
  details: string; 
  delay?: string; // e.g., J+0, J+5, H+2 (hours)
  condition?: string; // e.g., "prospect.city === 'Paris'"
  emailTemplateId?: string; 
  // Fields for other action types
  tagName?: string;
  fieldName?: string;
  fieldValue?: string;
  notificationMessage?: string;
  webhookUrl?: string;
}
export interface AutomationSequence {
  id: string;
  name: string;
  trigger: string; // Description of the trigger, or could be a structured object AutomationTriggerType
  status: 'Active' | 'Inactive';
  steps: AutomationStep[];
}

export interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
}

export interface StatCardItem {
  title: string;
  value: string | number;
  comparison?: string;
  icon: React.ReactNode;
  iconBgColor: string; 
  targetPath?: string; // For navigation
  filterState?: any; // To pass filter state on navigation
}

export interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
  avatarColor: string;
}

export interface EmailTemplate {
  id: string;
  name: string; 
  subject: string; 
  body: string;    
}

export interface AutomatedTask {
  id: string;
  title: string;
  dueDate: string; // DD/MM/YYYY
  assignedTo: string; 
  relatedTo: string; 
  status: 'À faire' | 'En cours' | 'Terminée';
  type: 'Appel Anniversaire' | 'Suivi Cross-sell' | 'Autre';
}

// Types for SAV / Ticketing System
export type TicketStatusType = 'Ouvert' | 'En cours' | 'Fermé' | 'En attente client';
export type TicketCanal = 'mail' | 'téléphone' | 'portail client' | 'autre';

export interface Ticket {
  id: string;
  prospectId: string; // Link to the client (Prospect who is GAGNE_CLIENT) - MANDATORY
  contractId?: string; // Optional: Link to a specific contract
  commercialAttribution?: string; // Commercial who sold the original contract
  receptionDate: string; // DD/MM/YYYY
  canal: TicketCanal;
  insuranceCompany?: string; // e.g., SOLLYAZAR, APRIL
  subject: string; // Nature of the request, e.g., "Demande de remboursement"
  assignedDate?: string; // DD/MM/YYYY, when SAV agent took it
  assignedToSAV?: string; // SAV Agent name
  treatmentDetails?: string; // History of actions
  closureDate?: string; // DD/MM/YYYY
  status: TicketStatusType; // Actual status of the ticket
  processingDurationDays?: number; // Calculated
}
// Objective Management System Types
export enum ObjectivePeriod {
  MENSUEL = 'Mensuel',
  TRIMESTRIEL = 'Trimestriel',
  ANNUEL = 'Annuel',
}

export enum ObjectiveTargetType {
  CHIFFRE_AFFAIRES = 'Chiffre d\'Affaires',
  NOUVEAUX_CONTRATS = 'Nouveaux Contrats Signés',
  PROSPECTS_GAGNES = 'Prospects Gagnés',
}

export interface CabinetObjective {
  id: string;
  targetType: ObjectiveTargetType;
  period: ObjectivePeriod;
  year: number;
  targetValue: number;
  achievedValue: number;
  description?: string; 
}

export interface CommercialObjective {
  id: string;
  commercialId: string; 
  commercialName: string; 
  targetType: ObjectiveTargetType;
  period: ObjectivePeriod;
  year: number;
  month?: number; 
  quarter?: number; 
  targetValue: number;
  achievedValue: number;
  description?: string; 
}