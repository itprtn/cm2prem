
import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatusType, TicketCanal, UserRole, User, Prospect, ProspectStatus } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { SearchIcon, PlusIcon, EyeIcon, EditIcon, FilterIcon } from '../constants';
import { formatDateForDisplay } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

// --- INLINED DATA ---
const initialProspectsData: Prospect[] = [
  { id: '1', name: 'Barty Laurent', dateOfBirth: '1957-06-10', postalCode: '97150', ville: 'Marigot', email: 'barty.laurent@email.fr', phone: '0601020304', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'fb_sync', relanceAttempts: 0 },
  { id: '2', name: 'Meinert', dateOfBirth: '1969-11-05', postalCode: '97310', ville: 'Saint-Laurent-du-Maroni', email: 'meinert@email.fr', phone: '0601020305', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'fb_sync', relanceAttempts: 1, lastRelanceDate: '2025-02-01' },
  { id: '6', name: 'Robert Durand', dateOfBirth: '1954-03-15', postalCode: '75001', ville: 'Paris', email: 'robert.durand@email.fr', phone: '06 12 34 56 78', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Site Web', createdDate: '2024-01-15', dateDemande: '15/01/2024', canal: 'email' },
  { id: '7', name: 'Françoise Martin', dateOfBirth: '1959-07-20', postalCode: '69001', ville: 'Lyon', email: 'francoise.martin@email.fr', phone: '06 98 76 54 32', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Recommandation', createdDate: '2024-01-10', dateDemande: '10/01/2024', canal: 'téléphone' },
  { id: 'client-holzer', name: 'HOLZER PATRICIA', dateOfBirth: '1966-01-10', postalCode: '67000', email: 'holzerpatou57@gmail.com', phone: '0612345678', status: ProspectStatus.GAGNE_CLIENT, commercial: 'KAMMARTI Nizar', source: 'Site Web', createdDate: '2024-03-01', ville: 'Strasbourg'},
  { id: 'client-scheidt', name: 'Scheidt Alain', dateOfBirth: '1962-09-18', postalCode: '57000', email: 'Alainscheidt012@gmail.com', phone: '06 41 30 30 83', status: ProspectStatus.GAGNE_CLIENT, commercial: 'ancien collab', source: 'Referral', createdDate: '2024-04-01', ville: 'Metz'},
  { id: 'client-abraham', name: 'Abraham Guillaume Ali Chahout', dateOfBirth: '1979-11-30', postalCode: '97200', email: 'carybean@hotmail.fr', phone: '596 696 29 46 25', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Zouheir SNOUSSI', source: 'Joker', createdDate: '2024-07-01', ville: 'Fort-de-France'},
  { id: 'client-vinzelles', name: 'Arnaud de Vinzelles', dateOfBirth: '1972-02-02', postalCode: '75016', email: 'arnaud.devinzelles@gmail.com', phone: '06 68 98 15 52', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Zouheir SNOUSSI', source: 'Téléphone', createdDate: '2024-02-15', ville: 'Paris'},
];

const rawMockTickets: Omit<Ticket, 'clientName' | 'clientEmail' | 'clientPhone' | 'processingDurationDays'>[] = [
  { id: 'T001', prospectId: 'client-holzer', commercialAttribution: '', receptionDate: '20/03/2024', canal: 'mail', insuranceCompany: 'SOLLYAZAR', subject: 'Demande de remboursement', assignedDate: '20/03/2024', assignedToSAV: 'KAMMARTI Nizar', treatmentDetails: 'demande de prise en charge dentaire transmise a solly', status: 'Ouvert', closureDate: '', contractId: 'C001-HLZ' },
  { id: 'T002', prospectId: 'client-scheidt', commercialAttribution: 'ancien collab', receptionDate: '05/07/2024', canal: 'mail', insuranceCompany: 'APRIL', subject: 'Demande de remboursement', assignedDate: '05/07/2024', assignedToSAV: 'AYARI Malek', treatmentDetails: 'Demande de remboursement envoyer à la cie pour le M', status: 'Ouvert', closureDate: '', contractId: 'C002-SCH' },
  { id: 'T003', prospectId: 'client-scheidt', commercialAttribution: 'ancien collab', receptionDate: '17/04/2024', canal: 'mail', insuranceCompany: 'APRIL', subject: 'Demande de remboursement', assignedDate: '17/04/2024', assignedToSAV: 'KAMMARTI Nizar', treatmentDetails: 'devis dentaire reçu pour estimation de remboursement // document illisible Mr relancer pour demeilleurs images // doc recu et tranmis a APRIL', status: 'En cours', closureDate: '', contractId: 'C002-SCH' },
  { id: 'T004', prospectId: 'client-scheidt', commercialAttribution: 'ancien collab', receptionDate: '24/04/2024', canal: 'mail', insuranceCompany: 'APRIL', subject: 'Demande de remboursement', assignedDate: '24/04/2024', assignedToSAV: 'KAMMARTI Nizar', treatmentDetails: "devis dentaire reçu pour estimation de remboursement // document illisible Mr relancer pour demeilleurs images // doc recu et tranmis a APRIL // Mr conteste l'estimation, je l'informe qu'il devra en faire un autre avec 100% santé et nous le transmettre // Devis reçu et transmit a aprtl", status: 'En cours', closureDate: '', contractId: 'C002-SCH' },
  { id: 'T005', prospectId: 'client-abraham', commercialAttribution: 'Zouheir SNOUSSI', receptionDate: '01/08/2024', canal: 'mail', insuranceCompany: 'Joker', subject: 'Télétransmission', assignedDate: '01/08/2024', assignedToSAV: 'AYARI Malek', treatmentDetails: "Demande d'activation de la télétranmission envoyé avec l'attestation de droits de M et Mme", status: 'Ouvert', closureDate: '', contractId: 'C003-ABR'},
  { id: 'T006', prospectId: 'client-vinzelles', commercialAttribution: 'Zouheir SNOUSSI', receptionDate: '01/03/2024', canal: 'téléphone', insuranceCompany: 'NEOLIANE', subject: 'Télétransmission', assignedDate: '01/03/2024', assignedToSAV: 'GUERCHI Hajer', status: 'Fermé', closureDate: '05/03/2024', contractId: 'C004-VIN' },
];
// --- END OF INLINED DATA ---

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Tous les statuts' },
  ...(['Ouvert', 'En cours', 'Fermé', 'En attente client'] as TicketStatusType[]).map(s => ({ value: s, label: s }))
];

const prospectsMap = new Map(initialProspectsData.map(p => [p.id, p]));

const savAgentOptions = [
    { value: 'all', label: 'Tous les responsables SAV' },
    ...Array.from(new Set(rawMockTickets.map(t => t.assignedToSAV).filter(Boolean))).map(agent => ({ value: agent as string, label: agent as string}))
];


const TicketsPage: React.FC = () => {
  const { user } = useAuth() as { user: User };
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  const calculateProcessingDuration = (ticket: Ticket): number | undefined => {
    if (ticket.status === 'Fermé' && ticket.closureDate && ticket.receptionDate) {
      const start = new Date(ticket.receptionDate.split('/').reverse().join('-'));
      const end = new Date(ticket.closureDate.split('/').reverse().join('-'));
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    return undefined;
  };
  
  const processedTickets = useMemo(() => rawMockTickets.map(ticket => {
    const clientProspect = prospectsMap.get(ticket.prospectId);
    return {
      ...ticket,
      clientName: clientProspect?.name || 'Client Inconnu',
      clientEmail: clientProspect?.email,
      clientPhone: clientProspect?.phone,
      processingDurationDays: calculateProcessingDuration(ticket as Ticket) 
    };
  }), []);


  const filteredTickets = processedTickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = ticket.clientName.toLowerCase().includes(searchLower) ||
                          (ticket.clientEmail && ticket.clientEmail.toLowerCase().includes(searchLower)) ||
                          (ticket.clientPhone && ticket.clientPhone.includes(searchLower)) ||
                          (ticket.insuranceCompany && ticket.insuranceCompany.toLowerCase().includes(searchLower)) ||
                          ticket.subject.toLowerCase().includes(searchLower) ||
                          (ticket.assignedToSAV && ticket.assignedToSAV.toLowerCase().includes(searchLower)) ||
                           ticket.id.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesAgent = agentFilter === 'all' || ticket.assignedToSAV === agentFilter;
    return matchesSearch && matchesStatus && matchesAgent;
  });

  const canPerformWriteActions = user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-text-headings font-heading">Tickets SAV</h1>
          <p className="text-sm text-text-secondary">{filteredTickets.length} ticket{filteredTickets.length === 1 ? '' : 's'} trouvé{filteredTickets.length === 1 ? '' : 's'}</p>
        </div>
        {canPerformWriteActions && (
          <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5"/>}>
            Nouveau Ticket
          </Button>
        )}
      </div>

      <Card>
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center border-b border-card-border">
          <div className="w-full md:flex-1">
            <Input 
              placeholder="Rechercher par client, email, N° ticket..."
              icon={<SearchIcon />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto">
            <Select 
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[180px]"
            />
          </div>
           <div className="w-full md:w-auto">
            <Select 
              options={savAgentOptions}
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="min-w-[220px]"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-text-secondary uppercase tracking-wider">Client</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary uppercase tracking-wider">Commercial Orig.</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary uppercase tracking-wider">Réception</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary uppercase tracking-wider">Compagnie</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary uppercase tracking-wider">Sujet</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary uppercase tracking-wider">Responsable SAV</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary uppercase tracking-wider">Statut Ticket</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="font-medium text-text-main">{ticket.clientName}</div>
                    <div className="text-text-faded">{ticket.clientEmail || ticket.clientPhone || 'N/A'}</div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-text-main">{ticket.commercialAttribution || '-'}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-text-main">{ticket.receptionDate}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-text-main">{ticket.insuranceCompany || '-'}</td>
                  <td className="px-3 py-3 text-text-main max-w-xs truncate" title={ticket.subject}>{ticket.subject}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-text-main">{ticket.assignedToSAV || '-'}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Badge 
                        text={ticket.status} 
                        type={ticket.status === 'Ouvert' || ticket.status === 'En cours' ? 'info' : (ticket.status === 'Fermé' ? 'active' : 'default')} 
                    />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-medium space-x-1">
                    <button title="Voir Détails" className="text-primary hover:text-primary-hover p-1"><EyeIcon className="w-4 h-4"/></button>
                    {canPerformWriteActions && (
                      <button title="Modifier Ticket" className="text-yellow-500 hover:text-yellow-600 p-1"><EditIcon className="w-4 h-4"/></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTickets.length === 0 && (
            <div className="text-center py-10 text-text-secondary">
                Aucun ticket ne correspond à vos critères.
            </div>
        )}
      </Card>
    </div>
  );
};

export default TicketsPage;
