
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Contract, ContractStatus, StatCardItem, UserRole, User, Prospect, ProspectStatus } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { SearchIcon, FilterIcon, PlusIcon, EyeIcon, EditIcon, DocumentDuplicateIcon, CurrencyDollarIcon, UserCircleIcon } from '../constants';
import { formatDateForDisplay } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import { calculateContractCommissions } from '../utils/commissionUtils';

// --- INLINED DATA (CONTEXTUAL PROSPECTS - NOT DIRECTLY USED BUT PART OF FULL APP DATA SIMULATION) ---
const initialProspectsData: Prospect[] = [
  { id: '1', name: 'Barty Laurent', dateOfBirth: '1957-06-10', postalCode: '97150', ville: 'Marigot', email: 'barty.laurent@email.fr', phone: '0601020304', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'fb_sync', relanceAttempts: 0 },
  { id: '2', name: 'Meinert', dateOfBirth: '1969-11-05', postalCode: '97310', ville: 'Saint-Laurent-du-Maroni', email: 'meinert@email.fr', phone: '0601020305', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'fb_sync', relanceAttempts: 1, lastRelanceDate: '2025-02-01' },
  { id: '6', name: 'Robert Durand', dateOfBirth: '1954-03-15', postalCode: '75001', ville: 'Paris', email: 'robert.durand@email.fr', phone: '06 12 34 56 78', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Site Web', createdDate: '2024-01-15', dateDemande: '15/01/2024', canal: 'email' },
  { id: '7', name: 'Françoise Martin', dateOfBirth: '1959-07-20', postalCode: '69001', ville: 'Lyon', email: 'francoise.martin@email.fr', phone: '06 98 76 54 32', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Recommandation', createdDate: '2024-01-10', dateDemande: '10/01/2024', canal: 'téléphone' },
];
// --- END OF CONTEXTUAL PROSPECTS ---

const rawMockContracts: Omit<Contract, 'annualPremium' | 'monthlyCommission' | 'annualCommission' | 'commissionType' | 'firstYearCommissionRate' | 'recurrentCommissionRate' | 'firstYearAnnualNetCommission' | 'recurrentAnnualGrossCommission' | 'recurrentAnnualNetCommission'>[] = [
    {
    id: '1',
    contractNumber: '15571172',
    clientName: 'DELORME ELISA',
    clientCity: 'Châteauneuf-de-Randon',
    product: 'SANTÉ',
    insurerName: 'APRIL', 
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
    insurerName: 'APRIL', 
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
    insurerName: 'SOLLY AZAR', 
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
    clientName: 'Robert Durand', 
    product: 'Mutuelle Senior Vitalité',
    insurerName: 'NÉOLIANE', 
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
    clientName: 'Françoise Martin', 
    product: 'Complémentaire Santé Essentiel',
    insurerName: 'SPVIE', 
    monthlyPremium: 78.30,
    status: ContractStatus.ACTIF,
    commercial: 'Jean Conseiller',
    effectiveDate: '2024-01-15',
    subscribedDate: '2024-01-10',
    signatureDate: '2024-01-10',
    renewalDate: '2025-01-15',
  },
];

const allMockContracts: Contract[] = rawMockContracts.map(contract => {
    const calculatedCommissions = calculateContractCommissions({
        insurerName: contract.insurerName,
        monthlyPremium: contract.monthlyPremium
    });
    return {
        ...contract,
        ...calculatedCommissions,
    } as Contract; 
});


const statusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  ...Object.values(ContractStatus).map(s => ({ value: s, label: s }))
];

const ContractStatCard: React.FC<StatCardItem> = ({ title, value, icon, iconBgColor }) => (
    <Card className="flex-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-semibold text-text-main">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBgColor}`}>
          {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: 'h-6 w-6 text-white' })}
        </div>
      </div>
    </Card>
  );

const ContractsPage: React.FC = () => {
  const { user } = useAuth() as { user: User };
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (location.state?.statusFilters) {
      if (Array.isArray(location.state.statusFilters) && location.state.statusFilters.length === 1) {
        setStatusFilter(location.state.statusFilters[0]);
      } else if (Array.isArray(location.state.statusFilters) && location.state.statusFilters.length > 1) {
        setStatusFilter('all'); 
      }
    }
  }, [location.state]);

  const getRoleBasedContracts = () => {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) {
      return allMockContracts; 
    }
    if (user.role === UserRole.COMMERCIAL) {
      return allMockContracts.filter(c => c.commercial === user.name); 
    }
    return [];
  };
  
  const contractsForDisplay = getRoleBasedContracts();

  const filteredContracts = contractsForDisplay.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = c.contractNumber.toLowerCase().includes(searchLower) ||
                          c.clientName.toLowerCase().includes(searchLower) ||
                          (c.insurerName && c.insurerName.toLowerCase().includes(searchLower)) ||
                          c.product.toLowerCase().includes(searchLower);
    
    let matchesStatus = false;
    if (location.state?.statusFilters && Array.isArray(location.state.statusFilters)) {
        matchesStatus = location.state.statusFilters.includes(c.status);
    } else {
        matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    }
    return matchesSearch && matchesStatus;
  });

  const totalMRR = filteredContracts.filter(c => c.status === ContractStatus.ACTIF || c.status === ContractStatus.PRECOMPTE).reduce((sum, c) => sum + c.monthlyPremium, 0);
  const activeContractsCount = filteredContracts.filter(c => c.status === ContractStatus.ACTIF || c.status === ContractStatus.PRECOMPTE).length;
  const pendingContractsCount = filteredContracts.filter(c => c.status === ContractStatus.EN_ATTENTE).length;

  const stats: StatCardItem[] = [
    { title: 'Contrats Actifs', value: activeContractsCount, icon: <DocumentDuplicateIcon />, iconBgColor: 'bg-status-green' },
    { title: 'En Attente', value: pendingContractsCount, icon: <DocumentDuplicateIcon />, iconBgColor: 'bg-status-yellow' },
    { title: 'MRR Actif', value: `${totalMRR.toFixed(2)}€`, icon: <CurrencyDollarIcon />, iconBgColor: 'bg-primary' },
  ];
  
  const canPerformWriteActions = user.role === UserRole.ADMIN;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-semibold text-text-headings font-heading">
                 {user.role === UserRole.COMMERCIAL ? `Mes Contrats (${user.name})` : 'Tous les Contrats'}
            </h1>
            <p className="text-sm text-text-secondary">{filteredContracts.length} contrat{filteredContracts.length > 1 ? 's' : ''} • MRR Actif: {totalMRR.toFixed(2)}€</p>
        </div>
        {canPerformWriteActions && (
            <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5"/>}>
                Nouveau Contrat
            </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map(stat => <ContractStatCard key={stat.title} {...stat} />)}
      </div>

      <Card>
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center border-b border-card-border">
          <div className="w-full md:flex-1">
            <Input 
              placeholder="Rechercher par N°, client, compagnie..."
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
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Client</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Ville</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date Signature</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">N° Contrat</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Compagnie</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cot. Mens.</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Com. Mens. 1A (Brut)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Type Com.</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Taux 1A (%)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Taux Récur. (%)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Com. Ann. Nette 1A</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Statut</th>
                {(user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) && <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Attribution</th>}
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                     <div className="font-medium text-text-main">{contract.clientName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-main">{contract.clientCity || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-main">{formatDateForDisplay(contract.signatureDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-text-main">{contract.contractNumber}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-main">{contract.insurerName || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-main">{contract.monthlyPremium.toFixed(2)}€</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-main">{contract.monthlyCommission?.toFixed(2) || '-'}€</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-main">{contract.commissionType || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-main">{contract.firstYearCommissionRate?.toFixed(2) || '-'}%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-main">{contract.recurrentCommissionRate?.toFixed(2) || '-'}%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-main">{contract.firstYearAnnualNetCommission?.toFixed(2) || '-'}€</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge text={contract.status} type={contract.status} />
                  </td>
                  {(user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) && <td className="px-4 py-3 whitespace-nowrap text-text-main">{contract.commercial}</td>}
                  <td className="px-4 py-3 whitespace-nowrap font-medium space-x-2">
                    <button title="Voir" className="text-primary hover:text-primary-hover"><EyeIcon className="w-5 h-5"/></button>
                    {canPerformWriteActions && (
                        <button title="Modifier" className="text-yellow-500 hover:text-yellow-600"><EditIcon className="w-5 h-5"/></button>
                    )}
                    {(user.role === UserRole.COMMERCIAL && contract.commercial === user.name) && ( 
                        <button title="Modifier" className="text-yellow-500 hover:text-yellow-600"><EditIcon className="w-5 h-5"/></button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredContracts.length === 0 && (
            <div className="text-center py-10 text-text-secondary">
                Aucun contrat ne correspond à vos critères.
            </div>
        )}
      </Card>
    </div>
  );
};

export default ContractsPage;
