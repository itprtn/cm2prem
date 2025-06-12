
import React, { useState, useMemo } from 'react';
import { AutomationSequence as AutomationSequenceType, AutomationStep, Prospect, ProspectStatus, StatCardItem, UserRole, User } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { PlusIcon, EditIcon, DeleteIcon, EyeIcon, CheckCircleIcon, InformationCircleIcon, DocumentDuplicateIcon, SearchIcon, FilterIcon } from '../constants';
import { PREMUNIA_EMAIL_TEMPLATES, generateDevisLink, formatDateForEmail } from '../emailTemplates'; 
import { formatDateForDisplay, addDaysToDate } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';


const mockAllProspectsForAutomation: Prospect[] = [
  { id: 'auto_prospect_1', name: 'Alice Wonderland', dateOfBirth: '1990-05-15', postalCode: '75001', email: 'alice@email.com', phone: '0611223344', status: ProspectStatus.A_RELANCER, commercial: 'Jean Conseiller', source: 'Web', createdDate: '2024-07-20', dateDemande: '20/07/2024', canal: 'email', relanceAttempts: 0 },
  { id: 'auto_prospect_2', name: 'Bob The Builder', dateOfBirth: '1985-10-20', postalCode: '69002', email: 'bob@email.com', phone: '0622334455', status: ProspectStatus.A_RELANCER, commercial: 'Jean Conseiller', source: 'Web', createdDate: '2024-07-18', dateDemande: '18/07/2024', canal: 'email', relanceAttempts: 1, lastRelanceDate: '18/07/2024' },
  { id: 'auto_prospect_3', name: 'Charlie Brown', dateOfBirth: '2000-02-10', postalCode: '13001', email: 'charlie@email.com', phone: '0633445566', status: ProspectStatus.A_RELANCER, commercial: 'SNOUSSI ZOUHAIR', source: 'Web', createdDate: '2024-07-10', dateDemande: '10/07/2024', canal: 'email', relanceAttempts: 2, lastRelanceDate: '15/07/2024' },
  { id: 'auto_prospect_4', name: 'Diana Prince', dateOfBirth: '1988-03-08', postalCode: '75010', email: 'diana@email.com', phone: '0644556677', status: ProspectStatus.NOUVEAU, commercial: 'Jean Conseiller', source: 'Web', createdDate: '2024-07-22', dateDemande: '22/07/2024', canal: 'email' },
  { id: 'auto_prospect_5', name: 'Edward Scissorhands', dateOfBirth: '1995-12-01', postalCode: '92100', email: 'edward@email.com', phone: '0655667788', status: ProspectStatus.CONTACT_ETABLI, commercial: 'SNOUSSI ZOUHAIR', source: 'Téléphone', createdDate: '2024-07-23', dateDemande: '23/07/2024', canal: 'téléphone' },
  { id: '6', name: 'Robert Durand', dateOfBirth: '1954-03-15', postalCode: '75001', ville: 'Paris', email: 'robert.durand@email.fr', phone: '06 12 34 56 78', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Site Web', createdDate: '2024-01-15', dateDemande: '15/01/2024', canal: 'email' },
  { id: '7', name: 'Françoise Martin', dateOfBirth: '1959-07-20', postalCode: '69001', ville: 'Lyon', email: 'francoise.martin@email.fr', phone: '06 98 76 54 32', status: ProspectStatus.GAGNE_CLIENT, commercial: 'Jean Conseiller', source: 'Recommandation', createdDate: '2024-01-10', dateDemande: '10/01/2024', canal: 'téléphone' },
];


const premuniaAutomationSequences: AutomationSequenceType[] = [
  {
    id: 'seq_premunia_relance',
    name: 'Séquence Relance Premunia Leads',
    trigger: "Prospect Statut = 'À Relancer' AND Canal = 'email'", 
    status: 'Active',
    steps: [
      { id: 'prem_step1', order: 1, type: 'Envoyer Email', details: 'Email J+0', delay: 'J+0', emailTemplateId: 'relance_j0' },
      { id: 'prem_step2', order: 2, type: 'Envoyer Email', details: 'Email J+5', delay: 'J+5', emailTemplateId: 'relance_j5' },
      { id: 'prem_step3', order: 3, type: 'Envoyer Email', details: 'Email J+12', delay: 'J+12', emailTemplateId: 'relance_j12' },
      { id: 'prem_step4', order: 4, type: 'Changer Statut Prospect', details: "Passer à 'Inexploitable'", delay: 'J+14' } 
    ],
  },
];

const prospectStatusOptionsForAutomation = [
  { value: 'all', label: 'Tous les statuts' },
  ...Object.values(ProspectStatus).map(s => ({ value: s, label: s }))
];


const AutomationStepDisplay: React.FC<{ step: AutomationStep, prospect?: Prospect }> = ({ step, prospect }) => {
  const emailTemplate = step.emailTemplateId ? PREMUNIA_EMAIL_TEMPLATES.find(t => t.id === step.emailTemplateId) : null;
  let subject = emailTemplate?.subject;
  let body = emailTemplate?.body;

  if (emailTemplate && prospect) {
    const devisLink = generateDevisLink(prospect.id, step.order);
    const dateDemandeFormatted = formatDateForEmail(prospect.dateDemande);
    const prospectFirstName = prospect.name.split(' ')[0] || prospect.name;
    subject = subject?.replace(/%PRÉNOM%/g, prospectFirstName)
                     .replace(/%DATE_DEMANDE%/g, dateDemandeFormatted);
    body = body?.replace(/%PRÉNOM%/g, prospectFirstName)
                 .replace(/%DATE_DEMANDE%/g, dateDemandeFormatted)
                 .replace(/%LIEN_DEVIS%/g, devisLink);
  }

  return (
    <div className="py-2 border-b border-slate-100 last:border-b-0">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-medium">
          {step.delay || `É${step.order}`}
        </div>
        <div>
          <p className="text-sm font-medium text-text-main">{step.details} ({step.type})</p>
          {emailTemplate && (
            <details className="text-xs text-text-secondary mt-1">
              <summary className="cursor-pointer hover:underline">Voir template</summary>
              <div className="mt-1 p-2 bg-slate-50 rounded">
                <p className="font-semibold">Sujet: {subject || emailTemplate.subject}</p>
                <pre className="whitespace-pre-wrap mt-1">{body || emailTemplate.body}</pre>
              </div>
            </details>
          )}
           {step.type === 'Changer Statut Prospect' && !emailTemplate && (
             <p className="text-xs text-text-faded mt-0.5">{step.details}</p>
           )}
        </div>
      </div>
    </div>
  );
};

const SequenceCard: React.FC<{ 
    sequence: AutomationSequenceType, 
    prospects: Prospect[], 
    onSimulateProcessing: (prospectId: string, sequenceId: string, nextStepOrder: number) => void,
    canManageSequences: boolean
}> = ({ sequence, prospects, onSimulateProcessing, canManageSequences }) => {
  
  const getEligibleProspectsForStep = (stepOrder: number): Prospect[] => {
    return prospects.filter(p => { 
      if (p.status !== ProspectStatus.A_RELANCER || p.canal !== 'email') return false;
      
      const currentAttempt = p.relanceAttempts || 0;
      if (stepOrder !== currentAttempt + 1) return false;

      const delayStr = sequence.steps.find(s => s.order === stepOrder)?.delay;
      if (!delayStr || !p.dateDemande) return false; 

      const delayDays = parseInt(delayStr.replace('J+', ''), 10);
      let baseDateForDelay = p.dateDemande; 

      if (currentAttempt > 0 && p.lastRelanceDate) {
          baseDateForDelay = p.lastRelanceDate;
      }
      
      const targetSendDate = addDaysToDate(baseDateForDelay, delayDays); 
      const today = new Date();
      today.setHours(0,0,0,0); 
      targetSendDate.setHours(0,0,0,0);

      return today >= targetSendDate;
    });
  };


  return (
  <Card>
    <div className="p-4 border-b border-card-border">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-text-main">{sequence.name}</h3>
          <p className="text-xs text-text-faded">Déclencheur: {sequence.trigger}</p>
        </div>
        <div className="flex items-center space-x-2">
            <Badge text={sequence.status} type={sequence.status === 'Active' ? 'active' : 'inactive'} />
            {canManageSequences && (
                <>
                    <button title="Modifier" className="text-yellow-500 hover:text-yellow-600"><EditIcon className="w-4 h-4"/></button>
                    <button title="Supprimer" className="text-red-500 hover:text-red-600"><DeleteIcon className="w-4 h-4"/></button>
                </>
            )}
        </div>
      </div>
       <Badge text={`Étapes (${sequence.steps.length})`} type="default" />
    </div>
    <div className="p-4 space-y-1 max-h-60 overflow-y-auto mb-2">
      {sequence.steps.map(step => <AutomationStepDisplay key={step.id} step={step} />)}
    </div>
    
    <div className="p-4 border-t border-card-border">
        <h4 className="text-sm font-medium text-text-main mb-2">Simulation & Éligibilité des Prospects</h4>
        {sequence.steps.filter(s => s.type === 'Envoyer Email' || s.type === 'Changer Statut Prospect').map(step => {
            const eligible = getEligibleProspectsForStep(step.order);
            if(eligible.length === 0 && !(step.type === 'Changer Statut Prospect' && step.order > PREMUNIA_EMAIL_TEMPLATES.length)) {
                 if (canManageSequences) { 
                 } else { 
                    return null;
                 }
            }

            return (
                <div key={`eligible-${step.id}`} className="mb-3 p-2 border border-slate-200 rounded">
                    <p className="text-xs font-semibold text-text-secondary">Étape {step.order}: {step.details} ({eligible.length} éligible{eligible.length === 1 ? '':'s'})</p>
                    {eligible.length > 0 && (
                        <ul className="text-xs list-disc pl-5 mt-1">
                            {eligible.slice(0,3).map(p => ( 
                                <li key={p.id} className="flex justify-between items-center">
                                    <span>{p.name} (Tentatives: {p.relanceAttempts || 0}, Dern. Relance: {formatDateForDisplay(p.lastRelanceDate) || 'N/A'})</span>
                                    {canManageSequences && 
                                      <Button size="sm" variant="outline" onClick={() => onSimulateProcessing(p.id, sequence.id, step.order)}>
                                          Simuler Étape
                                      </Button>
                                    }
                                </li>
                            ))}
                            {eligible.length > 3 && <li>Et {eligible.length - 3} autre(s)...</li>}
                        </ul>
                    )}
                    {eligible.length === 0 && (
                        <p className="text-xs text-text-faded italic">Aucun prospect actuellement à cette étape.</p>
                    )}
                </div>
            );
        })}
    </div>
  </Card>
  );
};

const AutomationStatCard: React.FC<StatCardItem> = ({ title, value, icon, iconBgColor }) => (
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


const AutomationPage: React.FC = () => {
    const { user } = useAuth() as { user: User };
    const [prospectsData, setProspectsData] = useState<Prospect[]>(mockAllProspectsForAutomation); 
    
    const [adminProspectFilterStatus, setAdminProspectFilterStatus] = useState<ProspectStatus | 'all'>('all');
    const [selectedProspectsForAdmin, setSelectedProspectsForAdmin] = useState<string[]>([]);
    const [selectedSequenceForAdmin, setSelectedSequenceForAdmin] = useState<string>(premuniaAutomationSequences[0]?.id || '');


    const prospectsForSequenceCards = useMemo(() => {
        if (user.role === UserRole.COMMERCIAL) {
            return prospectsData.filter(p => p.commercial === user.name);
        }
        return prospectsData; 
    }, [prospectsData, user.role, user.name]);


    const canManageSequencesGlobal = user.role === UserRole.ADMIN;

    const handleSimulateProcessing = (prospectId: string, sequenceId: string, stepOrder: number) => {
        setProspectsData(prevProspects => 
            prevProspects.map(p => {
                if (p.id === prospectId) {
                    const sequence = premuniaAutomationSequences.find(s => s.id === sequenceId);
                    const step = sequence?.steps.find(s => s.order === stepOrder);
                    if (!step) return p;

                    let updatedProspect = { ...p };
                    const todayStr = new Date().toISOString().split('T')[0]; 

                    if (step.type === 'Envoyer Email') {
                        updatedProspect.relanceAttempts = (p.relanceAttempts || 0) + 1;
                        updatedProspect.lastRelanceDate = todayStr; 
                        console.log(`SIMULATION: Email "${step.details}" envoyé à ${p.name}. Tentative ${updatedProspect.relanceAttempts}. Date: ${formatDateForDisplay(todayStr)}`);
                    } else if (step.type === 'Changer Statut Prospect') {
                        if (step.details.includes("Inexploitable")) { 
                            updatedProspect.status = ProspectStatus.INEXPLOITABLE;
                            console.log(`SIMULATION: Statut de ${p.name} changé à Inexploitable.`);
                        }
                    }
                    return updatedProspect;
                }
                return p;
            })
        );
    };
    
    const handleAdminAddProspectsToSequence = () => {
        if (!selectedSequenceForAdmin || selectedProspectsForAdmin.length === 0) {
            alert("Veuillez sélectionner des prospects et une séquence.");
            return;
        }
        const sequenceName = premuniaAutomationSequences.find(s => s.id === selectedSequenceForAdmin)?.name || 'Inconnue';
        console.log(`ADMIN ACTION: Ajout de ${selectedProspectsForAdmin.length} prospects à la séquence "${sequenceName}". IDs: ${selectedProspectsForAdmin.join(', ')}`);
        
        setProspectsData(prev => prev.map(p => {
            if (selectedProspectsForAdmin.includes(p.id)) {
                return {
                    ...p,
                    status: ProspectStatus.A_RELANCER,
                    relanceAttempts: 0,
                    lastRelanceDate: undefined, 
                    dateDemande: p.dateDemande || formatDateForDisplay(new Date().toISOString().split('T')[0]) 
                };
            }
            return p;
        }));
        setSelectedProspectsForAdmin([]); 
        alert(`Prospects ajoutés (simulé) à la séquence "${sequenceName}". Vérifiez la console et la liste des prospects en séquence.`);
    };

    const handleProspectCheckboxChange = (prospectId: string) => {
        setSelectedProspectsForAdmin(prev => 
            prev.includes(prospectId) ? prev.filter(id => id !== prospectId) : [...prev, prospectId]
        );
    };
    
    const adminFilteredProspects = useMemo(() => {
        return prospectsData.filter(p => adminProspectFilterStatus === 'all' || p.status === adminProspectFilterStatus);
    }, [prospectsData, adminProspectFilterStatus]);


    const activeSequencesCount = premuniaAutomationSequences.filter(s => s.status === 'Active').length;
    const prospectsInAutomation = prospectsForSequenceCards.filter(p => p.status === ProspectStatus.A_RELANCER && p.canal === 'email').length;
    
    const stats: StatCardItem[] = [
        { title: 'Séquences Actives', value: activeSequencesCount, icon: <CheckCircleIcon />, iconBgColor: 'bg-green-500' },
        { title: 'Emails / Mois (Est.)', value: "~100", icon: <DocumentDuplicateIcon />, iconBgColor: 'bg-blue-500' }, 
        { title: 'Prospects en Séquence', value: prospectsInAutomation, icon: <InformationCircleIcon />, iconBgColor: 'bg-purple-500' }, 
      ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-semibold text-text-main">
                {user.role === UserRole.ADMIN ? 'Gestion des Automatisations' : `Suivi Automatisation (${user.name})`}
            </h1>
            <p className="text-sm text-text-secondary">
                {user.role === UserRole.ADMIN ? 'Gérer vos séquences et ajouter manuellement des prospects.' : 'Suivez le parcours de vos prospects dans les séquences.'}
            </p>
        </div>
        {canManageSequencesGlobal && (
            <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5"/>}>
                Nouvelle Séquence
            </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map(stat => <AutomationStatCard key={stat.title} {...stat} />)}
      </div>

      {canManageSequencesGlobal && (
          <Card title="Ajouter Manuellement des Prospects à une Séquence">
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Filtrer prospects par statut:"
                        options={prospectStatusOptionsForAutomation}
                        value={adminProspectFilterStatus}
                        onChange={(e) => setAdminProspectFilterStatus(e.target.value as ProspectStatus | 'all')}
                    />
                    <Select
                        label="Sélectionner la séquence cible:"
                        options={premuniaAutomationSequences.map(s => ({ value: s.id, label: s.name }))}
                        value={selectedSequenceForAdmin}
                        onChange={(e) => setSelectedSequenceForAdmin(e.target.value)}
                    />
                </div>
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded p-2">
                    <h4 className="text-sm font-medium text-text-main mb-2">Prospects filtrés ({adminFilteredProspects.length}):</h4>
                    {adminFilteredProspects.length > 0 ? adminFilteredProspects.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 text-sm">
                           <div>
                             <input 
                                type="checkbox" 
                                id={`prospect-check-${p.id}`} 
                                checked={selectedProspectsForAdmin.includes(p.id)}
                                onChange={() => handleProspectCheckboxChange(p.id)}
                                className="mr-2"
                             />
                             <label htmlFor={`prospect-check-${p.id}`}>{p.name} ({p.status}) - {p.commercial}</label>
                           </div>
                           <Badge text={p.status} type={p.status} />
                        </div>
                    )) : <p className="text-xs text-text-faded">Aucun prospect pour ce filtre.</p>}
                </div>
                <Button 
                    onClick={handleAdminAddProspectsToSequence} 
                    disabled={selectedProspectsForAdmin.length === 0 || !selectedSequenceForAdmin}
                >
                    Ajouter {selectedProspectsForAdmin.length} Prospect(s) à la Séquence
                </Button>
                 <p className="text-xs text-text-faded mt-2">
                    Idées pour "Nouvelle Séquence": Déclencheurs (Tag ajouté, Date anniversaire contrat, Champ modifié, Score prospect), Actions (Ajouter Tag, MàJ champ, Notifier commercial, Webhook).
                </p>
            </div>
          </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {premuniaAutomationSequences.map(seq => (
            <SequenceCard 
                key={seq.id} 
                sequence={seq} 
                prospects={prospectsForSequenceCards} 
                onSimulateProcessing={handleSimulateProcessing}
                canManageSequences={canManageSequencesGlobal}
            />
        ))}
      </div>
    </div>
  );
};

export default AutomationPage;
