
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { UserRole, User, Prospect, Contract, ContractStatus, ProspectStatus } from '../types';
import { UsersIcon, ChartBarIcon, DocumentDuplicateIcon, CurrencyDollarIcon, FilterIcon } from '../constants'; // Re-using existing icons
import { useAuth } from '../contexts/AuthContext';
import { calculateContractCommissions } from '../utils/commissionUtils';
import SemiCircleGaugeCard from '../components/charts/SemiCircleGaugeCard';
import LineChartComponent from '../components/charts/LineChartComponent';
import PieChartComponent from '../components/charts/PieChartComponent'; // For Donut Chart
import { formatDateForDisplay } from '../utils/dateUtils';


// --- INLINED DATA (from original ReportsPage, kept for consistency) ---
const initialProspectsData: Prospect[] = [
  { id: '1', name: 'Barty Laurent', dateOfBirth: '1957-06-10', postalCode: '97150', ville: 'Marigot', email: 'barty.laurent@email.fr', phone: '0601020304', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'fb_sync', relanceAttempts: 0 },
  { id: '2', name: 'Meinert', dateOfBirth: '1969-11-05', postalCode: '97310', ville: 'Saint-Laurent-du-Maroni', email: 'meinert@email.fr', phone: '0601020305', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'fb_sync', relanceAttempts: 1, lastRelanceDate: '2025-02-01' },
  { id: '3', name: 'Rivière Jean Hugues', dateOfBirth: '1952-04-20', postalCode: '97410', ville: 'Saint-Pierre', email: 'jean.hugues@email.fr', phone: '0601020306', status: ProspectStatus.DEVIS_ENVOYE, commercial: 'DAHMANI MOUNA', source: 'fb_sync', createdDate: '2025-02-01', dateDemande: '01/02/2025', canal: 'email' },
  { id: 'p-new1', name: 'Laura Craft', dateOfBirth: '1989-05-25', postalCode: '33000', ville: 'Bordeaux', email: 'laura@email.com', phone:'', status: ProspectStatus.NOUVEAU, commercial:'Jean Conseiller', source:'Web', createdDate:'2024-07-25'},
  { id: '6', name: 'Robert Durand', dateOfBirth: '1954-03-15', postalCode: '75001', ville: 'Paris', email: 'robert.durand@email.fr', phone: '06 12 34 56 78', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Site Web', createdDate: '2024-01-15', dateDemande: '15/01/2024', canal: 'email' },
  { id: '7', name: 'Françoise Martin', dateOfBirth: '1959-07-20', postalCode: '69001', ville: 'Lyon', email: 'francoise.martin@email.fr', phone: '06 98 76 54 32', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Recommandation', createdDate: '2024-01-10', dateDemande: '10/01/2024', canal: 'téléphone' },
  { id: 'client-holzer', name: 'HOLZER PATRICIA', dateOfBirth: '1966-01-10', postalCode: '67000', email: 'holzerpatou57@gmail.com', phone: '0612345678', status: ProspectStatus.GAGNE_CLIENT, commercial: 'KAMMARTI Nizar', source: 'Site Web', createdDate: '2024-03-01', ville: 'Strasbourg'},
];

const rawMockContracts: Omit<Contract, 'annualPremium' | 'monthlyCommission' | 'annualCommission' | 'commissionType' | 'firstYearCommissionRate' | 'recurrentCommissionRate' | 'firstYearAnnualNetCommission' | 'recurrentAnnualGrossCommission' | 'recurrentAnnualNetCommission'>[] = [
    { id: '1', contractNumber: '15571172', clientName: 'DELORME ELISA', clientCity: 'Châteauneuf-de-Randon', product: 'SANTÉ', insurerName: 'APRIL', monthlyPremium: 111.38, status: ContractStatus.PRECOMPTE, commercial: 'SNOUSSI ZOUHAIR', effectiveDate: '2025-02-01', subscribedDate: '2025-01-16', signatureDate: '2025-01-15', renewalDate: '2026-02-01'},
    { id: 'C001-HLZ', contractNumber: 'APRIL-HLZ-001', clientName: 'HOLZER PATRICIA', product: 'Mutuelle Santé Plus', insurerName: 'APRIL', monthlyPremium: 85.50, status: ContractStatus.ACTIF, commercial: 'KAMMARTI Nizar', effectiveDate: '2024-03-15', subscribedDate: '2024-03-01', signatureDate: '2024-03-01', renewalDate: '2025-03-15'},
    { id: 'ctr-rd-001', contractNumber: 'RD-MUT-SENIOR-001', clientName: 'Robert Durand', product: 'Mutuelle Senior Vitalité', insurerName: 'NÉOLIANE', monthlyPremium: 95.70, status: ContractStatus.ACTIF, commercial: 'Jean Conseiller', effectiveDate: '2024-02-01', subscribedDate: '2024-01-20', signatureDate: '2024-01-20', renewalDate: '2025-02-01'},
    { id: 'ctr-fm-001', contractNumber: 'FM-MUT-COMPL-002', clientName: 'Françoise Martin', product: 'Complémentaire Santé Essentiel', insurerName: 'SPVIE', monthlyPremium: 78.30, status: ContractStatus.ACTIF, commercial: 'Jean Conseiller', effectiveDate: '2024-01-15', subscribedDate: '2024-01-10', signatureDate: '2024-01-10', renewalDate: '2025-01-15'},
];

const allMockContracts: Contract[] = rawMockContracts.map(contract => {
    const calculatedCommissions = calculateContractCommissions({ insurerName: contract.insurerName, monthlyPremium: contract.monthlyPremium });
    return { ...contract, ...calculatedCommissions } as Contract; 
});
// --- END OF INLINED DATA ---

interface PerformanceReportItem {
    key: string;
    nbFiches: number;
    nbCTT: number;
    transformation: number;
    caTotal: number;
    depenses?: number; // Optional for admin view
    cpl?: number;       // Optional for admin view
    marge?: number;     // Optional for admin view
  }

const periodOptions = [
    { value: 'currentMonth', label: 'Mois en cours' },
    { value: 'lastMonth', label: 'Mois dernier' },
    { value: 'last30days', label: '30 derniers jours' },
    { value: 'currentQuarter', label: 'Trimestre en cours' },
    { value: 'currentYear', label: 'Année en cours' },
];

const ReportsPage: React.FC = () => {
  const { user } = useAuth() as { user: User };
  const [selectedPeriod, setSelectedPeriod] = useState<string>('currentMonth');

  const isCommercial = user.role === UserRole.COMMERCIAL;
  const commercialName = user.name;

  const prospects = useMemo(() => {
    return isCommercial ? initialProspectsData.filter(p => p.commercial === commercialName) : initialProspectsData;
  }, [isCommercial, commercialName]);

  const contracts = useMemo(() => {
    return isCommercial ? allMockContracts.filter(c => c.commercial === commercialName) : allMockContracts;
  }, [isCommercial, commercialName]);

  // KPI Calculations
  const nbFiches = prospects.length;
  const dépensesSimulées = isCommercial ? 1000 : 5000; // Simulated expenses
  const cpl = nbFiches > 0 ? (dépensesSimulées / nbFiches) : 0;
  const nbCTT = contracts.filter(c => c.status === ContractStatus.ACTIF || c.status === ContractStatus.PRECOMPTE).length;

  const kpiCards = [
    { title: 'Nb des fiches', value: nbFiches, maxValue: isCommercial ? 100 : 500, unit: 'fiches', color: 'text-blue-500', icon: <UsersIcon className="w-6 h-6"/> },
    { title: 'CPL', value: parseFloat(cpl.toFixed(2)), maxValue: isCommercial ? 50 : 20, unit: '€', color: 'text-yellow-500', icon: <CurrencyDollarIcon className="w-6 h-6"/> },
    { title: 'Dépenses', value: dépensesSimulées, maxValue: isCommercial ? 2000 : 10000, unit: '€', color: 'text-red-500', icon: <ChartBarIcon className="w-6 h-6"/> },
    { title: 'Nb CTT', value: nbCTT, maxValue: isCommercial ? 20 : 100, unit: 'contrats', color: 'text-green-500', icon: <DocumentDuplicateIcon className="w-6 h-6"/> },
  ];

  // Table Data: Performance par Pays (Admin) / Origine (Commercial)
  const performanceByLocationOrSource: PerformanceReportItem[] = useMemo(() => {
    if (isCommercial) { // Par Origine
      const groupedBySource = prospects.reduce((acc, p) => {
        acc[p.source] = acc[p.source] || { nbFiches: 0, nbCTT: 0, caTotal: 0 };
        acc[p.source].nbFiches++;
        const clientContracts = contracts.filter(c => (c.status === ContractStatus.ACTIF || c.status === ContractStatus.PRECOMPTE) && c.clientName === p.name && p.status === ProspectStatus.GAGNE_CLIENT); // Simplified link
        if (clientContracts.length > 0) {
          acc[p.source].nbCTT += clientContracts.length;
          acc[p.source].caTotal += clientContracts.reduce((sum, contract) => sum + (contract.annualPremium || contract.monthlyPremium * 12), 0);
        }
        return acc;
      }, {} as Record<string, { nbFiches: number; nbCTT: number; caTotal: number }>);

      return Object.entries(groupedBySource).map(([source, data]) => ({
        key: source,
        nbFiches: data.nbFiches,
        nbCTT: data.nbCTT,
        transformation: data.nbFiches > 0 ? parseFloat(((data.nbCTT / data.nbFiches) * 100).toFixed(1)) : 0,
        caTotal: parseFloat(data.caTotal.toFixed(2)),
      }));
    } else { // Par Pays (Admin - using 'ville' as proxy)
      const groupedByVille = prospects.reduce((acc, p) => {
        const ville = p.ville || 'Inconnue';
        acc[ville] = acc[ville] || { nbFiches: 0, nbCTT: 0, caTotal: 0, depenses: 0 };
        acc[ville].nbFiches++;
        const clientContracts = contracts.filter(c => (c.status === ContractStatus.ACTIF || c.status === ContractStatus.PRECOMPTE) && c.clientName === p.name && p.status === ProspectStatus.GAGNE_CLIENT);
        if (clientContracts.length > 0) {
           acc[ville].nbCTT += clientContracts.length;
           acc[ville].caTotal += clientContracts.reduce((sum, contract) => sum + (contract.annualPremium || contract.monthlyPremium * 12), 0);
        }
        acc[ville].depenses = Math.random() * 500 + 100; // Simulated expenses per city
        return acc;
      }, {} as Record<string, { nbFiches: number; nbCTT: number; caTotal: number; depenses: number }>);
      
      return Object.entries(groupedByVille).map(([ville, data]) => ({
        key: ville,
        nbFiches: data.nbFiches,
        nbCTT: data.nbCTT,
        transformation: data.nbFiches > 0 ? parseFloat(((data.nbCTT / data.nbFiches) * 100).toFixed(1)) : 0,
        caTotal: parseFloat(data.caTotal.toFixed(2)),
        depenses: parseFloat(data.depenses.toFixed(2)),
        cpl: data.nbFiches > 0 ? parseFloat((data.depenses / data.nbFiches).toFixed(2)) : 0,
        marge: parseFloat((data.caTotal - data.depenses).toFixed(2))
      }));
    }
  }, [prospects, contracts, isCommercial]);

  // Table Data: Performance par Compagnie
  const performanceByCompagnie = useMemo(() => {
    const grouped = contracts.filter(c => c.status === ContractStatus.ACTIF || c.status === ContractStatus.PRECOMPTE).reduce((acc, c) => {
      const insurer = c.insurerName || 'Inconnue';
      acc[insurer] = acc[insurer] || { nbCTT: 0, caTotal: 0 };
      acc[insurer].nbCTT++;
      acc[insurer].caTotal += (c.annualPremium || c.monthlyPremium * 12);
      return acc;
    }, {} as Record<string, { nbCTT: number; caTotal: number }>);

    return Object.entries(grouped).map(([compagnie, data]) => ({
      compagnie,
      nbCTT: data.nbCTT,
      caMoyenCTT: data.nbCTT > 0 ? parseFloat((data.caTotal / data.nbCTT).toFixed(2)) : 0,
      caTotal: parseFloat(data.caTotal.toFixed(2)),
    }));
  }, [contracts]);

  // Table Data: Performance par Attribution (Admin only)
  const performanceByAttribution = useMemo(() => {
    if (isCommercial) return [];
    const grouped = prospects.reduce((acc, p) => {
      const commercial = p.commercial || 'Non Assigné';
      acc[commercial] = acc[commercial] || { nbFiches: 0, nbCTT: 0, caTotal: 0 };
      acc[commercial].nbFiches++;
       const clientContracts = contracts.filter(c => (c.status === ContractStatus.ACTIF || c.status === ContractStatus.PRECOMPTE) && c.commercial === commercial && c.clientName === p.name && p.status === ProspectStatus.GAGNE_CLIENT);
      if (clientContracts.length > 0) {
        acc[commercial].nbCTT += clientContracts.length;
        acc[commercial].caTotal += clientContracts.reduce((sum, contract) => sum + (contract.annualPremium || contract.monthlyPremium * 12), 0);
      }
      return acc;
    }, {} as Record<string, { nbFiches: number; nbCTT: number; caTotal: number }>);

    return Object.entries(grouped).map(([commercial, data]) => {
      const chargeSimulee = data.caTotal * 0.3 + 500; // Simulated charge
      return {
        commercial,
        nbFiches: data.nbFiches,
        nbCTT: data.nbCTT,
        transformation: data.nbFiches > 0 ? parseFloat(((data.nbCTT / data.nbFiches) * 100).toFixed(1)) : 0,
        caTotal: parseFloat(data.caTotal.toFixed(2)),
        charge: parseFloat(chargeSimulee.toFixed(2)),
        marge: parseFloat((data.caTotal - chargeSimulee).toFixed(2))
      };
    });
  }, [prospects, contracts, isCommercial]);

  // Chart Data for Commercial
  const commercialCTTEvolutionData = [
    { month: 'Jan', count: isCommercial ? 2 : 10 }, { month: 'Fev', count: isCommercial ? 3 : 12 },
    { month: 'Mar', count: isCommercial ? 3 : 15 }, { month: 'Avr', count: isCommercial ? 5 : 18 },
    { month: 'Mai', count: isCommercial ? 6 : 22 }, { month: 'Juin', count: isCommercial ? (nbCTT > 6 ? nbCTT : 6) : 25 }, // Ensure current month has current data
  ];

  const commercialProspectsBySourceData = useMemo(() => {
    if (!isCommercial) return [];
    const grouped = prospects.reduce((acc, p) => {
      acc[p.source] = (acc[p.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [prospects, isCommercial]);

  const tableHeaderClasses = "px-4 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-headings font-heading">
          {isCommercial ? `Mes Indicateurs Clés (${commercialName})` : "Indicateurs de Performance (KPIs)"}
        </h1>
        <p className="text-sm text-text-secondary">Analyse des performances et tendances clés.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <Select
          options={periodOptions}
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="min-w-[200px]"
        />
        <Button variant="outline" size="md">
          Télécharger le Rapport
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(kpi => (
          <SemiCircleGaugeCard 
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            maxValue={kpi.maxValue}
            unit={kpi.unit}
            color={kpi.color}
            icon={kpi.icon}
          />
        ))}
      </div>
      
      {/* Table 1: Performance par Pays (Admin) / Origine (Commercial) */}
      <Card title={isCommercial ? "Performance par Origine" : "Performance par Pays (Villes)"}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className={tableHeaderClasses}>{isCommercial ? "Origine" : "Pays (Ville)"}</th>
                <th className={tableHeaderClasses}>Nb Fiches</th>
                <th className={tableHeaderClasses}>Nb CTT</th>
                <th className={tableHeaderClasses}>Transf. (%)</th>
                <th className={tableHeaderClasses}>CA Prév. (€)</th>
                {!isCommercial && <>
                  <th className={tableHeaderClasses}>Dépenses (€)</th>
                  <th className={tableHeaderClasses}>CPL (€)</th>
                  <th className={tableHeaderClasses}>Marge (€)</th>
                </>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm">
              {performanceByLocationOrSource.map(item => (
                <tr key={item.key}>
                  <td className="px-4 py-2 whitespace-nowrap text-text-main font-medium">{item.key}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.nbFiches}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.nbCTT}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.transformation}%</td>
                  <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.caTotal.toLocaleString('fr-FR')}€</td>
                  {!isCommercial && (
                    <>
                      <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.depenses?.toLocaleString('fr-FR')}€</td>
                      <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.cpl?.toLocaleString('fr-FR')}€</td>
                      <td className="px-4 py-2 whitespace-nowrap text-text-main font-semibold">{item.marge?.toLocaleString('fr-FR')}€</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Table 2: Performance par Compagnie */}
      <Card title="Performance par Compagnie">
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className={tableHeaderClasses}>Compagnie</th>
                <th className={tableHeaderClasses}>Nb CTT Actifs</th>
                <th className={tableHeaderClasses}>CA Moyen / CTT (€)</th>
                <th className={tableHeaderClasses}>CA Total (€)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm">
              {performanceByCompagnie.map(item => (
                <tr key={item.compagnie}>
                  <td className="px-4 py-2 whitespace-nowrap text-text-main font-medium">{item.compagnie}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.nbCTT}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.caMoyenCTT.toLocaleString('fr-FR')}€</td>
                  <td className="px-4 py-2 whitespace-nowrap text-text-main font-semibold">{item.caTotal.toLocaleString('fr-FR')}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Table 3: Performance par Attribution (Admin only) */}
      {!isCommercial && (
        <Card title="Performance par Attribution (Commercial)">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className={tableHeaderClasses}>Commercial</th>
                  <th className={tableHeaderClasses}>Nb Fiches</th>
                  <th className={tableHeaderClasses}>Nb CTT</th>
                  <th className={tableHeaderClasses}>Transf. (%)</th>
                  <th className={tableHeaderClasses}>CA Prév. (€)</th>
                  <th className={tableHeaderClasses}>Charge Est. (€)</th>
                  <th className={tableHeaderClasses}>Marge Est. (€)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {performanceByAttribution.map(item => (
                  <tr key={item.commercial}>
                    <td className="px-4 py-2 whitespace-nowrap text-text-main font-medium">{item.commercial}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.nbFiches}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.nbCTT}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.transformation}%</td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.caTotal.toLocaleString('fr-FR')}€</td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-main">{item.charge.toLocaleString('fr-FR')}€</td>
                    <td className="px-4 py-2 whitespace-nowrap text-text-main font-semibold">{item.marge.toLocaleString('fr-FR')}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Charts for Commercial */}
      {isCommercial && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Évolution du Nombre de Contrats (Nb CTT)">
            <LineChartComponent 
              data={commercialCTTEvolutionData} 
              xAxisKey="month" 
              lineKey="count" 
              lineName="Nb Contrats"
              strokeColor="#10b981" // status-green
            />
          </Card>
          <Card title="Répartition des Prospects par Origine">
            {commercialProspectsBySourceData.length > 0 ? (
                 <PieChartComponent 
                    data={commercialProspectsBySourceData} 
                    colors={['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444']} // Example colors
                />
            ) : <p className="p-4 text-center text-text-secondary">Aucune donnée d'origine pour vos prospects.</p>}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
