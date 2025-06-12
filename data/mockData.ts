
import { Prospect, ProspectStatus, Ticket, ContractStatus, Contract } from '../types';
// CRITICAL: This import path MUST be relative for browser ES module resolution.
// Path aliases like '@/utils/...' will NOT work without a build system.
// If you see errors about "@/", it's almost certainly a caching issue.
// Correct path: assuming 'data' and 'utils' are sibling directories.
import { calculateContractCommissions } from '../utils/commissionUtils';

export const initialProspectsData: Prospect[] = [
  { id: '1', name: 'Barty Laurent', ville: 'Marigot', email: 'barty.laurent@email.fr', phone: '0601020304', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'fb_sync', relanceAttempts: 0 },
  { id: '2', name: 'Meinert', ville: 'Saint-Laurent-du-Maroni', email: 'meinert@email.fr', phone: '0601020305', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'fb_sync', relanceAttempts: 1, lastRelanceDate: '2025-02-01' },
  { id: '3', name: 'Rivière Jean Hugues', ville: 'Saint-Pierre', email: 'jean.hugues@email.fr', phone: '0601020306', status: ProspectStatus.DEVIS_ENVOYE, commercial: 'DAHMANI MOUNA', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'email' },
  { id: '4', name: 'Satge Jocelyn', ville: 'Capesterre-Belle-Eau', email: 'jocelyn.satge@email.fr', phone: '0601020307', status: ProspectStatus.INEXPLOITABLE, commercial: 'DAHMANI MOUNA', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'email', relanceAttempts: 3, lastRelanceDate: '2025-02-13' },
  { id: '5', name: 'Persee Marie Helene', ville: 'Sainte-Rose', email: 'marie.persee@email.fr', phone: '0601020308', status: ProspectStatus.INEXPLOITABLE, commercial: 'Radhia MAATOUG', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'email' },
  { id: '6', name: 'Robert Durand', age: 70, ville: 'Paris', email: 'robert.durand@email.fr', phone: '06 12 34 56 78', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Site Web', createdDate: '2024-01-15', dateDemande: '15/01/2024', canal: 'email' },
  { id: '7', name: 'Françoise Martin', age: 65, ville: 'Lyon', email: 'francoise.martin@email.fr', phone: '06 98 76 54 32', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Recommandation', createdDate: '2024-01-10', dateDemande: '10/01/2024', canal: 'téléphone' },
  { id: 'p-new1', name: 'Laura Craft', email: 'laura@email.com', phone:'', status: ProspectStatus.NOUVEAU, commercial:'Jean Conseiller', source:'Web', createdDate:'2024-07-25'},
  { id: 'client-holzer', name: 'HOLZER PATRICIA', email: 'holzerpatou57@gmail.com', phone: '0612345678', status: ProspectStatus.GAGNE_CLIENT, commercial: 'KAMMARTI Nizar', source: 'Site Web', createdDate: '2024-03-01', ville: 'Strasbourg'},
  { id: 'client-scheidt', name: 'Scheidt Alain', email: 'Alainscheidt012@gmail.com', phone: '06 41 30 30 83', status: ProspectStatus.GAGNE_CLIENT, commercial: 'ancien collab', source: 'Referral', createdDate: '2024-04-01', ville: 'Metz'},
  { id: 'client-abraham', name: 'Abraham Guillaume Ali Chahout', email: 'carybean@hotmail.fr', phone: '596 696 29 46 25', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Zouheir SNOUSSI', source: 'Joker', createdDate: '2024-07-01', ville: 'Fort-de-France'},
  { id: 'client-vinzelles', name: 'Arnaud de Vinzelles', email: 'arnaud.devinzelles@gmail.com', phone: '06 68 98 15 52', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Zouheir SNOUSSI', source: 'Téléphone', createdDate: '2024-02-15', ville: 'Paris'},
];

// Mock tickets without direct clientName, clientEmail, clientPhone
export const mockTickets: Omit<Ticket, 'clientName' | 'clientEmail' | 'clientPhone' | 'processingDurationDays'>[] = [
  { id: 'T001', prospectId: 'client-holzer', commercialAttribution: '', receptionDate: '20/03/2024', canal: 'mail', insuranceCompany: 'SOLLYAZAR', subject: 'Demande de remboursement', assignedDate: '20/03/2024', assignedToSAV: 'KAMMARTI Nizar', treatmentDetails: 'demande de prise en charge dentaire transmise a solly', status: 'Ouvert', closureDate: '', contractId: 'C001-HLZ' },
  { id: 'T002', prospectId: 'client-scheidt', commercialAttribution: 'ancien collab', receptionDate: '05/07/2024', canal: 'mail', insuranceCompany: 'APRIL', subject: 'Demande de remboursement', assignedDate: '05/07/2024', assignedToSAV: 'AYARI Malek', treatmentDetails: 'Demande de remboursement envoyer à la cie pour le M', status: 'Ouvert', closureDate: '', contractId: 'C002-SCH' },
  { id: 'T003', prospectId: 'client-scheidt', commercialAttribution: 'ancien collab', receptionDate: '17/04/2024', canal: 'mail', insuranceCompany: 'APRIL', subject: 'Demande de remboursement', assignedDate: '17/04/2024', assignedToSAV: 'KAMMARTI Nizar', treatmentDetails: 'devis dentaire reçu pour estimation de remboursement // document illisible Mr relancer pour demeilleurs images // doc recu et tranmis a APRIL', status: 'En cours', closureDate: '', contractId: 'C002-SCH' },
  { id: 'T004', prospectId: 'client-scheidt', commercialAttribution: 'ancien collab', receptionDate: '24/04/2024', canal: 'mail', insuranceCompany: 'APRIL', subject: 'Demande de remboursement', assignedDate: '24/04/2024', assignedToSAV: 'KAMMARTI Nizar', treatmentDetails: "devis dentaire reçu pour estimation de remboursement // document illisible Mr relancer pour demeilleurs images // doc recu et tranmis a APRIL // Mr conteste l'estimation, je l'informe qu'il devra en faire un autre avec 100% santé et nous le transmettre // Devis reçu et transmit a aprtl", status: 'En cours', closureDate: '', contractId: 'C002-SCH' },
  { id: 'T005', prospectId: 'client-abraham', commercialAttribution: 'Zouheir SNOUSSI', receptionDate: '01/08/2024', canal: 'mail', insuranceCompany: 'Joker', subject: 'Télétransmission', assignedDate: '01/08/2024', assignedToSAV: 'AYARI Malek', treatmentDetails: "Demande d'activation de la télétranmission envoyé avec l'attestation de droits de M et Mme", status: 'Ouvert', closureDate: '', contractId: 'C003-ABR'},
  { id: 'T006', prospectId: 'client-vinzelles', commercialAttribution: 'Zouheir SNOUSSI', receptionDate: '01/03/2024', canal: 'téléphone', insuranceCompany: 'NEOLIANE', subject: 'Télétransmission', assignedDate: '01/03/2024', assignedToSAV: 'GUERCHI Hajer', status: 'Fermé', closureDate: '05/03/2024', contractId: 'C004-VIN' },
];

const rawMockContracts: Omit<Contract, 'annualPremium' | 'monthlyCommission' | 'annualCommission' | 'commissionType' | 'firstYearCommissionRate' | 'recurrentCommissionRate' | 'firstYearAnnualNetCommission' | 'recurrentAnnualGrossCommission' | 'recurrentAnnualNetCommission'>[] = [
    {
    id: '1',
    contractNumber: '15571172',
    clientName: 'DELORME ELISA',
    clientCity: 'Châteauneuf-de-Randon',
    product: 'SANTÉ',
    insurerName: 'APRIL', // Standardized for mapping
    monthlyPremium: 111.38,
    status: ContractStatus.PRECOMPTE,
    commercial: 'SNOUSSI ZOUHAIR',
    effectiveDate: '2025-02-01',
    subscribedDate: '2025-01-16',
    signatureDate: '2025-01-15',
    renewalDate: '2026-02-01',
  },
  {
    id: 'C001-HLZ',
    contractNumber: 'APRIL-HLZ-001',
    clientName: 'HOLZER PATRICIA',
    product: 'Mutuelle Santé Plus',
    insurerName: 'APRIL', // Standardized
    monthlyPremium: 85.50,
    status: ContractStatus.ACTIF,
    commercial: 'KAMMARTI Nizar',
    effectiveDate: '2024-03-15',
    subscribedDate: '2024-03-01',
    signatureDate: '2024-03-01',
    renewalDate: '2025-03-15',
  },
   {
    id: 'C002-SCH',
    contractNumber: 'SOLLY-SCH-002',
    clientName: 'Scheidt Alain',
    product: 'Prévoyance Pro',
    insurerName: 'SOLLY AZAR', // Standardized
    monthlyPremium: 120.00,
    status: ContractStatus.ACTIF,
    commercial: 'ancien collab',
    effectiveDate: '2024-04-10',
    subscribedDate: '2024-04-01',
    signatureDate: '2024-04-01',
    renewalDate: '2025-04-10',
  },
  {
    id: 'ctr-rd-001',
    contractNumber: 'RD-MUT-SENIOR-001',
    clientName: 'Robert Durand', // From prospect ID 6
    product: 'Mutuelle Senior Vitalité',
    insurerName: 'NÉOLIANE', // Use a name from commissionMapping
    monthlyPremium: 95.70,
    status: ContractStatus.ACTIF,
    commercial: 'Jean Conseiller',
    effectiveDate: '2024-02-01',
    subscribedDate: '2024-01-20',
    signatureDate: '2024-01-20',
    renewalDate: '2025-02-01',
  },
  {
    id: 'ctr-fm-001',
    contractNumber: 'FM-MUT-COMPL-002',
    clientName: 'Françoise Martin', // From prospect ID 7
    product: 'Complémentaire Santé Essentiel',
    insurerName: 'SPVIE', // Use a name from commissionMapping
    monthlyPremium: 78.30,
    status: ContractStatus.ACTIF,
    commercial: 'Jean Conseiller',
    effectiveDate: '2024-01-15',
    subscribedDate: '2024-01-10',
    signatureDate: '2024-01-10',
    renewalDate: '2025-01-15',
  },
];

export const allMockContracts: Contract[] = rawMockContracts.map(contract => {
    const calculatedCommissions = calculateContractCommissions({
        insurerName: contract.insurerName,
        monthlyPremium: contract.monthlyPremium
    });
    return {
        ...contract,
        ...calculatedCommissions,
    } as Contract; // Cast needed as contract is Pick<...>
});
