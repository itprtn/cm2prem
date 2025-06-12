
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import BarChartComponent from '../components/charts/BarChartComponent';
import PieChartComponent from '../components/charts/PieChartComponent';
import { StatCardItem, Prospect, ProspectStatus, Contract, ContractStatus, AutomatedTask, UserRole, User, CabinetObjective, CommercialObjective, ObjectivePeriod, ObjectiveTargetType } from '../types';
import { UsersIcon, ChartBarIcon, DocumentDuplicateIcon, CurrencyDollarIcon, EditIcon, EyeIcon, DeleteIcon, CheckCircleIcon, BellIcon, ShieldIcon } from '../constants';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button'; 
import { formatDateForDisplay } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import { calculateContractCommissions } from '../utils/commissionUtils'; 

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
// --- END OF INLINED DATA ---


const mockCabinetObjectives: CabinetObjective[] = [
    { id: 'cab_obj_1', targetType: ObjectiveTargetType.CHIFFRE_AFFAIRES, period: ObjectivePeriod.ANNUEL, year: 2024, targetValue: 1000000, achievedValue: 650000, description: 'CA Annuel Cabinet 2024' },
    { id: 'cab_obj_2', targetType: ObjectiveTargetType.NOUVEAUX_CONTRATS, period: ObjectivePeriod.ANNUEL, year: 2024, targetValue: 500, achievedValue: 320, description: 'Nouveaux Contrats Signés 2024' },
];

const mockCommercialObjectives: CommercialObjective[] = [
    { id: 'com_obj_1', commercialId: 'user002', commercialName: 'Jean Conseiller', targetType: ObjectiveTargetType.CHIFFRE_AFFAIRES, period: ObjectivePeriod.MENSUEL, year: 2024, month: 7, targetValue: 8000, achievedValue: 5500, description: 'CA Mensuel Juillet' },
    { id: 'com_obj_2', commercialId: 'user002', commercialName: 'Jean Conseiller', targetType: ObjectiveTargetType.NOUVEAUX_CONTRATS, period: ObjectivePeriod.MENSUEL, year: 2024, month: 7, targetValue: 10, achievedValue: 7, description: 'Nouveaux Contrats Juillet' },
    { id: 'com_obj_3', commercialId: 'admin001', commercialName: 'Pierre Dubois', targetType: ObjectiveTargetType.CHIFFRE_AFFAIRES, period: ObjectivePeriod.MENSUEL, year: 2024, month: 7, targetValue: 12000, achievedValue: 9500, description: 'CA Mensuel Juillet (Admin vue)' },
    { id: 'com_obj_mm1', commercialId: 'id_marie_martin', commercialName: 'Marie Martin', targetType: ObjectiveTargetType.CHIFFRE_AFFAIRES, period: ObjectivePeriod.MENSUEL, year: 2024, month: 7, targetValue: 7000, achievedValue: 6200 },
    { id: 'com_obj_mm2', commercialId: 'id_marie_martin', commercialName: 'Marie Martin', targetType: ObjectiveTargetType.NOUVEAUX_CONTRATS, period: ObjectivePeriod.MENSUEL, year: 2024, month: 7, targetValue: 8, achievedValue: 8 },
];


const StatCard: React.FC<StatCardItem> = ({ title, value, comparison, icon, iconBgColor, targetPath, filterState }) => {
  const cardContent = (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-2xl font-semibold text-text-main">{value}</p>
        {comparison && <p className="text-xs text-text-faded">{comparison}</p>}
      </div>
      <div className={`p-3 rounded-full ${iconBgColor}`}>
        {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: 'h-6 w-6 text-white' })}
      </div>
    </div>
  );

  if (targetPath) {
    return (
      <Link to={targetPath} state={filterState} className="flex-1 no-underline">
        <Card className="hover:shadow-lg transition-shadow duration-150 h-full">
            {cardContent}
        </Card>
      </Link>
    );
  }

  return <Card className="flex-1">{cardContent}</Card>;
};


const allMockProspects: Prospect[] = initialProspectsData; 

const allMockUpcomingTasks: AutomatedTask[] = [
    { id: 'task1', title: "Appel Anniversaire Contrat", dueDate: '01/08/2024', assignedTo: "Marie Martin", relatedTo: "Sylvie Rousseau (CTR-2024-001)", status: 'À faire', type: 'Appel Anniversaire' },
    { id: 'task2', title: "Suivi Devis", dueDate: '28/07/2024', assignedTo: "Jean Dupont", relatedTo: "Michel Leblanc", status: 'À faire', type: 'Autre' },
    { id: 'task3', title: "Proposer Prévoyance", dueDate: '05/08/2024', assignedTo: "Marie Martin", relatedTo: "Robert Durand (Client)", status: 'À faire', type: 'Suivi Cross-sell' },
    { id: 'task4', title: "Appel Anniversaire Contrat", dueDate: '01/07/2025', assignedTo: "Jean Dupont", relatedTo: "Luc Skywalker (CTR-2024-003)", status: 'À faire', type: 'Appel Anniversaire' },
];

const pieChartColors = ['#3B82F6', '#F59E0B', '#0EA5E9', '#EAB308', '#10B981', '#8B5CF6'];

const DashboardPage: React.FC = () => {
  const { user } = useAuth() as { user: User }; 

  const isCommercial = user.role === UserRole.COMMERCIAL;
  const commercialName = user.name;
  const currentMonth = new Date().getMonth() + 1; 
  const currentYear = new Date().getFullYear();

  const prospects = isCommercial ? allMockProspects.filter(p => p.commercial === commercialName) : allMockProspects;
  const contracts = isCommercial ? allMockContracts.filter(c => c.commercial === commercialName) : allMockContracts;
  const upcomingTasks = isCommercial ? allMockUpcomingTasks.filter(t => t.assignedTo === commercialName) : allMockUpcomingTasks;
  
  const inactiveProspects = prospects.filter(p => p.status === ProspectStatus.A_RELANCER || p.status === ProspectStatus.NE_REPOND_PAS);
  
  const crossSellOpps = prospects
    .filter(p => p.status === ProspectStatus.GAGNE_CLIENT)
    .map(p => ({ prospect: p, suggestion: p.commercial === 'Marie Martin' ? 'Prévoyance Décès, Assurance Animaux' : 'Protection Juridique, GAV' }));


  const newProspectsCount = prospects.filter(p => p.status === ProspectStatus.NOUVEAU || p.status === ProspectStatus.A_RELANCER).length;
  const signedContractsCount = contracts.filter(c => c.status === ContractStatus.ACTIF).length;
  const conversionRate = prospects.length > 0 ? (contracts.filter(c => c.status === ContractStatus.ACTIF).length / prospects.filter(p => p.status === ProspectStatus.GAGNE_CLIENT || p.status === ProspectStatus.PERDU).length) * 100 : 0;
  const mrr = contracts.filter(c => c.status === ContractStatus.ACTIF).reduce((sum, c) => sum + c.monthlyPremium, 0);

  const stats: StatCardItem[] = [
    { title: 'Nouveaux Prospects', value: newProspectsCount, comparison: '30 derniers jours', icon: <UsersIcon />, iconBgColor: 'bg-status-blue', targetPath: '/prospects', filterState: { statusFilters: [ProspectStatus.NOUVEAU, ProspectStatus.A_RELANCER] } },
    { title: 'Taux de Conversion', value: `${conversionRate.toFixed(1)}%`, comparison: `Basé sur ${prospects.filter(p => p.status === ProspectStatus.GAGNE_CLIENT || p.status === ProspectStatus.PERDU).length} dossiers clos`, icon: <ChartBarIcon />, iconBgColor: 'bg-status-green', targetPath: '/reports' },
    { title: 'Contrats Signés', value: signedContractsCount, comparison: 'Total Actifs', icon: <DocumentDuplicateIcon />, iconBgColor: 'bg-status-purple', targetPath: '/contracts', filterState: { statusFilters: [ContractStatus.ACTIF] } },
    { title: 'Revenu Mensuel (MRR)', value: `${mrr.toFixed(2)}€`, comparison: 'MRR total actifs', icon: <CurrencyDollarIcon />, iconBgColor: 'bg-status-yellow', targetPath: '/contracts' },
  ];

    let mockProspectsPerformanceData = [ 
        { name: 'Marie Martin', prospects: allMockProspects.filter(p=>p.commercial === 'Marie Martin').length, signed: allMockContracts.filter(c=>c.commercial === 'Marie Martin' && c.status === ContractStatus.ACTIF).length },
        { name: 'Jean Conseiller', prospects: allMockProspects.filter(p=>p.commercial === 'Jean Conseiller').length, signed: allMockContracts.filter(c=>c.commercial === 'Jean Conseiller' && c.status === ContractStatus.ACTIF).length },
        { name: 'SNOUSSI ZOUHAIR', prospects: allMockProspects.filter(p=>p.commercial === 'SNOUSSI ZOUHAIR').length, signed: allMockContracts.filter(c=>c.commercial === 'SNOUSSI ZOUHAIR' && c.status === ContractStatus.ACTIF).length },
    ];
    if (isCommercial) {
        mockProspectsPerformanceData = [{ 
            name: commercialName, 
            prospects: prospects.length, 
            signed: contracts.filter(c => c.status === ContractStatus.ACTIF).length
        }];
    }

  const pipelineData = [
    { name: ProspectStatus.NOUVEAU, value: prospects.filter(p => p.status === ProspectStatus.NOUVEAU).length },
    { name: ProspectStatus.A_RELANCER, value: prospects.filter(p => p.status === ProspectStatus.A_RELANCER).length },
    { name: ProspectStatus.CONTACT_ETABLI, value: prospects.filter(p => p.status === ProspectStatus.CONTACT_ETABLI).length },
    { name: ProspectStatus.DEVIS_ENVOYE, value: prospects.filter(p => p.status === ProspectStatus.DEVIS_ENVOYE).length },
    { name: ProspectStatus.GAGNE_CLIENT, value: prospects.filter(p => p.status === ProspectStatus.GAGNE_CLIENT).length },
  ].filter(item => item.value > 0);

  const commercialObjectives = mockCommercialObjectives.filter(obj => 
    obj.commercialId === user.id && 
    obj.period === ObjectivePeriod.MENSUEL && 
    obj.year === currentYear &&
    obj.month === currentMonth
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-headings font-heading">
        Tableau de Bord {user.role === UserRole.ADMIN ? 'Admin' : `Commercial (${user.name})`}
      </h1>
      <p className="text-text-secondary">Vue d'ensemble de {isCommercial ? 'votre' : "l'"} activité commerciale</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
      </div>

      {isCommercial && commercialObjectives.length > 0 && (
        <Card title="Mes Objectifs (Ce Mois-ci)">
          <div className="p-4 space-y-3">
            {commercialObjectives.map(obj => (
              <div key={obj.id}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="font-medium text-text-main">{obj.targetType}</span>
                  <span className="text-text-secondary">{obj.achievedValue} / {obj.targetValue}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${(obj.achievedValue / obj.targetValue) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-text-faded mt-0.5">Reste à faire: {Math.max(0, obj.targetValue - obj.achievedValue)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {user.role === UserRole.ADMIN && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Suivi Objectifs Cabinet (Annuel 2024)">
                 <div className="p-4 space-y-3">
                    {mockCabinetObjectives.filter(o => o.year === 2024 && o.period === ObjectivePeriod.ANNUEL).map(obj => (
                        <div key={obj.id}>
                            <div className="flex justify-between text-sm mb-0.5">
                            <span className="font-medium text-text-main">{obj.targetType}</span>
                            <span className="text-text-secondary">{obj.achievedValue} / {obj.targetValue}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div 
                                className={obj.targetType === ObjectiveTargetType.CHIFFRE_AFFAIRES ? "bg-premunia-purple h-2.5 rounded-full" : "bg-primary h-2.5 rounded-full"}
                                style={{ width: `${(obj.achievedValue / obj.targetValue) * 100}%` }}
                            ></div>
                            </div>
                        </div>
                    ))}
                 </div>
            </Card>
            <Card title="Performance Objectifs Commerciaux (Juillet 2024)">
                 <div className="p-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left font-medium text-text-secondary pb-1">Commercial</th>
                                <th className="text-left font-medium text-text-secondary pb-1">Objectif CA</th>
                                <th className="text-left font-medium text-text-secondary pb-1">Objectif Contrats</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['Jean Conseiller', 'Marie Martin'].map(name => { 
                                const caObj = mockCommercialObjectives.find(o => o.commercialName === name && o.targetType === ObjectiveTargetType.CHIFFRE_AFFAIRES && o.month === 7 && o.year === 2024);
                                const contractObj = mockCommercialObjectives.find(o => o.commercialName === name && o.targetType === ObjectiveTargetType.NOUVEAUX_CONTRATS && o.month === 7 && o.year === 2024);
                                return (
                                    <tr key={name}>
                                        <td className="py-1 text-text-main">{name}</td>
                                        <td className="py-1 text-text-main">{caObj ? `${caObj.achievedValue} / ${caObj.targetValue}`: 'N/A'}</td>
                                        <td className="py-1 text-text-main">{contractObj ? `${contractObj.achievedValue} / ${contractObj.targetValue}`: 'N/A'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                 </div>
            </Card>
          </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Performance par Commercial">
          <BarChartComponent data={mockProspectsPerformanceData} xAxisKey="name" barKey="prospects" barName="Prospects" fillColor="#3B82F6" secondBarKey="signed" secondBarName="Signés" secondFillColor="#10B981"/>
        </Card>
        <Card title="Pipeline des Prospects">
          {pipelineData.length > 0 ? <PieChartComponent data={pipelineData} colors={pieChartColors} /> : <p className="p-4 text-center text-text-secondary">Aucune donnée de pipeline pour le moment.</p>}
        </Card>
      </div>

      <Card title={`Tâches Commerciales à Venir (${upcomingTasks.length})`}>
        {upcomingTasks.length > 0 ? (
            <ul className="divide-y divide-slate-100">
                {upcomingTasks.map(task => (
                    <li key={task.id} className="p-3 hover:bg-slate-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-text-main">{task.title} - <span className="text-text-secondary">{task.relatedTo}</span></p>
                                <p className="text-xs text-text-faded">Échéance: {task.dueDate} | Assigné à: {task.assignedTo}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Badge text={task.status} type={task.status === 'À faire' ? 'info' : (task.status === 'Terminée' ? 'active' : 'default')} />
                                {user.role === UserRole.ADMIN && <button title="Modifier Tâche" className="text-yellow-500 hover:text-yellow-600 p-1"><EditIcon className="w-4 h-4"/></button> }
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="p-4 text-sm text-text-secondary text-center">Aucune tâche à venir.</p>
        )}
        {user.role === UserRole.ADMIN && (
            <div className="p-3 border-t border-card-border text-right">
                <Button size="sm" variant="outline">Voir toutes les tâches</Button>
            </div>
        )}
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Prospects en attente d'action (${inactiveProspects.length})`}>
            {inactiveProspects.length > 0 ? (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Prospect</th>
                        {user.role === UserRole.ADMIN && <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Commercial</th>}
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Statut</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Dern. Interaction</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200 text-sm">
                    {inactiveProspects.map((prospect) => (
                        <tr key={prospect.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 whitespace-nowrap">
                            <div className="font-medium text-text-main">{prospect.name}</div>
                            <div className="text-xs text-text-faded">{prospect.email}</div>
                        </td>
                        {user.role === UserRole.ADMIN && <td className="px-4 py-2 whitespace-nowrap text-text-main">{prospect.commercial}</td>}
                        <td className="px-4 py-2 whitespace-nowrap">
                            <Badge text={prospect.status} type={prospect.status} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-text-main">{prospect.lastInteraction ? formatDateForDisplay(prospect.lastInteraction): '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap font-medium space-x-1">
                            <button title="Voir" className="text-primary hover:text-primary-hover p-1"><EyeIcon className="w-4 h-4"/></button>
                            {(user.role === UserRole.ADMIN || prospect.commercial === commercialName) && 
                                <button title="Modifier" className="text-yellow-500 hover:text-yellow-600 p-1"><EditIcon className="w-4 h-4"/></button>
                            }
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ) : <p className="p-4 text-center text-text-secondary">Aucun prospect en attente d'action.</p>}
        </Card>

        <Card title="Opportunités de Cross-selling">
            {crossSellOpps.length > 0 ? (
                 <ul className="divide-y divide-slate-100">
                    {crossSellOpps.map(opp => (
                        <li key={opp.prospect.id} className="p-3 hover:bg-slate-50">
                            <p className="text-sm font-medium text-text-main">{opp.prospect.name} 
                                {user.role === UserRole.ADMIN && <span className="text-xs text-text-faded"> ({opp.prospect.commercial})</span>}
                            </p>
                            <p className="text-xs text-text-secondary">Suggestion: <span className="font-medium">{opp.suggestion}</span></p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="p-4 text-sm text-text-secondary text-center">Aucune opportunité de cross-selling identifiée.</p>
            )}
            {user.role === UserRole.ADMIN && (
                <div className="p-3 border-t border-card-border text-right">
                    <Button size="sm" variant="outline">Analyser les opportunités</Button>
                </div>
            )}
        </Card>
      </div>

    </div>
  );
};

export default DashboardPage;
