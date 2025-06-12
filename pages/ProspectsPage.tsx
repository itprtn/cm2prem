
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Prospect, ProspectStatus, CanalType, UserRole, User } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { SearchIcon, FilterIcon, PlusIcon, EyeIcon, EditIcon, DeleteIcon, TicketIcon } from '../constants'; 
import { formatDateForDisplay } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import ProspectDetailModal from '../components/prospects/ProspectDetailModal'; 

// --- INLINED DATA ---
const initialProspectsData: Prospect[] = [
  { id: '1', name: 'Barty Laurent', dateOfBirth: '1957-06-10', postalCode: '97150', ville: 'Marigot', email: 'barty.laurent@email.fr', phone: '0601020304', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'fb_sync', relanceAttempts: 0 },
  { id: '2', name: 'Meinert', dateOfBirth: '1969-11-05', postalCode: '97310', ville: 'Saint-Laurent-du-Maroni', email: 'meinert@email.fr', phone: '0601020305', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'fb_sync', relanceAttempts: 1, lastRelanceDate: '2025-02-01' },
  { id: '3', name: 'Rivière Jean Hugues', dateOfBirth: '1952-04-20', postalCode: '97410', ville: 'Saint-Pierre', email: 'jean.hugues@email.fr', phone: '0601020306', status: ProspectStatus.DEVIS_ENVOYE, commercial: 'DAHMANI MOUNA', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'email' },
  { id: '4', name: 'Satge Jocelyn', dateOfBirth: '1984-08-15', postalCode: '97130', ville: 'Capesterre-Belle-Eau', email: 'jocelyn.satge@email.fr', phone: '0601020307', status: ProspectStatus.INEXPLOITABLE, commercial: 'DAHMANI MOUNA', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'email', relanceAttempts: 3, lastRelanceDate: '2025-02-13' },
  { id: '5', name: 'Persee Marie Helene', dateOfBirth: '1964-12-01', postalCode: '97115', ville: 'Sainte-Rose', email: 'marie.persee@email.fr', phone: '0601020308', status: ProspectStatus.INEXPLOITABLE, commercial: 'Radhia MAATOUG', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'email' },
  { id: '6', name: 'Robert Durand', dateOfBirth: '1954-03-15', postalCode: '75001', ville: 'Paris', email: 'robert.durand@email.fr', phone: '06 12 34 56 78', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Site Web', createdDate: '2024-01-15', dateDemande: '15/01/2024', canal: 'email' },
  { id: '7', name: 'Françoise Martin', dateOfBirth: '1959-07-20', postalCode: '69001', ville: 'Lyon', email: 'francoise.martin@email.fr', phone: '06 98 76 54 32', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Recommandation', createdDate: '2024-01-10', dateDemande: '10/01/2024', canal: 'téléphone' },
  { id: 'p-new1', name: 'Laura Craft', dateOfBirth: '1989-05-25', postalCode: '33000', email: 'laura@email.com', phone:'', status: ProspectStatus.NOUVEAU, commercial:'Jean Conseiller', source:'Web', createdDate:'2024-07-25'},
  { id: 'client-holzer', name: 'HOLZER PATRICIA', dateOfBirth: '1966-01-10', postalCode: '67000', email: 'holzerpatou57@gmail.com', phone: '0612345678', status: ProspectStatus.GAGNE_CLIENT, commercial: 'KAMMARTI Nizar', source: 'Site Web', createdDate: '2024-03-01', ville: 'Strasbourg'},
  { id: 'client-scheidt', name: 'Scheidt Alain', dateOfBirth: '1962-09-18', postalCode: '57000', email: 'Alainscheidt012@gmail.com', phone: '06 41 30 30 83', status: ProspectStatus.GAGNE_CLIENT, commercial: 'ancien collab', source: 'Referral', createdDate: '2024-04-01', ville: 'Metz'},
  { id: 'client-abraham', name: 'Abraham Guillaume Ali Chahout', dateOfBirth: '1979-11-30', postalCode: '97200', email: 'carybean@hotmail.fr', phone: '596 696 29 46 25', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Zouheir SNOUSSI', source: 'Joker', createdDate: '2024-07-01', ville: 'Fort-de-France'},
  { id: 'client-vinzelles', name: 'Arnaud de Vinzelles', dateOfBirth: '1972-02-02', postalCode: '75016', email: 'arnaud.devinzelles@gmail.com', phone: '06 68 98 15 52', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Zouheir SNOUSSI', source: 'Téléphone', createdDate: '2024-02-15', ville: 'Paris'},
];
// --- END OF INLINED DATA ---


const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  ...Object.values(ProspectStatus).map(s => ({ value: s, label: s }))
];

const ProspectsPage: React.FC = () => {
  const { user } = useAuth() as { user: User };
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);


  useEffect(() => {
    if (location.state?.statusFilters) {
      if (Array.isArray(location.state.statusFilters) && location.state.statusFilters.length === 1) {
        setStatusFilter(location.state.statusFilters[0]);
      } else if (Array.isArray(location.state.statusFilters) && location.state.statusFilters.length > 1) {
        setStatusFilter('all'); 
      }
    }
  }, [location.state]);


  const getRoleBasedProspects = () => {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) {
      return initialProspectsData;
    }
    if (user.role === UserRole.COMMERCIAL) {
      return initialProspectsData.filter(p => p.commercial === user.name);
    }
    return [];
  };

  const prospects = getRoleBasedProspects();

  const filteredProspects = prospects.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchLower) || 
                          p.email.toLowerCase().includes(searchLower) ||
                          p.phone.includes(searchTerm) ||
                          (p.ville && p.ville.toLowerCase().includes(searchLower)) ||
                          (p.postalCode && p.postalCode.includes(searchTerm)) ||
                          p.commercial.toLowerCase().includes(searchLower) ||
                          p.source.toLowerCase().includes(searchLower);
    
    let matchesStatus = false;
    if (location.state?.statusFilters && Array.isArray(location.state.statusFilters)) {
        matchesStatus = location.state.statusFilters.includes(p.status);
    } else {
        matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });
  
  const canPerformWriteActions = user.role === UserRole.ADMIN;
  const canEditProspect = (prospectCommercial: string) => user.role === UserRole.ADMIN || (user.role === UserRole.COMMERCIAL && prospectCommercial === user.name);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-semibold text-text-headings font-heading">
              {user.role === UserRole.COMMERCIAL ? `Mes Prospects (${user.name})` : 'Tous les Prospects'}
            </h1>
            <p className="text-sm text-text-secondary">{filteredProspects.length} prospect{filteredProspects.length === 1 ? '' : 's'}</p>
        </div>
        {canPerformWriteActions && (
            <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5"/>}>
                Nouveau Prospect
            </Button>
        )}
      </div>

      <Card>
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center border-b border-card-border">
          <div className="w-full md:flex-1">
            <Input 
              placeholder="Rechercher..."
              icon={<SearchIcon />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto">
            <Select 
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => {
                    setStatusFilter(e.target.value);
                    if (location.state?.statusFilters) {
                        window.history.replaceState({}, document.title) 
                    }
                }}
                className="min-w-[200px]"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Code Postal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Ville</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Création</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Origine</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Statut</th>
                {(user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Attribution</th>}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredProspects.map((prospect) => (
                <tr key={prospect.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text-main">{prospect.name}</div>
                    <div className="text-xs text-text-faded">{prospect.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{prospect.postalCode || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{prospect.ville || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{formatDateForDisplay(prospect.createdDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{prospect.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge text={prospect.status} type={prospect.status} />
                  </td>
                  {(user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) && <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{prospect.commercial}</td>}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                    <button title="Voir Détails & Comparateur" className="text-primary hover:text-primary-hover p-1" onClick={() => setSelectedProspect(prospect)}>
                      <TicketIcon className="w-5 h-5"/>
                    </button>
                    {canEditProspect(prospect.commercial) && (
                        <button title="Modifier" className="text-yellow-500 hover:text-yellow-600 p-1"><EditIcon className="w-5 h-5"/></button>
                    )}
                    {canPerformWriteActions && (
                        <button title="Supprimer" className="text-red-500 hover:text-red-600 p-1"><DeleteIcon className="w-5 h-5"/></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProspects.length === 0 && (
            <div className="text-center py-10 text-text-secondary">
                Aucun prospect ne correspond à vos critères.
            </div>
        )}
      </Card>

      {selectedProspect && (
        <ProspectDetailModal 
            prospect={selectedProspect} 
            onClose={() => setSelectedProspect(null)} 
        />
      )}
    </div>
  );
};

export default ProspectsPage;
